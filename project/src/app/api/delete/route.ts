import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { validateId } from "@/lib/validate";

// Edge Runtimeで動かす理由は src/app/api/insert/route.ts のコメント・CLAUDE.md参照
export const runtime = "edge";

/**
 * itemテーブルのレコードを削除するAPIエンドポイント
 * DELETE /api/delete
 * (/list画面の削除ボタンから呼ばれる)
 */
export async function DELETE(request: Request) {
  let data;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({
      success: false,
      error: "JSONのパースに失敗しました",
    });
  }

  const validationError = validateId(data);
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
  const id = Number.parseInt(data.id);

  try {
    // 削除できた行のidが返ってくるので、0件なら対象なしと判断できる
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
  } catch (e: unknown) {
    return NextResponse.json({ success: false, error: String(e) });
  }
}
