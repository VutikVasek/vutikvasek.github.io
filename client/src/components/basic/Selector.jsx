import { use, useEffect, useRef, useState } from "react";
import { useFloating, flip, shift, offset } from '@floating-ui/react-dom';
import ProfilePicture from "../media/ProfilePicture";
const API = import.meta.env.VITE_API_BASE_URL;

export default function Selector({selected, setSelected, search, symbol = "@", destroy, onEnter}) {
  const [query, setQuery] = useState(selected.query || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(selected.item || null);
  const [focused, setFocused] = useState(false);
  
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

    if (!query.trim()) return setResults([]);

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/search/${encodeURIComponent(search)}?query=${encodeURIComponent(query)}`, {
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
    <div ref={refs.setReference} className="flex items-center" onFocus={() => setFocused(true)} onBlur={handleOnBlur} >
      <p className={"font-semibold w-4 text-center " + (selected.locked ? "text-blue-500" : "z-20 ml-4")}>{symbol}</p>
      {!selected.locked ?
        <input type="text" className="textfield w-32 p-1 pl-6 ml-[-1.3rem] rounded-[0.2rem]"
          value={query} onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown} autoFocus />
        :
        <p className="w-fit mr-2 text-blue-500 font-semibold">{query}</p>
      }
      {(results.length > 0 && focused) &&
      <div className="bg-slate-800 flex flex-col rounded-md overflow-hidden stiff" ref={refs.setFloating} style={floatingStyles}>
        {loading && "Loading..."}
        {results.map((item, index) => (
          <div className="flex items-center gap-2 p-2 cursor-pointer hover:bg-slate-700" key={index} 
              onClick={() => handleSelectItem(item)}
              onMouseDown={(e) => e.preventDefault()} >
            <ProfilePicture path={search === "mygroups" ? "gp" : "pfp"} pfp={item._id} className="w-10" />
            <p className="w-full max-w-md truncate">{item.name}</p>
          </div>
        ))}
      </div>}
    </div>
  )
}