"use client";
/********************* MUI **********************/
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CreateIcon from "@mui/icons-material/Create";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import PersonIcon from "@mui/icons-material/Person";
/********************* React Hooks **********************/
import { useEffect, useState } from "react";
/********************* Code Imports **********************/
import Image from "next/image";

export function OthersProfile() {
  const [otherUsers, setOtherUsers] = useState([]);
  useEffect(() => {
    const fetchOthers = async () => {
      const fetchResult = await fetch("/api/fetchOtherUsers", {
        method: "GET",
        headers: {
          "content-Type": "application/json",
        },
      });
      const res = await fetchResult.json();

      if (res.others) {
        setOtherUsers(res.others);
      } else {
        console.log("Error occurred while getting other user profile");
        setOtherUsers([]);
      }
    };
    fetchOthers();
  }, []);

  return (
    <main className="top-0 left-0 z-2 fixed overflow-y-auto h-[88.3%] w-full bg-[var(--background)]">
      <div className="relative bg-[url(/images/profile-img.webp)] bg-cover object-center bg-center bg-no-repeat min-h-30 rounded-t rounded-t-10 text-white">
        <div className="flex justify-between items-center pt-4">
          <span>
            <ChevronLeftIcon sx={{ fontSize: "30px" }} />
          </span>
          <span>
            <SearchIcon sx={{ fontSize: "30px" }} />
          </span>
        </div>

        <div className=" translate-y-30 px-2">
          {otherUsers && otherUsers.length > 0 ? (
            <div>
              {otherUsers[0].current_profile_image ? (
                <Image loading="lazy" src={otherUsers[0].current_profile_image} alt="User Profile Image" width={100} height={100} className="rounded-full h-26 w-26" />
              ) : (
                <span className="flex justify-center items-center relative bg-[rgb(0.8,0.8,0.8)] w-26 h-26 rounded-full cursor-pointer">
                  <PersonIcon sx={{ fontSize: "100px" }} />
                </span>
              )}

              <div className="text-black">
                {otherUsers[0].fname ? otherUsers[0].fname.charAt(0).toUpperCase() + otherUsers[0].fname.slice(1) : ""} {otherUsers[0].lname ? otherUsers[0].lname.charAt(0).toUpperCase() + otherUsers[0].lname.slice(1) : ""}
                <span>
                  <ExpandMoreIcon />
                </span>
              </div>

              <div className="flex justify-between gap-2 font-bold my-4">
                <button className="bg-[var(--secondary-dim)] flex-1 items-center p-2 rounded-lg ">
                  <span>
                    <PersonAddAlt1Icon sx={{ fontSize: "11px" }} />
                  </span>
                  Add friend
                </button>
                <button className="bg-[var(--foreground)] flex-1 rounded-lg">
                  <span>
                    <CreateIcon />
                  </span>
                  Send message
                </button>
                <button className="bg-[var(--foreground)] flex-0  py-2 px-4 rounded-lg">...</button>
              </div>
            </div>
          ) : (
            <span className="flex justify-center items-center relative bg-[rgb(0.8,0.8,0.8)] w-26 h-26 rounded-full cursor-pointer">
              <PersonIcon sx={{ fontSize: "100px" }} />
            </span>
          )}
        </div>
      </div>
    </main>
  );
}
