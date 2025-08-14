import { NextResponse } from "next/server";

import pool from "@/app/_lib/db";
import { verifySession } from "@/app/_lib/session";

export async function GET() {
  const session = await verifySession();

  // If no user session, return new response with a 401 status
  if (!session || !session.userId) {
    return NextResponse.json({ authenticated: false, message: "No authorization" }, { status: 401 });
  }

  const retrieved = await pool.query("SELECT p.post_text, p.created_at, u.fname, u.lname, u.current_profile_image FROM public.posts AS p JOIN public.users AS u ON p.user_acct = u.id ORDER BY p.id DESC LIMIT 10");

  if (retrieved.rows.length > 0) {
    console.log(`Post successfully retrieved, ${retrieved.rows.length} posts`);

    // Return an array of posts (even if only one), to match frontend expectations
    return NextResponse.json(
      {
        success: true,
        message: "Post retrieved successfully",
        result: retrieved.rows,
      },
      { status: 200 }
    );
  } else {
    console.error("Couldn't get posts");
    return NextResponse.json(
      {
        success: false,
        message: "Post not retrieved",
        result: null,
      },
      { status: 400 }
    );
  }
}
