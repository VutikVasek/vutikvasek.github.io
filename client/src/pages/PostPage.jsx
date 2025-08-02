import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogWall from '../components/auth/LogWall';
import { validatePost } from '../tools/validate';
import { IoClose } from "react-icons/io5";
import { useAppContext } from '@/context/AppContext';
const API = import.meta.env.VITE_API_BASE_URL;

export default function PostPage() {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const fileInputRef = useRef();
  const [files, setFiles] = useState([]);

  const { showErrorToast } = useAppContext();

  const maxLength = 512;

  const handleSubmitingPost = async (e) => {
    e.preventDefault();

    setText(text.trim());

    const textValidation = validatePost(text);

    if (textValidation) {
      setError(textValidation);
      return;
    }

    const img1 = files[0];
    const img2 = files[1];

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
    
    if (img1) await uploadImage(img1, data._id, 0);
    if (img2) await uploadImage(img2, data._id, 1);

    navigate('/');
  }

  const uploadImage = async (file, postId, index) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('index', index);
    formData.append('postId', postId);

    const res = await fetch(`${API}/upload/image`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    const data = await res.json();
    if (!res.ok) alert(data.message || 'Upload failed');
  }

  const addToFiles = (arr) => {
    const filtered = arr.filter(file => {
      if (file.type.split('/')[0] === "image") return file;
      showErrorToast("You can only upload images");
    })
    if (filtered.length + files.length > 2) showErrorToast("You can only upload up to 2 images");
    setFiles((prev) => [...prev, ...filtered].slice(0, 2));
  }

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    addToFiles(selectedFiles);
    e.target.value = null;
  }

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addToFiles(Array.from(e.dataTransfer.files));
      e.dataTransfer.clearData();
    }
  }

  const handleRemoveFile = (index) => {
    setFiles((prev) => {
      let arr = [...prev];
      arr.splice(index, 1);
      return arr; 
    })
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
        <div className='flex gap-4'>
          <div>
            <label htmlFor="image" className='block cursor-pointer p-20 border border-black w-fit'
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}>Click or drag images</label>
            <input type="file" name="image" id="image" accept="image/*" multiple 
              onChange={handleFileChange} 
              ref={fileInputRef}
              className='hidden'
              />
          </div>
          <div className='p-6'>
            {files.map((file, index) => (
              <div className='flex items-center gap-2' key={index}>
                {file.name}
                <div className='cursor-pointer' onClick={() => handleRemoveFile(index)}>
                  <IoClose />
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="whitespace-pre-wrap">{error}</p>
        <button type="submit" onClick={handleSubmitingPost}>Post</button>
      </form>
    </>
  );
}