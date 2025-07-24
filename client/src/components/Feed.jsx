import { useCallback, useEffect, useRef, useState } from "react";
import Post from "./Post";
import Sorter from "./Sorter";
import { useLocation } from "react-router-dom";

export default function Feed({url, reloadState}) {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const sort = queryParams.get('sort') || "newest"
  const timeframe = queryParams.get('time') || "week"

  const observer = useRef();
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  
  const loadPosts = async (reload) => {
    const res = await fetch(url + `?page=${reload ? 1 : page}&limit=5&sort=${sort}&time=${timeframe}`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });
    const data = await res.json();

    if (res.ok) {
      if (reload) {
        setPosts(data.posts);
        setPage(1);
      } else {
        setPosts((prev) => [...prev, ...data.posts].filter(
            (post, index, self) => index === self.findIndex(p => p._id === post._id)
        ));
      }

      setHasMore(data.hasMore);
    } else {
      setError('An error has occured while loading');
    }
  };
  
  useEffect(() => {
    if (page != 1)
      loadPosts();
  }, [page]);

  useEffect(() => {
    loadPosts();
  }, []);
  
  useEffect(() => {
    loadPosts(true);
  }, [reloadState]);
  
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
    loadPosts(true);
  }, [sort, timeframe]) 

  return (
    <div className="flex flex-col items-center" style={{width: '50rem'}}>
      <Sorter url={location.pathname} sortBy={sort} time={timeframe} />
      {posts.map((post, index) => (
        <Post 
          post={post} 
          key={post._id}
          ref={index === posts.length - 1 ? lastPostRef : null}/>
      ))}
      {!hasMore && <p className="text-gray-400 mt-4">No more posts</p>}
      {error}
    </div>
  )
}