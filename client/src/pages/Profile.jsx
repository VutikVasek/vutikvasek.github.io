import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Post from "../components/Post";

export default function Profile() {
  const { username } = useParams();
  const [userData, setUserData] = useState({});
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef();
  const navigate = useNavigate();
    
  const loadPosts = async () => {

    const res = await fetch(`http://localhost:5000/api/profile/posts/${username}?page=${page}&limit=5`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });
    const data = await res.json();

    if (!res.ok) return;

    setPosts((prev) => [...prev, ...data.posts]);
    setHasMore(data.hasMore);
  };
  
  useEffect(() => {
    loadPosts();
  }, [page]);
  
  const lastPostRef = useCallback((node) => {
    if (!hasMore) return;

    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPage((prev) => prev + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [hasMore]);

  useEffect(() => {
    if (username == "<deleted>") {
      setUserData({username: "This account was deleted"});
      return;
    }
    fetch(`http://localhost:5000/api/profile/user/${username}`)
      .then(res => res.json())
      .then(data => setUserData(data))
      .catch(err => console.log(err));
  }, [username]);

  useEffect(() => {
    userData.createdAt = new Date(userData.createdAt).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
    });
  }, [userData]);

  if (!userData) return <p>Loading...</p>;

  return (
    <>
      <img src={`http://localhost:5000/media/pfp/${userData.pfp}.jpeg`} alt="pfp" className='rounded-full'
        onError={(e) => {e.target.onError = null;e.target.src="http://localhost:5000/media/pfp/default.jpeg"}} />
      <p>{userData.username}</p>
      <p>{userData.bio}</p>
      <p>{userData.pfp ? "Since" : ""} {userData.createdAt}</p>


      <div className="flex flex-col items-center">
        {posts.map((post, index) => (
          <Post 
            post={post} 
            key={post._id}
            ref={index === posts.length - 1 ? lastPostRef : null}/>
        ))}
      </div>
    </>
  );
}