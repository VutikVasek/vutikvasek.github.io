import SmartLink from '@/components/basic/SmartLink';
import Feed from '../components/feed/Feed';
import { useParams } from 'react-router-dom';
import GroupList from '@/components/profile/GroupList';

const API = import.meta.env.VITE_API_BASE_URL;

export default function FeedPage() {
  const { subpage } = useParams();
  const username = localStorage.getItem('username');

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
      {subpage === "groups" &&
        <div className='flex items-center justify-between w-full overflow-clip'>
          <div className='overflow-clip w-[calc(100%-5rem)]'>
            <GroupList url={`${API}/profile/user/${encodeURIComponent(username)}/groups`} horizontal={true} />
          </div>
          <SmartLink to={`/u/${encodeURIComponent(username)}/groups`} className="px-8">All</SmartLink>
        </div>
      }
      <div className='flex justify-center'>
        <Feed url={`${API}/feed${subpage ? ("/" + encodeURIComponent(subpage)) : ''}`} reloadState={subpage} />
      </div>
    </>
  );
}