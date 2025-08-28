import { useEffect, useRef, useState } from 'react';
import { IoSearchOutline } from 'react-icons/io5';
import { useLocation, useNavigate } from 'react-router-dom';
import UserList from '../profile/UserList';
import ProfilePicture from '../media/ProfilePicture';
import SmartLink from '../basic/SmartLink';
import { useAppContext } from '@/context/AppContext';
const API = import.meta.env.VITE_API_BASE_URL;

export default function SearchBar({}) {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();

  const inputRef = useRef();

  const { addToSearchHistory } = useAppContext();
  
  useEffect(() => {
    if (!query.trim()) return setUsers([]);

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`${API}/search/users?query=${encodeURIComponent(query)}`, {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }});
        const data = await res.json();
        if (!res.ok) return console.log(data.message)
        setUsers(data);
      } catch (err) {
        console.log(err);
      }
    }, 300)

    return () => clearTimeout(timeout);
  }, [query]);

  const handleUserClick = (e, id) => {
    e.stopPropagation(); 
    setQuery(""); 
    inputRef.current?.blur(); 
    addToSearchHistory({
      type: "user",
      id: id
    });
  }

  const handleKeyDown = e => {
    if (e.key === "Enter") {
      addToSearchHistory({
        type: "text",
        text: e.target.value
      });
      navigate(`/search?q=${e.target.value}`)
    }
  }

  return (
    <>
    {location.pathname !== "/search" &&
    <div className='w-full'>
      <IoSearchOutline className="absolute my-2 mt-[0.6rem] mx-[0.7rem] text-2xl pointer-events-none" />
      <input type="text" placeholder="Search..." className="py-2 px-3 pl-11 textfield peer/search w-full" value={query} onChange={e => setQuery(e.target.value)}
        onKeyDown={handleKeyDown} ref={inputRef} />
      {users.length > 0 &&
      <div className="bg-slate-700 hidden peer-focus/search:flex flex-col p-1">
        {users.map((user, index) => (
          <div key={index} onClick={e => handleUserClick(e, user._id)}>
            <SmartLink to={`/u/${user.name}`} className="flex items-center gap-2 p-2 cursor-pointer"
                onMouseDown={(e) => e.preventDefault()} dontStop >
              <ProfilePicture pfp={user._id} className="w-10" />
              <p className="w-full">{user.name}</p>
            </SmartLink>
          </div>
        ))}
      </div>}
    </div>}
    </>
  )
}