import { tags } from "typia";

export type File = (string & tags.Format<"iri">) | ArrayBuffer;

/**
 * Represents a file record in the vector store.
 */
export interface VectorStoreFile {
  /**
   * Unique identifier for the vector store file.
   */
  id: string;

  /**
   * Saved name of the file.
   */
  name: string;

  /**
   * SHA-256 hash of the file content.
   * This hash is generated using a function like `getFileHash` (see below) to compute a hash from a file buffer,
   * and is used to detect duplicate files.
   */
  hash?: string;

  /**
   * Identifier of the associated vector store.
   */
  vector_store_id: string;

  /**
   * Optional identifier of the file.
   */
  file_id?: string;

  /**
   * Optional file extension.
   */
  extension?: string;

  /**
   * Publicly accessible address of the file.
   */
  url: string;

  /**
   * Size of the file in bytes.
   */
  size: number;

  /**
   * Timestamp when the file record was created.
   * Represented as an ISO 8601 formatted string.
   */
  created_at: string & tags.Format<"date-time">;
}

/**
 * A generic storage interface that abstracts the underlying storage mechanism.
 * The storage could be a database (e.g., Redis, Postgres) or a temporary in-memory store.
 * It provides methods to retrieve, insert, and remove files.
 */
export interface IStore {
  /**
   * Retrieves the list of stored files.
   *
   * The files could be either:
   * - A string representing an IRI (Internationalized Resource Identifier), which could be a file URL.
   * - An ArrayBuffer, representing a file's binary content.
   *
   * @returns A promise resolving to an array of stored files.
   */
  getFiles: () => Promise<File[]>;

  /**
   * Inserts files into the store.
   *
   * The storage backend could be a database like Redis or Postgres, or even an in-memory store.
   * Implementations may vary based on the storage type.
   *
   * @param files Files to be inserted into the store.
   * @returns A promise resolving to `true` if insertion succeeds, otherwise `false`.
   */
  insert?: (files: File[]) => Promise<boolean>;

  /**
   * Removes specified files from the store.
   *
   * The storage backend could be a database like Redis or Postgres, or an in-memory store.
   * Implementations should ensure that only the specified files are removed.
   *
   * @param files Files to be removed from the store.
   * @returns A promise resolving to `true` if removal succeeds, otherwise `false`.
   */
  remove?: (files: File[]) => Promise<boolean>;
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
export abstract class IVectorStore {
  // The underlying file storage mechanism (could be Redis, Postgres, in-memory, etc.)
  constructor(private readonly store: IStore) {}

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
  abstract create(): Promise<{ id: string; name: string; type: string | null }>;

  /**
   * A getter that returns an object with methods for managing the list of files
   * to be analyzed by the vector store.
   */
  abstract get file(): {
    /**
     * Adds a file reference to the vector store's analysis list.
     * This operation only registers the file for analysis and does not remove or alter the actual file in the IStore.
     *
     * @returns A promise resolving to a number (formatted as a uint32) representing the result,
     *          which might indicate a success status or the count of added file references.
     */
    create: () => Promise<number & tags.Type<"uint32">>;

    /**
     * Removes a file reference from the vector store's analysis list.
     * This operation only unregisters the file from analysis and does not delete the actual file from the IStore.
     *
     * @returns A promise resolving to a number (formatted as a uint32) indicating the outcome,
     *          such as a success status or the count of removed file references.
     */
    remove: () => Promise<number & tags.Type<"uint32">>;

    /**
     * Retrieves the list of files currently registered in the vector store.
     *
     * @returns A promise resolving to an array of VectorStoreFile objects.
     */
    list: () => Promise<VectorStoreFile[]>;
  };
}
