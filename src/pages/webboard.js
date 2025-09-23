import React, { useState, useEffect } from "react";
import { useLocation, useParams } from 'react-router-dom';
import Modal from 'react-modal';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../css/webboard.css';
import { SlHeart } from "react-icons/sl";
import { MdFavorite } from "react-icons/md";
import { BiSolidComment } from "react-icons/bi";
import { MdEdit } from "react-icons/md";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
// import moment from "moment";
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import Swal from "sweetalert2";
import { MdDelete } from "react-icons/md";
import { useAuth } from "../context/AuthContext";
Modal.setAppElement('#root');


function Webboard() {
  const { id } = useParams(); // ถ้าคุณใช้ route แบบ /webboard/:id
  const { categoryId } = useParams();
  const location = useLocation();
  const [webboard, setWebboard] = useState([]);
  const [sortOrder, setSortOrder] = useState("latest");
  const [likedPosts, setLikedPosts] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [category, setCategory] = useState([]);
  const [showReplyForm, setShowReplyForm] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null); // เก็บ comment_id ที่กำลังตอบกลับ
  const [replyText, setReplyText] = useState(''); // เก็บข้อความตอบกลับ
  const [recommendedPosts, setRecommendedPosts] = useState([]); //กระทู้ที่แนะนำ
  const [searchTerm, setSearchTerm] = useState("");
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.id) {
      setIsLoggedin(true);
      // console.log("ผู้ใช้ล็อกอินแล้ว");
    } else {
      setIsLoggedin(false);
      // console.log("ผู้ใช้ยังไม่ได้ล็อกอิน"); 
    }
  }, [user]);

  //ดึงข้อมูล webboard
  useEffect(() => {
    axios.get('http://localhost:3001/web/webboard', {
      withCredentials: true,
    })
      .then((response) => {
        if (response.data.success) {

          setWebboard(response.data.data);

          // สุ่มเลือกกระทู้แนะนำ (เช่น 3 กระทู้)
          const randomPosts = getRandomPosts(response.data.data, 3);
          setRecommendedPosts(randomPosts);
        } else {
          console.error("เกิดข้อผิดพลาดในการดึงข้อมูลกระทู้:", response.data.message);
        }
      })
      .catch((error) => {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลกระทู้:', error.message);
      });
  }, []);

  const getRandomPosts = (posts, count) => {
    const shuffled = [...posts].sort(() => 0.5 - Math.random()); // สุ่มเรียงลำดับ
    return shuffled.slice(0, count); // เลือกจำนวนที่ต้องการ
  };

  //เรียงลำดับโพสต์ตามวันที่
  const sortedPosts = [...webboard].sort((a, b) => {
    if (sortOrder === "latest") return new Date(b.created_at) - new Date(a.created_at);
    if (sortOrder === "oldest") return new Date(a.created_at) - new Date(b.created_at);
    return 0;
  });

  // ดึงข้อมูลกดใจกระทู้เมื่อผู้ใช้เข้าสู่ระบบ
  useEffect(() => {
    // const userId = sessionStorage.getItem('userId');

    if (isLoggedin && user && user.id) {
      axios.get(`http://localhost:3001/web/favorite`, {
        params: { userId: user.id },
        withCredentials: true,
      })
        .then((response) => {
          if (response.data.success) {
            // เก็บข้อมูล ID ของกระทู้ที่ถูกใจ
            setLikedPosts(response.data.likedPosts.map(post => post.webboard_id));
          } else {
            console.error("ไม่พบกระทู้ที่ถูกใจ:", response.data.message);
            setLikedPosts([]); // ตั้งค่าเป็น [] ถ้าไม่มีข้อมูล
          }
        })
        .catch((error) => {
          console.error("เกิดข้อผิดพลาดในการโหลดกระทู้ที่ถูกใจ:", error);
          setLikedPosts([]);
        });
    }
  }, [isLoggedin, user]);

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

    // ส่งคำขอกดถูกใจหรือยกเลิกถูกใจ
    axios.post(`http://localhost:3001/web/webboard/${postId}/favorite`, {}, {
      withCredentials: true,
    })
      .then((response) => {
        const { status } = response.data;

        // อัปเดตสถานะของโพสต์ที่ถูกใจ
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
      .catch((error) => {
        console.error("เกิดข้อผิดพลาดในการกดถูกใจ:", error);
      });
  };

  // เมื่อมีการกดคลิกกระทู้
  const handlePostClick = async (post) => {
    if (selectedPost && selectedPost.webboard_id === post.webboard_id) {
      setModalIsOpen(true);
      return;
    }

    try {
      // อัปเดต UI ทันทีก่อน 
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

        const userProfileImage = user.image_path || "/default-profile.png";
        const userId = user.id || null;

        const formattedNewComment = {
          ...newComment,
          profile_image: newComment.profile_image || userProfileImage,
          full_name: newComment.full_name, // ใช้ full_name จาก backend
          user_id: newComment.user_id || userId, // ใช้ user_id จาก backend 
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

    try {
      const response = await axios.post(
        `http://localhost:3001/web/webboard/${selectedPost.webboard_id}/comment/${commentId}/reply`,
        {
          comment_id: commentId,
          reply_detail: replyText.trim(),
          user_id: user.id
        },
        {
          withCredentials: true
        }
      );

      // console.log("Reply response:", response.data);

      // ตรวจสอบ response ที่ได้รับ
      if (response.status === 200 || response.status === 201) {
        // อัปเดต selectedPost state ทันที
        setSelectedPost(prevPost => {
          const updatedComments = prevPost.comments.map(comment => {
            if (comment.comment_id === commentId) {
              // สร้าง reply object ใหม่
              const newReply = {
                reply_id: response.data.reply_id || response.data.data?.reply_id || Date.now(),
                comment_id: commentId,
                user_id: user.id,
                reply_detail: replyText.trim(),
                created_at: new Date().toISOString(),
                full_name: user.fullName || "คุณ",
                profile_image: user.image_path || "uploads/default-profile.png"
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

        // แสดงข้อความสำเร็จ
        console.log("ส่งการตอบกลับสำเร็จ");

      } else {
        console.error("Response status not OK:", response.status);
        alert("เกิดข้อผิดพลาดในการส่งการตอบกลับ");
      }

    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการส่งการตอบกลับ:", error);

      // ตรวจสอบรายละเอียดของ error
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
        alert(`เกิดข้อผิดพลาด: ${error.response.data.message || 'ไม่สามารถส่งการตอบกลับได้'}`);
      } else if (error.request) {
        console.error("No response received:", error.request);
        alert("ไม่สามารถติดต่อเซิร์ฟเวอร์ได้");
      } else {
        console.error("Error:", error.message);
        alert("เกิดข้อผิดพลาดในการส่งการตอบกลับ");
      }
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
      // Swal.fire({
      //   title: "ยืนยันการลบ",
      //   text: "คุณต้องการลบการตอบกลับนี้หรือไม่?",
      //   icon: "warning",
      //   showCancelButton: true,
      //   confirmButtonColor: "#d33",
      //   cancelButtonColor: "#3085d6",
      //   confirmButtonText: "ใช่, ลบเลย",
      //   cancelButtonText: "ยกเลิก",
      // })
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

  // search เปิด modal ถ้ามี id
  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:3001/web/webboard/${id}`, {
        withCredentials: true
      })
        .then((res) => {
          if (res.data.success) {
            setSelectedPost(res.data.data); // ใส่ข้อมูล post
            setModalIsOpen(true); // เปิด modal
          } else {
            console.error("ไม่พบกระทู้");
          }
        })
        .catch((err) => {
          console.error("โหลดกระทู้ผิดพลาด:", err);
        });
    }
  }, [id]);

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedPost(null);
    navigate("/webboard"); // ปิดแล้วกลับหน้า list
  };

  // ดึงcategory
  useEffect(() => {
    axios.get(`http://localhost:3001/category/category-all`, {
      withCredentials: true
    })
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

  const POSTS_PER_PAGE = 4;
  const [currentPage, setCurrentPage] = useState(1);

  // คำนวณโพสต์ที่จะแสดงในหน้านี้
  const filteredPosts = sortedPosts.filter(post =>
    (!showFavorites || (Array.isArray(likedPosts) && likedPosts.includes(post.webboard_id))) &&
    (post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.full_name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <section className="container">
      <div className="webboard-page">
        <div className="text-center mb-5">
          <div className="d-inline-block position-relative">
            <h3 id="head-text" className="text-center mb-3 position-relative">
              {showFavorites ? "กระทู้ที่กดใจ" : "กระทู้ทั้งหมด"}
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
        </div>
      </div>
      <div className="d-flex align-items-center mb-3" style={{ gap: 16 }}>
        <select
          className="border rounded p-2"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          style={{ minWidth: 120 }}
        >
          <option value="latest">ล่าสุด</option>
          <option value="oldest">เก่าสุด</option>
        </select>
        <div style={{ flex: 1 }}></div>
        <input
          type="text"
          className="form-control"
          style={{ maxWidth: 350, marginLeft: "auto" }}
          placeholder="ค้นหากระทู้หรือเนื้อหา..."
          value={searchTerm}
          onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
        />
      </div>

      <div className="row" id="row-webboard" style={{ position: "relative", minHeight: "700px" }}>
        <div className="col-12 col-lg-8 mb-4" style={{ minHeight: "600px" }}>
          {webboard.length > 0 ? (
            paginatedPosts.map(post => (
              <div key={post.webboard_id} className="card-web shadow-sm p-3 border rounded-4">
                {/* ส่วนหัวของกระทู้ */}
                <div className="d-flex justify-content-between">
                  <span
                    key={post.category_id}
                    className="badge px-3 py-2 me-4 ms-auto" style={{ backgroundColor: getCategoryColor(post?.category_id || 0), color: "white", padding: "5px 10px", borderRadius: "15px", cursor: "pointer" }}
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
                      <p className="text-muted mb-1 small">จากคุณ <span className="fw-semibold">{post.full_name || "ไม่ระบุชื่อ"}</span></p>
                      <p className="text-muted small mb-0">{new Date(post.created_at).toLocaleDateString('th-TH')}</p>
                    </div>
                  </div>

                  <div className="card-body px-0">
                    <p className="card-text mb-3 text-muted">
                      {post.content ? (post.content.length > 100 ? post.content.substring(0, 100) + "..." : post.content) : ""}
                    </p>
                  </div>

                  <div className="d-flex align-items-center mt-4 px-2 text-muted">
                    {/* ความคิดเห็น */}
                    <BiSolidComment className="me-2" />
                    {post.comments_count ?? 0} ความคิดเห็น

                    {/* จำนวนผู้เข้าชม */}
                    <FaEye className="me-2 ms-auto" /> {post.viewCount} ครั้ง
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="d-flex flex-column align-items-center justify-content-center my-5">
              <p className="text-center text-muted fs-5">ยังไม่มีกระทู้ในขณะนี้</p>
            </div>
          )}

        </div>

        {/* Pagination: fix to bottom of .row */}
        {totalPages > 1 && (
          <nav
            className="d-flex justify-content-center"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              marginBottom: "10px",
              zIndex: 10,
            }}
          >
            <ul className="pagination mb-0">
              <li className={`page-item${currentPage === 1 ? ' disabled' : ''}`}>
                <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>&laquo;</button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => (
                <li key={i + 1} className={`page-item${currentPage === i + 1 ? ' active' : ''}`}>
                  <button className="page-link" onClick={() => handlePageChange(i + 1)}>{i + 1}</button>
                </li>
              ))}
              <li className={`page-item${currentPage === totalPages ? ' disabled' : ''}`}>
                <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>&raquo;</button>
              </li>
            </ul>
          </nav>
        )}

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
                  <p className="text-muted mb-1 small">จากคุณ <span className="fw-semibold">{selectedPost.full_name || "ไม่ระบุชื่อ"}</span></p>
                  <p className="text-muted small mb-0">{new Date(selectedPost.created_at).toLocaleDateString('th-TH')}</p>
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
                            {Number(comment.user_id) === Number(user.id) && (
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

                          {/* แสดง Replies - ส่วนที่แก้ไขแล้ว */}
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
                                        <div className="d-flex align-items-center gap-2">
                                          <small className="text-muted" style={{ fontSize: '0.8rem' }}>
                                            {reply.created_at && !isNaN(new Date(reply.created_at).getTime())
                                              ? format(new Date(reply.created_at), 'dd/MM/yyyy HH:mm', { locale: th })
                                              : "ไม่ระบุวันที่"}
                                          </small>
                                          {/* ปุ่มลบ reply - แสดงเฉพาะเจ้าของ */}
                                          {Number(reply.user_id) === Number(user.id) && (
                                            <button
                                              className="btn btn-sm"
                                              onClick={() => handleDeleteReply(reply.reply_id, comment.comment_id)}
                                              style={{ border: "none", background: "none", padding: "0" }}
                                              title="ลบการตอบกลับ"
                                            >
                                              <MdDelete size={16} color="red" />
                                            </button>
                                          )}
                                        </div>
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

        <div className="col-12 col-lg-4 mb-4">
          <button
            className="btn btn-gradient w-100 d-flex align-items-center justify-content-center gap-2 mb-4 shadow-sm"
            style={{
              background: 'linear-gradient(45deg, #0d6efd, #4dabf7)',
              color: 'white',
              fontWeight: '600',
              border: 'none',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'linear-gradient(45deg, #0a58ca, #339af0)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(13, 110, 253, 0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'linear-gradient(45deg, #0d6efd, #4dabf7)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)โ';
            }}

            onClick={() => navigate("/createPost")}
          >
            <MdEdit />
            สร้างกระทู้ใหม่
          </button>

          <div className="d-flex flex-column gap-3">
            <div
              className="d-flex align-items-center text-dark"
              style={{ cursor: "pointer" }}
              onClick={() => setShowFavorites(false)}
            >
              <BiSolidComment className="me-2" /> กระทู้ทั้งหมด
            </div>

            {isLoggedin && (
              <div
                className="d-flex align-items-center text-dark"
                style={{ cursor: "pointer" }}
                onClick={() => setShowFavorites(!showFavorites)}
              >
                {showFavorites ? (
                  <MdFavorite className="text-danger me-2" />
                ) : (
                  <SlHeart className="me-2" />
                )}
                กระทู้ที่กดใจ
              </div>
            )}
          </div>

          <hr className="my-3" />
          <h5 className="recommended-title mb-3">หมวดหมู่ที่เกี่ยวข้อง</h5>

          <div className="d-flex flex-wrap gap-2">
            {category.length > 0 ? (
              category.map((category) => (
                <span
                  key={category.category_id}
                  className="badge px-3 py-2"
                  style={{
                    backgroundColor: getCategoryColor(category.category_id),
                    color: "white",
                    padding: "6px 10px",
                    borderRadius: "15px",
                    cursor: "pointer",
                  }}
                  onClick={() => handleCategoryClick(category.category_id)}
                >
                  {category.category_name}
                </span>
              ))
            ) : (
              <div className="d-flex flex-column align-items-center justify-content-center my-5 w-100">
                <p className="text-center text-muted fs-5">ยังไม่มีหมวดหมู่ในขณะนี้</p>
              </div>
            )}
          </div>

          {/* กระทู้ที่แนะนำ */}
          <div className="recommended-posts mt-5">
            <h5 className="recommended-title mb-3">กระทู้แนะนำ</h5>
            {recommendedPosts.length > 0 ? (
              <div className="row">
                {recommendedPosts.map((post) => (
                  <div key={post.webboard_id} className="col-12 col-md-6 mb-4">
                    <div className="card shadow-sm border-0 rounded-4 h-100 d-flex flex-column">
                      <div className="card-body d-flex flex-column justify-content-between">
                        <div>
                          <h6 className="recommended-post-title mb-2">{post.title}</h6>
                          <p className="text-muted small mb-4">
                            {post.comments_count} ความคิดเห็น • ดู {post.viewCount} ครั้ง
                          </p>
                        </div>
                        <div className="mt-auto text-end">
                          <button
                            className="btn btn-outline-primary btn-sm rounded-pill px-3"
                            onClick={() => handlePostClick(post)}
                          >
                            ดูรายละเอียด
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">ยังไม่มีเว็บบอร์ดที่แนะนำ</p>
            )}
          </div>
        </div>

        {totalPages > 1 && (
          <nav
            className="d-flex justify-content-center"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              marginBottom: "10px"
            }}
          >
            <ul className="pagination mb-0">
              <li className={`page-item${currentPage === 1 ? ' disabled' : ''}`}>
                <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>&laquo;</button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => (
                <li key={i + 1} className={`page-item${currentPage === i + 1 ? ' active' : ''}`}>
                  <button className="page-link" onClick={() => handlePageChange(i + 1)}>{i + 1}</button>
                </li>
              ))}
              <li className={`page-item${currentPage === totalPages ? ' disabled' : ''}`}>
                <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>&raquo;</button>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </section>
  )
}

export default Webboard;
