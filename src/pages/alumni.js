import { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/alumni.css';
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

function Alumni() {
    const [alumniData, setAlumniData] = useState([]);
    const navigate = useNavigate();
    const majors = [
        { title: "วิทยาการคอมพิวเตอร์", image: "/image/cs.png", slug: "cs" },
        { title: "เทคโนโลยีสารสนเทศ", image: "/image/it.jpg", slug: "it" },
        { title: "ภูมิสารสนเทศศาสตร์", image: "/image/gis.jpg", slug: "gis" },
        { title: "ความปลอดภัยไซเบอร์", image: "/image/cy.jpeg", slug: "cy" },
        { title: "ปัญญาประดิษฐ์", image: "/image/ai.jpg", slug: "ai" },
    ];

    
    // ข้อมูลศิษย์เก่าดีเด่น
    useEffect(() => {
        axios.get("http://localhost:3001/alumni/outstanding-alumni")
            .then((res) => setAlumniData(res.data))
            .catch((err) => console.error("ไม่สามารถโหลดศิษย์เก่าดีเด่น:", err));
    }, []);

    const handleAlumniClick = (userId) => {
        navigate(`/alumni/${userId}`);
    };

    return (
        <section className="container">
            <div className="alumni-page">
                <h3 className="alumni-title text-center">ทำเนียบศิษย์เก่า</h3>
                <h5 className="alumni-title">สาขา</h5>
                <div className="row justify-content-between my-4">
                    {majors.map((major, index) => (
                        <div className="col-6 col-sm-4 col-md-3 col-lg-2 mb-4" key={index}>
                            <Link to={`/alumni/major-detail/${major.slug}`} className="text-decoration-none w-100">
                                <div className="major-card text-center">
                                    <img src={major.image} alt={major.title} className="img-fluid" />
                                    <div className="major-info">
                                        <h6 className="major-title">{major.title}</h6>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>

                <h5 className="alumni-title">ศิษย์เก่าผู้มีคุณูปการ</h5>
                <div className="person text-center my-5">
                    <div className="row" id="person-card">
                        <div className="col-sm-6 col-md-4 col-lg-3 mb-4">
                            <div className="card">
                                <img src="/image/profile-picture.png" className="card-img-top" alt="บุคลากร" />
                                <div className="card-body">
                                    <h5 className="card-title">นางสาวพัชราพร นิลพงษ์</h5>
                                    <p className="card-text">นายกสมาคมศิษย์เก่าวิทยาลัยการคอมพิวเตอร์</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6 col-md-4 col-lg-3 mb-4">
                            <div className="card">
                                <img src="/image/profile-picture.png" className="card-img-top" alt="บุคลากร" />
                                <div className="card-body">
                                    <h5 className="card-title">นางสาวพัชราพร นิลพงษ์</h5>
                                    <p className="card-text">นายกสมาคมศิษย์เก่าวิทยาลัยการคอมพิวเตอร์</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* <h5 className="alumni-title">ศิษย์เก่าผู้มีคุณูปการ</h5>
                    <div className="row justify-content-center mb-5">
                        {honorAlumni.map((person, index) => (
                            <div className="col-sm-6 col-md-4 col-lg-3 mb-4" key={index}>
                            <div className="card shadow-sm border-0 rounded-4 text-center p-3 bg-light">
                                <img
                                src={person.image || '/image/profile-picture.png'}
                                className="rounded-circle mx-auto mb-3"
                                alt={person.name}
                                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                />
                                <div className="card-body">
                                <h6 className="fw-bold">{person.name}</h6>
                                <p className="text-muted small">{person.position}</p>
                                </div>
                            </div>
                            </div>
                        ))}
                    </div> */}

                <div className="outstanding my-5">
                    <h5 className="alumni-title">ศิษย์เก่าดีเด่น</h5>
                    <div className="row mt-5">
                        
                        {alumniData.map((alumni, index) => (
                                <div
                                    className="col-md-6 mb-4"
                                    key={index}
                                    onClick={() => handleAlumniClick(alumni.user_id)} // คลิกแล้วไปหน้าโปรไฟล์
                                    style={{ cursor: 'pointer' }}
                                >
                                <div className="d-flex align-items-center" id="alumni-row">
                                    <img
                                        src={alumni.image_path ? `http://localhost:3001/${alumni.image_path}` : "/default-profile-pic.jpg"}
                                        alt={alumni.name}
                                        className="img-fluid rounded-circle me-3"
                                        style={{ width: "80px", height: "80px", objectFit: "cover", border: "2px solid #0F75BC"}}
                                    />
                                    <div>
                                        <h5 className="mb-1">{alumni.name}</h5>
                                        <p className="mb-0 text-muted">{alumni.position || "ไม่มีข้อมูลตำแหน่ง"}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Alumni;
