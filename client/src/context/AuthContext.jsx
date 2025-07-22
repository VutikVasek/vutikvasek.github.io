import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(localStorage.getItem('username'));

  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    localStorage.setItem('username', userData.username);
    setUser(userData.username);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    localStorage.removeItem('username');
    setUser(null);
  };

  useEffect(() => {
  }, []);

  return (
    <AuthContext.Provider value={{ token, login, logout, isLoggedIn: !!token, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
