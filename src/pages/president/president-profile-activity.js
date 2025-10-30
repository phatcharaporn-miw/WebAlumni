import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
// import Swal from "sweetalert2";
import { useAuth } from '../../context/AuthContext';
import {HOSTNAME} from '../../config.js';

// css
import '../../css/profile.css';

// bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function PresidentProfileActivity() {
  const [profile, setProfile] = useState({});
  const [activity, setActivity] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('activity');
  const [previewImage, setPreviewImage] = useState(null);
  const { user, handleLogout } = useAuth();
  const userId = user?.user_id;
  const navigate = useNavigate();
  const location = useLocation();

  // ดึงข้อมูลโปรไฟล์
  useEffect(() => {
    axios.get(HOSTNAME +'/users/profile', {
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
    if (userId) {
      axios.get(HOSTNAME +`/activity/activity-history/${profile.userId}`, {
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
  }, [userId]);

  if (!userId) {
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
  if (!dateStr || dateStr === "0000-00-00") return "ไม่ระบุวันที่";
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.getMonth() + 1; // เดือนเป็นเลข
  const year = date.getFullYear() + 543; // ปีไทย
  return `${day}/${month}/${year}`;
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
      const res = await axios.post(HOSTNAME +"/users/update-profile-image", formData, {
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
    <section className = "container py-4">
      <div className = "alumni-profile-page">
        <div className ="row justify-content-center g-4">
          {/* Sidebar/Profile */}
          <div className ="col-12 col-md-3 mb-4">
            <div className ="bg-white rounded-4 shadow-sm text-center p-4">
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
                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/president-profile")}>โปรไฟล์ของฉัน</div>
                {/* <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/president-profile/president-manage-orders")}>จัดการคำสั่งซื้อของที่ระลึก</div> */}
                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/president-profile/president-profile-webboard")}>กระทู้ที่สร้าง</div>
                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/president-profile/president-profile-donation")}>ประวัติการบริจาค</div>
                <div className="menu-item active py-2 mb-2 rounded" onClick={() => handleClick("/president-profile/president-profile-activity")}>ประวัติการเข้าร่วมกิจกรรม</div>
                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/president-profile/president-profile-souvenir")}>ประวัติการสั่งซื้อของที่ระลึก</div>
                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/president-profile/president-approve")}>การอนุมัติ</div>
                <div className="menu-item py-2 rounded" onClick={handleLogout}>ออกจากระบบ</div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-12 col-md-8">
            {/* Header Section */}
            <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                    <i className="fas fa-calendar-check text-success fs-5"></i>
                  </div>
                  <div>
                    <h4 className="fw-bold mb-1">ประวัติการเข้าร่วมกิจกรรม</h4>
                    <p className="text-muted mb-0 small">รวบรวมกิจกรรมที่คุณเข้าร่วมทั้งหมด</p>
                  </div>
                </div>
                {filteredActivity.length > 0 && (
                  <div className="d-flex align-items-center">
                    <span className="badge bg-success text-white px-3 py-2 rounded-pill">
                      {filteredActivity.length} กิจกรรม
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Activities Grid */}
            <div className="row g-4">
              {filteredActivity.length > 0 ? (
                filteredActivity.map(activity => (
                  <div className="col-md-6 col-lg-6" key={activity.activity_id}>
                    <div className="card activity-card h-100 d-flex flex-column border-0 shadow-sm rounded-4 overflow-hidden">
                      {/* Image Container with Overlay */}
                      <div className="image-container position-relative overflow-hidden">
                        <img
                          src={activity.image_path ? HOSTNAME +`${activity.image_path}` : "/default-image.png"}
                          className="card-img-top activity-image"
                          alt="กิจกรรม"
                          style={{ height: 200, objectFit: 'cover', transition: 'transform 0.3s ease' }}
                        />

                        {/* Image Overlay */}
                        <div className="image-overlay position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-0 transition-all d-flex align-items-center justify-content-center">
                          <button className="btn btn-light btn-sm rounded-pill px-3 opacity-0 view-detail-btn">
                            <i className="fas fa-eye me-2"></i>
                            ดูรายละเอียด
                          </button>
                        </div>

                        {/* Status Badge */}
                        <div className="position-absolute top-0 start-0 m-3">
                          <span className={`badge px-3 py-2 rounded-pill shadow-sm ${getStatusClass(activity.status)}`}>
                            <i className={`fas me-1 ${activity?.status === 0 ? 'fa-clock' :
                              activity?.status === 1 ? 'fa-check-circle' :
                                activity?.status === 2 ? 'fa-spinner' : 'fa-question-circle'
                              }`}></i>
                            {activity?.status === 0 ? "กำลังจะจัดขึ้น" :
                              activity?.status === 1 ? "เสร็จสิ้นแล้ว" :
                                activity?.status === 2 ? "กำลังดำเนินการ" : "ไม่ทราบสถานะ"}
                          </span>
                        </div>

                        {/* Alumni Badge */}
                        {activity.check_alumni === 1 && (
                          <div className="position-absolute top-0 end-0 m-3">
                            <span className="badge bg-warning text-dark px-3 py-2 rounded-pill shadow-sm">
                              <i className="fas fa-graduation-cap me-1"></i>
                              ศิษย์เก่า
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Card Body */}
                      <div className="card-body p-4 flex-grow-1 d-flex flex-column">
                        <h5 className="card-title mb-2 fw-bold text-dark line-clamp-2">{activity.activity_name}</h5>

                        {/* Date Section */}
                        <div className="d-flex align-items-center mb-3 text-muted">
                          <i className="fas fa-calendar-alt me-2 text-primary"></i>
                          <span className="fw-500 small">
                            {activity.end_date && activity.end_date !== "0000-00-00" && activity.end_date !== activity.activity_date
                              ? `${formatDate(activity.activity_date)} - ${formatDate(activity.end_date)}`
                              : `${formatDate(activity.activity_date)}`}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="card-text small text-muted mb-3 line-clamp-3 flex-grow-1">
                          {activity.description}
                        </p>

                        {/* Alumni Alert */}
                        {activity.check_alumni === 1 && (
                          <div className="alert alert-warning d-flex align-items-center py-2 px-3 mb-3 small border-0 rounded-3" role="alert">
                            <i className="fas fa-exclamation-circle me-2"></i>
                            กิจกรรมนี้สำหรับศิษย์เก่าเท่านั้น
                          </div>
                        )}
                      </div>

                      {/* Card Footer */}
                      <div className="card-footer bg-light border-0 p-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center text-muted small">
                            <i className="fas fa-users me-1"></i>
                            <span>เข้าร่วมแล้ว</span>
                          </div>
                          <button
                            className="btn btn-primary btn-sm px-4 rounded-pill"
                            onClick={() => navigate(`/activity/${activity.activity_id}`)}
                          >
                            <i className="fas fa-arrow-right me-2"></i>
                            ดูรายละเอียด
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12">
                  <div className="text-center py-5">
                    <div className="bg-light rounded-circle p-4 d-inline-block mb-3">
                      <i className="fas fa-calendar-times text-muted" style={{ fontSize: '3rem' }}></i>
                    </div>
                    <h5 className="text-muted mb-2">ยังไม่มีกิจกรรมในขณะนี้</h5>
                    <p className="text-muted mb-4">กรุณาตรวจสอบอีกครั้งในภายหลัง หรือเข้าร่วมกิจกรรมใหม่</p>
                    
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced CSS Styles */}
          <style jsx>{`
    .activity-card {
        transition: all 0.3s ease;
        cursor: pointer;
    }
    
    .activity-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 15px 35px rgba(0,0,0,0.1) !important;
    }
    
    .image-overlay {
        transition: all 0.3s ease;
    }
    
    .activity-card:hover .image-overlay {
        background-color: rgba(0,0,0,0.3) !important;
    }
    
    .view-detail-btn {
        transition: all 0.3s ease;
    }
    
    .activity-card:hover .view-detail-btn {
        opacity: 1 !important;
        transform: translateY(0);
    }
    
    .view-detail-btn {
        transform: translateY(10px);
    }
    
    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 1.4;
        max-height: 2.8em;
    }
    
    .line-clamp-3 {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 1.5;
        max-height: 4.5em;
    }
    
    .transition-all {
        transition: all 0.3s ease;
    }
    
    .bg-opacity-0 {
        background-color: rgba(0,0,0,0) !important;
    }
    
    .bg-opacity-10 {
        background-color: rgba(var(--bs-success-rgb), 0.1) !important;
    }
    
    .fw-500 {
        font-weight: 500;
    }
    
    .rounded-3 {
        border-radius: 0.375rem !important;
    }
    
    .rounded-4 {
        border-radius: 0.5rem !important;
    }
    
    .rounded-pill {
        border-radius: 50rem !important;
    }
    
    /* Status Badge Colors */
    .status-upcoming {
        background-color: #ffc107 !important;
        color: #000 !important;
    }
    
    .status-completed {
        background-color: #28a745 !important;
        color: #fff !important;
    }
    
    .status-ongoing {
        background-color: #007bff !important;
        color: #fff !important;
    }
    
    .status-unknown {
        background-color: #6c757d !important;
        color: #fff !important;
    }
    
    .btn-primary {
        background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
        border: none;
        font-weight: 500;
        transition: all 0.3s ease;
    }
    
    .btn-primary:hover {
        background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0,123,255,0.4);
    }
    
    .alert-warning {
        background-color: rgba(255,193,7,0.1) !important;
        border: 1px solid rgba(255,193,7,0.3) !important;
        color: #856404 !important;
    }
    
    .badge {
        font-weight: 500;
        letter-spacing: 0.5px;
    }
    
    .card-footer {
        background-color: rgba(248,249,250,0.8) !important;
    }
    
    .overflow-hidden {
        overflow: hidden;
    }
    
    .opacity-0 {
        opacity: 0 !important;
    }
    
    .fs-5 {
        font-size: 1.25rem !important;
    }
    
    .text-decoration-none {
        text-decoration: none !important;
    }
`}</style>
        </div>
      </div>
    </section>
  );
}

export default PresidentProfileActivity;