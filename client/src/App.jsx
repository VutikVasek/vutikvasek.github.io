import React, { useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Signup from './pages/Signup';
import Login from './pages/Login';
import FeedPage from './pages/FeedPage';
import Account from './pages/account/Account';
import PostPage from './pages/PostPage';
import Credentials from './pages/account/Credentials';
import Verified from './pages/Verified';
import Profile from './pages/Profile';
import PostFull from './pages/PostFull';
import NotFound from './pages/NotFound';
import Notifications from './pages/Notifications';
import NotificationSettings from './pages/account/NotificationSettings';
import Toast from './components/info/Toast';

import SmartLink from './components/basic/SmartLink';

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { AppContext } from './context/AppContext';

gsap.registerPlugin(useGSAP);

function App() {
  const { isLoggedIn, user } = useAuth();
  const profile = `/u/${user}`;
  const [toastText, setToastText] = useState('');
  const [toastColor, setToastColor] = useState('');
  const [toastReshow, setToastReshow] = useState(false);

  let showInfoToast = (text) => showToast(text, "yellow");
  let showErrorToast = (text) => showToast(text, "red");
  const showToast = (text, color) => {
    setToastText(text);
    setToastColor(color);
    setToastReshow(val => !val);
  }

  return (
    <AppContext.Provider value={{showInfoToast, showErrorToast}}>
      <Router>
        <nav className="w-full p-5 shadow-lg bg-slate-800 text-white flex justify-between">
          <h1 className="text-2xl font-bold flex gap-4 items-center" onClick={() => showInfoToast("hello")}> 
            <img src="/assets/Logo.svg" alt="LOGO" className='h-8' />
            VUTINK
          </h1>
          <div className="panel flex items-middle gap-6">
            <SmartLink to="/" className='px-4 py-2 rounded-md hover:bg-slate-600'>
              <h3>Feed</h3>
            </SmartLink>
            {isLoggedIn ? (
              <>
                <SmartLink to="/post" className='px-4 py-2 rounded-md bg-slate-700 hover:bg-slate-600'>
                  <h3>New Post</h3>
                </SmartLink>
                <SmartLink to="/notifications" className='px-4 py-2 rounded-md hover:bg-slate-600'>
                  <h3>Notifications</h3>
                </SmartLink>
                <SmartLink to={profile}  className='px-4 py-2 rounded-md hover:bg-slate-600'>
                  <h3>Profile</h3>
                </SmartLink>
                <SmartLink to="/account" className='px-4 py-2 rounded-md hover:bg-slate-600'>
                  <h3>Account</h3>
                </SmartLink>
              </>
            ) : (
              <>
                <SmartLink to="/login" className='px-4 py-2 rounded-md hover:bg-slate-600'>
                  <h3>Login</h3>
                </SmartLink>
                <SmartLink to="/signup" className='px-4 py-2 rounded-md hover:bg-slate-600'>
                  <h3>Signup</h3>
                </SmartLink>
              </>
            )}
          </div>
        </nav>
        <Toast text={toastText} color={toastColor} reshow={toastReshow} />
        <Routes>
          <Route path="/" element={<FeedPage />} />
          <Route path="/:following" element={<FeedPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/feed/:following" element={<FeedPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify" element={<Verified />} />
          <Route path="/post" element={<PostPage />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/account">
            <Route index element={<Account />} />
            <Route path="/account/credentials" element={<Credentials />} />
            <Route path="/account/notification-settings" element={<NotificationSettings />} />
          </Route>
          <Route path="/u/:username" element={<Profile />} />
          <Route path="/u/:username/:show" element={<Profile />} />
          <Route path="/p/:postId" element={<PostFull />} />.

          <Route path="*" element={<NotFound />}></Route>
        </Routes>
      </Router>
    </AppContext.Provider>
  );
}

export default App;