import { use, useCallback, useEffect, useRef, useState } from "react";
import Comment from "./Comment";

export default function CommentThread({ parentId, comments, setComments, infiniteScroll, sortByPopular }) {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const infinite = !!infiniteScroll;
  const popular = !!sortByPopular;
  var observer = useRef();

  const loadComments = async (reload) => {
    const res = await fetch(`http://localhost:5000/api/post/${parentId}/comments?page=${reload ? 1 : page}&limit=3${popular && "&sort=popular"}`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });
    const data = await res.json();

    if (res.ok) {
      if (reload) {
        setComments(data.comments);
        setPage(1);
      } else setComments(old => [...old, ...data.comments].filter(
                (comment, index, self) => index === self.findIndex(p => p._id === comment._id)));
      setHasMore(data.hasMore);
    } else console.log(data.message);
  }

  useEffect(() => {
    loadComments();
  }, []);

  useEffect(() => {
    if (page != 1)
      loadComments();
  }, [page])

  useEffect(() => {
    loadComments(true);
  }, [sortByPopular]);

  const handleMore = async () => {
    setPage(val => val+1);
  }

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
      {comments.map((comment, index) => (
        <div ref={infinite && index === comments.length - 1 ? lastPostRef : null} key={comment._id}>
          <Comment comment={comment} key={comment._id} />
        </div>
      ))}
      {hasMore ? (
        <button onClick={handleMore}>Load more</button>
      ) : ('')}
    </>
  )
}