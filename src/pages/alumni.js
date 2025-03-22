import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../css/alumni.css'


function Alumni(){

    const alumniData = [
        { name: "นางสาวพัชราพร นิลพงษ์", position: "ผู้พัฒนาเว็บไซต์", image: "/image/person1.jpg" },
        { name: "ชื่อ", position: "ตำแหน่ง", image: "/image/person1.jpg" },
        { name: "ชื่อ", position: "ตำแหน่ง", image: "/image/profile-picture.png" },
        { name: "ชื่อ", position: "ตำแหน่ง", image: "/image/profile-picture.png" },
        { name: "ชื่อ", position: "ตำแหน่ง", image: "/image/profile-picture.png"},
        { name: "ชื่อ", position: "ตำแหน่ง", image: "/image/profile-picture.png" },
    ];

    return(
        <section className="container">
            <div className="alumni-page">
                <h3 className="alumni-title text-center">ทำเนียบศิษย์เก่า</h3> 
                <h5 className="alumni-title">สาขา</h5>
                <div  id="majorCarousel" className="carousel slide" >
                    <div className="carousel-inner my-5">

                        <div className="carousel-item active">
                            <div className="row justify-content-center">
                                <div class="col-md-3">
                                    <a href="/research-detail.html" class="text-decoration-none"> 
                                    <div class="major-card">
                                        <img src="/image/cs.png" alt="CS" class="img-fluid"/>
                                        <div class="major-info">
                                            <h5 class="major-title">วิทยาการคอมพิวเตอร์</h5>
                                        </div>
                                    </div>
                                    </a>
                                </div>

                                <div class="col-md-3">
                                    <a href="/major-detail.html" class="text-decoration-none"> 
                                    <div class="major-card">
                                        <img src="/image/it.jpg" alt="IT" class="img-fluid"/>
                                        <div class="major-info">
                                            <h5 class="major-title">เทคโนโลยีสารสนเทศ</h5>
                                        </div>
                                    </div>
                                    </a>
                                </div>

                                <div class="col-md-3">
                                    <a href="/major-detail.html" class="text-decoration-none"> 
                                    <div class="major-card">
                                        <img src="/image/gis.jpg" alt="GIS" class="img-fluid"/>
                                        <div class="major-info">
                                            <h5 class="major-title">ภูมิสารสนเทศศาสตร์</h5>
                                        </div>
                                    </div>
                                    </a>
                                </div>

                            </div>
                        </div>

                        <div className="carousel-item">
                            <div className="row justify-content-center">
                                <div class="col-md-3">
                                    <a href="/major-detail.html" class="text-decoration-none"> 
                                    <div class="major-card">
                                        <img src="/image/cy.jpeg" alt="CY" class="img-fluid"/>
                                        <div class="major-info">
                                            <h5 class="major-title">ความปลอดภัยไซเบอร์</h5>
                                        </div>
                                    </div>
                                    </a>
                                </div>

                                <div class="col-md-3">
                                    <a href="/major-detail.html" class="text-decoration-none"> 
                                    <div class="major-card">
                                        <img src="/image/ai.jpg" alt="AI" class="img-fluid"/>
                                        <div class="major-info">
                                            <h5 class="major-title">ปัญญาประดิษฐ์</h5>
                                        </div>
                                    </div>
                                    </a>
                                </div>
                            </div>
                        </div>                   
                    </div>
                    <button className="carousel-control-prev" type="button" data-bs-target="#majorCarousel" data-bs-slide="prev">
                        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Previous</span>
                    </button>
                    <button className="carousel-control-next" type="button" data-bs-target="#majorCarousel" data-bs-slide="next">
                        <span className="carousel-control-next-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Next</span>
                    </button>
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