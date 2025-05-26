import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "../css/home.css";
import '../css/webboard.css';
import Modal from 'react-modal';
import { SlHeart } from "react-icons/sl";
import { MdFavorite } from "react-icons/md";
import { BiSolidComment } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { Link } from "react-router-dom";
import moment from "moment";
import Swal from "sweetalert2";
import CountUp from "react-countup";
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement);

function Home() {
  const [background, setBackground] = useState("/image/back-2.png");
  const currentAmount = 3000;
  const goalAmount = 10000;
  const progress = (currentAmount / goalAmount) * 100;
  // กราฟ
  const [alumniCount, setAlumniCount] = useState(0);
  const [stats, setStats] = useState({
          totalParticipants: 0,
          ongoingActivity: 0,
          ongoingProject: 0,
          totalDonations: 0,
  });
  const [barData, setBarData] = useState({
          labels: [],
          datasets: [],
  });
  // const [pieData, setPieData] = useState({
  //         labels: [],
  //         datasets: [],
  // });
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
  const [showReplyForm, setShowReplyForm] = useState(null);
  const [replyText, setReplyText] = useState(""); 
  const [expandedReplies, setExpandedReplies] = useState({}); //ซ่อนการตอบกลับ
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("all");
  const filteredProjects = projects.filter((project) => {
    if (filter === "all") return true;
    return project.donation_type === filter;
  });

  const getFilterTitle = (donationType) => {
    switch (donationType) {
      case "fundraising":
        return "บริจาคแบบระดมทุน";
      case "unlimited":
        return "บริจาคแบบไม่จำกัดจำนวน";
      case "things":
        return "บริจาคสิ่งของ";
      default:
        return "โครงการบริจาคทั้งหมด";
    }
  };


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
        setActivity(response.data.data);
      })
      .catch(error => {
        console.error("Error fetching activities:", error);
      });
  }, []);

  // ดึงข้อมูลสถิติหลัก
  useEffect(() => {
          // ดึงข้อมูลสถิติหลัก
          axios.get("http://localhost:3001/admin/dashboard-stats")
          .then((res) => {
              setStats(res.data);
              })
              .catch((err) => {
              console.error("Error fetching dashboard stats:", err);
          });
  
          // ดึงข้อมูลกราฟแท่ง
          axios.get('http://localhost:3001/admin/activity-per-year')
          .then(res => {
              // console.log("กิจกรรมต่อปี", res.data);
              if (Array.isArray(res.data)) {
              const labels = res.data.map(item => `ปี ${item.year + 543}`);
              const data = res.data.map(item => item.total_activities);
              setBarData({
                  labels,
                  datasets: [{ label: 'จำนวนผู้เข้าร่วม (คน)', data, backgroundColor: '#0d6efd' }],
              });
              }
          });
  
      
          // ดึงข้อมูลกราฟวงกลม
          // axios.get('http://localhost:3001/admin/donation-stats')
          // .then(res => {
          //     if (res.data && Array.isArray(res.data)) {
          //     const labels = res.data.map(item => `ไตรมาส ${item.quarter}`);
          //     const data = res.data.map(item => item.total);
          //     setPieData({
          //         labels,
          //         datasets: [{
          //         data,
          //         backgroundColor: ['#d63384', '#198754', '#fd7e14', '#0dcaf0'],
          //         }],
          //     });
          //     } else {
          //     console.warn("donation-stats: unexpected data format", res.data);
          //     }
          // });
      
          // ดึงจำนวนศิษย์เก่า
          axios.get('http://localhost:3001/admin/total-alumni')
            .then(res => setAlumniCount(res.data.totalAlumni));
  }, []);

  const CardInfo = ({ title, value, center = false, animated = false }) => (
    <div className="col-md-3 mb-3">
      <div className={`card p-4 shadow-sm ${center ? 'mx-auto' : ''}`} style={{ maxWidth: center ? 400 : "100%" }}>
        <h6 className="text-secondary">{title}</h6>
        <h3 className="text-primary">
          {animated ? <CountUp end={parseInt(value)} duration={2} separator="," /> : value}
          {typeof value === "string" && value.includes("คน") && ""}
          {typeof value === "string" && value.includes("บาท") && ""}
        </h3>
      </div>
    </div>
  );

  // กราฟวงกลม: สถิติการบริจาครายไตรมาส
  const pieData = {
    labels: ['ไตรมาสที่ 1', 'ไตรมาสที่ 2', 'ไตรมาสที่ 3', 'ไตรมาสที่ 4'],
    datasets: [
      {
        data: [10, 45, 30, 15],
        backgroundColor: ['#d63384', '#198754', '#fd7e14', '#0dcaf0'],
        borderColor: '#fff',
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 50,
          callback: value => `${value} คน`,
        },
        grid: {
          color: '#e0e0e0',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };
  
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'left',
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const value = tooltipItem.raw;
            const total = tooltipItem.dataset.data.reduce((a, b) => a + b, 0);
            const percent = ((value / total) * 100).toFixed(1);
            return `${tooltipItem.label} (${percent}%)`;
          },
        },
      },
    },
  };

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

    axios
      .get("http://localhost:3001/donate")
      .then((response) => {
        setProjects(response.data);
      })
      .catch((err) => {
        console.log("เกิดข้อผิดพลาดในการดึงข้อมูล");
      });
  }, []);

  //เรียงลำดับโพสต์ตามวันที่
  const sortedPosts = [...webboard].sort((a, b) => {
    if (sortOrder === "latest") return new Date(b.created_at) - new Date(a.created_at);
    if (sortOrder === "oldest") return new Date(a.created_at) - new Date(b.created_at);
    return 0;
  });

  // ฟังก์ชัน Toggle หัวใจ
  const toggleLike = (postId) => {
        if (!isLoggedin) {
          Swal.fire({
            title: "กรุณาเข้าสู่ระบบ",
            text: "คุณต้องเข้าสู่ระบบก่อนกดใจ",
            icon: "warning",
            confirmButtonText: "เข้าสู่ระบบ"
          }).then(() => {
            navigate("/login");
          });
          return; // ไม่บันทึกสถานะหากไม่ได้เข้าสู่ระบบ
        }

    // const userId = localStorage.getItem('userId');

    axios.post(`http://localhost:3001/web/webboard/${postId}/favorite`, {}, {
      withCredentials: true,
    })
      .then((response) => {
        const { status } = response.data;
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
                // แปลงวันที่ในคอมเมนต์ให้ถูกต้อง
              const commentsWithFormattedDate = response.data.data.comments.map(comment => ({
                ...comment,
                created_at: comment.created_at 
                    ? moment(comment.created_at).locale("th").format("DD/MM/YYYY HH:mm:ss") 
                    : "ไม่ระบุวันที่",
                replies: comment.replies?.map(reply => ({
                    ...reply,
                    created_at: reply.created_at ? reply.created_at : "",
                    user_id: reply.user_id 
                })) || [] // ป้องกันกรณีไม่มี replies
              }));
              
              setSelectedPost({
                ...response.data.data,
                comments: commentsWithFormattedDate
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
            Swal.fire({
                title: "กรุณาเข้าสู่ระบบ",
                text: "คุณต้องเข้าสู่ระบบก่อนแสดงความคิดเห็น",
                icon: "warning",
                confirmButtonText: "เข้าสู่ระบบ"
            }).then(() => {
                navigate("/login");
            });
            return;
        }

        if (!commentText.trim()) {
            Swal.fire({
                title: "ข้อผิดพลาด",
                text: "กรุณากรอกข้อความก่อนส่งความคิดเห็น",
                icon: "error",
                confirmButtonText: "ตกลง"
            });
            return;
        }

        axios.post(`http://localhost:3001/web/webboard/${selectedPost.webboard_id}/comment`, {
          comment_detail: commentText,
        }, {
          withCredentials: true
        })
        .then((response) => {
          const newComment = response.data; // คอมเมนต์ใหม่ที่ได้จาก Backend
        
          // แปลงวันที่ให้ถูกต้องก่อน
          const formattedNewComment = {
            ...newComment,
            created_at: newComment.created_at
              ? moment(newComment.created_at).locale("th").format("DD/MM/YYYY HH:mm:ss")
              : "ไม่ระบุวันที่"
          };
        
          // อัปเดต State ของ selectedPost
          setSelectedPost((prev) => ({
            ...prev,
            comments: [...(prev.comments || []), formattedNewComment],
            comments_count: (prev.comments_count ?? 0) + 1
          }));
        
          // อัปเดต State ของ webboard เพื่อให้จำนวนคอมเมนต์อัปเดตในหน้าแรก
          setWebboard((prevWebboard) => 
            prevWebboard.map((post) =>
              post.webboard_id === selectedPost.webboard_id
                ? { ...post, comments_count: (post.comments_count ?? 0) + 1 }
                : post
            )
          );
        
          setCommentText(""); // ล้างข้อความในช่องคอมเมนต์
        })
        .catch((error) => {
          console.error('เกิดข้อผิดพลาดในการแสดงความคิดเห็น:', error.message);
        });        
    };

    const toggleReplyForm = (commentId) => {
      setShowReplyForm(showReplyForm === commentId ? null : commentId);
    };

    // ซ่อนการตอบกลับ
    const toggleReplies = (commentId) => {
      setExpandedReplies((prev) => ({
        ...prev,
        [commentId]: !prev[commentId],
      }));
    };

    // ตอบกลับความคิดเห็น
    const handleReplySubmit = (commentId, replyText) => {
      if (!isLoggedin) {
        Swal.fire({
          title: "กรุณาเข้าสู่ระบบ",
          text: "คุณต้องเข้าสู่ระบบก่อนเข้าร่วมกิจกรรม",
          icon: "warning",
          confirmButtonText: "เข้าสู่ระบบ"
        }).then(() => {
        navigate("/login");
        });
        return;
      }
      if (!replyText.trim()) {
        alert("กรุณากรอกข้อความก่อนส่งความคิดเห็น");
        return;
      }
    
      axios.post(`http://localhost:3001/web/webboard/${selectedPost.webboard_id}/comment/${commentId}/reply`, {
        reply_detail: replyText,
      }, {
        withCredentials: true
      })
      .then((response) => {
        const newReply = response.data;
        setSelectedPost((prev) => ({
          ...prev,
          comments: prev.comments.map((comment) =>
            comment.comment_id === commentId
              ? { ...comment, replies: [...(comment.replies || []), newReply] }
              : comment
          ),
        }));
        setReplyText("");
        setShowReplyForm(null);
      })
      .catch((error) => {
        console.error('เกิดข้อผิดพลาดในการตอบกลับความคิดเห็น:', error.message);
      });
    };

     // ฟังก์ชันลบความคิดเห็น
     const handleDeleteComment = (commentId) => {
      if (window.confirm("คุณต้องการลบความคิดเห็นนี้หรือไม่?")) {
        axios.delete(`http://localhost:3001/web/webboard/${selectedPost.webboard_id}/comment/${commentId}`, {
          withCredentials: true
        })
        .then((response) => {
          
          if (response.data.success) {
            setSelectedPost((prev) => ({
              ...prev,
              comments: prev.comments.filter(comment => comment.comment_id !== commentId)
            }));
            Swal.fire("สำเร็จ", "ลบความคิดเห็นสำเร็จแล้ว", "success");
          } else {
            Swal.fire("ผิดพลาด", "ไม่สามารถลบความคิดเห็นได้", "error");
          }
        })
        .catch((error) => {
          console.error("เกิดข้อผิดพลาดในการลบความคิดเห็น:", error.message);
          Swal.fire("ผิดพลาด", "เกิดข้อผิดพลาดในการลบ", "error");
        });
      }
    };

    // ลบการตอบกลับความคิดเห็น
    const handleDeleteReply = (replyId, commentId) => {
      axios.delete(`http://localhost:3001/web/webboard/${selectedPost.webboard_id}/comment/${commentId}/reply/${replyId}`, {
        withCredentials: true
      })
      .then(response => {
        if (response.data.success) {
          console.log('ลบการตอบกลับสำเร็จ');
          // ลบ reply ออกจาก state ของ comment ที่เกี่ยวข้อง
          setSelectedPost(prevPost => ({
            ...prevPost,
            comments: prevPost.comments.map(comment =>
              comment.comment_id === commentId
                ? {
                    ...comment,
                    replies: comment.replies.filter(reply => reply.reply_id !== replyId)
                  }
                : comment
            )
          }));
        }
      })
      .catch(error => {
        console.error('เกิดข้อผิดพลาดในการลบการตอบกลับ:', error);
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

  const handleReadMore = (newsId) => {
    navigate(`/news/${newsId}`); 
  };

  return (
    <div className="content" style={{ backgroundImage: `url(${background})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
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
          <div className="container">
            <div className="row g-4 justify-content-center">
              {news.length > 0 ? (
                news.slice(0, 2).map((item) => (
                  <div key={item.news_id} className="col-md-4 col-sm-12">
                    <div className="card shadow-sm border-15 h-100" id="card-news-home">
                      <img src={`http://localhost:3001${item.image_path}`} alt={item.title} className="news-image-home" onError={(e) => e.target.src = '/default-image.png'}
                        style={{ height: "200px", objectFit: "cover" }} />
                      <div className="card-body d-flex flex-column">
                        <h5 className="card-title">{item.title}</h5>
                        <p className="news-text flex-grow-1">
                          {item.content ? item.content.substring(0, 100) + "..." : "ไม่มีเนื้อหา"}
                        </p>
                        <button 
                          className="btn-news-home btn-primary" 
                          onClick={() => handleReadMore(item.news_id)}
                        >
                          อ่านเพิ่มเติม
                        </button>                      
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>ไม่มีข่าวประชาสัมพันธ์</p>
              )}


              <div className="col-md-4">
                <h4 className="activity-title fw-bold">ปฏิทินกิจกรรม</h4>
                {activity.length > 0 ? (
                  activity
                    .slice(0, 3) // แสดงกิจกรรม 3 รายการแรก
                    // .filter((item) => new Date(item.activity_date) >= new Date()) // กรองกิจกรรมที่ยังไม่เกิดขึ้น
                    .sort((a, b) => new Date(a.activity_date) - new Date(b.activity_date))
                    .map((item) => (
                      <Link
                        to={`/activity/${item.activity_id}`}
                        key={item.activity_id}
                        className="act-home-item d-flex mb-3 text-decoration-none text-dark"
                      >
                        <div className="act-date text-center p-2 text-white rounded">
                          <span className="day d-block">{new Date(item.activity_date).getDate()}</span>
                          <span className="month-year d-block">
                            {new Date(item.activity_date).toLocaleDateString("th-TH", {
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                        </div>

                        <div className="act-content ms-3">
                          <h5 className="act-name fw-bold">{item.activity_name}</h5>
                          <p className="act-text text-muted">
                            {item.description ? item.description.substring(0, 100) + "..." : "ไม่มีเนื้อหา"}
                          </p>
                        </div>
                      </Link>
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
          <div className="container mt-4">
            <div className="row mb-3">
              <CardInfo title="จำนวนผู้เข้าร่วมกิจกรรมทั้งหมด" value={`${stats.totalParticipants} คน`} />
              <CardInfo title="กิจกรรมที่กำลังดำเนินการ" value={`${stats.ongoingActivity} กิจกรรม`} />
              <CardInfo title="ยอดบริจาครวมทั้งหมด" value={`${stats.totalDonations} บาท`} />
              <CardInfo title="โครงการที่เปิดรับบริจาค" value={`${stats.ongoingProject} โครงการ`} />
            </div>

            {/* กราฟแท่ง */}
            <div className="row mb-4">
              <div className="col-md-8">
                <div className="card p-3 shadow-sm">
                  <h5 className="mb-3">จำนวนการเข้าร่วมกิจกรรมในแต่ละปี</h5>
                  {barData.labels.length ? (
                    <Bar data={barData} options={barOptions} />
                  ) : (
                    <div>Loading...</div>
                  )}
                </div>
              </div>

              {/* กราฟวงกลม */}
              <div className="col-md-4">
                <div className="card p-3 shadow-sm">
                  <h5 className="mb-3">สถิติการบริจาค</h5>
                  {pieData.labels.length ? (
                    <Pie data={pieData} options={pieOptions} />
                  ) : (
                    <div>Loading...</div>
                  )}
                </div>
              </div>
            </div>

           
           

              {/* <div className="col-md-8">
                <div className="row">
                  <div className="col-md-6">
                    <CardInfo title="จำนวนผู้เข้าร่วมกิจกรรมทั้งหมด" value={stats.totalParticipants} animated />
                  </div>
                  <div className="col-md-6">
                    <CardInfo title="กิจกรรมที่กำลังดำเนินการ" value={stats.ongoingActivity} animated />
                  </div>
                  <div className="col-md-6">
                    <CardInfo title="ยอดบริจาครวมทั้งหมด" value={stats.totalDonations} animated />
                  </div>
                  <div className="col-md-6">
                    <CardInfo title="โครงการที่เปิดรับบริจาค" value={stats.openProjects} animated />
                  </div>
                </div>
              </div> */}
            

            {/* การ์ดศิษย์เก่าแสดงอนิเมชัน */}
            <div className="row">
              <div className="col-12">
                <CardInfo title="จำนวนศิษย์เก่าทั้งหมด" value={alumniCount} center animated />
              </div>
            </div>
          </div>
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
                        <div className="card-homeweb shadow-sm p-3 rounded-4">
                          {/* ส่วนหัวของกระทู้ */}
                          <div className="d-flex justify-content-between">
                            <span
                              key={post.category_id}
                              className="badge px-3 py-2 ms-auto me-4" style={{ backgroundColor: getCategoryColor(post?.category_id || 0), color: "white", padding: "5px 10px", borderRadius: "15px", cursor: "pointer" }}
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
                              <img src={post.profile_image ? `http://localhost:3001/${post.profile_image}` : "/default-profile.png"} alt="User" className="rounded-circle me-3" width="50" height="50" onError={(e) => e.target.src = "/default-profile.png"} />
                              <div>
                                <h5 className="fw-bold mb-1">{post.title}</h5>
                                <p className="text-muted mb-1">จากคุณ <span className="text">{post.full_name || "ไม่ระบุชื่อ"}</span></p>
                                <p className="text-muted small">{new Date(post.created_at).toLocaleDateString()}</p>
                              </div>
                            </div>

                            {/* <img src={post.image_path ? `http://localhost:3001/${post.image_path.replace(/^\/+/, '')}` : "/default-image.png"}   alt="Post" className="img-fluid rounded-3" /> */}


                            <div className="d-flex align-items-center justify-content-between px-2 mt-auto">
                              <p className="web-text mb-4 flex-grow-1">
                                {post.content ? (post.content.length > 100 ? post.content.substring(0, 100) + "..." : post.content) : ""}
                              </p>
                            </div>

                            <div className="d-flex align-items-center text-muted flex-grow-1">
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

              <Modal isOpen={modalIsOpen} onRequestClose={closeModal} className="custom-modal" style={{ overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)' } }}>
                              {selectedPost && (
                                  <div className="modal-content mt-2">
                                    {/* ส่วนหัวของกระทู้ */}
                                    <div className="d-flex justify-content-between">
                                    <button className="close-modal-button ms-auto" onClick={closeModal}>
                                      <IoMdClose />
                                    </button>
                                    <span 
                                    key={selectedPost.category_id}
                                    className="badge px-3 py-2 me-4" style={{ backgroundColor: getCategoryColor(selectedPost?.category_id || 0), color: "white", padding: "5px 10px", borderRadius: "6px", cursor: "pointer" }}
                                     onClick={() => handleCategoryClick(selectedPost.category_id)}>
                                      {selectedPost && selectedPost.category_name ? selectedPost.category_name : ''}
                                    </span>
                                      <span onClick={(e) => { e.stopPropagation(); toggleLike(selectedPost.webboard_id); }} style={{ cursor: "pointer" }}>
                                      {likedPosts.includes(selectedPost.webboard_id) ?  
                                      <MdFavorite className="fs-5 text-danger me-5" /> : 
                                      <SlHeart className="fs-5 text-secondary me-5" />}
                                      </span>
                                    </div>
              
                                      {/* โปรไฟล์ + ชื่อผู้ใช้ */}
                                    <div className="d-flex mt-4">
                                        <img 
                                          src={selectedPost.profile_image ? `http://localhost:3001/${selectedPost.profile_image}` : "/default-profile.png"} 
                                          alt="User" 
                                          className="rounded-circle me-3" 
                                          width="50" 
                                          height="50" 
                                        />
                                        <div>
                                          <h5 className="fw-bold mb-1">{selectedPost.title}</h5>
                                          <p className="text-muted mb-1">จากคุณ <span className="text">{selectedPost.full_name || "ไม่ระบุชื่อ"}</span></p>
                                          <p className="text-muted small">{new Date(selectedPost.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
              
                                    <div className="card-body px-0 small">
                                      <p className="card-text mb-3 text-muted">
                                      {selectedPost.content}                  
                                      </p>
                                    </div>
                              
                                    {/* รูปภาพประกอบ*/}
                                    {selectedPost.image_path && (
                                      <img src={selectedPost.image_path ? `http://localhost:3001/${selectedPost.image_path.replace(/^\/+/, '')}` : "/default-image.png"}  alt="Post" className="img-fluid rounded-3" onError={(e) => e.target.style.display = 'none'}/>
                                    )}
                          
                                      {/* จำนวนผู้เข้าชม */}
                                      <div className="d-flex align-items-center mt-4">
                                        <FaEye className="me-2 ms-auto " /> {selectedPost.viewCount} ครั้ง
                                      </div>
              
                                      {/* comment */}
                                      <div className="mt-3">
                                          <h6 className="mb-4">ความคิดเห็นทั้งหมด ({selectedPost?.comments?.length || 0})</h6>
                                          {selectedPost.comments && selectedPost.comments.length > 0 ? (
                                            selectedPost.comments.map((comment, index) => (
                                              <div key={index} className="comment-item bg-light shadow-sm rounded-3 p-3 mb-3">
                                                <div className="d-flex align-items-start">
                                                  <img 
                                                    src={comment.profile_image ? `http://localhost:3001/${comment.profile_image}` : "/default-profile.png"} 
                                                    alt="User" 
                                                    className="rounded-circle me-3 border" 
                                                    width="45" 
                                                    height="45" 
                                                  />
                                                  <div className="flex-grow-1">
                                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                                      <strong>{comment.full_name || "ไม่ระบุชื่อ"}</strong>
                                                      <small className="text-muted">{new Date(comment.created_at).toLocaleDateString()}</small>
                                                    </div>
                                                    <p className="text-muted mb-2 small">{comment.comment_detail}</p>
              
                                                    {Number(comment.user_id) === Number(localStorage.getItem("userId")) && (
                                                      <button
                                                        className="btn btn-sm"
                                                        onClick={() => handleDeleteComment(comment.comment_id)}
                                                        style={{ border: "none", background: "none" }}
                                                      >
                                                        <MdDelete size={20} color="red"/>
                                                      </button>
                                                    )}
              
                                                    <button className="btn btn-link btn-sm p-0" onClick={() => toggleReplyForm(comment.comment_id)}>ตอบกลับ</button>
              
                                                    {showReplyForm === comment.comment_id && (
                                                      <div className="d-flex mt-2">
                                                        <input 
                                                          className="form-control me-2"
                                                          placeholder="ตอบกลับความคิดเห็นนี้..."
                                                          value={replyText}
                                                          onChange={(e) => setReplyText(e.target.value)}
                                                        />
                                                        <button className="btn btn-sm btn-primary" onClick={() => handleReplySubmit(comment.comment_id, replyText)}>ส่ง</button>
                                                      </div>
                                                    )}
              
                                                    {comment?.replies && comment.replies.length > 0 && (
                                                      <div className="replies mt-2" style={{ paddingLeft: "15px", borderLeft: "2px solid #eee" }}>
                                                        {(expandedReplies[comment.comment_id]
                                                          ? comment.replies
                                                          : comment.replies.slice(0, 2) // แสดงแค่ 2 อันแรก
                                                        ).map((reply, replyIndex) => (
                                                          <div key={replyIndex} className="reply-item border rounded p-2 mb-2 bg-white">
                                                            <div className="d-flex align-items-start">
                                                              <img
                                                                src={reply.profile_image ? `http://localhost:3001/${reply.profile_image}` : "/default-profile.png"}
                                                                alt="User"
                                                                className="rounded-circle me-2"
                                                                width="30"
                                                                height="30"
                                                              />
                                                              <div className="reply-content">                                
                                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                                  <strong>{reply.full_name || "ไม่ระบุชื่อ"}</strong>
                                                                  <small className="text-muted">{new Date(reply.created_at).toLocaleDateString()}</small>
                                                                </div>
                                                                <p className="text-muted mb-2 small">{reply.reply_detail}</p>
                                                              </div>
                                                            </div>
                                                          </div>
                                                        ))}
              
                                                        {comment.replies.length > 2 && (
                                                          <div className="text-end">
                                                            <button
                                                              className="btn btn-link btn-sm"
                                                              onClick={() => toggleReplies(comment.comment_id)}
                                                            >
                                                              {expandedReplies[comment.comment_id] ? "ซ่อนการตอบกลับ" : `ดูเพิ่มเติม (${comment.replies.length - 2}) การตอบกลับ`}
                                                            </button>
                                                          </div>
                                                        )}
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                            ))
                                          ) : (
                                            <p className="text-muted">ยังไม่มีความคิดเห็น</p>
                                          )}
              
                                          <div className="comment-form mt-4">
                                            <h6 className="mb-3">แสดงความคิดเห็น:</h6>
                                            {isLoggedin ? (
                                              <div className="d-flex">
                                                <input 
                                                  className="form-control me-3" 
                                                  rows="1" 
                                                  value={commentText} 
                                                  onChange={(e) => setCommentText(e.target.value)} 
                                                  placeholder="เขียนความคิดเห็นของคุณ..."
                                                />
                                                <button className="btn btn-primary" type="submit" onClick={handleCommentSubmit}>
                                                  ส่งความคิดเห็น
                                                </button>
                                              </div>
                                            ) : (
                                              <div className="alert text-center" style={{color: "red"}}>
                                                <p>คุณต้องเข้าสู่ระบบก่อนจึงจะสามารถแสดงความคิดเห็นได้</p>
                                              </div>
                                            )}
                                          </div>
                                      </div>
                                  </div>
                              )}
              </Modal>  

              <div className="text">
                <a href={`/webboard`} className="btn btn-primary">ดูทั้งหมด</a>
              </div>
            </div>
          </div>
        </div>

        {/* ส่วนของบริจาค */}
        <div className="home-donate">
          <h3 id="head-text">บริจาค</h3>
          <div className="donate-content">
            {filteredProjects.length === 0 ? (
              <p>ขออภัย ไม่มีโครงการบริจาคในขณะนี้</p>
            ) : (
              <div className="donate-content-item">
                {filteredProjects.slice(0, 3).map((project) => { // แสดงแค่ 3 โครงการแรก
                  const startDate = project?.start_date ? new Date(project.start_date) : null;
                  const endDate = project?.end_date ? new Date(project.end_date) : null;
                  const options = { year: 'numeric', month: 'long', day: 'numeric' };

                  const formattedStartDate = startDate ? startDate.toLocaleDateString('th-TH', options) : "-";
                  const formattedEndDate = endDate ? endDate.toLocaleDateString('th-TH', options) : "-";

                  const progress = project.target_amount
                    ? (project.current_amount / project.target_amount) * 100
                    : 0;

                  return (
                    <div className="item-detail" key={project.project_id}>
                      <div className="image-frame">
                        <img
                          src={`http://localhost:3001/uploads/${project.image_path}`}
                          alt={project.project_name}
                          onError={(e) => {
                            e.target.src = "./image/default.jpg";
                          }}
                        />
                      </div>
                      <div className="donate-discription">
                        <p className={`tag ${project.donation_type || "default"}`}>
                          {getFilterTitle(project.donation_type)}
                        </p>
                        <p className="donate-discription-date">{formattedStartDate} - {formattedEndDate}</p>
                        <h5><b>{project.project_name}</b></h5>
                        <p>{project.description}</p>
                        <div id="description_">
                          {(project.donation_type !== "unlimited" && project.donation_type !== "things") && (
                            <div className="progress">{`${progress.toFixed(2)}%`}</div>
                          )}
                          <div className="bar">
                            {(project.donation_type !== "unlimited" && project.donation_type !== "things") && (
                              <div className="progress-bar-container">
                                <div
                                  className="progress-bar"
                                  style={{ width: `${progress ? progress.toFixed(0) : 0}%` }}
                                >
                                  <span className="progress-percent">
                                    {`${progress ? progress.toFixed(0) : 0}%`}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="donate-details">
                          <div className="details-amount1">
                            <p>ยอดบริจาคปัจจุบัน:<br /><span className="details-amount-title">{project.current_amount ? project.current_amount.toLocaleString() : "0"} </span>บาท</p><br />
                          </div>
                          <div className="details-amount2">
                            {project.donation_type !== "unlimited" && project.donation_type !== "things" && project.target_amount > 0 && (
                              <p>เป้าหมาย:<br /><span className="details-amount-title">{project.target_amount ? project.target_amount.toLocaleString() : "0"} </span>บาท</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="button-container">
                        <Link to={`/donate/donatedetail/${project.project_id}`}>
                          <button className="donate-bt">บริจาค</button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>
        {/* ส่วนของสมาคม*/}
        <div className="home-about py-5">
      <div className="container">
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
              <li className="list-group-item">จัดกิจกรรมสานสัมพันธ์ศิษย์เก่ากับคณะและมหาวิทยาลัย</li>
            </ul>

            <div className="text-center mt-4">
              <button
                className="btn btn-primary px-4 py-2 fw-bold"
                onClick={() => navigate("/about")}
              >
                ประวัติความเป็นมา
              </button>
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
