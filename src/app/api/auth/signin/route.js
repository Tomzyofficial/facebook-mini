import pool from "@/app/_lib/db";
import bcrypt from "bcryptjs";
import { createSession } from "@/app/_lib/session";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Check if user exists
    const existingUserResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (existingUserResult.rows.length < 1) {
      console.log("User not found");
      return new Response(JSON.stringify({ success: false, error: "User not found" }), { status: 404 });
    }

    const user = existingUserResult.rows[0];

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(password, user.pword);

    if (!isPasswordCorrect) {
      console.log("Incorrect email or password");
      return new Response(JSON.stringify({ success: false, error: "Incorrect email or password" }), { status: 400 });
    }

    // Create session
    await createSession(user.id);

    return new Response(JSON.stringify({ success: true, message: "Sign in successful" }), { status: 200 });
  } catch (error) {
    console.log("Internal server error", error);
    return new Response(JSON.stringify({ success: false, error: "Internal server error. Try again." }), { status: 500 });
  }
}
