import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { CATEGORIES_BY_TYPE, ITEM_TYPES, ItemType } from "@/lib/categories";

// Edge Runtimeで動かす理由は src/app/api/insert/route.ts のコメント・CLAUDE.md参照
export const runtime = "edge";

/**
 * itemテーブルの既存レコードを更新するAPIエンドポイント
 * PUT /api/update
 * (/list画面で行をクリックして編集・保存したときに呼ばれる)
 */
export async function PUT(request: Request) {
  let data;
  try {
    data = await request.json();
  } catch (e) {
    return NextResponse.json({
      success: false,
      error: "JSONのパースに失敗しました",
    });
  }

  const validationError = validateData(data);
  if (validationError) {
    return NextResponse.json({ success: false, error: validationError });
  }

  // DB接続文字列を取得
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return NextResponse.json({
      success: false,
      error: "DATABASE_URLが設定されていません",
    });
  }
  const sql = neon(connectionString);

  // 各値を適切な型に変換
  const id = Number.parseInt(data.id);
  const price = Number.parseInt(data.price);
  const name = data.name;
  const date = new Date(data.date).toISOString();
  const type = data.type as ItemType;
  const category = data.category;

  try {
    // 指定idの行を全項目まとめて更新。該当行がなければ0件で返ってくる
    const result = await sql`
      UPDATE item
      SET date = ${date}, name = ${name}, price = ${price}, category = ${category}, type = ${type}
      WHERE id = ${id}
      RETURNING id
    `;
    if (result.length === 0) {
      return NextResponse.json({
        success: false,
        error: "対象のデータが見つかりません",
      });
    }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.toString() });
  }
}

/**
 * データのバリデーションを行う関数
 * 問題があればエラーメッセージ(文字列)を、問題なければnullを返す
 */
function validateData(data: any) {
  if (!data) return "データがありません";
  if (!data.id || isNaN(Number(data.id))) return "idが不正です";
  if (!data.name || typeof data.name !== "string") return "nameが不正です";
  // 金額0円を許容するため、未入力(空文字/undefined/null)かどうかとNaNかどうかを別にチェックする
  if (data.price === "" || data.price == null || isNaN(Number(data.price)))
    return "priceが不正です";
  if (!ITEM_TYPES.includes(data.type)) return "typeが不正です";
  if (
    !data.category ||
    !CATEGORIES_BY_TYPE[data.type as ItemType].includes(data.category)
  )
    return "categoryが不正です";
  return null;
}
