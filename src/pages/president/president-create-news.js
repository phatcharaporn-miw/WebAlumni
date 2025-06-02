import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import axios from 'axios';
import '../../css/admin-news.css';
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";


function PresidentCreateNews() {
    const [title, setTitle] = useState('');
    // const [image, setImage] = useState(null);
    const [content, setContent] = useState('');
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        images: [],
    });
    
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        console.log("อัปโหลดรูป:", files);
        setFormData((prevState) => ({
            ...prevState,
            images: files,
        }));
    };
    
    const handleSubmit = async (event) => {
        event.preventDefault();
    
        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('content', formData.content);
    
        formData.images.forEach((img) => {
            formDataToSend.append('images', img);
        });
    
        axios.post('http://localhost:3001/news/create-news', formDataToSend, {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" }
        })
            .then((response) => {
                if (response.status === 200) {
                    Swal.fire("สำเร็จ!", "เพิ่มข่าวประชาสัมพันธ์เรียบร้อยแล้ว", "success");
                    navigate("/news");
                } else {
                    alert('เกิดข้อผิดพลาดในการโพสต์ข่าวประชาสัมพันธ์');
                }
            })
            .catch((error) => {
                console.error('เกิดข้อผิดพลาดในการโพสต์ข่าวประชาสัมพันธ์:', error.message);
            });
    };
    

    

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-lg-6 col-md-10">
                    <div className="card shadow-lg border-0">
                        <div className="card-header bg-primary text-white text-center">
                            <h3 className="mb-0">เพิ่มข่าวประชาสัมพันธ์</h3>
                        </div>
                        <div className="card-body">
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
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="content" className="form-label">เนื้อหาข่าวประชาสัมพันธ์ <span className="text-danger">*</span></label>
                                    <textarea
                                        className="form-control w-100"
                                        id="content"
                                        name="content"
                                        rows="5"
                                        placeholder="เนื้อหาข่าวประชาสัมพันธ์"
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        required
                                    ></textarea>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="images" className="form-label">อัปโหลดรูปภาพประกอบ (ถ้ามี)</label>
                                    <input
                                        type="file"
                                        className="form-control w-100"
                                        id="images"
                                        name="images"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileChange}
                                    />
                                </div>
                                <div className="d-grid">
                                    <button type="submit" className="btn btn-primary">โพสต์ข่าว</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PresidentCreateNews;