"use client";
/*************** MUI ***************/
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddsharpIcon from "@mui/icons-material/AddSharp";
import CreateIcon from "@mui/icons-material/Create";
import SearchIcon from "@mui/icons-material/Search";
import PanoramaIcon from "@mui/icons-material/Panorama";
import PersonIcon from "@mui/icons-material/Person";
/*************** Code Imports ***************/
import { verifySession } from "@/app/_lib/session";
import Image from "next/image";
/*************** React ***************/
import { useEffect, useRef, useState } from "react";

export function Profile({ onImageUpdate }) {
  const inputRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Get profile image from the database on component mount
  useEffect(() => {
    async function GetProfileImage() {
      try {
        setIsLoading(true);
        const session = await verifySession();

        if (session?.authenticated && session?.userId) {
          setUserId(session.userId);

          // Load image from DB
          const imgRes = await fetch(`/api/get-profile-image?userId=${session.userId}`);
          const imgData = await imgRes.json();

          if (imgData?.imageUrl) {
            setImageSrc(imgData.imageUrl);
          }
        }
      } catch (error) {
        console.error("Session check failed:", error);
        return;
      } finally {
        setIsLoading(false);
      }
    }

    GetProfileImage();

    // Fetch logged in user and return the data
    async function FetchLoggedInUser() {
      try {
        const res = await fetch("/api/fetchLoggedInUser");

        const data = await res.json();
        if (data.user) {
          setLoggedInUser(data.user);
        }
      } catch (err) {
        console.error("Failed to fetch logged in user:", err);
      }
    }
    FetchLoggedInUser();
  }, []);

  // Profile image upload handler
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    try {
      setIsUploading(true);

      // Show preview immediately
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
        // Trigger refresh of all ShowProfileImg components
        setRefreshTrigger((prev) => prev + 1);
        // Notify parent component about the image update
        if (onImageUpdate) {
          onImageUpdate(data.imageUrl);
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image. Please try again.");
      // Revert to previous image if available
      if (imageSrc && !imageSrc.startsWith("data:")) {
        // Keep the previous image if it was from server
        setImageSrc(imageSrc);
      } else {
        setImageSrc(null);
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Handle avatar click
  const handleAvatarClick = () => {
    if (!isUploading) {
      inputRef.current?.click();
    }
  };

  return (
    <section className="top-0 left-0 fixed overflow-y-auto h-full w-full bg-[var(--background)]">
      <section className="mb-14 relative bg-[#003049] min-h-40 rounded-t rounded-t-10 text-(--white-color)">
        <div className="flex justify-between items-center pt-4">
          <span>
            <ChevronLeftIcon sx={{ fontSize: "30px" }} />
          </span>
          <span className="flex gap-2">
            <CreateIcon sx={{ fontSize: "30px" }} />
            <SearchIcon sx={{ fontSize: "30px" }} />
          </span>
        </div>

        <div className="flex justify-between translate-y-12 items-center text-(--white-color) px-2">
          <span onClick={handleAvatarClick} className={`flex justify-center items-center relative bg-[rgb(0.8,0.8,0.8)] w-26 h-26 rounded-full cursor-pointer ${isUploading ? "opacity-50" : ""}`} id="imageParent">
            {imageSrc ? <Image src={imageSrc} alt="User Profile image" width={100} height={100} className="rounded-full h-26 w-26" /> : <PersonIcon sx={{ fontSize: "100px" }} />}

            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                <div className="text-(--white-color) text-sm">Uploading...</div>
              </div>
            )}
          </span>

          <input type="file" accept="image/*" name="image" className="hidden" ref={inputRef} onChange={handleFileChange} />
          <span>
            <PanoramaIcon />
          </span>
        </div>
      </section>

      <section className="p-2">
        <div>
          {loggedInUser.fname ? loggedInUser.fname.charAt(0).toUpperCase() + loggedInUser.fname.slice(1) : ""} {loggedInUser.lname ? loggedInUser.lname.charAt(0).toUpperCase() + loggedInUser.lname.slice(1) : ""}
          <span>
            <ExpandMoreIcon />
          </span>
        </div>

        <div className="flex justify-between text-(--white-color) gap-2 font-bold my-4">
          <button className="bg-[var(--secondary-dim)] flex-1 p-2 rounded-lg ">
            <span>
              <AddsharpIcon />
            </span>
            Add to story
          </button>
          <button className="bg-[var(--foreground)] flex-1 rounded-lg">
            <span>
              <CreateIcon />
            </span>
            Edit profile
          </button>
          <button className="bg-[var(--foreground)] flex-0  py-2 px-4 rounded-lg">...</button>
        </div>
      </section>
    </section>
  );
}
