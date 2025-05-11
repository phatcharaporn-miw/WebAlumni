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
import Swal from "sweetalert2";

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
    const navigate = useNavigate();

    useEffect(() => {
        // ดึงข้อมูลกระทู้ที่มีหมวดหมู่ตรงกับ categoryId
        axios.get(`http://localhost:3001/web/webboard/category/${categoryId}`)
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
  
            //เรียงลำดับโพสต์ตามวันที่
    const sortedPosts = [...webboard].sort((a, b) => {
      if (sortOrder === "latest") return new Date(b.created_at) - new Date(a.created_at);
      if (sortOrder === "oldest") return new Date(a.created_at) - new Date(b.created_at);
      return 0;
    });

      // ดึงข้อมูลกระทู้ที่ถูกกดหัวใจ
      useEffect(() => {
        axios.get('http://localhost:3001/webboard/favorite', { 
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

            <select className="border rounded p-2 mb-3" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="latest">ล่าสุด</option>
                <option value="oldest">เก่าสุด</option>
            </select>
            <div id="box-category">
                  <div className="col-md-7 mb-4">
                    {webboard.length > 0 ? (
                    sortedPosts
                    .filter(post => !showFavorites || likedPosts.includes(post.webboard_id))
                    .map(post => (
                    
                  <div key={post.webboard_id} className="card-web shadow-sm p-3 border rounded-4">
                    {/* ส่วนหัวของกระทู้ */}
                    <div className="d-flex justify-content-between">
                      <span className="badge px-3 py-2 ms-auto me-4" style={{ backgroundColor: getCategoryColor(post?.category_id || 0), color: "white", padding: "5px 10px", borderRadius: "15px" , cursor: "pointer"}} 
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
                      <img src={post.profile_image ? `http://localhost:3001/${post.profile_image}` : "/default-profile.png"}  alt="User" className="rounded-circle me-3" width="50" height="50" onError={(e) => e.target.src = "/default-profile.png"}/>
                        <div>
                          <h5 className="fw-bold mb-1">{post.title}</h5>
                          <p className="text-muted mb-1">จากคุณ <span className="text">{post.full_name || "ไม่ระบุชื่อ"}</span></p>
                          <p className="text-muted small">{new Date(post.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* <img src={post.image_path ? `http://localhost:3001/${post.image_path.replace(/^\/+/, '')}` : "/default-image.png"}   alt="Post" className="img-fluid rounded-3" /> */}


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
                      <span className="badge px-3 py-2 me-4" style={{ backgroundColor: getCategoryColor(selectedPost?.category_id || 0), color: "white", padding: "5px 10px", borderRadius: "15px", cursor: "pointer" }}
                       onClick={() => handleCategoryClick(category.category_id)}>
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

                      <div className="card-body px-0 text-muted">
                        <p className="card-text mb-3 small">
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
                            <h6>ความคิดเห็นทั้งหมด ({selectedPost?.comments?.length || 0}) </h6>
                            {selectedPost.comments && selectedPost.comments.length > 0 ? (
                                selectedPost.comments.map((comment, index) => (
                                    <div key={index} className="border p-3 rounded mb-2" >
                                      <div className="d-flex align-items-center">
                                        <img 
                                          src={comment.profile_image ? `http://localhost:3001/${comment.profile_image}` : "/default-profile.png"} 
                                          alt="User" 
                                          className="rounded-circle me-3" 
                                          width="40" 
                                          height="40" 
                                        />                                       
                                        <div>
                                          <p className="comment-user text-muted">{comment.full_name || "ไม่ระบุชื่อ"}</p>
                                          <p className="comment-time small">{new Date(comment.created_at).toLocaleDateString()}</p>
                                        </div>
                                        
                                      </div>
                                      <p className="comt-text">{comment.comment_detail}</p>
                                        
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted">ยังไม่มีความคิดเห็น</p>
                            )}

                            <div className="d-flex align-items-center py-3">
                                <h6 className="me-2">แสดงความคิดเห็น:</h6>
                                {isLoggedin ? (
                              <>
                                <input className="form-control-comment me-3" rows="3" value={commentText} onChange={(e) => setCommentText(e.target.value)}/> 
                                <button className="btn btn-primary" type="submit" onClick={handleCommentSubmit}>ส่งความคิดเห็น</button>

                              </>
                            ) : (
                              <div className="alert alert-warning text-center">
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