import { tags } from "typia";

export type IFile = (string & tags.Format<"iri">) | ArrayBuffer;
