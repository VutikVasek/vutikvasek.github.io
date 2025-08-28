import { useEffect, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import SmartLink from "../basic/SmartLink";
import { allowScroll, disableScroll } from "@/tools/document";

export default function Gallery({ images, link }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const [slides, setSlides] = useState(images.map((url) => ({ src: url })));

  useEffect(() => () => allowScroll(), []);

  return (
    <>
      <div className='flex w-full gap-2 max-h-96' onClick={e => e.stopPropagation()}>
        {images.map((url, i) => (
          <div className='w-fit' key={i}>
            <img
              key={i}
              src={url}
              alt=""
              className='object-cover w-full h-full cursor-pointer rounded-lg' 
              onError={(e) => {
                e.target.className = "w-0 h-0";
                setSlides(prev => prev.filter((val) => val.src != url));
              }}
              onClick={() => {
                setIndex(i);
                setOpen(true);
                disableScroll();
              }}
            />
          </div>
        ))}
        {link && (
          <SmartLink to={link} className='flex flex-1'></SmartLink>
        )}
      </div>

      <div onClick={e => e.stopPropagation()} className="hidden">
        <Lightbox
          open={open}
          close={() => {setOpen(false); allowScroll(true)}}
          slides={slides}
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
      </div>
    </>
  );
}