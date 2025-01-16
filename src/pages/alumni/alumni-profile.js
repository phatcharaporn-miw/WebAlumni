import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../css/profile.css';
import { useOutletContext } from "react-router-dom";

function Profile() {
  const [profile, setProfile] = useState(null);
  const {handleLogout } = useOutletContext();
  
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
  }, []);

  if (!profile) {
    return <div>ไม่พบข้อมมูลผู้ใช้</div>;
  }

  //แปลงวันที่
  // const formatBirthday = (birthday) => {
  //   if (!birthday) return ''; // ถ้าไม่มีวันเกิดให้คืนค่าว่าง
  
  //   const [day, month, year] = birthday.split('/'); // แยกวัน เดือน ปี
  //   return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`; // แปลงเป็น YYYY-MM-DD
  // };
  
  const degrees = Array.isArray(profile.degrees) ? profile.degrees : [];


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
                  <div className="menu-item py-2 mb-2 rounded">เว็บบอร์ดที่สร้าง</div>
                  <div className="menu-item py-2 mb-2 rounded">ประวัติการบริจาค</div>
                  <div className="menu-item py-2 mb-2 rounded">ประวัติการเข้าร่วมกิจกรรม</div>
                  <div className="menu-item py-2 mb-2 rounded">ประวัติการสั่งซื้อ</div>
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
                                    <input type="text" className="form-control" id="full_name" name="full_name" placeholder={profile.nick_name}
                                    
                                    
                                    required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>รหัสผ่าน<span className="importent">*</span></label>
                                    <input type="text" className="form-control" id="full_name" name="full_name" placeholder='รหัสผ่าน'
                                    value={profile.full_name}
                                    
                                    required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>คำนำหน้า<span className="importent">*</span></label>
                                    <select name="title" value={profile.title} readOnly >
                                        <option value="">คำนำหน้า</option>
                                        <option value="นาย">นาย</option>
                                        <option value="นาง">นาง</option>
                                        <option value="นางสาว">นางสาว</option>
                                        
                                    </select>
                                    
                                </div>

                                <div className="form-group">
                                    <label>ชื่อ-สกุล<span className="importent">*</span></label>
                                    <input type="text" className="form-control" id="full_name" name="full_name" placeholder= {profile.fullName}
                                       readOnly
                                    />
                                </div>

                                <div className="form-group">
                                    <label>ชื่อเล่น<span className="importent">*</span></label>
                                     <input type="text" className="form-control" id="nick_name" name="nick_name" placeholder={profile.nick_name}
                                     readOnly
                                    
                                    />
                                </div>

                                <div className="form-group">
                                    <label>อีเมล<span className="importent">*</span></label>
                                    <input type="email" className="form-control" id="email" name="email" placeholder={profile.email}
                                    readOnly
                                    />
                                </div>

                                <div className="form-group">
                                    <label>ที่อยู่<span className="importent">*</span></label>
                                    <input type="text" className="form-control" id="address" name="address" placeholder={profile.address}
                                    readOnly                                   
                                    />
                                </div>
                               
                                <div className="form-group">
                                    <label>วัน/เดือน/ปีเกิด<span className="importent">*</span></label>
                                    <input type="date" className="form-control" id="birthday" name="birthday" value={profile.birthday}
                                    readOnly
                                    />
                                </div>

                                <div className="form-group">
                                    <label>เบอร์โทร<span className="importent">*</span></label>
                                    <input type="number" className="form-control" id="phone" name="phone" placeholder={profile.phone}
                                    value={profile.phone}
                                    
                                    readOnly
                                    />
                                </div>

                                <div className="form-group">
                                    <label>โซเชียล<span className="importent">*</span></label>
                                    <input type="text" className="form-control" id="line" name="line" placeholder={profile.line}
                                    value={profile.line}
                                    readOnly
                                    />
                                </div>

                                <div className="form-group">
                                    <label>เกี่ยวกับฉัน</label>
                                    <textarea type="text" className="form-control" id="line" name="line" placeholder='เกี่ยวกับฉัน'/>
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
                                        <div className='education-row'>
                                            <div className="education-item">
                                                <label>
                                                <input type="checkbox" name="degree" value="1"  checked={profile.degrees.includes(1)}/>
                                                ป.ตรี
                                                </label>
                                            </div>
                                            <div className="education-item">
                                                <label>
                                                <input type="checkbox" name="degree" value="2"  checked={degrees.includes(2)}/>
                                                ป.โท
                                                </label>
                                            </div>
                                            <div className="education-item">
                                                <label>
                                                <input type="checkbox" name="degree" value="3"  checked={degrees.includes(3)}/>
                                                ป.เอก
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>รหัสนักศึกษา<span className="importent">*</span></label>
                                        <input type="text" className="form-control" id="studentId" name="studentId" placeholder={profile.studentId}
                                            value={profile.studentId}
                                            
                                            readOnly
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>ปีการศึกษาที่จบ<span className="importent">*</span></label>
                                        <input type="text" className="form-control" id="graduation_year" name="graduation_year" placeholder={profile.graduation_year}
                                            value={profile.graduation_year}
                                            
                                            readOnly
                                        />
                                    </div> 

                                    <div className="form-group">
                                        <label>สาขา<span className="importent">*</span></label>
                                        <input type="text" className="form-control" id="graduation_year" name="graduation_year" placeholder='ปีการศึกษาที่จบ'
                                            value={profile.graduation_year}
                                            
                                            readOnly
                                        />
                                    </div>                                
                                </div>
                            </fieldset>
                            
                  </div> 
                  <div className='row justify-content-end'>
                        <div className='col-7 text-center '>
                          <button className="submit-button" type="submit">แก้ไขข้อมูลส่วนตัว</button>
                        </div>
                  </div>
                      
                      
        </div>
        
      </div>
      
    </section>
    
  );
}

export default Profile;
