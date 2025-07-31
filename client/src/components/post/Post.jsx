import React, { useEffect, useState } from 'react';
import { FaRegHeart, FaHeart, FaRegComments } from "react-icons/fa";
import { formatRelativeTime } from '../../tools/time';
import More from '../basic/More';
import DeleteButton from '../basic/DeleteButton';
import SmartLink from '../basic/SmartLink';
import Gallery from './Gallery';
import ProfilePicture from '../basic/ProfilePicture';

const API = import.meta.env.VITE_API_BASE_URL;
const MEDIA = import.meta.env.VITE_MEDIA_BASE_URL;

const Post = React.forwardRef(({ post, cut }, ref) => {
  const [hovered, setHovered] = useState(post.liked);
  const [likes, setLikes] = useState(post.likes);
  const [liked, setLiked] = useState(post.liked);

  const shouldLink = !cut;
  
  const handleLike = async () => {
    const res = await fetch(`${API}/post/${post._id}/like`, {
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

  return (
    <div className="w-[calc(100%-0.5rem)] p-4 m-2 shadow whitespace-pre-wrap flex" ref={ref}>
      <div className='gap-2 flex flex-col'>
        <SmartLink to={`/u/${post.author.username}`} className='flex items-center gap-2 w-fit'>
          <ProfilePicture pfp={post.author.pfp} className="w-10" />
          <div>
            <p className="text-md font-semibold">{post.author.username}</p>
            <p className='text-xs text-gray-600'>{formatRelativeTime(post.createdAt)}</p>
          </div>
        </SmartLink>
        {shouldLink ? (
          <SmartLink to={`/p/${post._id}`}>
            <p>{post.text}</p>
          </SmartLink>
        ):(
          <div>
            <p>{post.text}</p>
          </div>
        )}
        <Gallery images={[0, 1].map(num => `${MEDIA}/image/${post._id + num}.webp`)} link={`/p/${post._id}`} />
        <div className='flex gap-6 items-center'>
          <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false || liked)} onClick={handleLike} 
              className={'w-fit flex gap-2 items-center cursor-pointer' + (liked ? ' text-red-600': '')}>
            {hovered ? <FaHeart /> : <FaRegHeart />}
            <p className='text-black'>{likes || '0'}</p>
          </div>
          {shouldLink ? (
            <SmartLink to={`/p/${post._id}?focus=true`} className='flex gap-2 items-center'>
              <FaRegComments className='text-gray-500 hover:text-black' />
              <p className='text-black'>{post.comments}</p>
            </SmartLink>
          ):("")}
          <More>
            {post.itsme && <DeleteButton url={`${API}/post/${post._id}`} word="post" />}
          </More>
        </div>
      </div>
      {shouldLink ? (
        <SmartLink to={`/p/${post._id}`} className='flex flex-1'></SmartLink>
      ):(
        <div></div>
      )}
    </div>
  )
});

export default Post;