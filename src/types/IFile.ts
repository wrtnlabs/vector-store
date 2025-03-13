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

  /**
   * It includes name and data(URL format) properties.
   */
  export type URLFormat = {
    type: "URL_FORMAT";

    /**
     * filename
     */
    name: `${string}.${IExtension}`;

    /**
     * file url
     */
    data: string & tags.Format<"iri">;
  };

  /**
   * It includes fileId property means ID of OpenAI Platform
   */
  export type FileIDFormat = {
    type: "FILE_ID";

    /**
     * File ID in OpenAI Platform
     */
    fileId: string;
  };

  /**
   * It includes hash property.
   */
  export type HashFormat = {
    type: "HASH";

    /**
     * Hash
     *
     * When you call the 'list' function to query the file list,
     * each element has a hash property.
     */
    hash: string;
  };

  /**
   * it include originalName property.
   */
  export type FilenameFormat = {
    type: "ORIGINAL_NAME";

    /**
     * Original file name.
     *
     * Only if you have uploaded it before.
     */
    originalName: string;
  };
}
