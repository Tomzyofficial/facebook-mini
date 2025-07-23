"use client";
import AddsharpIcon from "@mui/icons-material/AddSharp";
import SearchIcon from "@mui/icons-material/Search";
import PanoramaIcon from "@mui/icons-material/Panorama";
import Image from "next/image";
import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { Tab } from "@/components/Tabs";
import { Profile } from "@/components/Profile";
import styles from "@/app/styles/styles.module.css";

import { ShowProfileImg } from "./ShowProfileImg";
// import { verifySession } from "@/app/_lib/session";

export function UserProfile({ gender, fname, lname }) {
  const [activeTab, setActiveTab] = useState("");
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  // const [imageSrc, setImageSrc] = useState(null);
  // const [userId, setUserId] = useState(null);
  const [formData, setFormData] = useState({
    postText: "",
  });

  // Handle post change
  function handlePostTextChange(e) {
    setFormData({ [e.target.name]: e.target.value });
  }

  // Handle post submission
  const handlePostSubmit = async (e) => {
    setIsSubmitting(true);
    e.preventDefault();

    // Fetch handlepost POST from API. This component handles the post text submission
    const response = await fetch("/api/handlePost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    try {
      if (!data.success) {
        setIsSubmitting(false);
      }
      setIsSubmitting(true);
      setIsModalOpen(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    // Fetch other users from the database
    async function fetchOtherUsers() {
      try {
        const res = await fetch("/api/fetchOtherUsers", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        // Assign the data results to the users state
        setUsers(data.others);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    }
    fetchOtherUsers();

    // Load user profile image from database
    /*   const fetchUserProfileImage = async () => {
      try {
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
      }
    };
    fetchUserProfileImage(); */

    // Reload the hash on mount and when it changes and preserve active tab url
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash) setActiveTab(hash);
    };

    // Set initial tab from hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);

    // Cleanup
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  // Handle tab click
  function handleTabClick(tab) {
    setActiveTab(tab);
    window.location.hash = tab;
  }

  function handleSwitchTab() {
    switch (activeTab) {
      case "profile":
        return (
          <Profile
            gender={gender}
            fname={fname}
            lname={lname}
            onImageUpdate={(imageUrl) => {
              // Trigger refresh of all ShowProfileImg components
              setRefreshTrigger((prev) => prev + 1);
            }}
          />
        );
    }
  }

  return (
    <>
      <header>
        <nav className="flex justify-between items-center p-2">
          <div className="logo">
            <h2 href="/" className="text-[var(--secondary)] font-bold text-2xl">
              facebook
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <AddsharpIcon sx={{ fontSize: "35px", backgroundColor: "#ccc", borderRadius: "50%", padding: "8px" }} />
            <div>
              <SearchIcon sx={{ fontSize: "35px", backgroundColor: "#ccc", borderRadius: "50%", padding: "8px" }} />
            </div>
            <div className="bg-[#ccc] rounded-full p-[8px]">
              <Image src="/images/facebook-messenger.svg" alt="Facebook messenger" width={20} height={20} style={{ Width: "100%", maxHeight: "100%" }} />
            </div>
          </div>
        </nav>

        <div className="flex items-center justify-between my-4 p-2 border-b border-gray-400">
          <div className="flex items-center w-full">
            {/* This element is responsible for showing the user profile */}
            <span onClick={() => handleTabClick("profile")}>
              <ShowProfileImg fallbackImage={`/images/user_icon.svg`} fallbackAlt={`${gender.gender} Avatar`} width={25} height={25} className="rounded-full h-[33px] w-[33px]" refreshTrigger={refreshTrigger} />
            </span>

            {/* This element is responsible for displaying the modal  */}
            <input type="text" name="name" autoComplete="off" onClick={() => setIsModalOpen(true)} placeholder="What's on your mind?" className="w-full py-4 px-2 outline-none" />
          </div>
          <span>
            <PanoramaIcon sx={{ fontSize: "30px" }} />
          </span>

          {/* Post text area modal. Modal function is receiving props - isOpen, onClose, onSubmit. Whenever the input above is clicked, it sets isModalOpen state to either true or false.  */}
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <div className="my-4">
              <form onSubmit={handlePostSubmit} aria-busy={isSubmitting}>
                <div className={styles.modalTop}>
                  <button onClick={() => setIsModalOpen(false)}>X</button>
                  <p>Create post</p>
                  <button type="submit" className={`${formData.postText == "" ? "disabled opacity-50 cursor-not-allowed" : ""} `} onSubmit={handlePostSubmit}>
                    Post
                  </button>
                </div>

                <figure className="flex items-center gap-4 py-4">
                  {/* If user had selected a profile image, show it else show the user icon  */}
                  <ShowProfileImg fallbackImage={`/images/user_icon.svg`} fallbackAlt={`${gender.gender} Avatar`} width={25} height={25} className="rounded-full h-[33px] w-[33px]" refreshTrigger={refreshTrigger} />
                  <figcaption>
                    {fname.fname.charAt(0).toUpperCase() + fname.fname.slice(1)} {lname.lname.charAt(0).toUpperCase() + lname.lname.slice(1)}
                  </figcaption>
                </figure>

                <textarea
                  name="postText"
                  value={formData.postText}
                  onChange={handlePostTextChange}
                  cols="80"
                  rows="5"
                  style={{ width: "100%", height: "auto", border: "none", outline: "none", resize: "none", marginTop: "10px", color: "#1c2b33" }}
                  placeholder="What do you want to talk about?"
                ></textarea>
              </form>
            </div>
          </Modal>
        </div>
      </header>

      {/* This section displays the loggedIn user's profile picture and names. It also displays other users profile pictures and names from the database */}
      <section className={`p-2 overflow-x-auto ${styles.scrollbar_hide}`}>
        <div className="flex gap-4 min-w-max">
          <div className="relative bg-[var(--foreground)] text-white rounded-md flex-shrink-0 h-40">
            <figure>
              {/* If user had already selected a profile image before, load the image from the database else use gender prop to determine whether user is a male or female -- show avatar icon respectfully */}
              <ShowProfileImg
                fallbackImage={`/images/avatar_${gender.gender.toLowerCase() === "male" ? "man" : "woman"}.jpg`}
                fallbackAlt={`${gender.gender} avatar`}
                width={100}
                height={100}
                className="rounded-t-md h-25"
                refreshTrigger={refreshTrigger}
              />
              <figcaption className="text-sm flex flex-col items-center">
                <span className="absolute bottom-10">
                  <AddsharpIcon sx={{ fontSize: "30px", backgroundColor: "#3776ff", borderRadius: "50%", padding: "8px" }} />
                </span>
                <span className="text-xs absolute bottom-1">Create story</span>
              </figcaption>
            </figure>
          </div>

          {/* Loop other users from the users table and return their pictures and names */}
          <div className="flex gap-4 h-40">
            {users.map((user, index) => (
              <figure key={index} className="relative flex flex-col flex-shrink-0">
                {user.profile_pic ? (
                  <Image loading="lazy" src={user.profile_pic} alt="User profile image" width={100} height={100} className="rounded-t-md h-40" />
                ) : (
                  <Image loading="lazy" alt={`${user.gender} avatar`} src={`/images/avatar_${user.gender && user.gender.toLowerCase() === "male" ? "man" : "woman"}.jpg`} width={100} height={100} className="rounded-md h-40" />
                )}
                <figcaption className={`${user.profile_pic ? "text-[var(--white-color)]" : "text-[var(--foreground)]"} absolute bottom-2 items-center text-[10px] px-1`}>
                  {user.fname.charAt(0).toUpperCase() + user.fname.slice(1)} {user.lname.charAt(0).toUpperCase() + user.lname.slice(1)}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {handleSwitchTab()}
      {/* Received Tab function with props which are assigned to the parent function props */}
      <Tab gender={gender} fname={fname} lname={lname} />
    </>
  );
}
