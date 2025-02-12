import crypto from "crypto";

/**
 * Example utility function to generate a file hash.
 *
 * This function takes a Buffer of the file content and returns its SHA-256 hash.
 * The generated hash is useful for detecting duplicate files.
 *
 * ```ts
 * const hash = getFileHash(fileBuffer);
 * ```
 */
export function getFileHash(fileBuffer: Buffer): string {
  return crypto.createHash("sha256").update(fileBuffer).digest("hex");
}
