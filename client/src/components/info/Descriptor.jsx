import { useEffect, useState } from "react"

export default function Descriptor({ text, children, offset = "0px", className, ...params }) {
  const [hovered, setHovered] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (hovered) {
      const timeout = setTimeout(() => {
        setShow(true);
      }, 500)

      return () => {
        setShow(false);
        clearTimeout(timeout);
      }
    }
  }, [hovered])

  return (
    <div className={"flex flex-col items-center w-fit " + className} {...params} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {children}
      {show && (
        <div className="w-0 h-0 overflow-visible flex justify-center z-40">
          <div className="bg-slate-700 relative w-fit h-fit py-1 px-2 text-sm mt-1 whitespace-nowrap rounded-sm" style={{ top: offset }}>
            {text}
          </div>
        </div>
      )}
    </div>
  )
}