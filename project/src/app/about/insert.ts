"use server"; // サーバサイド専用

// Prismaクライアントをインポート
import { PrismaClient } from "@/generated/prisma/";

// itemテーブルに新規レコードを挿入する関数
const insert = async (input: FormData) => {
  // Prismaクライアントのインスタンスを作成
  const client: PrismaClient = new PrismaClient();

  await client.item.create({
    data: {
      // フォームから受け取った値をセット
      id: Number.parseInt(input.get("id")?.valueOf().toString() || ""),
      date: new Date().toISOString(), //　現在日時
      name: input.get("name")?.valueOf().toString() || "",
      price: Number.parseInt(input.get("price")?.valueOf().toString() || "0"),
    },
  });
};

// 他ファイルから呼び出せるよう関数エクスポート
export default insert;
