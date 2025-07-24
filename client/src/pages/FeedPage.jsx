import Feed from '../components/Feed';
import { Link, useParams } from 'react-router-dom';

export default function FeedPage() {
  const { following } = useParams();

  return (
    <>
      <h1 className="text-2xl p-4">Welcome to the feed!</h1>
      { localStorage.getItem('token') &&
        <div className='flex gap-4'>
          <Link to="/feed" className={!following ? 'font-semibold' : ''}>Explore</Link>
          <Link to="/feed/following" className={following=="following" ? 'font-semibold' : ''}>Following</Link>
        </div>
      }
      <div className='flex justify-center'>
        <Feed url={`http://localhost:5000/api/feed${following ? ("/" + following) : ''}`} reloadState={following} />
      </div>
    </>
  );
}