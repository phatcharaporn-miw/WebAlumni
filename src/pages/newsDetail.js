import React, {useEffect, useState} from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import axios from 'axios';
import '../css/news.css';
import { useParams, Link} from "react-router-dom";
import { MdDateRange } from "react-icons/md";

function NewsDetail() {
    const {newsId} = useParams();
    const [news, setNews] = useState(null);
    const [relatedNews, setRelatedNews] = useState([]);

    useEffect(() => {
        axios.get(`http://localhost:3001/news/news-id/${newsId}`)
            .then((response) => {
                if (response.data.success) {
                    setNews(response.data.data);
                }else {
                    setNews(null);
                }
            })
            .catch((error) => {
                console.error("เกิดข้อผิดพลาดในการโหลดข่าว:", error);
            });

             // ดึงข่าวที่เกี่ยวข้อง
        axios.get(`http://localhost:3001/news/related-news/${newsId}`)
        .then((response) => {
            if (response.data.success) {
                setRelatedNews(response.data.data);
            }
        })
        .catch((error) => {
            console.error("เกิดข้อผิดพลาดในการดึงข่าวที่เกี่ยวข้อง:", error);
        });
    }, [newsId]);

    

    if (!news) return <p>ไม่พบข่าว</p>;

    return(
        <section className="container py-3">
            <div className="news-detail">
                <h2 className="news-title">{news.title}</h2>
                <img src={`http://localhost:3001${news.image_path}`} alt={news.title} className="news-imgdetail" />
                <p>{news.content}</p>                
                <p className="news-author">โพสต์โดย: {news.role_posted || "ไม่ทราบชื่อผู้โพสต์"}</p>
                <p className="news-datepost"> <MdDateRange/> {new Date(news.created_at).toLocaleDateString('th-TH')}</p>
            </div>
            {/* ข่าวที่เกี่ยวข้อง */}
            <div className="related-news">
                <h3>ข่าวที่เกี่ยวข้อง</h3>
                <div className="row">
                    {relatedNews.map((related, index) => (
                        <div className="col-md-4" key={index}>
                            <div className="card">
                                <img
                                    src={`http://localhost:3001${related.image_path}`}
                                    alt={related.title}
                                    className="card-img-top"
                                />
                                <div className="card-body">
                                    <h5 className="card-title">{related.title}</h5>
                                    <Link to={`/news/${related.news_id}`} className="btn btn-primary">อ่านเพิ่มเติม</Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    
    )

}

export default NewsDetail;