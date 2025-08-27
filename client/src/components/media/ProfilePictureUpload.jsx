import { useEffect, useRef, useState } from "react";
import FullScreen from "../basic/FullScreen";
const MEDIA = import.meta.env.VITE_MEDIA_BASE_URL;
const API = import.meta.env.VITE_API_BASE_URL;

export default function ProfilePictureUpload({type = "pfp", id, close}) {
  const [status, setStatus] = useState('');
  const [file, setFile] = useState();
  const [url, setURL] = useState('');

  const handleOnChange = e => {
    setFile(e.target.files[0]);
    e.target.value = null;
  }
  
  useEffect(() => {
    if (!file) return;
    const urlString = URL.createObjectURL(file);
    setURL(urlString);

    return () => {
      URL.revokeObjectURL(urlString);
    };
  }, [file]);

  

  useEffect(() => {
    console.log(url)
  }, [url])
  
  const handleUpload = async (e) => {
    if (file) {
      setStatus('Uploading...');
      await uploadPfp(file);
    }
  };

  const uploadPfp = async (file) => {
    const formData = new FormData();
    formData.append(type, file);

    const res = await fetch(`${API}/upload/${encodeURIComponent(type)}`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    const data = await res.json();
    if (res.ok) {
      setStatus('Profile picture uploaded!');
    } else {
      setStatus(data.message || 'Upload failed');
    }
  };

  return (
    <FullScreen onClick={close}>
      <div className="bg-slate-800 p-8" onClick={e => e.stopPropagation()}>
        <h1 className="text-xl text-center mb-8">Change your profile picture</h1>
        <div className="flex gap-8">
          <label htmlFor="pfpSelect">
            <img src={url || `${MEDIA}/${encodeURIComponent(type)}/${encodeURIComponent(id)}.jpeg`} alt={type} 
              className='rounded-full h-56 aspect-square group-hover/pfp:opacity-80 cursor-pointer object-cover'
              onError={(e) => {e.target.onError = null;e.target.src=`${MEDIA}/${encodeURIComponent(type)}/default.jpeg`}}
              onDragStart={e => e.preventDefault()} />
          </label>
          <div className="flex flex-col justify-evenly gap-2">
            <label htmlFor="pfpSelect" className="button flex justify-center cursor-pointer">Select</label>
            <button className="button" onClick={close}>Cancel</button>
            <button className="button" onClick={handleUpload}>Save</button>
          </div>
        </div>
        <p className="mt-4">{status}</p>
        <input type="file" accept="image/*" id="pfpSelect" className="hidden" onChange={handleOnChange} />
      </div>
    </FullScreen>
  )
}