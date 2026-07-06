import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { CATEGORIES_BY_TYPE, ITEM_TYPES, ItemType } from "@/lib/categories";

// Cloudflare Pages(next-on-pages)にデプロイするため、このAPIルートはEdge Runtimeで動く。
// Edge Runtimeは生のTCP/TLSソケットを扱えないため、通常のpgドライバやPrisma標準エンジンは使えない。
// そのためDBアクセスにはHTTPS fetch経由でSQLを実行するneon()を使っている(詳細はCLAUDE.md参照)。
export const runtime = "edge";

/**
 * itemテーブルにデータを挿入するAPIエンドポイント
 * POST /api/insert
 */
export async function POST(request: Request) {
  // リクエストボディをJSONとしてパース
  let data;
  try {
    data = await request.json();
  } catch (e) {
    return NextResponse.json({
      success: false,
      error: "JSONのパースに失敗しました",
    });
  }

  // 入力値のチェック(不正な場合はエラーメッセージを返して終了)
  const validationError = validateData(data);
  if (validationError) {
    return NextResponse.json({ success: false, error: validationError });
  }

  // DB接続文字列を取得(project/.envのDATABASE_URLは本番Neon DBを指しているので注意)
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
  // 日付未指定の場合は現在時刻を使う
  const date = data.date
    ? new Date(data.date).toISOString()
    : new Date().toISOString();
  const type = data.type as ItemType;
  const category = data.category;

  try {
    // idはDB側でautoincrementのため指定しない。挿入結果のidをRETURNINGで受け取る
    const result = await sql`
      INSERT INTO item (date, name, price, category, type)
      VALUES (${date}, ${name}, ${price}, ${category}, ${type})
      RETURNING id
    `;
    return NextResponse.json({ success: true, id: result[0].id });
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
  if (!data.name || typeof data.name !== "string") return "nameが不正です";
  if (!data.price || isNaN(Number(data.price))) return "priceが不正です";
  if (!ITEM_TYPES.includes(data.type)) return "typeが不正です";
  // categoryは選択中のtypeに対応する候補一覧に含まれているかをチェックする
  if (
    !data.category ||
    !CATEGORIES_BY_TYPE[data.type as ItemType].includes(data.category)
  )
    return "categoryが不正です";
  return null;
}
