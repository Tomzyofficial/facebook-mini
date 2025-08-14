"use server";

import { NextResponse } from "next/server";

import pool from "@/app/_lib/db";
import { verifySession } from "@/app/_lib/session";

import Pusher from "pusher";

// Pusher connection
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

export async function POST(req) {
  const session = await verifySession();

  // If no user session, return new response with a 401 status
  if (!session || !session.userId) {
    return NextResponse.json({ authenticated: false, message: "No authorization" }, { status: 401 });
  }

  try {
    const fetchUser = await pool.query("SELECT * FROM users WHERE id = $1", [session.userId]);

    // If no user with the session userId return no user found
    if (fetchUser.rows.length < 1) {
      console.log("No user found for this account");
      return NextResponse.json({ user: null, message: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { postText } = body;

    if (!postText || postText.trim() == "") return NextResponse.json({ success: false, message: "post unsuccessful" }, { status: 400 });

    const insertResult = await pool.query("INSERT INTO public.posts (post_text, user_acct) VALUES ($1, $2) RETURNING id", [postText, session.userId]);

    const newPost = await pool.query("SELECT p.post_text, p.created_at, u.fname, u.lname, u.current_profile_image FROM public.posts AS p JOIN public.users AS u ON p.user_acct = u.id WHERE p.id = $1", [insertResult.rows[0].id]);

    await pusher.trigger("posts-channel", "new-post", newPost.rows[0]);

    return NextResponse.json({ success: true, message: "Post successful", result: newPost.rows[0] }, { status: 200 });
  } catch (error) {
    console.error("Post unsuccessful", error);
    return NextResponse.json({ success: false, message: "Post unsuccesful" }, { status: 400 });
  }
}
