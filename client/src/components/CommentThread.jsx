import { useCallback, useEffect, useRef, useState } from "react";
import Comment from "./Comment";

export default function CommentThread({ parentId, comments, setComments, infiniteScroll }) {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const infinite = !!infiniteScroll;
  var observer = useRef();

  const loadComments = async () => {
    const res = await fetch(`http://localhost:5000/api/post/${parentId}/comments?page=${page}&limit=3}`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });
    const data = await res.json();

    if (res.ok) {
      setComments(old => [...old, ...data.comments].filter(
          (comment, index, self) => index === self.findIndex(p => p._id === comment._id)));
      setHasMore(data.hasMore);
    } else console.log(data.message);
  }

  useEffect(() => {
    loadComments();
  }, []);

  useEffect(() => {
    loadComments();
  }, [page])

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