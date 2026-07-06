import { CATEGORIES_BY_TYPE, ITEM_TYPES, ItemType } from "@/lib/categories";

/**
 * name/price/type/categoryの入力チェック(insert/update共通)。
 * 問題があればエラーメッセージ(文字列)を、問題なければnullを返す
 */
export function validateItemFields(
  data: Record<string, unknown> | null | undefined
): string | null {
  if (!data) return "データがありません";
  if (!data.name || typeof data.name !== "string") return "nameが不正です";
  // 金額0円を許容するため、未入力(空文字/undefined/null)かどうかとNaNかどうかを別にチェックする
  if (data.price === "" || data.price == null || isNaN(Number(data.price)))
    return "priceが不正です";
  if (!ITEM_TYPES.includes(data.type as ItemType)) return "typeが不正です";
  // categoryは選択中のtypeに対応する候補一覧に含まれているかをチェックする
  if (
    !data.category ||
    !CATEGORIES_BY_TYPE[data.type as ItemType].includes(data.category as string)
  )
    return "categoryが不正です";
  return null;
}

/**
 * idの入力チェック(update/delete共通)。
 * 問題があればエラーメッセージ(文字列)を、問題なければnullを返す
 */
export function validateId(data: Record<string, unknown> | null | undefined): string | null {
  if (!data?.id || isNaN(Number(data.id))) return "idが不正です";
  return null;
}
