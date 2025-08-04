import { useState } from "react";
import Confirmation from "../basic/Confirmation";
import { useAuth } from "@/context/AuthContext";

export default function DeleteButton({url, word}) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { logout } = useAuth();

  const onConfirm = async (val) => {
    if (!val) return setShowConfirmation(false);

    const res = await fetch(url, {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });

    if (!res.ok) {
      const data = await res.json();
      console.log(data.message)
    }

    if (word == "account") logout();

    window.location.reload();
  }

  return (
    <div className="z-50">
      <button className="bg-red-400 text-white" onClick={() => setShowConfirmation(true)}>Delete {word}</button>
      {showConfirmation && <Confirmation text={`Do you really want to delete this ${word}?`} onConfirm={onConfirm} />}
    </div>
  )
}