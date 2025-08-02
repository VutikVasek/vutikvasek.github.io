import GifPicker from "gif-picker-react";
import { useState } from "react";
import { PiGifFill } from "react-icons/pi";

export default function GifSelector({ onSelect }) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div>
      <PiGifFill onClick={() => setShowPicker(val => !val)} className='text-gray-500 hover:text-black' />
      <div className="w-0 h-0 overflow-visible relative">
        {showPicker && (
          <div className="absolute">
            <GifPicker tenorApiKey='AIzaSyABsUMduz73uFxUg1nY-p2NF8e3_2WozD0' onGifClick={onSelect} />
          </div>
        )}
      </div>
    </div>
  )
}