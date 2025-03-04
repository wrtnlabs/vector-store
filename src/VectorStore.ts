import OpenAI from "openai";
import { tags } from "typia";
import { IFile } from "./types/IFile";
import { IProvider } from "./types/IProvider";
import { IStore } from "./types/IStore";
import { FileCounts, IVectorStore } from "./types/IVectorStore";
import { IVectorStoreFile } from "./types/IVectorStoreFile";

export class VectorStore extends IVectorStore {
  private _vectorStore: OpenAI.Beta.VectorStores.VectorStore | null = null;
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

  async create(): Promise<IVectorStore> {
    throw new Error("Method not implemented.");
  }

  private async init(): Promise<OpenAI.Beta.VectorStores.VectorStore> {
    const openai = this.props.provider.api;
    if (this._vectorStore !== null) {
      return this._vectorStore;
    }

    const vectorStore = this.props.provider.vectorStore;
    if ("name" in vectorStore) {
      this._vectorStore = await openai.beta.vectorStores.create({
        name: vectorStore.name,
        chunking_strategy: vectorStore.chunking_strategy ?? {
          type: "static",
          static: { max_chunk_size_tokens: 800, chunk_overlap_tokens: 400 },
        },
      });
    } else {
      let after: string | null = null;
      do {
        const fetched = await openai.beta.vectorStores.list({});
        after = fetched.nextPageParams()?.after ?? null;
        const created = fetched.data.find((vectorStore) => vectorStore.id === vectorStore.id);
        if (created) {
          return created;
        }
      } while (this._vectorStore === null && after);
    }

    return this._vectorStore!;
  }

  private async getFile(fileUrl: string & tags.Format<"iri">): Promise<ArrayBuffer> {
    const response = await fetch(fileUrl);
    return await response.arrayBuffer();
  }
}
