import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GoogleLoginButton from '../components/auth/GoogleLogin';
import { validatePassword, validateUsername } from '../tools/validate';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVer, setPasswordVer] = useState('');
  const [failed, setFailed] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  
  const redirect = async () => {
    navigate('/login')
  }

  const handleSignup = async (e) => {
    e.preventDefault();

    const usernameError = validateUsername(username);
    if (usernameError) {
      setError(usernameError);
      return;
    }

    if (password != passwordVer) {
      setError("Passwords don't match! Please try again.");
      return
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    const res = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    if (res.ok) {
      setError('Please verify your email in your inbox.');
    } else {
      const data = await res.json();
      setFailed(true);
      setError(data.message || 'Signup failed.');
    }
  };

  return (
    <form onSubmit={handleSignup} className="max-w-md mx-auto mt-10 space-y-4">
      <h2 className="text-2xl font-bold">Signup</h2>
      <input
        className="w-full border p-2 rounded"
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        maxLength={50}
        required
      />
      <input
        className="w-full border p-2 rounded"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        className="w-full border p-2 rounded"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        minLength={6}
        maxLength={32}
        required
      />
      <input
        className="w-full border p-2 rounded"
        type="password"
        placeholder="Password again"
        value={passwordVer}
        onChange={(e) => setPasswordVer(e.target.value)}
        minLength={6}
        maxLength={32}
        required
      />
      <p>{error}</p>
      
      <div className="w-full flex justify-between gap-4">
        <button className="bg-blue-500 text-white px-4 py-2 rounded w-1/3" type="submit">
          Sign Up
        </button>
        <GoogleLoginButton />
      </div>
      {failed ? (
        <div className="text-end text-md text-slate-700 pt-4">
        Or <a onClick={redirect} className="cursor-pointer font-semibold text-slate-900">Log in</a> if you already have an account
        </div>
      ) : (
        <></>
      )}
    </form>
  );
}
