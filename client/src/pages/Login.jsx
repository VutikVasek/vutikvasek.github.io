import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleLoginButton from '../components/auth/GoogleLogin';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/api/auth/login', {
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
      <h2 className="text-2xl font-bold">Login</h2>
      <input
        className="w-full border p-2 rounded"
        type="text"
        placeholder="Username or Email"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        className="w-full border p-2 rounded"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <p>{error}</p>
      <div className="w-full flex justify-between gap-4">
        <button className="bg-green-500 text-white px-4 py-2 rounded w-1/3" type="submit">
          Log In
        </button>
        <GoogleLoginButton />
      </div>
      <div className="text-end text-md text-slate-700">
        Or <a onClick={redirect} className="cursor-pointer font-semibold text-slate-900">Sign Up</a> if you dont have an account yet
      </div>
    </form>
  );
}
