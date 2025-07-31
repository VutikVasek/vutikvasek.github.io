import { LuShare2 } from "react-icons/lu";
import Descriptor from "./Descriptor";

export default function ShareButton({ url }) {
  return (
    <Descriptor text={"Share"}>
      <div onClick={() => navigator.clipboard.writeText(url).catch(err => console.log(err))} 
          className={'w-fit flex gap-2 items-center cursor-pointer'}>
        <LuShare2 className='text-gray-500 hover:text-black' />
      </div>
    </Descriptor>
  )
}