import { useCallback, useEffect, useRef, useState } from "react";
import FollowButton from "./FollowButton";
import { useNavigate } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";
import SmartLink from "../basic/SmartLink";
import More from "../basic/More";
import ProfilePicture from "../media/ProfilePicture";
import { useAppContext } from "@/context/AppContext";
import Descriptor from "../info/Descriptor";
const API = import.meta.env.VITE_API_BASE_URL;

export default function UserList({url, source, query, reloadState, max}) {
  const [users, setUsers] = useState([]);
  const [logged, setLogged] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [group, setGroup] = useState({});
  const [page, setPage] = useState(1);

  const observer = useRef();
  const navigate = useNavigate();

const { showInfoToast } = useAppContext();

  const loadUsers = (reload) => {
    fetch(url + `?page=${reload ? 1 : encodeURIComponent(page)}&limit=${encodeURIComponent(max) || 5}&${query}`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }})
      .then(res => res.json())
      .then(data => {
        if (reload) setUsers(data.userList);
        else  setUsers(prev => [...prev, ...data.userList].filter(
                (user, index, self) => index === self.findIndex(u => u.pfp === user.pfp)
              ));
        setLogged(data.logged);
        setHasMore(data.hasMore);
        setGroup(data.group);
      })
      .catch(err => console.log(err));
  }
  
  useEffect(() => {
    if (page != 1)
      loadUsers();
  }, [page]);
  useEffect(() => {
    loadUsers(true);
  }, [url, reloadState])
  
  const lastPostRef = useCallback((node) => {
    if (!hasMore) return;

    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPage((prev) => prev + 1);
      }
    });

    if (node && max == null) observer.current.observe(node);
  }, [hasMore]);

  const handleMakeAdmin = async (e, userId, action) => {
      e.preventDefault();
      const res = await fetch(`${API}/group/${encodeURIComponent(group.name)}/${encodeURIComponent(action)}/${encodeURIComponent(userId)}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      const data = await res.json();
      if (!res.ok) console.log(data.message);
      setUsers(prev => prev.map(user => user.pfp !== userId ? user : { ...user, admin: action === "admin" } ));
      showInfoToast(`The user has been ${action}ed`);
  }

  const handleBan = async (e, userId, unban = false) => {
      e.preventDefault();
      const pre = unban ? "un" : "";
      const res = await fetch(`${API}/group/${encodeURIComponent(group.name)}/${encodeURIComponent(pre)}ban/${encodeURIComponent(userId)}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      const data = await res.json();
      if (!res.ok) console.log(data.message);
      setUsers(prev => prev.filter(user => user.pfp !== userId ));
      showInfoToast(`The user has been ${pre}banned`);
  }

  return (
    <div className="w-fit">
      {query == null &&<Descriptor text="Back" offset="-1rem">
        <button onClick={() => navigate(source || -1)} className="p-4 text-xl"><IoMdArrowRoundBack /></button>
      </Descriptor>}
      <p>{users.length === 0 && ('No one yet!')}</p>
      {users.map((user, index) => (
        <div className="flex items-center gap-4" ref={index === users.length - 1 ? lastPostRef : null} key={user.pfp}>
          <SmartLink to={"/u/" + encodeURIComponent(user.username)} className="flex w-full items-center gap-4">
            <ProfilePicture pfp={user.pfp} className="w-10" />
            <div>
              <p className={"w-full" + (user.admin ? " font-semibold" : "")}>{user.username}</p>
              {user.bio && <p className="truncate max-w-[20rem] text-gray-500">{user.bio}</p>}
            </div>
          </SmartLink>
          <FollowButton userData={user} simple={true} logged={logged} />
          {group?.admin && !user.owner && (
            <More>
              {user.banned ? <button onClick={e => handleBan(e, user.pfp, true)} key="unban">Unban user</button> :
              [
                !user.admin ? 
                    <button onClick={e => handleMakeAdmin(e, user.pfp, "admin")} key="admin">Make user admin</button>
                    :
                    <button onClick={e => handleMakeAdmin(e, user.pfp, "deadmin")} key="deadmin">Revoke users admin status</button>,
                <button onClick={e => handleBan(e, user.pfp)} key="ban">Ban user</button>,
                (group.owner) && 
                    <button key="owner ">Transfer ownership</button>
              ]}
            </More>
          )}
        </div>
      ))}
    </div>
  );
}