import { useState } from "react";
import { IoClose } from "react-icons/io5";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

export default function SelectedMedia({loadingFiles, files, URLs, handleRemoveFile}) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  return (
    <>
      <div className='flex gap-2 h-full w-full'>
        {[...Array(loadingFiles).keys()].map((_, index) => (
          <div className='flex items-center gap-2' key={index}>
            {"Loading..."}
          </div>
        ))}
        {files.map((file, index) => (
          <div className='aspect-square relative group cursor-pointer h-full' 
              key={index}
              onClick={() => {
                setIndex(index);
                setOpen(true);
              }}>
            <img src={URLs[index]} alt="preview" className="object-cover w-full h-full" />
            <div className="absolute top-0 left-0 w-full h-full group-hover:shadow-inner-xl"></div>
            <div className='cursor-pointer absolute top-0 right-0 m-1' onClick={(e) => { e.stopPropagation(); handleRemoveFile(index) }}>
              <IoClose className="p-1 bg-black bg-opacity-50 rounded-full h-full w-full text-gray-300" />
            </div>
          </div>
        ))}
      </div>
      

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={URLs.map(url => ({ src: url }))}
        index={index}
        on={{ view: ({ index }) => setIndex(index) }}
        controller={{closeOnPullUp: true, closeOnPullDown: true, closeOnBackdropClick: true}}
        plugins={[Zoom]}
        zoom={{
          maxZoomPixelRatio: 3,
          wheelZoomDistanceFactor: 300,
          pinchZoomDistanceFactor: 300,
          scrollToZoom: true
        }}
      />
    </>
    )
}