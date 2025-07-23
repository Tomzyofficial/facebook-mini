import { getUserProfileImage } from "@/app/_lib/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return Response.json({ imageUrl: null, error: "User ID is required" }, { status: 400 });
    }

    const user = await getUserProfileImage(userId);

    if (!user || !user.current_profile_image) {
      return Response.json({ imageUrl: null });
    }

    return Response.json({ imageUrl: user.current_profile_image });
  } catch (error) {
    console.error("Error getting profile image:", error);
    return Response.json({ imageUrl: null, error: "Failed to get profile image" }, { status: 500 });
  }
}
