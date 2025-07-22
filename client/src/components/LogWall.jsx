import { useEffect } from "react";
import { useNavigate } from 'react-router-dom';

export default function LogWall() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('token')) navigate("/feed");
  }, []);

  return (
    <></>
  );
}