import SettingsButton from "@/components/basic/SettingsButton";
import SmartLink from "@/components/basic/SmartLink";
import Feed from "@/components/feed/Feed";
import JoinButton from "@/components/group/JoinButton";
import ProfilePicture from "@/components/media/ProfilePicture";
import Post from "@/components/post/Post";
import UserList from "@/components/profile/UserList";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
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

  if (!group) return <h1 className="title">Loading...</h1>;
  if (deleted) return <h1 className="title">This group was deleted</h1>

  return  (
    <>
      <Helmet>
        <title>{group.name || "deleted"} - Vutink</title>
      </Helmet>
      <div className="flex flex-col mt-6">
              <div className="flex m-4 gap-8 items-end">
                <ProfilePicture path="gp" pfp={group._id} className="w-36 self-start" />
                <div className="max-w-[calc(100%-11rem)]">
                  <p className="text-4xl font-semibold break-words">{group.name}</p>
                  <p className="whitespace-pre-wrap mt-1 max-w-max overflow-x-clip break-words">{group.description}</p>
                  <p className="text-sm text-slate-300 mt-1">{group._id ? "Since" : ""} {date}</p>
                </div>
              </div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-8 underline-offset-2 [&>*:hover]:underline">
                  <SmartLink to={`/g/${encodeURIComponent(group.name)}/members`} className="group/members">
                    {group.members} <span className="text-slate-400 group-hover/members:text-white">{group.members === 1 ? "member" : "members"}</span>
                  </SmartLink>
                  {group.bans > 0 &&
                  <SmartLink to={`/g/${encodeURIComponent(group.name)}/banned`} className="group/banned">
                    {group.bans} <span className="text-slate-400 group-hover/banned:text-white">banned</span>
                  </SmartLink>}
                </div>
                <div className="flex gap-8 items-center">
                  <div className="flex flex-col gap-2">
                    <JoinButton group={group} logged={group.logged} />
                    {group.canUserPost &&
                    <SmartLink to={`/post?g=${encodeURIComponent(groupname)}`} className="button inline-block">Post on group</SmartLink>
                    }
                  </div>
                  {group.owner && 
                  <div className="flex items-center">
                    <div className="w-0 overflow-hidden"><div className="button">I</div></div>
                    <SettingsButton to={`/g/${encodeURIComponent(group.name)}/settings`} />
                  </div>}
                </div>
              </div>
      </div>
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