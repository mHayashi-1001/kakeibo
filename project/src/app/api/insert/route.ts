import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/";

// POSTリクエストを処理する関数
export async function POST(request: Request) {
  // リクエストボディのJSONデータを取得
  const data = await request.json();
  // Prisma Clientのインスタンスを作成
  const client = new PrismaClient();
  try {
    // itemテーブルのレコードを作成
    await client.item.create({
      data: {
        id: Number.parseInt(data.id),
        date: data.date
          ? new Date(data.date).toISOString()
          : new Date().toISOString(),
        name: data.name, // 名前
        price: Number.parseInt(data.price),
      },
    });
    // 成功時のレスポンス
    return NextResponse.json({ success: true });
  } catch (e) {
    // エラー発生時のレスポンス
    return NextResponse.json({ success: false, error: e?.toString() });
  } finally {
    // 切断
    await client.$disconnect();
  }
}
