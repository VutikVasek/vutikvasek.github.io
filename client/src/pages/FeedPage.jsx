import SmartLink from '@/components/basic/SmartLink';
import Feed from '../components/feed/Feed';
import { useParams } from 'react-router-dom';
import GroupList from '@/components/profile/GroupList';
import Tabs from '@/components/nav/Tabs';
import { Helmet } from 'react-helmet-async';

const API = import.meta.env.VITE_API_BASE_URL;

export default function FeedPage() {
  const { subpage } = useParams();
  const username = localStorage.getItem('username');

  return (
    <>
      <Helmet>
        <title>{subpage ? (String(subpage).charAt(0).toUpperCase() + String(subpage).slice(1)) : "Explore"} - Vutink</title>
      </Helmet>
      { localStorage.getItem('token') &&
      <Tabs selected={subpage || "feed"}>
        <SmartLink to="/feed" id="feed">Explore</SmartLink>
        <SmartLink to="/feed/following" id="following">Following</SmartLink>
        <SmartLink to="/feed/groups" id="groups">Groups</SmartLink>
      </Tabs>
      }
      {subpage === "groups" &&
        <div className='flex items-center justify-between w-full overflow-clip my-8'>
          <div className='overflow-clip flex flex-1 w-0'>
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