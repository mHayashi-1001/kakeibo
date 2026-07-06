import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { ItemType } from "@/lib/categories";
import { validateId, validateItemFields } from "@/lib/validate";

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
  } catch {
    return NextResponse.json({
      success: false,
      error: "JSONのパースに失敗しました",
    });
  }

  const validationError = validateId(data) || validateItemFields(data);
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
  } catch (e: unknown) {
    return NextResponse.json({ success: false, error: String(e) });
  }
}
