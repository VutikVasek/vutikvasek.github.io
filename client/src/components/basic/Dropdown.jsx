import { useEffect, useState } from "react"
import { MdKeyboardArrowDown } from "react-icons/md";
import FullScreen from "./FullScreen";

export default function Dropdown({ set, get, close, children}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(false)
  }, [close]);

  return (
    <>
    <button onClick={() => setShow(val => !val)} className="flex items-center">{get}<MdKeyboardArrowDown /></button>
    {show && 
      <div className="w-0 h-0 overflow-visible">
        <FullScreen onClick={() => setShow(false)} />
        <div className="bg-gray-300 w-fit p-2 relative flex flex-col whitespace-nowrap z-50">
          {children.map((pair, index) => 
            <button onClick={() => {set(pair[0]), setShow(false)}} key={index} className="text-start min-w-max truncate">
              <span className="max-w-20 whitespace-normal w-full">{pair[1]}</span>
            </button>
          )}
        </div>
      </div>}
    </>
  )
}