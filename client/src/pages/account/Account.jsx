import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useRef, useState } from 'react';
import LogWall from '@/components/auth/LogWall';
import DeleteButton from '@/components/basic/DeleteButton';
import { IoLogOut, IoLogOutOutline } from 'react-icons/io5';
import ManageNotificationsButton from '@/components/notification/ManageNotificationsButton';
import SmartLink from '@/components/basic/SmartLink';
import { PiSignIn, PiSignInBold } from 'react-icons/pi';
import ProfilePicture from '@/components/media/ProfilePicture';
import ProfilePictureUpload from '@/components/media/ProfilePictureUpload';
import { Helmet } from 'react-helmet-async';
const API = import.meta.env.VITE_API_BASE_URL;

export default function Account() {
  const [user, setUser] = useState({});
  const [date, setDate] = useState('');
  
  const [bio, setBio] = useState('');
  const [bioError, setBioError] = useState('');

  const [showPfpUpload, setShowPfpUpload] = useState(false);

  const navigate = useNavigate();
  const { logout } = useAuth();
  const textareaRef = useRef();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate("/feed");
  }

  const loadAccountInfo = async () => {
    const res = await fetch(`${API}/account/get`, {
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
    const res = await fetch(`${API}/account/changebio`, {
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

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight + 4}px`;
  }, [bio])

  return (
    <>
      <LogWall />
      <Helmet>
        <title>Your Account - Vutink</title>
      </Helmet>
      <h1 className="title">Your Account - {user.username}</h1>
      <div className="flex flex-col content-start flex-wrap m-8 gap-2">
        <div className="rounded-full cursor-pointer" onClick={(e) => setShowPfpUpload(true)}>
          <ProfilePicture pfp={user._id} className="w-36" showCamera={true} />
        </div>
        <div className='w-full'>
          <div className='flex justify-between items-end mb-2'>
            <p>Bio:</p>
            {user.bio !== bio &&
            <button className="button" onClick={handleUpdateBio}>Update bio</button>}
          </div>
          <textarea
            className='resize-none w-full p-2 pl-3 textfield'
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={512}
            ref={textareaRef}
            ></textarea>
          <p className="mt-1 text-red-400">{bioError}</p>
        </div>
        <SmartLink to="credentials" className="group/logout button w-fit flex items-center gap-2">
          <PiSignIn className='inline group-hover/logout:hidden' />
          <PiSignInBold className='hidden group-hover/logout:inline' />
          Change credentials
        </SmartLink>
        <ManageNotificationsButton />
        <button onClick={handleLogout} className="group/logout button w-fit flex items-center gap-2">
          <IoLogOutOutline className='inline group-hover/logout:hidden' />
          <IoLogOut className='hidden group-hover/logout:inline' /> 
          Logout
        </button>
        <p>Email: {user.email}</p>
        <p className='text-slate-400'>Created in {date}</p>
        <DeleteButton url={`${API}/account/delete`} word="account" />
      </div>

      {showPfpUpload && <ProfilePictureUpload close={() => setShowPfpUpload(false)} id={user._id} />}
    </> 
  );
}