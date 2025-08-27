import { useEffect } from "react"

export default function FullScreen({ invis = false, onClick, ...props }) {

  useEffect(() => {
    document.body.style.paddingRight = `${window.innerWidth - document.body.clientWidth}px`;
    document.body.style.overflowY = 'hidden';
    return () => { 
      document.body.style.overflowY = 'scroll';
      document.body.style.paddingRight = "initial"
     }
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