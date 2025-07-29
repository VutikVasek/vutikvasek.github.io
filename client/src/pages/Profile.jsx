import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Feed from "../components/feed/Feed";
import FollowButton from "../components/profile/FollowButton";
import UserList from "../components/profile/UserList";
import Replies from "../components/profile/Replies";
import SmartLink from "../components/basic/SmartLink";

export default function Profile() {
  const { username, show } = useParams();
  const [userData, setUserData] = useState({});
  const [date, setDate] = useState('1846');
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    if (username == "<deleted>") {
      setUserData({username: "This account was deleted"});
      setDeleted(true);
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

  useEffect(() => 
      setDate(new Date(userData.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
      }))
    , [userData]);

  if (!userData) return <p>Loading...</p>;

  return (
    <>
      <div className="flex flex-col">
        <img src={`http://localhost:5000/media/pfp/${userData.pfp}.jpeg`} alt="pfp" className='rounded-full' style={{width: '9rem'}}
          onError={(e) => {e.target.onError = null;e.target.src="http://localhost:5000/media/pfp/default.jpeg"}} />
        <p>{userData.username}</p>
        <p>{userData.bio}</p>
        {!deleted && (<>
          <SmartLink to={`/u/${username}/followers`}>Followers: {userData.followers}</SmartLink>
          <SmartLink to={`/u/${username}/following`}>Following: {userData.following}</SmartLink>
          <p>{userData.pfp ? "Since" : ""} {date}</p>
          <div><FollowButton userData={userData} /></div>
        </>)}
      </div>

      {!deleted && (
        <>
          {(show == "followers" || show == "following") && (
            <UserList url={`http://localhost:5000/api/profile/user/${username}/${show}`} source={`/u/${username}`} />
          )}
          {(!show || show == "replies") &&
          <div className='flex gap-4'>
            <SmartLink to={"/u/" + username} className={!show ? 'font-semibold' : ''}>Posts</SmartLink>
            <SmartLink to={`/u/${username}/replies`} className={show=="replies" ? 'font-semibold' : ''}>Replies</SmartLink>
          </div>}
          {!show && (
            <Feed url={`http://localhost:5000/api/profile/posts/${username}`} />
          )}
          {show == "replies" && userData.pfp &&
            <Replies userData={userData} /> }
        </>
      )}
    </>
  );
}