import React, { Fragment, useEffect, useState } from 'react';
import { FaRegHeart, FaHeart, FaRegComments } from "react-icons/fa";
import { GrFormPin } from "react-icons/gr";
import { formatRelativeTime } from '../../tools/time';
import More from '../basic/More';
import DeleteButton from '../basic/DeleteButton';
import SmartLink from '../basic/SmartLink';
import Gallery from '../media/Gallery';
import ProfilePicture from '../media/ProfilePicture';
import ShareButton from '../content/ShareButton';
import Descriptor from '../info/Descriptor';
import ExpandableText from '../basic/ExpandableText';
import { useAppContext } from '@/context/AppContext';
import LikeButton from '../content/LikeButton';
import CommentButton from '../content/CommentButton';
import { getBackgroundFromLevel } from '@/tools/document';

const API = import.meta.env.VITE_API_BASE_URL;
const MEDIA = import.meta.env.VITE_MEDIA_BASE_URL;
const BASE = import.meta.env.VITE_BASE_URL;

const Post = React.forwardRef(({ post, cut, bar = true, pinned, lighter, className, ...params}, ref) => {
  if (!post || !post._id) return "Error post";
  const [hovered, setHovered] = useState(post.liked);
  const [likes, setLikes] = useState(post.likes);
  const [liked, setLiked] = useState(post.liked);
  const [replyingToPost, setReplyingToPost] = useState();

  const { showInfoToast, showErrorToast } = useAppContext();

  const shouldLink = !cut;

  const loadReplyingTo = async () => {
    if (!post.replyingTo) return setReplyingToPost(false);
    
    const res = await fetch(`${API}/post/${encodeURIComponent(post.replyingTo)}`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });

    const data = await res.json();
    if (!res.ok) showErrorToast("Could not load the original post");
    else setReplyingToPost(data);
  }
  
  useEffect(() => {
    loadReplyingTo();
  }, [post])

  const handleLike = async (e) => {
    e.stopPropagation();
    const res = await fetch(`${API}/post/${encodeURIComponent(post._id)}/like`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });

    const data = await res.json();
    if (!res.ok) alert(data.error || "Server error");
    else {
      setLikes(data.likes);
      setLiked(data.liked);
    }
  }

  const handlePinPost = async (e, group, pin) => {
    e.preventDefault();
    const res = await fetch(
        `${API}/group/${encodeURIComponent(group)}/${pin ? `pin/${encodeURIComponent(post._id)}` : "unpin"}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });
    const data = await res.json();
    if (!res.ok) console.log(data.message);

    if (pinned) window.location.reload();
    showInfoToast("Post has been " + (pin ? "pinned" : "unpinned"));
  }

  const handleBan = async (e, group, ban) => {
    e.preventDefault();
    const res = await fetch(
        `${API}/group/${encodeURIComponent(group)}/${ban ? `ban` : "unban"}/${encodeURIComponent(post.author.pfp)}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });
    const data = await res.json();
    if (!res.ok) return showErrorToast(data.message);

    showInfoToast("User has been " + (ban ? "banned" : "unbanned"));
  }

  return (
    <div className={`w-full whitespace-pre-wrap flex ${!cut ? `hover:${lighter ? "bg-slate-800" : "bg-slate-900"}` : ""} ${className}`} 
        ref={ref} {...params}>
      <div className='hover:bg-slate-800 hidden'></div>
      <div className='hover:bg-slate-900 hidden'></div>
      <SmartLink as={shouldLink ? "span" : "div"} className='gap-2 p-4 flex flex-col w-full' to={`/p/${encodeURIComponent(post._id)}`}>
        {pinned && (
          <div className='flex items-center'>
            <GrFormPin className='text-xl' />
            <p> pinned post</p>
          </div>
        )}
        <SmartLink to={`/u/${encodeURIComponent(post.author.username)}`} className='flex items-center gap-2 w-fit'>
          <ProfilePicture pfp={post.author.pfp} className="w-10" />
          <div>
            <p className="text-md font-semibold hover:underline underline-offset-2">{post.author.username}</p>
            <p className='text-xs text-slate-400'>{formatRelativeTime(post.createdAt)}</p>
          </div>
        </SmartLink>
        {post.groups?.length > 0 && 
        <div className='flex gap-2'>
          {post.groups.map((group, index) => {
            if (group._id) return (
              <SmartLink to={`/g/${encodeURIComponent(group.name)}`} className='link' key={index}>&{group.name}</SmartLink>
            ); else return (
              <div key={index}>&{group.name}</div>
            )
          }
          )}
        </div>
        }
        {post.mentions?.length > 0 && 
        <div className='flex gap-2'>
          {post.mentions.map((mention, index) => {
            if (mention._id) return (
              <SmartLink to={`/u/${encodeURIComponent(mention.username)}`} className='link' key={index}>@{mention.username}</SmartLink>
            ); else return (
              <div key={index}>@{mention.username}</div>
            )
          }
          )}
        </div>
        }
        {shouldLink ? (
          <SmartLink to={`/p/${encodeURIComponent(post._id)}`} as="span">
            <ExpandableText text={post.text} />
          </SmartLink>
        ):(
          <div>
            <ExpandableText text={post.text} maxHeight={Infinity} />
          </div>
        )}
        <Gallery images={[0, 1].map((num) => `${MEDIA}/image/${encodeURIComponent(post._id + num)}.webp`)} link={`/p/${encodeURIComponent(post._id)}`} />
        {replyingToPost && 
          <div className='w-full border-2 border-slate-700'>
            <Post post={replyingToPost} bar={false} lighter={cut ? lighter : !lighter} />
          </div>
        }
        {bar &&
        <div className='flex gap-8 items-center'>
          <LikeButton liked={liked} hovered={hovered} setHovered={setHovered} handleLike={handleLike} likes={likes} />
          {shouldLink && <CommentButton id={post._id} comments={post.comments} />}
          <ShareButton url={`${BASE}/p/${encodeURIComponent(post._id)}`} />
          <More>
            {[
              post.itsme && <DeleteButton url={`${API}/post/${encodeURIComponent(post._id)}`} word="post" key={"delete post"} />,
              ...(post.adminGroups?.flatMap((index, key) => (
                [
                  <DeleteButton url={`${API}/group/${encodeURIComponent(post.groups[index]._id)}/p/${encodeURIComponent(post._id)}`} key={"delete" + key} 
                    deleteWord='Remove' word={`post from group ${post.groups[index].name}`} />,
                  <button key={"pin" + key} onClick={e => handlePinPost(e, post.groups[index].name, !post.pinnedGroups?.includes(key))}>
                    {post.pinnedGroups?.includes(key) ? `Unpin from group ${post.groups[index].name}` : `Pin to group ${post.groups[index].name}`}
                  </button>,
                  !post.ownedGroups?.includes(key) &&
                    <button key={"ban" + key} onClick={e => handleBan(e, post.groups[index].name, !post.bannedGroups?.includes(key))}>
                      {post.bannedGroups?.includes(key) ? `Unban user from ${post.groups[index].name}` : `Ban user from ${post.groups[index].name}`}
                    </button>
                ]),
              ) ?? []),
              post.canReply && (<SmartLink to={`/post?author=${encodeURIComponent(post.author.username)}&rep=${encodeURIComponent(post._id)}`} key={"reply"}>
                  Reply with a post
                </SmartLink>),
            ].filter(val => !!val)}
          </More>
        </div>
        }
      </SmartLink>
    </div>
  )
});

export default Post;