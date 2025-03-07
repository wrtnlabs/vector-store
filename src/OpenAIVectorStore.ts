import OpenAI from "openai";
import { tags } from "typia";
import { IProvider } from "./types/IProvider";
import { IStore } from "./types/IStore";
import { FileCounts, IVectorStore } from "./types/IVectorStore";
import { IVectorStoreFile } from "./types/IVectorStoreFile";

export class AgenticaOpenAIVectorStoreSelector extends IVectorStore {
  private vectorStore: OpenAI.Beta.VectorStores.VectorStore | null = null;
  private assistant: OpenAI.Beta.Assistants.Assistant | null = null;
  private ready: boolean = false;

  constructor(private readonly props: { provider: IProvider; store?: IStore }) {
    super(props.store);
  }

  status() {
    return {
      vectorStore: this.vectorStore,
      assistant: this.assistant,
    };
  }

  async query(props: IVectorStore.IQuery): Promise<{ response: string | null }> {
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

  async attach(props: IVectorStore.IAttach): Promise<FileCounts> {
    if (this.ready === false) {
      await this.create();
    }

    if (this.vectorStore === null) {
      throw new Error("call `create` function before calling this function.");
    }

    const vectorStoreId = this.vectorStore.id;
    const files = await Promise.all(
      props.files.map(async (el) => {
        const buffer = typeof el.data === "string" ? await this.getFile(el.data) : el.data;
        return new File([buffer], el.name, { type: "text/plain" });
      })
    );

    const openai = this.props.provider.api;
    const response = await openai.beta.vectorStores.fileBatches.uploadAndPoll(vectorStoreId, { files });

    return response.file_counts;
  }

  async detach(): Promise<FileCounts> {
    if (this.ready === false) {
      await this.create();
    }

    if (this.vectorStore === null) {
      throw new Error("call `create` function before calling this function.");
    }

    throw new Error("Method not implemented.");
  }

  async list(): Promise<IVectorStoreFile[]> {
    if (this.ready === false) {
      await this.create();
    }

    if (this.vectorStore === null) {
      throw new Error("call `create` function before calling this function.");
    }

    throw new Error("Method not implemented.");
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
      return openai.beta.assistants.create(assistant);
    }
  }
}
