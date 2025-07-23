"use server";
import { verifySession } from "@/app/_lib/session";

export async function GET() {
  try {
    const session = await verifySession();

    if (session) {
      return new Response(JSON.stringify({ authenticated: true, userId: session.userId }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } else {
      return new Response(
        JSON.stringify({
          authenticated: false,
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  } catch (error) {
    console.error("Session check failed:", error);
    return new Response(
      JSON.stringify({
        authenticated: false,
        error: "Session check failed",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
