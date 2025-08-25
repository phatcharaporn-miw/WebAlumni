import React, { useEffect, useState } from "react";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useNavigate } from "react-router-dom";
import { BiSolidComment } from "react-icons/bi";
import { FaEye } from "react-icons/fa";
import "../../css/admin-webboard.css";
import Swal from "sweetalert2";
import Modal from 'react-modal';
import moment from "moment";

Modal.setAppElement('#root');

function AdminWebboard() {
    const navigate = useNavigate();
    const [webboard, setWebboard] = useState([]);
    const [sortOrder, setSortOrder] = useState("latest");
    const userRole = localStorage.getItem("role");
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [likedUsers, setLikedUsers] = useState([]);
    const [modalPostTitle, setModalPostTitle] = useState("");

    // Function to close the modal
    const closeModal = () => {
        setModalIsOpen(false);
    };

    // Fetching webboard data
    useEffect(() => {
        axios.get('http://localhost:3001/web/webboard', {
            withCredentials: true
        })
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

    // Sorting posts by created date
    const sortedPosts = [...webboard].sort((a, b) => {
        if (sortOrder === "latest") return new Date(b.created_at) - new Date(a.created_at);
        if (sortOrder === "oldest") return new Date(a.created_at) - new Date(b.created_at);
        return 0;
    });

    // Function to delete post
    const handleDeletePost = (postId) => {
        Swal.fire({
            title: "คุณแน่ใจหรือไม่?",
            text: "คุณต้องการลบกระทู้นี้หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "ลบ",
            cancelButtonText: "ยกเลิก",
        }).then((result) => {
            if (result.isConfirmed) {
                axios
                    .delete(`http://localhost:3001/web/webboard/${postId}`, {
                        withCredentials: true,
                    })
                    .then((response) => {
                        if (response.data.success) {
                            setWebboard(webboard.filter((post) => post.webboard_id !== postId));
                            Swal.fire("ลบสำเร็จ!", "กระทู้ถูกลบเรียบร้อยแล้ว", "success");

                            if (userRole === "1") {
                                navigate("/admin/webboard");
                            }
                        } else {
                            Swal.fire("เกิดข้อผิดพลาด!", "ไม่สามารถลบกระทู้ได้", "error");
                        }
                    })
                    .catch((error) => {
                        console.error("เกิดข้อผิดพลาดในการลบกระทู้:", error.message);
                        Swal.fire("เกิดข้อผิดพลาด!", "ไม่สามารถลบกระทู้ได้", "error");
                    });
            }
        });
    };

    return (
        <div className="webboard-container p-5">
            <h3 className="admin-title">การจัดการเว็บบอร์ด</h3>
            <div className="row mb-4">
                <div className="col-md-12 text-end">
                    <button className="btn btn-primary" onClick={() => navigate('/admin/webboard/createPost')}>
                        สร้างกระทู้ใหม่
                    </button>
                </div>
            </div>

            <div className="row">
                {webboard.length > 0 ? (
                    sortedPosts.map(post => (
                        <div key={post.webboard_id} className="col-md-4 mb-4 d-flex">
                            <div className="card-webboard shadow-sm border w-100 d-flex flex-column">
                                <div className="card-body d-flex flex-column justify-content-between h-100">
                                    <h5 className="card-title">{post.title}</h5>
                                    <p className="card-text text-muted">
                                        หมวดหมู่: <strong>{post.category_name || "ไม่ระบุหมวดหมู่"}</strong> <br />
                                        จากคุณ {post.full_name || "ไม่ระบุชื่อ"} <br />
                                        วันที่โพสต์: {new Date(post.created_at).toLocaleDateString()} <br />
                                        {post.liked_users && (
                                            <button
                                                className="btn btn-link btn-sm text-decoration-none "
                                                onClick={() => {
                                                    setLikedUsers(post.liked_users.split(', '));
                                                    setModalPostTitle(post.title);
                                                    setModalIsOpen(true);
                                                }}
                                            >
                                                รายชื่อผู้กดใจในกระทู้: {post.liked_users.split(', ').length} คน
                                            </button>
                                        )}
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
                                            ลบ
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

            {/* Modal สำหรับแสดงรายชื่อผู้กดใจ */}
            <Modal isOpen={modalIsOpen} onRequestClose={closeModal} className="webboard-modal" style={{ overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)' } }}>
                <div className="modal-header">
                    <h5 className="modal-title">รายชื่อผู้กดใจในกระทู้: {modalPostTitle}</h5>
                    <button type="button" className="btn-close ms-auto" onClick={closeModal}></button>
                </div>
                <div className="modal-body py-3">
                    <ul className="list-group">
                        {likedUsers.length > 0 ? (
                            likedUsers.map((name, index) => (
                                <li key={index} className="list-group-item">
                                    {name}
                                </li>
                            ))
                        ) : (
                            <li className="list-group-item">ไม่มีผู้กดใจ</li>
                        )}
                    </ul>
                </div>
            </Modal>
        </div>
    );
}

export default AdminWebboard;
