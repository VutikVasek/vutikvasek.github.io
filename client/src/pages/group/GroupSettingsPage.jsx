import GroupSettings from "@/components/group/GroupSettings";
import DeleteButton from "@/components/basic/DeleteButton";
import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
const API = import.meta.env.VITE_API_BASE_URL;

export default function GroupSettingsPage() {
  const { groupname } = useParams();
  const [group, setGroup] = useState('');

  useEffect(() => {
    if (!groupname) return;
    fetch(`${API}/group/${encodeURIComponent(groupname)}`)
    .then(res => res.json())
    .then(data => setGroup(data))
    .catch(err => showErrorToast(err));
  }, [groupname])

  if (!groupname) return <p>We didn't find that group</p>

  if (!group) return "Loading";
  return (
    <>
    <GroupSettings group={group} />
    <DeleteButton word="group" url={`${API}/group/${encodeURIComponent(groupname)}`} />
    </>
  )
}