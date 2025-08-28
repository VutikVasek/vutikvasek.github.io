import SmartLink from "@/components/basic/SmartLink";
import Feed from "@/components/feed/Feed";
import Tabs from "@/components/nav/Tabs";
import GroupList from "@/components/profile/GroupList";
import Replies from "@/components/profile/Replies";
import UserList from "@/components/profile/UserList";
import { useAppContext } from "@/context/AppContext";
import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { IoSearchOutline } from "react-icons/io5";
import { useLocation, useSearchParams } from "react-router-dom";
const API = import.meta.env.VITE_API_BASE_URL;

export default function Search({}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchbar = useRef();
  const { addToSearchHistory } = useAppContext();

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

  const resultClick = () => {
    if (query()) addToSearchHistory({ type: "string", text: query() })
  }

  return (
    <>
      <Helmet>
        <title>Search {search()} {query(false) ? `- ${query(false)}` : ""} - Vutink</title>
      </Helmet>
      <IoSearchOutline className="absolute my-2 mt-[0.6rem] mx-[0.7rem] text-2xl pointer-events-none" />
      <input type="text" value={query()} onChange={e => setParams("q", e.target.value)} ref={searchbar} placeholder="Search..."
      className="w-full py-2 px-3 pl-11 textfield"
        onKeyDown={e => e.key === "Enter" && query() ? addToSearchHistory({type: "string", text: query()}) : ""} />
      <Tabs selected={search()} onClick={resultClick}>
        <button onClick={e => setParams("s", "all")} id="all">All</button>
        <button onClick={e => setParams("s", "users")} id="users">Users</button>
        <button onClick={e => setParams("s", "groups")} id="groups">Groups</button>
        <button onClick={e => setParams("s", "posts")} id="posts">Posts</button>
        <button onClick={e => setParams("s", "replies")} id="replies">Replies</button>
      </Tabs>
      {!query() ? 
      <div className="text-gray-500 p-10">
        Here the results will show
      </div>
      :
      <div>
        {search() === "users" && 
          <UserList url={`${API}/search/for/users`} query={"query=" + query(true)} reloadState={searchParams} className="mt-8"
            onClick={id => addToSearchHistory({type: "user", id: id})} />}
        {search() === "groups" && 
          <GroupList url={`${API}/search/for/groups`} query={"query=" + query(true)} reloadState={searchParams} className="mt-8"
            onClick={id => addToSearchHistory({type: "group", id: id})} />}
        {search() === "posts" && 
        <div className="w-full flex justify-center" onClick={resultClick}>
          <Feed url={`${API}/search/for/posts`} query={"query=" + query(true)} reloadState={searchParams} defaultSort="popular" defaultTime="all" />
        </div>}
        {search() === "replies" &&
        <div className="w-full flex justify-center" onClick={resultClick}>
           <Replies search={true} query={"query=" + query(true)} reloadState={searchParams} defaultSort="popular" defaultTime="all" />
        </div>}
        {search() === "all" && 
          <>
          <div className="flex justify-between flex-wrap">
            <div className="min-w-[50%]">
              <h2 className="text-2xl p-3">Users</h2>
              <UserList url={`${API}/search/for/users`} query={"query=" + query(true)} reloadState={searchParams} max={3} 
                onClick={id => addToSearchHistory({type: "user", id: id})} />
              <button onClick={e => setParams("s", "users")} className="w-full hover:underline pt-2 text-slate-200">Show more</button>
            </div>
            <div className="w-[50%]">
              <h2 className="text-2xl p-3">Groups</h2>
              <GroupList url={`${API}/search/for/groups`} query={"query=" + query(true)} reloadState={searchParams} max={3}
                onClick={id => addToSearchHistory({type: "group", id: id})} />
              <button onClick={e => setParams("s", "groups")} className="w-full hover:underline pt-2 text-slate-200">Show more</button>
            </div>
          </div>
          <div className="w-full flex justify-center">
            <div className="w-[40rem]" onClick={resultClick}>
              <h2 className="text-2xl p-3">Posts</h2>
              <Feed url={`${API}/search/for/posts`} query={"query=" + query(true)} reloadState={searchParams} 
                showReplies sorter={false} defaultSort="popular" defaultTime="week" setParams={setParams}  />
            </div>
          </div>
          </>
        }
      </div>
      }
    </>
  );
}