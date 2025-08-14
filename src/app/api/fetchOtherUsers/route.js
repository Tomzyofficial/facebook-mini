"use server";
import { verifySession } from "@/app/_lib/session";
import pool from "@/app/_lib/db";

// This function fetches the list of other users that's not signed in and displays their pictutes and names
export async function GET() {
  const session = await verifySession();

  if (!session || !session.userId) {
    return new Response(JSON.stringify({ authenticated: false, message: "No authorization" }), { status: 401 });
  }

  try {
    const query = "SELECT * FROM public.users WHERE id != $1";
    const queryResult = await pool.query(query, [session.userId]);
    if (queryResult.rows.length > 0) {
      return new Response(JSON.stringify({ others: queryResult.rows }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ others: [] }), { status: 404 });
    }
  } catch (error) {
    console.error("Error fetching other users:", error);
    return new Response(JSON.stringify({ message: "Error fetching other users" }), { status: 500 });
  }
}
