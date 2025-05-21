import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useOutletContext } from "react-router-dom";
import { useNavigate, useLocation} from 'react-router-dom';
import { SlHeart } from "react-icons/sl";
import { MdDelete } from "react-icons/md";
import { BiSolidComment } from "react-icons/bi";
import { FaEye } from "react-icons/fa";
import { IoMdCreate } from "react-icons/io";
import Swal from "sweetalert2";
// css
import '../../css/profile.css';
// bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function StudentProfileWebboard() {
    const [webboard, setWebboard] = useState([]);
    const [profile, setProfile] = useState({});
    const { handleLogout } = useOutletContext();
    const [sortOrder, setSortOrder] = useState("latest");
    const navigate = useNavigate();
    const location = useLocation();

    // ดึงข้อมูลโปรไฟล์
    useEffect(() => {
        axios.get('http://localhost:3001/users/profile', { withCredentials: true })
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
        if (profile && profile.userId) {
            axios.get(`http://localhost:3001/users/webboard-user/${profile.userId}`, {
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
    }, [profile]);

    // เรียงลำดับโพสต์ตามวันที่
    const sortedPosts = [...webboard].sort((a, b) => {
        if (sortOrder === "latest") return new Date(b.created_at) - new Date(a.created_at);
        if (sortOrder === "oldest") return new Date(a.created_at) - new Date(b.created_at);
        return 0;
    });

    const handleEdit = (webboardId) => {
        navigate(`/alumni-profile/alumni-profile-webboard/edit-webboard/${webboardId}`);
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
                    .delete(`http://localhost:3001/users/delete-webboard/${webboardId}`, {
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

    return (
        <section className='container'>
            <div className='alumni-profile-page'>
                {/* <h3 className="alumni-title text-center mb-4">กระทู้ที่สร้าง</h3> */}
                <div className="row justify-content-between">
                    <div className="col-12 col-md-4 bg-light rounded text-center p-4 my-4">
                        <div className="profile-pic-container mb-3">
                            <img 
                            src={`${profile.profilePicture}`} 
                            alt="Profile" 
                            style={{ width: '140px', height: '140px', borderRadius: '50%' }}
                            className="img-fluid"
                            />
                        </div>

                        <p className="fw-bold mb-3">{profile.fullName}</p>
                        
                        <div className="menu">
                            <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick('/student-profile')}>
                            ข้อมูลส่วนตัว
                            </div>
                            <div className="menu-item active py-2 mb-2 rounded" onClick={() => handleClick('/student-profile/student-profile-webboard')}>
                            กระทู้ที่สร้าง
                            </div>
                            <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick('/student-profile/donation-history')}>
                            ประวัติการบริจาค
                            </div>
                            <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick('/student-profile/student-profile-activity')}>
                            ประวัติการเข้าร่วมกิจกรรม
                            </div>
                            <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick('/student-profile/student-profile-souvenir')}>
                            ประวัติการสั่งซื้อ
                            </div>
                            <div className="menu-item py-2 rounded" onClick={handleLogout}>
                            ออกจากระบบ
                            </div>
                        </div>
                    </div>
                    <div className="col-8 mt-4">
                        <div className="row">
                            {webboard.length > 0 ? (
                                sortedPosts.map(post => (
                                    <div key={post.webboard_id} className="col-md-6 col-lg-6 mb-4">
                                        <div className="card shadow-sm p-3 border rounded-4">
                                            <div className="d-flex justify-content-between">
                                                <span className="badge px-3 py-2" style={{ backgroundColor: getCategoryColor(post?.category_id || 0), color: "white" }}>
                                                    {post.category_name || "ไม่มีหมวดหมู่"}
                                                </span>
                                                <div>
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
                                            <div className="card-body">
                                                <h5 className="card-title">{post.title}</h5>
                                                <p className="card-text">
                                                    {post.content.length > 100 ? post.content.substring(0, 100) + "..." : post.content}
                                                </p>
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span><BiSolidComment /> {post.comments_count || 0} ความคิดเห็น</span>
                                                <span><FaEye /> {post.viewCount || 0} ครั้ง</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center w-100 py-5">
                                    <h5 className="mt-3 text-muted">ยังไม่มีกระทู้ที่คุณสร้าง</h5>
                                    <p className="text-secondary">เริ่มต้นสร้างกระทู้แรกของคุณได้เลย!</p>
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