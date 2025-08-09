import path from "path";
import fs from "fs/promises";
import { writeFile } from "fs/promises";
import { updateUserImage } from "@/app/_lib/db";

export async function POST(req) {
  try {
    // Use absolute path for upload directory
    const uploadDir = path.join(process.cwd(), "public", "profileUploads");

    // Ensure upload directory exists
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    const formData = await req.formData();
    const userId = formData.get("userId");
    const file = formData.get("image");

    if (!userId || !file) {
      return new Response("Missing userId or image file", { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return new Response("Invalid file type. Only images are allowed.", { status: 403 });
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return new Response("File size must be less than 5MB", { status: 400 });
    }

    // Generate unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename with timestamp
    const timestamp = Date.now();
    const originalName = file.name;
    const extension = path.extname(originalName);
    const filename = `${timestamp}_${Math.random().toString(36).substring(2)}${extension}`;
    const filepath = path.join(uploadDir, filename);

    // Save image path to DB
    const imagePath = `/profileUploads/${filename}`;
    const updatedImagePath = await updateUserImage(userId, imagePath);

    // Write file to disk
    await writeFile(filepath, buffer);

    console.log(`Profile image uploaded for user ${userId}: ${updatedImagePath}`);

    return Response.json({ imageUrl: updatedImagePath });
  } catch (error) {
    console.error("Upload error:", error);
    return new Response("Upload failed", { status: 500 });
  }
}
