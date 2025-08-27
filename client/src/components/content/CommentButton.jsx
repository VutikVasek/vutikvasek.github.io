import { FaRegComments } from "react-icons/fa";
import SmartLink from "../basic/SmartLink";
import Descriptor from "../info/Descriptor";

export default function CommentButton({id, comments}) {
  return (
    <Descriptor text="Comment">
      <SmartLink to={`/p/${encodeURIComponent(id)}?focus=true`} className='flex gap-2 items-center group/comments'>
        <div className='p-2 rounded-full group-hover/comments:bg-slate-800 text-gray-500 group-hover/comments:text-white'>
          <FaRegComments />
        </div>
        <p className='ml-[-0.5rem]'>{comments}</p>
      </SmartLink>
    </Descriptor>
  )
}