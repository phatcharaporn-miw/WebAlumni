import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { MdDateRange } from 'react-icons/md';
import '../css/news-detail.css'; 

function NewsDetail() {
    const { newsId } = useParams();
    const [news, setNews] = useState(null);
    const [relatedNews, setRelatedNews] = useState([]);

    useEffect(() => {
        axios.get(`http://localhost:3001/news/news-id/${newsId}`)
            .then((res) => {
                if (res.data.success) setNews(res.data.data);
                else setNews(null);
            })
            .catch((err) => console.error("Error loading news:", err));

        axios.get(`http://localhost:3001/news/related-news/${newsId}`)
            .then((res) => {
                if (res.data.success) setRelatedNews(res.data.data);
            })
            .catch((err) => console.error("Error loading related news:", err));
    }, [newsId]);

    if (!news) return <p className="text-center mt-5">ไม่พบข่าว</p>;

    const randomRelatedNews = relatedNews
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

    return (
        <section className="container py-5">
            <div className="newsd-main p-4 shadow-sm rounded">
                <h2 className="newsd-title mb-3 text-center">{news.title}</h2>
                <img
                    src={`http://localhost:3001${news.image_path}`}
                    alt={news.title}
                    className="newsd-image mb-4"
                />
                <p className="newsd-content">{news.content}</p>
                <div className="newsd-meta mt-3">
                    <p>โพสต์โดย: <strong>{news.role_posted || "ไม่ทราบชื่อผู้โพสต์"}</strong></p>
                    <p><MdDateRange /> {new Date(news.created_at).toLocaleDateString('th-TH')}</p>
                </div>
            </div>

            <div className="newsd-related mt-5">
                <h3 className="mb-4">ข่าวอื่น ๆ</h3>
                <div className="row">
                    {randomRelatedNews.map((related, index) => (
                        <div className="col-md-4 col-sm-6 mb-4" key={index}>
                            <div className="newsd-card shadow-sm h-100 rounded">
                                <img
                                    src={`http://localhost:3001${related.image_path}`}
                                    alt={related.title}
                                    className="newsd-card-img"
                                />
                                <div className="p-3">
                                    <h6 className="newsd-card-title">{related.title}</h6>
                                    <p className="news-summary">{related.content.substring(0, 100)}...</p>
                                    <div className="news-meta d-flex align-items-center">
                                        <span className="me-2"><MdDateRange /> {new Date(related.created_at).toLocaleDateString('th-TH')}</span>
                                    </div>
                                    <Link to={`/news/${related.news_id}`} className="btn btn-outline-primary btn-sm mt-2 w-100">
                                        อ่านเพิ่มเติม
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default NewsDetail;
