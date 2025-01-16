import React, { useEffect, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import { Outlet, useLocation } from "react-router-dom";
import axios from 'axios';
import {  useNavigate} from "react-router-dom";

function AppLayout() {
    const [user, setUser] = useState(null);
    const [notifications, setNotifications] = useState(0);
    const location = useLocation();
    const navigate = useNavigate();

    const hideHeaderPaths = ["/login","/register",];
    const shouldHideHeader = hideHeaderPaths.includes(location.pathname);
    const shouldHideFooter = hideHeaderPaths.includes(location.pathname);
    
    useEffect(() => {
      // เช็คข้อมูลจาก localStorage
      const userId = localStorage.getItem('userId');
      const role = localStorage.getItem('userRole');
      
      if (userId && role) {
        setUser({userId, role});
        setNotifications(3); 
      }else {
        setUser(null); // รีเซ็ต user เมื่อ logout
      }
    }, []);
  
    // เช็คเมื่อมีการล็อกอินและเปลี่ยนข้อมูลใน localStorage
  const handleLogin = (userId, role) => {
    localStorage.setItem('userId', userId);
    localStorage.setItem('userRole', role);
    setUser({ userId, role});
    setNotifications(3);  
  };

  const handleLogout = () => {
      axios.get('http://localhost:3001/api/logout', {
          withCredentials: "include"
        })
          .then((response) => {
              if (response.status === 200) {
                 localStorage.removeItem('userId');
                 localStorage.removeItem('userRole');

                setUser(null); // รีเซ็ต user เป็น null
                navigate('/')
              }else {
                console.error("ออกจากระบบไม่สำเร็จ");
              }
          })
          .catch((error) => {
              console.error("เกิดข้อผิดพลาดขณะออกจากระบบ:", error.response ? error.response.data : error.message);
          });
  };

  useEffect(() => {
    // ดึงข้อมูลผู้ใช้จาก API 
    axios.get('http://localhost:3001/users/profile', { 
        withCredentials: true })
      .then((response) => {
        
        if (response.data.success) {
          setUser(response.data.user);
        }
      })
      .catch((error) => {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์ผู้ใช้งาน:', error.response ? error.response.data.message : error.message);
      });
  }, []);

  return (
    <div>
    
      {!shouldHideHeader && <Header user={user} setUser={setUser} notifications={notifications} handleLogin={handleLogin}/>} 
     
        <main className="main-content">
          <Outlet context={{ user, setUser,  handleLogin, handleLogout}} />
        </main>

      {!shouldHideFooter && <Footer />} 
      </div>   
  );
}

export default AppLayout;