// 収支種別(支出/収入)の一覧。配列の並び順がUIの選択肢の順番にもなる
export const ITEM_TYPES = ["支出", "収入"] as const;
export type ItemType = (typeof ITEM_TYPES)[number];

// 収支種別ごとのカテゴリ候補一覧。
// entry/list画面のカテゴリ選択肢と、APIのバリデーション(insert/update)の両方でここを参照することで、
// クライアントとサーバーでカテゴリの許容値がずれないようにしている。
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
