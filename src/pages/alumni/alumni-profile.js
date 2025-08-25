import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../css/profile.css';
import { useOutletContext } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import { IoMdCreate } from "react-icons/io";
import { FaBars, FaTimes } from "react-icons/fa";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function Profile() {
  const [profile, setProfile] = useState({
    degrees: [],
    educations: [],
  });
  const [major, setMajor] = useState([]);
  const {handleLogout } = useOutletContext();
  const [loginInfo, setLoginInfo] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false); // สำหรับซ่อน/แสดงรหัสผ่าน
  const userId = localStorage.getItem("userId");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null); // สำหรับแสดงรูปภาพก่อนอัปโหลด
  const navigate = useNavigate();
 const [editing, setEditing] = useState(false); 
 
  
  useEffect(() => {
    axios.get('http://localhost:3001/users/profile', {
      withCredentials: true, 
    })
      .then((response) => {
        console.log('majors:', response.data.major);     
        if (response.data.success) {
          setProfile(response.data.user);
        }
      })
      .catch((error) => {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์:', error.response ? error.response.data.message : error.message);
      });

       // ดึงข้อมูล major ทั้งหมด
    axios.get('http://localhost:3001/add/major', { 
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
    axios.get('http://localhost:3001/users/login-info', { 
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
    setProfile((prevState) => ({
      ...prevState,
      educations: updatedEducations,
    }));
  };

  const addEducation = () => {
    setProfile((prevState) => ({
        ...prevState,
        educations: [...prevState.educations, { degree: '', major: '', studentId: '', graduation_year: '',  entry_year: '' }],
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
    const updatedProfile = { ...profile };
    // console.log('ข้อมูลที่ส่งไป Backend:',  updatedProfile); // ตรวจสอบค่า
    axios.post('http://localhost:3001/users/edit-profile',  updatedProfile, {
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
      const res = await axios.post("http://localhost:3001/users/update-profile-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
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
    <section className="container">
      <div className='alumni-profile-page'>
        <div className="row justify-content-center g-4">
          {/* Sidebar/Profile */}
          <div className="col-12 col-md-3 mb-4">
            <div className="bg-white rounded-4 shadow-sm text-center p-4">
              <img
                src={previewImage || profile.profilePicture}
                alt="Profile"
                style={{ width: "130px", height: "130px", borderRadius: "50%", objectFit: "cover", marginBottom: 16, border: '3px solid #eee' }}
                className="img-fluid mb-2"
              />
              <div className="mt-2 mb-3">
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
              <hr className="w-100" />
              <div className="menu d-block mt-3 w-100">
                <div className="menu-item active py-2 mb-2 rounded" onClick={() => handleClick("/alumni-profile")}>โปรไฟล์ของฉัน</div>
                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/alumni-profile/alumni-request")}>คำร้องขอ</div>
                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/alumni-profile/alumni-manage-orders")}>จัดการคำสั่งซื้อของที่ระลึก</div>
                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/alumni-profile/alumni-profile-webboard")}>กระทู้ที่สร้าง</div>
                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/alumni-profile/alumni-profile-donation")}>ประวัติการบริจาค</div>
                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/alumni-profile/alumni-profile-activity")}>ประวัติการเข้าร่วมกิจกรรม</div>
                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/alumni-profile/alumni-profile-souvenir")}>ประวัติการสั่งซื้อของที่ระลึก</div>
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
                  <div className="row g-3">
                    <div className="col-md-6">
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
                    <div className="col-md-6">
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
                    <div className="col-md-6">
                      <label>ชื่อเล่น<span className="importent">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        id="nick_name"
                        name="nick_name"
                        placeholder="ชื่อเล่น"
                        value={profile.nick_name || ''}
                        onChange={handleChange}
                        disabled={!editing}
                      />
                    </div>
                    <div className="col-md-6">
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
                    
                    <div className="col-md-6">
                      <label>เบอร์โทร<span className="importent">*</span></label>
                      <input
                        type="number"
                        className="form-control"
                        id="phone"
                        name="phone"
                        placeholder="เบอร์โทร"
                        value={profile.phone || ''}
                        onChange={handleChange}
                        disabled={!editing}
                      />
                    </div>
                    <div className="col-md-6">
                      <label>ที่อยู่<span className="importent">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        id="address"
                        name="address"
                        placeholder="ที่อยู่"
                        value={profile.address || ''}
                        onChange={handleChange}
                        disabled={!editing}
                      />
                    </div>
                    <div className="col-md-6">
                      <label>วัน/เดือน/ปีเกิด<span className="importent">*</span></label>
                      <input
                        type="date"
                        className="form-control"
                        id="birthday"
                        name="birthday"
                        value={formatBirthday(profile.birthday) || ''}
                        onChange={handleChange}
                        disabled={!editing}
                      />
                    </div>
                    <div className="col-md-6">
                      <label>โซเชียล<span className="importent">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        id="line"
                        name="line"
                        placeholder="Line หรือ Facebook"
                        value={profile.line || ''}
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
                    <div key={index} className="education-item mb-4 p-3 rounded-3 border bg-light">
                      <div className="row g-3">
                        <div className="col-md-6">
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
                        <div className="col-md-6">
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
                        <div className="col-md-6">
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
                        <div className="col-md-6">
                          <label>ปีที่เข้าศึกษา<span className="importent">*</span></label>
                          <input
                            type="text"
                            className="form-control"
                            name="entry_year"
                            placeholder="ปีที่เข้าศึกษา"
                            value={edu.entry_year}
                            onChange={(e) => handleEducationChange(index, 'entry_year', e.target.value)}
                            disabled={!editing}
                          />
                        </div>
                        <div className="col-md-6">
                          <label>ปีการศึกษาที่จบ<span className="importent">*</span></label>
                          <input
                            type="text"
                            className="form-control"
                            name="graduation_year"
                            placeholder="ปีการศึกษาที่จบ"
                            value={edu.graduation_year}
                            onChange={(e) => handleEducationChange(index, 'graduation_year', e.target.value)}
                            disabled={!editing}
                          />
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
      </div>
    </section>
    
  );
}

export default Profile;
