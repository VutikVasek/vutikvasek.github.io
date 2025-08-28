import LogWall from "@/components/auth/LogWall";
import { useAppContext } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import ProfilePicture from "../media/ProfilePicture";
import { useEffect, useState } from "react";
const API = import.meta.env.VITE_API_BASE_URL;

export default function GroupSettings({ group }) {

  const { showErrorToast, showInfoToast } = useAppContext();

  const [url, setURL] = useState('');
  const [file, setFile] = useState();

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    const res = await fetch(`${API}/group${group ? `/${encodeURIComponent(group._id)}/update` : ""}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ name: data.name, description: data.description.split('').slice(0, 100).join(''), 
        isPrivate: data.private === "true", requestJoin: data.requestJoin === "true", everyoneCanPost: data.everyoneCanPost === "true" }),
    });

    const resData = await res.json();
    if (!res.ok) return showErrorToast(resData.message || 'Posting failed.');

    if (data.gp?.size > 0) {

      const imageData = new FormData();
      imageData.append('gp', data.gp);

      const res = await fetch(`${API}/upload/gp/${encodeURIComponent(resData.group._id)}`, {
        method: 'POST',
        body: imageData,
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const resData2 = await res.json();
      if (!res.ok) return showErrorToast(resData2.message || 'Posting failed.');
    }

    if (resData.group.name) navigate(`/g/${encodeURIComponent(resData.group.name)}`);
    else showInfoToast("Group updated");
  }

  useEffect(() => {
    if (!file) return;
    const urlString = URL.createObjectURL(file);
    setURL(urlString);

    return () => {
      URL.revokeObjectURL(urlString);
    };
  }, [file]);
  
  return (
    <div>
      <LogWall />
      <h1 className="title">{group ? "Group settings" : "Create group"}</h1>
      <form onSubmit={handleSubmit} className="[&>*]:mt-4">
        <div className="flex gap-8">
          <label htmlFor="gp" className="h-full rounded-full block cursor-pointer">
            <ProfilePicture path="gp" url={url} showCamera={true} className="h-32" />
          </label>
          <div className="flex flex-col justify-end gap-4">
            <div className="flex gap-4 items-center">
              <p>Name:</p>
              <input type="text" name="name" id="name" className="textfield p-2 rounded-[0.25rem]" defaultValue={group?.name ?? ''} placeholder="Group name" required />
            </div>
            <div className="flex gap-4 items-center">
              <p>Description:</p>
              <input type="text" name="description" id="description" className="textfield p-2 rounded-[0.25rem]" maxLength={100} defaultValue={group?.description ?? ''} placeholder="Grroup description" />
            </div>
          </div>
        </div>
        <div>
          <p>Who can see the group posts:</p>
          <input type="radio" name="private" id="public" value={false} className="mx-2 peer/public hidden" defaultChecked={group ? !group.private : true} />
          <label htmlFor="public" className="radio peer-checked/public:text-white peer-checked/public:bg-slate-800">Everyone</label>
          <input type="radio" name="private" id="private" value={true} className="mx-2 peer/private hidden" defaultChecked={group ? group.private : false} />
          <label htmlFor="private" className="radio peer-checked/private:text-white peer-checked/private:bg-slate-800">Only members</label>
        </div>
        <div>
          <p>Who can post in the group:</p>
          <input type="radio" name="everyoneCanPost" id="everyone" value={true} className="mx-2 peer/everyone hidden" defaultChecked={group ? group.everyoneCanPost : true} />
          <label htmlFor="everyone" className="radio peer-checked/everyone:text-white peer-checked/everyone:bg-slate-800">Members</label>
          <input type="radio" name="everyoneCanPost" id="admins" value={false} className="mx-2 peer/admins hidden" defaultChecked={group ? !group.everyoneCanPost : false}/>
          <label htmlFor="admins" className="radio peer-checked/admins:text-white peer-checked/admins:bg-slate-800">Only admins</label>
        </div>
        <div>
          <p>Do users need to request membership?:</p>
          <input type="radio" name="requestJoin" id="request" value={true} className="mx-2 peer/request hidden" defaultChecked={group ? group.requestJoin : false} />
          <label htmlFor="request" className="radio peer-checked/request:text-white peer-checked/request:bg-slate-800 block w-fit">Yes (you can approve requests in your notifications tab)</label>
          <input type="radio" name="requestJoin" id="anyone" value={false} className="mx-2 peer/anyone hidden" defaultChecked={group ? !group.requestJoin : true} />
          <label htmlFor="anyone" className="radio peer-checked/anyone:text-white peer-checked/anyone:bg-slate-800">Anyone can join without requesting</label>
        </div>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          name="gp"
          id="gp"
          onChange={e => setFile(e.target.files[0])}
        />
        <input type="submit" value={group ? "Save" : "Create"} className="button [&]:mt-8" />
      </form>
    </div>
  )
}