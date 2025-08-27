import { IoSettingsOutline, IoSettingsSharp } from "react-icons/io5";
import Descriptor from "../info/Descriptor";
import SmartLink from "./SmartLink";

export default function SettingsButton({to}) {
  return (
    <Descriptor text={"Settings"} className="rounded-full">
      <SmartLink to={to} 
          className={'cursor-pointer p-2 aspect-square rounded-full hover:bg-slate-800 text-gray-500 hover:text-white group/settings text-lg flex items-center justify-center'}>
        <IoSettingsOutline className="inline group-hover/settings:hidden" />
        <IoSettingsSharp className="hidden group-hover/settings:inline" />
      </SmartLink>
    </Descriptor>
  )
}