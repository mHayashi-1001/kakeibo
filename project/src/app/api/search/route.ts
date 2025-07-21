import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const runtime = "edge";

export async function GET() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return NextResponse.json({
      success: false,
      error: "DATABASE_URLが設定されていません！",
    });
  }
  const sql = neon(connectionString);
  try {
    const items = await sql`SELECT id, date, name, price FROM item ORDER BY id`;
    return NextResponse.json({ success: true, items });
  } catch (e: unknown) {
    return NextResponse.json({ success: false, error: String(e) });
  }
}
