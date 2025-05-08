import React, {useEffect, useState} from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../css/news.css';
import axios from 'axios';
import { FaEye } from "react-icons/fa";
import { Link } from "react-router-dom";
import { MdDateRange } from "react-icons/md";
import Swal from "sweetalert2";

function News(){
    const [news, setNews] = useState([]);
    const userRole = localStorage.getItem("userRole");
    const userId = localStorage.getItem("userId");

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

    return (
        <section className="news-container">
            <img src="./image/banner.jpg" className="head-news" alt="news-image" />
            <h3 className="news">ข่าวประชาสัมพันธ์</h3>
            <div className="py-3 container">              
            <div className="news-list">
                {/* {userRole === "2" && (
                    <div className="d-flex justify-content-end mb-3">
                        <Link to="/news/president-create-news" className="btn btn-success">+ เพิ่มข่าวใหม่</Link>
                    </div>
                )} */}
                    {news.length === 0 ? (
                        <div className="d-flex flex-column align-items-center justify-content-center my-5">
                            <p className="text-center text-muted fs-5">ยังไม่มีข่าวประชาสัมพันธ์</p>
                        </div>
                    ) : (
                        news.map((item) => (
                            <div key={item.news_id} className="news-page d-flex border rounded p-3 mb-3">
                                <img src={`http://localhost:3001${item.image_path}`} alt={item.title} className="news-image me-3" />
                                <div className="news-content">
                                    <Link to={`/news/${item.news_id}`} className="news-title-link">
                                        {item.title}
                                    </Link>
                                    <p className="news-summary">{item.content.substring(0, 100)}...</p>
                                    <div className="d-flex justify-content-between align-items-center mt-2">
                                        <div className="news-meta d-flex align-items-center">
                                            <span className="me-2"><MdDateRange /> {new Date(item.created_at).toLocaleDateString('th-TH')}</span>
                                        </div>
                                        <Link to={`/news/${item.news_id}`} className="read-more text-muted">
                                            อ่านเพิ่มเติม
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
    
}

export default News;