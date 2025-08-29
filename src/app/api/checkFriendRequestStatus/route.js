import { verifySession } from "@/app/_lib/session";
import { NextResponse } from "next/server";
import pool from "@/app/_lib/db";

// This component is the API endpoint that checks if user have accepted friend request and preserve the button. For instance, if user A accepts user B request, friend_request_status becomes accepted
export async function GET(req) {
  const session = await verifySession();

  const { searchParams } = new URL(req.url);
  const to_user_id = searchParams.get("to_user_id");
  const from_user_id = searchParams.get("from_user_id");

  if (!to_user_id && from_user_id) {
    return NextResponse.json({ success: false, message: "Invalid or missing user ID" }, { status: 400 });
  }

  // Only retrieve friend request status when both the from_user_id and to_user_id have friend request status of Accepted. For instance when user B accepts friend request from user A, both of them have status of "Accepted"
  const res = await pool.query("SELECT friend_request_status FROM friend_requests WHERE (from_user_id = $1 AND to_user_id = $2) OR (from_user_id = $2 AND to_user_id = $1) LIMIT 1", [session.userId, to_user_id]);

  if (!res || res.rows.length === 0) {
    return NextResponse.json({ success: false, result: [] }, { status: 400 });
  }
  return NextResponse.json({ success: true, result: res.rows[0].friend_request_status }, { status: 200 });
}
