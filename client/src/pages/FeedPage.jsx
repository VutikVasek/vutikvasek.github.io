import SmartLink from '@/components/basic/SmartLink';
import Feed from '../components/feed/Feed';
import { useParams } from 'react-router-dom';

export default function FeedPage() {
  const { following } = useParams();

  return (
    <>
      <h1 className="text-2xl p-4">Welcome to the feed!</h1>
      { localStorage.getItem('token') &&
        <div className='flex gap-4'>
          <SmartLink to="/feed" className={!following ? 'font-semibold' : ''}>Explore</SmartLink>
          <SmartLink to="/feed/following" className={following=="following" ? 'font-semibold' : ''}>Following</SmartLink>
        </div>
      }
      <div className='flex justify-center'>
        <Feed url={`http://localhost:5000/api/feed${following ? ("/" + following) : ''}`} reloadState={following} />
      </div>
    </>
  );
}