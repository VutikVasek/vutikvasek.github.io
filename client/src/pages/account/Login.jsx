import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GoogleLoginButton from '../../components/auth/GoogleLogin';
import PasswordInput from '@/components/auth/PasswordInput';
const API = import.meta.env.VITE_API_BASE_URL;

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (res.ok) {
      login(data.token, data.user);
      navigate('/feed');
    } else {
      setError(data.message || 'Login failed.');
    }
  };

  const redirect = async () => {
    navigate('/signup')
  } 

  return (
    <form onSubmit={handleLogin} className="max-w-md mx-auto mt-10 space-y-4">
      <h1 className="title">Login</h1>
      <input
        className="w-full textfield p-2"
        type="text"
        placeholder="Username or Email"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <PasswordInput 
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <p className='text-red-400'>{error}</p>
      <div className="w-full flex justify-between gap-4">
        <button className="button w-1/3" type="submit">
          Log In
        </button>
        <GoogleLoginButton />
      </div>
      <div className="text-end text-md text-slate-300">
        Or <a onClick={redirect} className="cursor-pointer font-semibold text-cyan-400">Sign Up</a> if you dont have an account yet
      </div>
    </form>
  );
}
