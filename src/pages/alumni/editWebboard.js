import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IoIosAdd } from "react-icons/io";
import Swal from "sweetalert2";

function EditWebboard() {
    const { webboardId } = useParams();
    const navigate = useNavigate();
    const [category, setCategory] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        image_path: '',
        category_id: ''
    });

    // ดึงข้อมูลกระทู้ที่ต้องการแก้ไข
    useEffect(() => {
        axios.get(`http://localhost:3001/users/webboard/${webboardId}`)
            .then((response) => {
                if (response.data.success) {
                    setFormData(response.data.data);
                } else {
                    Swal.fire("ไม่พบกระทู้", "กรุณาลองใหม่อีกครั้ง", "error");
                    navigate("/alumni-profile-webboard");
                }
            })
            .catch((error) => {
                console.error('เกิดข้อผิดพลาดในการโหลดกระทู้:', error);
            });
    }, [webboardId, navigate]);

    // อัปเดตค่า input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    // ฟังก์ชันอัปโหลดรูปภาพ
    const handleFileChange = (e) => {
        setFormData((prevData) => ({ ...prevData, image_path: e.target.files[0] }));
    };

    // ฟังก์ชันส่งข้อมูลแก้ไข
    const handleSubmit = (e) => {
        e.preventDefault();

        const formDataToSend = new FormData();
        formDataToSend.append("title", formData.title);
        formDataToSend.append("content", formData.content);
        formDataToSend.append("category_id", formData.category_id);
        if (formData.image_path instanceof File) {
            formDataToSend.append("image_path", formData.image_path);
        }

        axios.put(`http://localhost:3001/users/edit-webboard/${webboardId}`, formDataToSend, {
            headers: { "Content-Type": "multipart/form-data" },
        })
            .then((response) => {
                if (response.data.success) {
                    Swal.fire({
                        title: "สำเร็จ!",
                        text: "แก้ไขกระทู้สำเร็จ!",
                        icon: "success",
                        confirmButtonColor: "#0F75BC",
                        confirmButtonText: "ตกลง",
                    }).then(() => {
                        navigate("/alumni-profile-webboard");
                    });
                }
            })
            .catch((error) => {
                Swal.fire({
                    title: "เกิดข้อผิดพลาด!",
                    text: "ไม่สามารถแก้ไขกระทู้ได้",
                    icon: "error",
                    confirmButtonColor: "#d33",
                    confirmButtonText: "ตกลง",
                });
                console.error("เกิดข้อผิดพลาดในการแก้ไข:", error);
            });
    };

    // ดึงหมวดหมู่
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

    // ตรวจสอบว่าข้อมูลโหลดครบก่อน render form
    if (!formData.title) {
        return <p className="text-center mt-5">กำลังโหลดข้อมูล...</p>;
    }

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card shadow-sm border-0 rounded-4">
                        <div className="card-header bg-primary text-white text-center rounded-top-4">
                            <h3 className="mb-0">แก้ไขกระทู้ที่สร้าง</h3>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label fw-bold">หัวข้อกระทู้</label>
                                    <input
                                        type="text"
                                        className="form-control w-100"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-bold">เนื้อหากระทู้</label>
                                    <textarea
                                        className="form-control w-100"
                                        name="content"
                                        rows="5"
                                        value={formData.content}
                                        onChange={handleChange}
                                        required
                                    ></textarea>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-bold">รูปภาพ</label>
                                    <input type="file" className="form-control w-100" onChange={handleFileChange} />
                                    {formData.image_path && (
                                        <div className="mt-2">
                                            <img
                                                src={`http://localhost:3001/${formData.image_path.replace(/^\/+/, '')}`}
                                                alt="Webboard"
                                                className="img-fluid rounded"
                                                width="200"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-bold">เลือกหมวดหมู่ </label>
                                    <select
                                        className="form-control w-100"
                                        name="category_id"
                                        value={formData.category_id}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">เลือกหมวดหมู่</option>
                                        {Array.isArray(category) && category.length > 0 ? (
                                            category.map(category => (
                                                <option key={category.category_id} value={category.category_id}>
                                                    {category.category_name}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="" disabled>ไม่มีหมวดหมู่</option>
                                        )}
                                    </select>
                                </div>
                                <div className="d-flex justify-content-end">
                                    <button type="submit" className="btn btn-primary me-2">บันทึกการแก้ไข</button>
                                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/alumni-profile-webboard')}>
                                        ยกเลิก
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditWebboard;