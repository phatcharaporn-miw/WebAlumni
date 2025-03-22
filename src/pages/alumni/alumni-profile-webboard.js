import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useOutletContext } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { SlHeart } from "react-icons/sl";
import { MdFavorite } from "react-icons/md";
import { BiSolidComment } from "react-icons/bi";
import { FaEye } from "react-icons/fa";
import { IoMdMore } from "react-icons/io";
import Swal from "sweetalert2";
// css
import '../../css/profile.css';
// bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function AlumniProfileWebboard() {
    const [webboard, setWebboard] = useState([]);
    const [profile, setProfile] = useState({});
    const { handleLogout } = useOutletContext();
    const [sortOrder, setSortOrder] = useState("latest");
    const [likedPosts, setLikedPosts] = useState([]);
    const [isLoggedin, setIsLoggedin] = useState(false);
    const [showMenu, setShowMenu] = useState(null);
    const navigate = useNavigate();

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
        navigate(`/edit-webboard/${webboardId}`);
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
      const id = Number(categoryId);  // แปลงเป็นตัวเลข
      const hue = (id * 137) % 360;
      return `hsl(${hue}, 70%, 60%)`;
    };

    return (
        <section className='container'>
            <div className='alumni-profile-page'>
                <h3 className="alumni-title text-center">กระทู้ที่สร้าง</h3>
                <div className="row justify-content-between">
                    <div className="col-4 bg-light rounded text-center">
                        <img
                            src={`${profile.profilePicture}`}
                            alt="Profile"
                            style={{ width: '140px', height: '140px', borderRadius: '50%' }}
                        />
                        <p className="mt-3 fw-bold">{profile.fullName}</p>
                        <div className="menu mt-4">
                            <div className="menu-item active py-2 mb-2 rounded">ข้อมูลส่วนตัว</div>
                            <div className="menu-item py-2 mb-2 rounded">กระทู้ที่สร้าง</div>
                            <div className="menu-item py-2 mb-2 rounded">ประวัติการบริจาค</div>
                            <div className="menu-item py-2 mb-2 rounded">ประวัติการเข้าร่วมกิจกรรม</div>
                            <div className="menu-item py-2 mb-2 rounded">ประวัติการสั่งซื้อ</div>
                            <div className="menu-item py-2 rounded" onClick={handleLogout}>ออกจากระบบ</div>
                        </div>
                    </div>

                    <div className="col-8">
                        {/* <h3>กระทู้ที่สร้าง</h3> */}
                        <div className="row">
                            {webboard.length > 0 ? (
                                sortedPosts.map(post => (
                                    <div key={post.webboard_id} className="col-md-6 mb-4">
                                        <div className="card shadow-sm p-3 border rounded-4">
                                            <div className="d-flex justify-content-between">
                                                <span className="badge px-3 py-2" style={{ backgroundColor: getCategoryColor(post?.category_id || 0), color: "white", padding: "5px 10px", borderRadius: "6px" , cursor: "pointer"}} >
                                                    {post.category_name || "ไม่มีหมวดหมู่"}
                                                </span>
                                                <span onClick={() => handleDelete(post.webboard_id)} style={{ cursor: "pointer" }}>
                                                    <MdFavorite className="fs-5 text-danger" />
                                                </span>
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
                                <p>ไม่มีโพสต์</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default AlumniProfileWebboard;