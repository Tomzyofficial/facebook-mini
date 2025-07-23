import { updateUserImage, getUserProfileImage } from "@/app/_lib/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    // Test getting user profile image
    const user = await getUserProfileImage(userId);

    return Response.json({
      success: true,
      user,
      message: "Profile image functions are working correctly",
    });
  } catch (error) {
    console.error("Test error:", error);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const { userId, imagePath } = await req.json();

    if (!userId || !imagePath) {
      return Response.json({ error: "User ID and image path are required" }, { status: 400 });
    }

    // Test updating user image
    const updatedImagePath = await updateUserImage(userId, imagePath);

    // Get the updated user data
    const user = await getUserProfileImage(userId);

    return Response.json({
      success: true,
      updatedImagePath,
      user,
      message: "Profile image updated successfully",
    });
  } catch (error) {
    console.error("Test error:", error);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
