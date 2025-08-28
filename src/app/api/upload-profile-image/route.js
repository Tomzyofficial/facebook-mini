import { updateUserImage } from "@/app/_lib/db";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_url: process.env.CLOUDINARY_URL,
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const userId = formData.get("userId");
    const file = formData.get("image");

    if (!userId || !file) {
      return new Response("Missing userId or image file", { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return new Response("Invalid file type. Only images are allowed.", { status: 403 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return new Response("File size must be less than 5MB", { status: 400 });
    }

    // arrayBuffer is a generic fixed-length binary container
    const bytes = await file.arrayBuffer();
    // Buffer is a special type of object in Node.js used to store binary data directly (like images, files) in memory
    // Buffer deal with binary streams from files, network sockets etc.
    const buffer = Buffer.from(bytes);

    // Wrap upload_stream in a Promise so it can use await
    const uploaded = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder: "profileUploads" }, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
      stream.end(buffer);
    });

    // Save Cloudinary URL to DB
    await updateUserImage(userId, uploaded.secure_url);

    return Response.json({ imageUrl: uploaded.secure_url });
  } catch (error) {
    console.error("Upload error:", error);
    return new Response("Upload failed", { status: 500 });
  }
}
