import SmartLink from '@/components/basic/SmartLink';
import Feed from '../components/feed/Feed';
import { useParams } from 'react-router-dom';

const API = import.meta.env.VITE_API_BASE_URL;

export default function FeedPage() {
  const { subpage } = useParams();

  return (
    <>
      <h1 className="text-2xl p-4">Welcome to the feed!</h1>
      { localStorage.getItem('token') &&
        <div className='flex gap-4'>
          <SmartLink to="/feed" className={!subpage ? 'font-semibold' : ''}>Explore</SmartLink>
          <SmartLink to="/feed/following" className={subpage=="following" ? 'font-semibold' : ''}>Following</SmartLink>
          <SmartLink to="/feed/groups" className={subpage=="groups" ? 'font-semibold' : ''}>Groups</SmartLink>
        </div>
      }
      <div className='flex justify-center'>
        <Feed url={`${API}/feed${subpage ? ("/" + subpage) : ''}`} reloadState={subpage} />
      </div>
    </>
  );
}