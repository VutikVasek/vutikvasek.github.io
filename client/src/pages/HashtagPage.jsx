import { Helmet } from 'react-helmet-async';
import Feed from '../components/feed/Feed';
import { useParams } from 'react-router-dom';

const API = import.meta.env.VITE_API_BASE_URL;

export default function HashtagPage() {
  const { hashtag } = useParams();

  return (
    <>
      <Helmet>
        <title>#{hashtag} - Posts - Vutink</title>
      </Helmet>
      <h1 className="title">#{hashtag} - posts</h1>
      <div className='flex justify-center'>
        <Feed url={`${API}/feed/hash/${encodeURIComponent(hashtag)}`} reloadState={hashtag} />
      </div>
    </>
  );
}