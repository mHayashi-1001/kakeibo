import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// Edge Runtimeで動かす理由は src/app/api/insert/route.ts のコメント・CLAUDE.md参照
export const runtime = "edge";

/**
 * 設定済みの予算を全件取得するAPIエンドポイント
 * GET /api/budget-search
 * (/list画面・/budget画面の初期表示で呼ばれる)
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
    const budgets = await sql`SELECT category, amount FROM budget ORDER BY category`;
    return NextResponse.json({ success: true, budgets });
  } catch (e: unknown) {
    return NextResponse.json({ success: false, error: String(e) });
  }
}
