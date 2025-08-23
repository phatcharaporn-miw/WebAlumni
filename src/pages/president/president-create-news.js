import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import axios from 'axios';
import '../../css/admin-news.css';
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function PresidentCreateNews() {
    const [title, setTitle] = useState('');
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

    const customStyles = {
        card: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        },
        cardHeader: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '20px 20px 0 0',
            padding: '30px',
            border: 'none',
        },
        formControl: {
            borderRadius: '12px',
            border: '2px solid #e1e8ed',
            padding: '12px 16px',
            fontSize: '16px',
            transition: 'all 0.3s ease',
            backgroundColor: '#fafbfc',
        },
        button: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '12px',
            padding: '14px 28px',
            fontSize: '16px',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
        },
        label: {
            fontWeight: '600',
            color: '#2c3e50',
            marginBottom: '8px',
        },
        title: {
            fontSize: '28px',
            fontWeight: '700',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        },
        fileInput: {
            borderRadius: '12px',
            border: '2px dashed #667eea',
            padding: '20px',
            backgroundColor: '#f8f9ff',
            transition: 'all 0.3s ease',
        }
    };

    return (
        <div style={customStyles.container}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-8 col-md-10">
                        <div className="card border-0" style={customStyles.card}>
                            <div className="card-header text-white text-center" style={customStyles.cardHeader}>
                                <h3 className="mb-0" style={customStyles.title}>
                                    📰 เพิ่มข่าวประชาสัมพันธ์
                                </h3>
                                <p className="mb-0 mt-2" style={{opacity: 0.9}}>
                                    สร้างและเผยแพร่ข่าวสารสำคัญ
                                </p>
                            </div>
                            <div className="card-body p-4">
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-4">
                                        <label 
                                            htmlFor="title" 
                                            className="form-label d-flex align-items-center"
                                            style={customStyles.label}
                                        >
                                            หัวข้อข่าว 
                                            <span className="text-danger ms-1">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control w-100"
                                            id="title"
                                            name="title"
                                            placeholder="พิมพ์หัวข้อข่าวที่น่าสนใจ..."
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            required
                                            style={customStyles.formControl}
                                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                            onBlur={(e) => e.target.style.borderColor = '#e1e8ed'}
                                        />
                                    </div>
                                    
                                    <div className="mb-4">
                                        <label 
                                            htmlFor="content" 
                                            className="form-label d-flex align-items-center"
                                            style={customStyles.label}
                                        >
                                            เนื้อหาข่าวประชาสัมพันธ์ 
                                            <span className="text-danger ms-1">*</span>
                                        </label>
                                        <textarea
                                            className="form-control w-100"
                                            id="content"
                                            name="content"
                                            rows="6"
                                            placeholder="เขียนเนื้อหาข่าวที่ละเอียดและน่าสนใจ..."
                                            value={formData.content}
                                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                            required
                                            style={customStyles.formControl}
                                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                            onBlur={(e) => e.target.style.borderColor = '#e1e8ed'}
                                        ></textarea>
                                    </div>
                                    
                                    <div className="mb-4">
                                        <label 
                                            htmlFor="images" 
                                            className="form-label d-flex align-items-center"
                                            style={customStyles.label}
                                        >
                                            อัปโหลดรูปภาพประกอบ (ถ้ามี)
                                        </label>
                                        <div 
                                            className="position-relative"
                                            style={customStyles.fileInput}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f4ff'}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = '#f8f9ff'}
                                        >
                                            <input
                                                type="file"
                                                className="form-control w-100"
                                                id="images"
                                                name="images"
                                                accept="image/*"
                                                multiple
                                                onChange={handleFileChange}
                                                style={{
                                                    border: 'none',
                                                    backgroundColor: 'transparent',
                                                    padding: '8px'
                                                }}
                                            />
                                            <div className="text-center mt-2">
                                                <small className="text-muted">
                                                    ลากไฟล์มาวางหรือคลิกเพื่อเลือกรูปภาพ
                                                </small>
                                            </div>
                                        </div>
                                        {formData.images.length > 0 && (
                                            <div className="mt-3">
                                                <small className="text-success">
                                                    ✅ เลือกไฟล์แล้ว {formData.images.length} ไฟล์
                                                </small>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="d-grid">
                                        <button 
                                            type="submit" 
                                            className="btn btn-primary"
                                            style={customStyles.button}
                                            onMouseEnter={(e) => {
                                                e.target.style.transform = 'translateY(-2px)';
                                                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.transform = 'translateY(0)';
                                                e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                                            }}
                                        >
                                            โพสต์ข่าวประชาสัมพันธ์
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PresidentCreateNews;