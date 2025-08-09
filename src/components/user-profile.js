"use client";
import Pusher from "pusher-js";
/*********** Mui material components ************/
import AddsharpIcon from "@mui/icons-material/AddSharp";
import SearchIcon from "@mui/icons-material/Search";
import PanoramaIcon from "@mui/icons-material/Panorama";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

/*********** React Hooks ***********/
import { useEffect, useState } from "react";

import Image from "next/image";
import Modal from "@/components/ui/Modal";
import { Tab } from "@/components/Tabs";
import { Profile } from "@/components/Profile";
import styles from "@/app/styles/styles.module.css";

import { ShowProfileImg } from "@/components/ShowProfileImg";

export function UserProfile() {
  const [activeTab, setActiveTab] = useState("");
  const [loggedInUser, setLoggedInUser] = useState({});
  const [otherUsers, setOtherUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSeachOpen, setIsSearchOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [retrievedPosts, setRetrievedPosts] = useState([]);

  const [formData, setFormData] = useState({
    postText: "",
  });

  useEffect(() => {
    // Fetch the API endpoint to fetch initial posts
    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/getPosts");
        const data = await res.json();
        if (res.ok && Array.isArray(data.result)) {
          setRetrievedPosts(data.result);
        }
      } catch (err) {
        console.error("Error fetching posts", err);
      }
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    // Use pusher to return newer posts
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });

    const channel = pusher.subscribe("posts-channel");
    channel.bind("new-post", (data) => {
      setRetrievedPosts((prev) => [data, ...prev]);
    });

    // Clean up
    return () => {
      pusher.unsubscribe("posts-channel");
      pusher.disconnect();
    };
  }, []);

  // Handle post change
  function handlePostTextChange(e) {
    setFormData({ [e.target.name]: e.target.value });
  }

  // Handle post submission
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Fetch handlepost POST from API. This component handles the post text submission

    try {
      const response = await fetch("/api/handlePost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSubmitting(true);
        setIsModalOpen(false);
        setFormData("");
      } else {
        setIsSubmitting(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    // Fetch Logged In user from the database
    async function fetchLoggedInUser() {
      try {
        const res = await fetch("/api/fetchLoggedInUser", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        if (data.user) {
          setLoggedInUser(data.user);
        }
      } catch (err) {
        console.error("Failed to fetch logged in user:", err);
      }
    }
    fetchLoggedInUser();

    // Fetch other users
    async function fetchOtherUsers() {
      try {
        const res = await fetch("/api/fetchOtherUsers", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        if (data.others) {
          // Assign the data results to the otherUsers state
          setOtherUsers(data.others);
          console.log("Fetched other users:", data.others);
        } else {
          console.error("No other users found");
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    }
    fetchOtherUsers();

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
            onImageUpdate={(imageUrl) => {
              // Trigger refresh of all ShowProfileImg components
              setRefreshTrigger((prev) => prev + 1);
            }}
          />
        );
    }
  }

  // This component handles users search function
  const [resultRows, setResultRows] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSearchFilter(e) {
    e.preventDefault();
    setIsLoading(true);

    // Get the value from the input field
    const formData = new FormData(e.target);
    const inputText = formData.get("inputText");

    try {
      const res = await fetch("/api/searchUserFilter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputText }),
      });

      const result = await res.json();

      if (res.ok && result.success && Array.isArray(result.res)) {
        setResultRows(result.res);
        setErrorMessage("");
      } else {
        // If there's an error, show the error message from result.res (or a fallback)
        setResultRows([]);
        setErrorMessage([result.res || "An error occurred"]);
      }
    } catch (error) {
      console.error("Error occurred while fetching", error.message);
      return new Response(JSON.stringify({ status: 500, res: `Internal error || ${error.message}` }, { status: 500 }));
    } finally {
      setIsLoading(false);
    }
  }

  // const handleInputChange = (e) => {
  //   setInputText({ ...inputText, [e.target.value]: [e.target.name] });
  // };

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
            <SearchIcon onClick={() => setIsSearchOpen(true)} sx={{ fontSize: "35px", backgroundColor: "#ccc", borderRadius: "50%", padding: "8px" }} />
            <div className="bg-[#ccc] rounded-full p-[8px]">
              <Image src="/images/facebook-messenger.svg" alt="Facebook messenger" width={20} height={20} style={{ Width: "100%", maxHeight: "100%" }} />
            </div>
          </div>
        </nav>

        {/* Start search modal here  */}
        <Modal isOpen={isSeachOpen} onClose={() => setIsSearchOpen(false)}>
          <div className="flex items-center gap-1">
            <ChevronLeftIcon onClick={() => setIsSearchOpen(false)} sx={{ fontSize: "40px" }} />
            <div className="relative w-full">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2" sx={{ color: "GrayText" }} />
              <form onSubmit={handleSearchFilter} aria-busy={isLoading}>
                <input type="text" name="inputText" placeholder="Search with Meta AI" className="bg-neutral-200 p-2 pl-10 rounded-lg outline-none border-none w-full" />
              </form>
            </div>
          </div>
          <div>
            {errorMessage ? (
              <p>{errorMessage}</p>
            ) : resultRows.length > 0 ? (
              <ul>
                {resultRows.map((row, idx) => (
                  <li key={idx}>
                    {row.fname ? row.fname.charAt(0).toUpperCase() + row.fname.slice(1) : ""} {row.lname ? row.lname.charAt(0).toUpperCase() + row.lname.slice(1) : ""}
                  </li>
                ))}
              </ul>
            ) : (
              ""
            )}
          </div>
        </Modal>
        {/* End search modal here */}

        <div className="flex items-center justify-between my-4 p-2 border-b-1 border-slate-100">
          <div className="flex items-center w-full">
            {/* This element is responsible for showing the user profile */}
            <span onClick={() => handleTabClick("profile")}>
              <ShowProfileImg fallbackImage={`/images/user_icon.svg`} fallbackAlt="Profile Image Avatar" width={25} height={25} className="rounded-full h-[33px] w-[33px]" refreshTrigger={refreshTrigger} />
            </span>

            {/* This element is responsible for displaying the post post modal section  */}
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
                  <button type="submit" className={`${formData.postText == "" ? "disabled opacity-50" : ""} cursor-pointer`} onSubmit={handlePostSubmit}>
                    Post
                  </button>
                </div>

                <figure className="flex items-center gap-4 py-4">
                  {/* If user had selected a profile image, show it else show the user icon  */}
                  <ShowProfileImg fallbackImage={`/images/user_icon.svg`} fallbackAlt="Profile Image Avatar" width={25} height={25} className="rounded-full h-[33px] w-[33px]" refreshTrigger={refreshTrigger} />
                  <figcaption>
                    {loggedInUser.fname ? loggedInUser.fname.charAt(0).toUpperCase() + loggedInUser.fname.slice(1) : ""} {loggedInUser.lname ? loggedInUser.lname.charAt(0).toUpperCase() + loggedInUser.lname.slice(1) : ""}
                  </figcaption>
                </figure>

                <textarea
                  name="postText"
                  value={formData.postText}
                  onChange={handlePostTextChange}
                  // cols="80"
                  // rows="5"
                  style={{ resize: "none" }}
                  className="dark:placeholder-(--white-color) dark:text-(--white-color) mt-3 h-60 border-none outline-none w-full"
                  placeholder="What do you want to talk about?"
                ></textarea>
              </form>
            </div>
          </Modal>
        </div>
      </header>

      {/* This section displays the loggedIn user's profile picture and names. It also displays other users profile pictures and names from the database */}
      <section className={`p-2 overflow-x-auto ${styles.scrollbar_hide}`}>
        <div className="flex gap-2 min-w-max">
          <div className="relative bg-[var(--foreground)] text-white rounded-md flex-shrink-0 h-38">
            <figure>
              {/* If user had already selected a profile image before, load the image from the database else use gender prop to determine whether user is a male or female -- show avatar icon respectfully */}
              <ShowProfileImg
                fallbackImage={`/images/avatar_${loggedInUser.gender === "Male" ? "man" : "woman"}.jpg`}
                fallbackAlt={`${loggedInUser.gender} Avatar`}
                width={100}
                height={100}
                className="rounded-t-md h-25"
                refreshTrigger={refreshTrigger}
              />
              <figcaption className="text-sm flex flex-col items-center">
                <span className="absolute bottom-9">
                  <AddsharpIcon sx={{ fontSize: "30px", backgroundColor: "#3776ff", borderRadius: "50%", padding: "8px" }} />
                </span>
                <span className="text-xs absolute bottom-1">Create story</span>
              </figcaption>
            </figure>
          </div>

          {/* Loop other users from the users table and return their pictures and names */}
          <div className="flex gap-2 h-38">
            {Array.isArray(otherUsers) &&
              otherUsers.map((user, index) => (
                <figure key={index} className="relative flex flex-col flex-shrink-0">
                  {user.current_profile_image ? (
                    <Image loading="lazy" src={user.current_profile_image} alt="User Profile Image" width={100} height={100} className="rounded-md h-38" />
                  ) : (
                    <Image loading="lazy" alt={`${user.gender} Avatar`} src={`/images/avatar_${user.gender.toLowerCase() === "male" ? "man" : "woman"}.jpg`} width={100} height={100} className="rounded-md h-38" />
                  )}
                  <figcaption className={`${user.current_profile_image ? "text-[var(--white-color)]" : "text-[var(--foreground)]"} absolute bottom-2 items-center text-[10px] px-1`}>
                    {user.fname ? user.fname.charAt(0).toUpperCase() + user.fname.slice(1) : ""} {user.lname ? user.lname.charAt(0).toUpperCase() + user.lname.slice(1) : ""}
                  </figcaption>
                </figure>
              ))}
          </div>
        </div>
      </section>

      <section className="mb-30">
        <div>
          {retrievedPosts.map((item) => (
            <div key={item.id} className="shadow-lg mt-1 p-5 bg-white border-t border-slate-100">
              <div className="flex items-center justify-between">
                <Image src="/images/avatar_man.jpg" width={30} height={30} className="rounded-full" alt="Profile avatar" />
                <small>{new Date(item.created_at).getMinutes()}m</small>
              </div>
              <div className="pt-10">
                <span>{item.post_text}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {handleSwitchTab()}
      {/* Call the Tab function to render active tab section */}
      <Tab />
    </>
  );
}
