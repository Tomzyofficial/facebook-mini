"use server";
import { pool } from "@/app/_lib/db";
import bcrypt from "bcryptjs";
import { createSession } from "@/app/_lib/session";

export async function POST(req) {
  try {
    const body = await req.json();
    const { fname, lname, dob, gender, email, password } = body;

    // Hash password (recommended)
    const hashedPassword = await bcrypt.hash(password, 10);

    // check if user already exists
    const [existingUser] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      console.log("User already exists");
      return new Response(JSON.stringify({ success: false, message: "User already exists" }), { status: 400 });
    }

    // Insert into MySQL
    const [result] = await pool.execute("INSERT INTO users (fname, lname, dob, gender, email, pword) VALUES (?, ?, ?, ?, ?, ?)", [fname, lname, dob, gender, email, hashedPassword]);

    if (result) {
      await createSession(result.insertId);
      console.table(result);
      return new Response(JSON.stringify({ success: true, message: "User created successfully" }), { status: 201 });
    } else {
      return new Response(JSON.stringify({ success: false, message: "Failed to create user" }), { status: 500 });
    }
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: "Internal server error. Try again." }), { status: 500 });
  }
}
