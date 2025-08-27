import { LuShare2 } from "react-icons/lu";
import Descriptor from "../info/Descriptor";
import { useAppContext } from "@/context/AppContext";

export default function ShareButton({ url }) {

  const { showInfoToast, showErrorToast } = useAppContext();

  const handleClick = (e) => {
    e.stopPropagation();
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(url)
        .then(() => showInfoToast("Link copied to clipboard"))
        .catch(err => {
          console.log(err);
          showErrorToast("Link couldn't be copied");
        })
    } else {
          showErrorToast("Link copying isn't supported");
    }
  }

  return (
    <Descriptor text={"Share"}>
      <div onClick={handleClick} 
          className={'cursor-pointer p-2 rounded-full hover:bg-slate-800 text-gray-500 hover:text-white'}>
        <LuShare2 />
      </div>
    </Descriptor>
  )
}