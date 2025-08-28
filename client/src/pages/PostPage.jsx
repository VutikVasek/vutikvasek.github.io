import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LogWall from '../components/auth/LogWall';
import { validatePost } from '../tools/validate';
import MediaSelector from '@/components/media/MediaSelector';
import { useAppContext } from '@/context/AppContext';
import TextInput from '@/components/basic/TextInput';
import { Helmet } from 'react-helmet-async';
const API = import.meta.env.VITE_API_BASE_URL;

export default function PostPage() {
  const [text, setText] = useState('');
  const [buttonText, setButtonText] = useState('Post');
  const [error, setError] = useState('');
  const [rerenderState, setRerenderState] = useState(false);
  const [mentions, setMentions] = useState(null);
  const [groups, setGroups] = useState(null);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const replyingTo = queryParams.get('rep');
  const author = queryParams.get('author');

  const navigate = useNavigate();
  const { showErrorToast } = useAppContext();

  const mediaSelector = useRef(null);

  const maxLength = 512;

  const handleSubmitingPost = async (e) => {
    e.preventDefault();

    if (mediaSelector.current?.stillLoading()) 
      return showErrorToast("Please wait for the media to upload before posting")

    setText(text.trim());

    const textValidation = validatePost(text);

    if (textValidation) {
      setError(textValidation);
      return;
    }

    const res = await fetch(`${API}/post`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ text: text.trim(), mentions, groups, replyingTo }),
    });

    const data = await res.json();
    if (!res.ok) {
      showErrorToast(data.message || "Posting failed");
      setError(data.message || "Posting failed");
      return;
    };
    
    setButtonText('Posting');

    await mediaSelector?.current?.upload(data._id); 

    navigate('/');
  }

  const rerender = () => setRerenderState(val => !val);

  return (
    <>
      <LogWall />
      <Helmet>
        <title>New Post - Vutink</title>
      </Helmet>
      <form onSubmit={e => e.preventDefault()}>
        <h1 className='title'>
          {
            replyingTo ?
              (author ? 
                `Replying to a post from ${author}` :
                "Replying to a post") :
            "New post"
          }
        </h1>
        
        <TextInput 
          text={text} 
          setText={setText} 
          setDBMentions={setMentions} 
          setDBGroups={setGroups} 
          onDrop={mediaSelector.current?.handleDrop} 
          rows={6} 
          handleSubmit={handleSubmitingPost}
          mediaSelector={mediaSelector}
          rerender={rerender} />
        <p className="mt-1 text-red-400">{error}</p>
      </form>
    </>
  );
}