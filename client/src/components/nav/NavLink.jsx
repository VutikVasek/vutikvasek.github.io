import SmartLink from "../basic/SmartLink";

export default function NavLink({ to, text, title, icon }) {
  return (
    <SmartLink to={to} className='group/navlink text-xl max-w-full'>
      <h3 className="pl-3 pr-4 py-2 rounded-lg w-fit group-hover/navlink:bg-slate-800 gap-4 flex items-center max-w-full">
        <div className="max-w-[3rem] text-2xl">{icon}</div>
        <div className="max-w-full truncate">
          <div>{title}</div>
          <div className="truncate max-w-full">{text}</div>
        </div>
      </h3>
    </SmartLink>
  )
}