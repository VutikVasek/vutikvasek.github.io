import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(localStorage.getItem('username'));
  const [id, setId] = useState(localStorage.getItem('id'));

  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    localStorage.setItem('username', userData.username);
    setUser(userData.username);
    localStorage.setItem('id', userData.id);
    setId(userData.id);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    localStorage.removeItem('username');
    setUser(null);
    localStorage.removeItem('id');
    setId(null);
  };

  const setUsername = (username) => {
    setUser(username);
    localStorage.setItem('username', username);
  }

  return (
    <AuthContext.Provider value={{ token, login, logout, isLoggedIn: !!token, user, id, setUsername }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
