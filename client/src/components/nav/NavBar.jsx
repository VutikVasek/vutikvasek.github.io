import NavLink from "./NavLink";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "react-router-dom";

import { AiFillHome, AiOutlineHome } from "react-icons/ai";
import { IoLogIn, IoLogInOutline, IoSearch, IoSearchOutline } from "react-icons/io5";
import { MdCreate, MdOutlineCreate } from "react-icons/md";
import { IoMdNotifications, IoMdNotificationsOutline } from "react-icons/io";
import { RiUser3Fill, RiUser3Line, RiUserAddFill, RiUserAddLine } from "react-icons/ri";
import ProfilePicture from "../media/ProfilePicture";

export default function NavBar({}) {
  const { isLoggedIn, user, id } = useAuth();
  const profileURL = `/u/${encodeURIComponent(user)}`;

  const location = useLocation();
  const pathname = location.pathname.split('/')[1] || "feed";
  const notifications = pathname === "notifications" || location.pathname === "/account/notification-settings";
  const profile = (location.pathname.split('/').slice(0,3).join('/')) === profileURL;

  return (
  <nav className=" p-5 shadow-lg flex flex-col h-screen fixed gap-6 max-w-[calc(25%-4rem)]">
    <h1 className="text-2xl font-bold flex gap-4 items-center">
      <img src="/assets/Logo.svg" alt="LOGO" className='h-8' />
      VUTINK
    </h1>
    <div className="panel flex flex-col items-middle gap-6 whitespace-pre-wrap max-w-full">
      <NavLink to="/" text={"Feed"} icon={pathname === "feed" ? <AiFillHome /> : <AiOutlineHome />} />
      <NavLink to="/search" text={"Search"} icon={pathname === "search" ? <IoSearch /> : <IoSearchOutline />} />
      {isLoggedIn ? (
        <>
        <NavLink to="/post" text={"New Post"} icon={pathname === "post" ? <MdCreate /> : <MdOutlineCreate />} />
        <NavLink to="/notifications" text={"Notifications"} icon={notifications ? <IoMdNotifications /> : <IoMdNotificationsOutline />} />
        <NavLink to={profileURL} text={"Profile"} icon={profile ? <RiUser3Fill /> : <RiUser3Line />} />
        <NavLink to="/account" title={"Account"} text={`${user}`} icon={<ProfilePicture pfp={id} />} />
        </>
      ) : (
        <>
        <NavLink to="/login" text={"Login"} icon={pathname === "login" ? <IoLogIn /> : <IoLogInOutline />} />
        <NavLink to="/signup" text={"Signup"} icon={pathname === "signup" ? <RiUserAddFill /> : <RiUserAddLine />} />
        </>
      )}
    </div>
  </nav>
  )
}