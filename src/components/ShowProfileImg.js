"use client";

import { useState, useEffect, useCallback } from "react";
import { verifySession } from "@/app/_lib/session";
import Image from "next/image";

export function ShowProfileImg({ fallbackImage, fallbackAlt, width, height, className, refreshTrigger }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [userId, setUserId] = useState(null);
  const [hasCustomImage, setHasCustomImage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfileImage = useCallback(async () => {
    try {
      setIsLoading(true);
      const session = await verifySession();

      if (session?.authenticated && session?.userId) {
        setUserId(session.userId);

        // Load image from DB using session.userId directly
        const imgRes = await fetch(`/api/get-profile-image?userId=${session.userId}`);

        if (!imgRes.ok) {
          setImageSrc(null);
          setHasCustomImage(false);
          throw new Error(`Failed to fetch profile image: ${imgRes.status}`);
        }

        const imgData = await imgRes.json();
        if (imgData.imageUrl) {
          setImageSrc(imgData.imageUrl);
          setHasCustomImage(true);
        } else {
          setHasCustomImage(false);
          setImageSrc(null);
        }
      } else {
        setHasCustomImage(false);
        setImageSrc(null);
      }
    } catch (error) {
      console.error("Session check failed:", error);
      setImageSrc(null);
      setHasCustomImage(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfileImage();
  }, [fetchUserProfileImage, refreshTrigger]);

  // Show loading state
  if (isLoading) {
    return <div className={`${className} bg-gray-200 animate-pulse`} style={{ width, height }} />;
  }

  // Return the custom image if available
  if (imageSrc && hasCustomImage) {
    return <Image loading="lazy" src={imageSrc} alt="User profile image" width={width} height={height} className={className} />;
  }

  // Return fallback image if provided
  if (fallbackImage) {
    return <Image loading="lazy" src={fallbackImage} alt={fallbackAlt || "User avatar"} width={width} height={height} className={className} />;
  }

  // Return a placeholder if no fallback is provided
  return <div className={`${className} bg-gray-300`} style={{ width, height }} />;
}
