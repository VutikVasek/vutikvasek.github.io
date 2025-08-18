import React, { Fragment, useEffect, useState } from 'react';
import { FaRegHeart, FaHeart, FaRegComments } from "react-icons/fa";
import { GrFormPin } from "react-icons/gr";
import { formatRelativeTime } from '../../tools/time';
import More from '../basic/More';
import DeleteButton from '../basic/DeleteButton';
import SmartLink from '../basic/SmartLink';
import Gallery from './Gallery';
import ProfilePicture from '../media/ProfilePicture';
import ShareButton from '../basic/ShareButton';
import Descriptor from '../info/Descriptor';
import ExpandableText from '../basic/ExpandableText';
import { useAppContext } from '@/context/AppContext';

const API = import.meta.env.VITE_API_BASE_URL;
const MEDIA = import.meta.env.VITE_MEDIA_BASE_URL;
const BASE = import.meta.env.VITE_BASE_URL;

const Post = React.forwardRef(({ post, cut, bar = true, pinned, className, ...params }, ref) => {
  if (!post || !post._id) return "Error post";
  const [hovered, setHovered] = useState(post.liked);
  const [likes, setLikes] = useState(post.likes);
  const [liked, setLiked] = useState(post.liked);
  const [replyingToPost, setReplyingToPost] = useState();

  const { showInfoToast, showErrorToast } = useAppContext();

  const shouldLink = !cut;

  const loadReplyingTo = async () => {
    if (!post.replyingTo) return
    
    const res = await fetch(`${API}/post/${post.replyingTo}`, {
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
  }, [])

  const handleLike = async (e) => {
    e.stopPropagation();
    const res = await fetch(`${API}/post/${post._id}/like`, {
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
        `${API}/group/${group}/${pin ? `pin/${post._id}` : "unpin"}`, {
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
        `${API}/group/${group}/${ban ? `ban` : "unban"}/${post.author.pfp}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });
    const data = await res.json();
    if (!res.ok) console.log(data.message);

    showInfoToast("User has been " + (ban ? "banned" : "unbanned"));
  }

  return (
    <div className={`w-[calc(100%-0.5rem)] p-4 m-2 shadow whitespace-pre-wrap flex ${className}`} ref={ref} {...params}>
      <SmartLink as={shouldLink ? "span" : "div"} className='gap-2 flex flex-col w-full' to={`/p/${post._id}`}>
        {pinned && (
          <div className='flex items-center'>
            <GrFormPin className='text-xl' />
            <p> pinned post</p>
          </div>
        )}
        <SmartLink to={`/u/${post.author.username}`} className='flex items-center gap-2 w-fit'>
          <ProfilePicture pfp={post.author.pfp} className="w-10" />
          <div>
            <p className="text-md font-semibold">{post.author.username}</p>
            <p className='text-xs text-gray-600'>{formatRelativeTime(post.createdAt)}</p>
          </div>
        </SmartLink>
        {post.mentions?.length > 0 && 
        <div className='flex gap-2'>
          {post.mentions.map((mention, index) => {
            if (mention._id) return (
              <SmartLink to={`/u/${mention.username}`} className='text-blue-500 font-semibold' key={index}>@{mention.username}</SmartLink>
            ); else return (
              <div key={index}>@{mention.username}</div>
            )
          }
          )}
        </div>
        }
        {post.groups?.length > 0 && 
        <div className='flex gap-2'>
          {post.groups.map((group, index) => {
            if (group._id) return (
              <SmartLink to={`/g/${group.name}`} className='text-blue-500 font-semibold' key={index}>&{group.name}</SmartLink>
            ); else return (
              <div key={index}>&{group.name}</div>
            )
          }
          )}
        </div>
        }
        {shouldLink ? (
          <SmartLink to={`/p/${post._id}`} as="span">
            <ExpandableText text={post.text} />
          </SmartLink>
        ):(
          <div>
            <ExpandableText text={post.text} maxHeight={Infinity} />
          </div>
        )}
        <Gallery images={[0, 1].map((num) => `${MEDIA}/image/${post._id + num}.webp`)} link={`/p/${post._id}`} />
        {replyingToPost && 
          <div className='m-2 w-full'>
            <Post post={replyingToPost} bar={false} />
          </div>
        }
        {bar &&
        <div className='flex gap-6 items-center'>
          <Descriptor text={liked ? "Unlike" : "Like"}>
            <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false || liked)} onClick={handleLike} 
                className={'w-fit flex gap-2 items-center cursor-pointer' + (liked ? ' text-red-600': '')}>
              {hovered ? <FaHeart /> : <FaRegHeart />}
              <p className='text-black'>{likes || '0'}</p>
            </div>
          </Descriptor>
          {shouldLink ? (
            <Descriptor text="Comment">
              <SmartLink to={`/p/${post._id}?focus=true`} className='flex gap-2 items-center'>
                <FaRegComments className='text-gray-500 hover:text-black' />
                <p className='text-black'>{post.comments}</p>
              </SmartLink>
            </Descriptor>
          ):("")}
          <ShareButton url={`${BASE}/p/${post._id}`} />
          <More>
            {[
              post.itsme && <DeleteButton url={`${API}/post/${post._id}`} word="post" key={"delete post"} />,
              ...(post.adminGroups?.flatMap((index, key) => (
                [
                  <DeleteButton url={`${API}/group/${post.groups[index]._id}/p/${post._id}`} key={"delete" + key} 
                    deleteWord='Remove' word={`post from group ${post.groups[index].name}`} />,
                  <button key={"pin" + key} onClick={e => handlePinPost(e, post.groups[index].name, !post.pinnedGroups?.includes(key))}>
                    {post.pinnedGroups?.includes(key) ? `Unpin from group ${post.groups[index].name}` : `Pin to group ${post.groups[index].name}`}
                  </button>,
                  <button key={"ban" + key} onClick={e => handleBan(e, post.groups[index].name, !post.bannedGroups?.includes(key))}>
                    {post.bannedGroups?.includes(key) ? `Unban user from ${post.groups[index].name}` : `Ban user from ${post.groups[index].name}`}
                  </button>
                ]),
              ) ?? []),
              post.canReply && (<SmartLink to={`/post?author=${post.author.username}&rep=${post._id}`} key={"reply"}>
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