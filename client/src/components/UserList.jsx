import { useEffect, useState } from "react";
import FollowButton from "./FollowButton";
import { Link, useNavigate } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";

export default function UserList({url}) {
  const [users, setUsers] = useState([]);
  const [logged, setLogged] = useState(false);

  const navigate = useNavigate();

  const loadUsers = () => {
    fetch(url, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }})
      .then(res => res.json())
      .then(data => {
        setUsers(data.userList);
        setLogged(data.logged);
      })
      .catch(err => console.log(err));
  }

  useEffect(() => {
    loadUsers();
  }, [])
  useEffect(() => {
    loadUsers();
  }, [url])

  return (
    <div className="w-fit">
      <button onClick={() => navigate(-1)} className="p-4 text-xl"><IoMdArrowRoundBack /></button>
      {users.length === 0 && ('No one yet!')}
      {users.map(user => (
        <div className="flex items-center gap-4">
          <Link to={"/u/" + user.username} className="flex w-full items-center gap-4">
            <img src={`http://localhost:5000/media/pfp/${user.pfp}.jpeg`} alt="pfp" className='rounded-full w-10'
              onError={(e) => {e.target.onError = null;e.target.src="http://localhost:5000/media/pfp/default.jpeg"}} />
            <p className="w-full">{user.username}</p>
          </Link>
          <FollowButton userData={user} simple={true} logged={logged} />
        </div>
      ))}
    </div>
  );
}