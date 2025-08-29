import { FaHeart, FaRegHeart } from "react-icons/fa";
import Descriptor from "../info/Descriptor";

export default function LikeButton({ liked, hovered, setHovered, handleLike, likes}) {
  return (
    <Descriptor text={liked ? "Unlike" : "Like"} className="rounded-full">
      <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false || liked)} onClick={handleLike} 
          className={'w-fit flex gap-2 items-center cursor-pointer group/heart ' + (liked ? ' text-red-500': '')}>
        <div className='p-2 rounded-full group-hover/heart:bg-slate-800'>{hovered ? <FaHeart /> : <FaRegHeart />}</div>
        <p className='ml-[-0.5rem] mr-2'>{likes || '0'}</p>
      </div>
    </Descriptor>
  )
  
}