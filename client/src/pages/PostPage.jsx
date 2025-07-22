import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogWall from '../components/LogWall';
import { validatePost } from '../tools/validate';


export default function PostPage() {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const maxLength = 512;

  const handleSubmitingPost = async (e) => {
    e.preventDefault();

    setText(text.trim());

    const textValidation = validatePost(text);

    if (textValidation) {
      setError(textValidation);
      return;
    }

    const res = await fetch('http://localhost:5000/api/post', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ text }),
    });

    if (res.ok) {
      navigate('/');
    } else {
      const data = await res.json();
      alert(data.message || 'Posting failed.');
    }
  }

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
        ></textarea>
        <p className="whitespace-pre-wrap">{error}</p>
        <button type="submit" onClick={handleSubmitingPost}>Post</button>
      </form>
    </>
  );
}