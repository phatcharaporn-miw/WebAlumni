import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// สร้าง Context
export const AuthContext = createContext();

// สร้าง Provider
export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: null,
    loading: true ,
  });

  useEffect(() => {
    // เช็คสถานะการเข้าสู่ระบบเมื่อโหลดแอป
    const checkAuth = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/check-auth', { withCredentials: true });
        if (res.data.success) {
          setAuth({
            isAuthenticated: true,
            user: res.data.user,
            loading: false,
          });
        } else {
          setAuth({
            isAuthenticated: false,
            user: null,
            loading: false,
          });
        }
      } catch (error) {
        setAuth({
          isAuthenticated: false,
          user: null,
          loading: false,
        });
      }
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
