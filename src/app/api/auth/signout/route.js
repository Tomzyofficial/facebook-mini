import { deleteSession } from "@/app/_lib/session";
import { redirect } from "next/navigation";

export async function signout() {
  try {
    const destroySession = await deleteSession();

    if (destroySession) {
      // On sign out, delete session cookie and return to sign in page
      redirect("/");
      return new Response(
        JSON.stringify({
          success: true,
          message: "Logged out successfully",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  } catch (error) {
    console.error("Logout failed:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Logout failed",
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
