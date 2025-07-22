import { useEffect, useState, useRef, useCallback } from 'react';
import Post from '../components/Post';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');
  const observer = useRef();
  
  const loadPosts = async () => {
    const res = await fetch(`http://localhost:5000/api/posts?page=${page}&limit=5`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });
    const data = await res.json();

    if (res.ok) {
      setPosts((prev) => [...prev, ...data.posts].filter(
          (post, index, self) => index === self.findIndex(p => p._id === post._id)
        ));

      setHasMore(data.hasMore);
    } else {
      setError('An error has occured while loading');
    }
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

  return (
    <>
      <h1 className="text-2xl p-4">Welcome to the feed!</h1>
      <div className="flex flex-col items-center">
        {posts.map((post, index) => (
          <Post 
            post={post} 
            key={post._id}
            ref={index === posts.length - 1 ? lastPostRef : null}/>
        ))}
        {!hasMore && <p className="text-gray-400 mt-4">No more posts</p>}
        {error}
      </div>
    </>
  );
}