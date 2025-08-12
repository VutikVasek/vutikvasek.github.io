import { useCallback, useEffect, useRef, useState } from "react";
import FollowButton from "./FollowButton";
import { useNavigate } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";
import SmartLink from "../basic/SmartLink";
import More from "../basic/More";
import ProfilePicture from "../media/ProfilePicture";
import JoinButton from "../group/JoinButton";
const MEDIA = import.meta.env.VITE_MEDIA_BASE_URL;

export default function GroupList({url, source}) {
  const [groups, setGroups] = useState([]);
  const [logged, setLogged] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const observer = useRef();
  const navigate = useNavigate();

  const loadGroups = (reload) => {
    fetch(url + `?page=${reload ? 1 : page}&limit=5`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }})
      .then(res => res.json())
      .then(data => {
        if (reload) setGroups(data.groupList);
        else  setGroups(prev => [...prev, ...data.groupList].filter(
                (group, index, self) => index === self.findIndex(u => u.gp === group.gp)
              ));
        setLogged(data.logged);
        setHasMore(data.hasMore);
      })
      .catch(err => console.log(err));
  }
  
  useEffect(() => {
    if (page != 1)
      loadGroups();
  }, [page]);
  useEffect(() => {
    loadGroups();
  }, [])
  useEffect(() => {
    loadGroups(true);
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
      <p>{groups.length === 0 && ('No one yet!')}</p>
      {groups.map((group, index) => (
        <div className="flex items-center gap-4" ref={index === groups.length - 1 ? lastPostRef : null} key={user.gp}>
          <SmartLink to={"/g/" + group.name} className="flex w-full items-center gap-4">
            <ProfilePicture pfp={group.gp} path="gp" className="w-10" />
            <p className="w-full">{group.name}</p>
          </SmartLink>
          <JoinButton group={group} logged={logged} />
        </div>
      ))}
    </div>
  );
}