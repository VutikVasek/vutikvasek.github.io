import GroupSettings from "@/components/group/GroupSettings";
import { Helmet } from "react-helmet-async";

export default function CreateGroup({}) {
  return (
    <>
    <Helmet>
      <title>Create Group - Vutink</title>
    </Helmet>
    <GroupSettings />
    </>
  )
}