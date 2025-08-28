import { deleteSession } from "@/app/_lib/session";
import { redirect } from "next/navigation";

export async function signout() {
  try {
    const destroySession = await deleteSession();

    if (destroySession) {
      redirect("/");
    }
  } catch (error) {
    console.error("Logout failed:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Logout failed",
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
