import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

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
  const [loading, setLoading] = useState(true);

// ดึงข้อมูลโปรไฟล์ผู้ใช้ (รองรับทั้ง user และ admin)
const fetchUserProfile = async () => {
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("userRole");
  
  if (!userId || !role) {
    setUser(null);
    setLoading(false);
    return;
  }

  try {
    // ใช้ endpoint เดียวกันสำหรับทุก role โดยไม่ส่ง userId ใน URL
    // เพราะ backend ดึง userId จาก session
    const endpoint = 'http://localhost:3001/users/profile'; 
    
    console.log('Fetching profile for userId:', userId, 'role:', role);

    const response = await axios.get(endpoint, {
      withCredentials: true, // สำคัญมาก! เพื่อส่ง session cookie
    });

    console.log('Profile API Response:', response.data);

    if (response.data.success) {
      setUser({
        ...response.data.user,
        userId: response.data.user.userId || userId,
        role: response.data.user.role || role,
        isAdmin: role === '1',
        isUser: role !== '1',
      });
    } else {
      console.log('API returned success: false');
      setUser(null);
      localStorage.removeItem('userId');
      localStorage.removeItem('userRole');
      localStorage.removeItem('username');
      localStorage.removeItem('image_path');
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์:', error);
    console.error('Error status:', error.response?.status);
    console.error('Error message:', error.response?.data?.message);
    
    // ถ้าเป็น 401 (unauthorized) แสดงว่า session หมดอายุ
    if (error.response?.status === 401) {
      console.log('Session expired - clearing localStorage');
      localStorage.removeItem('userId');
      localStorage.removeItem('userRole');
      localStorage.removeItem('username');
      localStorage.removeItem('image_path');
    }
    
    setUser(null);
  } finally {
    setLoading(false);
  }
};

  // login
  const handleLogin = async (userId, role, userData = null) => {
    localStorage.setItem('userId', userId);
    localStorage.setItem('userRole', role);
    if (userData) {
      setUser({
        ...userData,
        userId,
        role,
        isAdmin: role === '1',
        isUser: role !== '1',
      });
    } else {
      await fetchUserProfile();
    }
  };

  // logout
  const handleLogout = async () => {
    // ล้างข้อมูลใน state ทันที
    setUser(null);
    setNotifications(0);

    // ล้าง localStorage
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    localStorage.removeItem('image_path');

    // ส่ง custom event
    window.dispatchEvent(new CustomEvent('userLogout'));

    // เรียก API logout (ไม่ต้องสนใจ error)
    try {
      await axios.get('http://localhost:3001/api/logout', {
        withCredentials: true,
      });
    } catch (error) {
      // ไม่ต้องทำอะไร
    }

    setLoading(false);
    return true;
  };

  // เพิ่ม function สำหรับบังคับ refresh state
  const forceRefresh = () => {
    setUser(null);
    setNotifications(0);
    localStorage.clear();
  };

  useEffect(() => {
    fetchUserProfile();

    // ฟัง storage event และ custom logout event
    const handleStorageChange = () => {
      fetchUserProfile();
    };

    const handleLogoutEvent = () => {
      setUser(null);
      setNotifications(0);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("userLogout", handleLogoutEvent);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userLogout", handleLogoutEvent);
    };
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      notifications,
      setNotifications,
      loading,
      handleLogin,
      handleLogout,
      refreshUser: fetchUserProfile,
      forceRefresh,
      // เพิ่ม helper functions
      isAdmin: user?.role === '1',
      isUser: user?.role !== '1' && user?.role,
      isLoggedIn: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};