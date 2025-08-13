import LogWall from "@/components/auth/LogWall";
import { useAppContext } from "@/context/AppContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const API = import.meta.env.VITE_API_BASE_URL;

export default function GroupSettings({ groupname }) {
  const [status, setStatus] = useState('');
  const [group, setGroup] = useState('');

  const { showErrorToast } = useAppContext();

  const navigate = useNavigate();

  useEffect(() => {
    if (!groupname) return;
    fetch(`${API}/group/${groupname}`)
    .then(res => res.json())
    .then(data => setGroup(data))
    .catch(err => showErrorToast(err));
  }, [groupname])

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    console.log(data);
    
    const res = await fetch(`${API}/group${group && `/${group._id}/update`}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ name: data.name, description: data.description, 
        isPrivate: data.private === "true", requestJoin: data.requestJoin === "true", everyoneCanPost: data.everyoneCanPost === "true" }),
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
          <input type="text" name="name" id="" className="border border-black" value={group?.name ?? ''} required />
        </div>
        <div className="flex gap-2">
          <p>Description:</p>
          <input type="text" name="description" id="" className="border border-black" value={group?.description ?? ''} />
        </div>
        <div>
          <p>Who can see the group posts:</p>
          <input type="radio" name="private" id="public" value={false} className="mx-2" defaultChecked={group ? !group.private : true} />
          <label htmlFor="public">Everyone</label>
          <input type="radio" name="private" id="private" value={true} className="mx-2" defaultChecked={group ? group.private : false} />
          <label htmlFor="private">Only members</label>
        </div>
        <div>
          <p>Who can post in the group:</p>
          <input type="radio" name="everyoneCanPost" id="everyone" value={true} className="mx-2" defaultChecked={group ? group.everyoneCanPost : true} />
          <label htmlFor="everyone">Members</label>
          <input type="radio" name="everyoneCanPost" id="admins" value={false} className="mx-2" defaultChecked={group ? !group.everyoneCanPost : false}/>
          <label htmlFor="admins">Only admins</label>
        </div>
        <div>
          <p>Do users need to request membership?:</p>
          <input type="radio" name="requestJoin" id="request" value={true} className="mx-2" defaultChecked={group ? group.requestJoin : false} />
          <label htmlFor="request">Yes (you can approve requests in your notifications tab)</label>
          <input type="radio" name="requestJoin" id="anyone" value={false} className="mx-2" defaultChecked={group ? !group.requestJoin : true} />
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