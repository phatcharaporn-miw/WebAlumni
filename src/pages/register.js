import React, { useEffect, useState } from 'react';
import { data, Link } from 'react-router-dom';
import "../css/Register.css";
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';


function Register() {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [major, setMajor] = useState([]);
  const [userData, setUserData] = useState({
    username: '',
    password: '',
    email: '',
    role: '',
    full_name: '',
    nick_name: '',
    title: '',
    birthday: '',
    address: '',
    phone: '',
    line: '',
    major: '',
    studentId:'',
    graduation_year:'',
    degree:[],
    
  });

  const [selectedFile, setSelectedFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

     // แสดงข้อมูลที่กรอกไป
     console.log("FormData on submit:", userData);

    // ดึงไฟล์จาก input
    const fileInput = document.getElementById("file-upload");
    const selectFile = fileInput.files[0]; 
    
    const data = new FormData();
    if (selectedFile) {
        data.append('image_path', selectedFile); // เพิ่มไฟล์ลงใน FormData
    }

    Object.entries(userData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            value.forEach((v) => data.append(key, v));
        } else {
            data.append(key, value);
        }
    });

    for (let [key, value] of data.entries()) {
        console.log(key, value); 
    } 
    
    if (!userData.username || !userData.password || !userData.role) {
        alert("กรุณากรอกข้อมูลให้ครบถ้วน");
        return;
    }
     // ทำการส่งข้อมูลไป Backend
     try {
        const response = await axios.post("http://localhost:3001/add/register", data, {
            headers: { "Content-Type": "multipart/form-data" },
        });
         alert('ลงทะเบียนสำเร็จ!');
        navigate("/login");
    //   if (response.data.success) {
       
        
    //   }
     } catch (error) {
      alert("เกิดข้อผิดพลาดในการลงทะเบียน");
     console.error("Register error:", error);
     }
  };
  
  // ดึงข้อมูลสาขามาแสดงใน dropdown 
  useEffect(() => {
    const fetchMajors = async () => {
      try {
        const response = await axios.get('http://localhost:3001/add/major');
        // console.log("Fetched majors:", response.data);
        setMajor(response.data);
      } catch (err) {
        setError("ไม่สามารถดึงข้อมูลสาขาได้");
        console.error("Error fetching majors:", err);
      }
    };
    fetchMajors();
  }, []);


  const handleInputChange = (e) => {
    const {name, value, checked, type} = e.target;

    if (type === 'checkbox' && name === 'degree') {
        const updatedDegrees = checked
          ? [...userData.degree, parseInt(value)]  // true => ใช้การกระจายค่าเพื่อเพิ่ม degree_id ใหม่เข้าไปในอาร์เรย์ userData.degree และแปลงค่า string->int
          : userData.degree.filter((item) => item !== parseInt(value)); // false =>  ลบค่า degree_id จาก array ที่ถูกคลิก
        
        setUserData((prevState) => ({ ...prevState, degree: updatedDegrees })); //prevState ใช้เข้าถึงสถานะก่อนหน้า เก็บค่าของ prevState ไว้ทั้งหมด และอัปเดตค่าใหม่
      } else {
        setUserData((prevState) => ({ ...prevState, [name]: value })); //ถ้าเป็น input หรือฟอร์มชนิดอื่นจะอัปเดตค่าของ [name]: value
      }
    // setFormData({
    //   ...formData,[name]: value, 
    // });
  };

    return (
        <div className="register-page">
            <img className="register-logo" src="./image/สมาคม-logo.png" alt="Logo" />
            <div className="content-register">
                <div className="upImage">
                    <div className="image-profile">
                        <img className="profile" src={selectedFile ? URL.createObjectURL(selectedFile) : "default-image.png"}  alt="Profile" />
                        <br />
                        <label htmlFor="file-upload" className="upFile">อัพโหลดรูปภาพ</label>
                        <input type="file" id="file-upload" className="upFile-input" name="file-upload"  onChange={(e) => {const file = e.target.files[0];
                            if (file) {
                                setSelectedFile(file);
                            } 
                        }}/>
                    </div>
                </div>


                <div className="form-regis-bg">
                    <div className="form-regis">
                        <form onSubmit={handleSubmit}>
                            <h2>ลงทะเบียน</h2>
                            <fieldset>
                            <label className="form-label">เลือกประเภทผู้ใช้:</label>
                                <select  name="role" value={userData.role} onChange={(e) => handleInputChange({ target: { name: 'role', value: e.target.value } })} className="form-control">
                                    <option value="">เลือกบทบาท</option>
                                    <option value="1">แอดมิน</option>
                                    <option value="2">นายกสมาคม</option>
                                    <option value="3">ศิษย์เก่า</option>
                                    <option value="4">ศิษย์ปัจจุบัน</option>
                                </select>
                                <legend className="legend-title">สร้างบัญชีผู้ใช้</legend>
                                <div className="group">
                                    <div className="form-group">
                                        <label>ชื่อผู้ใช้งาน<span className="importent">*</span></label><br />
                                        <input type="text" className="form-control" id="username" name="username" placeholder='ชื่อผู้ใช้งาน'
                                        value={userData.username}
                                        onChange={handleInputChange}
                                        required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>สร้างรหัสผ่าน<span className="importent">*</span></label><br />
                                        <input type="password" className="form-control" id="password" name="password" placeholder='รหัสผ่าน'
                                        value={userData.password}
                                        onChange={handleInputChange}
                                        required
                                        />
                                    </div>
                            
                                </div>
                            </fieldset>

                            {userData.role === "3" && ( 
                            <>
                            <fieldset>
                                <legend className="legend-title">ข้อมูลส่วนตัว</legend>
                                <div className="form-group">
                                    <label>คำนำหน้า<span className="importent">*</span></label>
                                    <select name="title" value={userData.title} onChange={handleInputChange}>
                                        <option value="">คำนำหน้า</option>
                                        <option value="นาย">นาย</option>
                                        <option value="นาง">นาง</option>
                                        <option value="นางสาว">นางสาว</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>ชื่อ-สกุล<span className="importent">*</span></label>
                                    <input type="text" className="form-control" id="full_name" name="full_name" placeholder='ชื่อ-สกุล'
                                    value={userData.full_name}
                                    onChange={handleInputChange}
                                    required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>ชื่อเล่น<span className="importent">*</span></label>
                                     <input type="text" className="form-control" id="nick_name" name="nick_name" placeholder='ชื่อเล่น'
                                    value={userData.nick_name}
                                    onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>อีเมล<span className="importent">*</span></label>
                                    <input type="email" className="form-control" id="email" name="email" placeholder='อีเมล'
                                    value={userData.email}
                                    onChange={handleInputChange}
                                    required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>ที่อยู่<span className="importent">*</span></label>
                                    <input type="text" className="form-control" id="address" name="address" placeholder='ที่อยู่'
                                    value={userData.address}
                                    onChange={handleInputChange}
                                    />
                                </div>
                               
                                <div className="form-group">
                                    <label>วัน/เดือน/ปีเกิด<span className="importent">*</span></label>
                                    <input type="date" className="form-control" id="birthday" name="birthday" 
                                    value={userData.birthday}
                                    onChange={handleInputChange}
                                    required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>เบอร์โทร<span className="importent">*</span></label>
                                    <input type="number" className="form-control" id="phone" name="phone" placeholder='เบอร์โทร'
                                    value={userData.phone}
                                    onChange={handleInputChange}
                                    required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>โซเชียล<span className="importent">*</span></label>
                                    <input type="text" className="form-control" id="line" name="line" placeholder='โซเชียล'
                                    value={userData.line}
                                    onChange={handleInputChange}
                                    />
                                </div>
                            </fieldset>

                            <fieldset>
                                <legend className="legend-title">ระดับการศึกษาที่จบจาก CP</legend>
                                <div className="education-grid">
                                    <div className="form-group">
                                        <label>ระดับการศึกษา<span className="importent">*</span></label>
                                        <div className='education-row'>
                                            <div className="education-item">
                                                <label>
                                                <input type="checkbox" name="degree" value="1" onChange={handleInputChange} />
                                                ป.ตรี
                                                </label>
                                            </div>
                                            <div className="education-item">
                                                <label>
                                                <input type="checkbox" name="degree" value="2" onChange={handleInputChange} />
                                                ป.โท
                                                </label>
                                            </div>
                                            <div className="education-item">
                                                <label>
                                                <input type="checkbox" name="degree" value="3" onChange={handleInputChange} />
                                                ป.เอก
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>รหัสนักศึกษา<span className="importent">*</span></label>
                                        <input type="text" className="form-control" id="studentId" name="studentId" placeholder='รหัสนักศึกษา'
                                            value={userData.studentId}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>ปีการศึกษาที่จบ<span className="importent">*</span></label>
                                        <input type="text" className="form-control" id="graduation_year" name="graduation_year" placeholder='ปีการศึกษาที่จบ'
                                            value={userData.graduation_year}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>สาขา<span className="importent">*</span></label>
                                        <select
                                            name="major"
                                            value={userData.major}
                                            onChange={(e) => handleInputChange({ target: { name: 'major', value: e.target.value } })}
                                            >
                                            <option value="">เลือกสาขา</option>
                                            {major.map((majorItem) => (
                                                <option key={majorItem.major_id} value={majorItem.major_id}>
                                                {majorItem.major_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>                                  
                                </div>
                            </fieldset>

                            </>
                            )}
                            <div className="button-group">
                                <div>
                                    <Link to="/login">
                                        <button className="cancel-button">ยกเลิก</button>
                                    </Link>
                                </div>
                                <div>
                                    <button className="submit-button" type="submit">สมัครสมาชิก</button>
                                </div>
                            </div>

                        </form>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default Register;