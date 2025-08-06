import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogWall from '../components/auth/LogWall';
import { validatePost } from '../tools/validate';
import MediaSelector from '@/components/media/MediaSelector';
import { useAppContext } from '@/context/AppContext';
import TextInput from '@/components/basic/TextInput';
const API = import.meta.env.VITE_API_BASE_URL;

export default function PostPage() {
  const [text, setText] = useState('');
  const [buttonText, setButtonText] = useState('Post');
  const [error, setError] = useState('');
  const [rerenderState, setRerenderState] = useState(false);
  const [mentions, setMentions] = useState(null);

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
      body: JSON.stringify({ text: text.trim(), mentions }),
    });

    const data = await res.json();
    if (!res.ok) alert(data.message || 'Posting failed.');
    
    setButtonText('Posting');

    await mediaSelector?.current?.upload(data._id); 

    navigate('/');
  }

  const rerender = () => setRerenderState(val => !val);

  return (
    <>
      <LogWall />
      <form onSubmit={handleSubmitingPost}>
        <h1>Make a new post!</h1>
        <TextInput text={text} setText={setText} setDBMentions={setMentions} onDrop={mediaSelector.current?.handleDrop} rows={6} />
        <div className='flex flex-col gap-4'>
          <MediaSelector max={2} ref={mediaSelector} rerender={rerender} flex="justify-around w-fit" className="h-10 w-10 p-2" />
          <div className={mediaSelector.current?.getFileCount() ? "h-20" : ""}>
            {mediaSelector.current?.getFiles()}
          </div>
        </div>
        <p className="whitespace-pre-wrap">{error}</p>
        <button type="submit" onClick={handleSubmitingPost}>{buttonText}</button>
      </form>
    </>
  );
}