import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { validateBudget } from "@/lib/validate";

// Edge Runtimeで動かす理由は src/app/api/insert/route.ts のコメント・CLAUDE.md参照
export const runtime = "edge";

/**
 * カテゴリごとの予算を作成/更新するAPIエンドポイント
 * PUT /api/budget-upsert
 * (/budget画面の保存ボタンから呼ばれる)
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

  const validationError = validateBudget(data);
  if (validationError) {
    return NextResponse.json({ success: false, error: validationError });
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return NextResponse.json({
      success: false,
      error: "DATABASE_URLが設定されていません",
    });
  }
  const sql = neon(connectionString);

  const category = data.category;
  const amount = Number.parseInt(data.amount);

  try {
    // 既に予算があれば上書き、なければ新規作成する
    await sql`
      INSERT INTO budget (category, amount)
      VALUES (${category}, ${amount})
      ON CONFLICT (category) DO UPDATE SET amount = ${amount}
    `;
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ success: false, error: String(e) });
  }
}
