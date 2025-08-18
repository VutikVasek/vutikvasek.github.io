import React, { useState } from "react";
import { FiMoreHorizontal } from "react-icons/fi";
import Descriptor from "../info/Descriptor";
import FullScreen from "./FullScreen";

export default function More({ children }) {
  if (!children || !children.length) return "";
  const childrenArray = Array.isArray(children) ? children : [children];
  const [showMore, setShowMore] = useState(false);

  return (
    <Descriptor text={!showMore && "More"}>
      <div className="h-full aspect-square">
        <button className="h-full w-full" onClick={(e) => {e.stopPropagation(); setShowMore(val => !val)}}>
          <FiMoreHorizontal className="text-lg m-auto" />
        </button>
        {showMore && (
          <>
          <FullScreen onClick={() => setShowMore(false)} invis></FullScreen>
          <div className="w-0 h-0 overflow-visible">
            <div className="bg-gray-300 w-fit p-2 gap-2 relative flex flex-col whitespace-nowrap z-50">
              {childrenArray.map((item, index) => (
                <div className="flex w-fit items-center gap-1" onClick={e => e.stopPropagation()} key={index}>
                  {item}
                </div>
              ))}
            </div>
          </div>
          </>
        )}
      </div>
    </Descriptor>
  );
}