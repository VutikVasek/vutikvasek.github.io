import { useState } from "react";
import Confirmation from "../basic/Confirmation";
import { useAuth } from "@/context/AuthContext";
import { FaTrash } from "react-icons/fa";

export default function DeleteButton({url, word, deleteWord = "Delete", className}) {
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
    <div className={className}>
      <button className="text-red-300 flex items-center gap-1" onClick={() => setShowConfirmation(true)}><FaTrash /> {deleteWord} {word}</button>
      {showConfirmation && <Confirmation text={`Do you really want to delete this ${word}?`} onConfirm={onConfirm} />}
    </div>
  )
}