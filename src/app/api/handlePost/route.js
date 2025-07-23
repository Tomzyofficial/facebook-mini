"use server";

import { pool } from "@/app/_lib/db";
import { verifySession } from "@/app/_lib/session";

export async function POST(req) {
  const session = await verifySession();

  // If no user session, return new response with a 401 status
  if (!session) {
    return new Response(JSON.stringify({ authenticated: false, message: "No authorization" }), { status: 401 });
  }

  try {
    const [fetchUser] = await pool.execute("SELECT * FROM users WHERE id = ?", [session.userId]);

    // If no user with the session userId return no user found
    if (fetchUser.length < 1) {
      console.log("No user found for this account");
      return new Response(JSON.stringify({ user: null, message: "User not found" }), { status: 401 });
    }

    const body = await req.json();
    const { postText } = body;

    if (postText == "") return new Response(JSON.stringify({ success: false, message: "post unsuccessful" }), { status: 401 });

    // Insert into the database
    const [insertPost] = await pool.execute("INSERT INTO posts (post_text, user_acct) VALUES (?,?)", [postText, session.userId]);

    if (insertPost) {
      console.log("Post successful");
      return new Response(JSON.stringify({ success: true, message: "Post successful" }), { status: 200 });
    } else {
      console.log("Post unsuccessful");
      return new Response(JSON.stringify({ success: false, message: "Post unsuccessful" }), { status: 401 });
    }
  } catch (error) {
    console.log("Post unsuccessful");
    return new Response(JSON.stringify({ success: false, message: "Post unsuccesful" }), { status: 401 });
  }
}
