"use server";
import { pool } from "@/app/_lib/db";
import { verifySession } from "@/app/_lib/session";
import { headers } from "next/headers";

// This component fetches the list of other users that's not signed in and displays their pictutes and names
export async function GET() {
  const session = await verifySession();

  if (!session) {
    return new Response(JSON.stringify({ authenticated: false, message: "No authorization" }), { status: 401 });
  }

  try {
    const query = "SELECT * FROM users LEFT JOIN users_profile_photos ON users.id = users_profile_photos.user_acct WHERE users.id != ?";
    const [rows] = await pool.query(query, [session.userId]);
    const otherUsers = rows;
    if (rows.length > 0) {
      return new Response(JSON.stringify({ authenticated: true, message: "Other users fetched successfully", others: otherUsers }), {
        status: 200,
        headers: { "Cache-Control": "public, max-age=0, s-maxage=30, stale-while-revalidate=60" },
      });
    } else {
      return new Response(JSON.stringify({ authenticated: false, message: "No other users found" }), { status: 404 });
    }
  } catch (error) {
    console.error("Error fetching other users:", error);
    return new Response(JSON.stringify({ authenticated: false, message: "Error fetching other users" }), { status: 500 });
  }
}
