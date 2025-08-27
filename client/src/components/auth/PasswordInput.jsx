import { useEffect, useRef, useState } from "react"
import { BiShowAlt } from "react-icons/bi";
import { BiHide } from "react-icons/bi";

export default function PasswordInput({...params}) {
  const input = useRef(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    input.current.type = show ? "text" : "password";
  }, [show])

  return (
    <div className="flex w-fit items-center gap-3">
      <input
        className="textfield w-full p-2"
        type="password"
        ref={input}
        {...params}
      />
      <div onClick={() => setShow(prev => !prev)}>
        {
          show ?
          <BiHide /> :
          <BiShowAlt />
        }
      </div>
    </div>
  )
}