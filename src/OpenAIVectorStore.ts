import OpenAI from "openai";
import { tags } from "typia";
import { IFile } from "./types/IFile";
import { IProvider } from "./types/IProvider";
import { IStore } from "./types/IStore";
import { FileCounts, IAssistant, IVectorStore } from "./types/IVectorStore";
import { IVectorStoreFile } from "./types/IVectorStoreFile";

export class AgenticaOpenAIVectorStoreSelector extends IVectorStore {
  private vectorStore: OpenAI.Beta.VectorStores.VectorStore | null = null;
  private assistant: OpenAI.Beta.Assistants.Assistant | null = null;

  constructor(private readonly props: { provider: IProvider; store: IStore }) {
    super(props.store);
  }

  async attach(file: IFile): Promise<FileCounts> {
    if (this.vectorStore === null) {
      throw new Error("call `create` function before calling this function.");
    }

    const buffer = typeof file === "string" ? await this.getFile(file) : file;

    throw new Error("Method not implemented.");
  }

  async detach(): Promise<FileCounts> {
    if (this.vectorStore === null) {
      throw new Error("call `create` function before calling this function.");
    }

    throw new Error("Method not implemented.");
  }

  async list(): Promise<IVectorStoreFile[]> {
    if (this.vectorStore === null) {
      throw new Error("call `create` function before calling this function.");
    }

    throw new Error("Method not implemented.");
  }

  /**
   * Create or find vector store and Assistant in OpenAI, by using SDK internally.
   *
   * @param props Openai SDK configuration and create DTO
   * @returns vectorStore and Assistant
   */
  async create(props: IVectorStore.ICreate): Promise<{ vectorStore: IVectorStore.IAt; assistant: IAssistant.IAt }> {
    if (props.type === "openai") {
      await this.init(props.provider);
    }

    if (this.vectorStore && this.assistant) {
      return {
        vectorStore: { id: this.vectorStore.id, name: this.vectorStore.name, type: "openai" },
        assistant: { id: this.assistant.id, name: this.assistant.name, type: "openai" },
      };
    }

    throw new Error("Failed to create vectorStore");
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
  private async init(
    provider: IProvider
  ): Promise<{ vectorStore: OpenAI.Beta.VectorStores.VectorStore; assistant: OpenAI.Beta.Assistants.Assistant }> {
    this.vectorStore = await this.emplaceVectorStore(provider);
    this.assistant = await this.emplaceAssistant(provider);

    return { vectorStore: this.vectorStore, assistant: this.assistant };
  }

  async emplaceVectorStore(
    provider: Pick<IProvider, "api" | "vectorStore">
  ): Promise<OpenAI.Beta.VectorStores.VectorStore> {
    const openai = provider.api;
    const vectorStore = provider.vectorStore;

    if ("name" in vectorStore) {
      return await openai.beta.vectorStores.create({
        name: vectorStore.name,
        chunking_strategy: vectorStore.chunking_strategy ?? {
          type: "static",
          static: { max_chunk_size_tokens: 800, chunk_overlap_tokens: 400 },
        },
      });
    } else {
      let after: string | null = null;
      do {
        const fetched: Awaited<ReturnType<typeof openai.beta.vectorStores.list>> = await openai.beta.vectorStores.list({
          ...(typeof after === "string" && { after }),
        });

        after = fetched.nextPageParams()?.after ?? null;
        const created = fetched.data.find((item) => item.id === vectorStore.id);
        if (created) {
          return created;
        }
      } while (after);
    }

    throw new Error("Failed to init vectorStore with openai.");
  }

  async emplaceAssistant(provider: Pick<IProvider, "api" | "assistant">): Promise<OpenAI.Beta.Assistants.Assistant> {
    const openai = provider.api;
    const assistant = provider.assistant;

    if ("id" in assistant) {
      return openai.beta.assistants.retrieve(assistant.id);
    } else {
      return openai.beta.assistants.create(assistant);
    }
  }
}
