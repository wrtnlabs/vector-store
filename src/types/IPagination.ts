import { tags } from "typia";

export interface IPagination {
  limit: number & tags.Type<"int64">;
  offset: number & tags.Type<"int64">;
}
