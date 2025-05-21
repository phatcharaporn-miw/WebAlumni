import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { MdDateRange } from 'react-icons/md';
import '../../css/news-detail.css';
import Modal from 'react-modal';

Modal.setAppElement('#root');

function AdminNewsDetail() {
    const { newsId } = useParams();
    const [news, setNews] = useState(null);
    const [relatedNews, setRelatedNews] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);

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
                {Array.isArray(news.images) && news.images.length > 0 ? (
                    <div className="main-image mb-4">
                        <img
                            src={`http://localhost:3001${selectedImage || news.images[0]}`}
                            alt="main"
                            style={{ width: "100%", height: "450px", borderRadius: 10, objectFit: "cover", transition: "0.2s" }}
                        />
                    </div>
                ) : (
                    <img
                        src={`http://localhost:3001${news.image_path}`}
                        alt={news.title}
                        className="newsd-image mb-4"
                    />
                )}

                {/* อัลบั้มภาพ (thumbnail) */}
                {Array.isArray(news.images) && news.images.length > 1 && (
                    <div>
                        <h5 className="mb-3 text-center">อัลบั้มภาพ</h5>
                        <div className="album-gallery d-flex flex-wrap gap-3 justify-content-center">
                            {news.images.map((img, idx) => (
                                <img
                                    key={idx}
                                    src={`http://localhost:3001${img}`}
                                    alt={`album-${idx}`}
                                    style={{
                                        width: 120,
                                        height: 80,
                                        objectFit: "cover",
                                        borderRadius: 8,
                                        cursor: "pointer",
                                        border: selectedImage === img ? "3px solid #1A8DDD" : "2px solid #eee",
                                        boxShadow: selectedImage === img ? "0 2px 8px rgba(26,141,221,0.15)" : "0 2px 8px rgba(0,0,0,0.08)",
                                        transition: "0.2s"
                                    }}
                                    onClick={() => setSelectedImage(img)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Modal แสดงภาพใหญ่เมื่อคลิก */}
                {selectedImage && (
                    <div
                        className="modal fade show"
                        style={{
                            display: "block",
                            background: "rgba(0,0,0,0.7)",
                            position: "fixed",
                            top: 0, left: 0, right: 0, bottom: 0,
                            zIndex: 2000
                        }}
                        onClick={() => setSelectedImage(null)}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                height: "100%",
                            }}
                        >
                            <img
                                src={`http://localhost:3001${selectedImage}`}
                                alt="large"
                                style={{
                                    maxWidth: "90vw",
                                    maxHeight: "80vh",
                                    borderRadius: 12,
                                    boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
                                    background: "#fff"
                                }}
                                onClick={e => e.stopPropagation()}
                            />
                        </div>
                    </div>
                )}

                <div className="newsd-meta mt-3">
                    <p>โพสต์โดย: <strong>{news.role_posted || "ไม่ทราบชื่อผู้โพสต์"}</strong></p>
                    <p><MdDateRange /> {new Date(news.created_at).toLocaleDateString('th-TH')}</p>
                </div>

                <p className="newsd-content">{news.content}</p>
            </div>
        </section>
    );
}

export default AdminNewsDetail;
