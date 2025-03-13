import crypto from "crypto";
import OpenAI from "openai";
import { Uploadable } from "openai/uploads";
import typia, { tags } from "typia";
import { IFile, IVectorStoreFile } from "./types";
import { IProvider } from "./types/IProvider";
import { IStore } from "./types/IStore";
import { FileCounts, IVectorStore } from "./types/IVectorStore";

export class AgenticaOpenAIVectorStoreSelector extends IVectorStore {
  private vectorStore: OpenAI.Beta.VectorStores.VectorStore | null = null;
  private assistant: OpenAI.Beta.Assistants.Assistant | null = null;
  private ready: boolean = false;

  constructor(private readonly props: { provider: IProvider; store?: IStore }) {
    super(props.store);
  }

  /**
   * Returns the status of the current {@link AgenticaOpenAIVectorStoreSelector Selector}.
   *
   * Tells which vector store and which assistance exists inside the selector.
   * The information you provide is light metadata such as ID and name, number of files, and model name.
   *
   * @returns
   */
  async status() {
    if (this.ready === false) {
      await this.create();
    }

    return {
      vectorStore: {
        id: this.vectorStore?.id,
        name: this.vectorStore?.name,
        fileCounts: this.vectorStore?.file_counts,
      },
      assistant: {
        id: this.assistant?.id,
        name: this.assistant?.name,
        model: this.assistant?.model,
        tools: this.assistant?.tools,
      },
    };
  }

  /**
   * @inheritdoc
   */
  async query(props: IVectorStore.IQueryInput): Promise<IVectorStore.IQueryOutput> {
    if (this.ready === false) {
      await this.create();
    }

    if (this.assistant === null) {
      throw new Error("call `create` function before calling this function.");
    }

    const openai = this.props.provider.api;
    const thread = await openai.beta.threads.create({
      messages: [
        {
          role: "user",
          content: props.query,
        },
      ],
    });

    const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: this.assistant.id,
    });

    const messages = await openai.beta.threads.messages.list(thread.id, {
      run_id: run.id,
    });

    const response = messages.data[0].content[0].type === "text" ? messages.data[0].content[0].text.value : null;
    return { response };
  }

  /**
   * @inheritdoc
   */
  async attach(props: IVectorStore.IAttachInput): Promise<FileCounts> {
    if (this.ready === false) {
      await this.create();
    }

    if (this.vectorStore === null) {
      throw new Error("call `create` function before calling this function.");
    }

    const vectorStoreId = this.vectorStore.id;
    const openai = this.props.provider.api;
    const totalFiles = await this.files();
    const files = (
      await Promise.all(
        props.files.map(async (file) => {
          if (typia.is<IFile.URLFormat>(file)) {
            const buffer = typeof file.data === "string" ? await this.getFile(file.data) : file.data;
            const checksum = this.getChecksum(buffer);
            return new File([buffer], `${checksum}-${file.name}`, { type: "text/plain" });
          } else {
            if ("fileId" in file) {
              return totalFiles.find((el) => el.id === file.fileId)?.id ?? null;
            } else if ("hash" in file) {
              return totalFiles.find((el) => el.hash === file.hash)?.id ?? null;
            } else {
              return totalFiles.find((el) => el.originalName === file.originalName)?.id ?? null;
            }
          }
        })
      )
    )
      .filter((file) => file !== null)
      .reduce<{ files: Uploadable[]; fileIds: string[] }>(
        (acc, cur) => {
          if (typeof cur === "string") {
            acc.fileIds.push(cur);
          } else {
            acc.files.push(cur);
          }
          return acc;
        },
        { files: [], fileIds: [] }
      );

    const response = await openai.beta.vectorStores.fileBatches.uploadAndPoll(vectorStoreId, files);
    return response.file_counts;
  }

  /**
   * @inheritdoc
   */
  async detach(props: IVectorStore.IDetachInput): Promise<FileCounts> {
    if (this.ready === false) {
      await this.create();
    }

    if (this.vectorStore === null) {
      throw new Error("call `create` function before calling this function.");
    }

    const openai = this.props.provider.api;
    const vectorStoreId = this.vectorStore.id;

    const files = await this.list();
    const file = files.find((el) => {
      if ("fileId" in props) {
        return el.id === props.fileId;
      } else if ("hash" in props) {
        return el.hash === props.hash;
      } else {
        return el.originalName === props.filename;
      }
    });

    if (file) {
      await openai.beta.vectorStores.files.del(vectorStoreId, file.id);
    }

    throw new Error("Method not implemented.");
  }

  /**
   * @inheritdoc
   */
  async list(): Promise<IVectorStoreFile[]> {
    if (this.ready === false) {
      await this.create();
    }

    if (this.vectorStore === null) {
      throw new Error("call `create` function before calling this function.");
    }

    const openai = this.props.provider.api;
    const vectorStoreId = this.vectorStore.id;
    const totalFiles: OpenAI.Beta.VectorStores.Files.VectorStoreFile[] = [];
    let after: string | null = null;
    do {
      const options: { after?: string } = {};
      if (after !== null) {
        options.after = after;
      }

      const response = await openai.beta.vectorStores.files.list(vectorStoreId, options);
      after = response.nextPageParams()?.after ?? null;
      totalFiles.push(...response.data);
    } while (after !== null);

    return Promise.all(
      totalFiles.map(async (file): Promise<IVectorStoreFile> => {
        const detailed = await openai.files.retrieve(file.id);

        const [hash] = detailed.filename.match(new RegExp(".*(?=-)")) ?? [];
        const SHA_256_LENGTH = 64 as const;

        return {
          hash: hash?.length === SHA_256_LENGTH ? hash : null,
          id: file.id,
          name: detailed.filename,
          originalName: detailed.filename.replace(`${hash}-`, ""),
          size: detailed.bytes,
          vectorStoreId: this.vectorStore?.id!,
          createdAt: new Date(parseInt(file.created_at + "000")).toISOString(),
        };
      })
    );
  }

  /**
   * Look up all files accessible to the Key, regardless of the Vector Store.
   */
  private async files() {
    const openai = this.props.provider.api;
    const totalFiles: OpenAI.Files.FileObject[] = [];
    let after: string | null = null;
    do {
      const options: { after?: string } = {};
      if (after !== null) {
        options.after = after;
      }

      const response = await openai.files.list(options);
      after = response.nextPageParams()?.after ?? null;
      totalFiles.push(...response.data);
    } while (after !== null);

    return totalFiles.map((file) => {
      const [hash] = file.filename.match(new RegExp(".*(?=-)")) ?? [];
      const SHA_256_LENGTH = 64 as const;

      return {
        hash: hash?.length === SHA_256_LENGTH ? hash : null,
        id: file.id,
        name: file.filename,
        originalName: file.filename.replace(`${hash}-`, ""),
        size: file.bytes,
        vectorStoreId: this.vectorStore?.id!,
        createdAt: new Date(parseInt(file.created_at + "000")).toISOString(),
      };
    });
  }

  private async getFile(fileUrl: string & tags.Format<"iri">): Promise<ArrayBuffer> {
    const response = await fetch(fileUrl);
    return await response.arrayBuffer();
  }

  /**
   * Initialize function for creating VectorStore and Assistant.
   *
   * This function uses SDKs to find what has already been created
   * if the value received as a factor is an ID, and to prioritize
   * generation if the value received as a factor is information to
   * generate.
   *
   * @param provider Openai Provider configuration
   * @returns vectorStore and Assistant
   */
  private async create(): Promise<void> {
    this.vectorStore ??= await this.emplaceVectorStore();
    this.assistant ??= await this.emplaceAssistant();

    const openai = this.props.provider.api;
    if (this.ready === false) {
      await openai.beta.assistants.update(this.assistant.id, {
        tool_resources: { file_search: { vector_store_ids: [this.vectorStore.id] } },
      });
      this.ready = true;
    }
  }

  private async emplaceVectorStore(): Promise<OpenAI.Beta.VectorStores.VectorStore> {
    const openai = this.props.provider.api;
    const vectorStore = this.props.provider.vectorStore;

    if ("name" in vectorStore) {
      return await openai.beta.vectorStores.create({
        name: vectorStore.name,
        chunking_strategy: vectorStore.chunking_strategy ?? {
          type: "static",
          static: { max_chunk_size_tokens: 800, chunk_overlap_tokens: 400 },
        },
      });
    } else {
      return await openai.beta.vectorStores.retrieve(vectorStore.id);
    }
  }

  private async emplaceAssistant(): Promise<OpenAI.Beta.Assistants.Assistant> {
    const openai = this.props.provider.api;
    const assistant = this.props.provider.assistant;

    if ("id" in assistant) {
      return openai.beta.assistants.retrieve(assistant.id);
    } else {
      return openai.beta.assistants.create({ ...assistant, tools: [{ type: "file_search" }] });
    }
  }

  private async getChecksum(file: (string & tags.Format<"iri">) | ArrayBuffer): Promise<string> {
    let buffer = file;
    if (typeof buffer === "string") {
      const response = await fetch(buffer);
      buffer = await response.arrayBuffer();
    }
    const hash = crypto.createHash("sha256").update(Buffer.from(buffer)).digest("hex"); // 해싱
    return hash;
  }
}
