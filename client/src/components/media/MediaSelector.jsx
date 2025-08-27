import { useAppContext } from "@/context/AppContext";
import React, { useEffect, useId, useImperativeHandle, useState } from "react";
import GifPicker from "gif-picker-react";
import FullScreen from "../basic/FullScreen";
import SelectedMedia from "./SelectedMedia";
import MediaButton from "./MediaButton";
import { FaImage } from "react-icons/fa6";
import { PiGifFill } from "react-icons/pi";
import { useFloating, flip, shift, offset } from '@floating-ui/react-dom';
const API = import.meta.env.VITE_API_BASE_URL;
const TENOR_API_KEY = import.meta.env.VITE_TENOR_API_KEY;

const MediaSelector = React.forwardRef(({ max = 1, rerender, flex = "" }, ref) => {
  const [files, setFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(0);
  const [URLs, setURLs] = useState([]);
  const [showPicker, setShowPicker] = useState(false);

  const { refs, floatingStyles } = useFloating({
    placement: 'bottom-start',
    middleware: [
      offset(4),
      flip(),
      shift(),
    ],
  });
  const { showErrorToast } = useAppContext();

  const id = useId();

  useEffect(() => {
    if (rerender) rerender();
  }, [loadingFiles, URLs]);

  useEffect(() => {
    const urlStrings = files.map(file => URL.createObjectURL(file));
    setURLs(urlStrings);

    return () => {
      urlStrings.forEach(url => URL.revokeObjectURL(url));
    };
  }, [files]);

  useImperativeHandle(ref, () => ({
    async upload(id) {
      await Promise.all(files.map(async (file, index) => {
        await uploadImage(file, id, index);
      }))
    },
    getFiles() {
      return <SelectedMedia files={files} loadingFiles={loadingFiles} URLs={URLs} handleRemoveFile={handleRemoveFile} />
    },
    getFileCount() {
      return files.length;
    },
    stillLoading() {
      return loadingFiles > 0;
    },
    handleDrop(e) {
      handleDropFile(e)
    }
  }))

  const uploadImage = async (file, id, index) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('index', index);
    formData.append('id', id);

    const res = await fetch(`${API}/upload/image`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    const data = await res.json();
    if (!res.ok) alert(data.message || 'Upload failed');
  }

  const handleGifClick = async (image) => {
    const url = image?.url;
    if (!url) return;

    setLoadingFiles(prev => prev + 1);
      
    const response = await fetch(url);
    const blob = await response.blob();
    const file = new File([blob], url.split('/').pop(), { type: blob.type });
    setLoadingFiles(prev => Math.max(prev - 1, 0));
    addToFiles([file]);
  }

  const addToFiles = (arr) => {
    const filtered = arr.filter(file => {
      if (file.type.split('/')[0] === "image") return file;
      showErrorToast("You can only upload images");
    })
    if (filtered.length + files.length > max) showErrorToast(`You can only upload up to ${max} images`);
    setFiles((prev) => [...prev, ...filtered].slice(0, max));
  }

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    addToFiles(selectedFiles);
    e.target.value = null;
  }

  const handleDropFile = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addToFiles(Array.from(e.dataTransfer.files));
      e.dataTransfer.clearData();
    }
  }

  const handleRemoveFile = (index) => {
    setFiles((prev) => {
      let arr = [...prev];
      arr.splice(index, 1);
      return arr; 
    })
  }


  return (
    <div className={"flex h-fit gap-2 " + flex}>
      <label htmlFor={id} className="cursor-pointer rounded-full">
        <MediaButton className="text-lg" text="Media">
          <div className="h-fit">
              <FaImage />
            <input type="file" name="image" id={id} accept="image/*" multiple 
              onChange={handleFileChange} className="hidden" 
              />
          </div>
        </MediaButton>
      </label>
      <MediaButton className="text-xl" onClick={() => setShowPicker(val => !val)} text="GIFs">
        <div ref={refs.setReference} className="cursor-pointer">
          <PiGifFill />
          <div className="w-0 h-0 overflow-visible relative">
            {showPicker && (
              <>
                <FullScreen onClick={() => setShowPicker(false)} />
                <div ref={refs.setFloating} style={floatingStyles} className="z-50" onClick={(e) => e.stopPropagation()}>
                  <GifPicker tenorApiKey={TENOR_API_KEY} onGifClick={handleGifClick} theme="dark" />
                </div>
              </>
            )}
          </div>
        </div>
      </MediaButton>
    </div>
  )
})

export default MediaSelector;