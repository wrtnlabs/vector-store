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
  export type IExtension =
    | "c"
    | "cpp"
    | "cs"
    | "css"
    | "doc"
    | "docx"
    | "go"
    | "html"
    | "java"
    | "js"
    | "json"
    | "md"
    | "pdf"
    | "php"
    | "pptx"
    | "py"
    | "rb"
    | "sb"
    | "tex"
    | "ts"
    | "txt";

  export type URLFormat = {
    /**
     * filename
     */
    name: `${string}.${IExtension}`;

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
     *
     * Only if you have uploaded it before.
     */
    originalName: string;
  };
}
