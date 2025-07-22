import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom"
import Post from "../components/Post";
import CommentThread from "../components/CommentThread";
import { validateComment } from "../tools/validate";

export default function PostFull() {
  const { postId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [reply, setReply] = useState('');

  const loadPost = async () => {
    const res = await fetch(`http://localhost:5000/api/post/${postId}`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });
    const data = await res.json();

    if (res.ok) setPost(data);
    else console.log(data.message);
  }

  
  const handleReply = async () => {
    const validated = validateComment(reply);
    if (validated) {
      setReplyError(validated);
      return;
    }
    
    const res = await fetch('http://localhost:5000/api/post/comment/', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ text: reply, parent: postId }),
    });
    const data = await res.json();

    if (!res.ok) return console.log(data.message);

    await setComments(comments => [data, ...comments]);

    setReply('');
    loadPost();
  }

  useEffect(() => {
    loadPost();
  }, []);

  if (!post) return "Loading...";

  const focus = (node) => {
    if (searchParams.get('focus')) {
      node?.focus();
      setSearchParams({});
    }
  }

  return (
    <>
      <div className="text-lg">
        <Post post={post} cut={true} />
      </div>
      <div>
        <p>Comments ({post.comments})</p>
        <div className="flex gap-2">
          <textarea name="" id="" rows="1"  cols="60"
            className='resize-y border border-black min-h-10'
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onFocus={(e) => e.target.rows = 3}
            onBlur={(e) => e.target.rows = 1}
            placeholder="Reply to the post..."
            ref={focus}
            ></textarea>
            <button className="bg-green-300 px-4 h-10" onClick={handleReply}>Reply</button>
        </div>
        <CommentThread parentId={post._id} comments={comments} setComments={setComments} infiniteScroll={true} />
      </div>
    </>
  )
}