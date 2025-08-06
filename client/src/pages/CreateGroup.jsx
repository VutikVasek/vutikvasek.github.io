import LogWall from "@/components/auth/LogWall";
import { useAppContext } from "@/context/AppContext";
import { useState } from "react";
const API = import.meta.env.VITE_API_BASE_URL;

export default function CreateGroup({}) {
  const [status, setStatus] = useState('');

  const { showErrorToast } = useAppContext();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    const res = await fetch(`${API}/group`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ name: data.name, isPrivate: data.private === "true", everyoneCanPost: data.everyoneCanPost }),
    });

    const resData = await res.json();
    console.log(resData);
    if (!res.ok) return showErrorToast(resData.message || 'Posting failed.');

    if (data.gp) {

      const imageData = new FormData();
      imageData.append('gp', data.gp);

      const res = await fetch(`${API}/upload/gp/${resData.group._id}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: imageData,
      });

      const resData2 = await res.json();
      console.log(resData2);
      if (!res.ok) return showErrorToast(resData2.message || 'Posting failed.');
    }
  }
  
  return (
    <div>
      <LogWall />
      <form onSubmit={handleSubmit}>
        <div className="flex gap-2">
          <p>Name:</p>
          <input type="text" name="name" id="" className="border border-black" required />
        </div>
        <div>
          <p>Who can see the group posts:</p>
          <input type="radio" name="private" id="public" value={false} className="mx-2" defaultChecked />
          <label htmlFor="public">Everyone</label>
          <input type="radio" name="private" id="private" value={true} className="mx-2" />
          <label htmlFor="private">Only members</label>
        </div>
        <div>
          <p>Who can post in the group:</p>
          <input type="radio" name="everyoneCanPost" id="everyone" value={true} className="mx-2" defaultChecked />
          <label htmlFor="everyone">Everyone</label>
          <input type="radio" name="everyoneCanPost" id="admins" value={false} className="mx-2" />
          <label htmlFor="admins">Only admins</label>
        </div>
        <input
          type="file"
          accept="image/*"
          className="block"
          name="gp"
        />
        <input type="submit" value="Create" className="cursor-pointer" />
      </form>
    </div>
  )
}