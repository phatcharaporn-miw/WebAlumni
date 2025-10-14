import React, { useEffect, useState } from "react";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useNavigate } from "react-router-dom";
import '../../css/admin-news.css';
import { MdDateRange, MdEdit, MdDelete } from "react-icons/md";
import Swal from "sweetalert2";
import {HOSTNAME} from '../../config.js';

function AdminNews() {
    const navigate = useNavigate();
    const [news, setNews] = useState([]);

    // ดึงข้อมูลข่าวประชาสัมพันธ์
    useEffect(() => {
        axios.get(HOSTNAME +'/news/news-all')
            .then((response) => {
                if (response.data.success) {
                    setNews(response.data.data || []);
                }
            })
            .catch((error) => {
                console.error("เกิดข้อผิดพลาดในการโหลดข่าว:", error);
            });
    }, []);

    // ฟังก์ชันลบข่าว
    const handleDeleteNews = (newsId) => {
        Swal.fire({
            title: "คุณแน่ใจหรือไม่?",
            text: "คุณต้องการลบข่าวนี้หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "ลบ",
            cancelButtonText: "ยกเลิก",
        }).then((result) => {
            if (result.isConfirmed) {
                axios.delete(HOSTNAME +`/news/delete-news/${newsId}`, {
                    withCredentials: true
                })
                    .then((response) => {
                        if (response.data.success) {
                            setNews(news.filter(item => item.news_id !== newsId));
                            Swal.fire("ลบสำเร็จ!", "ข่าวถูกลบเรียบร้อยแล้ว", "success");
                        } else {
                            Swal.fire("เกิดข้อผิดพลาด!", "ไม่สามารถลบข่าวได้", "error");
                        }
                    })
                    .catch((error) => {
                        console.error("เกิดข้อผิดพลาดในการลบข่าว:", error.message);
                        Swal.fire("เกิดข้อผิดพลาด!", "ไม่สามารถลบข่าวได้", "error");
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
    const totalPages = Math.ceil(news.length / itemsPerPage);
    const paginatedNews = news.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    return (
        <div className="news-container p-5">
            <h3 className="admin-title">ข่าวสารและประชาสัมพันธ์</h3>
            <div className="row mb-4">
                <div className="col-md-12 text-end">
                    <button className="btn btn-success" onClick={() => navigate("/admin/news/admin-create-news")}>
                        เพิ่มข่าวประชาสัมพันธ์
                    </button>
                </div>
            </div>
            <div className="row">
                {paginatedNews.length === 0 ? (
                    <div className="d-flex flex-column align-items-center justify-content-center my-5">
                        <p className="text-center text-muted fs-5">ยังไม่มีข่าวประชาสัมพันธ์</p>
                    </div>
                ) : (
                    paginatedNews.map((item) => (
                        <div key={item.news_id} className="col-md-4 col-sm-12 mb-4">
                            <div className="card shadow-sm border-15 h-100">
                                <img
                                    src={HOSTNAME +`${item.image_path}`}
                                    alt={item.title}
                                    className="card-img-top"
                                    onError={(e) => e.target.src = '/default-image.png'}
                                    style={{ height: "200px", objectFit: "cover" }}
                                />
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title">{item.title}</h5>
                                    <p className="card-text text-muted">
                                        <MdDateRange className="me-2" />
                                        {formatDate(item.created_at)}
                                    </p>
                                    <p className="news-text flex-grow-1">
                                        {item.content ? item.content.substring(0, 100) + "..." : "ไม่มีเนื้อหา"}
                                    </p>
                                    <div className="d-flex align-items-center gap-2 mt-3">
                                        <button
                                            className="btn btn-primary btn-sm "
                                            onClick={() => navigate(`/admin/news/${item.news_id}`)}
                                        >
                                            รายละเอียดเพิ่มเติม
                                        </button>

                                        <div className="d-flex align-items-center gap-2">
                                            <button
                                                className="btn btn-light rounded-circle p-2 shadow-sm"
                                                style={{ backgroundColor: "#f1f1f1", width: "40px", height: "40px" }}
                                                onClick={() => navigate(`/admin/news/edit/${item.news_id}`)}
                                            >
                                                <MdEdit className="text-warning" size={18} />
                                            </button>

                                            <button
                                                className="btn btn-light rounded-circle p-2 shadow-sm"
                                                style={{ backgroundColor: "#f1f1f1", width: "40px", height: "40px" }}
                                                onClick={() => handleDeleteNews(item.news_id)}
                                            >
                                                <MdDelete className="text-danger" size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
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
        </div>
    );
}

export default AdminNews;