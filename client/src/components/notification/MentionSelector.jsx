import { use, useEffect, useRef, useState } from "react";
import { useFloating, flip, shift, offset } from '@floating-ui/react-dom';
import Selector from "../basic/Selector";
const MEDIA = import.meta.env.VITE_MEDIA_BASE_URL;
const API = import.meta.env.VITE_API_BASE_URL;

export default function MentionSelector({mention, setMention, destroy, onEnter}) {
  // const [query, setQuery] = useState(mention.query || '');
  // const [results, setResults] = useState([]);
  // const [loading, setLoading] = useState(false);
  // const [selectedUser, setSelectedUser] = useState(mention.user || null);
  // const [focused, setFocused] = useState(false);
  // const [width, setWidth] = useState(0);

  // const spanRef = useRef(null);
  
  // const { refs, floatingStyles } = useFloating({
  //   placement: 'bottom-start',
  //   middleware: [
  //     flip(),
  //     shift(),
  //   ],
  // });

  // useEffect(() => {
  //   setMention({query, selectedUser});
  // }, [query, selectedUser])

  // useEffect(() => {
  //   if (selectedUser?._id && selectedUser?.username !== query) setSelectedUser({});

  //   setWidth(Math.max(spanRef.current?.offsetWidth + 20, 80));

  //   if (!query.trim()) return setResults([]);

  //   const timeout = setTimeout(async () => {
  //     setLoading(true);
  //     try {
  //       const res = await fetch(`${API}/search/users?query=${query}`);
  //       const data = await res.json();
  //       if (!res.ok) return console.log(data.message)
  //       setResults(data);
  //     } catch (err) {
  //       console.log(err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }, 300)

  //   return () => clearTimeout(timeout);
  // }, [query]);

  // const handleSelectUser = (user) => {
  //   setSelectedUser(user);
  //   setQuery(user.username);
  // }

  // useEffect(() => {
  //   results.forEach(user => {
  //     if (user.username === query) handleSelectUser(user);
  //   })
  // }, [results])

  // const handleKeyDown = (e) => {
  //   if (query === '' && (e.key === "Delete" || e.key === "Backspace")) destroy();
  //   else if (e.key === "Enter" && onEnter) onEnter(e);
  //   else if (e.key === "Tab" && !selectedUser?._id && results.length > 0) {
  //     e.preventDefault();
  //     handleSelectUser(results[0]);
  //   } 
  // }

  // const handleOnBlur = (e) => {
  //   e.stopPropagation(); 
  //   setFocused(false);
  //   if (query === '') destroy();
  // }

  // return (
  //   <div ref={refs.setReference} className="flex" onFocus={() => setFocused(true)} onBlur={handleOnBlur} >
  //     <p>@</p>
  //     <span ref={spanRef} className="absolute invisible whitespace-pre">{query || " "}</span>
  //     <input type="text" style={{ width }} 
  //       value={query} onChange={(e) => setQuery(e.target.value)}
  //       onKeyDown={handleKeyDown} autoFocus />
  //     {(results.length > 0 && focused) &&
  //     <div className="bg-gray-300 flex flex-col p-1" ref={refs.setFloating} style={floatingStyles}>
  //       {loading && "Loading..."}
  //       {results.map((user, index) => (
  //         <div className="flex items-center gap-2 p-2 cursor-pointer" key={index} 
  //             onClick={() => handleSelectUser(user)}
  //             onMouseDown={(e) => e.preventDefault()} >
  //           <img src={`${MEDIA}/pfp/${user._id}.jpeg`} alt="pfp" className='rounded-full w-10'
  //             onError={(e) => {e.target.onError = null;e.target.src=`${MEDIA}/pfp/default.jpeg`}} />
  //           <p className="w-full">{user.username}</p>
  //         </div>
  //       ))}
  //     </div>}
  //   </div>
  // )
  return <Selector 
    selected={mention} search="users" destroy={destroy} onEnter={onEnter}
    setSelected={(selected) => setMention({query: selected.query, selectedUser: { _id: selected.selectedItem?._id, username: selected.selectedItem?.name }})} />
}