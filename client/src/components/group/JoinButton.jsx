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
    if (group.member) return <button onClick={handleLeave} className="button">Leave group</button>
    if (group.banned) return <div className="button hover:bg-slate-800 hover:border-slate-700">Banned</div>
    if (group.requestJoin) return <button onClick={handleRequest} className="button">Request join</button>
    return <button onClick={handleJoin} className="button">Join</button>
  }

  return(
    <>
      {(!group.owner && logged) &&
        (<div onClick={e => e.stopPropagation()}>
          {getButton()} 
        </div>)}
    </>
  )
}