import { useEffect, useRef, useState } from "react";
import MentionSelector from "../notification/MentionSelector";
import { useAppContext } from "@/context/AppContext";
import GroupSelector from "../group/GroupSelector";
import { useLocation } from "react-router-dom";
const API = import.meta.env.VITE_API_BASE_URL;

export default function TextInput({text, setText, setDBMentions, setDBGroups, shouldFocus = true, onDrop, rows = 3, reset, handleSubmit}) {
  const [mentions, setMentions] = useState([]);
  const [groups, setGroups] = useState([]);
  const supportGroups = !!setDBGroups;
  const textareaRef = useRef(null);
  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const groupname = queryParams.get('g');
  const replyingTo = queryParams.get('rep');
  const { showErrorToast } = useAppContext();

  const addMention = () => {
    if (mentions.length >= 10) return showErrorToast("You can only mention up to 10 people");
    setMentions(prev => [...prev, { query: "" }]);
  }

  const addGroup = () => {
    if (groups.length >= 10) return showErrorToast("You can only post to up to 10 groups at once");
    setGroups(prev => [...prev, { query: "" }]);
  }

  useEffect(() => {
    setMentions([]);
    if (reset == null)
      setGroups(groupname ? [{query: groupname, locked: true}] : []);
  }, [reset])

  useEffect(() => {
    if (replyingTo && (reset === null || reset === undefined)) 
      fetch(`${API}/post/${replyingTo}/groups`)
        .then(res => res.json())
        .then(data => setGroups(data.map(groupname => ({query: groupname, locked: true}))))
        .catch(err => console.log(err));
  }, [])

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart - 1;
    if (text[start] === '@' && text[start - 1] === '@') {
      setText(text.slice(0, start - 1) + text.slice(start + 1));
      addMention();
    } else if (supportGroups && text[start] === '&' && text[start - 1] === '&') {
      setText(text.slice(0, start - 1) + text.slice(start + 1));
      addGroup();
    }
  }, [text])

  useEffect(() => {
    const arr = mentions.map(men => {
      if (men.selectedUser?._id) return men.selectedUser._id
      return men.query
    }).filter(val => val !== '').filter((val, index, array) => array.indexOf(val) === index);
    setDBMentions(arr.length > 0 ? arr : null);
  }, [mentions]);

  useEffect(() => {
    if (!supportGroups) return;
    const arr = groups.map(group => {
      if (group.selectedGroup?._id) return group.selectedGroup._id
      return group.query
    }).filter(val => val !== '').filter((val, index, array) => array.indexOf(val) === index);
    setDBGroups(arr.length > 0 ? arr : null);
  }, [groups]);

  return (
    <div>
      <div className="flex">
        {mentions.map((mention, index) => (
          <MentionSelector mention={mention} setMention={(mention) =>
                setMentions(prev => prev.map((m, i) => i === index ? mention : m))
              } key={index} destroy={() => setMentions(prev => prev.filter((_, i) => i !== index))}
              onEnter={(e) => { e.preventDefault(); textareaRef.current?.focus() }} />
        ))}
        <button onClick={addMention}>Add new mention</button>
      </div>
      {supportGroups && 
      <div className="flex">
        {groups.map((group, index) => (
          <GroupSelector group={group} setGroup={(group) =>
                setGroups(prev => prev.map((g, i) => i === index ? group : g))
              } key={index} destroy={() => setGroups(prev => prev.filter((_, i) => i !== index))}
              onEnter={(e) => { e.preventDefault(); textareaRef.current?.focus() }} />
        ))}
        <button onClick={addGroup}>Add new group</button>
      </div>
      }
      <textarea
        className="border border-black resize-none"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder='Start typing here...'
        {...(shouldFocus ? { autoFocus: true } : {})}
        maxLength={512}
        rows={rows}
        cols={60}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        ref={textareaRef}
        onKeyDownCapture={(e) => { if (e.key === "Enter" && e.ctrlKey && handleSubmit) handleSubmit(e) }}
      ></textarea>
    </div>
  );
}