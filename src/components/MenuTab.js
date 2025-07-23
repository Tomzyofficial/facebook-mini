import SettingsSharp from "@mui/icons-material/SettingsSharp";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreSharpIcon from "@mui/icons-material/ExpandMore";
import AddSharpIcon from "@mui/icons-material/AddSharp";
import GroupsSharpIcon from "@mui/icons-material/GroupsSharp";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded";
import MovieRoundedIcon from "@mui/icons-material/MovieRounded";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import DirectionsBoatFilledRoundedIcon from "@mui/icons-material/DirectionsBoatFilledRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import { signout } from "@/app/api/auth/signout/route";
import { ShowProfileImg } from "@/components/ShowProfileImg";

export function MenuTab({ gender, fname, lname }) {
  const menuTabs = [
    { icon: <GroupsSharpIcon sx={{ color: "white", backgroundColor: "#3776ff", padding: "3px", borderRadius: "50%" }} />, label: "Groups", id: 1 },
    { icon: <AccessTimeOutlinedIcon sx={{ color: "#3776ff" }} />, label: "Memories", id: 2 },
    { icon: <BookmarkRoundedIcon sx={{ color: "purple" }} />, label: "Saved", id: 3 },
    { icon: <MovieRoundedIcon sx={{ color: "rgb(252, 185, 61)" }} />, label: "Reels", id: 4 },
    { icon: <StorefrontOutlinedIcon sx={{ color: "#3776ff" }} />, label: "Marketplace", id: 5 },
    { icon: <GroupRoundedIcon sx={{ color: "#3776ff", fontSize: "25px" }} />, label: "Friends", id: 6 },
    { icon: <DirectionsBoatFilledRoundedIcon sx={{ color: "#3776ff" }} />, label: "Feeds", id: 7 },
    { icon: <FavoriteRoundedIcon sx={{ color: "rgb(255, 69, 0)", fontSize: "25px" }} />, label: "Dating", id: 8 },
  ];

  return (
    <div className="top-0 left-0 fixed overflow-y-auto pb-4 h-[87vh] w-full bg-[var(--background)] text-[var(--foreground)]">
      <div className="m-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">Menu</h1>
          <div className="flex justify-between gap-4">
            <span>
              <SettingsSharp sx={{ fontSize: "25px", backgroundColor: "#ccc", borderRadius: "50%", padding: "5px" }} />
            </span>
            <span>
              <SearchIcon sx={{ fontSize: "25px", backgroundColor: "#ccc", borderRadius: "50%", padding: "5px" }} />
            </span>
          </div>
        </div>

        <div className="bg-[var(--white-color)] my-4 shadow-sm rounded-lg divide-y divide-zinc-200">
          <div className="p-4 flex justify-between items-center">
            <figure className="flex items-center gap-3">
              {/* Show profile image if there's one, else show the fallback avatar icon */}
              <ShowProfileImg fallbackImage={`/images/user_icon.svg`} fallbackAlt={`${gender.gender} Avatar`} width={30} height={30} className="rounded-full h-[33px] w-[33px]" />
              <figcaption>
                {fname.fname.charAt(0).toUpperCase() + fname.fname.slice(1)} {lname.lname.charAt(0).toUpperCase() + lname.lname.slice(1)}
              </figcaption>
            </figure>
            <span className="bg-[#ddd] rounded-full">
              <ExpandMoreSharpIcon />
            </span>
          </div>

          <div className="flex items-center gap-3 px-4 py-2">
            <AddSharpIcon sx={{ fontSize: "25px", backgroundColor: "gray", color: "white", borderRadius: "50%", padding: "5px" }} />
            <span>
              <p>Create new profile or page</p>
              <small>Switch between profiles with one login.</small>
            </span>
          </div>
        </div>

        <div>
          <h2>Your shortcuts</h2>
          <div className="grid grid-cols-2 gap-4">
            {menuTabs.map((tab) => (
              <div key={tab.id} className="bg-[var(--white-color)] shadow-sm rounded-lg flex flex-col p-2">
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </div>
            ))}
          </div>
          <button className="cursor-pointer my-4 w-full h-full bg-[#ddd] p-2 rounded-lg" type="submit" onClick={signout}>
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
