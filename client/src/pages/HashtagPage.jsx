import Feed from '../components/feed/Feed';
import { useParams } from 'react-router-dom';

const API = import.meta.env.VITE_API_BASE_URL;

export default function HashtagPage() {
  const { hashtag } = useParams();

  return (
    <>
      <h1 className="text-2xl p-4">#{hashtag}</h1>
      <div className='flex justify-center'>
        <Feed url={`${API}/feed/hash/${encodeURIComponent(hashtag)}`} reloadState={hashtag} />
      </div>
    </>
  );
}