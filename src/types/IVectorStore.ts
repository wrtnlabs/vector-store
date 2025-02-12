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
  attach: () => Promise<FileCounts>;

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

/**
 * Represents a vector store instance.
 * A vector store manages vector representations (embeddings) of files,
 * and can be integrated with various storage backends.
 */
export interface IVectorStore {
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
  constructor(private readonly store: IStore) {}

  /**
   * @inheritdoc
   */
  abstract attach(): Promise<FileCounts>;

  /**
   * @inheritdoc
   */
  abstract detach(): Promise<FileCounts>;

  /**
   * @inheritdoc
   */
  abstract list(): Promise<IVectorStoreFile[]>;

  /**
   * Creates a new vector store instance.
   *
   * This method should be implemented to initialize the vector store and return metadata
   * about the store, such as:
   * - id: A unique identifier for the vector store.
   * - name: A human-readable name for the vector store.
   * - type: An optional type indicator (e.g., "openai", "pgvector") or null.
   *
   * @returns A promise that resolves to an object containing the vector store's id, name, and type.
   */
  abstract create(): Promise<IVectorStore>;

  /**
   * A getter that returns an object with methods for managing the list of files
   * to be analyzed by the vector store.
   */
  abstract get file(): IFileFunction;
}
