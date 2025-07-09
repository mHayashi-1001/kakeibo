export const runtime = "edge";
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  const data = await request.json();
  const connectionString = process.env.DATABASE_URL!;
  const sql = neon(connectionString);

  try {
    await sql`
      INSERT INTO item (id, date, name, price)
      VALUES (
        ${Number.parseInt(data.id)},
        ${
          data.date
            ? new Date(data.date).toISOString()
            : new Date().toISOString()
        },
        ${data.name},
        ${Number.parseInt(data.price)}
      )
    `;
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: e?.toString() });
  }
}
