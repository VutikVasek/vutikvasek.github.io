import { LuShare2 } from "react-icons/lu";
import Descriptor from "../info/Descriptor";
import { useAppContext } from "@/context/AppContext";

export default function ShareButton({ url }) {

  const { showInfoToast, showErrorToast } = useAppContext();

  const handleClick = () => {
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
          className={'w-fit flex gap-2 items-center cursor-pointer'}>
        <LuShare2 className='text-gray-500 hover:text-black' />
      </div>
    </Descriptor>
  )
}