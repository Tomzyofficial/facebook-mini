import pool from "@/app/_lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  // Retrieve the to_user_id query string from the fetch endpoint in Notification file
  const { searchParams } = new URL(req.url);
  const to_user_id = searchParams.get("to_user_id");

  // Retrieve all friend requests for specific user
  const retrievedQuery = await pool.query(
    `SELECT fr.from_user_id, fr.to_user_id, u.fname, u.lname FROM public.friend_requests AS fr JOIN public.users AS u ON fr.from_user_id = u.id WHERE fr.to_user_id = $1 AND fr.friend_request_status = $2 ORDER BY fr.created_at DESC`,
    [to_user_id, "PENDING"]
  );

  if (retrievedQuery.rows.length < 1) {
    return NextResponse.json({ success: false, result: [] }, { status: 404 });
  }

  return NextResponse.json({ success: true, result: retrievedQuery.rows }, { status: 200 });
}
