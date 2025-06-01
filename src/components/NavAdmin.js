import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { IoMdNotificationsOutline } from "react-icons/io";
import { FaTrash } from "react-icons/fa";
import '../css/navAdmin.css';
import { auto } from '@popperjs/core';

function NavAdmin() {
    const [userInfo, setUserInfo] = useState({
        fullName: 'User',
        profilePic: '/default-profile-pic.jpg',
    });
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0); 
    const userId = localStorage.getItem('userId');

    const handleLogout = async () => {
        Swal.fire({
            title: 'คุณแน่ใจหรือไม่?',
            text: 'คุณต้องการออกจากระบบหรือไม่?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'ใช่, ออกจากระบบ!',
            cancelButtonText: 'ยกเลิก',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.get('http://localhost:3001/api/logout', { withCredentials: true });
    
                    // ลบข้อมูลใน localStorage
                    localStorage.removeItem('userId');
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('username');
                    localStorage.removeItem('image_path');
    
                    Swal.fire('ออกจากระบบสำเร็จ!', 'คุณได้ออกจากระบบเรียบร้อยแล้ว', 'success');
                    navigate('/'); // เปลี่ยนเส้นทางไปยังหน้าแรกหลังจากออกจากระบบ
                } catch (error) {
                    console.error('Logout Error:', error);
                    Swal.fire('เกิดข้อผิดพลาด!', 'ไม่สามารถออกจากระบบได้', 'error');
                }
            }
        });
    };

    useEffect(() => {
        const role = localStorage.getItem('userRole');
        const username = localStorage.getItem('username') || 'Admin'; 
        const imagePath = localStorage.getItem('image_path');  

        const profilePic = imagePath
            ? `http://localhost:3001/${imagePath.replace(/^\/+/, '')}`
            : '/default-profile-pic.jpg';

        if (role === '1') {
            setUserInfo({              
                fullName: username,
                profilePic: profilePic,
            });
        } else {
            navigate('/login'); 
        }
    }, [navigate]);

    // useEffect(() => {
    //     axios.get('http://localhost:3001/admin/notification-counts')
    //         .then((res) => {
    //             console.log(res.data);
    //             setDonationRequests(res.data.donationRequests);
    //             setSouvenirRequests(res.data.souvenirRequests);
    //         })
    //         .catch((err) => {
    //             console.error("โหลดแจ้งเตือนล้มเหลว", err);
    //         });
    // }, []);

    // ดึงแจ้งเตือนเมื่อผู้ใช้เข้าสู่ระบบ
    useEffect(() => {
      if (!userId) return;
      const fetchNotifications = () => {
        axios.get(`http://localhost:3001/notice/notification/${userId}`)
          .then((response) => {
            if (response.data.success) {
              const data = response.data.data || [];
              setNotifications(data);
              const unreadNotifications = data.filter((n) => n.status === "ยังไม่อ่าน");
              setUnreadCount(unreadNotifications.length);
            }
          })
          .catch((error) => console.error("Error loading notifications:", error));
      };

      fetchNotifications();

      const interval = setInterval(fetchNotifications, 30000); // รีเฟรชทุก 30 วินาที
      return () => clearInterval(interval);
    }, [userId]);


    const markAsRead = (notificationId) => {
      axios.put(`http://localhost:3001/notice/read/${notificationId}`)
          .then(() => {
              setNotifications((prevNotifications) =>
                  prevNotifications.map((n) =>
                      n.notification_id === notificationId
                          ? { ...n, read_status: "อ่านแล้ว" }
                          : n
                  )
              );
              setUnreadCount((prev) => Math.max(prev - 1, 0)); // ลดจำนวนแจ้งเตือนที่ยังไม่ได้อ่าน
          })
          .catch((error) => console.error("เกิดข้อผิดพลาดในการเปลี่ยนสถานะ:", error));
    };

  //ลบแจ้งเตือน
  const deleteNotification = (notificationId) => {
    axios.delete(`http://localhost:3001/notice/notification/${notificationId}`)
    .then(() => {
      setNotifications(notifications.filter((n) => n.notification_id !== notificationId));
      setUnreadCount((prev) => Math.max(prev - 1, 0)); // ลดตัวนับแจ้งเตือน
    })
    .catch((error) => console.error("เกิดข้อผิดพลาดในการลบแจ้งเตือน:", error));
  };

  //ฟังก์ชันแสดง/ซ่อนแจ้งเตือน
    const toggleNotifications = () => {
      setShowNotifications(!showNotifications);
    };
  
    // ป้องกันการปิด Dropdown เมื่อคลิกภายนอก
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (showNotifications && !event.target.closest(".notification-dropdown") && !event.target.closest(".notification-icon")) {
          setShowNotifications(false);
        }
      };
  
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }, [showNotifications]);
  
    // ป้องกันการปิด Dropdown เมื่อคลิกภายใน
    const handleDropdownClick = (event) => {
    event.stopPropagation(); 
    };

    return (
    
        <div style={{ ...navAdminStyles, position: "relative" }}>
            {userInfo ? (
                            <div>
                              {/* ไอคอนแจ้งเตือน */}
                              <div className="notification-container"
                                style={{
                                    position: "absolute",
                                    top: 20,
                                    right: 20,
                                    zIndex: 10,
                                }}
                              >
                              <div className="notification-icon" onClick={toggleNotifications}>
                                  <IoMdNotificationsOutline />
                                  {unreadCount > 0 && <span className="unread-count">{unreadCount}</span>}
                              </div>
            
                                {/* Dropdown แจ้งเตือน */}
                                {showNotifications && (
                                  <div className="notification-dropdown-admin" onClick={handleDropdownClick}>
                                      <h5 className="notification-title">การแจ้งเตือน</h5>
                                      {notifications.length > 0 ? (
                                          notifications.map((notification) => (
                                              <div
                                                  key={notification.notification_id}
                                                  className={`notification-item ${notification.read_status === "ยังไม่อ่าน" ? "unread" : ""}`}
                                                  onClick={() => markAsRead(notification.notification_id)}
                                              >
                                                  <p className="message">{notification.message}</p>
                                                  <p className="notification-date ">{new Date(notification.send_date).toLocaleString()}</p>
                                                  <button
                                                      className="delete-btn"
                                                      onClick={(e) => {
                                                          e.stopPropagation(); // ป้องกันการเรียก `markAsRead` เมื่อคลิกปุ่มลบ
                                                          deleteNotification(notification.notification_id);
                                                      }}
                                                  >
                                                      <FaTrash />
                                                  </button>
                                              </div>
                                          ))
                                      ) : (
                                          <p className="no-notifications text-center small">ไม่มีการแจ้งเตือน</p>
                                      )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <></>
                          )}
            <div className="card-body text-center" style={profileContainer}>
                <img
                    src={userInfo.profilePic}
                    alt="avatar"
                    className="rounded-circle img-fluid"
                    style={profilePicStyle}
                />
                <h5 className="my-3" style={{ fontSize: '18px', fontWeight: '500' }}>
                    ยินดีต้อนรับ {userInfo.fullName}
                </h5>
            </div>

            <div className="nav flex-column nav-pills" id="v-pills-tab" role="tablist" aria-orientation="vertical">
                <NavLink
                    to="/admin-home"
                    className="nav-link my-1"
                    style={({ isActive }) => ({
                        ...(isActive ? active : {}),
                        color: "#FFFFFF",
                    })}
                >
                    Dashboard
                </NavLink>

                <NavLink
                    to="/admin/calendar"
                    className="nav-link my-1"
                    style={({ isActive }) => ({
                        ...(isActive ? active : {}),
                        color: "#FFFFFF",
                    })}
                >
                    ปฏิทินกิจกรรม
                </NavLink>
                <NavLink
                    to="/admin/activities"
                    className="nav-link my-1"
                    style={({ isActive }) => ({
                        ...(isActive ? active : {}),
                        color: "#FFFFFF",
                    })}
                >
                    กิจกรรมและการเข้าร่วม
                </NavLink>
                <NavLink
                    to="/admin/donations"
                    className="nav-link my-1"
                    style={({ isActive }) => ({
                        ...(isActive ? active : {}),
                        color: "#FFFFFF",
                    })}
                >
                    การบริจาคและโครงการ                   
                </NavLink>
                <NavLink
                    to="/admin/webboard"
                    className="nav-link my-1"
                    style={({ isActive }) => ({
                        ...(isActive ? active : {}),
                        color: "#FFFFFF",
                    })}
                >
                    การจัดการเว็บบอร์ด
                </NavLink>
                <NavLink
                    to="/admin/news"
                    className="nav-link my-1"
                    style={({ isActive }) => ({
                        ...(isActive ? active : {}),
                        color: "#FFFFFF",
                    })}
                >
                    ข่าวสารและประชาสัมพันธ์
                </NavLink>
                <NavLink 
                    to="/admin/souvenir" 
                    className="nav-link my-1" 
                    style={({ isActive }) => ({
                        ...(isActive ? active : {}),
                        color: "#FFFFFF",
                    })}>
                        ของที่ระลึก
                </NavLink>
                <NavLink
                    to="/admin/admin-alumni"
                    className="nav-link my-1"
                    style={({ isActive }) => ({
                        ...(isActive ? active : {}),
                        color: "#FFFFFF",
                    })}
                >
                    ทำเนียบศิษย์เก่า
                </NavLink>
                <NavLink
                    to="/admin/users"
                    className="nav-link my-1"
                    style={({ isActive }) => ({
                        ...(isActive ? active : {}),
                        color: "#FFFFFF",
                    })}
                >
                    จัดการผู้ใช้
                </NavLink>
                <NavLink
                    onClick={handleLogout}
                    className="nav-link my-1"
                    style={({ isActive }) => ({
                        ...(isActive ? active : {}),
                        color: "#FFFFFF",
                    })}
                >
                    ออกจากระบบ
                </NavLink>
            </div>
        </div>
    );
}

const navAdminStyles = {
    width: "250px",
    backgroundColor: "#1A8DDD",
    color: "#FFFFFF",
    padding: "15px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    height: auto,
    position: "fixed",
};

const profileContainer = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px",
};

const profilePicStyle = {
    width: "120px",
    height: "120px",
    objectFit: "cover",
    borderRadius: "50%",
    border: "2px solid #fff",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    marginTop: "10px",
};

const active = {
    backgroundColor: "#0F75BC",
    color: "#FFFFFF",
    borderRadius: "8px",
    fontWeight: "600",
};

const navLinkStyles = {
    color: "#FFFFFF",
    padding: "10px 20px",
    textDecoration: "none",
    fontWeight: "500",
    margin: "6px 0",
    borderRadius: "8px",
    transition: "all 0.2s ease-in-out",
};

const navAdminButtonStyles = {
    marginTop: "auto",
     color: "#FFFFFF",
};


export default NavAdmin;
