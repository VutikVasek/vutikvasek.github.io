import { useAppContext } from "@/context/AppContext";

const API = import.meta.env.VITE_API_BASE_URL;

export default function JoinButton({ group, logged }) {
  const { showInfoToast } = useAppContext();

  const handleJoin = () => {
    fetch(`${API}/group/${encodeURIComponent(group.name)}/join`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }})
      .then(() => window.location.reload())
      .catch(err => console.log(err));
  }

  const handleLeave = () => {
    fetch(`${API}/group/${encodeURIComponent(group.name)}/leave`, {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }})
      .then(() => window.location.reload())
      .catch(err => console.log(err));
  }

  const handleRequest = () => {
    fetch(`${API}/group/${encodeURIComponent(group.name)}/request`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }})
      .then(() => showInfoToast("The request has been sent"))
      .catch(err => console.log(err));
  }

  const getButton = () => {
    if (group.member) return <button onClick={handleLeave}>Leave group</button>
    if (group.banned) return <div>You are banned</div>
    if (group.requestJoin) return <button onClick={handleRequest}>Request join</button>
    return <button onClick={handleJoin}>Join</button>
  }

  return(
    <>
      {(!group.owner && logged) &&
        (<div>
          {getButton()} 
        </div>)}
    </>
  )
}