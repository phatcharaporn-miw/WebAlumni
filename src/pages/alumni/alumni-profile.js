import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../css/profile.css';
import { useOutletContext } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";

function Profile() {
  const [profile, setProfile] = useState({});
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
    const date = new Date(dbDate); // สร้าง Date object จาก dbDate
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
                    <div className="menu-item py-2 mb-2 rounded" onClick={handleClick}>กระทู้ที่สร้าง</div>
                    <div className="menu-item py-2 mb-2 rounded">ประวัติการบริจาค</div>
                    <div className="menu-item py-2 mb-2 rounded">ประวัติการเข้าร่วมกิจกรรม</div>
                    <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick('/alumni-profile-souvenir')}>ประวัติการสั่งซื้อ</div>
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
                                    <select name="title" value={profile.title} disabled>
                                        <option value="">คำนำหน้า</option>
                                        <option value="นาย">นาย</option>
                                        <option value="นาง">นาง</option>
                                        <option value="นางสาว">นางสาว</option>
                                    </select>                                  
                                </div>

                                <div className="form-group">
                                    <label>ชื่อ-สกุล<span className="importent">*</span></label>
                                    <input type="text" className="form-control" id="full_name" name="full_name" placeholder= {profile.fullName}
                                       onChange={handleChange} disabled={!editing}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>ชื่อเล่น<span className="importent">*</span></label>
                                     <input type="text" className="form-control" id="nick_name" name="nick_name" placeholder={profile.nick_name}
                                     onChange={handleChange} disabled={!editing}
                                    
                                    />
                                </div>

                                <div className="form-group">
                                    <label>อีเมล<span className="importent">*</span></label>
                                    <input type="email" className="form-control" id="email" name="email" placeholder={profile.email}
                                    onChange={handleChange} disabled={!editing}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>ที่อยู่<span className="importent">*</span></label>
                                    <input type="text" className="form-control" id="address" name="address" placeholder={profile.address}
                                     value={profile.address || ''} onChange={handleChange} disabled={!editing}                                   
                                    />
                                </div>
                               
                                <div className="form-group">
                                    <label>วัน/เดือน/ปีเกิด<span className="importent">*</span></label>
                                    <input type="date" className="form-control" id="birthday" name="birthday" value={formatBirthday(profile.birthday)}
                                    onChange={handleChange} disabled={!editing}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>เบอร์โทร<span className="importent">*</span></label>
                                    <input type="number" className="form-control" id="phone" name="phone" placeholder={profile.phone}
                                    value={profile.phone}
                                    
                                    onChange={handleChange} disabled={!editing}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>โซเชียล<span className="importent">*</span></label>
                                    <input type="text" className="form-control" id="line" name="line" placeholder={profile.line}
                                    value={profile.line}
                                    onChange={handleChange} disabled={!editing}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>เกี่ยวกับฉัน</label>
                                    <textarea type="text" className="form-control" id="line" name="line" placeholder='เกี่ยวกับฉัน'  
                                    onChange={handleChange} disabled={!editing}
                                    />
                                </div>
                              </fieldset>
                            </form>
                          </div>
                          
                        </div> 
                      
                    </div>
                  
                    <div className='row justify-content-end'>
                        <div className="col-7  bg-light ">
                        <fieldset>
                                <legend className="legend-title mb-4">ระดับการศึกษาที่จบจาก CP</legend>
                                <div className="education-grid">
                                  <div className="form-group">
                                    <label>ระดับการศึกษา<span className="importent">*</span></label>
                                    <div className="education-row">
                                        {['ป.ตรี', 'ป.โท', 'ป.เอก'].map((degree, index) => (
                                            <div className="education-item" key={index}>
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        name="degrees"
                                                        value={degree}
                                                        checked={profile.degrees?.includes(degree) || false}
                                                        disabled={!editing}
                                                        onChange={(e) => {
                                                            const selectedDegrees = [...profile.degrees];
                                                            if (e.target.checked) {
                                                                selectedDegrees.push(degree);
                                                            } else {
                                                                const degreeIndex = selectedDegrees.indexOf(degree);
                                                                if (degreeIndex > -1) {
                                                                    selectedDegrees.splice(degreeIndex, 1);
                                                                }
                                                            }
                                                            setProfile({ ...profile, degrees: selectedDegrees });
                                                        }}
                                                    />
                                                    {degree}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                  </div>

                                    <div className="form-group">
                                        <label>รหัสนักศึกษา<span className="importent">*</span></label>
                                        <input type="text" className="form-control" id="studentId" name="studentId" placeholder={profile.studentId}
                                            value={profile.studentId}
                                            
                                            onChange={handleChange} disabled={!editing}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>ปีการศึกษาที่จบ<span className="importent">*</span></label>
                                        <input type="text" className="form-control" id="graduation_year" name="graduation_year" placeholder={profile.graduation_year}
                                            value={profile.graduation_year}
                                            
                                            onChange={handleChange} disabled={!editing}
                                        />
                                    </div> 

                                    <div className="form-group">
                                        <label>สาขา<span className="importent">*</span></label>
                                        <select
                                            name="major_id"
                                            value={profile.major_id || ''}
                                            onChange={handleChange}
                                            disabled={!editing}
                                        >
                                            <option value="">เลือกสาขา</option>
                                            {major.map((major) => (
                                                <option key={major.major_id} value={major.major_id}>
                                                    {major.major_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>                              
                                </div>
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
