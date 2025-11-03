import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaCalendarAlt, FaClock, FaCheckCircle, FaSpinner, FaHourglassStart, FaUsers, FaInfoCircle,FaBuilding } from 'react-icons/fa';
import {HOSTNAME} from '../config.js';
import '../css/activity-detail.css'

function ActivityDetail() {
    const { activityId } = useParams();
    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        // ดึงข้อมูลกิจกรรมตาม id
        axios.get(HOSTNAME +`/activity/${activityId}`)
            .then(response => {
                setActivity(response.data.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching activity details:", error);
                setLoading(false);
            });
    }, [activityId]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted fs-5">กำลังโหลดข้อมูลกิจกรรม...</p>
                </div>
            </div>
        );
    }

    if (!activity) {
        return (
            <div className="container my-5">
                <div className="alert alert-danger text-center" role="alert">
                    <FaInfoCircle className="me-2" />
                    ไม่พบข้อมูลกิจกรรมที่คุณค้นหา
                </div>
            </div>
        );
    }

const formatDate = (dateStr) => {
    if (!dateStr || dateStr === "0000-00-00") return "ไม่ระบุวันที่";
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.getMonth() + 1; // เดือนเป็นเลข
    const year = date.getFullYear() + 543; // ปีไทย
    return `${day}/${month}/${year}`;
};

    const formatTime = (startTime, endTime) => {
        if (!startTime && !endTime) return "ไม่ระบุเวลา";

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

    const getStatusInfo = (status) => {
        switch (status) {
            case 0:
                return {
                    icon: <FaHourglassStart className="me-2 text-warning" />,
                    text: "กำลังจะจัดขึ้น",
                    badge: "bg-warning"
                };
            case 1:
                return {
                    icon: <FaCheckCircle className="me-2 text-success" />,
                    text: "เสร็จสิ้นแล้ว",
                    badge: "bg-success"
                };
            case 2:
                return {
                    icon: <FaSpinner className="me-2 text-info" />,
                    text: "กำลังดำเนินการ",
                    badge: "bg-info"
                };
            default:
                return {
                    icon: <FaInfoCircle className="me-2 text-secondary" />,
                    text: "ไม่ระบุสถานะ",
                    badge: "bg-secondary"
                };
        }
    };

    const statusInfo = getStatusInfo(activity.status);

    return (
        <div className="container my-5">
            <div className="card shadow-lg border-0 overflow-hidden">
                {/* Section with Image */}
                {activity.image_path && (
                    <div className="position-relative">
                        <div className="hero-image-container" style={{ height: '400px', overflow: 'hidden' }}>
                            <img
                                src={HOSTNAME +`${activity.image_path}`}
                                alt="กิจกรรม"
                                className={`w-100 h-100 object-fit-cover transition-opacity ${imageLoaded ? 'opacity-100' : 'opacity-50'}`}
                                onLoad={() => setImageLoaded(true)}
                                style={{ transition: 'opacity 0.3s ease' }}
                            />
                            {!imageLoaded && (
                                <div className="position-absolute top-50 start-50 translate-middle">
                                    <div className="spinner-border text-white" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Status Badge Overlay */}
                        <div className="position-absolute top-0 end-0 m-3">
                            <span className={`badge ${statusInfo.badge} fs-6 px-3 py-2 rounded-pill shadow`}>
                                {statusInfo.text}
                            </span>
                        </div>
                        {/* Gradient Overlay */}
                        <div className="position-absolute bottom-0 start-0 w-100 h-50"
                            style={{
                                background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'
                            }}>
                        </div>
                        {/* Title Overlay */}
                        <div className="position-absolute bottom-0 start-0 p-4 text-white">
                            <h1 className="display-5 fw-bold mb-0 text-shadow">
                                {activity.activity_name}
                            </h1>
                        </div>
                    </div>
                )}

                {/* Content Section */}
                <div className="card-body p-0">
                    {!activity.image_path && (
                        <div className="bg-primary text-white text-center py-5">
                            <h1 className="display-4 fw-bold mb-0">{activity.activity_name}</h1>
                            <span className={`badge ${statusInfo.badge} fs-6 px-3 py-2 rounded-pill mt-3`}>
                                {statusInfo.text}
                            </span>
                        </div>
                    )}

                    <div className="p-4">
                        {/* Quick Info Cards */}
                        <div className="row g-3 mb-5">
                            <div className="col-md-3">
                                <div className="card border-0 bg-light h-100">
                                    <div className="card-body text-center">
                                        {/* <FaCalendarAlt className="text-primary mb-2" size={24} /> */}
                                        <h6 className="card-title text-muted mb-1">วันที่เริ่ม</h6>
                                        <p className="card-text fw-bold">{formatDate(activity.activity_date)}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card border-0 bg-light h-100">
                                    <div className="card-body text-center">
                                        {/* <FaClock className="text-warning mb-2" size={24} /> */}
                                        <h6 className="card-title text-muted mb-1">เวลา</h6>
                                        <p className="card-text fw-bold">{formatTime(activity.start_time, activity.end_time)}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card border-0 bg-light h-100">
                                    <div className="card-body text-center">
                                        {/* <FaCalendarAlt className="text-danger mb-2" size={24} /> */}
                                        <h6 className="card-title text-muted mb-1">วันที่สิ้นสุด</h6>
                                        <p className="card-text fw-bold">
                                            {activity.end_date && activity.end_date !== "0000-00-00"
                                                ? formatDate(activity.end_date)
                                                : "ไม่ระบุ"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card border-0 bg-light h-100">
                                    <div className="card-body text-center">
                                        <h6 className="card-title text-muted mb-1">สถานะ</h6>
                                        <span className={`badge ${statusInfo.badge} fs-6 px-2 py-1 rounded-pill`}>
                                            {statusInfo.text}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="row">
                            <div className="col-lg-8 mb-4">
                                <div className="card border-0 shadow-sm h-100">
                                    <div className="card-header bg-white border-0 pb-0">
                                        <h3 className="text-primary mb-0 d-flex align-items-center">
                                            รายละเอียดกิจกรรม
                                        </h3>
                                    </div>
                                    <div className="card-body">
                                        <div className="bg-light p-4 rounded-3 border-start border-primary border-4">
                                            <p className="mb-0 fs-5 lh-lg text-dark">
                                                {activity.description || "ไม่พบรายละเอียดกิจกรรม"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div className="col-lg-4 mb-4">
                                <div className="card border-0 shadow-sm h-100">
                                    <div className="card-header bg-white border-0 pb-0">
                                        <h3 className="text-primary mb-0 d-flex align-items-center">
                                            ข้อมูลเพิ่มเติม
                                        </h3>
                                    </div>
                                    <div className="card-body">
                                        <div className="list-group list-group-flush">
                                            <div className="list-group-item d-flex align-items-center border-0 px-0">
                                                <div>
                                                    <small className="text-muted d-block">สาขา</small>
                                                    {activity.department_restriction|| "ไม่ระบุ"}
                                                </div>
                                            </div>
                                            <div className="list-group-item d-flex align-items-center border-0 px-0">
                                                <div>
                                                    <small className="text-muted d-block">ผู้เข้าร่วม</small>
                                                    {activity.current_participants}/{activity.max_participants || "ไม่จำกัด"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ActivityDetail;