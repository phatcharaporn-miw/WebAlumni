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

    // เส้นทางที่ต้องการการเข้าสู่ระบบ
    const protectedPaths = [
      "/alumni-profile", 
      "/editWebboard", 
      "/alumni-profile-webboard", 
      "alumni-home", 
      "alumni-favorite"
    ];

    // เส้นทางที่ต้องการสิทธิ์เฉพาะ role
    const roleCheckPaths = {
      // admin: ["/admin-home", "/admin-create-news", "/admin-create-activity"],
      // president: ["/president-home"],
      // students: ["/student-home"]
    };

    useEffect(() => {
      const updateUser = () => {
        const userId = localStorage.getItem("userId");
        const role = localStorage.getItem("userRole");
    
        if (userId && role) {
          setUser({ userId, role });
          navigate('/alumni-home');
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
          withCredentials: "include"
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

   // ตรวจสอบสิทธิ์การเข้าถึงเฉพาะเส้นทางที่ต้องการการเข้าสู่ระบบ
   useEffect(() => {
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("userRole");

    if (protectedPaths.includes(location.pathname) && !userId) {
        Swal.fire({
            title: "กรุณาเข้าสู่ระบบ",
            text: "คุณต้องเข้าสู่ระบบก่อนเข้าถึงหน้านี้",
            icon: "warning",
            confirmButtonColor: "#0F75BC",
            confirmButtonText: "ตกลง",
        }).then(() => {
            navigate("/login");
        });
    }

    //สร้างออบเจ็กต์ที่เก็บเส้นทางที่ต้องการสิทธิ์เฉพาะ role
    Object.keys(roleCheckPaths).forEach((key) => {
      if (roleCheckPaths[key].includes(location.pathname) && role !== key) {
          Swal.fire({
              title: "การเข้าถึงถูกปฏิเสธ",
              text: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
              icon: "error",
              confirmButtonColor: "#d33",
              confirmButtonText: "ตกลง",
          }).then(() => {
              navigate("/");
          });
      }
  });
}, [location.pathname]);

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