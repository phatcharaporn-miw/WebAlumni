import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useNavigate } from "react-router-dom";
import { BiSolidComment } from "react-icons/bi";
import { FaEye } from "react-icons/fa";
import "../../css/admin-webboard.css";
import Swal from "sweetalert2";
import Modal from 'react-modal';
import { FaSearch } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";
import { useAuth } from '../../context/AuthContext';
import {HOSTNAME} from '../../config.js';

Modal.setAppElement('#root');

function AdminWebboard() {
    const navigate = useNavigate();
    const [webboard, setWebboard] = useState([]);
    const [sortOrder, setSortOrder] = useState("latest");
    const { user } = useAuth();
    const userRole = user?.role; 
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [likedUsers, setLikedUsers] = useState([]);
    const [modalPostTitle, setModalPostTitle] = useState("");
    const [category, setCategory] = useState([]);

     // filter
      const [searchTerm, setSearchTerm] = useState("");
      const [filter, setFilter] = useState("all");
    //   const [filterStatus, setFilterStatus] = useState("all");
    //   const [filterYear, setFilterYear] = useState("");
    //   const [years, setYears] = useState([]);

    // Function to close the modal
    const closeModal = () => {
        setModalIsOpen(false);
    };

    // Fetching webboard data
    useEffect(() => {
        axios.get(HOSTNAME +'/web/webboard', {
            withCredentials: true
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

    // ดึงcategory
      useEffect(() => {
        axios.get(HOSTNAME + `/category/category-all`, {
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

    // Sorting posts by created date
    const sortedPosts = [...webboard].sort((a, b) => {
        if (sortOrder === "latest") return new Date(b.created_at) - new Date(a.created_at);
        if (sortOrder === "oldest") return new Date(a.created_at) - new Date(b.created_at);
        return 0;
    });


    // Function to delete post
    const handleDeletePost = (postId) => {
        Swal.fire({
            title: "คุณแน่ใจหรือไม่?",
            text: "คุณต้องการลบกระทู้นี้หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "ลบ",
            cancelButtonText: "ยกเลิก",
        }).then((result) => {
            if (result.isConfirmed) {
                axios
                    .delete(HOSTNAME +`/web/webboard/${postId}`, {
                        withCredentials: true,
                    })
                    .then((response) => {
                        if (response.data.success) {
                            setWebboard(webboard.filter((post) => post.webboard_id !== postId));
                            Swal.fire("ลบสำเร็จ!", "กระทู้ถูกลบเรียบร้อยแล้ว", "success");

                            if (userRole === "1") {
                                navigate("/admin/webboard");
                            }
                        } else {
                            Swal.fire("เกิดข้อผิดพลาด!", "ไม่สามารถลบกระทู้ได้", "error");
                        }
                    })
                    .catch((error) => {
                        console.error("เกิดข้อผิดพลาดในการลบกระทู้:", error.message);
                        Swal.fire("เกิดข้อผิดพลาด!", "ไม่สามารถลบกระทู้ได้", "error");
                    });
            }
        });
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
      };
    
      const handleClearFilters = () => {
        setFilter("all");
        setSearchTerm("");
        setSortOrder("latest");
        setCurrentPage(1);
      };
    
      /// แก้ logic การกรอง (filteredPosts) ให้รองรับการกรองตาม category_id แทน donation_type
      const filteredPosts = useMemo(() => {
        let results = webboard.filter((post) => {
          const searchLower = searchTerm.toLowerCase();
          const matchesSearch =
            post.title?.toLowerCase().includes(searchLower) ||
            post.content?.toLowerCase().includes(searchLower) ||
            post.full_name?.toLowerCase().includes(searchLower);
    
          // ถ้า filter เป็น 'all' ให้ผ่านทุกโพสต์
          // ถ้าเป็นค่า category_id ให้เช็ค post.category_id
          const matchesCategory =
            filter === "all" ? true : String(post.category_id) === String(filter);
    
          return matchesSearch && matchesCategory;
        });
    
        // เรียงลำดับตาม sortOrder ที่มีอยู่
        if (sortOrder === "latest") {
          results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else if (sortOrder === "oldest") {
          results.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        }
    
        return results;
      }, [webboard, searchTerm, filter, sortOrder]);

    const formatDate = (dateStr) => {
        if (!dateStr || dateStr === "0000-00-00") return "ไม่ระบุวันที่";
        const date = new Date(dateStr);
        const day = date.getDate();
        const month = date.getMonth() + 1; // เดือนเป็นเลข
        const year = date.getFullYear() + 543; // ปีไทย
        return `${day}/${month}/${year}`;
    };

    // Pagination logic
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6; // จำนวนกิจกรรมต่อหน้า
    const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
    const paginatedPosts = filteredPosts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);


    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    return (
        <div className="webboard-container p-5">
            <h3 className="admin-title">การจัดการเว็บบอร์ด</h3>

            {/* Filters */}
                  <div className="donate-filters">
                    <div className="row g-3">
                      {/* ค้นหา */}
                      <div className="col-md-4">
                        <label htmlFor="search" className="form-label">ค้นหากระทู้:</label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <FaSearch />
                          </span>
                          <input
                            type="text"
                            id="search"
                            className="form-control"
                            // style={{ maxWidth: 350, marginLeft: "auto" }}
                            placeholder="ค้นหากระทู้หรือเนื้อหา..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                          />
                        </div>
                      </div>
            
                      {/* หมวดหมู่ */}
                      <div className="col-md-3">
                        <label htmlFor="category-filter" className="form-label">หมวดหมู่:</label>
                        <select
                          id="category-filter"
                          className="form-select"
                          value={filter}
                          onChange={(e) => { setFilter(e.target.value); setCurrentPage(1); }}
                        >
                          <option value="all">ทั้งหมด</option>
                          {category && category.length > 0 && category.map(cat => (
                            <option key={cat.category_id} value={String(cat.category_id)}>
                              {cat.category_name}
                            </option>
                          ))}
                        </select>
                      </div>
            
                      {/* เรียงลำดับ */}
                      <div className="col-md-3">
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

            <div className="row mb-4">
                <div className="col-md-12 text-end">
                    <button className="btn btn-primary" onClick={() => navigate('/admin/webboard/createPost')}>
                        สร้างกระทู้ใหม่
                    </button>
                </div>
            </div>

            <div className="row">
                {paginatedPosts.length > 0 ? (
                    paginatedPosts.map(post => (
                        <div key={post.webboard_id} className="col-md-4 mb-4 d-flex">
                            <div className="card-webboard shadow-sm border w-100 d-flex flex-column">
                                <div className="card-body d-flex flex-column justify-content-between h-100">
                                    <h5 className="card-title">{post.title}</h5>
                                    <p className="card-text text-muted">
                                        หมวดหมู่: <strong>{post.category_name || "ไม่ระบุหมวดหมู่"}</strong> <br />
                                        จากคุณ {post.full_name || "ไม่ระบุชื่อ"} <br />
                                        วันที่โพสต์: {formatDate(post.created_at)} <br />
                                        {post.liked_users && (
                                            <button
                                                className="btn btn-link btn-sm text-decoration-none "
                                                onClick={() => {
                                                    setLikedUsers(post.liked_users.split(', '));
                                                    setModalPostTitle(post.title);
                                                    setModalIsOpen(true);
                                                }}
                                            >
                                                {/* รายชื่อผู้กดใจในกระทู้: {post.liked_users.split(', ').length} คน */}
                                            </button>
                                        )}
                                    </p>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span>
                                            <BiSolidComment className="me-2" />
                                            {post.comments_count ?? 0} ความคิดเห็น
                                        </span>
                                        <span>
                                            <FaEye className="me-2" />
                                            {post.viewCount} ครั้ง
                                        </span>
                                    </div>

                                    <div className="mt-3 d-flex justify-content-between">
                                        <button
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() => handleDeletePost(post.webboard_id)}
                                        >
                                            ลบ
                                        </button>

                                        <button
                                            className="btn btn-outline-warning btn-sm"
                                            onClick={() => navigate(`/admin/webboard/edit/${post.webboard_id}`)}
                                        >
                                            แก้ไข
                                        </button>
                                        
                                        <button
                                            className="btn btn-outline-info btn-sm"
                                            onClick={() => navigate(`/admin/webboard/${post.webboard_id}`)}
                                        >
                                            ดูรายละเอียด
                                        </button>
                                    </div>
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

            {/* Pagination */}
            {totalPages > 1 && (
                <nav className="d-flex justify-content-center mt-4">
                    <ul className="pagination">
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

            {/* Modal สำหรับแสดงรายชื่อผู้กดใจ */}
            <Modal isOpen={modalIsOpen} onRequestClose={closeModal} className="webboard-modal" style={{ overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)' } }}>
                <div className="modal-header">
                    <h5 className="modal-title">รายชื่อผู้กดใจในกระทู้: {modalPostTitle}</h5>
                    <button type="button" className="btn-close ms-auto" onClick={closeModal}></button>
                </div>
                <div className="modal-body py-3">
                    <ul className="list-group">
                        {likedUsers.length > 0 ? (
                            likedUsers.map((name, index) => (
                                <li key={index} className="list-group-item">
                                    {name}
                                </li>
                            ))
                        ) : (
                            <li className="list-group-item">ไม่มีผู้กดใจ</li>
                        )}
                    </ul>
                </div>
            </Modal>
        </div>
    );
}

export default AdminWebboard;
