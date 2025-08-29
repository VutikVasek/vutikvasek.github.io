import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

export const AppContext = createContext();

export const AppProvider = ({children}) => {
  const [toastText, setToastText] = useState('');
  const [toastColor, setToastColor] = useState('');
  const [toastReshow, setToastReshow] = useState(false);

  const { id } = useAuth();

  let showInfoToast = (text) => showToast(text, "yellow");
  let showErrorToast = (text) => showToast(text, "red");
  const showToast = (text, color) => {
    setToastText(text);
    setToastColor(color);
    setToastReshow(val => !val);
  }

  const [searchHistory, setSearchHistory] = useState(JSON.parse(localStorage.getItem('searches')));

  const addToSearchHistory = (obj) => {
    const idPairs = JSON.parse(localStorage.getItem('searches')) || [];
    if (!idPairs.some(obj => obj.id === id)) idPairs.push({ id, history: [] });
    const history = idPairs.find(obj => obj.id === id)?.history || [];
    history.unshift(obj);
    const newHistory = history.filter((val, index, arr) => arr.findIndex(obj => JSON.stringify(obj) === JSON.stringify(val)) === index).slice(0, 30);
    idPairs.find(obj => obj.id === id).history = newHistory;
    localStorage.setItem('searches', JSON.stringify(idPairs));
    setSearchHistory(newHistory);
  }

  const deleteFromSearchHistory = (index) => {
    const idPairs = JSON.parse(localStorage.getItem('searches'));
    const history = idPairs?.find(obj => obj.id === id)?.history;
    if (!idPairs || !history) return;
    history.splice(index, 1);
    idPairs.find(obj => obj.id === id).history = history;
    localStorage.setItem('searches', JSON.stringify(idPairs));
    setSearchHistory(history);
  }

  const clearSearchHistory = () => {
    const idPairs = JSON.parse(localStorage.getItem('searches'));
    const history = idPairs?.find(obj => obj.id === id)?.history;
    if (!idPairs || !history) return;
    idPairs.find(obj => obj.id === id).history = [];
    localStorage.setItem('searches', JSON.stringify(idPairs));
    setSearchHistory([]);
  }

  useEffect(() => {
    if (!id) return setSearchHistory([]);
    const idPairs = JSON.parse(localStorage.getItem('searches'));
    const history = idPairs?.find(obj => obj.id === id)?.history || [];
    setSearchHistory(history);
  }, [id])

  return (
    <AppContext.Provider value={{
        showInfoToast, showErrorToast, toastText, toastColor, toastReshow, 
        searchHistory, addToSearchHistory, deleteFromSearchHistory, clearSearchHistory}}>
      { children }
    </AppContext.Provider>
  )
}

export const useAppContext = () => useContext(AppContext);