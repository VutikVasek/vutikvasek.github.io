import { FaCommentMedical, FaHeart, FaRegHeart, FaReply } from "react-icons/fa";
import { useRef, useState } from "react";
import { formatRelativeTime } from "../../tools/time";
import { validateComment } from '^/validate';
import CommentThread from "./CommentThread";
import More from "../basic/More";
import DeleteButton from "../basic/DeleteButton";
import SmartLink from "../basic/SmartLink";
import ShareButton from "../content/ShareButton";
import Descriptor from "../info/Descriptor";
import Gallery from "../media/Gallery";
import MediaSelector from "../media/MediaSelector";
import { useAppContext } from "@/context/AppContext";
import ExpandableText from "../basic/ExpandableText";
import TextInput from "../basic/TextInput";
import LikeButton from "../content/LikeButton";
import ProfilePicture from "../media/ProfilePicture";
import { Helmet } from "react-helmet-async";

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
  const [mentions, setMentions] = useState(null);
  const [replyError, setReplyError] = useState('');
  const [rerenderState, setRerenderState] = useState(false);

  const mediaSelector = useRef(null);
  const { showErrorToast } = useAppContext();
  
  const handleLike = async () => {
    const res = await fetch(`${API}/comment/${encodeURIComponent(comment._id)}/like`, {
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

  const handleReply = async () => {
    if (mediaSelector.current?.stillLoading()) 
      return showErrorToast("Please wait for all the media to upload") 

    const validated = validateComment(reply);
    if (validated) {
      setReplyError(validated);
      return;
    }
    
    const res = await fetch(`${API}/comment/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ text: reply.trim(), parent: comment._id, mentions }),
    });
    const data = await res.json();

    if (!res.ok) return console.log(data.message);

    await mediaSelector.current?.upload(data._id);

    await setComments(comments => [ data, ...comments]);

    // console.log(comments);
    setShowComments(true);
    setCommentCount(count => count+1);
    setReply('');
    setReplying(false);
  }

  const rerender = () => setRerenderState(val => !val);

  return (
    <>
    {pinned && 
    <Helmet>
      <title>Comment by {comment.author.username || "deleted"} - Vutink</title>
    </Helmet>}
    <div className="whitespace-pre-wrap">
      { link && (<SmartLink to={`/p/${encodeURIComponent(comment.parent._id)}?sort=newest&c=${encodeURIComponent(comment._id)}`} className="p-4 hover:underline underline-offset-2">
          Replying {comment.parent.author.username == "<deleted post>" ? "on " : "to "} 
            {comment.parent.directParent && `${comment.parent.directParent.author?.username || "<deleted>"} on a post from `}
            <div className="inline font-semibold">{comment.parent.author.username}:</div>
        </SmartLink>)}
      <div className={"w-full p-4 m-2 shadow flex" + ((pinned && pinnedTree?.length === 0) ? "  border-cyan-900 border-4 rounded-lg" : "")}>
        <div className="flex gap-2 max-w-full">
          <SmartLink to={`/u/${encodeURIComponent(comment.author.username)}`} className='flex items-start w-fit min-w-10'>
            <ProfilePicture pfp={comment.author.pfp} className="w-10" />
          </SmartLink>
          <div className="max-w-full">
            <SmartLink to={`/u/${encodeURIComponent(comment.author.username)}`} className="flex items-center gap-2 w-fit whitespace-nowrap max-w-full">
              <p className="text-md font-semibold hover:underline underline-offset-2 truncate">{comment.author.username}</p>
              <p className='text-xs text-slate-400'>{formatRelativeTime(comment.createdAt)}</p>
            </SmartLink>

            {comment.mentions?.length > 0 && 
            <div className='flex gap-2 whitespace-nowrap max-w-full [&>*]:truncate flex-wrap'>
              {comment.mentions.map((mention, index) => {
                if (mention._id) return (
                  <SmartLink to={`/u/${encodeURIComponent(mention.username)}`} className='link' key={index}>@{mention.username}</SmartLink>
                ); else return (
                  <div key={index}>@{mention.username}</div>
                )
              }
              )}
            </div>
            }
            <div className="max-w-full">
              <ExpandableText text={comment.text} />
            </div>

            <Gallery images={[`${MEDIA}/image/${encodeURIComponent(comment._id)}0.webp`]} />
            <div className='flex gap-6 items-center mt-2'>
              <LikeButton liked={liked} hovered={hovered} setHovered={setHovered} handleLike={handleLike} likes={likes} />
              { !link && (
                <Descriptor text={showComments ? "Hide comments" : "Comments"} className="rounded-full">
                  <div className='cursor-pointer flex gap-2 items-center group/commentcount ' 
                      onClick={() => setShowComments(val => !val)}>
                    <div className="p-2 rounded-full text-gray-500 group-hover/commentcount:bg-slate-800 group-hover/commentcount:text-white">
                      <FaCommentMedical />
                    </div>
                    <p className='ml-[-0.5rem]'>{commentCount}</p>
                  </div>
                </Descriptor>
              )}
              <Descriptor text={!replying && "reply"} className="rounded-full">
                <div className='cursor-pointer items-center p-2 rounded-full hover:bg-slate-800 text-gray-500 hover:text-white' onClick={() => setReplying(val => !val)}>
                  <FaReply />
                </div>
              </Descriptor>
              {(postId || comment.parent._id) && (
                <ShareButton url={`${BASE}/p/${encodeURIComponent(postId || comment.parent._id)}?sort=newest&c=${encodeURIComponent(comment._id)}`} />
              )}
              <More>
                {comment.itsme && <DeleteButton url={`${API}/comment/${encodeURIComponent(comment._id)}`} word="comment" />}
              </More>
            </div>
          </div>
        </div>
      </div>
      <div style={{marginLeft: 2.75 + 'rem'}}>
        {replying ? (
          <div className="flex gap-2 ml-7">
            <TextInput text={reply} setText={setReply} setDBMentions={setMentions} onDrop={mediaSelector.current?.handleDrop}
              handleSubmit={handleReply} mediaSelector={mediaSelector} rerender={rerender} setReplying={setReplying} comment={true} />
            {replyError}
          </div>
        ):('')}
        {showComments ? (
          <CommentThread parentId={comment._id} comments={comments} setComments={setComments} sort={"newest"} 
            pinned={pinnedTree && [...pinnedTree].pop()} pinnedTree={pinnedTree && [...pinnedTree].slice(0, -1)} postId={postId} />
        ):('')}
      </div>
    </div>
    </>
  )
}