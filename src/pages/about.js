import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "../css/about.css"
// import axios from "axios";
import { IoMdPin } from "react-icons/io";
import { IoMdCall } from "react-icons/io";
import { MdEmail } from "react-icons/md";

function About(){
    
    return(
        <section className="container">
          <div className="about-page">
          <h3 id="head-text" className="text-center mb-4">เกี่ยวกับสมาคม</h3>
        <div className="card shadow-lg border-0 text-center">
          <img
            src="/image/about_cp.jpg"
            className="img-fluid rounded-top w-100"
            alt="ภาพสมาคม"
            style={{ maxHeight: "400px", objectFit: "cover" }}
          />
          <div className="card-body">
            <h4 className="card-title fw-bold text-primary">
              สมาคมศิษย์เก่าวิทยาลัยการคอมพิวเตอร์ มหาวิทยาลัยขอนแก่น
            </h4>
            <p className="card-text text-muted">
              สมาคมศิษย์เก่ามหาวิทยาลัยขอนแก่นก่อตั้งขึ้นเพื่อเสริมสร้างเครือข่ายและความร่วมมือระหว่างศิษย์เก่า
              ศิษย์ปัจจุบัน และคณาจารย์ รวมถึงสนับสนุนการพัฒนาด้านเทคโนโลยีสารสนเทศ
              ส่งเสริมโอกาสทางอาชีพ และให้การสนับสนุนแก่ศิษย์ปัจจุบันในการศึกษาวิจัยและนวัตกรรม
            </p>

            <h5 className="mt-4 text-dark fw-bold">วิสัยทัศน์</h5>
            <p className="text-secondary">
              <b>"เชื่อมโยงศิษย์เก่า ก้าวทันเทคโนโลยี สนับสนุนสังคมดิจิทัล"</b>
            </p>

            <h5 className="mt-4 text-dark fw-bold">พันธกิจของสมาคม</h5>
            <ul className="list-group list-group-flush text-start">
              <li className="list-group-item">สร้างเครือข่ายศิษย์เก่าเพื่อส่งเสริมความร่วมมือด้านอาชีพ</li>
              <li className="list-group-item">สนับสนุนกิจกรรมวิชาการและการวิจัยทางคอมพิวเตอร์</li>
              <li className="list-group-item">ส่งเสริมโอกาสด้านอาชีพและการประกอบธุรกิจของศิษย์เก่า</li>
              <li className="list-group-item">ให้ทุนสนับสนุนการศึกษาและพัฒนาศิษย์ปัจจุบัน</li>
              <li className="list-group-item">จัดกิจกรรมพิเศษ เช่น งานคืนสู่เหย้า และ Tech Talk</li>
            </ul>
          </div>
        </div>

            {/* ส่วนของบุคลกรที่เกี่ยวข้อง */}
            <h3 className="about-title">บุคลากรที่เกี่ยวข้อง</h3>
                <div className="container text-center">
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
                </div>

                <div className="row" id="person-card">
                    <div className="col-sm-6 col-md-4 col-lg-3 mb-4">
                    <div className="card">
                            <img src="/image/profile-picture.png" className="card-img-top" alt="บุคลากร" />
                            <div className="card-body">
                                <h5 className="card-title">ชื่อ</h5>
                                <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6 col-md-4 col-lg-3 mb-4">
                    <div className="card">
                            <img src="/image/profile-picture.png" className="card-img-top" alt="บุคลากร" />
                            <div className="card-body">
                                <h5 className="card-title">ชื่อ</h5>
                                <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6 col-md-4 col-lg-3 mb-4">
                    <div className="card">
                            <img src="/image/profile-picture.png" className="card-img-top" alt="บุคลากร" />
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
              <div className="container">
                  <div className="row mb-5">
                    <div className="col">
                        <div className="contact-info">
                        <div className="contact-item phone">
                          <IoMdCall className="contact-icon" /> 
                          <div>
                            <p>เบอร์โทร</p>
                            <p>044-870000</p>
                          </div>
                        </div>

                        <div className="contact-item email">
                          <MdEmail className="contact-icon" /> 
                          <div>
                            <p>อีเมล</p>
                            <p>alumnicomputing@gmail.com</p>
                          </div>
                        </div>

                        <div className="contact-item address">
                          <IoMdPin className="contact-icon" /> 
                          <div>
                            <p>ที่อยู่</p>
                            <p>วิทยาลัยการคอมพิวเตอร์</p>
                            <p>123 ถ.มิตรภาพ ต.ในเมือง</p>
                            <p>อ.เมือง จ.ขอนแก่น 40002</p>
                          </div>
                        </div>
                        </div>
                    </div>
                    <div className="col">
                      <div className="map-container">
                          <iframe 
                          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30607.44894393471!2d102.81615358599814!3d16.47902518541837!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31228b8217d082cb%3A0xb58fd61bc8e85e11!2sCollege%20of%20Computing%20Khon%20Kaen%20University!5e0!3m2!1sen!2sth!4v1736759203949!5m2!1sen!2sth">
                          </iframe>
                      </div>
                    </div>
                  </div>                
              </div>
          </div>
        </section>        
    )
}

export default About;