import React, { Fragment, useState } from "react";
import { FiMoreHorizontal } from "react-icons/fi";
import Descriptor from "../info/Descriptor";
import FullScreen from "./FullScreen";

export default function More({ children }) {
  if (!children || children.length === 0) return "";
  const childrenArray = Array.isArray(children) ? children : [children];
  const [showMore, setShowMore] = useState(false);

  return (
    <Descriptor text={!showMore && "More"}>
      <div className="h-full aspect-square">
        <button className="h-full w-full  p-2 rounded-full hover:bg-slate-800 text-gray-500 hover:text-white" 
            onClick={(e) => {e.stopPropagation(); setShowMore(val => !val)}}>
          <FiMoreHorizontal className="text-lg" />
        </button>
        {showMore && (
          <>
          <FullScreen onClick={() => setShowMore(false)} invis></FullScreen>
          <div className="w-0 h-0 overflow-visible">
            <div className="bg-slate-700 w-fit p-2 gap-2 relative flex flex-col whitespace-nowrap z-50">
              {childrenArray.map((item, index) => (
                <Fragment key={index}>
                <div className="flex w-fit items-center gap-1" onClick={e => e.stopPropagation()} key={index}>
                  {item}
                </div>
                {index !== childrenArray.length - 1 &&
                <div className="bg-slate-500 w-full h-[2px]"></div>}
                </Fragment>
              ))}
            </div>
          </div>
          </>
        )}
      </div>
    </Descriptor>
  );
}