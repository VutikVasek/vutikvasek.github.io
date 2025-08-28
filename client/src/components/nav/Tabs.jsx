import React from "react";

export default function Tabs({ children, selected, className, ...params }) {
  return (
    <div className={`flex justify-around text-center ` + className} {...params}>
      {React.Children.map(children, child =>
        React.cloneElement(child, {
          className: (child.props.className || "") + " " + 
            (selected === child.props.id ? "bg-gray-800 font-semibold" : "bg-gray-900") + " " +
            "py-6 w-full hover:bg-gray-700 text-lg"
        })
      )}
    </div>
  )
}