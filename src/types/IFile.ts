import { tags } from "typia";

export type IFile =
  | IFile.FileIDFormat
  | IFile.HashFormat
  | IFile.FilenameFormat
  | {
      /**
       * file data or url
       */
      data: (string & tags.Format<"iri">) | ArrayBuffer | File;
    };

export namespace IFile {
  export type URLFormat = {
    /**
     * filename
     */
    name: string;

    /**
     * file data or url
     */
    data: string & tags.Format<"iri">;
  };

  export type FileIDFormat = {
    /**
     * File ID in OpenAI Platform
     */
    fileId: string;
  };

  export type HashFormat = {
    /**
     * Hash
     *
     * When you call the 'list' function to query the file list,
     * each element has a hash property.
     */
    hash: string;
  };

  export type FilenameFormat = {
    /**
     * Original file name.
     */
    originalName: string;
  };
}
