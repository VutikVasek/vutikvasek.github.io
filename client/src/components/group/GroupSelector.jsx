import Selector from "../basic/Selector";

export default function GroupSelector({group, setGroup, destroy, onEnter}) {
  return <Selector selected={group} setSelected={({selectedItem, ...rest}) => setGroup({...rest, selectedGroup: selectedItem})} 
    search={"mygroups"} symbol="&" destroy={destroy} onEnter={onEnter} />
}