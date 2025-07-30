import { useEffect, useState } from "react";
import { MdKeyboardArrowDown, MdNotificationsActive, MdNotificationsOff } from "react-icons/md";
import { RiUserUnfollowLine } from "react-icons/ri";
import SmartLink from "../basic/SmartLink";

const API = import.meta.env.VITE_API_BASE_URL;

export default function FollowButton({ userData, simple, logged }) {
  const [following, setFollowing] = useState(FollowType.silent);
  const [changingFollowing, setChangingFollowing] = useState(false);
  
  useEffect(() => {
    if (!simple) {
      if (!userData.logged) setFollowing(FollowType.login);
      else if (userData.itsme) setFollowing(FollowType.me);
      else if (!userData.logFollows) setFollowing(FollowType.follow);
      else if (userData.notify) setFollowing(FollowType.notify);
      else setFollowing(FollowType.silent)
    } else {
      if (!logged || userData.itsme) setFollowing(FollowType.hidden);
      else if (!userData.follows) setFollowing(FollowType.follow)
      else if (userData.notify) setFollowing(FollowType.notify);
      else setFollowing(FollowType.silent)
    }
  }, [userData]);

  const handleFollow = async () => {
    const res = await fetch(`${API}/follow`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`},
      body: JSON.stringify({ following: userData.pfp })
    });

    const data = await res.json();
    if (!res.ok) return console.log(data.message);
    setFollowing(FollowType.silent);
  }

  const handleChangeFollow = async (notify) => {
    if (notify == (following == FollowType.notify)) return setChangingFollowing(false);

    const res = await fetch(`${API}/follow/change`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`},
      body: JSON.stringify({ following: userData.pfp, notify: notify})
    });

    const data = await res.json();
    if (!res.ok) return console.log(data.message);

    setFollowing(notify ? FollowType.notify : FollowType.silent);
    setChangingFollowing(false);
  }

  const handleUnfollow = async () => {
    const res = await fetch(`${API}/follow/delete`, {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`},
      body: JSON.stringify({ following: userData.pfp })
    });

    const data = await res.json();
    if (!res.ok) return console.log(data.message);

    setFollowing(FollowType.follow);
    setChangingFollowing(false);
  }

  const getFollowButton = () => {
    switch (following) {
      case FollowType.hidden:
        return '';
      case FollowType.login:
        return (<SmartLink to="/login">Login to follow</SmartLink>);
      case FollowType.me:
        return (<SmartLink to="/account">Edit profile</SmartLink>);
      case FollowType.follow:
        return (<button onClick={handleFollow}>Follow</button>);
      default:
        return (
          <>
            <button onClick={() => setChangingFollowing(val => !val)} className="flex items-center gap-1">
              {following == FollowType.notify ? (<MdNotificationsActive />) : (<MdNotificationsOff />)}
              Following <MdKeyboardArrowDown />
            </button>
            {changingFollowing && (
              <div className="w-0 h-0 overflow-visible">
                <div className="bg-gray-300 w-fit p-2 relative flex flex-col whitespace-nowrap">
                  <button className="flex w-fit items-center gap-1" onClick={() => handleChangeFollow(true)}><MdNotificationsActive />All</button>
                  <button className="flex w-fit items-center gap-1" onClick={() => handleChangeFollow(false)}><MdNotificationsOff />Silent</button>
                  <button className="flex w-fit items-center gap-1" onClick={handleUnfollow}><RiUserUnfollowLine />Unfollow</button>
                </div>
              </div>)}
          </>
        )
    }
  }

  return (
    <>
      {getFollowButton()}
    </>
  );
}

const FollowType = {
  follow: 0,
  notify: 1,
  silent: 2,
  login: 3,
  me: 4,
  hidden: 5
}