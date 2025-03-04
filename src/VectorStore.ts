import OpenAI from "openai";
import { tags } from "typia";
import { init } from "./openai/Openai";
import { IFile } from "./types/IFile";
import { IProvider } from "./types/IProvider";
import { IStore } from "./types/IStore";
import { FileCounts, IVectorStore } from "./types/IVectorStore";
import { IVectorStoreFile } from "./types/IVectorStoreFile";

export class VectorStore extends IVectorStore {
  private type: "openai" | null = null;
  private vectorStore: OpenAI.Beta.VectorStores.VectorStore | null = null;

  constructor(private readonly props: { provider: IProvider; store: IStore }) {
    super(props.store);
  }

  async attach(file: IFile): Promise<FileCounts> {
    const buffer = typeof file === "string" ? await this.getFile(file) : file;

    throw new Error("Method not implemented.");
  }

  async detach(): Promise<FileCounts> {
    throw new Error("Method not implemented.");
  }

  async list(): Promise<IVectorStoreFile[]> {
    throw new Error("Method not implemented.");
  }

  async create(props: IVectorStore.ICreate): Promise<IVectorStore.IAt> {
    if (props.type === "openai") {
      this.type = "openai";
      this.vectorStore = await init(props.provider);
      return { type: "openai" as const, id: this.vectorStore.id, name: this.vectorStore.name };
    }

    throw new Error("Method not implemented.");
  }

  private async getFile(fileUrl: string & tags.Format<"iri">): Promise<ArrayBuffer> {
    const response = await fetch(fileUrl);
    return await response.arrayBuffer();
  }
}
