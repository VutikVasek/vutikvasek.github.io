import { useCallback, useEffect, useRef, useState } from "react";
import FollowButton from "./FollowButton";
import { useNavigate } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";
import SmartLink from "../basic/SmartLink";
import More from "../basic/More";
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

  return (
    <div className="w-fit">
      <button onClick={() => navigate(source || -1)} className="p-4 text-xl"><IoMdArrowRoundBack /></button>
      <p>{users.length === 0 && ('No one yet!')}</p>
      {users.map((user, index) => (
        <div className="flex items-center gap-4" ref={index === users.length - 1 ? lastPostRef : null} key={user.pfp}>
          <SmartLink to={"/u/" + user.username} className="flex w-full items-center gap-4">
            <img src={`${MEDIA}/pfp/${user.pfp}.jpeg`} alt="pfp" className='rounded-full w-10'
              onError={(e) => {e.target.onError = null;e.target.src=`${MEDIA}/pfp/default.jpeg`}} />
            <p className="w-full">{user.username}</p>
          </SmartLink>
          <FollowButton userData={user} simple={true} logged={logged} />
          {group?.admin && (
            <More>
              <button>{user.admin ? "Revoke admin" : "Make admin"}</button>
              {(group.owner && !user.owner) && (
                <button>Transfer ownership</button>
              )}
            </More>
          )}
        </div>
      ))}
    </div>
  );
}