import LogWall from "@/components/auth/LogWall";
import { useAppContext } from "@/context/AppContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
const API = import.meta.env.VITE_API_BASE_URL;

export default function CreateGroup({}) {
  const [status, setStatus] = useState('');

  const { showErrorToast } = useAppContext();

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    console.log(data);
    
    const res = await fetch(`${API}/group`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ name: data.name, description: data.description, 
        isPrivate: data.private === "true", requestJoin: data.requestJoin === "true", everyoneCanPost: data.everyoneCanPost }),
    });

    const resData = await res.json();
    if (!res.ok) return showErrorToast(resData.message || 'Posting failed.');

    if (data.gp?.size > 0) {

      const imageData = new FormData();
      imageData.append('gp', data.gp);

      const res = await fetch(`${API}/upload/gp/${resData.group._id}`, {
        method: 'POST',
        body: imageData,
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const resData2 = await res.json();
      if (!res.ok) return showErrorToast(resData2.message || 'Posting failed.');
    }

    navigate(`/g/${encodeURIComponent(resData.group.name)}`);
  }
  
  return (
    <div>
      <LogWall />
      <form onSubmit={handleSubmit}>
        <div className="flex gap-2">
          <p>Name:</p>
          <input type="text" name="name" id="" className="border border-black" required />
        </div>
        <div className="flex gap-2">
          <p>Description:</p>
          <input type="text" name="description" id="" className="border border-black" />
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
          <label htmlFor="everyone">Members</label>
          <input type="radio" name="everyoneCanPost" id="admins" value={false} className="mx-2" />
          <label htmlFor="admins">Only admins</label>
        </div>
        <div>
          <p>Do users need to request membership?:</p>
          <input type="radio" name="requestJoin" id="request" value={true} className="mx-2" />
          <label htmlFor="request">Yes (you can approve requests in your notifications tab)</label>
          <input type="radio" name="requestJoin" id="anyone" value={false} className="mx-2" defaultChecked />
          <label htmlFor="anyone">Anyone can join without requesting</label>
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