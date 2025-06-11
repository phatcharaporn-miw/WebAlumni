import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaCalendarAlt, FaClock, FaCheckCircle, FaSpinner, FaHourglassStart } from 'react-icons/fa';

function ActivityDetail() {
    const { activityId } = useParams(); 
    const [activity, setActivity] = useState(null);

    useEffect(() => {
        // ดึงข้อมูลกิจกรรมตาม id
        axios.get(`http://localhost:3001/activity/${activityId}`)
            .then(response => {
                setActivity(response.data.data);
            })
            .catch(error => {
                console.error("Error fetching activity details:", error);
            });
    }, [activityId]);

    if (!activity) {
        return <p>กำลังโหลดข้อมูล...</p>;
    }

    const formatDate = (dateStr) => {
        if (!dateStr || dateStr === "0000-00-00") return "ไม่ระบุวันที่";
        const date = new Date(dateStr);
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear() + 543; // เพิ่ม 543 ปีเพื่อให้ตรงกับปีไทย
        return `${day} ${month} ${year}`;
    };

    const formatTime = (startTime, endTime) => {
        if (!startTime && !endTime) return "ไม่ระบุเวลา"; // กรณีไม่มีเวลา
    
        const parseTime = (time) => {
            if (!time) return null;
            const [hours, minutes] = time.split(":");
            return { hours: hours.padStart(2, '0'), minutes: minutes.padStart(2, '0') };
        };
    
        const start = parseTime(startTime);
        const end = parseTime(endTime);
    
        const startFormatted = start ? `${start.hours}:${start.minutes}` : "--:--";
        const endFormatted = end ? `${end.hours}:${end.minutes}` : "--:--";
    
        return `${startFormatted} - ${endFormatted} น.`;
    };

    return (
    <div className="container my-5">
        <div className="card shadow-lg border-0">
            <div className="card-header bg-primary text-center py-4">
                <h2 className="card-title  text-white mb-0">{activity.activity_name}</h2>
            </div>
            <div className="card-body p-4">
                {activity.image_path && (
                    <div className="text-center mb-4">
                        <img
                            src={`http://localhost:3001${activity.image_path}`}
                            alt="กิจกรรม"
                            className="img-fluid rounded shadow-sm"
                            style={{ maxHeight: "400px", objectFit: "cover" }}
                        />
                    </div>
                )}

                <div className="row">
                    {/* รายละเอียดกิจกรรม */}
                    <div className="col-md-6 mb-4">
                        <h5 className="text-primary mb-3">
                            รายละเอียดกิจกรรม
                        </h5>
                        <div className="bg-light p-3 rounded shadow-sm" style={{ minHeight: "160px" }}>
                            <p className="mb-0">{activity.description || "ไม่พบรายละเอียดกิจกรรม"}</p>
                        </div>
                    </div>

                    {/* ข้อมูลกิจกรรม */}
                    <div className="col-md-6 mb-4">
                        <h5 className="text-primary mb-3">
                            ข้อมูลกิจกรรม
                        </h5>
                        <ul className="list-group shadow-sm">
                            <li className="list-group-item d-flex align-items-center">
                                <FaCalendarAlt className="me-2 text-success" />
                                <strong className="me-2">วันที่เริ่ม:</strong>
                                {formatDate(activity.activity_date)}
                            </li>
                            <li className="list-group-item d-flex align-items-center">
                                <FaCalendarAlt className="me-2 text-danger" />
                                <strong className="me-2">วันที่สิ้นสุด:</strong>
                                {activity.end_date && activity.end_date !== "0000-00-00"
                                    ? formatDate(activity.end_date)
                                    : "ไม่ระบุ"}
                            </li>
                            <li className="list-group-item d-flex align-items-center">
                                <FaClock className="me-2 text-warning" />
                                <strong className="me-2">เวลา:</strong>
                                {formatTime(activity.start_time, activity.end_time)}
                            </li>
                            <li className="list-group-item d-flex align-items-center">
                                {activity.status === 0 && <FaHourglassStart className="me-2 text-info" />}
                                {activity.status === 1 && <FaCheckCircle className="me-2 text-success" />}
                                {activity.status === 2 && <FaSpinner className="me-2 text-warning" />}
                                <strong className="me-2">สถานะ:</strong>
                                {activity.status === 0
                                    ? "กำลังจะจัดขึ้น"
                                    : activity.status === 1
                                    ? "เสร็จสิ้นแล้ว"
                                    : "กำลังดำเนินการ"}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
}

export default ActivityDetail;