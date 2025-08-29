import { useEffect, useRef, useState } from "react"
import { BiShowAlt } from "react-icons/bi";
import { BiHide } from "react-icons/bi";
import Descriptor from "../info/Descriptor";

export default function PasswordInput({...params}) {
  const input = useRef(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    input.current.type = show ? "text" : "password";
  }, [show])

  return (
    <div className="flex w-fit items-center gap-3">
      <input
        className="textfield w-full p-2 rounded-[0.25rem]"
        type="password"
        ref={input}
        {...params}
      />
      <Descriptor text={show ? "Hide" : "Show"} className="rounded-full">
        <div onClick={() => setShow(prev => !prev)} className="p-2 hover:bg-slate-900 cursor-pointer rounded-full">
          {
            show ?
            <BiHide /> :
            <BiShowAlt />
          }
        </div>
      </Descriptor>
    </div>
  )
}