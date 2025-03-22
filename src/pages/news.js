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
                // console.log("API Response:", response.data); 
                if (response.data.success) {
                    setNews(response.data.data || []);
                }
            })
            .catch((error) => {
                console.error("เกิดข้อผิดพลาดในการโหลดข่าว:", error);
            });
    }, []);

    return(
        
        <section>
            <img src="./image/banner.jpg" className="head-donate" alt="news-image" />
            <h3 className="news">ข่าวประชาสัมพันธ์</h3>
            <div className=" py-3 container">
            {/* <h3 className="news-title">ข่าวประชาสัมพันธ์</h3> */}
                <div className="news-list">
                    {news.length === 0 ? (
                        <p className="text-center">ไม่มีข่าว</p>
                    ) : (
                        news.map((item) => (
                            <div key={item.news_id} className="news-page d-flex border rounded p-3 mb-3">
                                <img src={`http://localhost:3001${item.image_path}`} alt={item.title} className="news-image me-3" onError={(e) => e.target.src = '/default-image.png'}/>
                                <div className="news-content">
                                    <Link to={`/news/${item.news_id}`} className="news-title-link">
                                    {item.title}
                                    </Link>                               
                                    <p className="news-summary">{item.content.substring(0, 100)}...</p>
                                   
                                    <div className="d-flex justify-content-between align-items-center mt-2">
                                        <div className="news-meta d-flex align-items-center">
                                            <span className="me-2"> <MdDateRange /> {new Date(item.created_at).toLocaleDateString('th-TH')}</span>
                                            {/* <span className="news-views me-2 text-primary"><FaEye /> {item.view_count} ครั้ง</span> */}
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
    )
}

export default News;