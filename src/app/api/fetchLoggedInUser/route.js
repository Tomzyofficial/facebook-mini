import { verifySession } from "@/app/_lib/session";
import pool from "@/app/_lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await verifySession();

  if (!session || !session.userId) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const queryResult = await pool.query("SELECT * FROM users WHERE id = $1", [session.userId]);

  if (!queryResult || queryResult.rows.length < 1) return NextResponse.json({ user: null, message: "No user found" }, { status: 404 });

  return NextResponse.json({ message: "User found", user: queryResult.rows[0] }, { status: 200 });
}
