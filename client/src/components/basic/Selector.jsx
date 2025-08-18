import { use, useEffect, useRef, useState } from "react";
import { useFloating, flip, shift, offset } from '@floating-ui/react-dom';
import ProfilePicture from "../media/ProfilePicture";
const MEDIA = import.meta.env.VITE_MEDIA_BASE_URL;
const API = import.meta.env.VITE_API_BASE_URL;

export default function Selector({selected, setSelected, search, symbol = "@", destroy, onEnter}) {
  const [query, setQuery] = useState(selected.query || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(selected.item || null);
  const [focused, setFocused] = useState(false);
  const [width, setWidth] = useState(0);

  const spanRef = useRef(null);
  
  const { refs, floatingStyles } = useFloating({
    placement: 'bottom-start',
    middleware: [
      flip(),
      shift(),
    ],
  });

  useEffect(() => {
    setSelected({query, selectedItem, locked: selected.locked});
  }, [query, selectedItem])

  useEffect(() => {
    if (selectedItem?._id && selectedItem?.name !== query) setSelectedItem({});

    setWidth(Math.max(spanRef.current?.offsetWidth + 20, 80));

    if (!query.trim()) return setResults([]);

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/search/${search}?query=${query}`, {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }});
        const data = await res.json();
        if (!res.ok) return console.log(data.message)
        setResults(data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }, 300)

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setQuery(item.name);
  }

  useEffect(() => {
    results.forEach(item => {
      if (item.name === query) handleSelectItem(item);
    })
  }, [results])

  const handleKeyDown = (e) => {
    if (query === '' && (e.key === "Delete" || e.key === "Backspace")) destroy();
    else if (e.key === "Enter" && onEnter) onEnter(e);
    else if (e.key === "Tab" && !selectedItem?._id && results.length > 0) {
      e.preventDefault();
      handleSelectItem(results[0]);
    } 
  }

  const handleOnBlur = (e) => {
    e.stopPropagation(); 
    setFocused(false);
    if (query === '') destroy();
  }

  return (
    <div ref={refs.setReference} className="flex" onFocus={() => setFocused(true)} onBlur={handleOnBlur} >
      <p>{symbol}</p>
      <span ref={spanRef} className="absolute invisible whitespace-pre">{query || " "}</span>
      {!selected.locked ?
        <input type="text" style={{ width }} 
          value={query} onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown} autoFocus />
        :
        <p style={{ width }}>{query}</p>
      }
      {(results.length > 0 && focused) &&
      <div className="bg-gray-300 flex flex-col p-1" ref={refs.setFloating} style={floatingStyles}>
        {loading && "Loading..."}
        {results.map((item, index) => (
          <div className="flex items-center gap-2 p-2 cursor-pointer" key={index} 
              onClick={() => handleSelectItem(item)}
              onMouseDown={(e) => e.preventDefault()} >
            <ProfilePicture path={search === "group" ? "gp" : "pfp"} pfp={item._id} className="w-10" />
            <p className="w-full">{item.name}</p>
          </div>
        ))}
      </div>}
    </div>
  )
}