import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "../css/home.css";
import '../css/webboard.css';
import Modal from 'react-modal';
import { SlHeart } from "react-icons/sl";
import { MdFavorite } from "react-icons/md";
import { BiSolidComment } from "react-icons/bi";
import { MdEdit } from "react-icons/md";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import moment from "moment";


function Home() {
  const [background, setBackground] = useState("/image/back-2.png");
  const currentAmount = 3000;
  const goalAmount = 10000;
  const progress = (currentAmount / goalAmount) * 100;

  // webboard
  const [webboard, setWebboard] = useState([]);
  const [sortOrder, setSortOrder] = useState("latest");
  const [likedPosts, setLikedPosts] = useState([]); 
  const [commentText, setCommentText] = useState(""); 
  const [selectedPost, setSelectedPost] = useState(null); 
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [category, setCategory] = useState([]);
  const [news, setNews] = useState([]);
  const [activity, setActivity] = useState([]);
  const navigate = useNavigate();


  useEffect(() => {
    const userSession = localStorage.getItem("userId");  
    if (userSession) {
        setIsLoggedin(true);
        console.log("ผู้ใช้ล็อกอินแล้ว");
    } else {
        setIsLoggedin(false);
        console.log("ผู้ใช้ยังไม่ได้ล็อกอิน"); 
    }
  }, []);

  // ข่าวประชาสัมพันธ์
  useEffect(() => {
    // ดึงข้อมูลข่าวประชาสัมพันธ์
    axios.get('http://localhost:3001/news/news-all')
            .then((response) => {
                // console.log("API Response:", response.data); 
                if (response.data.success) {
                    setNews(response.data.data || []);
                }
            })
            .catch((error) => {
                console.error("เกิดข้อผิดพลาดในการโหลดข่าว:", error);
            });
  
    // ดึงข้อมูลกิจกรรมที่กำลังจะจัดขึ้น
    axios.get('http://localhost:3001/activity/all-activity')
    .then(response => {
      setActivity(response.data);
    })
    .catch(error => {
      console.error("Error fetching activities:", error);
    });
  }, []);

  //ดึงข้อมูล webboard
  useEffect(() => {
      axios.get('http://localhost:3001/web/webboard', {
        withCredentials: true, 
      })
        .then((response) => {
          if (response.data.success) {
            
            setWebboard(response.data.data);
          } else {
            console.error("เกิดข้อผิดพลาดในการดึงข้อมูลกระทู้:", response.data.message);
          }
        })
        .catch((error) => {
          console.error('เกิดข้อผิดพลาดในการดึงข้อมูลกระทู้:', error.message);
        });
  }, []);

      //เรียงลำดับโพสต์ตามวันที่
  const sortedPosts = [...webboard].sort((a, b) => {
      if (sortOrder === "latest") return new Date(b.created_at) - new Date(a.created_at);
      if (sortOrder === "oldest") return new Date(a.created_at) - new Date(b.created_at);
      return 0;
  });

  
  //ดึงข้อมูลการกดใจกระทู้
  useEffect(() => {
    const userId = localStorage.getItem('userId');

    if (isLoggedin && userId) {
      axios.get(`http://localhost:3001/web/webboard/favorite`,{
        params: { userId },
        withCredentials: true, 
      })
      .then((response) => {
        if (response.data.success) {
          // เก็บข้อมูล ID ของกระทู้ที่ถูกใจ
        // setLikedPosts(response.data.likedPosts.map(post => post.webboard_id));
        const likedPostsFromDB = response.data.likedPosts.map(post => post.webboard_id);
        setLikedPosts(likedPostsFromDB);

      }
      })
      .catch((error) =>{
        console.error("เกิดข้อผิดพลาดในการโหลดกระทู้ที่ถูกใจ:", error);
      });
    }else{
      setLikedPosts([]);
    }
  }, [isLoggedin]);


  // ฟังก์ชัน Toggle หัวใจ
  const toggleLike = (postId) => {
    if (!isLoggedin) {
      return; // ไม่บันทึกสถานะหากไม่ได้เข้าสู่ระบบ
    }

    // const userId = localStorage.getItem('userId');

    axios.post(`http://localhost:3001/web/webboard/${postId}/favorite`, {}, {
      withCredentials: true, 
    })
    .then((response) => {
      const {status} = response.data;
        // กำหนด userId จาก sessionStorage

      setLikedPosts((prevLikedPosts) => {
        let updatedPosts;
        if (status === 1) {
          // กดถูกใจ (เพิ่ม postId เข้าไป)
          updatedPosts = [...prevLikedPosts, postId];
      } else {
      // ยกเลิกถูกใจ (ลบ postId ออก)
      updatedPosts = prevLikedPosts.filter((id) => id !== postId);
      }

      return updatedPosts;
    });
  })
  .catch((error) => console.error("เกิดข้อผิดพลาดในการกดถูกใจ:", error));
  };

  
  // เมื่อมีการกดคลิกกระทู้
  const handlePostClick = (post) => {
    if (selectedPost && selectedPost.webboard_id === post.webboard_id) {
      setModalIsOpen(true);
      return;
     } 
      axios.get(`http://localhost:3001/web/webboard/${post.webboard_id}`, {
        withCredentials: true,
      })
        .then((response) => {
          if (response.data.success) {
            console.log("Comments Data:", response.data.data.comments);

            setSelectedPost({
              ...response.data.data,
              comments: response.data.data.comments.map(comment => ({
                ...comment,
                created_at: comment.created_at 
                ? moment(comment.created_at).locale("th").format("DD/MM/YYYY HH:mm:ss") 
                : "ไม่ระบุวันที่"
            }))
            });
            setModalIsOpen(true);
          } else {
            console.error("ไม่สามารถโหลดกระทู้ได้");
          }
        })
        .catch((error) => console.error("เกิดข้อผิดพลาดในการโหลดกระทู้:", error));
  };

  // จัดการcomment
  const handleCommentSubmit = () => {
    if (!isLoggedin) {
      alert("กรุณาเข้าสู่ระบบ");
      return;
  }
    if (!commentText.trim()) {
      alert("กรุณากรอกข้อความก่อนส่งความคิดเห็น");
      return;
  }

    axios.post(`http://localhost:3001/web/webboard/${selectedPost.webboard_id}/comment`, {
      comment_detail: commentText,
    },{
      withCredentials: true
    })
    .then((response) => {
      const newComment = response.data; 
      setSelectedPost((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), newComment],
        comments_count: (prev.comments_count ?? 0) + 1
      }));

    // อัปเดต state `webboard` เพื่อให้จำนวนเมนต์อัปเดตที่หน้าแรก
    setWebboard((prevWebboard) => 
      prevWebboard.map((post) =>
        post.webboard_id === selectedPost.webboard_id
          ? { ...post, comments_count: (post.comments_count ?? 0) + 1 }
          : post
      )
    );

    setCommentText("");
    })
    .catch((error) => {
    console.error('เกิดข้อผิดพลาดในการแสดงความคิดเห็น:', error.message);
    });
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedPost(null);
  }

  // ดึงcategory
  useEffect(() => {
    axios.get(`http://localhost:3001/category/category-all`)
    .then(response => {
        if (response.data.success) {
            setCategory(response.data.data); 
        } else {
            console.error('เกิดข้อผิดพลาดในการดึงหมวดหมู่:', response.data.message);
        }
    })
    .catch(error => {
        console.error('เกิดข้อผิดพลาดในการดึงหมวดหมู่:', error.message);
    });
  }, []);

  const handleCategoryClick = (categoryId) => {
    navigate(`/webboard/category/${categoryId}`)
};

  // กำหนดสีหมวดหมู่
  const getCategoryColor = (categoryId) => {
    const id = Number(categoryId);  // แปลงเป็นตัวเลข
    const hue = (id * 137) % 360;
    return `hsl(${hue}, 70%, 60%)`;
};

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
                 {news.length > 0 ? (
                    news.slice(0, 2).map((item) => ( // แสดงข่าว 3 ข่าวแรก
                      <div key={item.news_id} className="col-md-4">
                        <div className="card" id="card-news-home">
                          <img src={`http://localhost:3001/uploads/${item.image}`} className="card-img-top" alt={item.news_title} />
                          <div className="card-body">
                            <h5 className="card-title">{item.news_title}</h5>
                            <p className="card-text">
                              {item.news_content ? item.news_content.substring(0, 100) + "..." : "ไม่มีเนื้อหา"}
                            </p>
                            <a href={`/news/${item.news_id}`} className="btn btn-primary">อ่านเพิ่มเติม</a>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>ไม่มีข่าวประชาสัมพันธ์</p>
                  )}
                 </div>

                 <div className="col">
                      <h4 className="news-title">ปฏิทินกิจกรรม</h4>
                      {activity.length > 0 ? (
                        activity.map((item) => (
                          <div key={item.activity_id} className="news-item d-flex">
                            <div className="news-date">
                              <span className="day">{new Date(item.activity_date).getDate()}</span>
                              <span className="month-year">
                                {new Date(item.activity_date).toLocaleDateString("th-TH", {
                                  month: "long",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                            <div className="news-content ms-3">
                              <h5>{item.activity_title}</h5>
                              <p className="card-text">
                              {activity.activity_description ? activity.activity_description.substring(0, 100) + "..." : "ไม่มีเนื้อหา"}
                            </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p>ไม่มีข้อมูลกิจกรรม</p>
                      )}
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
                   <div className="row justify-content-between" id="row-webboard">
                    <div className="row">
                {webboard.length > 0 ? (
                webboard.sort((a, b) => b.viewCount - a.viewCount) // เรียงโพสต์ตามจำนวนเข้าชม (มาก -> น้อย)
                .slice(0, 2) // 2อันดับแรก
                .map(post => (
              <div key={post.webboard_id} className="col-md-6">
                <div className="card-homeweb shadow-sm p-3 border rounded-4">
                    {/* ส่วนหัวของกระทู้ */}
                    <div className="d-flex justify-content-between">
                      <span 
                      key={post.category_id}
                      className="badge px-3 py-2 ms-auto me-4" style={{ backgroundColor: getCategoryColor(post?.category_id || 0), color: "white", padding: "5px 10px", borderRadius: "15px" , cursor: "pointer"}} 
                      onClick={() => handleCategoryClick(post.category_id)}>
                        {post && post.category_name ? post.category_name : ''}
                      </span>
                                      
                      <span onClick={(e) => { e.stopPropagation(); toggleLike(post.webboard_id); }} style={{ cursor: "pointer" }}>
                      {likedPosts.includes(post.webboard_id) ?  
                      <MdFavorite className="fs-5 text-danger" /> : 
                      <SlHeart className="fs-5 text-secondary" />}
                      </span>
                    </div>

                    <div onClick={() => handlePostClick(post)} style={{ cursor: "pointer" }}>
                      {/* โปรไฟล์ + ชื่อผู้ใช้ */}
                    <div className="d-flex mt-3">
                      <img src={post.profile_image ? `http://localhost:3001/${post.profile_image}` : "/default-profile.png"}  alt="User" className="rounded-circle me-3" width="50" height="50" onError={(e) => e.target.src = "/default-profile.png"}/>
                        <div>
                          <h5 className="fw-bold mb-1">{post.title}</h5>
                          <p className="text-muted mb-1">จากคุณ <span className="text">{post.full_name || "ไม่ระบุชื่อ"}</span></p>
                          <p className="text-muted small">{new Date(post.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* <img src={post.image_path ? `http://localhost:3001/${post.image_path.replace(/^\/+/, '')}` : "/default-image.png"}   alt="Post" className="img-fluid rounded-3" /> */}


                    <div className="card-body px-0">
                      <p className="card-text mb-3">
                      {post.content ? (post.content.length > 100 ? post.content.substring(0, 100) + "..." : post.content) : ""}
                      </p>
                    </div>

                    <div className="d-flex align-items-center mt-4 px-2">
                      {/* ความคิดเห็น */}
                        <BiSolidComment className="me-2" /> 
                        {post.comments_count ?? 0} ความคิดเห็น
                        
                      {/* จำนวนผู้เข้าชม */}
                        <FaEye className="me-2 ms-auto" /> {post.viewCount} ครั้ง
                    </div>              
                  </div>
                </div>
              </div>
                
              ))
            ) : (
              <p>ไม่มีโพสต์</p>
            )}
          </div>
            
            <div className="text">
              <a href={`/webboard`} className="btn btn-primary">ดูทั้งหมด</a>
            </div>                             
          </div>        
        </div>
      </div>
   
               {/* ส่วนของบริจาค */}
               <div className="home-donate">
                   <h3 id="head-text">บริจาค</h3>
              <div className="donate-content-item">
    
                <div className="item-detail">
                  <div className="image-frame">
                    <img src="./image/activitie2.jpg" alt="Avatar" />
                  </div>
                  <div className="donate-discription">
                    <h5><b>ยิ้มสู่ชุมชน</b></h5>
                    <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry...</p>
                  </div>
                  {/* Progress Bar */}
                  <div className="progress">{`${progress}%`}</div>
                  <div className="bar">
                    <div className="progress-bar-container">
                      <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                      <span className="progress-percent">{`${progress.toFixed(0)}%`}</span>
                    </div>
                  </div>
    
                  <div className="donate-details">
                    <span>ยอดบริจาคปัจจุบัน: {currentAmount.toLocaleString()} บาท</span>
                    <span>เป้าหมาย: {goalAmount.toLocaleString()} บาท</span>
                  </div>
                  <button className="donate-bt">บริจาค</button>
                </div>
              </div>
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

export default Home;
