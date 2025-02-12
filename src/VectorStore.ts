import { IStore } from "./types/IStore";
import { IFileFunction, IVectorStore } from "./types/IVectorStore";

export class VectorStore extends IVectorStore {
  constructor(store: IStore) {
    super(store);
  }

  create(): Promise<IVectorStore> {
    throw new Error("Method not implemented.");
  }
  get file(): IFileFunction {
    throw new Error("Method not implemented.");
  }
}
