import { useRef, useState } from 'react';

export default function PfpUpload() {
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
    formData.append('pfp', file);

    const res = await fetch('http://localhost:5000/api/upload/pfp', {
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
