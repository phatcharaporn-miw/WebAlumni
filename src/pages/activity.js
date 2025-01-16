import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "../css/activity.css"
import { SlArrowDown } from "react-icons/sl";
import {  NavLink } from "react-router-dom";

function Activity(){
    return(
        <section className="container">
            <div className="activity-page">
                <h3 className="act-title">กิจกรรม</h3>

            <li className="dropdown">
                <div className="dropbtn-act">กิจกรรม</div>
                <SlArrowDown className="arrow-down"/>
                <div className="dropdown-content">
                <NavLink 
                    to="/activity" 
                    className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}>กำลังดำเนินการ
                </NavLink>
                <NavLink 
                    to="/activity" 
                    className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}>เสร็จสิ้นแล้ว
                </NavLink>
                <NavLink 
                    to="/activity" 
                    className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}>เร็ว ๆ นี้
                </NavLink>
                </div>
            </li>

            <div className="container">
                <div className="row">
                    <div className="col mb-5">
                        <div className="card activity-card" >
                            <div className="image-container">
                                <img src="/image/กิจกรรม1.png" className="card-img-top" alt="กิจกรรม"/>
                                <div class="status-inprogress">กำลังดำเนินการ</div>
                            </div>
                            <div className="card-body">
                                <h5 className="card-title">กิจกรรมร่วมใจปลูกป่าพัฒนาสู่มหาวิทยาลัยสีเขียว</h5>
                                <h6>6 กรกฎาคม 2567</h6>
                                <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                                <a href="#" className="btn btn-primary join-button">เข้าร่วมกิจกรรม</a>
                            </div>
                        </div>
                    </div>
                    <div className="col mb-5">
                        <div className="card activity-card" >
                            <div className="image-container">
                                <img src="/image/กิจกรรม1.png" className="card-img-top" alt="กิจกรรม"/>
                                <div class="status-done">เสร็จสิ้นแล้ว</div>
                            </div>
                            <div className="card-body">
                                <h5 className="card-title">กิจกรรมร่วมใจปลูกป่าพัฒนาสู่มหาวิทยาลัยสีเขียว</h5>
                                <h6>6 กรกฎาคม 2567</h6>
                                <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                                <a href="#" className="btn btn-primary join-button">รายละเอียดเพิ่มเติม</a>
                            </div>
                        </div>
                    </div>
                    <div className="col mb-5">
                        <div className="card activity-card" >
                            <div className="image-container">
                                <img src="/image/กิจกรรม1.png" className="card-img-top" alt="กิจกรรม"/>
                                <div class="status-coming">เร็ว ๆ นี้</div>
                            </div>
                            <div className="card-body">
                                <h5 className="card-title">กิจกรรมร่วมใจปลูกป่าพัฒนาสู่มหาวิทยาลัยสีเขียว</h5>
                                <h6>6 กรกฎาคม 2567</h6>
                                <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                                <a href="#" className="btn btn-primary join-button">รายละเอียดเพิ่มเติม</a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col mb-5">
                        <div className="card activity-card">
                            <div className="image-container">
                                <img src="/image/กิจกรรม2.png" className="card-img-top" alt="กิจกรรม"/>
                                <div class="status-done">เสร็จสิ้นแล้ว</div>
                            </div>
                            <div className="card-body">
                                <h5 className="card-title">กิจกรรมร่วมใจปลูกป่าพัฒนาสู่มหาวิทยาลัยสีเขียว</h5>
                                <h6>6 กรกฎาคม 2567</h6>
                                <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                                <a href="#" className="btn btn-primary join-button">เข้าร่วมกิจกรรม</a>
                            </div>
                        </div>
                    </div>
                    <div className="col mb-5">
                        <div className="card activity-card">
                            <div className="image-container">
                                <img src="/image/กิจกรรม2.png" className="card-img-top" alt="กิจกรรม"/>
                                <div class="status-inprogress">กำลังดำเนินการ</div>
                            </div>
                            <div className="card-body">
                                <h5 className="card-title">กิจกรรมร่วมใจปลูกป่าพัฒนาสู่มหาวิทยาลัยสีเขียว</h5>
                                <h6>6 กรกฎาคม 2567</h6>
                                <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                                <a href="#" className="btn btn-primary join-button">เข้าร่วมกิจกรรม</a>
                            </div>
                        </div>
                    </div>
                    <div className="col mb-5">
                        <div className="card activity-card">
                            <div className="image-container">
                                <img src="/image/กิจกรรม2.png" className="card-img-top" alt="กิจกรรม"/>
                                <div class="status-inprogress">กำลังดำเนินการ</div>
                            </div>
                            <div className="card-body">
                                <h5 className="card-title">กิจกรรมร่วมใจปลูกป่าพัฒนาสู่มหาวิทยาลัยสีเขียว</h5>
                                <h6>6 กรกฎาคม 2567</h6>
                                <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                                <a href="#" className="btn btn-primary join-button">เข้าร่วมกิจกรรม</a>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </section>
        
        
    )
}

export default Activity;