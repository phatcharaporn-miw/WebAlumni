import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../css/profile.css';
import { useOutletContext } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";

function Profile() {
  const [profile, setProfile] = useState({
    degrees: [],
    educations: [],
  });
  const [major, setMajor] = useState([]);
  const {handleLogout } = useOutletContext();
  const [loginInfo, setLoginInfo] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false); // สำหรับซ่อน/แสดงรหัสผ่าน
  const navigate = useNavigate();
 //แก้ไขข้อมูลส่วนตัว
 const [editing, setEditing] = useState(false); //สลับโหมดการแก้ไข
 
  
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
        educations: [...prevState.educations, { degree: '', major: '', studentId: '', graduation_year: '' }],
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

  return (
    <section className='container'>
      <div className='alumni-profile-page'>
      <h3 className="alumni-title text-center">โปรไฟล์ของฉัน</h3>
        <div className="row justify-content-between" >
          <div className="col-4  bg-light  rounded text-center">
            <img 
            src={`${profile.profilePicture}`} 
            alt="Profile" 
            style={{ width: '140px', height: '140px', borderRadius: '50%' }}
            />
            <p className="mt-3 fw-bold">{profile.fullName}</p>
              <div className="menu mt-4">
                <div className="menu-item active py-2 mb-2 rounded">ข้อมูลส่วนตัว</div>
                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick('/alumni-profile/alumni-profile-webboard')}>กระทู้ที่สร้าง</div>
                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick('/alumni-profile/donation-history')}>ประวัติการบริจาค</div>
                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick('/alumni-profile/alumni-profile-activity')}>ประวัติการเข้าร่วมกิจกรรม</div>
                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick('/alumni-profile/alumni-profile-souvenir')}>ประวัติการสั่งซื้อ</div>
                <div className="menu-item py-2 rounded" onClick={handleLogout}>ออกจากระบบ</div>
              </div>
          </div>
        
            <div className="col-7 bg-light rounded">
              <div className='form-profile'>
                <form>
                  <fieldset>
                  <legend className="legend-title mb-4">ข้อมูลส่วนตัว</legend>

                  <div className="form-group">
                      <label>ชื่อผู้ใช้งาน<span className="importent">*</span></label>
                      <input
                          type="text"
                          className="form-control"
                          id="username"
                          name="username"
                          value={loginInfo.username}
                          disabled
                      />
                  </div>

                  <div className="form-group">
                        <label>รหัสผ่าน<span className="importent">*</span></label>
                        <div className="password-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="form-control"
                                id="password"
                                name="password"
                                value={loginInfo.password}
                                disabled
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? "ซ่อน" : "แสดง"}
                            </button>
                        </div>
                    </div>

                                <div className="form-group">
                                    <label>คำนำหน้า<span className="importent">*</span></label>
                                    <select
                                      name="title"
                                      value={profile.title || ''}
                                      disabled
                                    >
                                      <option value="">คำนำหน้า</option>
                                      <option value="นาย">นาย</option>
                                      <option value="นาง">นาง</option>
                                      <option value="นางสาว">นางสาว</option>
                                    </select>
                                </div>

                                <div className="form-group">
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

                                  <div className="form-group">
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

                                  <div className="form-group">
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

                                  <div className="form-group">
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

                                  <div className="form-group">
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

                                  <div className="form-group">
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

                                  <div className="form-group">
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


                                {/* <div className="form-group">
                                    <label>เกี่ยวกับฉัน</label>
                                    <textarea type="text" className="form-control" id="line" name="line" placeholder='เกี่ยวกับฉัน'  
                                    onChange={handleChange} disabled={!editing}
                                    />
                                </div> */}
                              </fieldset>
                            </form>
                          </div>
                          
                    </div> 
                      
                    </div>
                  
                    <div className='row justify-content-end'>
                        <div className="col-7  bg-light ">
                        <fieldset>
                          <legend className="legend-title">ข้อมูลการศึกษา</legend>
                          {Array.isArray(profile.educations) && profile.educations.length > 0 ?(
                            profile.educations.map((edu, index) => (
                              <div key={index} className="education-item mb-4">
                                <div className="form-group">
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

                                <div className="form-group">
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

                                <div className="form-group">
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

                                <div className="form-group">
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
                   
                        <div className='row justify-content-end'>
                              <div className='col-7 text-center '>
                              {editing ? (
                                <button className="submit-button" type="submit" onClick={handleSave}>บันทึก</button>
                              ) : (
                                <button className="submit-button" type="submit" onClick={handleEdit}>แก้ไขข้อมูลส่วนตัว</button>
                              )}
                              </div>
                        </div>             
                    </div>  
      </div> 
    </section>
    
  );
}

export default Profile;
