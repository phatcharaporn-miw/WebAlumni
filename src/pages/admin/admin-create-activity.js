import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";


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
      Swal.fire("กรุณาเข้าสู่ระบบ", "คุณต้องเข้าสู่ระบบก่อนที่จะเพิ่มกิจกรรม", "warning");
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
      console.log("API Response:", response.data);
      if (response.status === 200) {
        Swal.fire("สำเร็จ!", "เพิ่มกิจกรรมเรียบร้อยแล้ว", "success");
        navigate("/admin/activities"); 
      } else {
        alert('เกิดข้อผิดพลาดในการโพสต์กิจกรรม');
      }
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการโพสต์กิจกรรม:', error.message);
    }
  };

  return (
    <section className="create-activity">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="create-activity-page">
              <h3 className="create-activity-title text-center mb-4">เพิ่มกิจกรรม</h3>
              <div className="form-create-activity">
                <form onSubmit={handleSubmit}>
                  <fieldset>
                    {/* ข้อมูลพื้นฐาน */}
                    <div className="card mb-4">
                      <div className="card-header bg-primary text-white">
                        <h5>ข้อมูลพื้นฐาน</h5>
                      </div>
                      <div className="card-body">
                        <div className="form-group mb-3">
                          <label>ชื่อกิจกรรม:<span className="important">*</span></label>
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

                        <div className="form-group mb-3">
                          <label>วันที่จัดกิจกรรม:<span className="important">*</span></label>
                          <input
                            type="date"
                            className="form-control"
                            id="activity_date"
                            name="activity_date"
                            value={formData.activity_date}
                            min={minDate}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        <div className="form-group mb-3">
                          <label>เวลาเริ่มกิจกรรม:<span className="important">*</span></label>
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

                        <div className="form-group mb-3">
                          <label>วันที่สิ้นสุดกิจกรรม:</label>
                          <input
                            type="date"
                            className="form-control"
                            id="end_date"
                            name="end_date"
                            value={formData.end_date}
                            onChange={handleChangeDate}
                            min={formData.activity_date || minDate}
                            onKeyDown={(e) => e.preventDefault()}
                          />
                        </div>

                        <div className="form-group mb-3">
                          <label>เวลาเสร็จสิ้นกิจกรรม:</label>
                          <input
                            type="time"
                            className="form-control"
                            id="end_time"
                            name="end_time"
                            value={formData.end_time}
                            onChange={handleChangeDate}
                            onKeyDown={(e) => e.preventDefault()}
                          />
                        </div>

                        <div className="form-group mb-3">
                          <label>รายละเอียดกิจกรรม:<span className="important">*</span></label>
                          <textarea
                            className="form-control"
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            placeholder="รายละเอียดกิจกรรม"
                            required
                          ></textarea>
                        </div>
                      </div>
                    </div>

                    {/* ข้อจำกัด */}
                    <div className="card mb-4">
                      <div className="card-header bg-secondary text-white">
                        <h5>ข้อจำกัด</h5>
                      </div>
                      <div className="card-body">
                        <div className="form-group mb-3">
                          <label>ข้อจำกัดรุ่น:</label>
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

                        <div className="form-group mb-3">
                          <label>ข้อจำกัดภาควิชา:</label>
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

                        <div className="form-group mb-3">
                          <label>กิจกรรมสำหรับศิษย์เก่าเท่านั้น:</label>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="check_alumni"
                            name="check_alumni"
                            checked={formData.check_alumni}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>

                    {/* การตั้งค่าเพิ่มเติม */}
                    <div className="card mb-4">
                      <div className="card-header bg-info text-white">
                        <h5>เพิ่มเติม</h5>
                      </div>
                      <div className="card-body">
                        {/* <div className="form-group mb-3">
                          <label>ต้องการการลงทะเบียน:</label>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="registration_required"
                            name="registration_required"
                            checked={formData.registration_required}
                            onChange={handleChange}
                          />
                        </div> */}

                        <div className="form-group mb-3">
                          <label>จำนวนผู้เข้าร่วมสูงสุด:</label>
                          <input
                            type="number"
                            className="form-control"
                            id="max_participants"
                            name="max_participants"
                            value={formData.max_participants}
                            onChange={handleChange}
                            placeholder="ระบุจำนวนผู้เข้าร่วมสูงสุด"
                          />
                        </div>

                        <div className="form-group mb-3">
                          <label>อัปโหลดรูปกิจกรรม:</label>
                          <input
                            type="file"
                            className="form-control"
                            id="images"
                            name="images"
                            multiple
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                        </div>
                      </div>
                    </div>

                    {/* ปุ่มส่งฟอร์ม */}
                    <div className="form-group">
                      <button type="submit" className="btn btn-success w-100">
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

export default CreateActivity;
