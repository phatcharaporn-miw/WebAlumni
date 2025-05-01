import React, { useEffect, useState } from "react";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useNavigate } from "react-router-dom";
import { MdEdit, MdDelete } from "react-icons/md";
import { BiSolidComment } from "react-icons/bi";
import { FaEye } from "react-icons/fa";
import "../../css/admin-webboard.css";

function AdminWebboard() {
    const navigate = useNavigate();
    const [webboard, setWebboard] = useState([]);
    const [sortOrder, setSortOrder] = useState("latest");
    const [selectedPost, setSelectedPost] = useState(null);
    const userRole = localStorage.getItem("role");

    // ดึงข้อมูล webboard
    useEffect(() => {
        axios.get('http://localhost:3001/web/webboard', { withCredentials: true })
            .then((response) => {
                if (response.data.success) {
                    setWebboard(response.data.data);
                } else {
                    console.error("เกิดข้อผิดพลาดในการดึงข้อมูลกระทู้:", response.data.message);
                }
            })
            .catch((error) => {
                console.error('เกิดข้อผิดพลาดในการดึงข้อมูลกระทู้:', error.message);
            });
    }, []);

    // เรียงลำดับโพสต์ตามวันที่
    const sortedPosts = [...webboard].sort((a, b) => {
        if (sortOrder === "latest") return new Date(b.created_at) - new Date(a.created_at);
        if (sortOrder === "oldest") return new Date(a.created_at) - new Date(b.created_at);
        return 0;
    });

    // ฟังก์ชันลบกระทู้
    const handleDeletePost = (postId) => {
        if (window.confirm("คุณต้องการลบกระทู้นี้หรือไม่?")) {
            axios.delete(`http://localhost:3001/web/webboard/${postId}`, { 
                withCredentials: true
            })
                .then((response) => {
                    if (response.data.success) {
                        setWebboard(webboard.filter(post => post.webboard_id !== postId));
                        alert("ลบกระทู้สำเร็จ!");

                        if (userRole === "1") {
                            navigate("/admin/webboard");
                        }
                    } else {
                        alert("เกิดข้อผิดพลาดในการลบกระทู้");
                    }
                })
                .catch((error) => {
                    console.error("เกิดข้อผิดพลาดในการลบกระทู้:", error.message);
                });
        }
    };

    return (
        <div className="container mt-4">
            <h3 className="mb-4">การจัดการเว็บบอร์ด</h3>
            <div className="row mb-4">
                <div className="col-md-12">
                    <button className="btn btn-primary" onClick={() => navigate('/admin/webboard/createPost')}>
                        <MdEdit /> สร้างกระทู้ใหม่
                    </button>
                </div>
            </div>

            <div className="row">
                {webboard.length > 0 ? (
                    sortedPosts.map(post => (
                        <div key={post.webboard_id} className="col-md-4 mb-4">
                            <div className="card-webboard shadow-sm border rounded-4">
                                <div className="card-body">
                                    <h5 className="card-title">{post.title}</h5>
                                    <p className="card-text text-muted">
                                        หมวดหมู่: <strong>{post.category_name || "ไม่ระบุหมวดหมู่"}</strong> <br />
                                        จากคุณ {post.full_name || "ไม่ระบุชื่อ"} <br />
                                        วันที่โพสต์: {new Date(post.created_at).toLocaleDateString()}
                                    </p>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span>
                                            <BiSolidComment className="me-2" />
                                            {post.comments_count ?? 0} ความคิดเห็น
                                        </span>
                                        <span>
                                            <FaEye className="me-2" />
                                            {post.viewCount} ครั้ง
                                        </span>
                                    </div>
                                    <div className="mt-3 d-flex justify-content-between">
                                        <button
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={() => navigate(`/admin/webboard/${post.webboard_id}`)}
                                        >
                                            ดูรายละเอียด
                                        </button>
                                        <button
                                            className="btn btn-outline-warning btn-sm"
                                            onClick={() => navigate(`/admin/webboard/edit/${post.webboard_id}`)}
                                        >
                                            แก้ไข
                                        </button>
                                        <button
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() => handleDeletePost(post.webboard_id)}
                                        >
                                            <MdDelete /> ลบ
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="d-flex flex-column align-items-center justify-content-center my-5">
                        <p className="text-center text-muted fs-5">ยังไม่มีกระทู้ในขณะนี้</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminWebboard;