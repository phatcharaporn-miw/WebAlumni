import React, { useEffect, useState } from "react";
import axios from "axios";
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useNavigate } from "react-router-dom";
import { FaFilter, FaPlay, FaCheck, FaClock } from "react-icons/fa"; 
import "../../css/admin-activity.css";


function AdminActivity() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("summary");
    const [activityData, setActivityData] = useState(null);
    const [activityList, setActivityList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    useEffect(() => {
        if (activeTab === "summary") {
            axios.get("http://localhost:3001/admin/activity-summary", {
                withCredentials: true,
            })
                .then((response) => {
                    if (response.data) {
                        setActivityData(response.data.data);
                    }
                    setLoading(false);
                })
                .catch((error) => {
                    console.error("เกิดข้อผิดพลาดในการดึงข้อมูลกิจกรรม:", error);
                    setLoading(false);
                });
        } else if (activeTab === "table") {
            axios.get("http://localhost:3001/activity/all-activity", {
                withCredentials: true,
            })
                .then((res) => {
                    if (res.data.success) {
                        setActivityList(res.data.data);
                    }
                    setLoading(false);
                })
                .catch((error) => {
                    console.error("เกิดข้อผิดพลาดในการดึงข้อมูลกิจกรรม:", error);
                    setLoading(false);
                });
        }
    }, [activeTab]);

    // แปลงวันที่เป็นรูปแบบไทย
    const formatDate = (isoDateString) => {
        const date = new Date(isoDateString);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('th-TH', options);
      };
      
    // แปลงเวลาเป็นรูปแบบ 24 ชั่วโมง
    const formatTime = (start, end) => {
        if (!start || !end || start === end) return '-';
        return `${start.substring(0, 5)} - ${end.substring(0, 5)}`;
      };
      
    // ฟังก์ชันสำหรับการค้นหากิจกรรม
    const filteredActivities = activityList.filter((activity) => {
        const matchesSearch = activity.activity_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === "all" || activity.status.toString() === filterStatus;
        return matchesSearch && matchesFilter;
    });

    if (loading) return <p className="text-center mt-5">กำลังโหลดข้อมูล...</p>;

    return (
        <div className="activity-container">
            <h3 className="admin-title">กิจกรรมและการเข้าร่วม</h3>

            {/* Tabs */}
            <ul className="nav nav-tabs mb-3">
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === "summary" ? "active" : ""}`}
                        onClick={() => setActiveTab("summary")}>
                        สรุปกิจกรรมและการเข้าร่วม
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === "table" ? "active" : ""}`}
                        onClick={() => setActiveTab("table")}>
                        ตารางกิจกรรม
                    </button>
                </li>
            </ul>

            {/* สรุปกิจกรรมและการเข้าร่วม */}
            {activeTab === "summary" && activityData && (
                <div className="row">
                    {[
                        { label: "กิจกรรมทั้งหมด", value: activityData.total_activities },
                        { label: "ผู้เข้าร่วมทั้งหมด", value: activityData.total_participants, unit: "คน" },
                        { label: "กิจกรรมที่ยังไม่ได้เริ่ม", value: activityData.upcoming_activities },
                        { label: "กิจกรรมที่กำลังดำเนินอยู่", value: activityData.ongoing_activities },
                        { label: "กิจกรรมที่สิ้นสุดแล้ว", value: activityData.completed_activities },
                        // { label: "กิจกรรมที่รออนุมัติ", value: activityData.approvedActivities || 0 },
                    ].map((item, index) => (
                        <div className="col-md-4 mb-3" key={index}>
                            <div className="card shadow-sm">
                                <div className="card-body text-center">
                                    <h5 className="card-title">{item.label}</h5>
                                    <h2 className="text-primary">{item.value}</h2>
                                    <p className="text-muted">{item.unit || "กิจกรรม"}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ตารางกิจกรรม*/}
            {activeTab === "table" && (
                <>
                    <div className="d-flex justify-content-between mb-3">
                        <div>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="ค้นหากิจกรรม..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="btn-group">
                            <button
                                className={`btn btn-outline-primary ${filterStatus === "all" ? "active" : ""}`}
                                onClick={() => setFilterStatus("all")}
                            >
                                <FaFilter className="me-1" /> ทั้งหมด
                            </button>
                            <button
                                className={`btn btn-outline-primary ${filterStatus === "0" ? "active" : ""}`}
                                onClick={() => setFilterStatus("0")}
                            >
                                <FaClock className="me-1" /> ยังไม่เริ่ม
                            </button>
                            <button
                                className={`btn btn-outline-primary ${filterStatus === "2" ? "active" : ""}`}
                                onClick={() => setFilterStatus("2")}
                            >
                                <FaPlay className="me-1" /> กำลังดำเนินการ
                            </button>
                            <button
                                className={`btn btn-outline-primary ${filterStatus === "1" ? "active" : ""}`}
                                onClick={() => setFilterStatus("1")}
                            >
                                <FaCheck className="me-1" /> เสร็จสิ้นแล้ว
                            </button>
                        </div>
                        <button className="btn btn-success" onClick={() => navigate("/admin/activities/admin-create-activity")}>
                            เพิ่มกิจกรรม
                        </button>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-bordered table-hover align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>ชื่อกิจกรรม</th>
                                    <th>วันที่จัด</th>
                                    <th>เวลา</th>
                                    <th>สถานะ</th>
                                    <th>ผู้เข้าร่วม</th>
                                    <th className="text-center">การจัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredActivities.length > 0 ? (
                                    filteredActivities.map((act) => (
                                        <tr key={act.activity_id}>
                                            <td>{act.activity_name}</td>
                                            <td>{formatDate(act.activity_date)}</td>
                                            <td>{formatTime(act.start_time, act.end_time)}</td>
                                            <td>
                                                {act.status === 0 ? (
                                                    <span className="badge bg-warning bg-opacity-10 text-warning">ยังไม่เริ่ม</span>
                                                ) : act.status === 1 ? (
                                                    <span className="badge bg-success  bg-opacity-10 text-success">เสร็จสิ้นแล้ว</span>
                                                ) : (
                                                    <span className="badge bg-primary  bg-opacity-10 text-primary">กำลังดำเนินการ</span>
                                                )}
                                            </td>
                                            <td>
                                                {act.current_participants > 0 ? (
                                                    <span className="text-primary fw-bold">{act.current_participants} คน</span>
                                                ) : (
                                                    <span className="text-muted fst-italic">ยังไม่มีผู้เข้าร่วม</span>
                                                )}
                                            </td>
                                            <td className="text-center">
                                                <div className="d-flex justify-content-center gap-2">
                                                    <button
                                                        className="btn btn-outline-info btn-sm"
                                                        onClick={() => navigate(`/admin/activities/${act.activity_id}`)}
                                                    >
                                                    ดูรายละเอียด
                                                    </button>
                                                    {act.current_participants > 0 && (
                                                        <button
                                                            className="btn btn-outline-primary btn-sm"
                                                            onClick={() => navigate(`/admin/activities/${act.activity_id}/participants`)}
                                                        >
                                                        ผู้เข้าร่วม
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center text-muted">
                                            ไม่มีข้อมูลกิจกรรม
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

export default AdminActivity;
