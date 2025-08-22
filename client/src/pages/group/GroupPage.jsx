import SmartLink from "@/components/basic/SmartLink";
import Feed from "@/components/feed/Feed";
import JoinButton from "@/components/group/JoinButton";
import ProfilePicture from "@/components/media/ProfilePicture";
import Post from "@/components/post/Post";
import UserList from "@/components/profile/UserList";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
const API = import.meta.env.VITE_API_BASE_URL;

export default function GroupPage({}) {
  const { groupname, show } = useParams();
  const [group, setGroup] = useState({});
  const [deleted, setDeleted] = useState();
  const [date, setDate] = useState('');
  const [pinnedPost, setPinnedPost] = useState();

  const loadGroup = async () => {
    if (groupname == "<deleted>") {
      setGroup({name: "This group was deleted"});
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
    if (group.pinnedPost)
      fetch(`${API}/group/${encodeURIComponent(groupname)}/pinned`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }})
        .then(res => res.json())
        .then(data => setPinnedPost(data))
        .catch(err => console.log(err));
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
        <p className="max-w-max overflow-x-clip">{group.description}</p>
        {group.owner && <SmartLink to={`/g/${encodeURIComponent(group.name)}/settings`}>Settings</SmartLink>}
        <SmartLink to={`/g/${encodeURIComponent(group.name)}/members`}>{group.members} member{group.members > 1 && "s"}</SmartLink>
        {group.bans > 0 && <SmartLink to={`/g/${encodeURIComponent(group.name)}/banned`}>{group.bans} banned</SmartLink>}
        {!deleted && (<>
          <p>{group._id ? "Since" : ""} {date}</p>
          <JoinButton group={group} logged={group.logged} />
        </>)}
      </div>
      {group.canUserPost &&
      <SmartLink to={`/post?g=${encodeURIComponent(groupname)}`}>Post on group</SmartLink>
      }
      <div>
        {(show === "members" || show === "banned") && (
          <UserList url={`${API}/group/${encodeURIComponent(groupname)}/${encodeURIComponent(show)}`} source={`/g/${encodeURIComponent(groupname)}`} />
        )}
        {!show && (
          group.private && !group.member ? 
            <p>You need to join this group to see the posts</p> :
            <>
              {pinnedPost && 
              <Post post={pinnedPost} cut={true} pinned />
              }
              <Feed url={`${API}/group/${encodeURIComponent(groupname)}/posts`} />
            </>
        )}
      </div>
    </>
  )
}