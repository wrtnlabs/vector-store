import { tags } from "typia";

/**
 * Represents a file record in the vector store.
 */
export interface IVectorStoreFile {
  /**
   * Unique identifier for the vector store file.
   */
  id: string;

  /**
   * Saved name of the file.
   *
   * The name where the file is finally saved
   * is the following form by adding a hash code.:
   * - `{hash}-${original_name}`
   */
  name: string;

  /**
   * Original file name.
   */
  original_name: string;

  /**
   * SHA-256 hash of the file content.
   * This hash is generated using a function like `getFileHash` (see below) to compute a hash from a file buffer,
   * and is used to detect duplicate files.
   */
  hash: string | null;

  /**
   * Identifier of the associated vector store.
   */
  vector_store_id: string;

  /**
   * Optional file extension.
   */
  extension?: string;

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
