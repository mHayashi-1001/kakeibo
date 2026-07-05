import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const runtime = "edge";

/**
 * itemテーブルにデータを挿入するAPIエンドポイント
 */
export async function POST(request: Request) {
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
  const price = Number.parseInt(data.price);
  const name = data.name;
  const date = data.date
    ? new Date(data.date).toISOString()
    : new Date().toISOString();

  try {
    const result = await sql`
      INSERT INTO item (date, name, price)
      VALUES (${date}, ${name}, ${price})
      RETURNING id
    `;
    return NextResponse.json({ success: true, id: result[0].id });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.toString() });
  }
}

/**
 * データのバリデーションを行う関数
 */
function validateData(data: any) {
  if (!data) return "データがありません";
  if (!data.name || typeof data.name !== "string") return "nameが不正です";
  if (!data.price || isNaN(Number(data.price))) return "priceが不正です";
  return null;
}
