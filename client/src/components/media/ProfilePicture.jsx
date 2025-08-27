import { MdOutlineAddAPhoto } from "react-icons/md";

const MEDIA = import.meta.env.VITE_MEDIA_BASE_URL;

export default function ProfilePicture({ pfp, url, path = "pfp", showCamera, className, ...params }) {
  return (
    <div className={"relative group/pfp " + className} {...params}>
      <img src={url ? url : `${MEDIA}/${encodeURIComponent(path)}/${encodeURIComponent(pfp)}.jpeg`} alt={path} 
        className='rounded-full h-full w-full aspect-square group-hover/pfp:opacity-80'
        onError={(e) => {e.target.onError = null;e.target.src=`${MEDIA}/${encodeURIComponent(path)}/default.jpeg`}}
        onDragStart={e => e.preventDefault()} />
        {showCamera &&
        <div className="w-full h-full absolute top-0 flex justify-center items-center text-3xl">
          <div className="p-4 bg-black bg-opacity-40 rounded-full hidden group-hover/pfp:block">
            <MdOutlineAddAPhoto />
          </div>
        </div>}
    </div>
  )
}