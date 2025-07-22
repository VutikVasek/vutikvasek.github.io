import { useState } from 'react';
import Feed from '../components/Feed';

export default function FeedPage() {
  const [onlyFollowing, setOnlyFollowing] = useState(false);

  return (
    <>
      <h1 className="text-2xl p-4">Welcome to the feed!</h1>
      <div className='flex gap-4'>
        <button onClick={() => setOnlyFollowing(false)} className={!onlyFollowing ? 'font-semibold' : ''}>Explore</button>
        <button onClick={() => setOnlyFollowing(true)} className={onlyFollowing ? 'font-semibold' : ''}>Following</button>
      </div>
      <div className='flex justify-center'>
        <Feed url={`http://localhost:5000/api/feed${onlyFollowing ? '/following' : ''}`} reloadState={onlyFollowing} />
      </div>
    </>
  );
}