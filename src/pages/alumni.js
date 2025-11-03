import { useState, useEffect } from "react";
import '../css/alumni.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import {HOSTNAME} from '../config.js';

function Alumni() {
    const [alumniData, setAlumniData] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [hoveredAlumni, setHoveredAlumni] = useState(null);

    const majors = [
        { title: "วิทยาการคอมพิวเตอร์", image: "/image/cs.png", slug: "cs" },
        { title: "เทคโนโลยีสารสนเทศ", image: "/image/it.jpg", slug: "it" },
        { title: "ภูมิสารสนเทศศาสตร์", image: "/image/gis.jpg", slug: "gis" },
        { title: "ความปลอดภัยไซเบอร์", image: "/image/cy.jpeg", slug: "cy" },
        { title: "ปัญญาประดิษฐ์", image: "/image/ai.jpg", slug: "ai" },
    ];

    useEffect(() => {
        axios.get(HOSTNAME +"/alumni/outstanding-alumni")
            .then((res) => {
                setAlumniData(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("ไม่สามารถโหลดศิษย์เก่าดีเด่น:", err);
                setLoading(false);
            });
    }, []);

    const handleAlumniClick = (userId) => {
        navigate(`/alumni/${userId}`);
    };

    return (
        <section className="container">
            <div className="alumni-page">
                <div className="text-center mb-5">
                    <div className="d-inline-block position-relative">
                        <h3 id="head-text" className="text-center mb-3 position-relative">
                            ทำเนียบศิษย์เก่า
                            <div className="title-underline position-absolute start-50 translate-middle-x mt-2"
                                style={{
                                    width: '120px',
                                    height: '4px',
                                    background: 'linear-gradient(90deg, #007bff, #6610f2)',
                                    borderRadius: '2px',
                                    boxShadow: '0 2px 8px rgba(0,123,255,0.3)'
                                }}>
                            </div>
                        </h3>

                        {/* Decorative elements */}
                        <div className="position-absolute top-0 start-0 translate-middle">
                            <div className="bg-primary opacity-25 rounded-circle"
                                style={{ width: '20px', height: '20px' }}>
                            </div>
                        </div>
                        <div className="position-absolute top-0 end-0 translate-middle">
                            <div className="bg-success opacity-25 rounded-circle"
                                style={{ width: '15px', height: '15px' }}>
                            </div>
                        </div>
                    </div>
                </div>
                <h5 className="alumni-title mb-4 fs-3 fw-bold">สาขา</h5>
                <div className="row justify-content-between my-4">
                    {majors.map((major, index) => (
                        <div className="col-sm-6 col-md-6 col-lg-2 mb-4" key={index}>
                            <Link to={`/alumni/major-detail/${major.slug}`} className="text-decoration-none w-100">
                                <div className="major-card text-center">
                                    <img
                                        src={major.image}
                                        alt={major.title}
                                        className="img-fluid"
                                        loading="lazy"
                                    />
                                    <div className="major-info">
                                        <h6 className="major-title">{major.title}</h6>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
                
                <div className="outstanding mb-5">
                    <h5 className="alumni-title mb-4 fs-3 fw-bold">ศิษย์เก่าดีเด่น</h5>

                    {loading ? (
                        <div className="text-center my-5">
                            <div className="spinner-border text-light" role="status" style={{ width: '3rem', height: '3rem' }}>
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="text-white mt-3">กำลังโหลดข้อมูล...</p>
                        </div>
                    ) : (
                        <div className="row mt-5 g-4">
                            {alumniData.map((alumni, index) => (
                                <div
                                    className="col-md-6 mb-4"
                                    key={index}
                                    onClick={() => handleAlumniClick(alumni.user_id)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div
                                        className="d-flex align-items-center p-3"
                                        style={{
                                            ...alumniRowStyles,
                                            transform: hoveredAlumni === index ? 'translateY(-5px) scale(1.02)' : 'translateY(0) scale(1)',
                                            boxShadow: hoveredAlumni === index ? '0 15px 40px rgba(0,0,0,0.2)' : '0 5px 20px rgba(0,0,0,0.1)',
                                            background: hoveredAlumni === index ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                                        }}
                                        onMouseEnter={() => setHoveredAlumni(index)}
                                        onMouseLeave={() => setHoveredAlumni(null)}
                                    >
                                        <div className="position-relative">
                                            <img
                                                src={alumni.image_path
                                                ? HOSTNAME +`/${alumni.image_path}` 
                                                : HOSTNAME +`/uploads/default-profile.png`}
                                                alt={alumni.name}
                                                loading="lazy"
                                                onError={(e) => e.target.src = HOSTNAME +`/uploads/default-profile.png`}
                                                className="img-fluid rounded-circle me-3"
                                                style={{
                                                    width: "90px",
                                                    height: "90px",
                                                    objectFit: "cover",
                                                    border: hoveredAlumni === index ? "3px solid #FFD700" : "3px solid #0F75BC",
                                                    transition: 'all 0.3s ease',
                                                    transform: hoveredAlumni === index ? 'scale(1.1)' : 'scale(1)'
                                                }}
                                            />
                                            
                                        </div>
                                        <div className="flex-grow-1">
                                            <h5 className="mb-2 fw-bold" style={{
                                                color: hoveredAlumni === index ? '#fff' : '#333',
                                                textShadow: hoveredAlumni === index ? '0 2px 4px rgba(0,0,0,0.3)' : 'none'
                                            }}>
                                                {alumni.name}
                                            </h5>
                                            <p className="mb-0" style={{
                                                color: hoveredAlumni === index ? '#f8f9fa' : '#6c757d',
                                                fontSize: '0.9rem'
                                            }}>
                                                {alumni.position || "ไม่มีข้อมูลตำแหน่ง"}
                                            </p>
                                        </div>
                                        {hoveredAlumni === index && (
                                            <div className="ms-auto">
                                                <i className="fas fa-arrow-right text-white" style={{ fontSize: '1.2rem' }}></i>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

const alumniRowStyles = {
    transition: 'all 0.3s ease',
    borderRadius: '15px',
    padding: '20px',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
    border: 'none'
};

export default Alumni;

