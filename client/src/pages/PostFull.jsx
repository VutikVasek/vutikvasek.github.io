import { useEffect, useRef, useState } from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom"
import Post from "../components/post/Post";
import CommentThread from "../components/comment/CommentThread";
import { validateComment } from "../tools/validate";
import Sorter from "../components/basic/Sorter";
import MediaSelector from "@/components/media/MediaSelector";
import TextInput from "@/components/basic/TextInput";
const API = import.meta.env.VITE_API_BASE_URL;

export default function PostFull() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const sort = queryParams.get('sort') || "popular"
  const timeframe = queryParams.get('time') || "all"
  const shouldFocus = queryParams.get('focus') == "true" || false;
  const pinned = queryParams.get('c');
  
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [pinnedTree, setPinnedTree] = useState();
  const [reply, setReply] = useState('');
  const [mentions, setMentions] = useState(null);
  const [replyError, setReplyError] = useState('');
  const [rerenderState, setRerenderState] = useState(false);
  
  const mediaSelector = useRef(null);

  const canExpand = (pinnedTree && sort == "newest");

  if (postId == "<deleted>") return "This post was deleted";

  const loadPost = async () => {
    const res = await fetch(`${API}/post/${postId}`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });
    const data = await res.json();

    if (res.ok) setPost(data);
    else {
      console.log(data.message);
      setReplyError("Post not found");
    };
  }

  
  const handleReply = async () => {
    if (mediaSelector.current?.stillLoading()) 
      return showErrorToast("Please wait for all the media to upload") 

    const validated = validateComment(reply);
    if (validated) {
      setReplyError(validated);
      return;
    }
    
    const res = await fetch(`${API}/post/comment/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ text: reply.trim(), parent: postId, mentions }),
    });
    const data = await res.json();

    if (!res.ok) return alert(data.message);

    await mediaSelector.current?.upload(data._id);

    await setComments(comments => [data, ...comments]);

    setReply('');
    loadPost();
  }

  const loadPinnedTree = async () => {
    await fetch(`${API}/comment/${pinned}/tree`).then((res) => res.json()).then((data) => {
      setPinnedTree(data.pinnedTree)
    }).catch(err => console.log(err, "teedoo"));
  }

  useEffect(() => {
    loadPost();
    if (pinned)
      loadPinnedTree();
  }, []);

  if (!post) return (replyError || "Loading...");

  const rerender = () => setRerenderState(val => !val);

  return (
    <>
      <div className="text-lg">
        <Post post={post} cut={true} />
      </div>
      <div>
        <p>Comments ({post.comments})</p>
        <div className="flex gap-2">
            <TextInput text={reply} setText={setReply} setDBMentions={setMentions} shouldFocus={shouldFocus} onDrop={mediaSelector.current?.handleDrop} />
            <div className="flex flex-col gap-2">
              <button className="bg-green-300 px-4 h-10" onClick={handleReply}>Reply</button>
              <MediaSelector ref={mediaSelector} rerender={rerender} flex="justify-around" className="h-10 w-full py-2" />
            </div>
            <div className="h-20">
              {mediaSelector.current?.getFiles()}
            </div>
            {replyError}
        </div>
        <div style={{width: '80%'}}>
          <div className="flex justify-end">
            <Sorter url={location.pathname} sortBy={sort} time={timeframe} defaultSort={"popular"} defaultTime={"all"} />
          </div>
          <CommentThread parentId={post._id} comments={comments} setComments={setComments} infiniteScroll={true} sort={sort} timeframe={timeframe} 
            pinned={pinned ? (canExpand ? [...pinnedTree].pop() : "wait") : null} pinnedTree={canExpand && [...pinnedTree].slice(0, -1)} postId={post._id} />
        </div>
      </div>
    </>
  )
}