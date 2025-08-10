"use server";
import pool from "@/app/_lib/db";
import bcrypt from "bcryptjs";
import { createSession } from "@/app/_lib/session";

export async function POST(req) {
  try {
    const body = await req.json();
    const { fname, lname, dob, gender, email, password } = body;

    // Hash password (recommended)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user already exists
    const existingUserResult = await pool.query("SELECT * FROM public.users WHERE email = $1", [email]);

    if (existingUserResult.rows.length > 0) {
      console.log("Email address already exists");
      return new Response(JSON.stringify({ success: false, error: "Email address already exists", e: "email" }), { status: 400 });
    }

    // Check if the year part of the dob (from input type="date", e.g. "YYYY-MM-DD") is greater than 2025
    if (parseInt(String(dob).slice(0, 4), 10) > 2025) {
      return new Response(JSON.stringify({ success: false }), { status: 400 });
    }

    // Check if the year part of the dob (from input type="date", e.g. "YYYY-MM-DD") is less than 2007
    if (parseInt(String(dob).slice(0, 4), 10) < 2007) return new Response(JSON.stringify({ success: false }), { status: 400 });

    // Check for password
    if (!password || password.trim() === "") return new Response(JSON.stringify({ success: false, error: "Password is required.", e: "password" }), { status: 400 });

    // Insert into PostgreSQL
    const insertResult = await pool.query(
      `INSERT INTO public.users (fname, lname, dob, gender, email, pword) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [fname, lname, dob, gender, email, hashedPassword]
    );

    if (insertResult.rows.length > 0) {
      const userId = insertResult.rows[0].id;
      await createSession(userId);
      console.table(insertResult.rows[0]);
      return new Response(JSON.stringify({ success: true, message: "User created successfully" }), { status: 201 });
    } else {
      return new Response(JSON.stringify({ success: false, error: "Failed to create user" }), { status: 400 });
    }
  } catch (error) {
    console.error("Error in user creation:", error);
    return new Response(JSON.stringify({ success: false, error: "Internal server error. Try again." }), { status: 500 });
  }
}
