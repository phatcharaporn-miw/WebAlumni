import { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "../../css/home.css";
import '../../css/webboard.css';
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
import Swal from "sweetalert2";
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { MdVolunteerActivism, MdEvent, MdPeople, MdTrendingUp } from "react-icons/md";
import { FaSearch, FaRegClock, FaArrowRight, FaChevronLeft, FaChevronRight } from "react-icons/fa";
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

function AlumniHome() {
  const [background] = useState("/image/back-2.png");
  const currentAmount = 3000;
  const goalAmount = 10000;

  // webboard
  const [webboard, setWebboard] = useState([]);
  const [sortOrder] = useState("latest");
  const [likedPosts, setLikedPosts] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isLoggedin, setIsLoggedin] = useState(false);
  // const [showFavorites, setShowFavorites] = useState(false);
  const [category, setCategory] = useState([]);
  const [news, setNews] = useState([]);
  const [activity, setActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReplyForm, setShowReplyForm] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null); // เก็บ comment_id ที่กำลังตอบกลับ
  const [replyText, setReplyText] = useState(''); // เก็บข้อความตอบกลับ
  const [expandedReplies, setExpandedReplies] = useState({}); //ซ่อนการตอบกลับ
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("all");
  const [error] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");


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
        // กรองเฉพาะกิจกรรมที่กำลังจะจัดขึ้นหรือกำลังดำเนินการ
        const now = new Date();
        const filtered = (response.data.data || []).filter(item => {
          const actDate = new Date(item.activity_date);
          // เงื่อนไข: วันที่กิจกรรม >= วันนี้ (หรือเพิ่มสถานะถ้ามี)
          return item.status === 0 || item.status === 2;
        });
        setActivity(filtered);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error fetching activities:", error);
      });
  }, []);

  // ฟังก์ชันตรวจสอบว่าโพสต์นั้นใหม่ภายใน 5 วันหรือไม่
  const isNew = (createdAt) => {
    const postDate = new Date(createdAt);
    const now = new Date();
    const diffTime = now - postDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= 5;
  };

  const [stats, setStats] = useState({
    totalParticipants: 0,
    ongoingActivity: 0,
    ongoingProject: 0,
    totalDonations: 0,
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("th-TH", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const [alumniCount, setAlumniCount] = useState(0);
  const [barData, setBarData] = useState({
    labels: [],
    datasets: [],
  });
  const [pieData, setPieData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    // Dashboard Stats
    axios.get("http://localhost:3001/admin/dashboard-stats")
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Error fetching dashboard stats:", err));

    // // Activity per year graph
    // axios.get("http://localhost:3001/admin/activity-per-year")
    //   .then(res => {
    //     if (Array.isArray(res.data)) {
    //       const labels = res.data.map(item => `ปี ${item.year + 543}`);
    //       const data = res.data.map(item => item.total_activities);
    //       setBarData({
    //         labels,
    //         datasets: [{
    //           label: 'จำนวนกิจกรรม',
    //           data,
    //           backgroundColor: 'rgba(13, 110, 253, 0.8)',
    //           borderColor: 'rgba(13, 110, 253, 1)',
    //           borderWidth: 2,
    //           borderRadius: 6,
    //           borderSkipped: false,
    //         }],
    //       });
    //     }
    //   });
    // Activity per month graph
axios.get("http://localhost:3001/admin/activity-per-month")
  .then(res => {
    if (Array.isArray(res.data)) {
      // สร้าง labels เป็น "เดือน ปี" (ภาษาไทย)
      const monthNamesThai = [
        "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน",
        "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม",
        "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
      ];

      const labels = res.data.map(item => `${monthNamesThai[item.month_number - 1]} ${item.year + 543}`);
      const data = res.data.map(item => item.total_activities);

      setBarData({
        labels,
        datasets: [{
          label: 'จำนวนกิจกรรม',
          data,
          backgroundColor: 'rgba(13, 110, 253, 0.8)',
          borderColor: 'rgba(13, 110, 253, 1)',
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false,
        }],
      });
    }
  });


    // สถิติการบริจาค
    axios.get("http://localhost:3001/admin/donation-stats")
      .then((res) => {
        const labels = res.data.map(item => item.donation_type);
        const data = res.data.map(item => item.total);
        setPieData({
          labels,
          datasets: [{
            data,
            backgroundColor: ['#98d662ff', '#6f42c1', '#241f12ff'], // example colors
          }],
        });
      });

    // Total alumni count
    axios.get("http://localhost:3001/admin/total-alumni")
      .then(res => setAlumniCount(res.data.totalAlumni));
  }, []);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const CardInfo = ({ title, value, type = "activity", center = false, icon: CustomIcon, colClass = "col-md-3" }) => {
    const getCardStyle = () => {
      switch (type) {
        case "donation":
          return {
            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
            color: 'white',
            iconColor: 'white'
          };
        case "project":
          return {
            background: 'linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%)',
            color: 'white',
            iconColor: 'white'
          };
        case "alumni":
          return {
            background: 'linear-gradient(135deg, #fd7e14 0%, #ffc107 100%)',
            color: 'white',
            iconColor: 'white'
          };
        default:
          return {
            background: 'linear-gradient(135deg, #0d6efd 0%, #6610f2 100%)',
            color: 'white',
            iconColor: 'white'
          };
      }
    };

    const cardStyle = getCardStyle();
    const Icon = CustomIcon || (type === "donation" ? MdVolunteerActivism : MdEvent);

    return (
      <div className={`${colClass} mb-4`}>
        <div
          className={`card p-4 border-0 shadow-lg position-relative overflow-hidden ${center ? 'text-center' : 'text-start'}`}
          style={{
            background: cardStyle.background,
            color: cardStyle.color,
          }}>
          <div className="position-absolute top-0 end-0 p-3 opacity-25">
            <Icon size={60} />
          </div>
          <div className="d-flex align-items-center mb-3">
            <Icon size={28} className="me-3" style={{ color: cardStyle.iconColor }} />
            <h6 className="mb-0 fw-bold">{title}</h6>
          </div>
          <h2 className="fw-bold mb-0">{value}</h2>
        </div>
      </div>
    );
  };

  const LoadingSpinner = () => (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        cornerRadius: 8,
        padding: 12,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 10,
          callback: value => `${value} กิจกรรม`,
          font: {
            size: 12
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 14,
            weight: 'bold'
          }
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: function (tooltipItem) {
            const value = Number(tooltipItem.raw); // ยอดเงินของ slice นั้นแต่ละโครงการต้องแปลงเป็นตัวเลขก่อน
            const dataset = tooltipItem.dataset;

            // console.log('Tooltip Item:', dataset);
             // บังคับแปลงเป็นตัวเลข
            const dataValues = dataset.data.map(d => Number(d));

            // คำนวณผลรวมทั้งหมดของ slice
            const total = dataValues.reduce((acc, val) => acc + val, 0);

            // (ค่า slice ÷ ผลรวมทั้งหมด) × 100
            const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;

            // format number ให้มี , คั่นหลักพัน
            const formattedValue = value.toLocaleString();
            return `${tooltipItem.label}: ฿${formattedValue} (${percent}%)`; //คืนค่า string ที่จะแสดงใน tooltip
          },
        },
      },
    },
  };


  //ดึงข้อมูล webboard
  useEffect(() => {
    axios.get('http://localhost:3001/web/webboard')
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
      .get("http://localhost:3001/donate/donate", {
        withCredentials: true
      })
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
  const handlePostClick = async (post) => {
    if (selectedPost && selectedPost.webboard_id === post.webboard_id) {
      setModalIsOpen(true);
      return;
    }

    try {
      // อัปเดต UI ทันทีก่อน เพื่อประสบการณ์ผู้ใช้ที่ดี
      setWebboard(prevWebboard =>
        prevWebboard.map(item =>
          item.webboard_id === post.webboard_id
            ? { ...item, viewCount: (item.viewCount || 0) + 1 }
            : item
        )
      );

      const response = await axios.get(`http://localhost:3001/web/webboard/${post.webboard_id}`, {
        withCredentials: true,
      });

      if (response.data.success) {
        const commentsWithFormattedDate = response.data.data.comments.map(comment => ({
          ...comment,
          replies: comment.replies?.map(reply => ({
            ...reply,
            user_id: reply.user_id
          })) || []
        }));

        setSelectedPost({
          ...response.data.data,
          comments: commentsWithFormattedDate
        });

        setModalIsOpen(true);
      } else {
        console.error("ไม่สามารถโหลดกระทู้ได้");
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการโหลดกระทู้:", error);
    }
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
        const newComment = response.data.comment; // ปรับตาม response structure

        const userProfileImage = localStorage.getItem("image_path") || "/default-profile.png";
        const userId = localStorage.getItem("userId");

        const formattedNewComment = {
          ...newComment,
          profile_image: newComment.profile_image || userProfileImage,
          full_name: newComment.full_name, // ใช้ full_name จาก backend
          user_id: newComment.user_id || userId, // ใช้ user_id จาก backend หรือ localStorage
          created_at: newComment.created_at || new Date().toISOString(),
          comment_detail: newComment.comment_detail || commentText,
          replies: [],
        };

        setSelectedPost((prev) => {
          const updatedPost = {
            ...prev,
            comments: [...(prev.comments || []), { ...formattedNewComment }],
            comments_count: (prev.comments_count ?? 0) + 1
          };
          // console.log('Updated comments:', updatedPost.comments);
          return updatedPost;
        });

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
        Swal.fire({
          title: "ข้อผิดพลาด",
          text: "ไม่สามารถเพิ่มความคิดเห็นได้ กรุณาลองใหม่",
          icon: "error",
          confirmButtonText: "ตกลง"
        });
      });
  };

  // ฟังก์ชันสำหรับเปิด/ปิดฟอร์มตอบกลับ
  const toggleReplyForm = (commentId) => {
    if (replyingTo === commentId) {
      setReplyingTo(null);
      setReplyText('');
    } else {
      setReplyingTo(commentId);
      setReplyText('');
    }
  };

  // ตอบกลับความคิดเห็น
  const handleReplySubmit = async (commentId, replyText) => {
    if (!replyText.trim()) {
      alert("กรุณาป้อนข้อความตอบกลับ");
      return;
    }

    try {
      const response = await axios.post(`http://localhost:3001/api/replies`, {
        comment_id: commentId,
        reply_detail: replyText.trim(),
        user_id: localStorage.getItem("userId")
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        // อัปเดต selectedPost state ทันที
        setSelectedPost(prevPost => {
          const updatedComments = prevPost.comments.map(comment => {
            if (comment.comment_id === commentId) {
              // สร้าง reply object ใหม่
              const newReply = {
                reply_id: response.data.reply_id || Date.now(), // ใช้ ID จาก response หรือ timestamp
                comment_id: commentId,
                user_id: localStorage.getItem("userId"),
                reply_detail: replyText.trim(),
                created_at: new Date().toISOString(),
                full_name: localStorage.getItem("fullName") || "คุณ", // ดึงชื่อจาก localStorage
                profile_image: localStorage.getItem("profileImage") || "/default-profile.png"
              };

              return {
                ...comment,
                replies: [...(comment.replies || []), newReply]
              };
            }
            return comment;
          });

          return {
            ...prevPost,
            comments: updatedComments
          };
        });

        // รีเซ็ตฟอร์ม
        setReplyText("");
        setShowReplyForm(null);

        // แสดงข้อความสำเร็จ (optional)
        // toast.success("ตอบกลับเรียบร้อยแล้ว!");

      } else {
        console.error("ไม่สามารถส่งการตอบกลับได้");
        alert("เกิดข้อผิดพลาดในการส่งการตอบกลับ");
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการส่งการตอบกลับ:", error);
      alert("เกิดข้อผิดพลาดในการส่งการตอบกลับ");
    }
  };

  // ฟังก์ชันลบความคิดเห็น
  const handleDeleteComment = (commentId) => {
    Swal.fire({
      title: "ยืนยันการลบ",
      text: "คุณต้องการลบความคิดเห็นนี้หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ใช่, ลบเลย",
      cancelButtonText: "ยกเลิก",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`http://localhost:3001/web/webboard/${selectedPost.webboard_id}/comment/${commentId}`, {
            withCredentials: true,
          })
          .then((response) => {
            if (response.data.success) {
              setSelectedPost((prev) => ({
                ...prev,
                comments: prev.comments.filter((comment) => comment.comment_id !== commentId),
              }));

              Swal.fire({
                title: "ลบแล้ว!",
                text: "ลบความคิดเห็นสำเร็จแล้ว",
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
              });
            } else {
              Swal.fire("ผิดพลาด", "ไม่สามารถลบความคิดเห็นได้", "error");
            }
          })
          .catch((error) => {
            console.error("เกิดข้อผิดพลาดในการลบความคิดเห็น:", error.message);
            Swal.fire("ผิดพลาด", "เกิดข้อผิดพลาดในการลบ", "error");
          });
      }
    });
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

  const calculateDaysRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  };

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  if (error) return <p>{error}</p>;

  // ฟิลเตอร์โปรเจกต์ตามประเภทและสถานะกิจกรรม
  const filteredProjects = projects.filter((project) => {
    const now = new Date();
    const endDate = project?.end_date ? new Date(project.end_date) : null;

    // กรองตามประเภทการบริจาค
    if (filter !== "all" && project.donation_type !== filter) {
      return false;
    }

    // กรองตามสถานะกิจกรรม
    if (filterStatus === "active" && endDate && now > endDate) {
      return false; // หมดอายุแล้ว
    }
    if (filterStatus === "expired" && endDate && now <= endDate) {
      return false; // ยังไม่หมดอายุ
    }

    return true;
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

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const getProjectStatusBadge = (project) => {
        const now = new Date();
        const endDate = project?.end_date ? new Date(project.end_date) : null;
        const startDate = new Date(project?.start_date);
        const comingSoonDays = startDate && now < startDate;

        if (!endDate) return null;

        if (now > endDate) {
            return <span className="donate-badge donate-badge-expired">สิ้นสุดแล้ว</span>;
        }

        const daysRemaining = calculateDaysRemaining(endDate);
        if (daysRemaining <= 5) {
            return <span className="donate-badge donate-badge-warning">ใกล้สิ้นสุด</span>;
        }

        if (now < startDate) {
            return (
                <span className="donate-badge donate-badge-secondary">
                    กำลังจะเริ่ม
                </span>
            );
        }
        if (now > startDate && now <= endDate) {
            return (
                <span className="donate-badge donate-badge-active">
                    กำลังดำเนินการ
                </span>
            );
        }

    };

    const handleTagClick = (type) => {
        setFilter(type || "all");
        // setCurrentPage(1);
    };

  return (
    <div className="content">
      <img
        src={background}
        alt="หน้าแรก"
        className="background-image"
        width="1920"
        height="1080"
        loading="eager"
        fetchPriority="high"
      />

      <div id="carouselExampleCaptions" className="carousel slide" data-bs-ride="carousel">
        <div className="carousel-indicators">
          <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
          <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="1" aria-label="Slide 2"></button>
        </div>

        <div className="carousel-inner">
          {/* Slide 1: LCP optimized */}
          <div className="carousel-item active">
            <img
              src="/image/2.jpeg"
              alt="slide1"
              className="id-block w-100"
              width="1280"
              height="720"
              style={{ objectFit: "cover", height: "420px", maxHeight: "80vh" }}
              fetchPriority="high"
              loading="lazy"
            />
          </div>

          {/* Slide 2: lazy load */}
          <div className="carousel-item">
            <img
              src="/image/3.jpeg"
              alt="slide2"
              className="id-block w-100"
              width="1280"
              height="720"
              style={{ objectFit: "cover", height: "420px", maxHeight: "80vh" }}
              fetchPriority="auto"
              loading="lazy"
            />
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
          <h3 id="head-text" className="section-title">
            ข่าวประชาสัมพันธ์
            <div className="title-underline"></div>
          </h3>

          <div className="container">
            <div className="row g-4 justify-content-center">
              {news.length > 0 ? (
                news.slice(0, 2).map((item, index) => (
                  <div key={item.news_id} className="col-md-4 col-sm-12">
                    <div
                      className="card shadow-lg border-0 h-100 card-hover"
                      id="card-news-home"
                      style={{
                        borderRadius: '20px',
                        overflow: 'hidden',
                        transform: 'translateY(0)',
                        transition: 'all 0.3s ease-in-out'
                      }}
                    >
                      <div className="image-container position-relative">
                        <img
                          src={`http://localhost:3001${item.image_path}`}
                          alt={item.title}
                          className="news-image-home"
                          onError={(e) => e.target.src = '/default-image.png'}
                          style={{
                            height: "220px",
                            objectFit: "cover",
                            width: "100%",
                            transition: 'transform 0.3s ease-in-out'
                          }}
                          loading={index === 0 ? "eager" : "lazy"}
                          fetchPriority={index === 0 ? "high" : "auto"}
                        />

                        {isNew(item.created_at) && (
                          <div
                            className="position-absolute"
                            style={{
                              top: "12px",
                              right: "12px",
                              backgroundColor: "#ff4757",
                              color: "white",
                              padding: "6px 12px",
                              borderRadius: "20px",
                              fontSize: "0.8rem",
                              fontWeight: "bold",
                              zIndex: 10
                            }}
                          >
                            ข่าวใหม่
                          </div>
                        )}
                      </div>

                      <div className="card-body d-flex flex-column p-4">
                        <h5 className="card-title fw-bold mb-3" style={{
                          color: '#2c3e50',
                          lineHeight: '1.4',
                          fontSize: '1.1rem'
                        }}>
                          {item.title}
                        </h5>

                        <p className="news-text flex-grow-1 mb-4" style={{
                          color: '#6c757d',
                          lineHeight: '1.6',
                          fontSize: '0.95rem'
                        }}>
                          {item.content ? item.content.substring(0, 100) + "..." : "ไม่มีเนื้อหา"}
                        </p>

                        <button
                          className="btn-news-home btn-gradient w-100"
                          onClick={() => handleReadMore(item.news_id)}
                          style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '12px 24px',
                            color: 'white',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            transition: 'all 0.3s ease-in-out',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                          }}
                        >
                          <span className="btn-text">อ่านเพิ่มเติม</span>
                          <span className="btn-arrow">→</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12 text-center py-5">
                  <div className="empty-state">
                    <h5 className="empty-title">ไม่มีข่าวประชาสัมพันธ์</h5>
                    <p className="empty-text">กรุณาตรวจสอบอีกครั้งในภายหลัง</p>
                  </div>
                </div>
              )}

              <div className="col-md-4 activity-placeholder">
                <div className="activity-section">
                  <h4 className="activity-title fw-bold mb-4">
                    ปฏิทินกิจกรรม
                    <div className="title-underline"></div>
                  </h4>

                  <div className="activity-content p-3 ">
                    {isLoading ? (
                      [...Array(3)].map((_, index) => (
                        <div key={index} className="act-home-item loading-item d-flex mb-3">
                          <div className="act-date-skeleton">
                            <div className="skeleton-day"></div>
                            <div className="skeleton-month"></div>
                          </div>
                          <div className="act-content-skeleton ms-3 w-100">
                            <div className="skeleton-title"></div>
                            <div className="skeleton-text"></div>
                          </div>
                        </div>
                      ))
                    ) : activity.length > 0 ? (
                      activity
                        .filter(item => item.status === 0 || item.status === 2)
                        .sort((a, b) => new Date(a.activity_date) - new Date(b.activity_date))
                        .slice(0, 3)
                        .map((item, index) => (
                          <Link
                            to={`/activity/${item.activity_id}`}
                            key={item.activity_id}
                            className="act-home-item text-decoration-none text-dark activity-link"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '16px',
                              borderRadius: '15px',
                              marginBottom: '12px',
                              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                              border: '1px solid #dee2e6',
                              transition: 'all 0.3s ease-in-out',
                              position: 'relative',
                              overflow: 'hidden'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.transform = 'translateX(8px)';
                              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                              e.currentTarget.style.background = 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.transform = 'translateX(0)';
                              e.currentTarget.style.boxShadow = 'none';
                              e.currentTarget.style.background = 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)';
                            }}
                          >
                            <div
                              className="act-date text-white"
                              style={{
                                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                                borderRadius: '12px',
                                padding: '12px',
                                minWidth: '70px',
                                textAlign: 'center',
                                boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)',
                                position: 'relative',
                                overflow: 'hidden'
                              }}
                            >
                              <div className="date-shine"></div>
                              <span className="day fs-4 fw-bold d-block" style={{ lineHeight: '1' }}>
                                {new Date(item.activity_date).getDate()}
                              </span>
                              <span className="month-year small d-block" style={{ fontSize: '0.75rem' }}>
                                {new Date(item.activity_date).toLocaleDateString("th-TH", {
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>

                            <div className="act-content ms-3 flex-grow-1">
                              <h5 className="act-name fw-bold mb-1" style={{
                                color: '#2c3e50',
                                fontSize: '1rem',
                                lineHeight: '1.3'
                              }}>
                                {item.activity_name}
                              </h5>
                              <p className="act-text text-muted mb-0" style={{
                                fontSize: '0.85rem',
                                lineHeight: '1.4'
                              }}>
                                {item.description ? item.description.substring(0, 80) + "..." : "ไม่มีเนื้อหา"}
                              </p>
                            </div>
                          </Link>
                        ))
                    ) : (
                      <div className="empty-activity text-center py-4">
                        <h6 className="empty-activity-title">ไม่มีข้อมูลกิจกรรมในขณะนี้</h6>
                        <p className="empty-activity-text">กรุณาตรวจสอบอีกครั้งในภายหลัง</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ส่วนของแดชบอร์ด */}
        <div className="home-dashboard p-5">
          <h3 id="head-text">
            แดชบอร์ดแสดงข้อมูล
            <div className="title-underline"></div>
          </h3>
          <div className="container">
            {/* Stats Cards */}
            <div className="row mb-5">
              <CardInfo
                title="ผู้เข้าร่วมกิจกรรมทั้งหมด"
                value={`${stats.totalParticipants.toLocaleString()} คน`}
                type="activity"
                icon={MdPeople}
              />
              <CardInfo
                title="กิจกรรมที่กำลังดำเนินการ"
                value={`${stats.ongoingActivity} กิจกรรม`}
                type="activity"
                icon={MdEvent}
              />
              <CardInfo
                title="ยอดบริจาครวมทั้งหมด"
                value={`${formatCurrency(stats.totalDonations)} บาท`}
                type="donation"
                icon={MdVolunteerActivism}
              />
              <CardInfo
                title="โครงการที่เปิดรับบริจาค"
                value={`${stats.ongoingProject} โครงการ`}
                type="project"
                icon={MdTrendingUp}
              />
            </div>

            {/* Charts Section */}
            <div className="row mb-5">
              <div className="col-lg-8 mb-4">
                <div className="card border-0 shadow-lg h-100">
                  <div className="card-header border-0 bg-gradient" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <h5 className="card-title mb-0 fw-bold">
                      จำนวนกิจกรรมในแต่ละเดือน
                    </h5>
                  </div>
                  <div className="card-body p-4">
                    {isLoading ? <LoadingSpinner /> : <Bar data={barData} options={barOptions} />}
                  </div>
                </div>
              </div>

              <div className="col-lg-4 mb-4">
                <div className="card border-0 shadow-lg h-100">
                  <div className="card-header border-0 bg-gradient" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                    <h5 className="card-title mb-0 fw-bold">
                      สถิติการบริจาค
                    </h5>
                  </div>
                  <div className="card-body p-4">
                    {isLoading ? <LoadingSpinner /> : <Pie data={pieData} options={pieOptions} />}
                  </div>
                </div>
              </div>
            </div>

            {/* Alumni Section */}
            <div className="row">
              <CardInfo
                title="จำนวนศิษย์เก่าทั้งหมด"
                value={`${alumniCount.toLocaleString()} คน`}
                center
                type="alumni"
                icon={MdPeople}
                colClass="col-12"
              />
            </div>
          </div>
        </div>

        {/* ส่วนของเว็บบอร์ด */}
        <div className="home-webboard" >
          <h3 id="head-text">
            เว็บบอร์ด
            <div className="title-underline"></div>
          </h3>
          <div className="container">
            <div className="row justify-content-between" id="row-webboard">
              <div className="row">
                {webboard.length > 0 ? (
                  webboard.sort((a, b) => b.viewCount - a.viewCount)
                    .slice(0, 2)
                    .map(post => (
                      <div key={post.webboard_id} className="col-md-6">
                        <div className="card-homeweb shadow-sm p-3 rounded-4 h-100">
                          {/* ส่วนหัวของกระทู้ */}
                          <div className="d-flex justify-content-between mb-3">
                            <span
                              key={post.category_id}
                              className="badge px-3 py-2 me-4 ms-auto"
                              style={{
                                backgroundColor: getCategoryColor(post?.category_id || 0),
                                color: "white",
                                borderRadius: "15px",
                                cursor: "pointer"
                              }}
                              onClick={() => handleCategoryClick(post.category_id)}
                            >
                              {post && post.category_name ? post.category_name : ''}
                            </span>

                            <span
                              onClick={(e) => { e.stopPropagation(); toggleLike(post.webboard_id); }}
                              style={{ cursor: "pointer" }}
                            >
                              {likedPosts.includes(post.webboard_id) ?
                                <MdFavorite className="fs-5 text-danger" /> :
                                <SlHeart className="fs-5 text-secondary" />}
                            </span>
                          </div>

                          <div onClick={() => handlePostClick(post)} style={{ cursor: "pointer" }} className="flex-grow-1 d-flex flex-column">
                            {/* โปรไฟล์ + ชื่อผู้ใช้ */}
                            <div className="d-flex mb-3">
                              <img
                                src={post.profile_image ? `http://localhost:3001/${post.profile_image}` : "/default-profile.png"}
                                alt="User"
                                className="rounded-circle me-3"
                                width="50"
                                height="50"
                                style={{ objectFit: "cover" }}
                                onError={(e) => e.target.src = "/default-profile.png"}
                              />
                              <div className="flex-grow-1">
                                <h5 className="fw-bold mb-1 text-truncate">{post.title}</h5>
                                <p className="text-muted mb-1 small">จากคุณ <span className="fw-semibold">{post.full_name || "ไม่ระบุชื่อ"}</span></p>
                                <p className="text-muted small mb-0">{new Date(post.created_at).toLocaleDateString('th-TH')}</p>
                              </div>
                            </div>

                            {/* เนื้อหา */}
                            <div className="flex-grow-1 mb-3">
                              <p className="text-secondary mb-0" style={{ lineHeight: "1.5" }}>
                                {post.content ? (post.content.length > 120 ? post.content.substring(0, 120) + "..." : post.content) : ""}
                              </p>
                            </div>

                            {/* สถิติ */}
                            <div className="d-flex align-items-center justify-content-between text-muted small mt-auto">
                              <div className="d-flex align-items-center">
                                <BiSolidComment className="me-1" />
                                <span className="me-3">{post.comments_count ?? 0} ความคิดเห็น</span>
                              </div>
                              <div className="d-flex align-items-center">
                                <FaEye className="me-1" />
                                <span>{post.viewCount} ครั้ง</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="col-12">
                    <div className="text-center py-5">
                      <div className="mb-4">
                        <i className="fas fa-comments fa-3x text-muted opacity-25"></i>
                      </div>
                      <h5 className="text-muted mb-3">ยังไม่มีกระทู้</h5>
                      <p className="text-muted">เมื่อมีการโพสต์กระทู้ จะแสดงที่นี่</p>
                      <a href="/webboard" className="btn btn-outline-primary">
                        <i className="fas fa-plus me-2"></i>
                        สร้างกระทู้แรก
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Alternative: Bottom Section with Stats and Button */}
              {webboard.length > 0 && (
                <div className="pt-3 border-top">
                  <div className="row align-items-center">
                    <div className="col-md-8">
                      <small className="text-muted">
                        <i className="fas fa-info-circle me-1"></i>
                        แสดง 2 จาก {webboard.length} กระทู้ยอดนิยม • อัปเดตล่าสุด {new Date().toLocaleDateString('th-TH')}
                      </small>
                    </div>
                    <div className="col-md-4 text-md-end mt-2 mt-md-0">
                      <a href="/webboard" className="btn btn-outline-primary btn-sm">
                        <i className="fas fa-arrow-right me-2"></i>
                        ดูกระทู้ทั้งหมด
                      </a>
                    </div>
                  </div>
                </div>
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
                      className="badge px-3 py-2 me-4" style={{ backgroundColor: getCategoryColor(selectedPost?.category_id || 0), color: "white", padding: "5px 10px", borderRadius: "15px", cursor: "pointer" }}
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
                    <img src={selectedPost.image_path ? `http://localhost:3001/${selectedPost.image_path.replace(/^\/+/, '')}` : "/default-image.png"} alt="Post" className="img-fluid rounded-3" onError={(e) => e.target.style.display = 'none'} />
                  )}

                  {/* จำนวนผู้เข้าชม */}
                  <div className="d-flex align-items-center mt-4">
                    <FaEye className="me-2 ms-auto " /> {selectedPost.viewCount} ครั้ง
                  </div>

                  {/* comment */}
                  <div className="mt-3">
                    <h6 className="mb-4">ความคิดเห็นทั้งหมด ({selectedPost?.comments?.length || 0})</h6>
                    {selectedPost.comments && selectedPost.comments.length > 0 ? (
                      selectedPost.comments.map((comment) => (
                        <div key={comment.comment_id} className="comment-item bg-light shadow-sm rounded-3 p-3 mb-3">
                          <div className="d-flex align-items-start">
                            <img
                              src={comment.profile_image.startsWith('http') || comment.profile_image === '/default-profile.png'
                                ? comment.profile_image
                                : `http://localhost:3001/${comment.profile_image}`}
                              alt="User"
                              className="rounded-circle me-3 border"
                              width="45"
                              height="45"
                            />
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <strong>{comment.full_name || "ไม่ระบุชื่อ"}</strong>
                                <small className="text-muted">
                                  {comment.created_at && !isNaN(new Date(comment.created_at).getTime())
                                    ? format(new Date(comment.created_at), 'dd/MM/yyyy', { locale: th })
                                    : "ไม่ระบุวันที่"}
                                </small>
                              </div>
                              <div className="d-flex align-items-center mb-2">
                                <p className="text-muted mb-0 small flex-grow-1">{comment.comment_detail}</p>
                                {Number(comment.user_id) === Number(localStorage.getItem("userId")) && (
                                  <button
                                    className="btn btn-sm ms-2"
                                    onClick={() => handleDeleteComment(comment.comment_id)}
                                    style={{ border: "none", background: "none" }}
                                  >
                                    <MdDelete size={20} color="red" />
                                  </button>
                                )}
                              </div>
                              {/* Reply button */}
                              {isLoggedin && (
                                <button
                                  className="btn btn-link btn-sm p-0"
                                  onClick={() => setShowReplyForm(showReplyForm === comment.comment_id ? null : comment.comment_id)}
                                >
                                  <BiSolidComment className="me-1" />
                                  ตอบกลับ
                                </button>
                              )}

                              {/* Reply form */}
                              {showReplyForm === comment.comment_id && (
                                <div className="mt-3 p-3 bg-light rounded-3">
                                  <div className="d-flex gap-2">
                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder="เขียนข้อความตอบกลับ..."
                                      value={replyText}
                                      onChange={(e) => setReplyText(e.target.value)}
                                      onKeyDown={e => {
                                        if (e.key === "Enter" && replyText.trim()) {
                                          handleReplySubmit(comment.comment_id, replyText);
                                        }
                                      }}
                                      style={{ fontSize: '0.9rem' }}
                                    />
                                    <button
                                      className="btn btn-primary btn-sm px-3"
                                      onClick={() => handleReplySubmit(comment.comment_id, replyText)}
                                      disabled={!replyText.trim()}
                                    >
                                      ส่ง
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* แสดง Replies */}
                              {comment.replies && comment.replies.length > 0 && (
                                <div className="replies-section mt-3 ms-3">
                                  {comment.replies.map((reply) => (
                                    <div key={reply.reply_id} className="reply-item bg-light rounded-3 p-3 mb-2 border-start border-primary border-3">
                                      <div className="d-flex align-items-start">
                                        <img
                                          src={reply.profile_image?.startsWith('http') || reply.profile_image === '/default-profile.png'
                                            ? reply.profile_image
                                            : `http://localhost:3001/${reply.profile_image}`}
                                          alt="User"
                                          className="rounded-circle me-3 border"
                                          width="35"
                                          height="35"
                                          style={{ objectFit: 'cover' }}
                                        />
                                        <div className="flex-grow-1">
                                          <div className="d-flex justify-content-between align-items-center mb-1">
                                            <strong className="text-dark" style={{ fontSize: '0.9rem' }}>
                                              {reply.full_name || "ไม่ระบุชื่อ"}
                                            </strong>
                                            <small className="text-muted" style={{ fontSize: '0.8rem' }}>
                                              {reply.created_at && !isNaN(new Date(reply.created_at).getTime())
                                                ? format(new Date(reply.created_at), 'dd/MM/yyyy HH:mm', { locale: th })
                                                : "ไม่ระบุวันที่"}
                                            </small>
                                          </div>
                                          <p className="text-dark mb-0" style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                                            {reply.reply_detail}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
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
                        <div className="alert text-center" style={{ color: "red" }}>
                          <p>คุณต้องเข้าสู่ระบบก่อนจึงจะสามารถแสดงความคิดเห็นได้</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Modal>
          </div>
        </div >

        {/* ส่วนของบริจาค */}
        <div className="home-donate" >
          <h3 id="head-text">
            บริจาค
            <div className="title-underline"></div>
          </h3>
          <div className="container">
            <div className="donate-content">
              {filteredProjects.length === 0 ? (
                <div className="no-projects">
                  <p>ขออภัย ไม่มีโครงการบริจาคในขณะนี้</p>
                </div>
              ) : (
                <div className="donate-content-home-grid">
                  {filteredProjects.slice(0, 3).map((project) => {
                    const now = new Date();
                    const startDate = project?.start_date ? new Date(project.start_date) : null;
                    const endDate = project?.end_date ? new Date(project.end_date) : null;
                    const formattedStartDate = startDate?.toLocaleDateString("th-TH") || "-";
                    const formattedEndDate = endDate?.toLocaleDateString("th-TH") || "-";
                    const progress = project.target_amount > 0
                      ? (project.current_amount / project.target_amount) * 100
                      : 0;
                    const daysRemaining = calculateDaysRemaining(endDate);
                    const isExpired = endDate && now > endDate;
                    const isUpcoming = startDate && now < startDate;

                    return (
                      <div
                        className={`donate-project-card ${isExpired ? "expired" : ""}`}
                        key={project.project_id}
                      >
                        <div className="donate-project-image">
                          <img
                            src={`http://localhost:3001/uploads/${project.image_path}`}
                            alt={project.project_name}
                            onError={(e) => {
                              e.target.src = "./image/default.jpg";
                            }}
                            loading="lazy"
                          />
                          <div className="donate-status-overlay">
                            {getProjectStatusBadge(project)}
                          </div>
                        </div>

                        <div className="donate-project-content">
                          <div className="donate-project-header">
                            <span
                              className={`donate-tag ${project.donation_type || "default"}`}
                              onClick={() => handleTagClick(project.donation_type)}
                            >
                              {getFilterTitle(project.donation_type)}
                            </span>
                            <small className="donate-project-date">
                              <i className="far fa-calendar-alt me-1"></i>
                              {formattedStartDate} - {formattedEndDate}
                            </small>
                          </div>

                          <h5 className="donate-project-title">
                            {truncateText(project.project_name, 60)}
                          </h5>

                          <p className="donate-project-description">
                            {truncateText(project.description, 120)}
                          </p>

                          {/* Progress section */}
                          <div className="donate-progress-section">
                            {project.donation_type !== "unlimited" &&
                              project.donation_type !== "things" &&
                              project.target_amount > 0 ? (
                              <div>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <small className="text-muted">ความคืบหน้า</small>
                                  <span className="donate-progress-percentage">
                                    {Math.round(progress)}%
                                  </span>
                                </div>
                                <div className="bar">
                                  <div className="progress-bar-container">
                                    <div
                                      className="progress-bar"
                                      style={{ width: `${Math.min(progress, 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div style={{ height: "52px" }}>{/* div เปล่าเพื่อรักษาความสูง */}</div>
                            )}
                          </div>

                          {/* Amount details */}
                          <div className="donate-amounts">
                            <div className="donate-current-amount">
                              <small>ยอดบริจาคปัจจุบัน:</small>
                              <strong className="text-success">
                                ฿{formatCurrency(project.current_amount || 0)}
                              </strong>
                            </div>

                            {(project.donation_type !== "unlimited" &&
                              project.donation_type !== "things" &&
                              project.target_amount > 0) && (
                                <div className="donate-target-amount">
                                  <small>เป้าหมาย:</small>
                                  <strong>
                                    ฿{formatCurrency(project.target_amount || 0)}
                                  </strong>
                                </div>
                              )}
                          </div>

                          {/* Days remaining */}
                          <div className="donate-days-remaining">
                            {isUpcoming ? (
                              <span className="donate-upcoming">
                                <FaRegClock className="me-1" />
                                กำลังจะเริ่มในอีก {Math.ceil((startDate - now) / (1000 * 60 * 60 * 24))} วัน
                              </span>
                            ) : isExpired ? (
                              <span className="donate-expired">
                                <FaRegClock className="me-1" />
                                โครงการสิ้นสุดแล้ว
                              </span>
                            ) : daysRemaining !== null ? (
                              <span className={`donate-remaining ${daysRemaining <= 7 ? "warning" : "success"}`}>
                                <FaRegClock className="me-1" />
                                เหลืออีก {daysRemaining} วัน
                              </span>
                            ) : (
                              <span className="text-muted">ไม่จำกัดเวลา</span>
                            )}
                          </div>
                        </div>

                        <div className="donate-project-footer">
                          <button
                            className={`btn donate-action-button ${isExpired
                              ? "btn-detail"
                              : isUpcoming
                                ? "btn-secondary"
                                : "btn-primary"
                              } rounded-pill px-3`}
                            disabled={isUpcoming}
                            onClick={() => {
                              if (!isUpcoming) {
                                navigate(`/donate/donatedetail/${project.project_id}`);
                              }
                            }}
                          >
                            {isExpired
                              ? "ดูรายละเอียด"
                              : isUpcoming
                                ? "กำลังจะเริ่ม"
                                : <>
                                  บริจาคเลย
                                  <FaArrowRight className="ms-2" size={14} />
                                </>
                            }
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Alternative: Bottom Section with Stats and Button */}
            {filteredProjects.length > 0 && (
              <div className="pt-3 border-top">
                <div className="row align-items-center">
                  <div className="col-12 text-end">
                    <a href="/donate" className="btn btn-outline-primary btn-sm">
                      ดูโครงการทั้งหมด
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ div>

        {/* ส่วนของสมาคม*/}
        <div className="home-about py-5" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
          <div className="container">
            {/* Enhanced Header */}
            <div className="text-center mb-5">
              <div className="d-inline-block position-relative">
                <h3 id="head-text" className="text-center mb-3 position-relative">
                  เกี่ยวกับสมาคม
                  <div className="title-underline position-absolute start-50 translate-middle-x mt-2"
                    style={{
                      width: '120px',
                      height: '4px',
                      background: 'linear-gradient(90deg, #007bff, #6610f2)',
                      borderRadius: '2px',
                      boxShadow: '0 2px 8px rgba(0,123,255,0.3)'
                    }}>
                  </div>
                </h3>

                {/* Decorative elements */}
                <div className="position-absolute top-0 start-0 translate-middle">
                  <div className="bg-primary opacity-25 rounded-circle"
                    style={{ width: '20px', height: '20px' }}>
                  </div>
                </div>
                <div className="position-absolute top-0 end-0 translate-middle">
                  <div className="bg-success opacity-25 rounded-circle"
                    style={{ width: '15px', height: '15px' }}>
                  </div>
                </div>
              </div>

              <p className="text-muted mt-3" style={{ fontSize: '1.1rem', fontStyle: 'italic' }}>
                สมาคมศิษย์เก่าวิทยาลัยการคอมพิวเตอร์ มหาวิทยาลัยขอนแก่น
              </p>
            </div>

            {/* Enhanced Main Card */}
            <div className="card shadow-lg border-0 overflow-hidden position-relative"
              style={{
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                border: '1px solid rgba(0,123,255,0.1)'
              }}>

              {/* Decorative corner elements */}
              <div className="position-absolute top-0 start-0 bg-primary opacity-75"
                style={{ width: '60px', height: '60px', clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}>
              </div>
              <div className="position-absolute top-0 end-0 bg-success opacity-75"
                style={{ width: '40px', height: '40px', clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}>
              </div>

              {/* Enhanced Image Section */}
              <div className="position-relative">
                <img
                  src="/image/about_cp.jpg"
                  className="img-fluid w-100"
                  alt="ภาพสมาคม"
                  style={{
                    maxHeight: "450px",
                    objectFit: "cover",
                    filter: 'brightness(0.95) contrast(1.05)'
                  }}
                />

                {/* Image overlay with gradient */}
                <div className="position-absolute bottom-0 start-0 end-0 p-4"
                  style={{
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                    color: 'white'
                  }}>
                  <div className="text-center">
                    <h5 className="mb-0 fw-bold" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                      🏛️ วิทยาลัยการคอมพิวเตอร์ มหาวิทยาลัยขอนแก่น
                    </h5>
                  </div>
                </div>
              </div>

              <div className="card-body p-5">
                {/* Enhanced Title */}
                <div className="text-center mb-4">
                  <h4 className="card-title fw-bold mb-3 position-relative d-inline-block"
                    style={{
                      color: '#2c3e50',
                      fontSize: '1.8rem',
                      lineHeight: '1.3'
                    }}>
                    สมาคมศิษย์เก่าวิทยาลัยการคอมพิวเตอร์ มหาวิทยาลัยขอนแก่น
                    <div className="position-absolute bottom-0 start-50 translate-middle-x bg-primary"
                      style={{ width: '60px', height: '3px', borderRadius: '2px' }}>
                    </div>
                  </h4>
                </div>

                {/* Enhanced Description */}
                <div className="mb-5">
                  <p className="card-text text-muted text-center lh-lg px-3"
                    style={{
                      fontSize: '1.1rem',
                      textAlign: 'justify',
                      textIndent: '2rem'
                    }}>
                    สมาคมศิษย์เก่ามหาวิทยาลัยขอนแก่นก่อตั้งขึ้นเพื่อเสริมสร้างเครือข่ายและความร่วมมือระหว่างศิษย์เก่า
                    ศิษย์ปัจจุบัน และคณาจารย์ รวมถึงสนับสนุนการพัฒนาด้านเทคโนโลยีสารสนเทศ
                    ส่งเสริมโอกาสทางอาชีพ และให้การสนับสนุนแก่ศิษย์ปัจจุบันในการศึกษาวิจัยและนวัตกรรม
                  </p>
                </div>

                {/* Enhanced Vision Section */}
                <div className="row mb-5">
                  <div className="col-12">
                    <div className="card border-primary border-2 bg-light-subtle h-100">
                      <div className="card-header bg-primary text-white text-center py-3">
                        <h5 className="mb-0 fw-bold">
                          <i className="fas fa-eye me-2"></i>
                          วิสัยทัศน์
                        </h5>
                      </div>
                      <div className="card-body text-center py-4">
                        <blockquote className="blockquote mb-0">
                          <p className="fw-bold text-primary" style={{ fontSize: '1.3rem', fontStyle: 'italic' }}>
                            "เชื่อมโยงศิษย์เก่า ก้าวทันเทคโนโลยี สนับสนุนสังคมดิจิทัล"
                          </p>
                        </blockquote>
                        {/* <div className="mt-3">
                          <div className="d-inline-block bg-primary opacity-25 rounded-circle me-2"
                            style={{ width: '8px', height: '8px' }}>
                          </div>
                          <div className="d-inline-block bg-success opacity-25 rounded-circle me-2"
                            style={{ width: '8px', height: '8px' }}>
                          </div>
                          <div className="d-inline-block bg-warning opacity-25 rounded-circle"
                            style={{ width: '8px', height: '8px' }}>
                          </div>
                        </div> */}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Mission Section */}
                <div className="mb-5">
                  <div className="text-center mb-4">
                    <h5 className="fw-bold text-dark position-relative d-inline-block"
                      style={{ fontSize: '1.5rem' }}>
                      <i className="fas fa-bullseye me-2"></i>
                      พันธกิจของสมาคม
                      <div className="position-absolute bottom-0 start-50 translate-middle-x bg-success"
                        style={{ width: '40px', height: '2px', borderRadius: '1px' }}>
                      </div>
                    </h5>
                  </div>

                  <div className="row g-3">
                    {[
                      {
                        icon: "🤝",
                        title: "เครือข่ายศิษย์เก่า",
                        description: "สร้างเครือข่ายศิษย์เก่าเพื่อส่งเสริมความร่วมมือด้านอาชีพ"
                      },
                      {
                        icon: "📚",
                        title: "วิชาการและวิจัย",
                        description: "สนับสนุนกิจกรรมวิชาการและการวิจัยทางคอมพิวเตอร์"
                      },
                      {
                        icon: "💼",
                        title: "โอกาสทางอาชีพ",
                        description: "ส่งเสริมโอกาสด้านอาชีพและการประกอบธุรกิจของศิษย์เก่า"
                      },
                      {
                        icon: "🎓",
                        title: "ทุนการศึกษา",
                        description: "ให้ทุนสนับสนุนการศึกษาและพัฒนาศิษย์ปัจจุบัน"
                      },
                      {
                        icon: "🏫",
                        title: "สานสัมพันธ์",
                        description: "จัดกิจกรรมสานสัมพันธ์ศิษย์เก่ากับคณะและมหาวิทยาลัย"
                      }
                    ].map((mission, index) => (
                      <div key={index} className="col-md-6 col-lg-4">
                        <div className="card h-100 border-0 shadow-sm position-relative overflow-hidden"
                          style={{
                            borderRadius: '15px',
                            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
                          }}>

                          {/* Card accent */}
                          <div className="position-absolute top-0 start-0 end-0 bg-primary"
                            style={{ height: '4px', borderRadius: '15px 15px 0 0' }}>
                          </div>

                          <div className="card-body p-4 text-center">
                            <div className="mb-3">
                              <span style={{ fontSize: '2.5rem' }}>{mission.icon}</span>
                            </div>
                            <h6 className="card-title fw-bold text-dark mb-2">
                              {mission.title}
                            </h6>
                            <p className="card-text text-muted small lh-base">
                              {mission.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Enhanced Call to Action */}
                <div className="text-center mt-5">
                  <div className="d-inline-block position-relative">
                    <button
                      className="btn btn-primary px-5 py-3 fw-bold position-relative overflow-hidden"
                      onClick={() => navigate("/about")}
                      style={{
                        fontSize: '1.1rem',
                        borderRadius: '25px',
                        background: 'linear-gradient(45deg, #007bff, #6610f2)',
                        border: '2px solid transparent',
                        boxShadow: '0 4px 15px rgba(0,123,255,0.3)',
                        transition: 'all 0.3s ease',
                        textTransform: 'none',
                        letterSpacing: '0.5px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-3px)';
                        e.target.style.boxShadow = '0 8px 25px rgba(0,123,255,0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 15px rgba(0,123,255,0.3)';
                      }}
                    >
                      <i className="fas fa-history me-2"></i>
                      📖 ประวัติความเป็นมา

                      {/* Button shine effect */}
                      <div className="position-absolute top-0 start-0 w-100 h-100 opacity-25"
                        style={{
                          background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)',
                          transform: 'translateX(-100%)',
                          transition: 'transform 0.6s ease'
                        }}>
                      </div>
                    </button>

                    {/* Decorative elements around button */}
                    <div className="position-absolute top-0 start-0 translate-middle">
                      <div className="bg-warning opacity-50 rounded-circle"
                        style={{ width: '12px', height: '12px', animation: 'pulse 2s infinite' }}>
                      </div>
                    </div>
                    <div className="position-absolute bottom-0 end-0 translate-middle">
                      <div className="bg-success opacity-50 rounded-circle"
                        style={{ width: '8px', height: '8px', animation: 'pulse 2s infinite 0.5s' }}>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section >
    </div >
  )
}

export default AlumniHome;
