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
// import moment from "moment";
import { useAuth } from '../../context/AuthContext';

Modal.setAppElement('#root');

function AdminWebboard() {
    const navigate = useNavigate();
    const [webboard, setWebboard] = useState([]);
    const [sortOrder, setSortOrder] = useState("latest");
    const { user } = useAuth();
    const userRole = user?.role; 
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

    const formatDate = (dateStr) => {
        if (!dateStr || dateStr === "0000-00-00") return "ไม่ระบุวันที่";
        const date = new Date(dateStr);
        const day = date.getDate();
        const month = date.getMonth() + 1; // เดือนเป็นเลข
        const year = date.getFullYear() + 543; // ปีไทย
        return `${day}/${month}/${year}`;
    };

    // Pagination logic
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6; // จำนวนกิจกรรมต่อหน้า
    const totalPages = Math.ceil(sortedPosts.length / itemsPerPage);
    const paginatedPosts = sortedPosts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
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
                {paginatedPosts.length > 0 ? (
                    paginatedPosts.map(post => (
                        <div key={post.webboard_id} className="col-md-4 mb-4 d-flex">
                            <div className="card-webboard shadow-sm border w-100 d-flex flex-column">
                                <div className="card-body d-flex flex-column justify-content-between h-100">
                                    <h5 className="card-title">{post.title}</h5>
                                    <p className="card-text text-muted">
                                        หมวดหมู่: <strong>{post.category_name || "ไม่ระบุหมวดหมู่"}</strong> <br />
                                        จากคุณ {post.full_name || "ไม่ระบุชื่อ"} <br />
                                        วันที่โพสต์: {formatDate(post.created_at)} <br />
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

            {/* Pagination */}
            {totalPages > 1 && (
                <nav className="d-flex justify-content-center mt-4">
                    <ul className="pagination">
                        <li className={`page-item${currentPage === 1 ? ' disabled' : ''}`}>
                            <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>&laquo;</button>
                        </li>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <li key={i + 1} className={`page-item${currentPage === i + 1 ? ' active' : ''}`}>
                                <button className="page-link" onClick={() => handlePageChange(i + 1)}>{i + 1}</button>
                            </li>
                        ))}
                        <li className={`page-item${currentPage === totalPages ? ' disabled' : ''}`}>
                            <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>&raquo;</button>
                        </li>
                    </ul>
                </nav>
            )}

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
