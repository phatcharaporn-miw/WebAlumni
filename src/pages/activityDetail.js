import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function ActivityDetail() {
    const { activityId } = useParams(); // ดึง id จาก URL
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
        <div className="container mt-5">
            <div className="card shadow-lg">
                <div className="card-header bg-primary text-white">
                    <h2 className="card-title text-center">{activity.activity_name}</h2>
                </div>
                <div className="card-body">
                    {activity.image_path && (
                        <div className="text-center mb-4">
                            <img
                                src={`http://localhost:3001${activity.image_path}`}
                                alt="กิจกรรม"
                                className="img-fluid rounded"
                                style={{ maxHeight: "400px" }}
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
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ActivityDetail;