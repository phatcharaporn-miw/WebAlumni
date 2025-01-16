import React, {useState, useEffect} from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { SlHeart } from "react-icons/sl";


function AlumniHome() {
  const [background, setBackground] = useState("/image/back-2.png");
 
 
     return(
         <div className="content"  style={{ backgroundImage: `url(${background})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
             <div id="carouselExampleCaptions" className="carousel slide" data-bs-ride="carousel">
             <div className="carousel-indicators">
               <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
               <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="1" aria-label="Slide 2"></button>
               {/* <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="2" aria-label="Slide 3"></button> */}
             </div>
 
             <div className="carousel-inner">
               <div className="carousel-item active">
                 <img src="/image/2.jpeg" className="id-block w-100 h-100" alt="slide1" />
               </div>
 
               <div className="carousel-item">
                 <img src="/image/3.jpeg" className="id-block w-100 h-100" alt="slide2" />
               </div>
 
               {/* <div className="carousel-item">
                 <img src="/image/3.jpeg" className="id-block w-100 h-100" alt="slide3" />
               </div> */}
             </div>
 
             <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="prev">
               <span className="carousel-control-prev-icon" aria-hidden="true"></span>
               <span className="visually-hidden">Previous</span>
             </button>
             <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="next">
               <span className="carousel-control-next-icon" aria-hidden="true"></span>
               <span className="visually-hidden">Next</span>
             </button>
           </div>
 
           <section>
           <div className="news-card">
               <h3 id="head-text">ข่าวประชาสัมพันธ์</h3>
               
             <div class="container">
             <div class="row">
               <div class="col ">
                 <div class="card" id="card-news-home">
                   <img src="/image/กิจกรรม1.png" class="card-img-top" alt="..."/>
                   <div class="card-body">
                     <h5 class="card-title">กิจกรรมร่วมใจปลูกป่าพัฒนาสู่มหาวิทยาลัยสีเขียว</h5>
                     <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                     <a href="#" class="btn btn-primary">เข้าร่วมกิจกรรม</a>
                   </div>
                 </div>
               </div>
 
               <div class="col">
                 <div class="card" id="card-news-home">
                 <img src="/image/กิจกรรม1.png" class="card-img-top" alt="..."/>
                   <div class="card-body">
                     <h5 class="card-title">Card title</h5>
                     <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                     <a href="#" class="btn btn-primary">เข้าร่วมกิจกรรม</a>
                   </div>
                 </div>
               </div>
 
               <div class="col">
               <h4 class="news-title">ปฏิทินกิจกรรม</h4>
               <div class="news-item d-flex">
                   <div class="news-date">
                       <span class="day">8</span>
                       <span class="month-year">กันยายน 2567</span>
                   </div>
                   <div class="news-content ms-3">
                       <h5>กิจกรรมที่ 3</h5>
                       <p>Lorem Ipsum is simply dummy text of the printing.</p>
                   </div>
               </div>
 
               <div class="news-item d-flex">
                   <div class="news-date">
                       <span class="day">12</span>
                       <span class="month-year">กันยายน 2567</span>
                   </div>
                   <div class="news-content ms-3">
                       <h5>กิจกรรมที่ 4</h5>
                       <p>Lorem Ipsum is simply dummy text of the printing.</p>
                   </div>
               </div>
 
               <div class="news-item d-flex">
                   <div class="news-date">
                       <span class="day">1</span>
                       <span class="month-year">ตุลาคม 2567</span>
                   </div>
                   <div class="news-content ms-3">
                       <h5>กิจกรรมที่ 5</h5>
                       <p>Lorem Ipsum is simply dummy text of the printing.</p>
                   </div>
               </div>
 
               <div class="news-item d-flex">
                   <div class="news-date">
                       <span class="day">18</span>
                       <span class="month-year">ตุลาคม 2567</span>
                   </div>
                   <div class="news-content ms-3">
                       <h5>กิจกรรมที่ 6</h5>
                       <p>Lorem Ipsum is simply dummy text of the printing.</p>
                   </div>
               </div>
               </div>
               </div>
             
               </div>
             </div>
            
 
             {/* ส่วนของแดชบอร์ด */}
             <div className="home-dashboard">
                 <h3 id="head-text">ภาพรวมกิจกรรมและการบริจาค</h3>
                 
             </div>
             
             {/* ส่วนของเว็บบอร์ด */}
             <div className="home-webboard">
             <h3 id="head-text">เว็บบอร์ด</h3>
             <div className="container">
                 <div className="row ">
                 
                     <div className="col-md-5 mb-4">
                         <div className="card shadow-sm">
                             <div className="d-flex p-3">
                                 <img src="./image/profile-picture.png" alt="User" className="rounded-circle me-3" width="50" height="50" />
                                 <div>
                                     <h5 className="card-title fw-bold mb-1">ประสบการณ์เป็น SA 3 ปี <SlHeart /></h5>
                                     <p className="text-muted mb-1">จากคุณ คอมพิวเตอร์ ไอดี</p>
                                     <p className="text-muted small">5 นาทีที่แล้ว</p>
                                 </div>
                             </div>
                             <div className="card-body">
                                 <p className="card-text text-secondary">
                                     Lorem Ipsum is simply dummy text of the printing and typesetting industry...
                                 </p>
                             </div>
                             <div className="card-footer d-flex justify-content-between">
                                 <div>
                                     <i className="bi bi-chat me-2"></i> 8 ความคิดเห็น
                                 </div>
                                 <div>
                                     <span className="badge bg-success">ประสบการณ์</span>
                                 </div>
                             </div>
                         </div>
                     </div>
 
                   
                     <div className="col-md-5 mb-4">
                         <div className="card shadow-sm">
                             <div className="d-flex p-3">
                                 <img src="./image/profile-picture.png" alt="User" className="rounded-circle me-3" width="50" height="50" />
                                 <div>
                                     <h5 className="card-title fw-bold mb-1">การทำเรซูเม่ในการสมัครงาน <SlHeart /></h5>
                                     
                                     <p className="text-muted mb-1">จากคุณ พัชรพร นิลพงษ์</p>
                                     <p className="text-muted small">4 วันที่แล้ว</p>
                                 </div>
                             </div>
                             <div className="card-body">
                                 <p className="card-text text-secondary">
                                     Lorem Ipsum is simply dummy text of the printing and typesetting industry...
                                 </p>
                             </div>
                             <div className="card-footer d-flex justify-content-between">
                                 <div>
                                     <i className="bi bi-chat me-2"></i> 8 ความคิดเห็น
                                 </div>
                                 <div>
                                     <span className="badge bg-danger">งาน</span>
                                 </div>
                             </div>
                         </div>
                     </div>
                 </div>
 
                 <div className="text">
                     <button className="btn btn-primary">ดูทั้งหมด</button>
                 </div>
             </div>
         </div>
 
             {/* ส่วนของบริจาค */}
             <div className="home-donate">
                 <h3 id="head-text">บริจาค</h3>
                
 
             </div>
 
             {/* ส่วนของสมาคม*/}
             <div className="home-about">
                 <h3 id="head-text">เกี่ยวกับสมาคม</h3>
                   <div class="card mb-3">
                     <div class="row">
                       <div class="col-md-5">
                         <img src="/image/about_cp.jpg" class="img-fluid rounded-start" alt="ภาพสมาคม"/>
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
             </div>
           </section>
         </div>
     )
}

export default AlumniHome;
