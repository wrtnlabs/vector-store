import { tags } from "typia";

export type File = (string & tags.Format<"iri">) | ArrayBuffer;

export interface IStore {
  getFiles: () => Promise<File[]>;
  insertFiles?: (files: File[]) => Promise<boolean>;
  removeFiles?: (files: File[]) => Promise<boolean>;
}

export abstract class IVectorStore {
  constructor(private readonly store: IStore) {}

  abstract create(): Promise<{ id: string; name: string; type: string | null }>;

  abstract get file(): {
    create: () => Promise<number & tags.Type<"uint32">>;
    remove: () => Promise<number & tags.Type<"uint32">>;
  };
}
