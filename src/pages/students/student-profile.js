import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../css/profile.css';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {HOSTNAME} from '../../config.js';
import Swal from "sweetalert2";
// import { IoMdCreate } from "react-icons/io";
// import { FaBars, FaTimes } from "react-icons/fa";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function StudentProfile() {
  const [profile, setProfile] = useState({
    degrees: [],
    educations: [],
  });
  const [major, setMajor] = useState([]);
  const { user, handleLogout } = useAuth(); 
  const userId = user?.user_id;
  const [loginInfo, setLoginInfo] = useState({ username: '', password: '' });
  // const [showPassword, setShowPassword] = useState(false); // สำหรับซ่อน/แสดงรหัสผ่าน
  const [previewImage, setPreviewImage] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
 //แก้ไขข้อมูลส่วนตัว
 const [editing, setEditing] = useState(false); //สลับโหมดการแก้ไข
 
 // Scroll to top on mount
   useEffect(() => {
     window.scrollTo(0, 0);
   }, []);
  
  useEffect(() => {
    axios.get(HOSTNAME +'/users/profile', {
      withCredentials: true, 
    })
      .then((response) => {
        // console.log('majors:', response.data.major);     
        if (response.data.success) {
          // console.log('profile data:', response.data.user);
          setProfile(response.data.user);
        }
      })
      .catch((error) => {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์:', error.response ? error.response.data.message : error.message);
      });

       // ดึงข้อมูล major ทั้งหมด
    axios.get(HOSTNAME +'/add/major', { 
      withCredentials: true 
    })
    .then((response) => {
        if (response.data.success) {
            setMajor(response.data.major);
        }
    })
    .catch((error) => {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล major:', error.message);
    });

      // ดึงข้อมูล username และ password
    axios.get(HOSTNAME +'/users/login-info', { 
      withCredentials: true 
    })
    .then((response) => {
        if (response.data.success) {
            setLoginInfo(response.data.loginInfo);
        }
    })
    .catch((error) => {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล login:', error.message);
    });

  }, []);

  if (!profile) {
    return <div>ไม่พบข้อมมูลผู้ใช้</div>;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  
  const handleClick = (path) => {
    navigate(path);
  };

  //แปลงวันที่
  const formatBirthday = (dbDate) => {
    if (!dbDate) return '';
    const date = new Date(dbDate); 
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); //ทำให้เดือนมีความยาว 2 ตัวอักษรเสมอ 
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

  const degrees = Array.isArray(profile.degrees) ? profile.degrees : [];

  // อัปเดตค่าใน State เมื่อแก้ไขฟอร์ม
  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // อัปเดตค่าใน educations
const handleEducationChange = (index, field, value) => {
  const updatedEducations = [...profile.educations];
  updatedEducations[index][field] = value;
  setProfile(prevState => ({
    ...prevState,
    educations: updatedEducations,
  }));
};

const addEducation = () => {
  setProfile((prevState) => ({
    ...prevState,
    educations: [...prevState.educations, {
      degree_id: '',
      major_id: '',
      studentId: '',
      // graduation_year: '',
      student_year: ''
    }],
  }));
};

const removeEducation = (index) => {
  const updatedEducations = [...profile.educations];
  updatedEducations.splice(index, 1);
  setProfile((prevState) => ({ ...prevState, educations: updatedEducations }));
};

  // แก้ไขข้อมูลส่วนตัว
  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = () => {
    // console.log("ก่อนส่งข้อมูล educations:", JSON.stringify(profile.educations, null, 2));
    axios.post(HOSTNAME +'/users/edit-profile',  profile, {
      withCredentials: true, 
    })
      .then((response) => {
         Swal.fire({
          title: "สำเร็จ!",
          text: "แก้ไขข้อมูลส่วนตัวสำเร็จ",
          icon: "success",
          confirmButtonText: "ตกลง",
          timer: 3000
        });
        setEditing(false);
      })
      .catch((error) => {
        console.error('เกิดข้อผิดพลาดในการแก้ไขข้อมูลส่วนตัว:', error.message);
      });
  }

  // อัปโหลดรูปภาพ
const handleImageChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // แสดง preview รูปก่อนอัปโหลด
  setPreviewImage(URL.createObjectURL(file));

  const formData = new FormData();
  formData.append("image_path", file);
  formData.append("user_id", profile.userId); 

  try {
    const res = await axios.post(HOSTNAME +"/users/update-profile-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },{
      withCredentials: true
    });

    if (res.status === 200) {
      alert("อัปโหลดรูปสำเร็จ");

      // อัปเดตรูปโปรไฟล์ใน state
      setProfile((prev) => ({
        ...prev,
        profilePicture: res.data.newImagePath,
      }));
    } else {
      alert(res.data.message || "เกิดข้อผิดพลาด");
    }
  } catch (err) {
    console.error(err);
    alert("ไม่สามารถอัปโหลดรูปได้");
  }
};

const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
};

  

  return (
    <section className="container py-4">
    <div className="row justify-content-center">
      {/* Sidebar/Profile */}
      <div className="col-12 col-md-3 mb-4">
        <div className="bg-white rounded-4 shadow-sm text-center p-4">
          <img
            src={previewImage || profile.profilePicture}
            alt="Profile"
            style={{ width: "130px", height: "130px", borderRadius: "50%", objectFit: "cover", marginBottom: 16 }}
            className="img-fluid"
          />
          <div className="mt-2">
            <label
              htmlFor="upload-profile-pic"
              className="btn btn-sm btn-outline-secondary"
              style={{ cursor: "pointer" }}
            >
              เปลี่ยนรูป
            </label>
            <input
              type="file"
              id="upload-profile-pic"
              className="d-none"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
          <hr />
          <div className="menu d-block mt-4">
            <div className="menu-item active py-2 mb-2 rounded" onClick={() => handleClick("/student-profile")}>โปรไฟล์ของฉัน</div>
            <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/student-profile/student-request")}>คำร้องขอ</div>
            <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/student-profile/student-manage-orders")}>จัดการคำสั่งซื้อของที่ระลึก</div>
            <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/student-profile/student-profile-webboard")}>กระทู้ที่สร้าง</div>
            <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/student-profile/student-profile-donation")}>ประวัติการบริจาค</div>
            <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/student-profile/student-profile-activity")}>ประวัติการเข้าร่วมกิจกรรม</div>
            <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/student-profile/student-profile-souvenir")}>ประวัติการสั่งซื้อของที่ระลึก</div>
            <div className="menu-item py-2 rounded" onClick={handleLogout}>ออกจากระบบ</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="col-12 col-md-8">
        <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
          <h3 className="alumni-title text-center mb-4">โปรไฟล์ของฉัน</h3>
          <form>
            <fieldset>
              <legend className="legend-title mb-4">ข้อมูลส่วนตัว</legend>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label>คำนำหน้า<span className="importent">*</span></label>
                  <select
                    name="title"
                    value={profile.title || ''}
                    className="form-control"
                    onChange={handleChange}
                    disabled={!editing}
                  >
                    <option value="">คำนำหน้า</option>
                    <option value="นาย">นาย</option>
                    <option value="นาง">นาง</option>
                    <option value="นางสาว">นางสาว</option>
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label>ชื่อ-สกุล<span className="importent">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    id="full_name"
                    name="full_name"
                    placeholder="ชื่อ-สกุล"
                    value={profile.full_name || ''}
                    onChange={handleChange}
                    disabled={!editing}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label>อีเมล<span className="importent">*</span></label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    placeholder="email@example.com"
                    value={profile.email || ''}
                    onChange={handleChange}
                    disabled={!editing}
                  />
                </div>               
              </div>
            </fieldset>
          </form>
        </div>

        <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
          <fieldset>
            <legend className="legend-title">ข้อมูลการศึกษา</legend>
            {Array.isArray(profile.educations) && profile.educations.length > 0 ? (
              profile.educations.map((edu, index) => (
                <div key={index} className="education-item mb-4">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label>ระดับการศึกษา<span className="importent">*</span></label>
                      <select
                        name="degree"
                        value={edu.degree}
                        onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                        className="form-control"
                        disabled={!editing}
                      >
                        <option value="">เลือกระดับการศึกษา</option>
                        <option value="1">ป.ตรี</option>
                        <option value="2">ป.โท</option>
                        <option value="3">ป.เอก</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label>สาขา<span className="importent">*</span></label>
                      <select
                        name="major"
                        value={edu.major}
                        onChange={(e) => handleEducationChange(index, 'major', e.target.value)}
                        className="form-control"
                        disabled={!editing}
                      >
                        <option value="">เลือกสาขา</option>
                        {major && major.length > 0 ? (
                          major.map((majorItem) => (
                            <option key={majorItem.major_id} value={majorItem.major_id}>
                              {majorItem.major_name}
                            </option>
                          ))
                        ) : (
                          <option value="">ไม่มีข้อมูลสาขา</option>
                        )}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label>รหัสนักศึกษา<span className="importent">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        name="studentId"
                        placeholder="รหัสนักศึกษา"
                        value={edu.studentId}
                        onChange={(e) => handleEducationChange(index, 'studentId', e.target.value)}
                        disabled={!editing}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label>ปีที่เรียน<span className="importent">*</span></label>
                        <select
                          name="student_year"
                          value={edu.student_year || ''}
                          onChange={(e) => handleEducationChange(index, 'student_year', e.target.value)}
                          className="form-control"
                          disabled={!editing}
                        >
                          <option value="">เลือกปีที่เรียน</option>
                          <option value="1">ปี 1</option>
                          <option value="2">ปี 2</option>
                          <option value="3">ปี 3</option>
                          <option value="4">ปี 4</option>
                          <option value="อื่นๆ">อื่นๆ</option>
                        </select>
                    </div>
                  </div>
                 {editing && profile.educations.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-danger mt-2"
                          onClick={() => removeEducation(index)}
                        >
                          ลบรายการ
                        </button>
                      )}

                      <hr />
                    </div>
                  ))
                ) : (
                  <p>ไม่มีข้อมูลการศึกษา</p>
                )}
                {editing && (
                  <button type="button" className="btn btn-primary mt-3" onClick={addEducation}>
                    เพิ่มข้อมูลการศึกษา
                  </button>
                )}
          </fieldset>
        </div>

        <div className="text-center mb-4">
          {editing ? (
            <>
              <button
                className="btn btn-secondary me-2"
                type="button"
                onClick={() => setEditing(false)}
                style={{ minWidth: 120, maxWidth: 200, width: "40%" }}
              >
                ยกเลิก
              </button>
              <button
                className="btn btn-primary"
                type="submit"
                onClick={handleSave}
                style={{ minWidth: 120, maxWidth: 200, width: "40%" }}
              >
                บันทึก
              </button>
            </>
          ) : (
            <button
              className="btn btn-success"
              type="button"
              onClick={handleEdit}
              style={{ minWidth: 120, maxWidth: 250, width: "60%" }}
            >
              แก้ไขข้อมูลส่วนตัว
            </button>
          )}
        </div>
      </div>
    </div>
  </section>
    
  );
}

export default StudentProfile;
