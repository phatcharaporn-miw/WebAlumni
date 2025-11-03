import { useState, useEffect, } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { IoMdNotificationsOutline } from "react-icons/io";
import { FaTrash } from 'react-icons/fa';
import { FaCamera } from "react-icons/fa";
import '../css/navAdmin.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuth } from '../context/AuthContext';
import { HOSTNAME } from '../config.js';

function NavAdmin() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, handleLogout, loading, initialized } = useAuth();

    // จัดการรูปโปรไฟล์
    const [previewImage, setPreviewImage] = useState(null); // สำหรับแสดงรูปภาพก่อนอัปโหลด
    const [profile, setProfile] = useState();

    const userId = user?.user_id;
    const role = user?.role;
    const username = user?.username;
    const profilePicture = user?.profilePicture;
    // รอ loading เสร็จก่อนตรวจสอบ authentication
    useEffect(() => {
        if (!initialized) return; // รอ AuthProvider initialize
        if (loading) return; // รอ fetch user profile เสร็จ

        if (!userId || !role) {
            console.log('No user or role, redirecting to login');
            navigate('/login');
            return;
        }

        console.log("User data:", user);
        console.log("Profile picture:", profilePicture);
    }, [initialized, loading, user, role, navigate]);

    // เปลี่ยนรูปโปรไฟล์
    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setPreviewImage(URL.createObjectURL(file));

        const formData = new FormData();
        formData.append("image_path", file);
        formData.append("user_id", userId);

        try {
            const res = await axios.post(
                HOSTNAME +"/users/update-profile-image",
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            if (res.status === 200) {
                Swal.fire("สำเร็จ!", "อัปโหลดรูปโปรไฟล์เรียบร้อยแล้ว", "success");

                // อัปเดตรูปโปรไฟล์ใหม่
                setPreviewImage(HOSTNAME + "/" + res.data.newImagePath);
            } else {
                Swal.fire("ผิดพลาด", res.data.message || "เกิดข้อผิดพลาด", "error");
            }
        } catch (err) {
            console.error(err);
            Swal.fire("ผิดพลาด", "ไม่สามารถอัปโหลดรูปได้", "error");
        }
    };


    const onLogout = async () => {
        const result = await Swal.fire({
            title: 'คุณแน่ใจหรือไม่?',
            text: 'คุณต้องการออกจากระบบหรือไม่?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'ใช่, ออกจากระบบ!',
            cancelButtonText: 'ยกเลิก',
        });

        if (result.isConfirmed) {
            handleLogout();
        }
    };

    useEffect(() => {
        if (!role) {
            navigate('/login');
            return;
        }
    }, [role, user, navigate]);

    // แจ้งเตือน
    useEffect(() => {
        if (!userId) return;
        const fetchNotifications = () => {
            axios.get(HOSTNAME + `/notice/notification/${userId}`)
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
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [userId]);

    const markAsRead = (notificationId) => {
        axios.put(HOSTNAME + `/notice/read/${notificationId}`)
            .then(() => {
                setNotifications((prevNotifications) =>
                    prevNotifications.map((n) =>
                        n.notification_id === notificationId
                            ? { ...n, read_status: "อ่านแล้ว" }
                            : n
                    )
                );
                setUnreadCount((prev) => Math.max(prev - 1, 0));
            })
            .catch((error) => console.error("เกิดข้อผิดพลาดในการเปลี่ยนสถานะ:", error));
    };

    const markAllAsRead = () => {
        const unreadNotifications = notifications.filter(n => n.status === "ยังไม่อ่าน");
        unreadNotifications.forEach(n => markAsRead(n.notification_id));
    };

    const deleteNotification = (notificationId) => {
        axios.delete(HOSTNAME + `/notice/notification/${notificationId}`)
            .then(() => {
                setNotifications(notifications.filter((n) => n.notification_id !== notificationId));
                setUnreadCount((prev) => Math.max(prev - 1, 0));
            })
            .catch((error) => console.error("เกิดข้อผิดพลาดในการลบแจ้งเตือน:", error));
    };

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
        if (!showNotifications && notifications.some(n => n.read_status === "ยังไม่อ่าน")) {
            markAllAsRead();
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showNotifications && !event.target.closest(".notification-dropdown") && !event.target.closest(".notification-icon")) {
                setShowNotifications(false);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [showNotifications]);

    const handleDropdownClick = (event) => {
        event.stopPropagation();
    };

    if (loading) {
        return (
            <div style={{
                ...navAdminStyles,
                position: "fixed",
                top: 0,
                bottom: 0,
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div className="text-center">
                    <div className="spinner-border text-light" role="status">
                        <span className="visually-hidden">กำลังโหลด...</span>
                    </div>
                    <p className="mt-2 text-light">กำลังโหลด...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <>
            <div
                style={{
                    ...navAdminStyles,
                    position: "fixed",
                    top: 0,
                    bottom: 0,
                    zIndex: 1000,
                    transition: "transform 0.3s ease-in-out",
                }}
                className="d-block"
            >
                {/* Notification Icon */}
                {userId && (
                    <div className="notification" style={{ position: "absolute", top: 20, right: 20, zIndex: 10 }}>
                        <div
                            className="notification-icon-admin"
                            onClick={e => {
                                e.stopPropagation();
                                toggleNotifications();
                            }}
                            style={{ cursor: "pointer" }}
                            tabIndex={0}
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
                                            className={`notification-item ${notification.read_status === "ยังไม่อ่าน" ? "unread" : ""}`}
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

                {/* Profile - ใช้ข้อมูลจาก user context โดยตรง */}
                {userId && (
                    <div className="text-center" style={{ padding: "12px"}}>
                        <div
                            className="position-relative d-inline-block"
                            style={{
                                width: "130px",
                                height: "130px",
                            }}
                        >
                            {/* Input file ซ่อน */}
                            <input
                                type="file"
                                accept="image/*"
                                id="profileUpload"
                                style={{ display: "none" }}
                                onChange={handleImageChange}
                            />

                            {/* รูปโปรไฟล์ */}
                            <img
                                src={
                                    previewImage ||
                                    profilePicture ||
                                    `${HOSTNAME}/uploads/default-profile.png`
                                }
                                alt="profile"
                                className="rounded-circle shadow-sm"
                                style={{
                                    width: "130px",
                                    height: "130px",
                                    objectFit: "cover",
                                    border: "3px solid #fff",
                                    cursor: "pointer",
                                }}
                                onClick={() => document.getElementById("profileUpload").click()}
                                onError={(e) => {
                                    e.target.src = `${HOSTNAME}/uploads/default-profile.png`;
                                }}
                            />

                            {/* ไอคอนกล้อง*/}
                            <div
                                onClick={() => document.getElementById("profileUpload").click()}
                                className="position-absolute bg-success text-white rounded-circle d-flex justify-content-center align-items-center shadow"
                                style={{
                                    bottom: "5px",
                                    right: "5px",
                                    width: "36px",
                                    height: "36px",
                                    border: "2px solid white",
                                    cursor: "pointer",
                                    transition: "transform 0.2s ease, background-color 0.2s",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "scale(1.1)";
                                    e.currentTarget.style.backgroundColor = "#0F75BC";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "scale(1)";
                                    e.currentTarget.style.backgroundColor = "#0F75BC";
                                }}
                            >
                                <FaCamera size={15} />
                            </div>
                        </div>

                        <h5 className="my-3" style={{ fontSize: "18px", fontWeight: "500" }}>
                            ยินดีต้อนรับ {username || "ผู้ดูแลระบบ"}
                        </h5>
                    </div>
                )}

                {/* Menu Items */}
                <div className="nav flex-column nav-pills">
                    {[
                        { to: "/admin-home", label: "แดชบอร์ด" },
                        { to: "/admin/verify", label: "ตรวจสอบสลิปการโอนเงิน" },
                        { to: "/admin/activities", label: "กิจกรรมและการเข้าร่วม" },
                        { to: "/admin/donations/donation-list", label: "การบริจาคและโครงการ" },
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
