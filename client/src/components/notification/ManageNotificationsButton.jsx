import SmartLink from "../basic/SmartLink";
import { IoSettingsOutline, IoSettingsSharp } from "react-icons/io5";
export default function ManageNotificationsButton({}) {
  return (
    <SmartLink to="/account/notification-settings" className="flex w-fit items-center button gap-1 group/notifsettings">
      <IoSettingsOutline className="inline group-hover/notifsettings:hidden" />
      <IoSettingsSharp className="hidden group-hover/notifsettings:inline" />
      Manage your notifications
    </SmartLink>
  )
}