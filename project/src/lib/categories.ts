export const ITEM_TYPES = ["支出", "収入"] as const;
export type ItemType = (typeof ITEM_TYPES)[number];

export const CATEGORIES_BY_TYPE: Record<ItemType, string[]> = {
  支出: [
    "食費",
    "日用品",
    "交通費",
    "交際費",
    "娯楽費",
    "光熱費",
    "通信費",
    "住居費",
    "医療費",
    "被服費",
    "教育費",
    "その他",
  ],
  収入: ["給与", "賞与", "副収入", "その他"],
};
