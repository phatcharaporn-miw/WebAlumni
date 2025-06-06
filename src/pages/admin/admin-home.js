import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useNavigate } from "react-router-dom";
import "../../css/adminActivity.css";

// ไอคอน
import { FaUsers, FaCalendarAlt, FaClock, FaCheckCircle, FaPauseCircle, FaHourglassHalf } from "react-icons/fa";

function AdminActivity() {
    const navigate = useNavigate();

    const activityStats = [
        { icon: <FaCalendarAlt size={40} color="#0F75BC" />, title: "กิจกรรมทั้งหมด", quantity: 12, unit: "กิจกรรม" },
        { icon: <FaUsers size={40} color="#0F75BC" />, title: "ผู้เข้าร่วมทั้งหมด", quantity: 120, unit: "คน" },
        { icon: <FaPauseCircle size={40} color="#0F75BC" />, title: "กิจกรรมที่ยังไม่ได้เริ่ม", quantity: 3, unit: "กิจกรรม" },
        { icon: <FaHourglassHalf size={40} color="#0F75BC" />, title: "กิจกรรมที่กำลังดำเนินอยู่", quantity: 4, unit: "คน" },
        { icon: <FaClock size={40} color="#0F75BC" />, title: "กิจกรรมที่รออนุมัติ", quantity: 2, unit: "กิจกรรม" },
        { icon: <FaCheckCircle size={40} color="#0F75BC" />, title: "กิจกรรมที่สิ้นสุด", quantity: 8, unit: "คน" },
    ];

    return (
        <div className="admin-Activity-content">
            <h2 className="admin-ativity-content-title">กิจกรรมและการเข้าร่วม</h2>
            <div className="admin-ativity-content-item">
                {activityStats.map((item, index) => (
                    <div className="admin-ativity-item-detail" key={index}>
                        {item.icon}
                        <p className="admin-ativity-item-detail-title">{item.title}</p>
                        <p className="admin-ativity-item-detail-quantity">{item.quantity}</p>
                        <p className="admin-ativity-item-detail-unit">{item.unit}</p>
                    </div>
                ))}
            </div>

            <button
                className="btn btn-primary w-100 mb-3 mt-5"
                onClick={() => navigate("/admin/activities/admin-create-news")}
            >
                เพิ่มข่าวประชาสัมพันธ์
            </button>

            <button
                className="btn btn-primary w-100 mb-3"
                onClick={() => navigate("/admin/activities/admin-create-activity")}
            >
                เพิ่มกิจกรรม
            </button>
        </div>
    );
}

export default AdminActivity;
