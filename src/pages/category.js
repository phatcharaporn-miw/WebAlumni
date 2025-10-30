import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from 'axios';
import { BiSolidComment } from "react-icons/bi";
import { FaEye } from "react-icons/fa";
import { MdFavorite } from "react-icons/md";
import { SlHeart } from "react-icons/sl";
import moment from "moment";
import { IoMdClose } from "react-icons/io";
import Modal from "react-modal";
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import Swal from "sweetalert2";
import { MdDelete } from "react-icons/md";
import { useAuth } from '../context/AuthContext';
import {HOSTNAME} from '../config.js';
import { FaSearch } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";
// css
import '../css/webboard.css';
// bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

Modal.setAppElement('#root');

function Category() {
  const { categoryId } = useParams();
  const [sortOrder, setSortOrder] = useState("latest");
  const [webboard, setWebboard] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [category, setCategory] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [favoritePosts, setFavoritePosts] = useState([]);
  const [replyText, setReplyText] = useState(''); // เก็บข้อความตอบกลับ
  const [showReplyForm, setShowReplyForm] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");  
  const {user} = useAuth();
  const userId = user?.user_id;
  const navigate = useNavigate();

  useEffect(() => {
      if (userId) {
        setIsLoggedin(true);
        // console.log("ผู้ใช้ล็อกอินแล้ว");
      } else {
        setIsLoggedin(false);
        // console.log("ผู้ใช้ยังไม่ได้ล็อกอิน"); 
      }
  }, []);

  useEffect(() => {
    // ดึงข้อมูลกระทู้ที่มีหมวดหมู่ตรงกับ categoryId
    axios.get(HOSTNAME + `/web/webboard/category/${categoryId}`)
      .then(response => {

        // console.log('categoryId:', categoryId);             
        if (response.data.success) {
          setWebboard(response.data.data);
          setCategoryName(response.data.categoryName);
        } else {
          console.error("ไม่พบกระทู้ในหมวดหมู่นี้");
        }
      })
      .catch(error => {
        console.error("เกิดข้อผิดพลาดในการดึงกระทู้:", error);
      });
  }, [categoryId]);

  // filter and search
  const handleSearchChange = (e) => {
  setSearchTerm(e.target.value);
};

const handleClearFilters = () => {
  setSearchTerm("");
  setFilter("all"); 
  setSortOrder("latest");
};

  //เรียงลำดับโพสต์ตามวันที่
  const sortedPosts = [...webboard].sort((a, b) => {
    if (sortOrder === "latest") return new Date(b.created_at) - new Date(a.created_at);
    if (sortOrder === "oldest") return new Date(a.created_at) - new Date(b.created_at);
    return 0;
  });

const filteredPosts = sortedPosts.filter(post => {
  const matchesSearch = searchTerm === "" || 
    post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content?.toLowerCase().includes(searchTerm.toLowerCase());

  const matchesFilter = filter === "all" || 
    String(post.category_id) === String(filter);

  return matchesSearch && matchesFilter;
});


  // ดึงข้อมูลกระทู้ที่ถูกกดหัวใจ
  useEffect(() => {
    axios.get(HOSTNAME + '/webboard/favorite', {
      withCredentials: true
    })
      .then((response) => {
        if (response.data.success) {
          setFavoritePosts(response.data.posts);
          setIsLoggedin(true);
        }
      })
      .catch((error) => {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลกระทู้ที่ถูกกดหัวใจ:', error.message);
      });
  }, []);

  // ฟังก์ชัน Toggle หัวใจ
  const toggleLike = (postId) => {
    if (!isLoggedin) {
      return; // ไม่บันทึกสถานะหากไม่ได้เข้าสู่ระบบ
    }

    axios.post(HOSTNAME + `/web/webboard/${postId}/favorite`, {}, {
      withCredentials: true,
    })
      .then((response) => {
        const { status } = response.data;

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
    axios.get(HOSTNAME + `/web/webboard/${post.webboard_id}`, {
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
  
      axios.post(HOSTNAME + `/web/webboard/${selectedPost.webboard_id}/comment`, {
        comment_detail: commentText,
      }, {
        withCredentials: true
      })
        .then((response) => {
          const newComment = response.data.comment; // ปรับตาม response structure
  
          const userProfileImage = user.image_path || "/default-profile.png";
          const userId = user.id;
  
          const formattedNewComment = {
            ...newComment,
            profile_image: newComment.profile_image || userProfileImage,
            full_name: newComment.full_name, // ใช้ full_name จาก backend
            user_id: newComment.user_id || userId, // ใช้ user_id จาก backend หรือ sessionStorage
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

  // ตอบกลับความคิดเห็น
  const handleReplySubmit = async (commentId, replyText) => {

    try {
      const response = await axios.post(
        HOSTNAME + `/web/webboard/${selectedPost.webboard_id}/comment/${commentId}/reply`,
        {
          comment_id: commentId,
          reply_detail: replyText.trim(),
          user_id: userId
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
                user_id: parseInt(userId),
                reply_detail: replyText.trim(),
                created_at: new Date().toISOString(),
                full_name: sessionStorage.getItem("fullName") || "คุณ",
                profile_image: sessionStorage.getItem("image_path") || "uploads/default-profile.png"
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
          .delete(HOSTNAME + `/web/webboard/${selectedPost.webboard_id}/comment/${commentId}`, {
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
    axios.delete(HOSTNAME + `/web/webboard/${selectedPost.webboard_id}/comment/${commentId}/reply/${replyId}`, {
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

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedPost(null);
  }


  const handleCategoryClick = (categoryId) => {
    navigate(`/webboard/category/${categoryId}`)
  };

  // กำหนดสีหมวดหมู่
  const getCategoryColor = (categoryId) => {
    const id = Number(categoryId);  // แปลงเป็นตัวเลข
    const hue = (id * 137) % 360;
    return `hsl(${hue}, 70%, 60%)`;
  };

  return (
    <section className="container">
      <div className="category-page">
        <h3 className="category-title">กระทู้ในหมวดหมู่: {categoryName}</h3>

         {/* Filters */}
      <div className="donate-filters">
        <div className="row g-3">
          {/* ค้นหา */}
          <div className="col-md-6">
            <label htmlFor="search" className="form-label">ค้นหากระทู้:</label>
            <div className="input-group">
              <span className="input-group-text">
                <FaSearch />
              </span>
              <input
                type="text"
                id="search"
                className="form-control"
                placeholder="ค้นหากระทู้หรือเนื้อหา..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          
          {/* เรียงลำดับ */}
          <div className="col-md-4">
            <label htmlFor="sort-order" className="form-label">ลำดับ:</label>
            <select
              id="sort-order"
              className="form-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="latest">ล่าสุด</option>
              <option value="oldest">เก่าสุด</option>
            </select>
          </div>

          {/* ปุ่มล้าง */}
          <div className="col-md-2 d-flex flex-column">
            <label className="form-label invisible">ล้าง</label>
            <button
              className="btn btn-outline-secondary"
              onClick={handleClearFilters}
              title="ล้างตัวกรอง"
            >
              <AiOutlineClose /> ล้าง
            </button>
          </div>
        </div>
  </div>


        <div className="row justify-content-center">
          <div className="col-md-7 mb-4">
            {webboard.length > 0 ? (
              sortedPosts
                .filter(post => !showFavorites || likedPosts.includes(post.webboard_id))
                .map(post => (

                  <div key={post.webboard_id} className="card-web shadow-sm p-3 border rounded-4">
                    {/* ส่วนหัวของกระทู้ */}
                    <div className="d-flex justify-content-between">
                      <span className="badge px-3 py-2 ms-auto me-4" style={{ backgroundColor: getCategoryColor(post?.category_id || 0), color: "white", padding: "5px 10px", borderRadius: "15px", cursor: "pointer" }}
                        onClick={() => handleCategoryClick(category.category_id)}>
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
                        <img src={post.profile_image ? HOSTNAME + `/${post.profile_image}` : "/default-profile.png"} alt="User" className="rounded-circle me-3" width="50" height="50" onError={(e) => e.target.src = "/default-profile.png"} />
                        <div>
                          <h5 className="fw-bold mb-1">{post.title}</h5>
                          <p className="text-muted mb-1">จากคุณ <span className="text">{post.full_name || "ไม่ระบุชื่อ"}</span></p>
                          <p className="text-muted small">{new Date(post.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {/* <img src={post.image_path ? HOSTNAME + `/${post.image_path.replace(/^\/+/, '')}` : "/default-image.png"}   alt="Post" className="img-fluid rounded-3" /> */}


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
                <p className="text-center text-muted fs-5">ยังไม่มีกระทู้ที่อยู่ในหมวดหมู่นี้</p>
              </div>
            )}
          </div>
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
                  src={selectedPost.profile_image ? HOSTNAME + `/${selectedPost.profile_image}` : "/default-profile.png"}
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
                <img src={selectedPost.image_path ? HOSTNAME +` /${selectedPost.image_path.replace(/^\/+/, '')}` : "/default-image.png"} alt="Post" className="img-fluid rounded-3" onError={(e) => e.target.style.display = 'none'} />
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
                            : HOSTNAME +` /${comment.profile_image}`}
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
                            {Number(comment.user_id) === Number(userId) && (
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
                                        : HOSTNAME +` /${reply.profile_image}`}
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
                                          {Number(reply.user_id) === Number(userId) && (
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
      </div>
    </section>
  );
}

export default Category;