import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/alumni.css';
import { Link } from "react-router-dom";

function Alumni() {
    const alumniData = [
        { name: "นางสาวพัชราพร นิลพงษ์", position: "ผู้พัฒนาเว็บไซต์", image: "/image/person1.jpg" },
        { name: "ชื่อ", position: "ตำแหน่ง", image: "/image/person1.jpg" },
        { name: "ชื่อ", position: "ตำแหน่ง", image: "/image/profile-picture.png" },
        { name: "ชื่อ", position: "ตำแหน่ง", image: "/image/profile-picture.png" },
        { name: "ชื่อ", position: "ตำแหน่ง", image: "/image/profile-picture.png" },
        { name: "ชื่อ", position: "ตำแหน่ง", image: "/image/profile-picture.png" },
    ];

    const majors = [
        { title: "วิทยาการคอมพิวเตอร์", image: "/image/cs.png", slug: "cs" },
        { title: "เทคโนโลยีสารสนเทศ", image: "/image/it.jpg", slug: "it" },
        { title: "ภูมิสารสนเทศศาสตร์", image: "/image/gis.jpg", slug: "gis" },
        { title: "ความปลอดภัยไซเบอร์", image: "/image/cy.jpeg", slug: "cy" },
        { title: "ปัญญาประดิษฐ์", image: "/image/ai.jpg", slug: "ai" },
    ];
      

    return (
        <section className="container">
            <div className="alumni-page">
                <h3 className="alumni-title text-center">ทำเนียบศิษย์เก่า</h3>
                <h5 className="alumni-title">สาขา</h5>
                <div className="row justify-content-between my-4">
                    {majors.map((major, index) => (
                        <div className="col-2 mb-4 d-flex justify-content-between" key={index} style={{ width: "20%" }}>
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

                <div className="outstanding my-5">
                    <h5 className="alumni-title">ศิษย์เก่าดีเด่น</h5>
                    <div className="row">
                        {alumniData.map((alumnus, index) => (
                            <div className="col-md-6 mb-4" key={index}>
                                <div className="d-flex align-items-center" id="alumni-row">
                                    <img
                                        src={alumnus.image}
                                        alt={alumnus.name}
                                        className="img-fluid rounded-circle me-3"
                                        style={{ width: "80px", height: "80px", objectFit: "cover" }}
                                    />
                                    <div>
                                        <h5 className="mb-1">{alumnus.name}</h5>
                                        <p className="mb-0 text-muted">{alumnus.position}</p>
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
