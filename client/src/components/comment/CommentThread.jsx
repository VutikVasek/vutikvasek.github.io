import { use, useCallback, useEffect, useRef, useState } from "react";
import Comment from "./Comment";
const API = import.meta.env.VITE_API_BASE_URL;

export default function CommentThread({ parentId, userId, comments, setComments, infiniteScroll, sort, timeframe, pinned, pinnedTree, postId, query, reload }) {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const infinite = !!infiniteScroll;
  const linkParent = !!userId || query != null;
  var observer = useRef();

  const loadComments = async (reload) => {
    if (pinned === "wait") return;
    const url = API + (userId ? `/profile/comments/${encodeURIComponent(userId)}` : 
      (query != null ? `/search/for/replies` : `/post/${encodeURIComponent(parentId)}/comments`)) + 
      `?page=${reload ? 1 : encodeURIComponent(page)}`+
       `&limit=3`+
       `${sort && "&sort=" + encodeURIComponent(sort)}`+
       `${timeframe && "&time=" + encodeURIComponent(timeframe)}`+
       `&link=${encodeURIComponent(linkParent)}`+
       `${pinned ? `&pinned=${encodeURIComponent(pinned)}` : ""}`+
       `${(query != null) ? `&${query}` : ""}`;
    const res = await fetch(url, {
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
    if (page != 1)
      loadComments();
  }, [page])

  useEffect(() => {
    loadComments(true);
  }, [sort, timeframe, userId, pinned, reload]);

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
          <Comment comment={comment} key={comment._id} link={linkParent} pinnedTree={(comment._id == pinned && comments) ? pinnedTree : null} 
            postId={postId} pinned={pinned === comment._id} />
        </div>
      ))}
      {hasMore ? (
        <button onClick={handleMore}>Load more</button>
      ) : ('')}
      {infinite && !hasMore && <p className="text-gray-400 mt-4">No more comments</p>}
    </>
  )
}