import React, { Fragment, useState } from "react";
import { FiMoreHorizontal } from "react-icons/fi";
import Descriptor from "../info/Descriptor";
import FullScreen from "./FullScreen";

export default function More({ children }) {
  if (!children || children.length === 0) return "";
  const childrenArray = Array.isArray(children) ? children : [children];
  const [showMore, setShowMore] = useState(false);

  return (
    <Descriptor text={!showMore && "More"} className="rounded-full">
      <div className="h-full aspect-square">
        <button className="h-full w-full  p-2 rounded-full hover:bg-slate-800 text-gray-500 hover:text-white" 
            onClick={(e) => {e.stopPropagation(); setShowMore(val => !val)}}>
          <FiMoreHorizontal className="text-lg" />
        </button>
        {showMore && (
          <>
          <FullScreen onClick={() => setShowMore(false)} invis></FullScreen>
          <div className="w-0 h-0 overflow-visible">
            <div className="bg-slate-800 w-fit relative flex flex-col whitespace-nowrap z-50 rounded-md overflow-hidden">
              {childrenArray.map((item, index) => (
                <Fragment key={index}>
                <div className="flex w-full items-center hover:bg-slate-700 p-2" onClick={e => e.stopPropagation()} key={index}>
                  {item}
                </div>
                {index !== childrenArray.length - 1 &&
                <div className="bg-slate-600 w-full h-[2px]"></div>}
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