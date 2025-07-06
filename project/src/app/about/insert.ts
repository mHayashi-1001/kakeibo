"use server";

import { PrismaClient } from "@/generated/prisma/";

const insert = async (input: FormData) => {
  const client: PrismaClient = new PrismaClient();
  await client.item.create({
    data: {
      id: Number.parseInt(input.get("id")?.valueOf().toString() || ""),
      date: "2014-10-10T13:50:40+09:00",
      name: "",
      price: 0,
    },
  });
};
export default insert;
