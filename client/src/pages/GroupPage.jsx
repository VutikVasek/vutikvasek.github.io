import SmartLink from "@/components/basic/SmartLink";
import Feed from "@/components/feed/Feed";
import ProfilePicture from "@/components/media/ProfilePicture";
import UserList from "@/components/profile/UserList";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
const API = import.meta.env.VITE_API_BASE_URL;

export default function GroupPage({}) {
  const { groupname, show } = useParams();
  const [group, setGroup] = useState({});
  const [deleted, setDeleted] = useState();
  const [date, setDate] = useState('');

  const loadGroup = async () => {
    if (groupname == "<deleted>") {
      setGroup({name: "This account was deleted"});
      setDeleted(true);
      return;
    }
    fetch(`${API}/group/${encodeURIComponent(groupname)}`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }})
      .then(res => res.json())
      .then(data => setGroup(data))
      .catch(err => console.log(err));
  }

  useEffect(() => {
    setDate(new Date(group.createdAt).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
    }))
  }, [group]);

  useEffect(() => {
    loadGroup();
  }, []);

  if (deleted) return <p>This group was deleted</p>
  if (!group) return <p>Loading...</p>;

  return  (
    <>
      <div className="flex flex-col">
        <ProfilePicture path="gp" pfp={group._id} className="w-36" />
        <p>{group.name}</p>
        <p>{group.description}</p>
        <SmartLink to="members">{group.members} member{group.members > 1 && "s"}</SmartLink>
        {!deleted && (<>
          <p>{group._id ? "Since" : ""} {date}</p>
          {!group.owner &&
            (<div>
              {group.member ? (
                <button>Leave group</button>
              ) : (
                <button>{group.requestJoin ? "Request join" : "Join"}</button>
              )}
            </div>)}
        </>)}
      </div>
      <div>
        {show === "members" && (
          <UserList url={`${API}/group/${groupname}/members`} source={`/g/${groupname}`} />
        )}
        {!show && (
          <Feed url={`${API}/group/${groupname}/posts`} />
        )}
      </div>
    </>
  )
}