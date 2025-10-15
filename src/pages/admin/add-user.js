import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import "../../css/add-user.css";
import { HOSTNAME } from '../../config.js';

function AddUser() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        username: "",
        password: "",
        role: "3",
        image_path: null,
        education: [
            {
                degree: '',
                major: '',
                studentId: '',
                graduation_year: '',
                entry_year: '',
            },
        ],
    });

    const [degrees, setDegrees] = useState([]);
    const [majors, setMajors] = useState([]);

    useEffect(() => {
        axios.get(HOSTNAME + "/admin/degrees").then((res) => setDegrees(res.data));
        axios.get(HOSTNAME + "/admin/majors").then((res) => setMajors(res.data));
    }, []);

    // นำเข้าข้อมูลศิษย์เก่า ไฟล์ excel
    const handleExcelUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("excelFile", file);

        try {
            const res = await axios.post(HOSTNAME + "/alumni/upload-excel", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (res.data.success) {
                Swal.fire("สำเร็จ", "นำเข้าข้อมูลสำเร็จแล้ว!", "success");
            } else {
                Swal.fire("ผิดพลาด", res.data.message || "ไม่สามารถนำเข้าข้อมูลได้", "error");
            }
        } catch (error) {
            console.error(error);
            Swal.fire("ผิดพลาด", "เกิดข้อผิดพลาดในการอัปโหลดไฟล์", "error");
        }
    };


    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "image_path") {
            setFormData({ ...formData, image_path: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    // การเปลี่ยนแปลงข้อมูลการศึกษา
    const handleEducationChange = (index, e) => {
        const { name, value } = e.target;
        const newEducation = [...formData.education];
        newEducation[index][name] = value;
        setFormData({ ...formData, education: newEducation });
    };

    const addEducation = () => {
        setFormData(prev => ({
            ...prev,
            education: [...prev.education, {
                degree: '',
                major: '',
                studentId: '',
                entry_year: '',
                graduation_year: ''
            }]
        }));
    };

    const removeEducation = (index) => {
        if (formData.education.length > 1) {
            setFormData(prev => ({
                ...prev,
                education: prev.education.filter((_, i) => i !== index)
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const sendData = new FormData();
        for (let key in formData) {
            if (key === "education") {
                sendData.append("education", JSON.stringify(formData.education));
            } else {
                sendData.append(key, formData[key]);
            }
        }

        try {
            await axios.post(HOSTNAME + "/admin/add-user", sendData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            Swal.fire("สำเร็จ!", "เพิ่มผู้ใช้เรียบร้อยแล้ว", "success");
            navigate("/admin/users"); // กลับไปหน้ารายชื่อผู้ใช้
        } catch (error) {
            console.error(error);
            Swal.fire("ผิดพลาด!", "ไม่สามารถเพิ่มผู้ใช้ได้", "error");
        }
    };

    return (
        <div className="container p-5">
             <h3 className="admin-title">เพิ่มผู้ใช้ใหม่</h3>

    <div className="mb-3 d-flex justify-content-end align-items-center">
        <label htmlFor="excelUpload" className="btn btn-success">
            นำเข้าข้อมูลจาก Excel
        </label>
        <input
            type="file"
            id="excelUpload"
            accept=".xlsx, .xls"
            onChange={handleExcelUpload}
            style={{ display: "none" }}
        />
    </div>
            <form onSubmit={handleSubmit} className="mt-3">
                <div className="mb-3">
                    <label className="form-label">ชื่อ-นามสกุล</label>
                    <input
                        type="text"
                        className="form-control"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">อีเมล</label>
                    <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">เบอร์โทร</label>
                    <input
                        type="text"
                        className="form-control"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">ชื่อผู้ใช้</label>
                    <input
                        type="text"
                        className="form-control"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">รหัสผ่าน</label>
                    <input
                        type="password"
                        className="form-control"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">สิทธิ์ผู้ใช้</label>
                    <select
                        className="form-control"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                    >
                        <option value="1">ผู้ดูแลระบบ</option>
                        <option value="2">นายกสมาคม</option>
                        <option value="3">ศิษย์เก่า</option>
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label">รูปโปรไฟล์</label>
                    <input
                        type="file"
                        className="form-control"
                        name="image_path"
                        accept="image/*"
                        onChange={handleChange}
                    />
                </div>

                {formData.image_path && (
                    <div className="mb-3">
                        <img
                            src={URL.createObjectURL(formData.image_path)}
                            alt="Preview"
                            className="img-thumbnail"
                            style={{ maxWidth: "150px" }}
                        />
                    </div>
                )}

                <h5>การศึกษา</h5>
                {formData.education.map((edu, index) => (
                    <div key={index} className="border p-3 mb-3 rounded">
                        <div className="mb-2">
                            <label>ระดับการศึกษา</label>
                            <select
                                className="form-select"
                                name="degree"
                                value={edu.degree}
                                onChange={(e) => handleEducationChange(index, e)}
                            >
                                <option value="">-- เลือกวุฒิการศึกษา --</option>
                                {degrees.map((d) => (
                                    <option key={d.degree_id} value={d.degree_id}>
                                        {d.degree_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-2">
                            <label>สาขา</label>
                            <select
                                className="form-select"
                                name="major"
                                value={edu.major}
                                onChange={(e) => handleEducationChange(index, e)}
                            >
                                <option value="">-- เลือกสาขา --</option>
                                {majors.map((m) => (
                                    <option key={m.major_id} value={m.major_id}>
                                        {m.major_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-2">
                            <label>รหัสนักศึกษา</label>
                            <input
                                type="text"
                                className="form-control"
                                name="studentId"
                                value={edu.studentId}
                                onChange={(e) => handleEducationChange(index, e)}
                            />
                        </div>
                        <div className="mb-2">
                            <label>ปีเข้าศึกษา</label>
                            <input
                                type="text"
                                className="form-control"
                                name="entry_year"
                                value={edu.entry_year}
                                onChange={(e) => handleEducationChange(index, e)}
                            />
                        </div>
                        <div className="mb-2">
                            <label>ปีที่จบ</label>
                            <input
                                type="text"
                                className="form-control"
                                name="graduation_year"
                                value={edu.graduation_year}
                                onChange={(e) => handleEducationChange(index, e)}
                            />
                        </div>
                    </div>
                ))}



                <button type="submit" className="btn btn-success">
                    บันทึก
                </button>
                <button
                    type="button"
                    className="btn btn-secondary ms-2"
                    onClick={() => navigate("/admin/users")}
                >
                    ยกเลิก
                </button>
            </form>
        </div>
    );
}

export default AddUser;