import { createContext, useState, useEffect } from 'react';
import { authAPI } from '../api/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (userData) => {
    const res = await authAPI.login(userData);
    localStorage.setItem('user', JSON.stringify(res.data));
    localStorage.setItem('token', res.data.token);
    setUser(res.data);
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    localStorage.setItem('user', JSON.stringify(res.data));
    localStorage.setItem('token', res.data.token);
    setUser(res.data);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};