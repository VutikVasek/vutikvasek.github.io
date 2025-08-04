import { FaImage } from "react-icons/fa6";

export default function ImageSelector({onChange}) {
  return (
    <div>
      
          {/* <div>
            <label htmlFor="image" className='block cursor-pointer p-20 border border-black w-fit'
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}>Click or drag images</label>
            <input type="file" name="image" id="image" accept="image/*" multiple 
              onChange={handleFileChange} 
              className='hidden'
              />
          </div> */}
      <label htmlFor="image">
        <FaImage className='text-gray-500 hover:text-black' />
      </label>
      <input type="file" name="image" id="image" accept="image/*" multiple 
        onChange={onChange} className="hidden"
        />
    </div>
  )
}
