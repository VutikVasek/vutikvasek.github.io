import { useAppContext, useSearchHistory } from "@/context/AppContext"
import ProfilePicture from "../media/ProfilePicture";
import { Fragment, useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import SmartLink from "../basic/SmartLink";
const API = import.meta.env.VITE_API_BASE_URL;

export default function SearchHistory({}) {
  const { deleteFromSearchHistory, clearSearchHistory } = useAppContext();
  const searchHistory = useSearchHistory();
  const [names, setNames] = useState([]);

  const getName = id => names.find(obj => obj.id === id)?.name ?? "<deleted>";

  const getIcon = (item) => {
    switch (item.type) {
      case "user":
        return <ProfilePicture pfp={item.id} />
      case "group":
        return <ProfilePicture path="gp" pfp={item.id} />
      default:
        return <div className="flex justify-center h-full items-center"><p className="text-2xl font-serif mt-3">" "</p></div>
    }
  }

  const getText = (item) => {
    switch (item.type) {
      case "user": case "group":
        return getName(item.id)
      default:
        return item.text
    }
  }

  const getLink = item => {
    switch (item.type) {
      case "user":
        return `/u/${getName(item.id)}`
      case "group":
        return `/g/${getName(item.id)}`
      default:
        return `/search?q=${item.text}`
    }
  }

  const getNamed = async ()  => {
    if (!searchHistory) return;
    const filteredUsers = searchHistory.filter(item => item.type === "user");
    const namedUsers = await Promise.all(filteredUsers.map(async item => {
      const res = await fetch(`${API}/profile/${item.id}/username`);
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
        return { id: item.id, name: "<deleted>" }
      }
      return { id: item.id, name: data.name };
    }))

    const filteredGroups = searchHistory.filter(item => item.type === "group");
    const namedGroups = await Promise.all(filteredGroups.map(async item => {
      const res = await fetch(`${API}/group/${item.id}/name`);
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
        return { id: item.id, name: "<deleted>" }
      }
      return { id: item.id, name: data.name };
    }))

    setNames([...namedUsers, ...namedGroups]);
  }
  
  useEffect(() => {
    getNamed();
  }, [searchHistory])

  return (
    <div className="mt-8 min-w-64 max-w-96 h-full">
      <div className="flex items-baseline justify-between h-[3%]">
        <p className="text-lg">Recent Searches</p>
        <p className="cursor-pointer hover:underline underline-offset-2" onClick={clearSearchHistory}>Clear all</p>
      </div>
      <div className="flex flex-col gap-1 pt-4 h-[96%] overflow-y-auto scrollbar-dark">
        {searchHistory?.map((item, index) => 
          <Fragment key={index}>
            <SmartLink as="span" to={getLink(item)} className={"flex items-center gap-4 hover:bg-slate-900 py-4 rounded-full h-10"} >
              <div className="w-10">
                {getIcon(item)}
              </div>
              <div className="flex flex-1 max-w-72 truncate">
                <p className="truncate">
                  {getText(item)}
                </p>
              </div>
              <div className="w-10 flex justify-center">
                <button className="hover:bg-slate-800 p-2 rounded-full pointer-events-auto" onClick={e => {e.stopPropagation(); deleteFromSearchHistory(index)}}>
                  <IoMdClose />
                </button>
              </div>
            </SmartLink>
            {index !== searchHistory.length - 1 &&
            <div className="bg-slate-700 w-full h-[2px]"></div>}
          </Fragment>
        )}
      </div>
    </div>
  )
}