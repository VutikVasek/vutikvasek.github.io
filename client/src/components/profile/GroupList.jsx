import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";
import SmartLink from "../basic/SmartLink";
import ProfilePicture from "../media/ProfilePicture";
import JoinButton from "../group/JoinButton";
import Descriptor from "../info/Descriptor";
const MEDIA = import.meta.env.VITE_MEDIA_BASE_URL;

export default function GroupList({url, source, setGroupsParent, reloadState, query, max, horizontal = false, onClick, className}) {
  const [groups, setGroups] = useState([]);
  const [logged, setLogged] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const observer = useRef();
  const navigate = useNavigate();

  const loadGroups = (reload) => {
    fetch(url + `?page=${reload ? 1 : encodeURIComponent(page)}&limit=${encodeURIComponent(max) || 5}&${query}`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }})
      .then(res => res.json())
      .then(data => {
        if (reload) setGroups(data.groupList);
        else  setGroups(prev => [...prev, ...(data.groupList ?? [])].filter(
                (group, index, self) => index === self.findIndex(u => u.gp === group.gp)
              ));
        setLogged(data.logged);
        setHasMore(data.hasMore);
        // setPage(prev => prev + 1);
      })
      .catch(err => console.log(err));
  }
  
  useEffect(() => {
    if (page != 1)
      loadGroups();
  }, [page]);
  useEffect(() => {
    loadGroups(true);
  }, [url, reloadState])

  useEffect(() => {
    if (setGroupsParent) setGroupsParent(groups);
  }, [groups])
  
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

  return (
    <div className={"w-full flex flex-col justify-center " + className}>
      {source && 
      <Descriptor text="Back" offset="-1rem" className="rounded-full">
        <button onClick={() => navigate(source || -1)} className="p-3 m-1 text-xl hover:bg-slate-900 rounded-full"><IoMdArrowRoundBack /></button> 
      </Descriptor>}
      <p>{groups?.length === 0 && ('No one yet!')}</p>
      <div className={horizontal ? "flex" : "mx-auto w-full"}>
        {groups?.map((group, index) => (
          <div ref={index === groups.length - 1 ? lastPostRef : null} key={index}>
            <SmartLink to={"/g/" + encodeURIComponent(group.name)}  as="span"
                className={"flex w-full items-center gap-16 hover:bg-slate-900 py-2 px-3 rounded-md " 
                  + (horizontal ? "flex-col items-center" : "")}
                onClick={() => onClick ? onClick(group.gp) : ""}>
              <div className="flex flex-1 items-center gap-4 min-w-[0%]">
                <ProfilePicture pfp={group.gp} path="gp" className={"w-10" + (horizontal ? " m-auto" : "")} />
                <div className={horizontal ? "" : "text-left w-[calc(100%-3.5rem)]"}>
                  <p className={"w-full" + (horizontal ? " truncate" : "")}>{group.name}</p>
                  {group.description && <p className="truncate text-gray-500">{group.description}</p>}
                </div>
              </div>
              {!setGroupsParent && 
              <JoinButton group={group} logged={logged} />}
            </SmartLink>
          </div>
        ))}
      </div>
    </div>
  );
}