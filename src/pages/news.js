import {useEffect, useState} from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../css/news.css';
import axios from 'axios';
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { MdDateRange, MdEdit, MdDelete } from "react-icons/md";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useNavigate } from "react-router-dom";

function News(){
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

    const backgroundVariants = {
        animate: {
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          transition: { duration: 18, repeat: Infinity, ease: "linear" }
        }
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    const filteredNews = news.filter((item) => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <section className="news-container">
            <img src="./image/banner.jpg" className="head-news" alt="news-image" />
            <h3 className="news">ข่าวประชาสัมพันธ์</h3>
            <div className="py-3 container"> 
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                    {/* <input
                        type="text"
                        className="form-control w-25 w-md-50"
                        placeholder="ค้นหาข่าว..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    /> */}

                     {/* ปุ่มเพิ่มข่าว (role=2) */}
                    {userRole === "2" && (
                    <div className="d-flex justify-content-end mb-3">
                        <Link to="/news/president-create-news" className="btn btn-success">
                        + เพิ่มข่าวใหม่
                        </Link>
                    </div>
                    )}
                </div>

                {/* รายการข่าว */}
                <div className="news-list">                   
                {filteredNews.length === 0 
                    ? <p className="text-center text-muted">ไม่พบข่าวที่ค้นหา</p>
                    : filteredNews.map(item => (
                        <div key={item.news_id} className="position-relative news-page d-flex border rounded p-3 mb-3">
                        {/* เมนูสามจุด (role=2) */}
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
                                    <MdEdit className="me-2 text-warning"/> แก้ไข
                                </button>
                                </li>
                                <li>
                                <button 
                                    className="dropdown-item d-flex align-items-center"
                                    onClick={() => handleDeleteNews(item.news_id)}
                                >
                                    <MdDelete className="me-2 text-danger"/> ลบ
                                </button>
                                </li>
                            </ul>
                            </div>
                        )}

                        <img 
                            src={`http://localhost:3001${item.image_path}`} 
                            alt={item.title} 
                            className="news-image me-3" 
                        />
                        <div className="news-content">
                            <div className="d-flex justify-content-between align-items-start">
                            <Link to={`/news/${item.news_id}`} className="news-title-link">
                                {item.title}
                            </Link>
                            </div>
                            <p className="news-summary">{item.content.substring(0,100)}...</p>
                            <div className="d-flex align-items-center mt-2">
                            <div className="news-meta d-flex align-items-center">
                                <MdDateRange className="me-1"/> 
                                {new Date(item.created_at).toLocaleDateString('th-TH')}
                            </div>
                            <div className="ms-auto">
                                <Link to={`/news/${item.news_id}`} className="read-more text-muted">
                                อ่านเพิ่มเติม
                                </Link>
                            </div>
                            </div>
                        </div>
                        </div>
                    ))
                }
                </div>
            </div>
        </section>
    );
}

export default News;