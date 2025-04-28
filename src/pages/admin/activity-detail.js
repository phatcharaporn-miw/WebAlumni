import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import { MdEdit, MdDelete } from "react-icons/md";
import "../../css/admin-activity.css";

function AdminActivityDetail() {
    const { activityId } = useParams(); // ดึง ID ของกิจกรรมจาก URL
    const navigate = useNavigate();
    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(true);

    // ดึงข้อมูลกิจกรรม
    useEffect(() => {
        axios.get(`http://localhost:3001/activity/${activityId}`, { 
            withCredentials: true 
        })
            .then((response) => {
                if (response.data.success) {
                    // console.log(response.data.data);
                    setActivity(response.data.data);
                } else {
                    console.error("เกิดข้อผิดพลาดในการดึงข้อมูลกิจกรรม:", response.data.message);
                }
                setLoading(false);
            })
            .catch((error) => {
                console.error("เกิดข้อผิดพลาดในการดึงข้อมูลกิจกรรม:", error.message);
                setLoading(false);
            });
    }, [activityId]);

    // ฟังก์ชันลบกิจกรรม
    const handleDeleteActivity = () => {
        if (window.confirm("คุณต้องการลบกิจกรรมนี้หรือไม่?")) {
            axios.delete(`http://localhost:3001/activity/${activityId}`, { withCredentials: true })
                .then((response) => {
                    if (response.data.success) {
                        alert("ลบกิจกรรมสำเร็จ!");
                        navigate("/admin/activities");
                    } else {
                        alert("เกิดข้อผิดพลาดในการลบกิจกรรม");
                    }
                })
                .catch((error) => {
                    console.error("เกิดข้อผิดพลาดในการลบกิจกรรม:", error.message);
                });
        }
    };

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

    if (loading) {
        return <p className="text-center mt-5">กำลังโหลดข้อมูล...</p>;
    }

    if (!activity) {
        return <p className="text-center mt-5">ไม่พบข้อมูลกิจกรรม</p>;
    }

    return (
        <div className="container mt-4">
            <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>ย้อนกลับ</button>
            <div className="card shadow-lg">
                <div className="card-header bg-primary text-white text-center">
                    <h2 className="card-title">{activity.activity_name}</h2>
                </div>
                <div className="card-body">
                    {activity.image_path && (
                        <div className="text-center mb-4">
                            <img
                                src={`http://localhost:3001${activity.image_path}`}
                                alt="กิจกรรม"
                                className="img-fluid rounded"
                                style={{ maxHeight: "400px", objectFit: "cover" }}
                            />
                        </div>
                    )}
                    <div className="row">
                        <div className="col-md-12">
                            <h5 className="text-muted">รายละเอียดกิจกรรม</h5>
                            <p>{activity.description}</p>
                        </div>
                        <div className="col-md-12 mt-4">
                            <h5 className="text-muted">ข้อมูลกิจกรรม</h5>
                            <ul className="list-group">
                                <li className="list-group-item">
                                    <strong>วันที่จัดกิจกรรม:</strong> {formatDate(activity.activity_date)}
                                </li>
                                <li className="list-group-item">
                                    <strong>วันที่สิ้นสุด:</strong> {activity.end_date && activity.end_date !== "0000-00-00" ? formatDate(activity.end_date) : "ไม่ระบุ"}
                                </li>
                                <li className="list-group-item">
                                    <strong>เวลา:</strong> {formatTime(activity.start_time, activity.end_time)}
                                </li>
                                <li className="list-group-item">
                                    <strong>สถานะ:</strong> {activity.status === 0 ? "กำลังจะจัดขึ้น" : activity.status === 1 ? "เสร็จสิ้นแล้ว" : "กำลังดำเนินการ"}
                                </li>
                                <li className="list-group-item">
                                    <strong>ผู้เข้าร่วม:</strong> {activity.current_participants}/{activity.max_participants || "ไม่จำกัด"} คน       
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="card-footer d-flex justify-content-between">
                    <button
                        className="btn btn-warning"
                        onClick={() => navigate(`/admin/activities/edit/${activityId}`)}
                    >
                        <MdEdit className="me-2" /> แก้ไขกิจกรรม
                    </button>
                    <button
                        className="btn btn-danger"
                        onClick={handleDeleteActivity}
                    >
                        <MdDelete className="me-2" /> ลบกิจกรรม
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AdminActivityDetail;