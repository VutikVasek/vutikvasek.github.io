import { use, useEffect, useRef, useState } from "react";
import { useFloating, flip, shift, offset } from '@floating-ui/react-dom';
import Selector from "../basic/Selector";
const MEDIA = import.meta.env.VITE_MEDIA_BASE_URL;
const API = import.meta.env.VITE_API_BASE_URL;

export default function MentionSelector({mention, setMention, destroy, onEnter}) {
  return <Selector 
    selected={mention} search="users" destroy={destroy} onEnter={onEnter}
    setSelected={(selected) => setMention({query: selected.query, selectedUser: { _id: selected.selectedItem?._id, username: selected.selectedItem?.name }})} />
}