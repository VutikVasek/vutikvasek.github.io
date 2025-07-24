import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Signup from './pages/Signup';
import Login from './pages/Login';
import FeedPage from './pages/FeedPage';
import Account from './pages/Account';
import PostPage from './pages/PostPage';
import Credentials from './pages/Credentials';
import Verified from './pages/Verified';
import Profile from './pages/Profile';
import PostFull from './pages/PostFull';
import NotFound from './pages/NotFound';

function App() {
  const { isLoggedIn, user } = useAuth();
  const profile = `/u/${user}`;

  return (
    <Router>
      <nav className="w-full p-5 shadow-lg bg-slate-800 text-white flex justify-between">
        <h1 className="text-2xl font-bold flex gap-4 items-center"> 
          <img src="/assets/Logo.svg" alt="LOGO" className='h-8' />
          VUTINK
        </h1>
        <div className="panel flex items-middle gap-6">
          <Link to="/" className='px-4 py-2 rounded-md hover:bg-slate-600'>
            <h3>Feed</h3>
          </Link>
          {isLoggedIn ? (
            <>
              <Link to="/post" className='px-4 py-2 rounded-md bg-slate-700 hover:bg-slate-600'>
                <h3>New Post</h3>
              </Link>
              <Link to={profile}  className='px-4 py-2 rounded-md hover:bg-slate-600'>
                <h3>Profile</h3>
              </Link>
              <Link to="/account" className='px-4 py-2 rounded-md hover:bg-slate-600'>
                <h3>Account</h3>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className='px-4 py-2 rounded-md hover:bg-slate-600'>
                <h3>Login</h3>
              </Link>
              <Link to="/signup" className='px-4 py-2 rounded-md hover:bg-slate-600'>
                <h3>Signup</h3>
              </Link>
            </>
          )}
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<FeedPage />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify" element={<Verified />} />
        <Route path="/post" element={<PostPage />} />
        <Route path="/account">
          <Route index element={<Account />} />
          <Route path="/account/credentials" element={<Credentials />} />
        </Route>
        <Route path="/u/:username" element={<Profile />} />
        <Route path="/u/:username/:show" element={<Profile />} />
        <Route path="/p/:postId" element={<PostFull />} />.

        <Route path="*" element={<NotFound />}></Route>
      </Routes>
    </Router>
  );
}

export default App;