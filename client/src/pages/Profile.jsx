import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MdKeyboardArrowDown, MdNotificationsActive, MdNotificationsOff } from "react-icons/md";
import { RiUserUnfollowLine } from "react-icons/ri";
import Feed from "../components/Feed";
import CommentThread from "../components/CommentThread";
import Sorter from "../components/Sorter";

export default function Profile() {
  const { username, show } = useParams();
  const [userData, setUserData] = useState({});
  const [following, setFollowing] = useState(FollowType.silent);
  const [changingFollowing, setChangingFollowing] = useState(false);

  const [sort, setSort] = useState("newest");
  const [timeframe, setTimeframe] = useState("week");
  const [comments, setComments] = useState([]);
  const showPosts = !(show=="replies");

  useEffect(() => {
    if (username == "<deleted>") {
      setUserData({username: "This account was deleted"});
      return;
    }
    fetch(`http://localhost:5000/api/profile/user/${username}`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }})
      .then(res => res.json())
      .then(data => setUserData(data))
      .catch(err => console.log(err));
  }, [username]);

  useEffect(() => {
    // console.log(userData);
    setUserData(data => {
      data.createdAt = new Date(data.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
      });
      return data;
    })
    if (!userData.logged) setFollowing(FollowType.login);
    else if (userData.itsme) setFollowing(FollowType.me);
    else if (!userData.logFollows) setFollowing(FollowType.follow);
    else if (userData.notify) setFollowing(FollowType.notify);
    else setFollowing(FollowType.silent)
  }, [userData]);

  if (!userData) return <p>Loading...</p>;

  const handleFollow = async () => {
    const res = await fetch('http://localhost:5000/api/follow', {
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

    const res = await fetch('http://localhost:5000/api/follow/change', {
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
    const res = await fetch('http://localhost:5000/api/follow/delete', {
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
      case FollowType.login:
        return (<Link to="/login">Login to follow</Link>);
      case FollowType.me:
        return (<Link to="/account">Edit profile</Link>);
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
      <img src={`http://localhost:5000/media/pfp/${userData.pfp}.jpeg`} alt="pfp" className='rounded-full'
        onError={(e) => {e.target.onError = null;e.target.src="http://localhost:5000/media/pfp/default.jpeg"}} />
      <p>{userData.username}</p>
      <p>{userData.bio}</p>
      <p>Followers: {userData.followers}</p>
      <p>Following: {userData.following}</p>
      <p>{userData.pfp ? "Since" : ""} {userData.createdAt}</p>
      {getFollowButton()}

      <div className='flex gap-4'>
        <Link to={"/u/" + username} className={showPosts ? 'font-semibold' : ''}>Posts</Link>
        <Link to={"/u/" + username + "/replies"} className={!showPosts ? 'font-semibold' : ''}>Replies</Link>
      </div>
      {showPosts ? (
        <Feed url={`http://localhost:5000/api/profile/posts/${username}`} />
      ) : (userData.pfp &&
        <>
          <div style={{width: '80%'}}>
            <div className="flex justify-end">
              <Sorter sort={sort} setSort={setSort} timeframe={timeframe} setTimeframe={setTimeframe} />
            </div>
            <CommentThread userId={userData.pfp} comments={comments} setComments={setComments} infiniteScroll={true} reload={userData.pfp} sort={sort} timeframe={timeframe} />
          </div>
      </> )}
      
      
    </>
  );
}

const FollowType = {
  follow: 0,
  notify: 1,
  silent: 2,
  login: 3,
  me: 4
}