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

    return (
        <div className="container">
            <h1>{activity.activity_name}</h1>
            <p>{activity.description}</p>
            <p>วันที่: {activity.activity_date}</p>
            <p>สถานะ: {activity.status === 0 ? "กำลังจะจัดขึ้น" : activity.status === 1 ? "เสร็จสิ้นแล้ว" : "กำลังดำเนินการ"}</p>
            
        </div>
    );
}

export default ActivityDetail;