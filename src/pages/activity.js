import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "../css/activity.css"
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { IoMdClose } from "react-icons/io";



function Activity(){
    const [activityId, setActivityId] = useState(null);
    const [activity, setActivity] = useState([]);
    const [sortOrder, setSortOrder] = useState("latest");
    const [selectedStatus, setSelectedStatus] = useState('activity');
    const [showForm, setShowForm] = useState(false);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        batch_year: "",
        department: "",
        activity_id: null,
    });

    //เรียงลำดับโพสต์ตามวันที่
    // const sortedActivity = [...activity].sort((a, b) => {
    //     if (sortOrder === "latest") return new Date(b.created_at) - new Date(a.created_at);
    //     if (sortOrder === "oldest") return new Date(a.created_at) - new Date(b.created_at);
    //     return 0;
    // });

    useEffect(() => {
        axios.get('http://localhost:3001/activity/all-activity')
          .then(response => {
            setActivity(response.data);
          })
          .catch(error => {
            console.error("Error fetching activities:", error);
          });
      }, []);

    const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
    };

    const filteredActivity = activity.filter(activity => {
    if (selectedStatus === 'activity') return true;
    return activity.status == selectedStatus;
    });

    const handleJoinClick = (activityId) => {
        const userId = localStorage.getItem('userId'); 
        if (!userId) {
            Swal.fire({
                title: "กรุณาเข้าสู่ระบบ",
                text: "คุณต้องเข้าสู่ระบบก่อนเข้าร่วมกิจกรรม",
                icon: "warning",
                confirmButtonText: "เข้าสู่ระบบ"
            }).then(() => {
                navigate("/login");
            });
            return;
        }
    
        setShowForm(true);
        setFormData({ ...formData, activity_id: activityId });
    };    

    const handleFormSubmit = (e) => {
        e.preventDefault();

        // ตรวจสอบข้อมูลในฟอร์ม
        if (!/^\d{10}$/.test(formData.phone)) {
            Swal.fire({
                title: "ข้อผิดพลาด!",
                text: "กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (10 หลัก)",
                icon: "error",
                confirmButtonText: "ตกลง"
            });
            return;
        }

        // console.log("Form Data:", formData); 

        axios.post('http://localhost:3001/activity/activity-form', formData, {
            withCredentials: true,
        })
            .then(response => {
                Swal.fire({
                    title: "สำเร็จ!",
                    text: "คุณได้เข้าร่วมกิจกรรมเรียบร้อยแล้ว",
                    icon: "success",
                    confirmButtonText: "ตกลง",
                    timer: 3000
                });
                setShowForm(false);
            })
            .catch(error => {
                if (error.response && error.response.status === 400) {
                    Swal.fire({
                        title: "แจ้งเตือน!",
                        text: error.response.data.message,
                        icon: "warning",
                        confirmButtonText: "ตกลง"
                    });
                } else {
                    Swal.fire({
                        title: "เกิดข้อผิดพลาด!",
                        text: "ไม่สามารถเข้าร่วมกิจกรรมได้ กรุณาลองใหม่",
                        icon: "error",
                        confirmButtonText: "ตกลง"
                    });
                }
            });
    };
       
    // ฟังก์ชันช่วยสำหรับจัดการคลาสสถานะ
    const getStatusClass = (status) => {
        switch (status) {
            case 0:
                return "กำลังจะจัดขึ้น";
            case 1:
                return "เสร็จสิ้นแล้ว";
            case 2:
                return "กำลังดำเนินการ";
            default:
                return "";
        }
    };
    

    const formatDate = (dateStr) => {
        if (!dateStr || dateStr === "0000-00-00") return "ไม่ระบุวันที่"; // กรณีไม่มีวันที่
        const date = new Date(dateStr);
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear() + 543; // เพิ่ม 543 ปีเพื่อให้ตรงกับปีไทย
        return `${day} ${month} ${year}`;
      };
      
      const formatTime = (startTime, endTime) => {
        if (!startTime && !endTime) return ""; 
        const start = startTime ? new Date(`1970-01-01T${startTime}:00`) : null;
        const end = endTime ? new Date(`1970-01-01T${endTime}:00`) : null;
      
        const startHours = start ? start.getHours().toString().padStart(2, '0') : "--";
        const startMinutes = start ? start.getMinutes().toString().padStart(2, '0') : "--";
        const endHours = end ? end.getHours().toString().padStart(2, '0') : "--";
        const endMinutes = end ? end.getMinutes().toString().padStart(2, '0') : "--";
      
        return `${startHours}:${startMinutes} - ${endHours}:${endMinutes} น.`;
      };

    return(
        <section className="container">
            {/* <img src="./image/donation.jpg" className="head-activity" alt="donation-image" /> */}
            <div className="activity-page">
            <h3 className="act-title">กิจกรรม</h3>

            <select className="border rounded p-2 mb-3" onChange={handleStatusChange}>
                <option value="activity">กิจกรรม</option>
                <option value="2">กำลังดำเนินการ</option>
                <option value="1">เสร็จสิ้นแล้ว</option>
                <option value="0">กำลังจะจัดขึ้น</option>
            </select>

            <div className="container">
                <div className="row">
                    {filteredActivity.map(activity => (
                    <div className="col-md-4 mb-5" key={activity.activity_id}>
                        <div className="card activity-card">
                        <div className="image-container">
                        <img src={activity.image_path ? `http://localhost:3001${activity.image_path}` : "/default-image.png"} className="card-img-top" alt="กิจกรรม" />
                        <div className={`status-badge ${getStatusClass(activity.status)}`}>
                        {activity?.status === 0 ? "กำลังจะจัดขึ้น" :
                        activity?.status === 1 ? "เสร็จสิ้นแล้ว" :
                        activity?.status === 2 ? "กำลังดำเนินการ" : "ไม่ทราบสถานะ"}
                        </div>
                         
                        </div>
                        <div className="card-body">
                            <h5 className="card-title">{activity.activity_name}</h5>
                            {activity.check_alumni === 1 && (
                                <div className="alert alert-warning d-flex align-items-center" role="alert">
                                    <i className="me-2 bi bi-exclamation-circle-fill"></i>
                                    กิจกรรมนี้สำหรับศิษย์เก่า
                                </div>
                            )}
                            <h6>
                                {activity.end_date && activity.end_date !== "0000-00-00" && activity.end_date !== activity.activity_date
                                ? `${formatDate(activity.activity_date)} - ${formatDate(activity.end_date)}`
                                : `${formatDate(activity.activity_date)}`}
                            </h6>
                            <p className="card-text">{activity.description}</p>
                            <p className="text-muted">
                                ผู้เข้าร่วม: {activity.current_participants}/{activity.max_participants || "ไม่จำกัด"}
                            </p>
                            <div className="button-group">
                                {activity.status === 0 ? (
                                    <a
                                        className="btn join-button"
                                        onClick={() => handleJoinClick(activity.activity_id)}
                                    >
                                        เข้าร่วมกิจกรรม
                                    </a>
                                ) : null }
                                <a href={`/activity/${activity.activity_id}`} className="btn btn-info">
                                ดูรายละเอียด
                                </a>
                            </div>
                            </div>
                        </div>
                    </div>
                    ))}
                </div>
            </div>

            {showForm && (
                <div className="form-overlay">
                    <form className="join-form " onSubmit={handleFormSubmit}>
                        <button
                            type="button"
                            className="close-button"
                            onClick={() => setShowForm(false)}
                        >
                        <IoMdClose />
                        </button>
                        <h4 className="mb-4 text-center">เข้าร่วมกิจกรรม</h4>
                        <div className="activity-info">
                            <label className="form-label"><strong>กิจกรรม:</strong></label>
                            <p>{activity.find(act => act.activity_id === formData.activity_id)?.activity_name || "ไม่พบข้อมูลกิจกรรม"}</p>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="full_name" className="form-label">ชื่อ-นามสกุล</label>
                            <input
                                type="text"
                                className="form-control w-100"
                                id="full_name"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">อีเมล</label>
                            <input
                                type="email"
                                className="form-control w-100"
                                id="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="phone_number" className="form-label">เบอร์โทรศัพท์</label>
                            <input
                                type="text"
                                className="form-control w-100"
                                id="phone_number"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="batch_year" className="form-label">ปีที่จบการศึกษา</label>
                            <input
                                type="text"
                                className="form-control w-100"
                                id="batch_year"
                                value={formData.batch_year}
                                onChange={(e) => setFormData({ ...formData, batch_year: e.target.value })}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="department" className="form-label">สาขา</label>
                            <input
                                type="text"
                                className="form-control w-100"
                                id="department"
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                required
                            />
                        </div>
                        <div className="d-flex justify-content-between">
                            {/* <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>ยกเลิก</button> */}
                            <button type="submit" className="btn btn-success">ยืนยัน</button>
                        </div>

                        
    
                    </form>
                </div>
            )}
            </div>
        </section>
    )
}

export default Activity;