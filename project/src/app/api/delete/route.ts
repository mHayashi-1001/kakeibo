import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const runtime = "edge";

/**
 * itemテーブルのレコードを削除するAPIエンドポイント
 */
export async function DELETE(request: Request) {
  let data;
  try {
    data = await request.json();
  } catch (e) {
    return NextResponse.json({
      success: false,
      error: "JSONのパースに失敗しました",
    });
  }

  if (!data?.id || isNaN(Number(data.id))) {
    return NextResponse.json({ success: false, error: "idが不正です" });
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
  const id = Number.parseInt(data.id);

  try {
    const result = await sql`
      DELETE FROM item WHERE id = ${id} RETURNING id
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
