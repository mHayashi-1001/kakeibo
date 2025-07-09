import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// export const runtime = "edge";

const prisma = new PrismaClient();

/**
 * itemテーブルにデータを挿入するAPIエンドポイント（Prisma版）
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

  // 各値を適切な型に変換
  const id = Number.parseInt(data.id);
  const price = Number.parseInt(data.price);
  const name = data.name;
  const date = data.date
    ? new Date(data.date).toISOString()
    : new Date().toISOString();

  try {
    // idの重複チェック
    const existing = await prisma.item.findUnique({ where: { id } });
    if (existing) {
      return NextResponse.json({
        success: false,
        error: "同じIDが既に存在します(よくない)",
      });
    }
    await prisma.item.create({
      data: {
        id,
        date,
        name,
        price,
      },
    });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.toString() });
  }
}

/**
 * データのバリデーションを行う関数
 */
function validateData(data: any) {
  if (!data) return "データがありません";
  if (!data.id || isNaN(Number(data.id))) return "idが不正です";
  if (!data.name || typeof data.name !== "string") return "nameが不正です";
  if (!data.price || isNaN(Number(data.price))) return "priceが不正です";
  return null;
}
