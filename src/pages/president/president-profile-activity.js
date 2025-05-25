import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useOutletContext } from "react-router-dom";
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from "sweetalert2";
// css
import '../../css/profile.css';
// import '../../css/activity.css';
// bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function PresidentProfileActivity() {
    const [profile, setProfile] = useState({});
    const {handleLogout } = useOutletContext();
    const [activity, setActivity] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('activity');
    const [previewImage, setPreviewImage] = useState(null);
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
    
        const handleClick = (path) => {
          navigate(path);
        };

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

      // อัปโหลดรูปภาพ
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    // แสดง preview รูปก่อนอัปโหลด
    setPreviewImage(URL.createObjectURL(file));
  
    const formData = new FormData();
    formData.append("image_path", file);
    formData.append("user_id", profile.userId); 
  
    try {
      const res = await axios.post("http://localhost:3001/users/update-profile-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      if (res.status === 200) {
        alert("อัปโหลดรูปสำเร็จ");
  
        // อัปเดตรูปโปรไฟล์ใน state
        setProfile((prev) => ({
          ...prev,
          profilePicture: res.data.newImagePath,
        }));
      } else {
        alert(res.data.message || "เกิดข้อผิดพลาด");
      }
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถอัปโหลดรูปได้");
    }
  };
        
    return (
        <section className='container py-4'>
          <div className='alumni-profile-page'>
            <div className="row justify-content-center g-4">
              {/* Sidebar/Profile */}
              <div className="col-12 col-md-3 mb-4">
                <div className="bg-white rounded-4 shadow-sm text-center p-4">
                  <img
                    src={previewImage || profile.profilePicture}
                    alt="Profile"
                    style={{ width: "130px", height: "130px", borderRadius: "50%", objectFit: "cover", marginBottom: 16, border: '3px solid #eee' }}
                    className="img-fluid mb-2"
                  />
                  <div className="mt-2 mb-3">
                    <label
                      htmlFor="upload-profile-pic"
                      className="btn btn-sm btn-outline-secondary"
                      style={{ cursor: "pointer" }}
                    >
                      เปลี่ยนรูป
                    </label>
                    <input
                      type="file"
                      id="upload-profile-pic"
                      className="d-none"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </div>
                  <hr className="w-100" />
                  <div className="menu d-block mt-3 w-100">
                    <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/president-profile")}>ข้อมูลส่วนตัว</div>
                    <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/president-profile/president-profile-webboard")}>กระทู้ที่สร้าง</div>
                    <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/president-profile/donation-history")}>ประวัติการบริจาค</div>
                    <div className="menu-item active py-2 mb-2 rounded" onClick={() => handleClick("/president-profile/president-profile-activity")}>ประวัติการเข้าร่วมกิจกรรม</div>
                    <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/president-profile/president-profile-souvenir")}>ประวัติการสั่งซื้อ</div>
                    <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/president-profile/president-approve")}>การอนุมัติ</div>
                    <div className="menu-item py-2 rounded" onClick={handleLogout}>ออกจากระบบ</div>
                  </div>
                </div>
              </div>
              {/* Main Content */}
              <div className="col-12 col-md-8">
                {/* <h3 className="alumni-title mb-4">ประวัติการเข้าร่วมกิจกรรม</h3> */}
                <div className="row g-4">
                  {filteredActivity.length > 0 ? (
                    filteredActivity.map(activity => (
                      <div className="col-md-6 col-lg-6" key={activity.activity_id}>
                        <div className="card activity-card h-100 d-flex flex-column justify-content-between">
                          <div className="image-container position-relative">
                            <img 
                              src={activity.image_path ? `http://localhost:3001${activity.image_path}` : "/default-image.png"} 
                              className="card-img-top" 
                              alt="กิจกรรม" 
                              style={{ height: 180, objectFit: 'cover', borderRadius: '1rem 1rem 0 0' }}
                            />
                            <div className={`status-badge position-absolute top-0 end-0 m-2 px-3 py-1 rounded-pill bg-primary text-white small shadow`}
                              style={{ fontSize: 13, zIndex: 2 }}>
                              {activity?.status === 0 ? "กำลังจะจัดขึ้น" :
                                activity?.status === 1 ? "เสร็จสิ้นแล้ว" :
                                activity?.status === 2 ? "กำลังดำเนินการ" : "ไม่ทราบสถานะ"}
                            </div>
                          </div>
                          <div className="card-body">
                            <h5 className="card-title mb-2">{activity.activity_name}</h5>
                            {activity.check_alumni === 1 && (
                              <div className="alert alert-warning d-flex align-items-center py-1 px-2 mb-2 small" role="alert">
                                <i className="me-2 bi bi-exclamation-circle-fill"></i>
                                กิจกรรมนี้สำหรับศิษย์เก่า
                              </div>
                            )}
                            <h6 className="mb-1">
                              {activity.end_date && activity.end_date !== "0000-00-00" && activity.end_date !== activity.activity_date
                                ? `${formatDate(activity.activity_date)} - ${formatDate(activity.end_date)}`
                                : `${formatDate(activity.activity_date)}`}
                            </h6>
                            <p className="card-text small text-muted mb-2">{activity.description}</p>
                            <div className="button-group text-end">
                              <button 
                                className="btn btn-info btn-sm px-3" 
                                onClick={() => navigate(`/activity/${activity.activity_id}`)}
                              >
                                ดูรายละเอียด
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center w-100 py-5">
                      <h5 className="mt-3 text-muted">ยังไม่มีกิจกรรมในขณะนี้</h5>
                      <p className="text-secondary">กรุณาตรวจสอบอีกครั้งในภายหลัง</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
    ); 
}

export default PresidentProfileActivity;