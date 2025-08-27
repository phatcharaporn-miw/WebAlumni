import { useState, useEffect, } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { IoMdNotificationsOutline } from "react-icons/io";
import { FaTrash } from 'react-icons/fa';
import '../css/navAdmin.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuth } from '../context/AuthContext';

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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // const toggleMobileMenu = () => {
    //     setIsMobileMenuOpen(!isMobileMenuOpen);
    // };

    const { user, handleLogout, isAdmin, isUser, isLoggedIn } = useAuth();

    const onLogout = async () => {
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
                const success = await handleLogout();
                if (success) {
                    Swal.fire('ออกจากระบบสำเร็จ!', 'คุณได้ออกจากระบบเรียบร้อยแล้ว', 'success');
                    navigate('/');
                } else {
                    Swal.fire('เกิดข้อผิดพลาด!', 'ไม่สามารถออกจากระบบได้', 'error');
                }
            }
        });
    };

    useEffect(() => {
        const role = localStorage.getItem('userRole');
        const username = localStorage.getItem('username');
        const imagePath = localStorage.getItem('image_path');

        if (!role) {
            // ถ้าไม่มี role ให้บังคับไป login เลย
            navigate('/login');
            return;
        }

        const profilePic = imagePath
            ? `http://localhost:3001/${imagePath.replace(/^\/+/, '')}`
            : 'http://localhost:3001/uploads/default-profile.png';

        if (role === '1') {
            setUserInfo({
                fullName: username || 'Admin',
                profilePic: profilePic,
            });
        } else {
            navigate('/login');
        }
    }, [navigate]);


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

    const markAllAsRead = () => {
        const unreadNotifications = notifications.filter(n => n.status === "ยังไม่อ่าน");
        unreadNotifications.forEach(n => markAsRead(n.notification_id));
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
        if (!showNotifications && notifications.some(n => n.read_status === "ยังไม่อ่าน")) {
            markAllAsRead();
        }
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
        <>
            <div
                style={{
                    ...navAdminStyles,
                    position: "fixed",
                    top: 0,
                    bottom: 0,
                    zIndex: 1000,
                    // transform: isMobileMenuOpen || window.innerWidth >= 768 ? "translateX(0)" : "translateX(-100%)",
                    transition: "transform 0.3s ease-in-out",
                }}
                className="d-block"
            >
                {/* Notification Icon */}
                {userInfo && (
                    <div className="notification" style={{ position: "absolute", top: 20, right: 20, zIndex: 10 }}>
                        <div
                            className="notification-icon-admin"
                            onClick={e => {
                                e.stopPropagation();
                                toggleNotifications();
                            }}
                            style={{ cursor: "pointer" }}
                            tabIndex={0} // ให้สามารถกดด้วยคีย์บอร์ดได้
                            role="button"
                            aria-label="เปิดการแจ้งเตือน"
                            onKeyDown={e => {
                                if (e.key === "Enter" || e.key === " ") toggleNotifications();
                            }}
                        >
                            <IoMdNotificationsOutline />
                            {unreadCount > 0 && <span className="unread-count">{unreadCount}</span>}
                        </div>

                        {showNotifications && (
                            <div className="notification-dropdown-admin" onClick={handleDropdownClick}>
                                <h5 className="notification-title">การแจ้งเตือน</h5>
                                {notifications.length > 0 ? (
                                    notifications.map((notification) => (
                                        <div
                                            key={notification.notification_id}
                                            className={`notification-item ${notification.read_status === "ยังไม่อ่าน" ? "unread" : ""
                                                }`}
                                        // onClick={() => goToNotificationDetail(notification)}
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
                )}

                {/* Profile */}
                {userInfo && (
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
                )}

                {/* Menu Items */}
                <div className="nav flex-column nav-pills">
                    {[
                        { to: "/admin-home", label: "แดชบอร์ด" },
                        { to: "/admin/verify", label: "ตรวจสอบสลิปการโอนเงิน" },
                        { to: "/admin/activities", label: "กิจกรรมและการเข้าร่วม" },
                        { to: "/admin/donations", label: "การบริจาคและโครงการ" },
                        { to: "/admin/webboard", label: "การจัดการเว็บบอร์ด" },
                        { to: "/admin/news", label: "ข่าวสารและประชาสัมพันธ์" },
                        { to: "/admin/souvenir", label: "ของที่ระลึก" },
                        { to: "/admin/admin-alumni", label: "ทำเนียบศิษย์เก่า" },
                        { to: "/admin/users", label: "จัดการผู้ใช้" },
                    ].map(({ to, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className="nav-link my-1"
                            onClick={() => setIsMobileMenuOpen(false)}
                            style={({ isActive }) => ({
                                ...(isActive ? active : {}),
                                color: "#FFFFFF",
                            })}
                        >
                            {label}
                        </NavLink>
                    ))}

                    <button
                        onClick={onLogout}
                        className="nav-link my-1 btn btn-link"
                        style={{
                            ...navLinkStyles,
                            ...navAdminButtonStyles,
                            textAlign: "left",
                            textDecoration: "none",
                        }}
                    >
                        ออกจากระบบ
                    </button>
                </div>
            </div>
        </>
    );
}

const navAdminStyles = {
    width: "250px",
    backgroundColor: "#1A8DDD",
    color: "#FFFFFF",
    padding: "15px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
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
    color: "#FFFFFF",
    padding: "10px 20px",
    textDecoration: "none",
    fontWeight: "500",
    margin: "6px 0",
    borderRadius: "8px",
    transition: "all 0.2s ease-in-out",
};


export default NavAdmin;
