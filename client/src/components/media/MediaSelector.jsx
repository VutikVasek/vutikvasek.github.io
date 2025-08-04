import { useAppContext } from "@/context/AppContext";
import React, { useEffect, useImperativeHandle, useState } from "react";
import ImageSelector from "./ImageSelector";
import GifSelector from "./GifSelector";
import { IoClose } from "react-icons/io5";
const API = import.meta.env.VITE_API_BASE_URL;

const MediaSelector = React.forwardRef(({ max = 1, rerender }, ref) => {
  const [files, setFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(0);
  const { showErrorToast } = useAppContext();

  useEffect(() => {
    if (rerender) rerender();
  }, [files, loadingFiles]);

  useImperativeHandle(ref, () => ({
    async upload(id) {
      await Promise.all(files.map(async (file, index) => {
        await uploadImage(file, id, index);
      }))
    },
    getFiles() {
      return (
      <div className='p-6'>
        {[...Array(loadingFiles).keys()].map((_, index) => (
          <div className='flex items-center gap-2' key={index}>
            {"Loading..."}
          </div>
        ))}
        {files.map((file, index) => (
          <div className='flex items-center gap-2' key={index}>
            {file.name}
            <div className='cursor-pointer' onClick={() => handleRemoveFile(index)}>
              <IoClose />
            </div>
          </div>
        ))}
      </div>)
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
    setFiles((prev) => [...prev, ...filtered].slice(0, 2));
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
    <div>
      <ImageSelector onChange={handleFileChange} />
      <GifSelector onSelect={handleGifClick} />
    </div>
  )
})

export default MediaSelector;