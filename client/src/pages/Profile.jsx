import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Feed from "../components/feed/Feed";
import FollowButton from "../components/profile/FollowButton";
import UserList from "../components/profile/UserList";
import Replies from "../components/profile/Replies";
import SmartLink from "../components/basic/SmartLink";
import ProfilePicture from "@/components/media/ProfilePicture";
import GroupList from "@/components/profile/GroupList";
import Tabs from "@/components/nav/Tabs";
import Lightbox from "yet-another-react-lightbox";
import { allowScroll, disableScroll } from "@/tools/document";
import { Helmet } from "react-helmet-async";
const API = import.meta.env.VITE_API_BASE_URL;
const MEDIA = import.meta.env.VITE_MEDIA_BASE_URL;

export default function Profile() {
  const { username, show } = useParams();
  const [userData, setUserData] = useState({});
  const [date, setDate] = useState('1846');
  const [deleted, setDeleted] = useState(false);
  const [openPfp, setOpenPfp] = useState(false);

  useEffect(() => {
    if (username == "<deleted>") {
      setUserData({username: "This account was deleted"});
      setDeleted(true);
      return;
    }
    fetch(`${API}/profile/user/${encodeURIComponent(username)}`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }})
      .then(res => res.json())
      .then(data => setUserData(data))
      .catch(err => console.log(err));
  }, [username]);

  useEffect(() => 
      setDate(new Date(userData.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
      }))
    , [userData]);

  useEffect(() => () => allowScroll(), []);

  if (!userData) return <h1 className="title">Loading...</h1>;
  if (deleted) return <h1 className="title">This account was deleted</h1>;

  const getText = () => {
    switch (show) {
      case "replies": return "Replies by ";
      case "followers": return "Followers of ";
      case "following": return "Followed by ";
      case "groups": return "Groups of ";
      default: return "";
    }
  }

  return (
    <>
      <Helmet>
        <title>{getText()}{username} - Vutink</title>
      </Helmet>
      <div className="flex flex-col mt-6">
        <div className="flex m-4 gap-8 items-end">
          <ProfilePicture pfp={userData.pfp} className="w-36 cursor-pointer" onClick={() => { setOpenPfp(true); disableScroll() }} />
          <div className="hidden">
            <Lightbox 
              slides={[{ src: `${MEDIA}/pfp/${encodeURIComponent(userData.pfp)}.jpeg` }]}
              open={openPfp}
              close={() => { setOpenPfp(false); allowScroll() }}
              index={0}
              controller={{closeOnPullUp: true, closeOnPullDown: true, closeOnBackdropClick: true}}
               />
          </div>
          <div>
            <p className="text-4xl font-semibold">{userData.username}</p>
            <p className="whitespace-pre-wrap mt-1">{userData.bio}</p>
            <p className="text-sm text-slate-300 mt-1">{userData.pfp ? "Since" : ""} {date}</p>
          </div>
          <div><FollowButton userData={userData} /></div>
        </div>
        <div className="flex gap-8 mt-2 mb-8 underline-offset-2 [&>*:hover]:underline">
          <SmartLink to={`/u/${encodeURIComponent(username)}/followers`} className="group/followers">
            {userData.followers} <span className="text-slate-400 group-hover/followers:text-white">{userData.followers === 1 ? "follower" : "followers"}</span>
          </SmartLink>
          <SmartLink to={`/u/${encodeURIComponent(username)}/following`} className="group/following">
            {userData.following} <span className="text-slate-400 group-hover/following:text-white">following</span>
          </SmartLink>
          <SmartLink to={`/u/${encodeURIComponent(username)}/groups`} className="group/groups">
            {userData.groups} <span className="text-slate-400 group-hover/groups:text-white">{userData.groups === 1 ? "group" : "groups"}</span>
          </SmartLink>
        </div>
      </div>
      {(show == "followers" || show == "following") && (
        <UserList url={`${API}/profile/user/${encodeURIComponent(username)}/${encodeURIComponent(show)}`} source={`/u/${encodeURIComponent(username)}`} />
      )}
      {show == "groups" && (
        <>
        {userData.itsme && 
          <div className="mb-4">
            <SmartLink to="/create-group" className="button">Create new group</SmartLink>
          </div>
        }
        <GroupList url={`${API}/profile/user/${encodeURIComponent(username)}/${encodeURIComponent(show)}`} source={`/u/${encodeURIComponent(username)}`} />
        </>
      )}
      {(!show || show == "replies") &&
      <Tabs selected={show || "posts"}>
        <SmartLink id="posts" to={"/u/" + encodeURIComponent(username)}>Posts</SmartLink>
        <SmartLink id="replies" to={`/u/${encodeURIComponent(username)}/replies`}>Replies</SmartLink>
      </Tabs>}
      {!show && (
        <div className="w-full">
          <Feed url={`${API}/profile/posts/${encodeURIComponent(username)}`} />
        </div>
      )}
      {show == "replies" && userData.pfp &&
        <div className="w-full">
          <Replies userData={userData} /> 
        </div>}
    </>
  );
}