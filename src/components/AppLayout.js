import React, { useEffect, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import "../css/appLayout.css";
import { Outlet, useLocation } from "react-router-dom";
import axios from 'axios';
import {  useNavigate} from "react-router-dom";
import Breadcrumb from './ฺBreadcrumb';
import Swal from "sweetalert2";

function AppLayout() {
    const [user, setUser] = useState(null);
    const [notifications, setNotifications] = useState(0);
    const image_path = localStorage.getItem("image_path");
    const username = localStorage.getItem("username");
    const location = useLocation();
    const navigate = useNavigate();

    const hideHeaderPaths = ["/login","/register", "/forgotPassword",];
    const shouldHideHeader = hideHeaderPaths.includes(location.pathname);
    const shouldHideFooter = hideHeaderPaths.includes(location.pathname);


    useEffect(() => {
      const updateUser = () => {
        const userId = localStorage.getItem("userId");
        const role = localStorage.getItem("userRole");
    
        if (userId && role) {
          setUser({ userId, role });
          navigate('/');
        } else {
          setUser(null);
        }
      };
    
      updateUser(); // อัปเดตเมื่อโหลดหน้า
      window.addEventListener("storage", updateUser); // ตรวจจับการเปลี่ยนแปลงของ localStorage
    
      return () => {
        window.removeEventListener("storage", updateUser);
      };
    }, []);
    
  
    // เช็คเมื่อมีการล็อกอินและเปลี่ยนข้อมูลใน localStorage
  const handleLogin = (userId, role) => {
    localStorage.setItem('userId', userId);
    localStorage.setItem('userRole', role);
    setUser({ userId, role});
    // setNotifications(3);  
  };

  const handleLogout = () => {
      axios.get('http://localhost:3001/api/logout', {
          withCredentials: true,
        })
          .then((response) => {
              if (response.status === 200) {
                 
                 localStorage.removeItem('userId');
                 localStorage.removeItem('userRole');
                 localStorage.removeItem('image_path');
                 localStorage.removeItem('username');

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

  // ดึงโปรไฟล์ผู้ใช้งาน
  useEffect(() => {
    const userId = localStorage.getItem("userId");

    if (!userId) return;

    axios.get('http://localhost:3001/users/profile', {
      withCredentials: true,
    })
      .then((response) => {
        if (response.data.success) {
          setUser(response.data.user);
        }
      })
      .catch((error) => {
        console.error(
          'เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์ผู้ใช้งาน:',
          error.response ? error.response.data.message : error.message
        );
      });
  }, []);


  return (
    <div id="root">
        {!shouldHideHeader && (
            <Header
                user={user}
                setUser={setUser}
                notifications={notifications}
                handleLogin={handleLogin}
            />
        )}

        <main className="main-content">
            <Breadcrumb />
            <Outlet context={{ user, setUser, handleLogin, handleLogout }} />
        </main>

        {!shouldHideFooter && <Footer />}
    </div>   
  );
}

export default AppLayout;