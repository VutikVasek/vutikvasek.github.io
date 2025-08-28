import { useState } from "react"

export default function Descriptor({ text, children, offset = "0px", className, ...params }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className={"flex flex-col items-center w-fit " + className} {...params} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {children}
      {hovered && (
        <div className="w-0 h-0 overflow-visible flex justify-center">
          <div className="bg-slate-700 relative w-fit h-fit py-1 px-2 text-sm mt-1 whitespace-nowrap rounded-sm" style={{ top: offset }}>
            {text}
          </div>
        </div>
      )}
    </div>
  )
}