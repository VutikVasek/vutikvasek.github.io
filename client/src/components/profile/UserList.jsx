import { useCallback, useEffect, useRef, useState } from "react";
import FollowButton from "./FollowButton";
import { useNavigate } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";
import SmartLink from "../basic/SmartLink";
import More from "../basic/More";
import ProfilePicture from "../media/ProfilePicture";
const MEDIA = import.meta.env.VITE_MEDIA_BASE_URL;

export default function UserList({url, source}) {
  const [users, setUsers] = useState([]);
  const [logged, setLogged] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [group, setGroup] = useState({});
  const [page, setPage] = useState(1);

  const observer = useRef();
  const navigate = useNavigate();

  const loadUsers = (reload) => {
    fetch(url + `?page=${reload ? 1 : page}&limit=5`, {
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
    loadUsers();
  }, [])
  useEffect(() => {
    loadUsers(true);
  }, [url])
  
  const lastPostRef = useCallback((node) => {
    if (!hasMore) return;

    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPage((prev) => prev + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [hasMore]);

  const handleMakeAdmin = async (e, userId, action) => {
      e.preventDefault();
      const res = await fetch(`${API}/group/${notification.context[NotificationContext.GROUP_ID]}/${action}/${userId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      const data = await res.json();
      if (!res.ok) console.log(data.message);
      setUsers(prev => prev.map(user => user.pfp !== userId ? user : { ...user, admin: action === "admin" } ));
  }

  const handleBan = async (e, userId) => {
      e.preventDefault();
      const res = await fetch(`${API}/group/${notification.context[NotificationContext.GROUP_ID]}/ban/${userId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      const data = await res.json();
      if (!res.ok) console.log(data.message);
      setUsers(prev => prev.filter(user => user.pfp !== userId ));
  }

  return (
    <div className="w-fit">
      <button onClick={() => navigate(source || -1)} className="p-4 text-xl"><IoMdArrowRoundBack /></button>
      <p>{users.length === 0 && ('No one yet!')}</p>
      {users.map((user, index) => (
        <div className="flex items-center gap-4" ref={index === users.length - 1 ? lastPostRef : null} key={user.pfp}>
          <SmartLink to={"/u/" + user.username} className="flex w-full items-center gap-4">
            <ProfilePicture pfp={user.pfp} className="w-10" />
            <p className="w-full">{user.username}</p>
          </SmartLink>
          <FollowButton userData={user} simple={true} logged={logged} />
          {group?.admin && !user.owner && (
            <More>
              {user.admin ? 
                <button onClick={e => handleMakeAdmin(e, "admin")}>Make user admin</button>
                :
                <button onClick={e => handleMakeAdmin(e, "deadmin")}>Revoke users admin status</button>
              }
              {(group.owner) ? 
                <button>Transfer ownership</button>
                : 
                <button onClick={e => handleBan(e, user.pfp)}>Ban user</button>
              }
            </More>
          )}
        </div>
      ))}
    </div>
  );
}