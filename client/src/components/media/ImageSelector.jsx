import { useId } from "react";
import { FaImage } from "react-icons/fa6";

export default function ImageSelector({onChange, ...params}) {
  const id = useId();

  return (
    <div className="h-fit">
      <label htmlFor={id} className="cursor-pointer">
        <FaImage className='text-gray-500 hover:text-black' {...params} />
      </label>
      <input type="file" name="image" id={id} accept="image/*" multiple 
        onChange={onChange} className="hidden" 
        />
    </div>
  )
}
