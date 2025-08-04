import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogWall from '../components/auth/LogWall';
import { validatePost } from '../tools/validate';
import MediaSelector from '@/components/media/MediaSelector';
import { useAppContext } from '@/context/AppContext';
const API = import.meta.env.VITE_API_BASE_URL;

export default function PostPage() {
  const [text, setText] = useState('');
  const [buttonText, setButtonText] = useState('Post');
  const [error, setError] = useState('');
  const [rerenderState, setRerenderState] = useState(false);
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
      body: JSON.stringify({ text: text.trim() }),
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
        <textarea
          className="border border-black resize-none"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='Start typing here...'
          autoFocus
          maxLength={maxLength}
          cols='100'
          rows='10'
          onDragOver={(e) => e.preventDefault()}
          onDrop={mediaSelector.current?.handleDrop}
        ></textarea>
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