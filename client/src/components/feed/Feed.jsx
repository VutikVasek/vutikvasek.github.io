import { useCallback, useEffect, useRef, useState } from "react";
import Post from "../post/Post";
import Sorter from "../basic/Sorter";
import { useLocation } from "react-router-dom";
import Replies from "../profile/Replies";

export default function Feed({url, reloadState, query, showReplies = false, defaultTime = "week", defaultSort = "newest", sorter = true, setParams}) {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const sort = queryParams.get('sort') || defaultSort
  const timeframe = queryParams.get('time') || defaultTime

  const observer = useRef();
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  
  const loadPosts = async (reload) => {
    // console.log(url + `?page=${reload ? 1 : page}&limit=4&sort=${sort}&time=${timeframe}&${query}`);
    const res = await fetch(url + `?page=${reload ? 1 : encodeURIComponent(page)}&limit=4&sort=${encodeURIComponent(sort)}&time=${encodeURIComponent(timeframe)}&${query}`, {
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
        setPosts((prev) => [...prev, ...data.posts].filter(post => post).filter(
            (post, index, self) => index === self.findIndex(p => p._id === post._id)
        ));
      }

      setHasMore(data.hasMore);
    } else {
      setError('An error has occured while loading');
      console.log(data.message);
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
  }, [reloadState, url]);
  
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
    <div className="flex flex-col items-center w-full max-w-[40rem] mx-auto">
      {sorter && <Sorter url={location.pathname} sortBy={sort} time={timeframe} defaultSort={defaultSort} defaultTime={defaultTime} />}
      {posts.map((post, index) => (
        <Post 
          post={post} 
          key={post?._id ?? index}
          ref={index === posts.length - 1 ? lastPostRef : null}/>
      ))}
      {(hasMore && sorter && setParams) &&
        <button onClick={e => setParams("s", "posts")}>Show more</button>}
      {!hasMore &&
        <p className="text-gray-400 mt-4">No more posts</p>}
      {setParams && <button onClick={e => setParams("s", "posts")}>Show more</button>}
      {(!hasMore && showReplies) && <div className="w-full">
        <h2 className="text-2xl p-3">Replies</h2>
        <Replies search={true} query={query} reloadState={reloadState} defaultTime="week" defaultSort="popular" sorter={false} setParams={setParams} />
      </div> }
      {error}
    </div>
  )
}