import Descriptor from "../info/Descriptor";

export default function MediaButton({children, className, ...params}) {
  return (
  <Descriptor 
      className={
        "hover:bg-slate-800 text-slate-500 hover:text-white rounded-full h-10 aspect-square flex justify-center items-center cursor-pointer "
        + className}
      offset="0.5rem"
      {...params}>
    {children}
  </Descriptor>
  )
}