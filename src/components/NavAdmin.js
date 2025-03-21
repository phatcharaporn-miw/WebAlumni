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
        const imagePath = localStorage.getItem('image_path');

        const profilePic = imagePath
            ? `http://localhost:3001/img/${imagePath}`
            : '/default-profile-pic.jpg';

        if (role === '1') {
            setUserInfo({
                fullName: username || 'Admin',
                profilePic: profilePic,
            });
        } else {
            navigate('/login'); // ถ้าไม่ใช่ admin ให้นำทางไปหน้า login
        }
    }, [navigate]);

    return (
        <div style={navAdminStyles}>
            <div className="card-body text-center">
                <img
                    src={userInfo.profilePic}  // แสดงผลรูปโปรไฟล์ที่ได้จาก userInfo
                    alt="avatar"
                    className="rounded-circle img-fluid"
                    style={{
                        width: "150px",
                        height: "150px",
                        objectFit: "cover",
                        borderRadius: "50%",
                        border: "1px solid #fff",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                        marginTop: "25px"
                    }}
                />
                <h5 className="my-3">สวัสดี! {userInfo.fullName}</h5>
            </div>

            <div className="nav flex-column nav-pills" id="v-pills-tab" role="tablist" aria-orientation="vertical">
                <NavLink
                    to="/admin/dashboard"
                    className="nav-link"
                    style={({ isActive }) => (isActive ? { ...active } : { color: "#FFFFFF" })}
                >
                    Dashboard
                </NavLink>

                <NavLink
                    to="/admin/calendar"
                    className="nav-link"
                    style={({ isActive }) => (isActive ? { ...active } : { color: "#FFFFFF" })}
                >
                    ปฏิทินกิจกรรม
                </NavLink>
                <NavLink
                    to="/admin/activities"
                    className="nav-link"
                    style={({ isActive }) => (isActive ? { ...active } : { color: "#FFFFFF" })}
                >
                    กิจกรรมและการเข้าร่วม
                </NavLink>
                <NavLink
                    to="/admin/donations"
                    className="nav-link"
                    style={({ isActive }) => (isActive ? { ...active } : { color: "#FFFFFF" })}
                >
                    การบริจาคและโครงการ
                </NavLink>
                <NavLink
                    to="/admin/forum"
                    className="nav-link"
                    style={({ isActive }) => (isActive ? { ...active } : { color: "#FFFFFF" })}
                >
                    การจัดการเว็บบอร์ด
                </NavLink>
                <NavLink
                    to="/admin/news"
                    className="nav-link"
                    style={({ isActive }) => (isActive ? { ...active } : { color: "#FFFFFF" })}
                >
                    ข่าวสารและประชาสัมพันธ์
                </NavLink>
                <NavLink
                    to="/admin/souvenir"
                    className="nav-link"
                    style={({ isActive }) => (isActive ? { ...active } : { color: "#FFFFFF" })}
                >
                    ของที่ระลึก
                </NavLink>
                <NavLink
                    to="/admin/users"
                    className="nav-link"
                    style={({ isActive }) => (isActive ? { ...active } : { color: "#FFFFFF" })}
                >
                    จัดการผู้ใช้
                </NavLink>
                <NavLink
                    to="/admin/settings"
                    className="nav-link"
                    style={({ isActive }) => (isActive ? { ...active } : { color: "#FFFFFF" })}
                >
                    การตั้งค่า
                </NavLink>
                <NavLink
                    onClick={handleLogout}
                    className="nav-link"
                    style={{ color: "#FFFFFF" }}
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
};

const active = {
    backgroundColor: "#0F75BC",
    color: "#FFFFFF",
};

export default NavAdmin;
