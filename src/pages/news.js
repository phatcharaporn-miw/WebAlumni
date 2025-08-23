import { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../css/news.css';
import axios from 'axios';
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { MdDateRange, MdEdit, MdDelete } from "react-icons/md";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useNavigate } from "react-router-dom";

function News() {
    const [news, setNews] = useState([]);
    const userRole = localStorage.getItem("userRole");
    const userId = localStorage.getItem("userId");
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        axios.get('http://localhost:3001/news/news-all')
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
                axios.delete(`http://localhost:3001/news/delete-news/${newsId}`, {
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

    // const backgroundVariants = {
    //     animate: {
    //       backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
    //       transition: { duration: 18, repeat: Infinity, ease: "linear" }
    //     }
    // };

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    const filteredNews = news.filter((item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination logic
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // จำนวนข่าวต่อหน้า
    const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
    const paginatedNews = filteredNews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    return (
        <section className="news-container">
            <img src="./image/frequency-wave.jpg" className="head-news w-100" alt="news-image" />
            <h3 className="news text-center">ข่าวประชาสัมพันธ์</h3>

            <div className="py-3 container">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                    {userRole === "2" && (
                        <div className="ms-auto ">
                            <Link to={`/news/president-create-news`} className="text-decoration-none">
                                <button
                                    className="btn btn-gradient d-flex align-items-center gap-2 px-4 py-2 shadow-sm"
                                    style={{
                                        background: 'linear-gradient(45deg, #0d6efd, #4dabf7)',
                                        color: 'white',
                                        fontWeight: '600',
                                        border: 'none',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = 'linear-gradient(45deg, #0a58ca, #339af0)';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(13, 110, 253, 0.3)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = 'linear-gradient(45deg, #0d6efd, #4dabf7)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)โ';
                                    }}
                                >
                                    เพิ่มข่าวประชาสัมพันธ์
                                </button>
                            </Link>
                        </div>
                    )}
                </div>

                <div className="news-list row justify-content-center">
                    {paginatedNews.length === 0 ? (
                        <p className="text-center text-muted">ไม่พบข่าวที่ค้นหา</p>
                    ) : (
                        paginatedNews.map((item) => (
                            <div key={item.news_id} className="col-8 mb-3">
                                <div className="position-relative d-flex flex-column flex-md-row border rounded p-3 h-100">
                                    {userRole === "2" && (
                                        <div className="dropdown position-absolute top-0 end-0 m-2">
                                            <button
                                                className="btn btn-light btn-sm p-1"
                                                type="button"
                                                data-bs-toggle="dropdown"
                                                aria-expanded="false"
                                            >
                                                <BsThreeDotsVertical size={18} />
                                            </button>
                                            <ul className="dropdown-menu dropdown-menu-end">
                                                <li>
                                                    <button
                                                        className="dropdown-item d-flex align-items-center"
                                                        onClick={() => navigate(`/news/edit/${item.news_id}`)}
                                                    >
                                                        <MdEdit className="me-2 text-warning" /> แก้ไข
                                                    </button>
                                                </li>
                                                <li>
                                                    <button
                                                        className="dropdown-item d-flex align-items-center"
                                                        onClick={() => handleDeleteNews(item.news_id)}
                                                    >
                                                        <MdDelete className="me-2 text-danger" /> ลบ
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                    )}

                                    <img
                                        src={`http://localhost:3001${item.image_path}`}
                                        alt={item.title}
                                        className="news-image w-100 w-md-auto me-md-3 mb-3 mb-md-0"
                                    // style={{ maxWidth: "250px", height: "auto", objectFit: "cover" }}
                                    />

                                    <div className="news-content d-flex flex-column">
                                        <Link to={`/news/${item.news_id}`} className="news-title-link h5 mb-2">
                                            {item.title}
                                        </Link>
                                        <p className="news-summary mb-2">{item.content.substring(0, 100)}...</p>
                                        <div className="d-flex align-items-center mt-auto">
                                            <div className="news-meta d-flex align-items-center">
                                                <MdDateRange className="me-1" />
                                                {new Date(item.created_at).toLocaleDateString("th-TH")}
                                            </div>
                                            <div className="ms-auto">
                                                <Link to={`/news/${item.news_id}`} className="read-more text-muted">
                                                    อ่านเพิ่มเติม
                                                </Link>
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
                        <ul className="pagination pagination-lg">
                            <li className={`page-item${currentPage === 1 ? ' disabled' : ''}`}>
                                <button className="page-link" style={{ minWidth: 44 }} onClick={() => handlePageChange(currentPage - 1)}>&laquo;</button>
                            </li>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <li key={i + 1} className={`page-item${currentPage === i + 1 ? ' active' : ''}`}>
                                    <button className="page-link" style={{ minWidth: 44 }} onClick={() => handlePageChange(i + 1)}>{i + 1}</button>
                                </li>
                            ))}
                            <li className={`page-item${currentPage === totalPages ? ' disabled' : ''}`}>
                                <button className="page-link" style={{ minWidth: 44 }} onClick={() => handlePageChange(currentPage + 1)}>&raquo;</button>
                            </li>
                        </ul>
                    </nav>
                )}
            </div>
        </section>
    );
}

export default News;