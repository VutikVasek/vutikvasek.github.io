import { useParams } from "react-router-dom";

export default function GroupPage({}) {
  const { groupname } = useParams();

  return  (
    <div>Group page of {groupname}</div>
  )
}