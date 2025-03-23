import React, { useState, useEffect } from "react";
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
import moment from "moment";
import Swal from "sweetalert2";


Modal.setAppElement('#root');


function Webboard(){
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
    const [replyText, setReplyText] = useState(""); 
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

    // ดึงข้อมูลกดใจกระทู้เมื่อผู้ใช้เข้าสู่ระบบ
    useEffect(() => {
      const userId = localStorage.getItem('userId');

      if (isLoggedin && userId) {
        axios.get(`http://localhost:3001/web/favorite`, {
          params: { userId },
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
    }, [isLoggedin]);

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

    const toggleReplyForm = (commentId) => {
      setShowReplyForm(showReplyForm === commentId ? null : commentId);
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

    // ลบความคิดเห็น
    const handleDeleteComment = (commentId) => {
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
    
      axios.delete(`http://localhost:3001/web/webboard/${selectedPost.webboard_id}/comment/${commentId}`, {
        withCredentials: true
      })
      .then(() => {
        setSelectedPost((prev) => ({
          ...prev,
          comments: prev.comments.filter((comment) => comment.comment_id !== commentId),
        }));
      })
      .catch((error) => {
        console.error('เกิดข้อผิดพลาดในการลบความคิดเห็น:', error.message);
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
      navigate(`/webboard/${categoryId}`)
  };

    // กำหนดสีหมวดหมู่
    const getCategoryColor = (categoryId) => {
      const id = Number(categoryId);  // แปลงเป็นตัวเลข
      const hue = (id * 137) % 360;
      return `hsl(${hue}, 70%, 60%)`;
  };


    return(
    <section className="container">
        <div className="webboard-page">
            <h3 className="webboard-title">{showFavorites ? "กระทู้ที่กดใจ" : "กระทู้ทั้งหมด"}</h3>
            
        </div>
         
          <select className="border rounded p-2 mb-3" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="latest">ล่าสุด</option>
                <option value="oldest">เก่าสุด</option>
          </select>

          <div className="row justify-content-between" id="row-webboard">
          <div className="col-md-7 mb-4">
                {webboard.length > 0 ? (
                sortedPosts
                .filter(post => !showFavorites || (Array.isArray(likedPosts) && likedPosts.includes(post.webboard_id))) 
                .map(post => (
              <div key={post.webboard_id} className="card-web shadow-sm p-3 border rounded-4">
                {/* ส่วนหัวของกระทู้ */}
                <div className="d-flex justify-content-between">
                  <span 
                  key={post.category_id}
                  className="badge px-3 py-2 ms-auto me-4" style={{ backgroundColor: getCategoryColor(post?.category_id || 0), color: "white", padding: "5px 10px", borderRadius: "6px" , cursor: "pointer"}} 
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

                      <div className="card-body px-0">
                        <p className="card-text mb-3">
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

                        <div className="mt-3">
                            <h6 className="mb-4">ความคิดเห็นทั้งหมด ({selectedPost?.comments?.length || 0})</h6>
                            {selectedPost.comments && selectedPost.comments.length > 0 ? (
                              selectedPost.comments.map((comment, index) => (
                                <div key={index} className="comment-item border p-2 rounded mb-2">
                                  <div className="d-flex align-items-start">
                                    <img 
                                      src={comment.profile_image ? `http://localhost:3001/${comment.profile_image}` : "/default-profile.png"} 
                                      alt="User" 
                                      className="rounded-circle me-2" 
                                      width="40" 
                                      height="40" 
                                    />
                                    <div className="comment-content">
                                      <p className="comment-user mb-1">{comment.full_name || "ไม่ระบุชื่อ"}</p>
                                      <p className="comment-time text-muted small mb-1">{new Date(comment.created_at).toLocaleDateString()}</p>
                                      <p className="comment-text">{comment.comment_detail}</p>
                                      {comment.user_id === localStorage.getItem("userId") && (
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteComment(comment.comment_id)}>ลบ</button>
                                      )}
                                      <button className="btn btn-link btn-sm" onClick={() => toggleReplyForm(comment.comment_id)}>ตอบกลับความคิดเห็น</button>
                                      {showReplyForm === comment.comment_id && (
                                        <div className="d-flex mt-2">
                                          <input 
                                            className="form-control me-3" 
                                            rows="1" 
                                            placeholder="ตอบกลับความคิดเห็นนี้..."
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                          />
                                          <button className="btn btn-primary btn-sm" onClick={() => handleReplySubmit(comment.comment_id, replyText)}>ส่ง</button>
                                        </div>
                                      )}
                                      {comment.replies && comment.replies.length > 0 && (
                                        <div className="replies mt-2">
                                          {comment.replies.map((reply, replyIndex) => (
                                            <div key={replyIndex} className="reply-item border p-2 rounded mb-2">
                                              <div className="d-flex align-items-start">
                                                <img 
                                                  src={reply.profile_image ? `http://localhost:3001/${reply.profile_image}` : "/default-profile.png"} 
                                                  alt="User" 
                                                  className="rounded-circle me-2" 
                                                  width="30" 
                                                  height="30" 
                                                />
                                                <div className="reply-content">
                                                  <p className="reply-user fw-bold mb-1">{reply.full_name || "ไม่ระบุชื่อ"}</p>
                                                  <p className="reply-time text-muted small mb-1">{new Date(reply.created_at).toLocaleDateString()}</p>
                                                  <p className="reply-text">{reply.reply_detail}</p>
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
                                <div className="alert text-center" style={{color: "red"}}>
                                  <p>คุณต้องเข้าสู่ระบบก่อนจึงจะสามารถแสดงความคิดเห็นได้</p>
                                </div>
                              )}
                            </div>
                          </div>
                    </div>
                )}
            </Modal>    

                <div class="col-4">
                    <button 
                    className="btn btn-primary w-100 mb-3" 
                    onClick={() => navigate ("/createPost")}
                    >
                    <MdEdit /> สร้างกระทู้ใหม่
                    </button>
                
                <div className="d-flex flex-column gap-3">
                    <div className="d-flex align-items-center text-dark" style={{ cursor: "pointer" }}
                         onClick={() => setShowFavorites(false)}>
                        <i className="bi bi-chat-left-text me-2"><BiSolidComment /></i> กระทู้ทั้งหมด
                    </div>

                    {/* ตรวจสอบการเข้าสู่ระบบก่อนแสดง 'กระทู้ที่กดใจ' */}
                    {isLoggedin && (
                      <div className="d-flex align-items-center text-dark" style={{ cursor: "pointer" }}
                          onClick={() => setShowFavorites(!showFavorites)}>
                          {showFavorites ? <MdFavorite className="text-danger me-2" /> : <SlHeart className="me-2" />}
                            กระทู้ที่กดใจ
                      </div>
                    )}
                </div>

                <hr className="my-3" />
                  <h5 className="fw-bold mb-3">หมวดหมู่ที่เกี่ยวข้อง</h5>
                  <div className="d-flex flex-wrap gap-2">
                    {category.length > 0 ? (
                    category.map((category) => (
                      <span
                        key={category.category_id}
                        className="badge px-3 py-2"
                        style={{
                          backgroundColor: getCategoryColor(category.category_id), 
                          color: "white", padding: "6px 10px", borderRadius: "6px" , cursor: "pointer"
                        }}
                        onClick={() => handleCategoryClick(category.category_id)}
                      >
                        {category.category_name}
                      </span>
                    ))
                  ) : (
                    <p className="text-muted">ไม่มีหมวดหมู่</p>
                  )}
                  </div>
                </div>
            </div>
    </section>  
    )
}

export default Webboard;
