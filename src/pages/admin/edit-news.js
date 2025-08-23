import React, { useEffect, useState } from "react";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import '../../css/admin-news.css';

function EditNews() {
    const { newsId } = useParams(); // ดึง ID ของกิจกรรมจาก URL
    const navigate = useNavigate();
    const [news, setNews] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        images: [],
    });

    useEffect(() => {
        axios.get(`http://localhost:3001/news/news-id/${newsId}`, { 
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" }
        })
            .then((response) => {
                if (response.data.success) {
                    setNews(response.data.data);
                    setFormData({
                        title: response.data.data.title,
                        content: response.data.data.content,
                        image: null, // ไม่ต้องตั้งค่า image ที่นี่
                    });
                } else {
                    console.error("เกิดข้อผิดพลาดในการดึงข้อมูลข่าว:", response.data.message);
                }
                setLoading(false);
            })
            .catch((error) => {
                console.error("เกิดข้อผิดพลาดในการดึงข้อมูลข่าว:", error.message);
                setLoading(false);
            });
    }
    , [newsId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    }

    const handleFileChange = (event) => {
        setFormData({ ...formData, images: event.target.files }); 
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const updatedFormData = new FormData();
        updatedFormData.append('title', formData.title);
        updatedFormData.append('content', formData.content);
        if (formData.images && formData.images.length > 0) {
            for (let i = 0; i < formData.images.length; i++) {
                updatedFormData.append("images", formData.images[i]); // เพิ่มแต่ละไฟล์แยกกัน
            }
        }
        

        axios.put(`http://localhost:3001/news/edit-news/${newsId}`, updatedFormData, {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" }
        })
            .then((response) => {
                if (response.status === 200) {
                    Swal.fire({
                        icon: "success",
                        title: "สำเร็จ!",
                        text: "แก้ไขข่าวประชาสัมพันธ์สำเร็จ!",
                        confirmButtonText: "ตกลง",
                    }).then(() => {
                        navigate("/admin/news");
                    });
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "เกิดข้อผิดพลาด",
                        text: "ไม่สามารถแก้ไขข่าวประชาสัมพันธ์ได้",
                        confirmButtonText: "ตกลง",
                    });
                }
            })
            .catch((error) => {
                console.error('เกิดข้อผิดพลาดในการแก้ไขข่าวประชาสัมพันธ์:', error.message);
            });
    }

    return(
        <div className="container p-5">
            <div className="row justify-content-center">
                    <h3 className="mb-4 admin-title">แก้ไขข่าวประชาสัมพันธ์</h3>
                {loading ? (
                    <p className="text-center mt-5">กำลังโหลดข้อมูล...</p>
                ) : news ? (
                    <div className="card shadow-lg border-0 col-7">
                        <div className="card-body ">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="title" className="form-label">หัวข้อข่าว <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control w-100"
                                        id="title"
                                        name="title"
                                        placeholder="หัวข้อข่าว"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="content" className="form-label">เนื้อหาข่าว <span className="text-danger">*</span></label>
                                    <textarea
                                        className="form-control w-100"
                                        id="content"
                                        name="content"
                                        rows="5"
                                        placeholder="เนื้อหาข่าว"
                                        value={formData.content}
                                        onChange={handleChange}
                                        required
                                    ></textarea>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="images" className="form-label">อัปโหลดภาพ (ถ้ามี)</label>
                                    <input
                                        type="file"
                                        className="form-control w-100"
                                        id="images"
                                        name="images"
                                        multiple
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>
                                <div className="d-flex justify-content-end g-3">
                                    <button type="submit" className="btn btn-primary">บันทึกการแก้ไข</button>
                                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/news')}>ยกเลิก</button>
                                </div>
                            </form>
                        </div>
                    </div>
                ) : (
                    <p className="text-center mt-5">ไม่พบข้อมูลข่าว</p>
                )}
            </div>            
        </div>
    );
}

export default EditNews;