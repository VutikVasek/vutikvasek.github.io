import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import LogWall from '../components/LogWall';
import PfpUpload from '../components/PfpUpload';

export default function Feed() {
  const [user, setUser] = useState({});
  const [date, setDate] = useState('');
  
  const [bio, setBio] = useState('');
  const [bioError, setBioError] = useState('');

  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate("/feed");
  }

  const handleDeletion = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/api/account/delete', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (res.ok) {
      logout();
      navigate('/feed');
    } else {
    const data = await res.json();
      alert(data.message || 'Deletion failed.');
    }
  }

  const loadAccountInfo = async () => {
    const res = await fetch('http://localhost:5000/api/account/get', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    const data = await res.json();
    if (res.ok) {
      setUser(data.user);
      setBio(data.user.bio);
    } else {
      alert(data.message || 'Loading failed.');
    }
  }

  const handleUpdateBio = async () => {
    const res = await fetch('http://localhost:5000/api/account/changebio', {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ bio })
    });

    const data = await res.json();
    if (res.ok)
      loadAccountInfo();

    setBioError(data.message);
  }

  useEffect(() => {
    loadAccountInfo();
  }, []);

  useEffect(() => {
    const date = new Date(user.createdAt);
    const formatted = date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
    });

    setDate(formatted);
  }, [user.createdAt]);

  return (
    <>
      <LogWall />
      <h1 className="text-2xl p-4">Your Account - {user.username}</h1>
      <div className="flex flex-col content-start flex-wrap m-8">
        <p>Bio:</p>
        <textarea name="" id="" rows="3" 
          className='resize-none border border-black'
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          onFocus={(e) => e.target.rows = 7}
          onBlur={(e) => e.target.rows = 3}
          ></textarea>
        <button className="text-right" onClick={handleUpdateBio}>Update bio</button>
        {bioError}
        <PfpUpload />
        <p>Created in {date}</p>
        <p>Email: {user.email}</p>
        <button onClick={() => navigate("/account/credentials")} className="text-left">Change credentials</button>
        <button onClick={handleLogout} className="text-left">Logout</button>
        <button onClick={handleDeletion} className="text-left">Delete Account</button>
      </div>
    </> 
  );
}