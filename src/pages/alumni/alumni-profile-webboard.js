import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useOutletContext } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { SlHeart } from "react-icons/sl";
import { MdFavorite } from "react-icons/md";
import { BiSolidComment } from "react-icons/bi";
import { FaEye } from "react-icons/fa";
import { IoMdMore } from "react-icons/io";
import Swal from "sweetalert2";
// css
import '../../css/profile.css';
// bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


function AlumniProfileWebboard(){
    const [webboard, setWebboard] = useState([]);
    const [profile, setProfile] = useState({});
    const {handleLogout } = useOutletContext();
    const [sortOrder, setSortOrder] = useState("latest");
    const [likedPosts, setLikedPosts] = useState([]); 
    const [isLoggedin, setIsLoggedin] = useState(false);
    const [showFavorites, setShowFavorites] = useState(false);
    const [showMenu, setShowMenu] = useState(null);
    const navigate = useNavigate();

   // ดึงข้อมูลโปรไฟล์
    useEffect(() => {
        axios.get('http://localhost:3001/users/profile', { withCredentials: true })
            .then((response) => {
                if (response.data.success) {
                    setProfile(response.data.user);
                }
            })
            .catch((error) => {
                console.error('เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์:', error.response ? error.response.data.message : error.message);
            });
    }, []);

      // ดึงกระทู้ที่ผู้ใช้เคยสร้าง
    useEffect(() => {
        if (profile && profile.userId) {
            // หาก profile.user_id มีค่าแล้ว, ค่อยทำการดึงข้อมูลกระทู้
            axios.get(`http://localhost:3001/users/webboard-user/${profile.userId}`, { 
                withCredentials: true 
            })
                .then((response) => {
                    if (response.data.success) {
                        setWebboard(response.data.data);
                    }
                })
                .catch((error) => {
                    console.error('เกิดข้อผิดพลาดในการดึงกระทู้ที่สร้าง:', error.response ? error.response.data.message : error.message);
                });
        } 
    }, [profile]);

        //เรียงลำดับโพสต์ตามวันที่
        const sortedPosts = [...webboard].sort((a, b) => {
            if (sortOrder === "latest") return new Date(b.created_at) - new Date(a.created_at);
            if (sortOrder === "oldest") return new Date(a.created_at) - new Date(b.created_at);
            return 0;
        });
       
        const handleClick = () => {
            navigate('/alumni-profile-webboard');
           
        };

         // ฟังก์ชัน Toggle หัวใจ
        const toggleLike = (postId) => {
        axios.post(`http://localhost:3001/web/webboard/${postId}/favorite`, {}, {
          withCredentials: true, 
        })
        .then((response) => {
          const {status} = response.data;
  
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

    const toggleMenu = (postId) => {
        setShowMenu(showMenu === postId ? null : postId);
    }

    const handleEdit = (webboardId) => {
        navigate(`/edit-webboard/${webboardId}`); 
      };
      
      const handleDelete = (webboardId) => {
        Swal.fire({
          title: "คุณแน่ใจหรือไม่?",
          text: "คุณต้องการลบกระทู้นี้ใช่หรือไม่?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          confirmButtonText: "ลบ",
          cancelButtonColor: "#0F75BC",
          cancelButtonText: "ยกเลิก",
        }).then((result) => {
          if (result.isConfirmed) {
            axios
              .delete(`http://localhost:3001/users/delete-webboard/${webboardId}`, {
                withCredentials: true,
              })
              .then((response) => {
                Swal.fire("ลบสำเร็จ!", "กระทู้ของคุณถูกลบแล้ว", "success");
                setWebboard(webboard.filter((post) => post.webboard_id !== webboardId)); // อัปเดต state
              })
              .catch((error) => {
                Swal.fire("เกิดข้อผิดพลาด!", "ไม่สามารถลบกระทู้ได้", "error");
                console.error("เกิดข้อผิดพลาดในการลบ:", error);
              });
          }
        });
      };
      
        // กำหนดสีหมวดหมู่
        const getCategoryColor = (categoryId) => {
          const id = Number(categoryId);  // แปลงเป็นตัวเลข
          const hue = (id * 137) % 360;
          return `hsl(${hue}, 70%, 60%)`;
        };

    return(
    <section className='container'>
        <div className='alumni-profile-page'>
        <h3 className="alumni-title text-center">โปรไฟล์ของฉัน</h3>
            <div className="row justify-content-between" >
                <div className="col-4  bg-light  rounded text-center">
                <img 
                    src={`${profile.profilePicture}`} 
                    alt="Profile" 
                    style={{ width: '140px', height: '140px', borderRadius: '50%' }}
                />
                <p className="mt-3 fw-bold">{profile.fullName}</p>
                <div className="menu mt-4">
                    <div className="menu-item active py-2 mb-2 rounded">ข้อมูลส่วนตัว</div>
                        <div className="menu-item py-2 mb-2 rounded" onClick={handleClick}>กระทู้ที่สร้าง</div>
                        <div className="menu-item py-2 mb-2 rounded">ประวัติการบริจาค</div>
                        <div className="menu-item py-2 mb-2 rounded">ประวัติการเข้าร่วมกิจกรรม</div>
                        <div className="menu-item py-2 mb-2 rounded">ประวัติการสั่งซื้อ</div>
                        <div className="menu-item py-2 rounded" onClick={handleLogout}>ออกจากระบบ</div>      
                    </div>
                </div>
                
                <h3>กระทู้ที่สร้าง</h3>
                <div className="col-md-7 mb-4">
                                {webboard.length > 0 ? (
                                sortedPosts
                                .filter(post => !showFavorites || likedPosts.includes(post.webboard_id))
                                .map(post => (
                                 
                              <div key={post.webboard_id} className="card-web shadow-sm p-3 border rounded-4">
                                {/* ส่วนหัวของกระทู้ */}
                                <div className="d-flex justify-content-between">
                                  <span className="badge px-3 py-2 ms-auto me-4" style={{ backgroundColor: getCategoryColor(post?.category_id || 0), color: "white", padding: "5px 10px", borderRadius: "15px" }}>
                                    {post && post.category_name ? post.category_name : ''}
                                  </span>
                                                  
                                  <span onClick={(e) => { e.stopPropagation(); toggleLike(post.webboard_id); }} style={{ cursor: "pointer" }}>
                                  {likedPosts.includes(post.webboard_id) ?  
                                  <MdFavorite className="fs-5 text-danger" /> : 
                                  <SlHeart className="fs-5 text-secondary" />}
                                  </span>
                                   {/* {post.user_id === profile.user_id && ( */}
                                        <div className="position-relative">
                                        <IoMdMore size={25} className="cursor-pointer ms-3" onClick={() => toggleMenu(post.webboard_id)} />
                                        {showMenu === post.webboard_id && (
                                            <div className="position-absolute bg-white shadow-sm rounded p-2 " style={{ right: 0, top: "30px", minWidth: "100px" , zIndex: 10}}>
                                            <button className="dropdown-item" onClick={() => handleEdit(post.webboard_id)} >แก้ไข</button>
                                            <button className="dropdown-item text-danger" onClick={() => handleDelete(post.webboard_id)}>ลบ</button>
                                            </div>
                                        )}
                                        </div>
                                    {/* )} */}
                                </div>
                
                                <div>
                                  {/* โปรไฟล์ + ชื่อผู้ใช้ */}
                                <div className="d-flex mt-3">
                                  <img src={post.profile_image ? `http://localhost:3001/${post.profile_image}` : "/default-profile.png"}  alt="User" className="rounded-circle me-3" width="50" height="50" onError={(e) => e.target.src = "/default-profile.png"}/>
                                    <div>
                                      <h5 className="fw-bold mb-1">{post.title}</h5>
                                      <p className="text-muted mb-1">จากคุณ <span className="text">{post.full_name || "ไม่ระบุชื่อ"}</span></p>
                                      <p className="text-muted small">{new Date(post.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                
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
            </div>
        </div>     
    </section>
    )
}
export default AlumniProfileWebboard;