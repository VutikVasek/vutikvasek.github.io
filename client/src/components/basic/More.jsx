import React, { useState } from "react";
import { FiMoreHorizontal } from "react-icons/fi";
import Descriptor from "../info/Descriptor";

export default function More({ children }) {
  if (!children) return "";
  const childrenArray = React.Children.toArray(children);

  const [showMore, setShowMore] = useState(false);

  return (
    <Descriptor text={!showMore && "More"}>
      <div className="h-full aspect-square">
        <button className="h-full w-full" onClick={() => setShowMore(val => !val)}>
          <FiMoreHorizontal className="text-lg m-auto" />
        </button>
        {showMore && (
          <>
          <div className="fixed w-screen h-screen left-0 top-0" onClick={() => setShowMore(false)}></div>
          <div className="w-0 h-0 overflow-visible">
            <div className="bg-gray-300 w-fit p-2 relative flex flex-col whitespace-nowrap">
              {childrenArray.map((item, index) => (
                <div className="flex w-fit items-center gap-1" key={index}>
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