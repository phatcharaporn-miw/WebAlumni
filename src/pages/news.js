import React, {useEffect, useState} from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../css/news.css';
import axios from 'axios';
import { FaEye } from "react-icons/fa";
import { Link } from "react-router-dom";
import { MdDateRange } from "react-icons/md";


function News(){
    const [news, setNews] = useState([]);
    
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