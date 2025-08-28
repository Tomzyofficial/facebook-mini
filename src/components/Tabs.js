"use client";
/*************** MUI ******************/
import { HomeRounded } from "@mui/icons-material";
import OndemandVideoRoundedIcon from "@mui/icons-material/OndemandVideoRounded";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
/*************** React Hooks ******************/
import { useState } from "react";
/*************** Code Imports ******************/

// Tabs component
// This component is used to display the footer tabs of the user profile page
// It contains the icons for the different tabs and the labels for the tabs
// It also contains the functionality to handle the tab clicks
// It also contains the functionality to handle the active tab
// It also contains the functionality to handle the inactive tab

export function Tab() {
  const [activeTab, setActiveTab] = useState("home");

  const tabs = [
    { icon: <HomeRounded />, label: "home" },
    { icon: <OndemandVideoRoundedIcon />, label: "video" },
    { icon: <PeopleAltOutlinedIcon />, label: "friends" },
    { icon: <StorefrontOutlinedIcon />, label: "marketplace" },
    { icon: <NotificationsNoneOutlinedIcon />, label: "notification" },
    { icon: <MenuOutlinedIcon />, label: "menu" },
  ];

  // Handle tab click
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    window.location.hash = tab;
  };

  return (
    <>
      <main className="fixed bottom-0 left-0 right-0 bg-[var(--background)] border-t border-[var(--border)] py-4 px-2 md:px-4 text-xs">
        <div className="flex items-center justify-between">
          {tabs.map((tab) => (
            <div className={`flex flex-col items-center ${activeTab === tab.label ? "text-[var(--secondary)]" : "text-[var(--foreground)] hover:text-[var(--secondary)]"} cursor-pointer `} key={tab.label} onClick={() => handleTabClick(tab.label)}>
              {tab.icon}
              <span className="text-[10px]">{tab.label.charAt(0).toUpperCase() + tab.label.slice(1)}</span>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
