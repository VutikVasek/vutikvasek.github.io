const MEDIA = import.meta.env.VITE_MEDIA_BASE_URL;

export default function ProfilePicture({ pfp, ...params }) {
  return (
    <div {...params}>
      <img src={`${MEDIA}/pfp/${pfp}.jpeg`} alt="pfp" className='rounded-full h-full w-full aspect-square'
        onError={(e) => {e.target.onError = null;e.target.src=`${MEDIA}/pfp/default.jpeg`}}
        onDragStart={e => e.preventDefault()} />
    </div>
  )
}