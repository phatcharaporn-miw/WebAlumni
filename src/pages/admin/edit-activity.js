import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {HOSTNAME} from '../../config.js';
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
        axios.get(HOSTNAME +`/activity/${activityId}`, { withCredentials: true })
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

    //สำหรับจัดการการเปลี่ยนแปลงวันที่
          const handleChangeDate = (e) => {
              const { name, value } = e.target;
              const today = new Date().toISOString().split('T')[0];
      
              // ตรวจสอบว่าไม่สามารถเลือกวันที่ย้อนหลังได้
              if (name === 'startDate' || name === 'endDate') {
                  if (value < today) {
                      Swal.fire({
                          icon: 'warning',
                          title: "ไม่สามารถเลือกวันที่ย้อนหลังได้",
                          confirmButtonText: "ตกลง",
                      });
                      return;
                  }
      
                  // สำหรับ endDate ต้องไม่เก่ากว่า startDate
                  if (name === 'endDate' && formData.startDate && value < formData.startDate) {
                      Swal.fire({
                          icon: 'warning',
                          title: 'วันที่สิ้นสุดต้องไม่เก่ากว่าวันที่เริ่มต้น',
                          confirmButtonText: "ตกลง",
                      });
                      return;
                  }
              }
      
              setFormData(prev => ({
                  ...prev,
                  [name]: value
              }));
          }

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
            .put(HOSTNAME +`/activity/edit-activity/${activityId}`, data, {
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
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-lg-8 col-md-10">
                    <div className="card shadow-lg border-0 rounded-4">
                        <div className="card-header bg-primary text-white text-center py-3 rounded-top-4">
                            <h3 className="mb-0">แก้ไขกิจกรรม</h3>
                        </div>
                        <div className="card-body p-4 bg-light rounded-bottom-4">
                            <form onSubmit={handleSubmit} className="row g-3">

                                {/* ชื่อกิจกรรม */}
                                <div className="col-12">
                                    <label htmlFor="activity_name" className="form-label fw-bold">ชื่อกิจกรรม</label>
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

                                {/* วันที่จัด */}
                                <div className="col-md-6">
                                    <label htmlFor="activity_date" className="form-label fw-bold">วันที่จัดกิจกรรม</label>
                                    <input
                                        type="date"
                                        className="form-control w-100"
                                        id="activity_date"
                                        name="activity_date"
                                        value={formData.activity_date}
                                        onChange={handleChangeDate}
                                        required
                                        min={new Date().toISOString().split("T")[0]}
                                        onKeyDown={(e) => e.preventDefault()}
                                    />
                                </div>

                                {/* วันที่สิ้นสุด */}
                                <div className="col-md-6">
                                    <label htmlFor="end_date" className="form-label fw-bold">วันที่สิ้นสุด</label>
                                    <input
                                        type="date"
                                        className="form-control w-100"
                                        id="end_date"
                                        name="end_date"
                                        value={formData.end_date}
                                        onChange={handleChangeDate}
                                        min={new Date().toISOString().split("T")[0]}
                                        onKeyDown={(e) => e.preventDefault()}
                                    />
                                </div>

                                {/* เวลาเริ่ม */}
                                <div className="col-md-6">
                                    <label htmlFor="start_time" className="form-label fw-bold">เวลาเริ่ม</label>
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

                                {/* เวลาสิ้นสุด */}
                                <div className="col-md-6">
                                    <label htmlFor="end_time" className="form-label fw-bold">เวลาสิ้นสุด</label>
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

                                {/* รายละเอียด */}
                                <div className="col-12">
                                    <label htmlFor="description" className="form-label fw-bold">รายละเอียดกิจกรรม</label>
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

                                {/* อัปโหลดรูป */}
                                <div className="col-12">
                                    <label htmlFor="images" className="form-label fw-bold">รูปภาพกิจกรรม</label>
                                    <input
                                        type="file"
                                        className="form-control w-100"
                                        id="images"
                                        name="images"
                                        multiple
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* สถานะ */}
                                <div className="col-12">
                                    <label htmlFor="status" className="form-label fw-bold">สถานะ</label>
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

                                {/* ปุ่ม */}
                                <div className="col-12 d-flex justify-content-end mt-3">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary px-4 shadow-sm"
                                        onClick={() => navigate('/admin/activities')}
                                    >
                                        ยกเลิก
                                    </button>
                                    <button type="submit" className="btn btn-primary px-4 me-2 shadow-sm">
                                        บันทึก
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

export default EditActivity;