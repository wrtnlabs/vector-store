import { FileChunkingStrategyParam } from "openai/resources/beta/vector-stores/vector-stores";
import { IFile } from "./IFile";
import { IProvider } from "./IProvider";
import { IStore } from "./IStore";
import { IVectorStoreFile } from "./IVectorStoreFile";

/**
 * Number of files covered by Vector DB
 */
export interface FileCounts {
  /**
   * The number of files that were cancelled.
   */
  cancelled: number;

  /**
   * The number of files that have been successfully processed.
   */
  completed: number;

  /**
   * The number of files that have failed to process.
   */
  failed: number;

  /**
   * The number of files that are currently being processed.
   */
  in_progress: number;

  /**
   * The total number of files.
   */
  total: number;
}

export interface IFileFunction {
  /**
   * Adds a file reference to the vector store's analysis list.
   * This operation only registers the file for analysis and does not remove or alter the actual file in the IStore.
   *
   * @returns Number of files covered by Vector DB
   */
  attach: (file: IVectorStore.IAttach) => Promise<FileCounts>;

  /**
   * Removes a file reference from the vector store's analysis list.
   * This operation only unregisters the file from analysis and does not delete the actual file from the IStore.
   *
   * @returns Number of files covered by Vector DB
   */
  detach?: () => Promise<FileCounts>;

  /**
   * Retrieves the list of files currently registered in the vector store.
   *
   * @returns A promise resolving to an array of VectorStoreFile objects.
   */
  list: () => Promise<IVectorStoreFile[]>;
}

export namespace IVectorStore {
  export interface IQuery {
    query: string;
  }

  export interface IAttach {
    files: IFile[];
    chunking_strategy?: FileChunkingStrategyParam;
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

  abstract query(props: IVectorStore.IQuery): Promise<{ response: string | null }>;

  /**
   * @inheritdoc
   */
  abstract attach(props: IVectorStore.IAttach): Promise<FileCounts>;

  /**
   * @inheritdoc
   */
  abstract detach(): Promise<FileCounts>;

  /**
   * @inheritdoc
   */
  abstract list(): Promise<IVectorStoreFile[]>;
}
