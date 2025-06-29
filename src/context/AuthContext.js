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

  // ดึงข้อมูลโปรไฟล์ผู้ใช้งาน
  const fetchUserProfile = async () => {
    const userId = localStorage.getItem("userId");
    
    if (!userId) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get('http://localhost:3001/users/profile', {
        withCredentials: true,
      });
      
      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error(
        'เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์ผู้ใช้งาน:',
        error.response ? error.response.data.message : error.message
      );
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // หลังจาก login สำเร็จ
  const handleLogin = async (userId, role, userData = null) => {
    localStorage.setItem('userId', userId);
    localStorage.setItem('userRole', role);
    
    if (userData) {
      // ถ้ามี userData จาก login response ให้ใช้ทันที
      setUser(userData);
    } else {
      // ไม่งั้นให้ fetch ข้อมูลใหม่
      await fetchUserProfile();
    }
    
    // setNotifications(3); // ถ้าต้องการ
  };

  // ออกจากระบบ
  const handleLogout = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/logout', {
        withCredentials: true,
      });
      
      if (response.status === 200) {
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        localStorage.removeItem('image_path');
        localStorage.removeItem('username');
        
        setUser(null);
        return true;
      } else {
        console.error("ออกจากระบบไม่สำเร็จ");
        return false;
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดขณะออกจากระบบ:", error.response ? error.response.data : error.message);
      return false;
    }
  };

  // ตรวจสอบ localStorage เมื่อ component mount
  useEffect(() => {
    const initializeAuth = () => {
      const userId = localStorage.getItem("userId");
      const role = localStorage.getItem("userRole");
      
      if (userId && role) {
        // ถ้ามี userId และ role ใน localStorage ให้ fetch profile
        fetchUserProfile();
      } else {
        setUser(null);
        setLoading(false);
      }
    };

    initializeAuth();

    // ตรวจจับการเปลี่ยนแปลงของ localStorage (สำหรับหลาย tab)
    const handleStorageChange = () => {
      initializeAuth();
    };

    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
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
      refreshUser: fetchUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};