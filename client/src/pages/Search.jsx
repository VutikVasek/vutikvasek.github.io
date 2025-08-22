import SmartLink from "@/components/basic/SmartLink";
import Feed from "@/components/feed/Feed";
import GroupList from "@/components/profile/GroupList";
import Replies from "@/components/profile/Replies";
import UserList from "@/components/profile/UserList";
import { useEffect, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
const API = import.meta.env.VITE_API_BASE_URL;

export default function Search({}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchbar = useRef();

  useEffect(() => {
    searchbar.current?.focus();
  }, [])

  const query = (encode) => (encode ? encodeURIComponent(searchParams.get('q')) : searchParams.get('q')) ?? "";
  const search = () => searchParams.get('s') || "all";

  const setParams = (key, value) => {
    searchParams.set(key, value);
    searchParams.forEach((val, k) => {
      if (val === "" || k === "time" || k === "sort") searchParams.delete((k));
    })
    setSearchParams(searchParams, { replace: key === "q" ? true : false });
  }

  return (
    <>
      <input type="text" value={query()} onChange={e => setParams("q", e.target.value)} className="w-[calc(100%-1rem)] border border-black m-2" ref={searchbar} />
      <div className="flex gap-4">
        <button onClick={e => setParams("s", "all")} className={search() === "all" ? 'font-semibold' : ''}>All</button>
        <button onClick={e => setParams("s", "users")} className={search() === "users" ? 'font-semibold' : ''}>Users</button>
        <button onClick={e => setParams("s", "groups")} className={search() === "groups" ? 'font-semibold' : ''}>Groups</button>
        <button onClick={e => setParams("s", "posts")} className={search() === "posts" ? 'font-semibold' : ''}>Posts</button>
        <button onClick={e => setParams("s", "replies")} className={search() === "replies" ? 'font-semibold' : ''}>Replies</button>
      </div>
      {!query() ? 
      <div className="text-gray-500 p-10">
        Here the results will show
      </div>
      :
      <div>
        {search() === "posts" && <Feed url={`${API}/search/for/posts`} query={"query=" + query(true)} reloadState={searchParams} defaultSort="popular" defaultTime="all" />}
        {search() === "users" && <UserList url={`${API}/search/for/users`} query={"query=" + query(true)} reloadState={searchParams} />}
        {search() === "replies" && <Replies search={true} query={"query=" + query(true)} reloadState={searchParams} defaultSort="popular" defaultTime="all" />}
        {search() === "groups" && <GroupList url={`${API}/search/for/groups`} query={"query=" + query(true)} reloadState={searchParams} />}
        {search() === "all" && 
          <>
          <div className="flex justify-around">
            <div>
              <h2 className="text-2xl">Users</h2>
              <UserList url={`${API}/search/for/users`} query={"query=" + query(true)} reloadState={searchParams} max={3} />
              <button onClick={e => setParams("s", "users")}>Show more</button>
            </div>
            <div>
              <h2 className="text-2xl">Groups</h2>
              <GroupList url={`${API}/search/for/groups`} query={"query=" + query(true)} reloadState={searchParams} max={3} />
              <button onClick={e => setParams("s", "groups")}>Show more</button>
            </div>
          </div>
          <h2 className="text-2xl">Posts</h2>
          <Feed url={`${API}/search/for/posts`} query={"query=" + query(true)} reloadState={searchParams} 
            showReplies sorter={false} defaultSort="popular" defaultTime="week" setParams={setParams} />
          </>
        }
      </div>
      }
    </>
  );
}