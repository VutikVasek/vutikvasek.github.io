import { allowScroll, disableScroll } from "@/tools/document";
import { useEffect } from "react"

export default function FullScreen({ invis = false, onClick, ...props }) {

  useEffect(() => {
    disableScroll();
    return () => allowScroll();
  }, [])

  return (
    <div className={"fixed w-dvw h-dvh left-0 top-0 bg-opacity-10 z-40 flex items-center justify-center cursor-default " + (!invis && "bg-black")} 
    onClick={e => {
      e.stopPropagation();
      onClick(e);
    }}
    {...props} />
  )
}