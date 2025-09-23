import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

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
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  // const [redirectPath, setRedirectPath] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const navigate = useNavigate();

  const normalizeUser = (u) => ({
  user_id: u.userId || u.user_id || u.id,
  username: u.username || u.full_name || u.nick_name || "",
  role: Number(u.role || u.role_id),
  isAdmin: Number(u.role || u.role_id) === 1,
  isUser: Number(u.role || u.role_id) !== 1,
  profilePicture: u.profilePicture || u.image_path || "http://localhost:3001/uploads/default-profile.png",
});


const fetchUserProfile = async () => {
  setLoading(true);
  try {
    console.log('Fetching user profile...');
    const res = await axios.get("http://localhost:3001/users/profile", { 
      withCredentials: true,
    });

    if (res.data.success) {
  const userData = normalizeUser(res.data.user);
  setUser(userData);
  sessionStorage.setItem("user", JSON.stringify(userData));
} else {
  console.log('No valid session found');
  setUser(null);
  sessionStorage.removeItem("user");
  
}
  } catch (error) {
    console.error('Error fetching profile:', error);
    
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  // console.log('AuthProvider initializing...');
  const initializeAuth = async () => {
    setInitializing(true);
    try {
      const savedUser = sessionStorage.getItem("user");
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        console.log('Found saved user:', userData);
        setUser(userData); // ตั้งค่า user ทันทีเพื่อป้องกัน null
      }
      await fetchUserProfile();
    } catch (err) {
      console.error("Initialize auth error:", err);
    } finally {
      setInitializing(false); // ปิดเฉพาะตอน init เสร็จจริง ๆ
    }
  };

  initializeAuth();
}, []);


  const handleLogin = async (username, password) => {
    try {
      setLoading(true);
      console.log('Attempting login...', { username });

      const response = await axios.post("http://localhost:3001/api/login", {
        username,
        password
      }, { withCredentials: true });

      if (response.data.success) {
  const userData = normalizeUser(response.data);
  setUser(userData);
  
  sessionStorage.setItem("user", JSON.stringify(userData));

  if (!response.data.profilePicture || !response.data.username) {
    fetchUserProfile();
  }

  return response.data;
}

      throw new Error(response.data.message || 'Login failed');
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      throw error;
    }
  };

  // const handleLogout = async () => {

  //   try {
  //     setIsLoggingOut(true);
  //     console.log('Starting logout process...');
      
  //     window.dispatchEvent(new Event('userLogout'));

  //     await axios.post("http://localhost:3001/api/logout", {}, { withCredentials: true });
  //     console.log('Server logout successful');
  //   } catch (error) {
  //     console.error('Logout error:', error);
  //   }

  //   // ล้าง state และ storage
  //   setUser(null);
  //   setNotifications(0);
  //   sessionStorage.removeItem("user");
    
  //   // ส่ง storage event สำหรับ cross-tab communication
  //   localStorage.setItem('logout-event', Date.now().toString());
  //   localStorage.removeItem('logout-event');

  //   setIsLoggingOut(false);
  //   navigate('/'); // เปลี่ยนจาก window.location.href เป็น navigate('/')
    
  //   return true;
  // };

  const handleLogout = async () => {
  try {
    setIsLoggingOut(true);
    console.log('Starting logout process...');
    
    // ล้าง state และ storage ก่อน
    setUser(null);
    setNotifications(0);
    sessionStorage.removeItem("user");
    
    // ส่ง storage event สำหรับ cross-tab communication
    localStorage.setItem('logout-event', Date.now().toString());
    localStorage.removeItem('logout-event');
    
    // เรียก API logout หลังจากล้าง state แล้ว
    window.dispatchEvent(new Event('userLogout'));
    await axios.post("http://localhost:3001/api/logout", {}, { withCredentials: true });
    console.log('Server logout successful');
    
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    setIsLoggingOut(false);
    navigate('/');
  }
  
  return true;
};

  const forceRefresh = () => {
    setUser(null);
    setNotifications(0);
    sessionStorage.removeItem("user");
    fetchUserProfile();
  };

  const setUserFromLoginResponse = (loginData) => {
    const userData = {
      id: loginData.userId,
      username: loginData.username,
      role: loginData.role,
      isAdmin: loginData.role === 1,
      isUser: loginData.role !== 1,
      profilePicture: loginData.profilePicture || "http://localhost:3001/uploads/default-profile.png",
    };

    setUser(userData);
    sessionStorage.setItem("user", JSON.stringify(userData));
  };

  // เริ่มต้น: ตรวจสอบ sessionStorage ก่อน แล้วค่อย verify กับ server

// useEffect(() => {
//   const handleStorageChange = (e) => {
//     if (e.key === 'logout-event') {
//       console.log('Logout event from another tab');
//       setUser(null);
//       setNotifications(0);
//       sessionStorage.removeItem("user");
//       setRedirectPath('/login');
//     }
//   };

//   const handleLogoutEvent = () => {
//     console.log('Logout event received');
//     setUser(null);
//     setNotifications(0);
//     sessionStorage.removeItem("user");
//     setRedirectPath('/login');
//   };

//   window.addEventListener("storage", handleStorageChange);
//   window.addEventListener("userLogout", handleLogoutEvent);

//   return () => {
//     window.removeEventListener("storage", handleStorageChange);
//     window.removeEventListener("userLogout", handleLogoutEvent);
//   };
// }, []);


  // Debug user state changes
  useEffect(() => {
    console.log('User state changed:', user);
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      notifications,
      setNotifications,
      loading,
      isLoggingOut,
      handleLogin,
      handleLogout,
      refreshUser: fetchUserProfile,
      forceRefresh,
      setUserFromLoginResponse,
      // helper functions
      isAdmin: user?.role === 1,
      isUser: user?.role !== 1 && user?.role,
      isLoggedIn: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
