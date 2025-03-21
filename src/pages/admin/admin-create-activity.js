import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

function CreateActivity() {
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
    image: null,
  });
  const [isLoggedin, setIsLoggedin] = useState(false);
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
    setFormData((prevState) => ({
      ...prevState,
      image: e.target.files[0],
    }));
  };

  const formatTimeRange = (start, end) => {
    return `${start} - ${end}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedTimeRange = formatTimeRange(formData.start_time, formData.end_time);
    console.log('ช่วงเวลา: ', formattedTimeRange);

    const userSession = localStorage.getItem("userId");
    if (!userSession) {
      alert("กรุณาล็อกอินเพื่อดำเนินการนี้");
      navigate("/login");  
      return;
    }
    
    // ตรวจสอบว่า start_time และ end_time ถูกกรอกหรือไม่
    if (!formData.start_time || !formData.end_time) {
        alert("กรุณากรอกเวลาเริ่มและเวลาสิ้นสุดกิจกรรม");
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
    if (formData.image) {
      data.append('image', formData.image);
    }

    try {
      const response = await axios.post('http://localhost:3001/activity/post-activity', data, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("API Response:", response.data);
      if (response.status === 200) {
        alert('เพิ่มกิจกรรมเรียบร้อยแล้ว!');
        navigate("/activity"); // เปลี่ยนเส้นทางไปยังหน้ารายการข่าว
      } else {
        alert('เกิดข้อผิดพลาดในการโพสต์กิจกรรม');
      }
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการโพสต์กิจกรรม:', error.message);
    }
  };

  return (
    <section className="create-activity">
      <div className="create-activity-page">
        <h3 className="create-activity-title">เพิ่มกิจกรรม</h3>
        <div className="form-create-activity">
          <form onSubmit={handleSubmit}>
            <fieldset>
              <div className="form-group">
                <label>ชื่อกิจกรรม<span className="important">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  id="activity_name"
                  name="activity_name"
                  placeholder="ชื่อกิจกรรม"
                  value={formData.activity_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>วันที่จัดกิจกรรม<span className="important">*</span></label>
                <input
                  type="date"
                  className="form-control"
                  id="activity_date"
                  name="activity_date"
                  value={formData.activity_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>เวลาเริ่มกิจกรรม<span className="important">*</span></label>
                <input
                  type="time"
                  className="form-control"
                  id="start_time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>รายละเอียดกิจกรรม<span className="important">*</span></label>
                <textarea
                  className="form-control"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  required
                ></textarea>
              </div>

              <div className="form-group">
                <label>วันที่สิ้นสุดกิจกรรม<span className="important">*</span></label>
                <input
                  type="date"
                  className="form-control"
                  id="end_date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  
                />
              </div>

              <div className="form-group">
                <label>เวลาเสร็จสิ้นกิจกรรม<span className="important">*</span></label>
                <input
                  type="time"
                  className="form-control"
                  id="end_time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  
                />
              </div>

              <div className="form-group">
                <label>ต้องการการลงทะเบียน</label>
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="registration_required"
                  name="registration_required"
                  checked={formData.registration_required}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>จำนวนผู้เข้าร่วมสูงสุด</label>
                <input
                  type="number"
                  className="form-control"
                  id="max_participants"
                  name="max_participants"
                  value={formData.max_participants}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>ข้อจำกัดรุ่น</label>
                <input
                  type="text"
                  className="form-control"
                  id="batch_restriction"
                  name="batch_restriction"
                  value={formData.batch_restriction}
                  onChange={handleChange}
                  placeholder="เช่น 2020, 2021"
                />
              </div>

              <div className="form-group">
                <label>ข้อจำกัดภาควิชา</label>
                <input
                  type="text"
                  className="form-control"
                  id="department_restriction"
                  name="department_restriction"
                  value={formData.department_restriction}
                  onChange={handleChange}
                  placeholder="เช่น IT, CS"
                />
              </div>

              <div className="form-group">
                <label>อัปโหลดรูปกิจกรรม</label>
                <input
                  type="file"
                  className="form-control"
                  id="image"
                  name="image"
                  onChange={handleFileChange}
                />
              </div>

              <div className="form-group">
                <button type="submit" className="btn btn-primary w-100 mt-3">
                  เพิ่มกิจกรรม
                </button>
              </div>
            </fieldset>
          </form>
        </div>
      </div>
    </section>
  );
}

export default CreateActivity;
