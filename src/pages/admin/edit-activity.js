import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function EditActivity() {
    const { activityId } = useParams(); // ดึง ID ของกิจกรรมจาก URL
    const navigate = useNavigate();
    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        activity_name: "",
        activity_date: "",
        end_date: "",
        start_time: "",
        end_time: "",
        description: "",
        status: 0,
        images: [],
    });

    // ดึงข้อมูลกิจกรรม
    useEffect(() => {
        axios.get(`http://localhost:3001/activity/${activityId}`, { withCredentials: true })
            .then((response) => {
                if (response.data.success) {
                    setActivity(response.data.data);
                    setFormData({
                        activity_name: response.data.data.activity_name,
                        activity_date: response.data.data.activity_date,
                        end_date: response.data.data.end_date || "",
                        start_time: response.data.data.start_time,
                        end_time: response.data.data.end_time,
                        description: response.data.data.description,
                        status: response.data.data.status,
                        // image:response.data.data.image || null,
                    });
                } else {
                    console.error("เกิดข้อผิดพลาดในการดึงข้อมูลกิจกรรม:", response.data.message);
                }
                setLoading(false);
            })
            .catch((error) => {
                console.error("เกิดข้อผิดพลาดในการดึงข้อมูลกิจกรรม:", error.message);
                setLoading(false);
            });
    }, [activityId]);

    // ฟังก์ชันจัดการการเปลี่ยนแปลง
    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === "file") {
            setFormData({ ...formData, [name]: files[0] }); // สำหรับไฟล์เดียว
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    // ฟังก์ชันบันทึกการแก้ไขกิจกรรม
    const handleSubmit = (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append("activity_name", formData.activity_name);
        data.append("activity_date", formData.activity_date);
        data.append("end_date", formData.end_date);
        data.append("start_time", formData.start_time);
        data.append("end_time", formData.end_time);
        data.append("description", formData.description);
        data.append("status", formData.status);

        if (formData.images) {
            data.append("images", formData.images); // เพิ่มไฟล์รูปภาพ
        }

        axios
            .put(`http://localhost:3001/activity/edit-activity/${activityId}`, data, {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" },
            })
            .then((response) => {
                if (response.data.success) {
                    Swal.fire({
                        icon: "success",
                        title: "สำเร็จ!",
                        text: "แก้ไขกิจกรรมสำเร็จ!",
                        confirmButtonText: "ตกลง",
                    }).then(() => {
                        navigate("/admin/activities");
                    });
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "เกิดข้อผิดพลาด",
                        text: response.data.message || "ไม่สามารถแก้ไขกิจกรรมได้",
                        confirmButtonText: "ตกลง",
                    });
                }
            })
            .catch((error) => {
                console.error("เกิดข้อผิดพลาดในการแก้ไขกิจกรรม:", error.message);
                Swal.fire({
                    icon: "error",
                    title: "เกิดข้อผิดพลาด",
                    text: "ไม่สามารถแก้ไขกิจกรรมได้",
                    confirmButtonText: "ตกลง",
                });
            });
    };

    if (loading) {
        return <p className="text-center mt-5">กำลังโหลดข้อมูล...</p>;
    }

    if (!activity) {
        return <p className="text-center mt-5">ไม่พบข้อมูลกิจกรรม</p>;
    }

    return (
        <div className="container mt-4">
            <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>ย้อนกลับ</button>
            <h3 className="mb-4 text-center">แก้ไขกิจกรรม</h3>
            <div className="row justify-content-center">
                <div className="col-lg-7 col-md-10">             
                    <form onSubmit={handleSubmit} className="p-4 border rounded shadow-sm bg-white">
                        <div className="mb-3">
                            <label htmlFor="activity_name" className="form-label">ชื่อกิจกรรม</label>
                            <input
                                type="text"
                                className="form-control w-100"
                                id="activity_name"
                                name="activity_name"
                                value={formData.activity_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="activity_date" className="form-label">วันที่จัดกิจกรรม</label>
                            <input
                                type="date"
                                className="form-control w-100"
                                id="activity_date"
                                name="activity_date"
                                value={formData.activity_date}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="end_date" className="form-label">วันที่สิ้นสุด</label>
                            <input
                                type="date"
                                className="form-control w-100"
                                id="end_date"
                                name="end_date"
                                value={formData.end_date}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="start_time" className="form-label">เวลาเริ่ม</label>
                            <input
                                type="time"
                                className="form-control w-100"
                                id="start_time"
                                name="start_time"
                                value={formData.start_time}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="end_time" className="form-label">เวลาสิ้นสุด</label>
                            <input
                                type="time"
                                className="form-control w-100"
                                id="end_time"
                                name="end_time"
                                value={formData.end_time}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="description" className="form-label">รายละเอียดกิจกรรม</label>
                            <textarea
                                className="form-control w-100"
                                id="description"
                                name="description"
                                rows="4"
                                value={formData.description}
                                onChange={handleChange}
                                required
                            ></textarea>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="images" className="form-label">รูปภาพกิจกรรม</label>
                            <input
                                type="file"
                                className="form-control"
                                id="images"
                                name="images"
                                multiple
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="status" className="form-label">สถานะ</label>
                            <select
                                className="form-select"
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                required
                            >
                                <option value={0}>กำลังจะจัดขึ้น</option>
                                <option value={1}>เสร็จสิ้นแล้ว</option>
                                <option value={2}>กำลังดำเนินการ</option>
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary w-100">บันทึกการแก้ไข</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default EditActivity;