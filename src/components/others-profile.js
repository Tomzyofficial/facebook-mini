"use client";
/********************* MUI **********************/
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
/********************* React  **********************/
import { useEffect, useState } from "react";
/********************* Code Imports **********************/
import Image from "next/image";
import { getLocalstorage, SetLocalStorage } from "@/components/Utils";

// This component is all about rendering other user's profile info from the search.
// When a user is returned and clicked this page becomes active to show their profile info
export function OthersProfile({ user }) {
  const [requestSent, setRequestSent] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);

  const [requestAccepted, setRequestAccepted] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  // On mount, check if request has been sent before and retain button state -> change from "add friend" to "cancel request"
  useEffect(() => {
    if (user?.id) {
      const existingRequest = getLocalstorage(`request_${user.id}`);
      if (existingRequest === "friend request sent") {
        setRequestSent(true);
      } else {
        setRequestSent(false);
      }
    }
  }, [user.id]);

  // Fetch session from checkSession API. This is important to determine which users are friends with each other
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/checkSession");
        const data = await res.json();
        if (data.authenticated) {
          setCurrentUserId(data.userId);
        }
      } catch (err) {
        console.error("Failed to load session", err);
        setCurrentUserId(null);
      }
    };
    fetchSession();
  }, []);

  // Handle sending friend request logic
  // The 'user' prop is used to send down data to the User-profile file.
  const handleFriendRequest = async () => {
    setRequestLoading(true);
    try {
      if (!requestSent) {
        const res = await fetch(`/api/friendRequest?to_user_id=${user.id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();

        if (!res.ok && !data.success) {
          setRequestSent(false);
          return;
        }

        // Using the localstorage enables the button 'Add friend' to have the "cancel request" when it is clicked
        SetLocalStorage(`request_${user.id}`, `friend request sent`);
        setRequestSent(true);
      } else {
        await fetch(`/api/friendRequest?to_user_id=${user.id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });
        localStorage.removeItem(`request_${user.id}`);
        setRequestSent(false);
      }
    } catch (error) {
      console.error("Error occurred with friend request: ", error);
    } finally {
      setRequestLoading(false);
    }
  };

  // This component fetches the GET API endpoint that checks if friend request has been accepted and and change the element from "not friends" to "friends" and hide the "Add friend or Cancel request" button
  useEffect(() => {
    const selectAcceptedRow = async () => {
      try {
        const res = await fetch(`/api/checkFriendRequestStatus?from_user_id=${currentUserId}&to_user_id=${user.id}`);
        if (!res.ok) {
          setRequestAccepted(null);
          return;
        }
        const data = await res.json();

        if (data.success) {
          setRequestAccepted(data.result);
        }
      } catch (err) {
        console.error("Error fetching friend requests: ", err);
        setRequestAccepted(null);
      }
    };
    selectAcceptedRow();
  }, [currentUserId, user.id]);

  return (
    <section className="top-0 left-0 fixed overflow-y-auto h-full w-full bg-[var(--background)]">
      <section className="mb-14 relative bg-[#003049] min-h-30 rounded-t rounded-t-10 text-white">
        <div className="flex justify-between items-center pt-4">
          <span>
            <ChevronLeftIcon sx={{ fontSize: "30px" }} />
          </span>
          <span>
            <SearchIcon sx={{ fontSize: "30px" }} />
          </span>
        </div>

        <div className="translate-y-12 px-2">
          {user.current_profile_image ? (
            <Image loading="lazy" src={user.current_profile_image} alt="User Profile Image" width={100} height={100} className="rounded-full h-26 w-26" />
          ) : (
            <span className="flex justify-center items-center relative bg-[rgb(0.8,0.8,0.8)] w-26 h-26 rounded-full cursor-pointer">
              <PersonIcon sx={{ fontSize: "100px" }} />
            </span>
          )}
        </div>
      </section>

      <section className="p-2">
        {user.fname ? user.fname.charAt(0).toUpperCase() + user.fname.slice(1) : ""} {user.lname ? user.lname.charAt(0).toUpperCase() + user.lname.slice(1) : ""}
        <span>
          <ExpandMoreIcon />
        </span>
        <div className="flex gap-2 font-bold my-4 text-(--white-color)">
          <button
            className={`bg-[var(--secondary-dim)] flex-1 flex items-center justify-center p-2 rounded-lg cursor-pointer ${requestLoading && "opacity-50 cursor-wait"} ${requestAccepted === "ACCEPTED" && "hidden"}`}
            onClick={handleFriendRequest}
            disabled={requestLoading}
          >
            <span>{requestSent ? "Cancel request" : "Add friend"}</span>
          </button>
          <button className="bg-[var(--foreground)] flex-1 rounded-lg">{requestAccepted === "ACCEPTED" ? "Friends" : "Not friends"}</button>
          <button className="bg-[var(--foreground)] flex-0  py-2 px-4 rounded-lg">...</button>
        </div>
      </section>
    </section>
  );
}
