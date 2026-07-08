import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { CATEGORIES_BY_TYPE } from "@/lib/categories";

// Edge Runtimeで動かす理由は src/app/api/insert/route.ts のコメント・CLAUDE.md参照
export const runtime = "edge";

/**
 * カテゴリの予算設定を削除する(「未設定」に戻す)APIエンドポイント
 * DELETE /api/budget-delete
 * (/budget画面で金額欄を空にして保存したときに呼ばれる)
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

  if (!data?.category || !CATEGORIES_BY_TYPE.支出.includes(data.category)) {
    return NextResponse.json({ success: false, error: "categoryが不正です" });
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

  try {
    // 元々予算が未設定(0件)でも、結果的に「未設定」であることに変わりないのでエラーにはしない
    await sql`DELETE FROM budget WHERE category = ${category}`;
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ success: false, error: String(e) });
  }
}
