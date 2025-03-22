import React, { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "../css/about.css"
// import axios from "axios";
import { IoMdPin } from "react-icons/io";
import { IoMdCall } from "react-icons/io";
import { MdEmail } from "react-icons/md";

function About(){
    // const [profile, setProfile] = useState([]);

    // useEffect(()=>{
    //     const fetchProfile = async () => {
    //         try {
    //             const response = await axios.get("http://localhost:3001/show/about");
    //             if (response.data.success) {
    //               setProfile(response.data.data);
    //             }else{
    //                 console.error("fial to fetch user:", response.data.message);
    //             }
    //         } catch (error) {
    //             console.error("Error fetching users:", error);
    //         }
    //     };
    //     fetchProfile();
    // }, []);

    // return(
    //   <section className="container">
    //     <div className="about-page">
    //     <h3 className="about-title">ประวัติความเป็นมา</h3>
    //   <ul>
    //     {profile.map((profile) => (
    //       <li key={profile.id}>
    //         {profile.title},
    //         {profile.full_name},
    //         {profile.address},
    //         {profile.email},
           
    //       </li>
    //     ))}
    //   </ul>
    // </div>
    //   </section>
        
    // );
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
                            <img src="" className="card-img-top" alt="บุคลากร" />
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
                            <img src="" className="card-img-top" alt="บุคลากร" />
                            <div className="card-body">
                                <h5 className="card-title">ชื่อ</h5>
                                <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6 col-md-4 col-lg-3 mb-4">
                    <div className="card">
                            <img src="" className="card-img-top" alt="บุคลากร" />
                            <div className="card-body">
                                <h5 className="card-title">ชื่อ</h5>
                                <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6 col-md-4 col-lg-3 mb-4">
                    <div className="card">
                            <img src="" className="card-img-top" alt="บุคลากร" />
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
              <div class="container">
                  <div class="row mb-5">
                    <div class="col">
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
                    <div class="col">
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