import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "../css/about.css"

function About(){
    return(
        <section className="container">
            <div className="about-page">
            <h3 className="about-title">ประวัติความเป็นมา</h3>
            <div class="card mb-3">
                <div class="row g-0">
                    <div class="col-md-4">
                    <img src="/image/about_cp.jpg" class="img-fluid rounded-start" alt="..."/>
                    </div>
                    <div class="col">
                        <div class="card-body">
                          <h5 class="card-title">สมาคมศิษย์เก่ามหาวิทยาลัยขอนแก่น</h5>
                          <p class="card-text">   Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                             Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer
                              took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, 
                              but also the leap into electronic typesetting, remaining essentially unchanged</p>
                              <button className="login-btn">ประวัติความเป็นมา</button>
                        </div>
                      </div>
                </div>
            </div>

            {/* ส่วนของบุคลกรที่เกี่ยวข้อง */}
            <h3 className="about-title">บุคลากรที่เกี่ยวข้อง</h3>
                <div className="container text-center">
                <div className="row" id="person-card">
                    <div className="col-sm-6 col-md-4 col-lg-3 mb-4">
                        <div className="card">
                            <img src="/image/รูปภาพ.jpg" className="card-img-top" alt="บุคลากร" />
                            <div className="card-body">
                                <h5 className="card-title">นางสาวพัชราพร นิลพงษ์</h5>
                                <p className="card-text">นายกสมาคมศิษย์เก่าวิทยาลัยการคอมพิวเตอร์</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row" id="person-card">
                    <div className="col-sm-6 col-md-4 col-lg-3 mb-4">
                    <div className="card">
                            <img src="/image/person1.jpg" className="card-img-top" alt="บุคลากร" />
                            <div className="card-body">
                                <h5 className="card-title">ชื่อ</h5>
                                <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6 col-md-4 col-lg-3 mb-4">
                    <div className="card">
                            <img src="/image/person1.jpg" className="card-img-top" alt="บุคลากร" />
                            <div className="card-body">
                                <h5 className="card-title">ชื่อ</h5>
                                <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6 col-md-4 col-lg-3 mb-4">
                    <div className="card">
                            <img src="/image/person1.jpg" className="card-img-top" alt="บุคลากร" />
                            <div className="card-body">
                                <h5 className="card-title">ชื่อ</h5>
                                <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                            </div>
                        </div>
                    </div>
                </div>
                </div>

                
            {/* ช่องทางการติดต่อ */}
            <h3 className="about-title">ช่องทางการติดต่อ</h3>
        </div>
        
        </section>
        
        
    )
}

export default About;