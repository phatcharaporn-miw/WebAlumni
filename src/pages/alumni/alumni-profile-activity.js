import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../css/profile.css';
import { useOutletContext } from "react-router-dom";
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from "sweetalert2";
// css
import '../../css/profile.css';
// bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function AlumniProfileActivity() {
    const [profile, setProfile] = useState({});
    const {handleLogout } = useOutletContext();
    const [activity, setActivity] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('activity');
    const navigate = useNavigate();
    const location = useLocation();

     // ดึงข้อมูลโปรไฟล์
     useEffect(() => {
        axios.get('http://localhost:3001/users/profile', { 
            withCredentials: true 
        })
            .then((response) => {
                if (response.data.success) {
                    setProfile(response.data.user);
                }
            })
            .catch((error) => {
                console.error('เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์:', error.response ? error.response.data.message : error.message);
            });
    }, []);

        // ดึงประวัติการเข้าร่วมกิจกรรม
        useEffect(() => {
            if (profile && profile.userId) {
                axios.get(`http://localhost:3001/activity/activity-history/${profile.userId}`, {
                    withCredentials: true, 
                  })
                    .then((response) => {
                        console.log(response.data); 
                      if (response.data.success) {
                        setActivity(response.data.activity); 
                      }
                    })
                    .catch((error) => {
                      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลกิจกรรม:', error.response ? error.response.data.message : error.message);
                    });
            }
        }, [profile]);


        if (!profile) {
          return <div>ไม่พบข้อมมูลผู้ใช้</div>;
        }
    
     // ตรวจสอบว่าเมนูใดควรเป็น active
     const isActive = (path) => location.pathname === path;

     const filteredActivity = activity.filter(activity => {
        if (selectedStatus === 'activity') return true;
        return activity.status == selectedStatus;
        });


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

        
   return (
           <section className='container'>
               <div className='alumni-profile-page'>
                   <h3 className="alumni-title text-center">ประวัติการเข้าร่วมกิจกรรม</h3>
                   <div className="row justify-content-between">
                       <div className="col-4 bg-light rounded text-center">
                           <img
                               src={`${profile.profilePicture}`}
                               alt="Profile"
                               style={{ width: '140px', height: '140px', borderRadius: '50%' }}
                           />
                           <p className="mt-3 fw-bold">{profile.fullName}</p>
                           <div className="menu mt-4">
                           <div
                                   className={`menu-item py-2 mb-2 rounded ${isActive('/alumni-profile') ? 'active' : ''}`}
                                   onClick={() => navigate('/alumni-profile')}
                               >
                                   ข้อมูลส่วนตัว
                               </div>
                               <div
                                   className={`menu-item py-2 mb-2 rounded ${isActive('/alumni-profile/alumni-profile-webboard') ? 'active' : ''}`}
                                   onClick={() => navigate('/alumni-profile/alumni-profile-webboard')}
                               >
                                   กระทู้ที่สร้าง
                               </div>
                               <div
                                   className={`menu-item py-2 mb-2 rounded ${isActive('/profile/donations') ? 'active' : ''}`}
                                   onClick={() => navigate('/profile/donations')}
                               >
                                   ประวัติการบริจาค
                               </div>
   
                               <div
                                   className={`menu-item py-2 mb-2 rounded ${isActive('/alumni-profile/alumni-profile-activity') ? 'active' : ''}`}
                                   onClick={() => navigate('/alumni-profile/alumni-profile-activity')}
                               >
                                   ประวัติการเข้าร่วมกิจกรรม
                               </div>
                               <div
                                   className={`menu-item py-2 mb-2 rounded ${isActive('/profile/orders') ? 'active' : ''}`}
                                   onClick={() => navigate('/profile/orders')}
                               >
                                   ประวัติการสั่งซื้อ
                               </div>
                               <div className="menu-item py-2 rounded" onClick={handleLogout}>
                                   ออกจากระบบ
                               </div>
                           </div>
                       </div>
                        <div className="row">
                            <div className="col-8">
                                    {filteredActivity.map(activity => (
                                <div className="col-md-6 col-lg-6 mb-4" key={activity.activity_id}>
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
                                                <div className="button-group">
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
                    </div>
               </div>
           </section>
       );
}

export default AlumniProfileActivity;