import GifPicker from "gif-picker-react";
import { useState } from "react";
import { PiGifFill } from "react-icons/pi";
import FullScreen from "../basic/FullScreen";
import { useFloating, flip, shift, offset } from '@floating-ui/react-dom';
const TENOR_API_KEY = import.meta.env.TENOR_API_KEY;

export default function GifSelector({ onSelect, ...params }) {
  const [showPicker, setShowPicker] = useState(false);
  const { refs, floatingStyles } = useFloating({
    placement: 'bottom-start',
    middleware: [
      offset(4),
      flip(),
      shift(),
    ],
  });

  return (
    <div ref={refs.setReference} className="h-fit cursor-pointer">
      <PiGifFill onClick={() => setShowPicker(val => !val)} className='text-gray-500 hover:text-black' {...params} />
      <div className="w-0 h-0 overflow-visible relative">
        {showPicker && (
          <>
            <FullScreen onClick={() => setShowPicker(false)} />
            <div ref={refs.setFloating} style={floatingStyles} className="z-50">
              <GifPicker tenorApiKey={TENOR_API_KEY} onGifClick={onSelect} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}