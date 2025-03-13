import { IFile } from "./IFile";
import { IProvider } from "./IProvider";
import { IStore } from "./IStore";
import { IVectorStoreFile } from "./IVectorStoreFile";

export interface IFileFunction {
  /**
   * Adds a file reference to the vector store's analysis list.
   * This operation only registers the file for analysis and does not remove or alter the actual file in the IStore.
   *
   * @returns Number of files covered by Vector DB
   */
  attach: (file: IVectorStore.IAttachInput) => Promise<void>;

  /**
   * Removes a file reference from the vector store's analysis list.
   * This operation only unregisters the file from analysis and does not delete the actual file from the IStore.
   *
   * @returns Number of files covered by Vector DB
   */
  detach?: (props: IVectorStore.IDetachInput) => Promise<void>;

  /**
   * Retrieves the list of files currently registered in the vector store.
   *
   * @returns A promise resolving to an array of VectorStoreFile objects.
   */
  list: () => Promise<IVectorStoreFile[]>;
}

export namespace IVectorStore {
  export interface IQueryInput {
    /**
     * query keyword
     */
    query: string;
  }

  export interface IQueryOutput {
    /**
     * Response from VectorStore.
     *
     * The response may be inaccurate or difficult to answer,
     * depending on the query's request factor value.
     * If you are asked for additional factors in response,
     * you can ask the user to give you a better keyword.
     */
    response: string | null;
  }

  export interface IAttachInput {
    files: (IFile.URLFormat | IFile.FileIDFormat | IFile.HashFormat | IFile.FilenameFormat)[];

    // chunking_strategy?: FileChunkingStrategyParam;
  }

  export interface IDetachInput {
    file:
      | {
          /**
           * File ID in OpenAI Platform
           */
          fileId: string;
        }
      | {
          /**
           * Hash
           *
           * When you call the 'list' function to query the file list,
           * each element has a hash property.
           */
          hash: string;
        }
      | {
          /**
           * filename
           *
           * Indicates the name when the file was saved.
           */
          filename: string;
        };
  }

  export interface ICreate {
    type: "openai";
    provider: IProvider;
  }

  /**
   * Represents a vector store instance.
   * A vector store manages vector representations (embeddings) of files,
   * and can be integrated with various storage backends.
   */
  export interface IAt {
    /**
     * Unique identifier for the vector store.
     */
    id: string;

    /**
     * Human-readable name of the vector store.
     */
    name: string;

    /**
     * The type of the vector store (e.g., "openai", "pgvector").
     * This field can be null if no specific type is assigned.
     */
    type: string | null;
  }
}

export namespace IAssistant {
  export interface IAt {
    id: string;

    name: string | null;

    type: string | null;
  }
}

/**
 * An abstract vector store interface that represents a vector database,
 * such as OpenAI's vectorStore or even Postgres's pgvector.
 *
 * This class is responsible for managing the vector representations of files,
 * allowing the addition and removal of file references for analysis within the vector store.
 * It holds a reference to an underlying IStore instance, which manages the actual file storage.
 *
 * Note: The operations provided by the vector store (via the `file` getter) do not delete or modify
 * the actual files in the IStore. Instead, they only manage which files are included in the analysis
 * list of the vector store.
 */
export abstract class IVectorStore implements IFileFunction {
  // The underlying file storage mechanism (could be Redis, Postgres, in-memory, etc.)
  constructor(protected readonly store?: IStore) {}

  /**
   * Queries data using the Openai VectorStore.
   *
   * Who want to query can also get better search results if you include specific keywords.
   *
   * @param props Query
   */
  abstract query(props: IVectorStore.IQueryInput): Promise<{ response: string | null }>;

  /**
   * @inheritdoc
   */
  abstract attach(props: IVectorStore.IAttachInput): Promise<void>;

  /**
   * @inheritdoc
   */
  abstract detach(props: IVectorStore.IDetachInput): Promise<void>;

  /**
   * @inheritdoc
   */
  abstract list(): Promise<IVectorStoreFile[]>;
}
