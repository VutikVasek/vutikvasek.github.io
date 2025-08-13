import GroupSettings from "@/components/group/GroupSettings";
import DeleteButton from "@/components/basic/DeleteButton";
const API = import.meta.env.VITE_API_BASE_URL;

export default function GroupSettingsPage() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const groupname = queryParams.get('g');

  if (!groupname) return <p>We didn't find that group</p>

  return (
    <>
    <GroupSettings groupname={groupname} />
    <DeleteButton word="group" url={`${API}/group/${groupname}`} />
    </>
  )
}