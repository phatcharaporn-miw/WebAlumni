import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { MdDelete } from "react-icons/md";
// import { BiSolidComment } from "react-icons/bi";
// import { FaEye } from "react-icons/fa";
import { IoMdCreate } from "react-icons/io";
import Swal from "sweetalert2";
import { useAuth } from '../../context/AuthContext';
import {HOSTNAME} from '../../config.js';
import '../../css/profile.css';
// bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function StudentProfileWebboard() {
    const [webboard, setWebboard] = useState([]);
    const [profile, setProfile] = useState({});
    // const { handleLogout } = useOutletContext();
    const [sortOrder, setSortOrder] = useState("latest");
    const [previewImage, setPreviewImage] = useState(null);
    const { user, handleLogout } = useAuth();
    const userId = user?.user_id;
    const navigate = useNavigate();
    const location = useLocation();

    // ดึงข้อมูลโปรไฟล์
    useEffect(() => {
        axios.get(HOSTNAME +'/users/profile', { withCredentials: true })
            .then((response) => {
                if (response.data.success) {
                    setProfile(response.data.user);
                }
            })
            .catch((error) => {
                console.error('เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์:', error.response ? error.response.data.message : error.message);
            });
    }, []);

    // ดึงกระทู้ที่ผู้ใช้เคยสร้าง
    useEffect(() => {
        if (userId) {
            axios.get(HOSTNAME +`/users/webboard-user/${profile.userId}`, {
                withCredentials: true
            })
                .then((response) => {
                    if (response.data.success) {
                        setWebboard(response.data.data);
                    }
                })
                .catch((error) => {
                    console.error('เกิดข้อผิดพลาดในการดึงกระทู้ที่สร้าง:', error.response ? error.response.data.message : error.message);
                });
        }
    }, [userId]);

    // เรียงลำดับโพสต์ตามวันที่
    const sortedPosts = [...webboard].sort((a, b) => {
        if (sortOrder === "latest") return new Date(b.created_at) - new Date(a.created_at);
        if (sortOrder === "oldest") return new Date(a.created_at) - new Date(b.created_at);
        return 0;
    });

    const handleEdit = (webboardId) => {
        navigate(`/student-profile/student-profile-webboard/edit-webboard/${webboardId}`);
    };

    const handleDelete = (webboardId) => {
        Swal.fire({
            title: "คุณแน่ใจหรือไม่?",
            text: "คุณต้องการลบกระทู้นี้ใช่หรือไม่?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "ลบ",
            cancelButtonColor: "#0F75BC",
            cancelButtonText: "ยกเลิก",
        }).then((result) => {
            if (result.isConfirmed) {
                axios
                    .delete(HOSTNAME +`/users/delete-webboard/${webboardId}`, {
                        withCredentials: true,
                    })
                    .then((response) => {
                        Swal.fire("ลบสำเร็จ!", "กระทู้ของคุณถูกลบแล้ว", "success");
                        setWebboard(webboard.filter((post) => post.webboard_id !== webboardId)); // อัปเดต state
                    })
                    .catch((error) => {
                        Swal.fire("เกิดข้อผิดพลาด!", "ไม่สามารถลบกระทู้ได้", "error");
                        console.error("เกิดข้อผิดพลาดในการลบ:", error);
                    });
            }
        });
    };

    // กำหนดสีหมวดหมู่
    const getCategoryColor = (categoryId) => {
        const id = Number(categoryId); // แปลงเป็นตัวเลข
        const hue = (id * 137) % 360;
        return `hsl(${hue}, 70%, 60%)`;
    };

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
            const res = await axios.post(HOSTNAME +"/users/update-profile-image", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }, {
                withCredentials: true
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
                    <div className="col-12 col-lg-3 col-md-4  mb-4">
                        <div className="bg-white rounded-4 shadow-sm text-center p-4">
                            <img
                                src={previewImage || profile.profilePicture}
                                alt="Profile"
                                style={{ width: "130px", height: "130px", borderRadius: "50%", objectFit: "cover", marginBottom: 16 }}
                                className="img-fluid"
                            />
                            <div className="mt-2">
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
                            <hr />
                            <div className="menu d-block mt-4">
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/student-profile")}>โปรไฟล์ของฉัน</div>
                                {/* <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/student-profile/student-request")}>คำร้องขอ</div>
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/student-profile/student-manage-orders")}>จัดการคำสั่งซื้อของที่ระลึก</div> */}
                                <div className="menu-item active py-2 mb-2 rounded" onClick={() => handleClick("/student-profile/student-profile-webboard")}>กระทู้ที่สร้าง</div>
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/student-profile/student-profile-donation")}>ประวัติการบริจาค</div>
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/student-profile/student-profile-activity")}>ประวัติการเข้าร่วมกิจกรรม</div>
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/student-profile/student-profile-souvenir")}>ประวัติการสั่งซื้อของที่ระลึก</div>
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
                                        <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                                            <i className="fas fa-comment-dots text-primary fs-5"></i>
                                        </div>
                                        <div>
                                            <h4 className="fw-bold mb-1">กระทู้ที่คุณสร้าง</h4>
                                            <p className="text-muted mb-0 small">รวบรวมกระทู้ที่คุณเขียนไว้ทั้งหมด</p>
                                        </div>
                                    </div>
                                    {webboard.length > 0 && (
                                        <div className="d-flex align-items-center">
                                            <span className="badge bg-primary text-white px-3 py-2 rounded-pill">
                                                {webboard.length} กระทู้
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Posts Grid */}
                            <div className="row g-4">
                                {webboard.length > 0 ? (
                                    sortedPosts.map(post => (
                                        <div key={post.webboard_id} className="col-md-6 col-lg-6">
                                            <div className="card shadow-sm border-0 rounded-4 h-100 d-flex flex-column post-card">
                                                {/* Category Badge and Actions */}
                                                <div className="d-flex justify-content-between align-items-center p-3 pb-2">
                                                    <span className="badge px-3 py-2 rounded-pill"
                                                        style={{ backgroundColor: getCategoryColor(post?.category_id || 0), color: "white" }}>
                                                        {post.category_name || "ไม่มีหมวดหมู่"}
                                                    </span>
                                                    <div className="action-buttons">
                                                        <IoMdCreate
                                                            className="fs-5 text-primary me-2"
                                                            style={{ cursor: "pointer" }}
                                                            onClick={() => handleEdit(post.webboard_id)}
                                                        />
                                                        <MdDelete
                                                            className="fs-5 text-danger"
                                                            style={{ cursor: "pointer" }}
                                                            onClick={() => handleDelete(post.webboard_id)}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Post Content */}
                                                <div className="card-body p-3 pt-0 flex-grow-1">
                                                    <h5 className="card-title mb-2 fw-bold text-dark line-clamp-2">{post.title}</h5>
                                                    <p className="card-text text-muted line-clamp-3 mb-3" style={{ minHeight: 'auto' }}>
                                                        {post.content.length > 100 ? post.content.substring(0, 100) + "..." : post.content}
                                                    </p>
                                                </div>

                                                {/* Post Stats */}
                                                <div className="card-footer bg-light border-0 p-3">
                                                    <div className="d-flex justify-content-between align-items-center small text-muted">
                                                        <div className="d-flex align-items-center">
                                                            <i className="fas fa-comment me-1 text-primary"></i>
                                                            <span className="me-3">{post.comments_count || 0} ความคิดเห็น</span>
                                                        </div>
                                                        <div className="d-flex align-items-center">
                                                            <i className="fas fa-eye me-1 text-success"></i>
                                                            <span>{post.viewCount || 0} ครั้ง</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-12">
                                        <div className="text-center py-5">
                                            <div className="bg-light rounded-circle p-4 d-inline-block mb-3">
                                                <i className="fas fa-comment-slash text-muted" style={{ fontSize: '3rem' }}></i>
                                            </div>
                                            <h5 className="text-muted mb-2">ยังไม่มีกระทู้ที่คุณสร้าง</h5>
                                            <p className="text-muted mb-4">เริ่มต้นสร้างกระทู้แรกของคุณได้เลย!</p>
                                            <button className="btn btn-primary rounded-pill px-4 py-2"
                                                onClick={() => navigate('/createPost')}>
                                                <i className="fas fa-plus me-2"></i> สร้างกระทู้ใหม่
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default StudentProfileWebboard;