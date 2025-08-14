import { useState, useRef, useEffect } from "react";
import SmartLink from "./SmartLink";

export default function ExpandableText({ text, maxHeight = 200 }) {
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef(null);
  const [, setTextElements] = useState([text]);

  useEffect(() => {
    setIsOverflowing(textRef.current?.scrollHeight > maxHeight);
  }, [text, maxHeight]);

  useEffect(() => {
    setTextElements(text.split(/(#[a-zA-Z0-9_]+(?=\s|$|[^\w]|#))/gi).filter(Boolean));
  }, [text]);

  return (
    <div>
      <p ref={textRef} className={"overflow-clip"} style={{maxHeight: expanded ? "initial" : maxHeight + "px"}}>
        {textElements.map(element => 
          element.split()[0] !== '#' ? 
            element : 
            <SmartLink to={`/h/${element.split().slice(1).join()}`}>{element}</SmartLink>)}
      </p>
      {isOverflowing && (
        <button onClick={() => setExpanded(val => !val)}>
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}