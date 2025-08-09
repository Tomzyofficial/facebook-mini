import pool from "@/app/_lib/db";
import { NextResponse } from "next/server";
import { verifySession } from "@/app/_lib/session";

export async function POST(req) {
  try {
    const session = await verifySession();
    if (!session || !session.userId) {
      return NextResponse.json({ status: 401, res: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const inputText = body.inputText;

    if (!inputText || inputText.trim() === "") {
      console.log("Missing search query");

      return NextResponse.json({ status: 400, res: "Missing search query", success: false }, { status: 400 });
    }

    const queryResult = await pool.query(
      `SELECT * FROM users 
       WHERE id != $1 AND (
         fname LIKE $2 OR
         lname LIKE $3
       )`,
      [session.userId, `%${inputText}%`, `%${inputText}%`]
    );
    const result = queryResult.rows;

    return NextResponse.json({ status: 200, res: result, success: true }, { status: 200 });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json({ status: 500, res: "Internal server error" }, { status: 500 });
  }
}
