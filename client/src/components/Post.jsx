import React, { useEffect, useState } from 'react';
import { FaRegHeart, FaHeart, FaRegComments } from "react-icons/fa";
import { formatRelativeTime } from '../tools/time';
import { Link } from 'react-router-dom';

const Post = React.forwardRef(({ post, cut }, ref) => {
  const [hovered, setHovered] = useState(post.liked);
  const [likes, setLikes] = useState(post.likes);
  const [liked, setLiked] = useState(post.liked);
  const [comments, setComments] = useState(post.comments);

  const shouldLink = !cut;
  
  const handleLike = async () => {
    const res = await fetch(`http://localhost:5000/api/post/${post._id}/like`, {
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
    <div className="w-full p-4 m-2 shadow whitespace-pre-wrap flex" ref={ref}>
      <div className='gap-2 flex flex-col'>
        <Link to={`/u/${post.author.username}`} className='flex items-center gap-2 w-fit'>
          <img src={`http://localhost:5000/media/pfp/${post.author.pfp}.jpeg`} alt="pfp" className='rounded-full w-10'
            onError={(e) => {e.target.onError = null;e.target.src="http://localhost:5000/media/pfp/default.jpeg"}}
            onDragStart={e => e.preventDefault()} />
          <div>
            <p className="text-md font-semibold">{post.author.username}</p>
            <p className='text-xs text-gray-600'>{formatRelativeTime(post.createdAt)}</p>
          </div>
        </Link>
        {shouldLink ? (
          <Link to={`/p/${post._id}`}>
            <p>{post.text}</p>
          </Link>
        ):(
          <div>
            <p>{post.text}</p>
          </div>
        )}
        <div className='flex gap-6 items-center'>
          <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false || liked)} onClick={handleLike} 
              className={'w-fit flex gap-2 items-center cursor-pointer' + (liked ? ' text-red-600': '')}>
            {hovered ? <FaHeart /> : <FaRegHeart />}
            <p className='text-black'>{likes}</p>
          </div>
          {shouldLink ? (
            <Link to={`/p/${post._id}?focus=true`} className='flex gap-2 items-center'>
              <FaRegComments className='text-gray-500 hover:text-black' />
              <p className='text-black'>{comments}</p>
            </Link>
          ):("")}
        </div>
      </div>
      {shouldLink ? (
        <Link to={`/p/${post._id}`} className='flex flex-1'></Link>
      ):(
        <div></div>
      )}
    </div>
  )
});

export default Post;