import { useEffect, useRef, useState } from "react";
import MentionSelector from "../notification/MentionSelector";

export default function TextInput({text, setText, setDBMentions, shouldFocus = true, onDrop, rows = 3}) {
  const [mentions, setMentions] = useState([]);
  const textareaRef = useRef(null);

  const addMention = () => {
    setMentions(prev => [...prev, { query: "" }]);
  }

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart - 1;
    if (text[start] === '@' && text[start - 1] === '@') {
      setText(text.slice(0, start - 1) + text.slice(start + 1));
      addMention();
    }
  }, [text])

  useEffect(() => {
    const arr = mentions.map(men => {
      if (men.selectedUser?._id) return men.selectedUser._id
      return men.query
    }).filter(val => val !== '')
    setDBMentions(arr.length > 0 ? arr : null);
  }, [mentions]);

  return (
    <div>
      <div className="flex">
        {mentions.map((mention, index) => (
          <MentionSelector mention={mention} setMention={(mention) =>
                setMentions(prev => prev.map((m, i) => i === index ? mention : m))
              } key={index} destroy={() => setMentions(prev => prev.filter((_, i) => i !== index))}
              onEnter={() => textareaRef.current?.focus()} />
        ))}
        <button onClick={addMention}>Add new mention</button>
      </div>
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
      ></textarea>
    </div>
  );
}