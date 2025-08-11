import { getUserProfileImage } from "@/app/_lib/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return;
    }

    const user = await getUserProfileImage(userId);

    // if (!user || !user.current_profile_image) {
    //   return Response.json({ imageUrl: null }, { status: 400 });
    // }

    return Response.json({ imageUrl: user.current_profile_image }, { status: 200 });
  } catch (error) {
    // console.error("Error getting profile image:", error);
    return Response.json({ imageUrl: null, error: "Failed to get profile image" }, { status: 500 });
  }
}
