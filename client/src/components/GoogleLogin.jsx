import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

export default function GoogleLoginButton() {
  const navigate = useNavigate();
  const { login, isLoggedIn } = useAuth();

  useEffect(() => { if (isLoggedIn) navigate("/feed") }, [isLoggedIn]);

  const handleGoogleLogin = async (credentialResponse) => {
    const { credential } = credentialResponse;
    const decoded = jwtDecode(credential);

    const res = await fetch('http://localhost:5000/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: credential }),
    });

    const data = await res.json();
    if (res.ok) {
      login(data.token, data.user);
      navigate('/feed');
    } else {
      alert(data.message || 'Google Sign-in failed');
    }
  };

  return (
    <div className="w-2/3">
      <GoogleLogin onSuccess={handleGoogleLogin} onError={() => alert('Google Sign-in failed')} />
    </div>
  );
}