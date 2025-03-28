import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';

function NavAdmin() {
    const [userInfo, setUserInfo] = useState({
        fullName: 'User',
        profilePic: '/default-profile-pic.jpg',
    });
    const navigate = useNavigate();

    const handleLogout = async () => {
        const isConfirmed = window.confirm('คุณแน่ใจว่าจะออกจากระบบ?');

        if (isConfirmed) {
            try {
                await axios.get('http://localhost:3001/login/logout', { withCredentials: true });

                // ลบข้อมูลใน localStorage
                localStorage.removeItem('userId');
                localStorage.removeItem('userRole');
                localStorage.removeItem('username');
                localStorage.removeItem('image_path');

                navigate('/login');
            } catch (error) {
                console.error('Logout Error:', error);
            }
        }
    };

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        const role = localStorage.getItem('userRole');
        const username = localStorage.getItem('username');
        const imagePath = localStorage.getItem('image_path');  // ดึงค่าจาก localStorage

        const profilePic = imagePath
            ? `http://localhost:3001/img/${imagePath}` // เชื่อมต่อ URL ของรูปภาพ
            : '/default-profile-pic.jpg'; // ถ้าไม่มีให้ใช้รูป default

        if (role === '1') {
            setUserInfo({
                fullName: username || 'Admin',
                profilePic: profilePic,
            });
        } else {
            navigate('/login'); // ถ้าไม่ใช่ Admin ให้กลับไปที่หน้า login
        }
    }, [navigate]);

    return (
        <div style={navAdminStyles}>
            <div className="card-body text-center" style={profileContainer}>
                <img
                    src={userInfo.profilePic}
                    alt="avatar"
                    className="rounded-circle img-fluid"
                    style={profilePicStyle}
                />
                <h5 className="my-3" style={{ fontSize: '18px', fontWeight: '500' }}>
                    สวัสดี! {userInfo.fullName}
                </h5>
            </div>

            <div className="nav flex-column nav-pills" id="v-pills-tab" role="tablist" aria-orientation="vertical">
                <NavLink
                    to="/admin-home"
                    className="nav-link"
                    style={({ isActive }) => ({
                        ...(isActive ? active : {}),
                        color: "#FFFFFF",
                    })}
                >
                    Dashboard
                </NavLink>

                <NavLink
                    to="/admin/calendar"
                    className="nav-link"
                    style={({ isActive }) => ({
                        ...(isActive ? active : {}),
                        color: "#FFFFFF",
                    })}
                >
                    ปฏิทินกิจกรรม
                </NavLink>
                <NavLink
                    to="/admin/activities"
                    className="nav-link"
                    style={({ isActive }) => ({
                        ...(isActive ? active : {}),
                        color: "#FFFFFF",
                    })}
                >
                    กิจกรรมและการเข้าร่วม
                </NavLink>
                <NavLink
                    to="/admin/donations"
                    className="nav-link"
                    style={({ isActive }) => ({
                        ...(isActive ? active : {}),
                        color: "#FFFFFF",
                    })}
                >
                    การบริจาคและโครงการ
                </NavLink>
                <NavLink
                    to="/admin/forum"
                    className="nav-link"
                    style={({ isActive }) => ({
                        ...(isActive ? active : {}),
                        color: "#FFFFFF",
                    })}
                >
                    การจัดการเว็บบอร์ด
                </NavLink>
                <NavLink
                    to="/admin/news"
                    className="nav-link"
                    style={({ isActive }) => ({
                        ...(isActive ? active : {}),
                        color: "#FFFFFF",
                    })}
                >
                    ข่าวสารและประชาสัมพันธ์
                </NavLink>
                <NavLink
                    to="/admin/souvenir"
                    className="nav-link"
                    style={({ isActive }) => ({
                        ...(isActive ? active : {}),
                        color: "#FFFFFF",
                    })}
                >
                    ของที่ระลึก
                </NavLink>
                <NavLink
                    to="/admin/users"
                    className="nav-link"
                    style={({ isActive }) => ({
                        ...(isActive ? active : {}),
                        color: "#FFFFFF",
                    })}
                >
                    จัดการผู้ใช้
                </NavLink>
                <NavLink
                    to="/admin/settings"
                    className="nav-link"
                    style={({ isActive }) => ({
                        ...(isActive ? active : {}),
                        color: "#FFFFFF",
                    })}
                >
                    การตั้งค่า
                </NavLink>
                <NavLink
                    onClick={handleLogout}
                    className="nav-link"
                    style={navAdminButtonStyles}
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
};

const profileContainer = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px"
};

const profilePicStyle = {
    width: "120px",
    height: "120px",
    objectFit: "cover",
    borderRadius: "50%",
    border: "2px solid #fff",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    marginTop: "10px"
};

// สไตล์สำหรับการ hover และ active
const active = {
    backgroundColor: "#0F75BC",
    color: "#FFFFFF",
    borderRadius: "5px",
    fontWeight: "500",
};

const navAdminButtonStyles = {
    color: "#FFFFFF", 
    backgroundColor: "#FF3B30", 
};

const navLinkStyles = {
    color: "#FFFFFF",
    padding: "10px 20px",
    textDecoration: "none",
    fontWeight: "500",
    transition: "background-color 0.3s ease, color 0.3s ease",
};

const navLinkHover = {
    backgroundColor: "#D32F2F",
    color: "#FFFFFF",
};

export default NavAdmin;
