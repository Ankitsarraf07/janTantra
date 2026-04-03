import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('jt_token');
    const savedUser = localStorage.getItem('jt_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      // Validate token by fetching profile
      authAPI.getProfile()
        .then(res => { setUser(res.data.user); localStorage.setItem('jt_user', JSON.stringify(res.data.user)); })
        .catch(() => { localStorage.removeItem('jt_token'); localStorage.removeItem('jt_user'); setUser(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('jt_token', token);
    localStorage.setItem('jt_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    const { token, user: userData } = res.data;
    localStorage.setItem('jt_token', token);
    localStorage.setItem('jt_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('jt_token');
    localStorage.removeItem('jt_user');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('jt_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
