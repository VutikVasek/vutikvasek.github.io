import { use, useEffect, useRef, useState } from "react";
import { useFloating, flip, shift, offset } from '@floating-ui/react-dom';
import Selector from "../basic/Selector";
const MEDIA = import.meta.env.VITE_MEDIA_BASE_URL;
const API = import.meta.env.VITE_API_BASE_URL;

export default function GroupSelector({group, setGroup, destroy, onEnter, locked}) {
  return <Selector selected={group} setSelected={(selected) => setGroup({...selected, selectedGroup: selected.selectedItem})} 
    search={"mygroups"} symbol="&" destroy={destroy} onEnter={onEnter} />
}