const MEDIA = import.meta.env.VITE_MEDIA_BASE_URL;

export default function ProfilePicture({ pfp, path = "pfp", ...params }) {
  return (
    <div {...params}>
      <img src={`${MEDIA}/${path}/${pfp}.jpeg`} alt={path} className='rounded-full h-full w-full aspect-square'
        onError={(e) => {e.target.onError = null;e.target.src=`${MEDIA}/${path}/default.jpeg`}}
        onDragStart={e => e.preventDefault()} />
    </div>
  )
}