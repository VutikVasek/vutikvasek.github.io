export default function JoinButton({ group, logged }) {
  return(
    <>
      {(!group.owner && logged) &&
        (<div>
          {group.member ? 
            <button>Leave group</button>
          : 
          group.banned ?
            <div>You are banned</div>
            :
            <button>{group.requestJoin ? "Request join" : "Join"}</button>
          }  
        </div>)}
    </>
  )
}