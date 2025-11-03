// AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {HOSTNAME} from '../config.js';
// import Swal from 'sweetalert2';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [initDone, setInitDone] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const normalizeUser = (u) => ({
    user_id: u.userId || u.user_id || u.id,
    username: u.username || u.full_name || u.nick_name || "",
    role: Number(u.role || u.role_id),
    isAdmin: Number(u.role || u.role_id) === 1,
    isUser: Number(u.role || u.role_id) !== 1,
    profilePicture: u.profilePicture || u.image_path || HOSTNAME +"/uploads/default-profile.png",
  });

  // ฟังก์ชันเช็ค session กับ server
  const checkSession = async () => {
    try {
      const res = await axios.get(HOSTNAME +"/users/profile", { 
        withCredentials: true,
      });

      if (res.data.success) {
        const userData = normalizeUser(res.data.user);
        setUser(userData);
        sessionStorage.setItem("user", JSON.stringify(userData));
        return true;
      } else {
        setUser(null);
        sessionStorage.removeItem("user");
        return false;
      }
    } catch (error) {
      console.error('Session check failed:', error);
      return false;
    }
  };

  // Initialize auth เมื่อ component mount
useEffect(() => {
  const initAuth = async () => {      
    const savedUser = sessionStorage.getItem("user");
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        console.log('Found saved user:', userData.username);
        setUser(userData);
      } catch (error) {
        console.error('Invalid saved user data');
        sessionStorage.removeItem("user");
      }
    }

    const isValidSession = await checkSession();
    console.log('Session valid:', isValidSession);

    setIsLoading(false);
    setInitDone(true); 
    console.log('Auth initialized');
  };

  initAuth();
}, []);


  const handleLogin = async (username, password) => {
    try {
      // console.log('Logging in...');
      const response = await axios.post(HOSTNAME +"/api/login", {
        username,
        password
      }, { withCredentials: true });

      if (response.data.success) {
        const userData = normalizeUser(response.data);
        setUser(userData);
        sessionStorage.setItem("user", JSON.stringify(userData));
        
        // อัพเดท profile หากจำเป็น
        if (!response.data.profilePicture) {
          await checkSession();
        }
        
        return response.data;
      }

      throw new Error(response.data.message || 'Login failed');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const handleLogout = async () => {
  try {
    setIsLoggingOut(true);
    
    // ล้าง state/session
    setUser(null);
    setNotifications(0);
    sessionStorage.removeItem("user");

    // แจ้ง tabs อื่น
    localStorage.setItem('logout-event', Date.now().toString());
    localStorage.removeItem('logout-event');
    
    // เรียก API logout
    await axios.post(HOSTNAME +"/api/logout", {}, { withCredentials: true });

    // ไปหน้าหลักทันที
    navigate('/');
    
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    setIsLoggingOut(false);
  }
};


  // cross-tab logout
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'logout-event') {
        console.log('Logout from another tab');
        setUser(null);
        setNotifications(0);
        sessionStorage.removeItem("user");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Debug log
  useEffect(() => {
    console.log('Auth State:', { 
      user: user?.username || 'none', 
      isLoading, 
      isLoggingOut 
    });
  }, [user, isLoading, isLoggingOut]);

  const contextValue = {
    user,
    setUser,
    notifications,
    setNotifications,
    isLoading,
    initDone,
    isLoggingOut,
    handleLogin,
    handleLogout,
    refreshUser: checkSession,
    isAdmin: user?.role === 1,
    isUser: user?.role !== 1 && user?.role,
    isLoggedIn: !!user,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};