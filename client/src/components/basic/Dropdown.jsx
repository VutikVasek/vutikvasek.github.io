import { useEffect, useState } from "react"

export default function Dropdown({ set, get, close, children}) {
  const [show, setShow] = useState(false);

  useEffect(() => setShow(false), close);

  return (
    <>
    <button onClick={() => setShow(val => !val)} className="flex items-center">{get}<MdKeyboardArrowDown /></button>
    {show && 
      <div className="w-0 h-0 overflow-visible">
        <div className="bg-gray-300 w-fit p-2 relative flex flex-col whitespace-nowrap">
          {children.map((pair, index) => 
            <button onClick={() => {set(pair[0]), setShow(false)}} key={index}>{pair[1]}</button>
          )}
        </div>
      </div>}
    </>
  )
}