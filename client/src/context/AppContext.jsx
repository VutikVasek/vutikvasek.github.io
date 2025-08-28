import { createContext, useContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({children}) => {
  const [toastText, setToastText] = useState('');
  const [toastColor, setToastColor] = useState('');
  const [toastReshow, setToastReshow] = useState(false);

  let showInfoToast = (text) => showToast(text, "yellow");
  let showErrorToast = (text) => showToast(text, "red");
  const showToast = (text, color) => {
    setToastText(text);
    setToastColor(color);
    setToastReshow(val => !val);
  }

  const [searchHistory, setSearchHistory] = useState(JSON.parse(localStorage.getItem('searches')));

  const addToSearchHistory = (obj) => {
    const array = JSON.parse(localStorage.getItem('searches')) || [];
    array.unshift(obj);
    const newHistory = array.filter((val, index, arr) => arr.findIndex(obj => JSON.stringify(obj) === JSON.stringify(val)) === index).slice(0, 30);
    localStorage.setItem('searches', JSON.stringify(newHistory));
    setSearchHistory(newHistory);
  }

  const deleteFromSearchHistory = (index) => {
    const array = JSON.parse(localStorage.getItem('searches'));
    if (!array || array.length === 0) return;
    array.splice(index, 1);
    localStorage.setItem('searches', JSON.stringify(array));
    setSearchHistory(array);
  }

  const clearSearchHistory = () =>{
    localStorage.setItem('searches', JSON.stringify([]));
    setSearchHistory([]);
  }

  return (
    <AppContext.Provider value={{
        showInfoToast, showErrorToast, toastText, toastColor, toastReshow, 
        searchHistory, addToSearchHistory, deleteFromSearchHistory, clearSearchHistory}}>
      { children }
    </AppContext.Provider>
  )
}

export const useAppContext = () => useContext(AppContext);