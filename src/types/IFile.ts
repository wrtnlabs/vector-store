import { tags } from "typia";

export type IFile = {
  /**
   * filename
   */
  name: string;

  /**
   * file data or url
   */
  data: (string & tags.Format<"iri">) | ArrayBuffer | File;
};
