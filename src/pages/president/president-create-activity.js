import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";


function PreCreateActivity() {
  const [formData, setFormData] = useState({
    activity_name: '',
    activity_date: '',
    description: '',
    end_date: '',
    status: '',
    start_time: '',
    end_time: '',
    registration_required: false,
    max_participants: '',
    batch_restriction: '',
    department_restriction: '',
    images: [],
  });
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [minDate, setMinDate] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userSession = localStorage.getItem("userId");
    if (userSession) {
      setIsLoggedin(true);
      console.log("ผู้ใช้ล็อกอินแล้ว");
    } else {
      setIsLoggedin(false);
      console.log("ผู้ใช้ยังไม่ได้ล็อกอิน");
    }
  }, []);

  useEffect(() => {
    // กำหนดวันที่ปัจจุบันในรูปแบบ YYYY-MM-DD
    const today = new Date().toISOString().split("T")[0];
    setMinDate(today);
  }, []);

  // ฟังก์ชันจัดการการเปลี่ยนแปลงของฟอร์ม
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData((prevState) => ({
        ...prevState,
        [name]: checked,
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  // ฟังก์ชันจัดการการอัพโหลดไฟล์
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files); // ต้องแปลงก่อนใช้
    console.log("อัปโหลดรูป:", files);
    setFormData((prevState) => ({
      ...prevState,
      images: files,
    }));
  };


  const formatTimeRange = (start, end) => {
    return `${start} - ${end}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedTimeRange = formatTimeRange(formData.start_time, formData.end_time);

    const userSession = localStorage.getItem("userId");
    if (!userSession) {
      alert("กรุณาล็อกอินเพื่อดำเนินการนี้");
      navigate("/login");
      return;
    }

    const data = new FormData();
    data.append('activity_name', formData.activity_name);
    data.append('activity_date', formData.activity_date);
    data.append('description', formData.description);
    data.append('end_date', formData.end_date);
    data.append('status', formData.status);
    data.append('start_time', formData.start_time);
    data.append('end_time', formData.end_time);
    data.append('registration_required', formData.registration_required);
    data.append('max_participants', formData.max_participants);
    data.append('batch_restriction', formData.batch_restriction);
    data.append('department_restriction', formData.department_restriction);
    data.append('check_alumni', formData.check_alumni ? 1 : 0);
    //แนบรูปหลายรูป
    formData.images.forEach((img, index) => {
      data.append('images', img); // ใช้ชื่อเดียวกันทั้งหมด
    });

    try {
      const response = await axios.post('http://localhost:3001/activity/post-activity', data, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      // console.log("API Response:", response.data);
      if (response.status === 200) {
        Swal.fire("สำเร็จ!", "เพิ่มกิจกรรมเรียบร้อยแล้ว", "success");
        navigate("/activity");
      } else {
        alert('เกิดข้อผิดพลาดในการโพสต์กิจกรรม');
      }
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการโพสต์กิจกรรม:', error.message);
    }
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
    <section className="create-activity">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-7">
            <div className="card shadow-lg border-0" style={customStyles.card}>
              <div className="card-header text-white text-center" style={customStyles.cardHeader}>
                <h3 className="mb-0" style={customStyles.title}>
                  📰 เพิ่มกิจกรรมใหม่
                </h3>
              </div>
              <div className="card-body px-4 py-5">
                <form onSubmit={handleSubmit}>
                  <fieldset>
                    {/* ข้อมูลพื้นฐาน */}
                    <div className="mb-4">
                      <label style={customStyles.label}>ชื่อกิจกรรม<span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control w-100"
                        id="activity_name"
                        name="activity_name"
                        placeholder="ชื่อกิจกรรม"
                        value={formData.activity_name}
                        onChange={handleChange}
                        required
                        style={customStyles.formControl}
                      />
                    </div>
                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <label style={customStyles.label}>วันที่จัดกิจกรรม<span className="text-danger">*</span></label>
                        <input
                          type="date"
                          className="form-control w-100"
                          id="activity_date"
                          name="activity_date"
                          value={formData.activity_date}
                          min={minDate}
                          onChange={handleChange}
                          required
                          style={customStyles.formControl}
                        />
                      </div>
                      <div className="col-md-6">
                        <label style={customStyles.label}>เวลาเริ่มกิจกรรม<span className="text-danger">*</span></label>
                        <input
                          type="time"
                          className="form-control w-100"
                          id="start_time"
                          name="start_time"
                          value={formData.start_time}
                          onChange={handleChange}
                          required
                          style={customStyles.formControl}
                        />
                      </div>
                    </div>
                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <label style={customStyles.label}>วันที่สิ้นสุดกิจกรรม</label>
                        <input
                          type="date"
                          className="form-control w-100"
                          id="end_date"
                          name="end_date"
                          value={formData.end_date}
                          onChange={handleChange}
                          min={formData.activity_date || minDate}
                          style={customStyles.formControl}
                        />
                      </div>
                      <div className="col-md-6">
                        <label style={customStyles.label}>เวลาเสร็จสิ้นกิจกรรม</label>
                        <input
                          type="time"
                          className="form-control w-100"
                          id="end_time"
                          name="end_time"
                          value={formData.end_time}
                          onChange={handleChange}
                          style={customStyles.formControl}
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label style={customStyles.label}>รายละเอียดกิจกรรม<span className="text-danger">*</span></label>
                      <textarea
                        className="form-control w-100"
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="3"
                        placeholder="รายละเอียดกิจกรรม"
                        required
                        style={customStyles.formControl}
                      ></textarea>
                    </div>

                    {/* ข้อจำกัด */}
                    <div className="mb-4">
                      <div className="bg-light rounded-3 p-3 mb-3 border-start border-4 border-secondary">
                        <h5 className="mb-3 text-secondary fw-bold">
                          <i className="fas fa-user-lock me-2"></i>
                          ข้อจำกัด
                        </h5>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label style={customStyles.label}>ข้อจำกัดรุ่น</label>
                            <input
                              type="text"
                              className="form-control w-100"
                              id="batch_restriction"
                              name="batch_restriction"
                              value={formData.batch_restriction}
                              onChange={handleChange}
                              placeholder="เช่น 2020, 2021"
                              style={customStyles.formControl}
                            />
                          </div>
                          <div className="col-md-6">
                            <label style={customStyles.label}>ข้อจำกัดภาควิชา</label>
                            <input
                              type="text"
                              className="form-control w-100"
                              id="department_restriction"
                              name="department_restriction"
                              value={formData.department_restriction}
                              onChange={handleChange}
                              placeholder="เช่น IT, CS"
                              style={customStyles.formControl}
                            />
                          </div>
                        </div>
                        <div className="form-check mt-3">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="check_alumni"
                            name="check_alumni"
                            checked={formData.check_alumni}
                            onChange={handleChange}
                          />
                          <label className="form-check-label ms-2" htmlFor="check_alumni">
                            กิจกรรมสำหรับศิษย์เก่าเท่านั้น
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* การตั้งค่าเพิ่มเติม */}
                    <div className="mb-4">
                      <div className="bg-light rounded-3 p-3 mb-3 border-start border-4 border-info">
                        <h5 className="mb-3 text-info fw-bold">
                          <i className="fas fa-cog me-2"></i>
                          การตั้งค่าเพิ่มเติม
                        </h5>
                        <div className="form-check mb-3">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="registration_required"
                            name="registration_required"
                            checked={formData.registration_required}
                            onChange={handleChange}
                          />
                          <label className="form-check-label ms-2" htmlFor="registration_required">
                            ต้องการการลงทะเบียน
                          </label>
                        </div>
                        <div className="mb-3">
                          <label style={customStyles.label}>จำนวนผู้เข้าร่วมสูงสุด</label>
                          <input
                            type="number"
                            className="form-control w-100"
                            id="max_participants"
                            name="max_participants"
                            value={formData.max_participants}
                            onChange={handleChange}
                            placeholder="ระบุจำนวนผู้เข้าร่วมสูงสุด"
                            style={customStyles.formControl}
                          />
                        </div>
                        <div className="mb-3">
                          <label style={customStyles.label}>อัปโหลดรูปกิจกรรม</label>
                          <input
                            type="file"
                            className="form-control w-100"
                            id="images"
                            name="images"
                            multiple
                            accept="image/*"
                            onChange={handleFileChange}
                            style={customStyles.fileInput}
                          />
                        </div>
                      </div>
                    </div>

                    {/* ปุ่มส่งฟอร์ม */}
                    <div className="d-grid">
                      <button type="submit" className="btn btn-success btn-lg" style={customStyles.button}>
                        <i className="fas fa-plus-circle me-2"></i>
                        เพิ่มกิจกรรม
                      </button>
                    </div>
                  </fieldset>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PreCreateActivity;
