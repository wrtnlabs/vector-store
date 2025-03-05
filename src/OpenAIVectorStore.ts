import OpenAI from "openai";
import { tags } from "typia";
import { init } from "./openai/Openai";
import { IFile } from "./types/IFile";
import { IProvider } from "./types/IProvider";
import { IStore } from "./types/IStore";
import { FileCounts, IAssistant, IVectorStore } from "./types/IVectorStore";
import { IVectorStoreFile } from "./types/IVectorStoreFile";

export class OpenAIVectorStore extends IVectorStore {
  private vectorStore: OpenAI.Beta.VectorStores.VectorStore | null = null;

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

  async create(props: IVectorStore.ICreate): Promise<{ vectorStore: IVectorStore.IAt; assistant: IAssistant.IAt }> {
    if (props.type === "openai") {
      const { vectorStore, assistant } = await init(props.provider);

      return {
        vectorStore: {
          id: vectorStore.id,
          name: vectorStore.name,
          type: "openai",
        },
        assistant: {
          id: assistant.id,
          name: assistant.name,
          type: "openai",
        },
      };
    }

    throw new Error("Failed to create vectorStore");
  }

  private async getFile(fileUrl: string & tags.Format<"iri">): Promise<ArrayBuffer> {
    const response = await fetch(fileUrl);
    return await response.arrayBuffer();
  }
}
