import React, { useState, useEffect} from "react";
import { useNavigate } from 'react-router-dom';
import "../css/Header.css";
import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { SlMagnifier } from "react-icons/sl";
import { SlArrowDown } from "react-icons/sl";
import { SlBasket } from "react-icons/sl";
import {  NavLink } from "react-router-dom";
import { IoMdNotificationsOutline } from "react-icons/io";
import { FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";

function Header({user}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0); // สถานะเก็บจำนวนแจ้งเตือนที่ยังไม่ได้อ่าน
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const userId = localStorage.getItem('userId');
  const [menuOpen, setMenuOpen] = useState(false);
  // const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();


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

  // เพิ่มสินค้าลงในตะกร้า
const addToCart = (productId, quantity, total) => {
  const userId = localStorage.getItem('userId'); 
  
  if (!userId) {
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

  axios.post("http://localhost:3001/souvenir/cart/add", { 
    user_id: userId,
    product_id: productId,
    quantity: quantity,
    total: total
  })
  .then((response) => {
    alert(response.data.message);
    getCartCount(userId); // เรียกอัปเดตจำนวนสินค้าในตะกร้าทันที
  })
  .catch((error) => {
    console.error("เกิดข้อผิดพลาดในการเพิ่มสินค้าลงในตะกร้า:", error);
  });
};

  // ดึงข้อมูลสินค้าในตะกร้า
  const getCartCount = (userId) => {
    if (!userId) return;

    axios.get(`http://localhost:3001/souvenir/cart/count?user_id=${userId}`, {
      headers: { "Cache-Control": "no-cache" }
    })
    .then(response => {
      setCartCount(response.data.cartCount || 0);
    })
    .catch(error => console.error("Error fetching cart count:", error));
  };

  // ดึงข้อมูลจำนวนสินค้าตะกร้าเมื่อโหลดหน้า
  useEffect(() => {
    const userId = localStorage.getItem('userId'); // ดึง userId อีกครั้ง กันค่า null
    if (userId) {
      getCartCount(userId);
    }
  }, []);


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
  
  const handleSuggestionClick = (suggestion) => {
      let path = "/";
      if (suggestion.type === "news") {
          path = `/news/${suggestion.id}`;
      } else if (suggestion.type === "webboard") {
          path = `/webboard/${suggestion.id}`;
      } else if (suggestion.type === "activity") {
          path = `/activity/${suggestion.id}`;
      } else if (suggestion.type === "donationproject") {
          path = `/donate/donatedetail/${suggestion.id}`;
      } else if (suggestion.type === "products") {
          path = `/souvenir/souvenirDetail/${suggestion.id}`;
      }
      
      navigate(path);
      setShowSuggestions(false);
  };

   const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

//   return (
//     <header className="header bg-light">
//   <div className="container-fluid">
//     <nav className="navbar navbar-expand-lg">
//       {/* โลโก้ */}
//       <NavLink className="navbar-brand" to="/">
//         <img src="/image/logoCP1.png" alt="College Logo" className="logo" />
//       </NavLink>

//       {/* Hamburger ปรากฏเมื่อจอเล็ก */}
//       <button
//         className="navbar-toggler"
//         type="button"
//         data-bs-toggle="collapse"
//         data-bs-target="#navbarContent"
//         aria-controls="navbarContent"
//         aria-expanded="false"
//         aria-label="Toggle navigation"
//       >
//         <span className="navbar-toggler-icon"></span>
//       </button>

//       {/* เมนูหลัก */}
//       <div className="collapse navbar-collapse" id="navbarContent">
//         <ul className="navbar-nav me-auto mb-2 mb-lg-0">
//           <li className="nav-item">
//             <NavLink to="/" className="nav-link">หน้าหลัก</NavLink>
//           </li>
//           <li className="nav-item">
//             <NavLink to="/about" className="nav-link">เกี่ยวกับ</NavLink>
//           </li>
//           <li className="nav-item dropdown">
//             <div className="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown">
//               ประชาสัมพันธ์
//             </div>
//             <ul className="dropdown-menu">
//               <li><NavLink to="/news" className="dropdown-item">ข่าว</NavLink></li>
//               <li><NavLink to="/activity" className="dropdown-item">กิจกรรม</NavLink></li>
//             </ul>
//           </li>
//           <li className="nav-item"><NavLink to="/donate" className="nav-link">บริจาค</NavLink></li>
//           <li className="nav-item"><NavLink to="/alumni" className="nav-link">ทำเนียบศิษย์เก่า</NavLink></li>
//           <li className="nav-item"><NavLink to="/souvenir" className="nav-link">ของที่ระลึก</NavLink></li>
//           <li className="nav-item"><NavLink to="/webboard" className="nav-link">เว็บบอร์ด</NavLink></li>
//         </ul>

//         {/* ส่วนขวา: Search, cart, notification, user */}
//         <div className="d-flex align-items-center">
//           {/* ช่องค้นหา */}
//           <div className="me-3">
//             <input
//               type="text"
//               value={searchTerm}
//               onChange={handleSearchChange}
//               className="form-control"
//               placeholder="ค้นหา..."
//             />
//           </div>

//           {/* ถ้ามี suggestions ให้แสดง */}
//           {showSuggestions && suggestions.length > 0 && (
//             <div className="suggestions-dropdown">{/* ... */}</div>
//           )}

//           {/* ตะกร้า */}
//           <NavLink to="/souvenir/souvenir_basket" className="position-relative me-3">
//             <SlBasket className="cart-icon" />
//             {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
//           </NavLink>

//           {/* แจ้งเตือน + โปรไฟล์ */}
//           {user ? (
//             <div className="d-flex align-items-center">
//               {/* แจ้งเตือน */}
//               <div className="notification-icon me-3" onClick={toggleNotifications}>
//                 <IoMdNotificationsOutline />
//                 {unreadCount > 0 && <span className="unread-count">{unreadCount}</span>}
//               </div>

//               {/* โปรไฟล์ */}
//               <NavLink to={user.role === 2 ? "/president-profile" : "/alumni-profile"}>
//                 <img
//                   src={user.profilePicture || "/profile-picture.png"}
//                   alt="Profile"
//                   className="profile-img"
//                   style={{ cursor: "pointer" }}
//                 />
//               </NavLink>
//             </div>
//           ) : (
//             <NavLink to="/login">
//               <button className="btn btn-primary">เข้าสู่ระบบ</button>
//             </NavLink>
//           )}
//         </div>
//       </div>
//     </nav>
//   </div>
// </header>
//   );
  return (
        <header className="header">
          <div className="header-top">
            {/* โลโก้ */}
            <NavLink className="navbar-brand" to="/">
              <img className="logo" src="/image/logoCP1.png" alt="College of Computing Logo" />
            </NavLink>

            {/* ปุ่ม Hamburger สำหรับมือถือ */}
            {/* <button className="hamburger-btn" onClick={toggleMenu} aria-label="Toggle menu">
              <div className={`bar ${menuOpen ? "open" : ""}`}></div>
              <div className={`bar ${menuOpen ? "open" : ""}`}></div>
              <div className={`bar ${menuOpen ? "open" : ""}`}></div>
            </button> */}

            {/* ช่องค้นหาและปุ่มเข้าสู่ระบบ */}
            <div className={`search-and-login ${menuOpen ? "open" : ""}`}>
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

              {/* แสดงคำแนะนำ */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="suggestions-dropdown">
                        {suggestions.map((suggestion, index) => (
                            <div
                                key={index}
                                className="suggestion-item"
                                onClick={() => handleSuggestionClick(suggestion)}
                            >
                                {suggestion.type === "news" && (
                                    <p className="suggestion-text">ข่าว: {suggestion.title}</p>
                                )}
                                {suggestion.type === "webboard" && (
                                    <p className="suggestion-text">กระทู้: {suggestion.title}</p>
                                )}
                                {suggestion.type === "activity" && (
                                    <p className="suggestion-text">กิจกรรม: {suggestion.title}</p>
                                )}
                                {suggestion.type === "donationproject" && (
                                    <p className="suggestion-text">บริจาค: {suggestion.title}</p>
                                )}
                                {suggestion.type === "products" && (
                                    <p className="suggestion-text">ของที่ระลึก: {suggestion.title}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                
                  <div className="cart-container me-4 mx-4">
                      <NavLink to="/souvenir/souvenir_basket">
                        <SlBasket className="cart-icon" />
                        {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
                      </NavLink>
                  </div>  

              {/*หากผู้ใช้เข้าสู่ระบบแล้วจะแสดงโปรไฟล์และแจ้งเตือน*/}
              {user ? (
                <div className="user-profile">
                  {/* ไอคอนแจ้งเตือน */}
                  <div className="notification-container me-4">
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
                              <p className="no-notifications text-center small">ไม่มีการแจ้งเตือน</p>
                          )}
                      </div>
                    )}
                  </div>
                
                  {/* รูปโปรไฟล์ */}
                    <NavLink
                      to={
                        user.role === 2
                          ? "/president-profile"
                          : user.role === 4
                          ? "/student-profile"
                          : "/alumni-profile"
                      }
                      className="profile-container"
                    >
                    <img
                      src={`${user.profilePicture}` || "/profile-picture.png"}
                      alt="User Profile"
                      className="profile-img"
                      style={{ cursor: "pointer" }}
                    />
                    {/* ข้อมูลผู้ใช้ */}
                    <div className="user-info mt-2 text-center">
                    <p className="user-role mb-1" style={{ textDecoration: "none" }}>
                      {user.role === 1 ? "แอดมิน" : 
                      user.role === 2 ? "นายกสมาคม" : 
                      user.role === 3 ? "ศิษย์เก่า" : 
                      user.role === 4 ? "ศิษย์ปัจจุบัน" : "ไม่ทราบบทบาท"}
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
                {/* <SlArrowDown className="arrow-down"/> */}
                
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
