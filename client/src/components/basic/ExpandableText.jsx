import { useState, useRef, useEffect } from "react";

export default function ExpandableText({ text, maxHeight = 200 }) {
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef(null);

  useEffect(() => {
    setIsOverflowing(textRef.current?.scrollHeight > maxHeight);
  }, [text, maxHeight]);

  return (
    <div>
      <p ref={textRef} className={"overflow-clip"} style={{maxHeight: expanded ? "initial" : maxHeight + "px"}}>
        {text}
      </p>
      {isOverflowing && (
        <button onClick={() => setExpanded(val => !val)}>
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}