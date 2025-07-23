import { pool } from "@/app/_lib/db";
import bcrypt from "bcryptjs";
import { createSession } from "@/app/_lib/session";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // check if user exists
    const [existingUser] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);

    if (existingUser.length === 0) {
      // Return a response to the user if user is not found
      console.log("User not found");
      return new Response(JSON.stringify({ success: false, error: "User not found" }), { status: 400 });
    }

    // check if password is correct by comparing user inputted password with the password on the database
    const isPasswordCorrect = await bcrypt.compare(password, existingUser[0].pword);

    if (!isPasswordCorrect) {
      // Return a response to the user if password is incorrect
      console.log("Incorrect email or password");
      return new Response(JSON.stringify({ success: false, error: "Incorrect email or password" }), { status: 400 });
    }

    // create session
    await createSession(existingUser[0].id);

    // Return a response to the user on successful signin
    return new Response(JSON.stringify({ success: true, message: "Signin successful" }), { status: 200 });
  } catch (error) {
    // Return a response to the user if there is a server error
    console.log("Internal server error", error);
    return new Response(JSON.stringify({ success: false, error: "Internal server error. Try again." }), { status: 500 });
  }
}
