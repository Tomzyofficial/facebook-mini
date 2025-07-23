"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import PersonIcon from "@mui/icons-material/Person";

export default function ProfileImageTest() {
  const [imageSrc, setImageSrc] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Simulate getting user ID (replace with your actual session logic)
    setUserId("test-user-123");

    // Load existing profile image
    loadProfileImage();
  }, []);

  const loadProfileImage = async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/get-profile-image?userId=${userId}`);
      const data = await response.json();

      if (data?.imageUrl) {
        setImageSrc(data.imageUrl);
        setMessage("Profile image loaded successfully");
      } else {
        setMessage("No profile image found");
      }
    } catch (error) {
      console.error("Error loading profile image:", error);
      setMessage("Error loading profile image");
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("File size must be less than 5MB");
      return;
    }

    try {
      setIsUploading(true);
      setMessage("Uploading...");

      // Show preview
      const reader = new FileReader();
      reader.onload = function () {
        setImageSrc(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const formData = new FormData();
      formData.append("image", file);
      formData.append("userId", userId);

      const res = await fetch("/api/upload-profile-image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();
      if (data?.imageUrl) {
        setImageSrc(data.imageUrl);
        setMessage("Upload successful!");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Profile Image Test</h2>

      <div className="mb-4">
        <div className="relative w-32 h-32 mx-auto mb-4">
          {imageSrc ? (
            <Image src={imageSrc} alt="Profile" width={128} height={128} className="rounded-full object-cover" />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center">
              <PersonIcon sx={{ fontSize: "64px", color: "gray" }} />
            </div>
          )}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
              <div className="text-white text-sm">Uploading...</div>
            </div>
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">User ID: {userId || "Loading..."}</p>
        <p className="text-sm text-gray-600">{message}</p>
      </div>

      <button onClick={loadProfileImage} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Reload Profile Image
      </button>
    </div>
  );
}
