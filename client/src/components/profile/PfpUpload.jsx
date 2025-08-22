import { useRef, useState } from 'react';
const API = import.meta.env.VITE_API_BASE_URL;

export default function PfpUpload({type = "pfp"}) {
  const fileInputRef = useRef();
  const [status, setStatus] = useState('');

  const handleUpload = async (e) => {
    setStatus('Uploading...');
    e.preventDefault();
    const file = fileInputRef.current.files[0];
    if (file) {
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
    <>
      <form onSubmit={handleUpload}>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          required
        />
        <button type="submit">Upload Profile Picture</button>
      </form>
      <p className='pl-4'>{status}</p>
    </>
  );
}
