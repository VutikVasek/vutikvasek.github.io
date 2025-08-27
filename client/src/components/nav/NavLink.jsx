import SmartLink from "../basic/SmartLink";

export default function NavLink({ to, text, icon }) {
  return (
    <SmartLink to={to} className='group/navlink text-xl'>
      <h3 className="pl-3 pr-4 py-2 rounded-lg w-fit group-hover/navlink:bg-slate-800 gap-4 flex items-center">
        <div className="max-w-[3rem] text-2xl">{icon}</div>
        {text}
      </h3>
    </SmartLink>
  )
}