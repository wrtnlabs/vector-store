import { tags } from "typia";

export interface IPagination {
  /**
   * This refers to the number of elements per page.
   */
  count: number & tags.Type<"int64">;

  /**
   * It refers to the page on which data is to be searched.
   * The method of calculation is bound to be affected by the count.
   */
  page: number & tags.Type<"int64">;
}
