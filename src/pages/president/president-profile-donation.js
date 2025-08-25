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

function PresidentProfileDonation() {
    const [profile, setProfile] = useState({});
    const { handleLogout } = useOutletContext();
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



    if (!profile) {
        return <div>ไม่พบข้อมมูลผู้ใช้</div>;
    }

    const handleClick = (path) => {
        navigate(path);
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
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/president-profile")}>โปรไฟล์ของฉัน</div>
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/president-profile/president-manage-orders")}>จัดการคำสั่งซื้อของที่ระลึก</div>
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/president-profile/president-profile-webboard")}>กระทู้ที่สร้าง</div>
                                <div className="menu-item active py-2 mb-2 rounded" onClick={() => handleClick("/president-profile/president-profile-donation")}>ประวัติการบริจาค</div>
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/president-profile/president-profile-activity")}>ประวัติการเข้าร่วมกิจกรรม</div>
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
                                            <h4 className="fw-bold mb-1">ประวัติการบริจาค</h4>
                                            <p className="text-muted mb-0 small">รวบรวมโครงการที่คุณบริจาคทั้งหมด</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Activities Grid */}
                            <div className="row g-4">

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
    
    /* Enhanced Button Styles */
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

export default PresidentProfileDonation;