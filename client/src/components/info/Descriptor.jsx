import { useState } from "react"

export default function Descriptor({ text, children, ...params }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="flex flex-col items-center" {...params} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {children}
      {hovered && (
        <div className="w-0 h-0 overflow-visible flex justify-center">
          <div className="bg-gray-300 relative w-fit h-fit p-1 text-sm mt-1 whitespace-nowrap">
            {text}
          </div>
        </div>
      )}
    </div>
  )
}