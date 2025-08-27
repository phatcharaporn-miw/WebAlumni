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

return (
    <div className="container py-5">
        <div className="row justify-content-center">
            <div className="col-lg-8 col-md-10">
                <div className="card shadow-lg border-0 rounded-4">                
                    <div className="card-header bg-primary text-white text-center py-3 rounded-top-4">
                        <h3 className="mb-0">แก้ไขข่าวประชาสัมพันธ์</h3>
                    </div>         
                {loading ? (
                    <p className="text-center mt-5 text-muted">กำลังโหลดข้อมูล...</p>
                ) : news ? (
                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit} className="needs-validation">
                                {/* หัวข้อข่าว */}
                                <div className="mb-3">
                                    <label htmlFor="title" className="form-label fw-semibold">
                                        หัวข้อข่าว <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control rounded-3 w-100"
                                        id="title"
                                        name="title"
                                        placeholder="พิมพ์หัวข้อข่าว"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                {/* เนื้อหาข่าว */}
                                <div className="mb-3">
                                    <label htmlFor="content" className="form-label fw-semibold">
                                        เนื้อหาข่าว <span className="text-danger">*</span>
                                    </label>
                                    <textarea
                                        className="form-control rounded-3 w-100"
                                        id="content"
                                        name="content"
                                        rows="6"
                                        placeholder="พิมพ์เนื้อหาข่าว..."
                                        value={formData.content}
                                        onChange={handleChange}
                                        required
                                    ></textarea>
                                </div>

                                {/* อัปโหลดภาพ */}
                                <div className="mb-4">
                                    <label htmlFor="images" className="form-label fw-semibold">
                                        อัปโหลดภาพ (ถ้ามี)
                                    </label>
                                    <input
                                        type="file"
                                        className="form-control rounded-3 w-100"
                                        id="images"
                                        name="images"
                                        multiple
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                    <small className="text-muted">รองรับไฟล์ .jpg, .png, .jpeg</small>
                                </div>

                                {/* ปุ่ม */}
                                <div className="d-flex justify-content-end gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary px-4 rounded-3"
                                        onClick={() => navigate('/admin/news')}
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary px-4 rounded-3 shadow-sm"
                                    >
                                        บันทึกการแก้ไข
                                    </button>
                                </div>
                            </form>
                        </div>
                ) : (
                    <p className="text-center mt-5 text-muted">ไม่พบข้อมูลข่าว</p>
                )}
            </div>
        </div>
    </div>
    </div>
);


}

export default EditNews;