import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
const API = import.meta.env.VITE_API_BASE_URL;

export default function Verified() {
  const [verState, setVerState] = useState('Loading');
  const [showLogin, setShowLogin] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  useEffect(() => {
    const verify = async () => {
      const queryParams = new URLSearchParams(location.search);
      console.log(queryParams);
      const token = queryParams.get('token');
      const email = queryParams.get('email');

      const res = await fetch(`${API}/auth/verify?token=${token}${email ? (`&email=${email}`) : (``)}`);

      const data = await res.json();
      setVerState(data.message);
      if (res.ok) {
        setShowLogin(true);
        logout();
      }
    }
    verify();
  }, []);

  return (
    <>
      <p>{verState}</p>
      {showLogin ? (
        <>
          <button onClick={() => navigate("/login")}>You can now Log in</button>
        </>
      ) : (<></>)}
    </>
  );
}