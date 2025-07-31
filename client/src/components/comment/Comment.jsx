import { FaCommentMedical, FaHeart, FaRegHeart, FaReply } from "react-icons/fa";
import { useRef, useState } from "react";
import { formatRelativeTime } from "../../tools/time";
import { validateComment } from "../../tools/validate";
import CommentThread from "./CommentThread";
import More from "../basic/More";
import DeleteButton from "../basic/DeleteButton";
import SmartLink from "../basic/SmartLink";
import ShareButton from "../basic/ShareButton";
import Descriptor from "../basic/Descriptor";

const API = import.meta.env.VITE_API_BASE_URL;
const MEDIA = import.meta.env.VITE_MEDIA_BASE_URL;
const BASE = import.meta.env.VITE_BASE_URL;

export default function Comment({ comment, link, pinned, pinnedTree, postId }) {
  const [hovered, setHovered] = useState(comment.liked);
  const [likes, setLikes] = useState(comment.likes);
  const [liked, setLiked] = useState(comment.liked);
  const [commentCount, setCommentCount] = useState(comment.comments);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(!!pinnedTree || false);
  const [replying, setReplying] = useState(false);
  const [reply, setReply] = useState('');
  const [replyError, setReplyError] = useState('');

  const linkParent = !!link;
  
  const handleLike = async () => {
    const res = await fetch(`${API}/comment/${comment._id}/like`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error || "Server error");

    setLikes(data.likes);
    setLiked(data.liked);
  }

  const focus = node => node?.focus();

  const handleReply = async () => {
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
      body: JSON.stringify({ text: reply.trim(), parent: comment._id }),
    });
    const data = await res.json();

    if (!res.ok) return console.log(data.message);

    await setComments(comments =>[ data, ...comments]);

    // console.log(comments);
    setShowComments(true);
    setCommentCount(count => count+1);
    setReply('');
    setReplying(false);
  }

  return (
    <div className="whitespace-pre-wrap">
      { link && (<SmartLink to={"/p/" + comment.parent._id} className="p-4">
          Replying to {comment.parent.directParent && `${comment.parent.directParent.author?.username || "<deleted>"} on a post from `}<div className="inline font-semibold">{comment.parent.author.username}:</div>
        </SmartLink>)}
      <div className={"w-full p-4 m-2 shadow flex" + ((pinned && pinnedTree?.length === 0) ? "  bg-cyan-200" : "")}>
        <div className="flex gap-2">
          <SmartLink to={`/u/${comment.author.username}`} className='flex items-start w-fit min-w-10'>
            <img src={`${MEDIA}/pfp/${comment.author.pfp}.jpeg`} alt="pfp" className='rounded-full w-10 h-10'
              onError={(e) => {e.target.onError = null;e.target.src=`${MEDIA}/pfp/default.jpeg`}}
              onDragStart={e => e.preventDefault()} />
          </SmartLink>
          <div>
            <div className="flex items-center gap-2">
              <SmartLink to={`/u/${comment.author.username}`} className="text-md font-semibold">{comment.author.username}</SmartLink>
              <p className='text-xs text-gray-600'>{formatRelativeTime(comment.createdAt)}</p>
            </div>
            <p>{comment.text}</p>
            <div className='flex gap-6 items-center mt-2'>
              <Descriptor text={liked ? "Unlike" : "Like"}>
                <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false || liked)} onClick={handleLike} 
                    className={'w-fit flex gap-2 items-center cursor-pointer' + (liked ? ' text-red-600': '')}>
                  {hovered ? <FaHeart /> : <FaRegHeart />}
                  <p className='text-black'>{likes}</p>
                </div>
              </Descriptor>
              { !linkParent && (
                <Descriptor text={showComments ? "Hide comments" : "Comments"}>
                  <div className='cursor-pointer flex gap-2 items-center' onClick={() => setShowComments(val => !val)}>
                    <FaCommentMedical className='text-gray-500 hover:text-black' />
                    <p className='text-black'>{commentCount}</p>
                  </div>
                </Descriptor>
              )}
              <Descriptor text={!replying && "reply"}>
                <div className='cursor-pointer items-center' onClick={() => setReplying(val => !val)}>
                  <FaReply className='text-gray-500 hover:text-black' />
                </div>
              </Descriptor>
              {postId && (
                <ShareButton url={`${BASE}/p/${postId}?sort=newest&c=${comment._id}`} />
              )}
              <More>
                {comment.itsme && <DeleteButton url={`${API}/comment/${comment._id}`} word="comment" />}
              </More>
            </div>
          </div>
        </div>
      </div>
      <div style={{marginLeft: 2.75 + 'rem'}}>
        {replying ? (
          <div className="flex gap-2 ml-7">
            <textarea name="" id="" className="border border-black resize-y" rows={3} cols={50} value={reply} onChange={(e) => setReply(e.target.value)} ref={focus}></textarea>
            <div className="flex flex-col gap-2">
              <button className="bg-gray-300 px-4  h-10" onClick={() => setReplying(false)}>Cancel</button>
              <button className="bg-green-300 px-4 h-10" onClick={handleReply}>Reply</button>
            </div>
            {replyError}
          </div>
        ):('')}
        {showComments ? (
          <CommentThread parentId={comment._id} comments={comments} setComments={setComments} sort={"newest"} 
            pinned={pinnedTree && [...pinnedTree].pop()} pinnedTree={pinnedTree && [...pinnedTree].slice(0, -1)} postId={postId} />
        ):('')}
      </div>
    </div>
  )
}