import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "../css/Header.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { SlMagnifier } from "react-icons/sl";
import { SlArrowDown } from "react-icons/sl";
import { SlBasket } from "react-icons/sl";
import { NavLink } from "react-router-dom";
import { IoMdNotificationsOutline } from "react-icons/io";
import { FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

function Header({ user, handleLogout }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0); // สถานะเก็บจำนวนแจ้งเตือนที่ยังไม่ได้อ่าน
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { cartCount, getCartCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const userId = localStorage.getItem('userId');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { addToCart, clearCart, refreshCartCount } = useCart();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('userId');
    setIsLoggedIn(!!user);
  }, []);

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

  // ตรวจสอบและโหลดจำนวนตะกร้าเมื่อ component mount หรือเมื่อ user login
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      getCartCount(userId);
    }
  }, []); // เรียกครั้งเดียวเมื่อ component mount
  
  // ฟังก์ชันเพิ่มสินค้าลงตะกร้าสำหรับใช้ในส่วนอื่นๆ ของ Header (ถ้ามี)
  const handleAddToCartFromHeader = async (productId, quantity, total) => {
    // ตรวจสอบจาก user prop แทน localStorage
    if (!user) {
      Swal.fire({
        title: "กรุณาเข้าสู่ระบบ",
        text: "คุณต้องเข้าสู่ระบบก่อนเพิ่มสินค้า",
        icon: "warning",
        confirmButtonText: "เข้าสู่ระบบ"
      }).then(() => {
        navigate("/login");
      });
      return;
    }

    try {
      await addToCart(productId, quantity, total);

      Swal.fire({
        title: "เพิ่มลงตะกร้าสำเร็จ",
        text: "เพิ่มสินค้าลงตะกร้าแล้ว",
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการเพิ่มสินค้าลงในตะกร้า:", error);

      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: error.message || "ไม่สามารถเพิ่มสินค้าลงตะกร้าได้ กรุณาลองใหม่อีกครั้ง",
        icon: "error",
        confirmButtonText: "ตกลง"
      });
    }
  };

  // ฟังก์ชัน logout ที่จัดการตะกร้าด้วย
  const handleLogoutAndClearCart = async () => {
    try {
      // เรียก logout function (CartContext จะล้างตะกร้าอัตโนมัติเมื่อ user เป็น null)
      await handleLogout();
    } catch (error) {
      console.error("เกิดข้อผิดพลาดขณะออกจากระบบ:", error);
      // ถ้าเกิดปัญหาให้ล้างตะกร้าด้วย
      clearCart();
    }
  };

  // Refresh cart count เมื่อ user เปลี่ยน (เผื่อกรณี login ใหม่)
  useEffect(() => {
    if (user) {
      refreshCartCount();
    }
  }, [user, refreshCartCount]);


  // การค้นหา
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === "") {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // เรียก API เพื่อดึงคำแนะนำ
    axios.get(`http://localhost:3001/search/search-all?search=${value}`)
      .then((response) => {
        if (response.data.success) {
          setSuggestions(response.data.data);
          setShowSuggestions(true);
        }
      })
      .catch((error) => {
        console.error("เกิดข้อผิดพลาดในการดึงการค้นหา:", error.message);
      });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".search-and-login")) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // ฟังก์ชันค้นหาเมื่อกดปุ่มค้นหา
  const handleSearchClick = () => {
    if (searchTerm.trim() === "") {
      Swal.fire({
        title: "ข้อผิดพลาด",
        text: "กรุณากรอกคำค้นหา",
        icon: "warning",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    // ตรวจสอบว่ามีผลการค้นหาหรือไม่
    axios.get(`http://localhost:3001/search/search-all?search=${searchTerm}`)
      .then((response) => {
        if (response.data.success && response.data.data.length > 0) {
          navigate(`/search?query=${searchTerm}`); // มีผลการค้นหา
        } else {
          Swal.fire({
            title: "ไม่พบผลการค้นหาที่คุณต้องการ",
            text: "กรุณาลองค้นหาด้วยคำอื่น",
            icon: "warning",
            confirmButtonText: "ตกลง",
          });
        }
      })
      .catch((error) => {
        console.error("เกิดข้อผิดพลาดในการค้นหา:", error.message);
        Swal.fire({
          title: "ข้อผิดพลาด",
          text: "ไม่สามารถค้นหาได้ในขณะนี้",
          icon: "error",
          confirmButtonText: "ตกลง",
        });
      });
  };

  // สร้าง mapping ไว้ที่เดียว
  const typeConfig = {
    news: { path: (id) => `/news/${id}`, label: "ข่าว" },
    webboard: { path: (id) => `/webboard/${id}`, label: "กระทู้" },
    activity: { path: (id) => `/activity/${id}`, label: "กิจกรรม" },
    donationproject: { path: (id) => `/donate/donatedetail/${id}`, label: "บริจาค" },
    products: { path: (id) => `/souvenir/souvenirDetail/${id}`, label: "ของที่ระลึก" },
    profiles: { path: (suggestion) => `/alumni/${suggestion.user_id}`, label: "บุคคล" },
    educations: { path: (suggestion) => `/alumni/${suggestion.user_id}`, label: "ข้อมูลการศึกษา" }
  };

  const handleSuggestionClick = (suggestion) => {
  const config = typeConfig[suggestion.type];
  let path = "/";
  if (config) {
    path = config.path(suggestion);
  } else {
    path = `/search?query=${encodeURIComponent(suggestion.title)}`;
  }
  navigate(path);
  setShowSuggestions(false);
};


  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // const goToNotificationDetail = (notification) => {
  //   markAsRead(notification.notification_id);

  //   switch (notification.type) {
  //     case 'like':
  //     case 'comment':
  //       navigate(`/webboard/post/${notification.related_id}`);
  //       break;
  //     case 'approve':
  //       navigate(`/souvenir/souvenirDetail/${notification.related_id}`);
  //       break;
  //     case 'souvenir_request':
  //       navigate(`/president-profile/president-approve`);
  //       break;
  //     case 'project':
  //       navigate(`/projects/projectDetail/${notification.related_id}`);
  //       break;
  //     default:
  //       Swal.fire('ไม่สามารถเปิดหน้าที่เกี่ยวข้องได้', '', 'warning');
  //   }
  // };
  
  return (
    <header className="header">
      <div className="header-top">
        {/* โลโก้ */}
        <NavLink className="navbar-brand" to="/">
          <img className="logo" src="/image/logoCP1.png" alt="College of Computing Logo" />
        </NavLink>

        <div className={`search-and-login ${menuOpen ? "open" : ""}`}>
          {/* ค้นหา */}
          <div className="search">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              className="form-control"
              placeholder="ค้นหา..."
            />
            <button onClick={handleSearchClick} className="search-icon-btn">
              <SlMagnifier className="search-icon" />
            </button>
          </div>

          {/* Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-dropdown">
              {suggestions.map((suggestion, index) => {
                const config = typeConfig[suggestion.type];
                const label = config ? config.label : "อื่นๆ";
                return (
                  <div
                    key={index}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <p className="suggestion-text">
                      {`${label}: ${suggestion.title}`}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* ตะกร้า */}
          <div className="cart-container me-4 mx-4">
            <NavLink to="/souvenir/souvenir_basket">
              <SlBasket className="cart-icon" />
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </NavLink>
          </div>

          {/* ผู้ใช้ - เปลี่ยนจาก user เป็น isLoggedIn && user เพื่อความชัดเจน */}
          {isLoggedIn && user ? (
            <div className="user-profile">
              {/* แจ้งเตือน */}
              <div className="notification-container me-4">
                <div className="notification-icon" onClick={toggleNotifications}>
                  <IoMdNotificationsOutline />
                  {unreadCount > 0 && <span className="unread-count">{unreadCount}</span>}
                </div>

                {showNotifications && (
                  <div className="notification-dropdown" onClick={handleDropdownClick}>
                    <h5 className="notification-title">การแจ้งเตือน</h5>
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.notification_id}
                          className={`notification-item ${notification.status === "ยังไม่อ่าน" ? "unread" : ""}`}
                        >
                          <p className="message">{notification.message}</p>
                          <p className="notification-date">
                            {new Date(notification.send_date).toLocaleString()}
                          </p>
                          <button
                            className="delete-btn"
                            onClick={(e) => {
                              e.stopPropagation();
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

              {/* รูปโปรไฟล์ - เพิ่มการจัดการ error ของรูป */}
              <NavLink
                to={
                  user.role === 1 
                    ? "/admin-profile"
                    : user.role === 2
                    ? "/president-profile"
                    : user.role === 4
                      ? "/student-profile"
                      : "/alumni-profile"
                }
                className="profile-container"
              >
                <img
                  src={user.profilePicture || "/default-profile.png"}
                  alt="User Profile"
                  className="profile-img"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = "/default-profile.png"; // fallback image
                  }}
                />

                <div className="user-info mt-2 text-center">
                  <p className="user-role mb-1">
                    {user.role === 1
                      ? "แอดมิน"
                      : user.role === 2
                        ? "นายกสมาคม"
                        : user.role === 3
                          ? "ศิษย์เก่า"
                          : user.role === 4
                            ? "ศิษย์ปัจจุบัน"
                            : "ไม่ทราบบทบาท"}
                  </p>
                </div>
              </NavLink>
            </div>
          ) : (
            <NavLink to="/login">
              <button className="login-btn m-2 ms-5">เข้าสู่ระบบ</button>
            </NavLink>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className={`nav-menu ${menuOpen ? "open" : ""}`}>
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
            <div className="dropbtn">ประชาสัมพันธ์ <SlArrowDown className="arrow-down" /></div>
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
          <li className="nav-item">
            {!isLoggedIn && (
              <NavLink
                to="/check-studentId"
                className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}
              >
                ตรวจสอบข้อมูล
              </NavLink>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
};


export default Header;
