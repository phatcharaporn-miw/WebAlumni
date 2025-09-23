import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../css/webboard.css';
import { SlHeart } from "react-icons/sl";
import { MdFavorite } from "react-icons/md";
import { BiSolidComment } from "react-icons/bi";
import { IoIosEye } from "react-icons/io";
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

function WebboardFavorite() {
    const [likedPosts, setLikedPosts] = useState([]); // กระทู้ที่กด
    const [favoritePosts, setFavoritePosts] = useState([]);
    const {isLoggedin } = useAuth();
    // const userId = user?.id;

    // ดึงข้อมูลกระทู้ที่ถูกกดหัวใจ
    useEffect(() => {
        axios.get('http://localhost:3001/webboard/favorites', { withCredentials: true })
            .then((response) => {
                if (response.data.success) {
                    setFavoritePosts(response.data.posts);
                    isLoggedin(true);
                }
            })
            .catch((error) => {
                console.error('เกิดข้อผิดพลาดในการดึงข้อมูลกระทู้ที่ถูกกดหัวใจ:', error.message);
            });
    }, []);

    // ฟังก์ชัน Toggle หัวใจ
    const toggleLike = (postId) => {
        if (!isLoggedin) {
            alert("กรุณาเข้าสู่ระบบเพื่อบันทึกการกดถูกใจ");
            return; // ไม่บันทึกสถานะหากไม่ได้เข้าสู่ระบบ
        }

        axios.post(`http://localhost:3001/web/webboard/${postId}/favorite`, {}, {
            withCredentials: true,
        })
            .then(() => {
              console.log('Successfully toggled like for post:', postId);
        })
      };
    
    return(
        <div className="row justify-content-between">
    <div className="col-md-7 mb-4">
      {favoritePosts.length > 0 ? (
        favoritePosts.map((post) => (
          <div key={post.webboard_id} className="card shadow-sm p-3 border rounded-4">
            {/* ส่วนหัวของกระทู้ */}
            <div className="d-flex justify-content-between">
              <span className="badge bg-success px-3 py-2 ms-auto me-4" onClick={(e) => e.stopPropagation()} >
                ประสบการณ์
              </span>
              <span onClick={(e) => { e.stopPropagation(); toggleLike(post.webboard_id); }} style={{ cursor: "pointer" }}>
                {likedPosts.includes(post.webboard_id) ? 
                  <MdFavorite className="fs-5 text-danger" /> : 
                  <SlHeart className="fs-5 text-secondary" />}
              </span>
            </div>

            {/* โปรไฟล์ + ชื่อผู้ใช้ */}
            <div className="d-flex">
              <img src={post.profile_image ? `http://localhost:3001/${post.profile_image}` : "/default-profile.png"} alt="User" className="rounded-circle me-3" width="50" height="50" onError={(e) => e.target.src = "/default-profile.png"} />
              <div>
                <h5 className="fw-bold mb-1">{post.title}</h5>
                <p className="text-muted mb-1">จากคุณ <span className="text">{post.full_name || "ไม่ระบุชื่อ"}</span></p>
                <p className="text-muted small">{new Date(post.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="card-body px-0">
              <p className="card-text text-secondary mb-3">
                {post.content ? (post.content.length > 100 ? post.content.substring(0, 100) + "..." : post.content) : ""}
              </p>
            </div>
            
            {/* รูปภาพประกอบ */}
            {post.image_path && (
              <img src={post.image_path ? `http://localhost:3001/${post.image_path}` : "/default-profile.png"} alt="Post" className="img-fluid rounded-3" />
            )}

            {/* จำนวนความคิดเห็น */}
            <div className="d-flex align-items-center text-primary">
              <BiSolidComment className="me-2 ms-auto" />
              {post.comments_count ?? 0} ความคิดเห็น
            </div>

            {/* จำนวนผู้เข้าชม */}
            <div className="d-flex align-items-center text-primary">
              <IoIosEye className="me-2 ms-auto" /> {post.viewCount} ผู้เข้าชม
            </div>

              </div>
          ))
          ) : (
          <p>ไม่มีกระทู้ที่ถูกกดใจ</p>
          )}
      </div>
      </div>
      );
  };

export default WebboardFavorite;