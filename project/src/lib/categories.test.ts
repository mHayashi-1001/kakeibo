import { describe, expect, it } from "vitest";
import { CATEGORIES_BY_TYPE, ITEM_TYPES } from "./categories";

describe("categories", () => {
  it("すべての収支種別にカテゴリ候補が1件以上ある", () => {
    for (const type of ITEM_TYPES) {
      expect(CATEGORIES_BY_TYPE[type].length).toBeGreaterThan(0);
    }
  });

  it("すべての収支種別のカテゴリ候補に「その他」が含まれる", () => {
    for (const type of ITEM_TYPES) {
      expect(CATEGORIES_BY_TYPE[type]).toContain("その他");
    }
  });
});
