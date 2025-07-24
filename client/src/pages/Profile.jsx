import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Feed from "../components/Feed";
import FollowButton from "../components/FollowButton";
import UserList from "../components/UserList";
import Replies from "../components/Replies";

export default function Profile() {
  const { username, show } = useParams();
  const [userData, setUserData] = useState({});

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
    setUserData(data => {
      data.createdAt = new Date(data.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
      });
      return data;
    })
  }, [userData]);

  if (!userData) return <p>Loading...</p>;

  return (
    <>
      <div className="flex flex-col">
        <img src={`http://localhost:5000/media/pfp/${userData.pfp}.jpeg`} alt="pfp" className='rounded-full' style={{width: '9rem'}}
          onError={(e) => {e.target.onError = null;e.target.src="http://localhost:5000/media/pfp/default.jpeg"}} />
        <p>{userData.username}</p>
        <p>{userData.bio}</p>
        <Link to={`/u/${username}/followers`}>Followers: {userData.followers}</Link>
        <Link to={`/u/${username}/following`}>Following: {userData.following}</Link>
        <p>{userData.pfp ? "Since" : ""} {userData.createdAt}</p>
        <div><FollowButton userData={userData} /></div>
      </div>

      {(show == "followers" || show == "following") && (
        <UserList url={`http://localhost:5000/api/profile/user/${username}/${show}`} />
      )}
      {(!show || show == "replies") &&
      <div className='flex gap-4'>
        <Link to={"/u/" + username} className={!show ? 'font-semibold' : ''}>Posts</Link>
        <Link to={"/u/" + username + "/replies"} className={show=="replies" ? 'font-semibold' : ''}>Replies</Link>
      </div>}
      {!show && (
        <Feed url={`http://localhost:5000/api/profile/posts/${username}`} />
      )}
      {show == "replies" && userData.pfp &&
        <Replies userData={userData} /> }
    </>
  );
}