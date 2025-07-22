import { useCallback, useEffect, useRef, useState } from "react";
import Post from "./Post";
import { MdKeyboardArrowDown } from "react-icons/md";

export default function Feed({url, reloadState}) {

  const observer = useRef();
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState(SortType.newest);
  const [showSort, setShowSort] = useState(false);
  const [timeframe, setTimeframe] = useState(TimeUnit.week);
  const [showTimeframe, setShowTimeframe] = useState(false);
  
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
    setShowSort(false);
    loadPosts(true);
  }, [sort])
  useEffect(() => {
    setShowTimeframe(false);
    loadPosts(true);
  }, [timeframe])

  const getTimeframe = (frame) => {
    switch (frame || timeframe) {
      case TimeUnit.day:
        return "Today";
      case TimeUnit.week:
        return "This week";
      case TimeUnit.month:
        return "This month";
      case TimeUnit.year:
        return "This year";
      case TimeUnit.all:
        return "All time";
    }
  }

  return (
    <div className="flex flex-col items-center" style={{width: '50rem'}}>
      <div className='flex gap-4 self-end'>
        Sort by:
        <div>
          <button onClick={() => setShowSort(val => !val)} className="flex items-center">{sort == SortType.newest ? "newest" : "popular"}<MdKeyboardArrowDown /></button>
          {showSort && (
            <div className="w-0 h-0 overflow-visible">
              <div className="bg-gray-300 w-fit p-2 relative flex flex-col whitespace-nowrap">
                <button onClick={() => setSort(SortType.newest)}>newest</button>
                <button onClick={() => setSort(SortType.popular)}>popular</button>
              </div>
            </div>
          )}
        </div>
        {sort == SortType.popular && (
        <div>
          <button onClick={() => setShowTimeframe(val => !val)} className="flex items-center">{getTimeframe()}<MdKeyboardArrowDown /></button>
          {showTimeframe && (
            <div className="w-0 h-0 overflow-visible">
              <div className="bg-gray-300 w-fit p-2 relative flex flex-col whitespace-nowrap">
                <button onClick={() => setTimeframe(TimeUnit.day)}>{getTimeframe(TimeUnit.day)}</button>
                <button onClick={() => setTimeframe(TimeUnit.week)}>{getTimeframe(TimeUnit.week)}</button>
                <button onClick={() => setTimeframe(TimeUnit.month)}>{getTimeframe(TimeUnit.month)}</button>
                <button onClick={() => setTimeframe(TimeUnit.year)}>{getTimeframe(TimeUnit.year)}</button>
                <button onClick={() => setTimeframe(TimeUnit.all)}>{getTimeframe(TimeUnit.all)}</button>
              </div>
            </div>
          )}
        </div>
        )}
      </div>
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

const SortType = {
  newest: "newest",
  popular: "popular"
}
const TimeUnit = {
  day: "day",
  week: "week",
  month: "month",
  year: "year",
  all: "all"
}