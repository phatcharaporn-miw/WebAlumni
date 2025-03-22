import React, { useState, useEffect, useRef } from "react";
import "../css/Header.css";
import 'bootstrap/dist/css/bootstrap.min.css'; 
import { SlMagnifier } from "react-icons/sl";
import { SlArrowDown } from "react-icons/sl";
import {  NavLink } from "react-router-dom";
import { IoMdNotificationsOutline } from "react-icons/io";
import { FaTrash } from "react-icons/fa";
import axios from "axios";


function Header({user}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0); // สถานะเก็บจำนวนแจ้งเตือนที่ยังไม่ได้อ่าน

  // ดึงแจ้งเตือนเมื่อผู้ใช้เข้าสู่ระบบ
  useEffect(() => {
    if (!user?.userId) return;

    const fetchNotifications = () => {
        axios.get(`http://localhost:3001/notice/notification/${user.userId}`)
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
  }, [user?.userId]);


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

  // แจ้งเตือนเมื่อมีการกดใจกระทู้
  const handleLikePost = (postId) => {
    console.log("🛠 กดไลก์โพสต์", postId);

    axios.post(`http://localhost:3001/webboard/${postId}/favorite`, {})
        .then((response) => {
            console.log("Response from Backend:", response.data);
        })
        .catch((error) => {
            console.error("Error from Backend:", error.response?.data || error.message);
        });
  };

  // แจ้งเตือนเมื่อมีการแสดงความคิดเห็น
  const handleCommentPost = (postId, comment) => {
    axios.post(`http://localhost:3001/webboard/${postId}/comment`, {
        comment_detail: comment
    })
    .then((response) => {
        console.log("Response from Backend:", response.data);
    })
    .catch((error) => {
        console.error("Error commenting on post:", error.response?.data || error.message);
    });
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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchClick = () => {
    console.log("Search Term:", searchTerm);
  };


  return (
    <header className="header">
      <div className="header-top">
        {/* โลโก้ */}
        <img className="logo" src="/image/logoCP1.png" alt="College of Computing Logo" />

        {/* ช่องค้นหาและปุ่มเข้าสู่ระบบ */}
        <div className="search-and-login">
          <div className="search">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              className="form-control"
            />
            <button onClick={handleSearchClick} className="search-icon-btn">
              <SlMagnifier className="search-icon" />
            </button>
          </div>

          {/* หากผู้ใช้เข้าสู่ระบบแล้วจะแสดงโปรไฟล์และแจ้งเตือน */}
          {user ? (
            <div className="user-profile">
              {/* ไอคอนแจ้งเตือน */}
              <div className="notification-container">
              <div className="notification-icon" onClick={toggleNotifications}>
                  <IoMdNotificationsOutline />
                  {unreadCount > 0 && <span className="unread-count">{unreadCount}</span>}
              </div>

                {/* Dropdown แจ้งเตือน */}
                {showNotifications && (
                  <div className="notification-dropdown" onClick={handleDropdownClick}>
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
                          <p className="no-notifications">ไม่มีการแจ้งเตือน</p>
                      )}
                  </div>
                )}
              </div>
            
                {/* <div className="user-profile"> */}
              {/* รูปโปรไฟล์ */}
              <NavLink to="/alumni-profile" className="profile-container">
                <img
                  src={`${user.profilePicture}` || "/profile-picture.png"}
                  alt="User Profile"
                  className="profile-img"
                  style={{ cursor: "pointer" }}
                />
              </NavLink>

              {/* ข้อมูลผู้ใช้ */}
              <div className="user-info mt-2 text-center">
                <p className="user-role mb-1">{user.role === 0 ? "แอดมิน" : "ศิษย์เก่า"}</p>
                <p className="user-major text-muted small">{user.major || "ไม่ระบุสาขา"}</p>
              </div>
            </div>
          ) : (
            <NavLink to="/login">
              <button className="login-btn m-2 ms-5">เข้าสู่ระบบ</button>
            </NavLink>
          )}
        </div>
      </div>

      <nav>
        <ul className="nav">
          <li className="nav-item">
            <NavLink 
              to="/" 
              className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}
            >
              หน้าหลัก
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink 
              to="/about" 
              className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}
            >
              เกี่ยวกับ
            </NavLink>
          </li>          
          <li className="dropdown">
            <div className="dropbtn">ประชาสัมพันธ์</div>
            <SlArrowDown className="arrow-down"/>
            <div className="dropdown-content">
              <NavLink 
                to="/news" 
                className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}
              >
                ประชาสัมพันธ์
              </NavLink>
              <NavLink 
                to="/activity" 
                className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}
              >
                กิจกรรม
              </NavLink>
            </div>
          </li>
          <li className="nav-item">
            <NavLink 
              to="/donate" 
              className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}
            >
              บริจาค
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink 
              to="/alumni" 
              className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}
            >
              ทำเนียบศิษย์เก่า
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink 
              to="/souvenir" 
              className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}
            >
              ของที่ระลึก
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink 
              to="/webboard" 
              className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}
            >
              เว็บบอร์ด
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>

    
  );
}

export default Header;
