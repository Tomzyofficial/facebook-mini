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

    // Query the users table for users whose first or last name matches the inputText, excluding the current user
    const queryResult = await pool.query(
      `SELECT * FROM public.users 
       WHERE id != $1 AND (
         fname ILIKE $2 OR
         lname ILIKE $2
       )`,
      [session.userId, `%${inputText}%`]
    );

    // Return the rows as the result
    return NextResponse.json({ status: 200, res: queryResult.rows, success: true }, { status: 200 });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json({ status: 500, res: "Internal server error" }, { status: 500 });
  }
}
