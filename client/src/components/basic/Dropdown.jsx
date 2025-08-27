import { Fragment, useEffect, useState } from "react"
import { MdKeyboardArrowDown } from "react-icons/md";
import FullScreen from "./FullScreen";

export default function Dropdown({ set, get, close, children}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(false)
  }, [close]);

  return (
    <>
    <div>
      <button onClick={() => setShow(val => !val)} className="flex items-center">{get}<MdKeyboardArrowDown /></button>
      {show && 
        <div className="w-0 h-0 overflow-visible">
          <FullScreen onClick={() => setShow(false)} />
          <div className="bg-slate-700 w-fit p-2 relative flex flex-col whitespace-nowrap z-50 gap-1">
            {children.map((pair, index) => 
              <Fragment key={index}>
              <button onClick={() => {set(pair[0]), setShow(false)}} className="text-start min-w-max truncate">
                <span className="max-w-20 whitespace-normal w-full">{pair[1]}</span>
              </button>
              {index !== children.length - 1 &&
              <div className="bg-slate-500 w-full h-[2px]"></div>}
              </Fragment>
            )}
          </div>
        </div>}
    </div>
    </>
  )
}