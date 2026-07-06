import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// Edge Runtimeで動かす理由は src/app/api/insert/route.ts のコメント・CLAUDE.md参照
export const runtime = "edge";

/**
 * item一覧を取得するAPIエンドポイント
 * GET /api/search
 * (/list画面の初期表示で呼ばれる)
 */
export async function GET() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return NextResponse.json({
      success: false,
      error: "DATABASE_URLが設定されていません",
    });
  }
  const sql = neon(connectionString);
  try {
    // idの昇順(登録順)ですべて取得する
    const items = await sql`SELECT id, date, name, price, category, type FROM item ORDER BY id`;
    return NextResponse.json({ success: true, items });
  } catch (e: unknown) {
    return NextResponse.json({ success: false, error: String(e) });
  }
}
