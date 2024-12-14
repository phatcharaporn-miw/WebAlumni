import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "../css/home.css"

function Home(){
    return(
        <div className="content">
            <div id="carouselExampleCaptions" className="carousel slide" data-bs-ride="carousel">
            <div className="carousel-indicators">
              <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
              <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="1" aria-label="Slide 2"></button>
              <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="2" aria-label="Slide 3"></button>
            </div>

            <div className="carousel-inner active">
              <div className="carousel-item active">
                <img src="/image/1.png" className="id-block w-100 h-100" alt="slide1" />
              </div>

              <div className="carousel-item">
                <img src="/image/2.jpeg" className="id-block w-100 h-100" alt="slide2" />
              </div>

              <div className="carousel-item">
                <img src="/image/3.jpeg" className="id-block w-100 h-100" alt="slide3" />
              </div>
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
              <div class="col">
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
                <div class="container">
                  <div class="row">

                    <div class="col">
                      <div class="card" id="card-webboard">
                        <div class="card-body">
                          <h5 class="card-title">Card title</h5>
                          <h6 class="card-subtitle mb-2 text-body-secondary">Card subtitle</h6>
                          <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                          <a href="#" class="card-link">Card link</a>
                          <a href="#" class="card-link">Another link</a>
                        </div>
                      </div>
                    </div>
                    <div class="col">
                    <div class="card" id="card-webboard">
                        <div class="card-body">
                          <h5 class="card-title">Card title</h5>
                          <h6 class="card-subtitle mb-2 text-body-secondary">Card subtitle</h6>
                          <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                          <a href="#" class="card-link">Card link</a>
                          <a href="#" class="card-link">Another link</a>
                        </div>
                      </div>
                    </div>
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
                    <div class="row g-0">
                      <div class="col-md-4">
                        <img src="/image/about_cp.jpg" class="img-fluid rounded-start" alt="..."/>
                      </div>
                      <div class="col-md-8">
                        <div class="card-body">
                          <h5 class="card-title">สมาคมศิษย์เก่ามหาวิทยาลัยขอนแก่น</h5>
                          <p class="card-text">   Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                             Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer
                              took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, 
                              but also the leap into electronic typesetting, remaining essentially unchanged</p>
                              <button className="login-btn m-2 ms-5">ประวัติความเป็นมา</button>
                        </div>
                      </div>
                    </div>
                  </div>
            </div>
          </section>
        </div>
        
        
    )
}

export default Home;