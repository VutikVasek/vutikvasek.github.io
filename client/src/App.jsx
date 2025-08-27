import React, { useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import FeedPage from './pages/FeedPage';
import PostPage from './pages/PostPage';
import PostFull from './pages/PostFull';

import Signup from './pages/account/Signup';
import Login from './pages/account/Login';
import Account from './pages/account/Account';
import Credentials from './pages/account/Credentials';
import Verified from './pages/account/Verified';
import Notifications from './pages/Notifications';
import NotificationSettings from './pages/account/NotificationSettings';

import NotFound from './pages/NotFound';

import Profile from './pages/Profile';
import CreateGroup from './pages/group/CreateGroup';
import GroupPage from './pages/group/GroupPage';
import GroupSettingsPage from './pages/group/GroupSettingsPage';

import HashtagPage from './pages/HashtagPage';
import Search from './pages/Search'

import Toast from './components/info/Toast';

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { AppContext } from './context/AppContext';
import NavBar from './components/nav/NavBar';

gsap.registerPlugin(useGSAP);

function App() {
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
        <div className='flex bg-slate-950 text-white min-h-screen'>
          <div className='w-[50%] flex justify-end pr-16'>
            <NavBar />
          </div>
          <div className='w-full'>
            <Routes>
              <Route path="/" element={<FeedPage />} />
              <Route path="/feed" element={<FeedPage />} />
              <Route path="/feed/:subpage" element={<FeedPage />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/verify" element={<Verified />} />
              <Route path="/post" element={<PostPage />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/search" element={<Search />} />
              <Route path="/account">
                <Route index element={<Account />} />
                <Route path="/account/credentials" element={<Credentials />} />
                <Route path="/account/notification-settings" element={<NotificationSettings />} />
              </Route>
              <Route path="/u/:username" element={<Profile />} />
              <Route path="/u/:username/:show" element={<Profile />} />
              <Route path="/p/:postId" element={<PostFull />} />
              <Route path="/g/:groupname" element={<GroupPage />} />
              <Route path="/g/:groupname/:show" element={<GroupPage />} />
              <Route path="/g/:groupname/settings" element={<GroupSettingsPage />} />
              <Route path="/create-group" element={<CreateGroup />} />
              <Route path="/h/:hashtag" element={<HashtagPage />} />

              <Route path="*" element={<NotFound />}></Route>
            </Routes>
          </div>
          <div className='w-[50%]'></div>
        </div>
        <Toast text={toastText} color={toastColor} reshow={toastReshow} />
      </Router>
    </AppContext.Provider>
  );
}

export default App;