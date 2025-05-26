import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import "../css/Register.css";
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import Swal from "sweetalert2";

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
    education: [
        {
            degree: '', 
            major: '',  
            studentId: '', 
            graduation_year: '', 
        },
    ],
    
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [passwordError, setPasswordError] = useState('');

    //ตรวจสอบรหัสผ่าน
  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]+$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    // ส่ง education สำหรับ role=3 (ศิษย์เก่า) และ role=4 (ศิษย์ปัจจุบัน)
    if ((userData.role === '3' || userData.role === '4') && Array.isArray(userData.education)) {
        const educationData = userData.education.map((edu) => {
            if (userData.role === '3') {
                return {
                    degree: edu.degree,
                    major: edu.major,
                    studentId: edu.studentId,
                    graduation_year: edu.graduation_year, // ปีจบ
                };
            } else if (userData.role === '4') {
                return {
                    degree: edu.degree,
                    major: edu.major,
                    studentId: edu.studentId,
                    student_year: edu.student_year, // ปีที่กำลังเรียน
                };
            }
        });
        data.append("education", JSON.stringify(educationData));
    }

    // เพิ่มข้อมูลอื่นๆ
    Object.entries(userData).forEach(([key, value]) => {
        if (key !== "education") {
            data.append(key, value);
        }
    });     

    if (selectedFile) {
        data.append("image_path", selectedFile);
      }    

    // 🐛 Debug formData ทุก field
    for (let [key, value] of data.entries()) {
        console.log(key, value);
    }

      try {
        const response = await axios.post("http://localhost:3001/add/register", data, {
        });
        Swal.fire({
            icon: "success",
            title: "ลงทะเบียนสำเร็จ!",
            text: "คุณได้ลงทะเบียนสำเร็จแล้ว",
            confirmButtonText: "ตกลง",
        }).then(() => {
            console.log(response.data);
            navigate("/login"); 
        });

    } catch (error) {
        console.error("Register error:", error);

        Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            text: "ไม่สามารถลงทะเบียนได้ กรุณาลองใหม่อีกครั้ง",
            confirmButtonText: "ตกลง",
        });
    }
  };
  
  useEffect(() => {
    const fetchMajors = async () => {
      try {
        const response = await axios.get('http://localhost:3001/add/major');
        setMajor(response.data.major);
      } catch (err) {
        setError("ไม่สามารถดึงข้อมูลสาขาได้");
        console.error("Error fetching majors:", err);
      }
    };
    fetchMajors();
  }, []);


  const handleInputChange = (e) => {
    const {name, value, checked, type} = e.target;

    if (name === 'password') {
      if (!validatePassword(value)) {
        setPasswordError('รหัสผ่านต้องมีอักขระพิมพ์ใหญ่ พิมพ์เล็ก และตัวเลข และห้ามใช้อักขระพิเศษ');
      } else {
        setPasswordError('');
      }
    }

    if (type === 'checkbox' && name === 'degree') {
        const updatedDegrees = checked
          ? [...userData.degree, parseInt(value)]
          : userData.degree.filter((item) => item !== parseInt(value));
        
        setUserData((prevState) => ({ ...prevState, degree: updatedDegrees }));
      } else {
        setUserData((prevState) => ({ ...prevState, [name]: value }));
      }
  };

    const handleEducationChange = (index, field, value) => {
        const updatedEducation = [...userData.education];
        updatedEducation[index][field] = value;
        if (field === "degree") {
            updatedEducation[index][field] = parseInt(value); // degree_id
        }
        if (field === "major") {
            updatedEducation[index][field] = parseInt(value); // major_id
        }

        setUserData((prevState) => ({ ...prevState, education: updatedEducation }));
        
        console.log("Selected major ID:", updatedEducation[index].major);  

    };

    const addEducation = () => {
        setUserData((prevState) => ({
            ...prevState,
            education: [...prevState.education, { degree: '', major: '', studentId: '', graduation_year: '' }],
        }));
    };

    const removeEducation = (index) => {
        const updatedEducation = userData.education.filter((_, i) => i !== index);
        setUserData((prevState) => ({ ...prevState, education: updatedEducation }));
    };

    return (
        <div className="register-page container">
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

                <div className="form-regis-bg ">
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
                                {/* <div className="group"> */}
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
                                        {/* {passwordError && (
                                            <span style={{ color: "red", fontSize: "11px", display: "block", marginBottom: "5px" }}>
                                            {passwordError}
                                            </span>
                                        )} */}
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="password"
                                            name="password"
                                            placeholder="รหัสผ่านต้องมีอักขระพิมพ์ใหญ่ พิมพ์เล็ก และตัวเลข"
                                            title="รหัสผ่านต้องมีอักขระพิมพ์ใหญ่ พิมพ์เล็ก และตัวเลข และห้ามใช้อักขระพิเศษ"
                                            value={userData.password}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                            
                                {/* </div> */}
                            </fieldset>

                            {userData.role === "3" && ( 
                            <>
                            <fieldset>
                                <legend className="legend-title">ข้อมูลส่วนตัว</legend>
                                <div className="form-group">
                                    <label>คำนำหน้า<span className="importent">*</span></label>
                                    <select name="title" value={userData.title} onChange={handleInputChange} required>
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
                                <legend className="legend-title">ข้อมูลการศึกษา</legend>
                                {userData.education.map((edu, index) => (
                                    <div key={index} className="education-item mb-4">
                                        <div className="form-group">
                                            <label>ระดับการศึกษา<span className="importent">*</span></label>
                                            <select
                                                name="degree"
                                                value={edu.degree}
                                                onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                                                className="form-control"
                                                required
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
                                                required
                                            >
                                                <option value="">เลือกสาขา</option>
                                                {major.length > 0 ? (
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
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>ปีที่เรียน<span className="importent">*</span></label>
                                            <select
                                                name="student_year"
                                                value={edu.student_year || ''}
                                                onChange={(e) => handleEducationChange(index, 'student_year', e.target.value)}
                                                className="form-control"
                                                required
                                            >
                                                <option value="">เลือกปีที่เรียน</option>
                                                <option value="1">ปี 1</option>
                                                <option value="2">ปี 2</option>
                                                <option value="3">ปี 3</option>
                                                <option value="4">ปี 4</option>
                                                <option value="5">ปี 5</option>
                                                <option value="อื่นๆ">อื่นๆ</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>ปีการศึกษาที่จบ</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="graduation_year"
                                                placeholder="ปีการศึกษาที่จบ"
                                                value={edu.graduation_year}
                                                onChange={(e) => handleEducationChange(index, 'graduation_year', e.target.value)}
                                            />
                                        </div>

                                        {userData.education.length > 1 && (
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
                                ))}

                                <button type="button" className="btn btn-primary mt-3" onClick={addEducation}>
                                    เพิ่มข้อมูลการศึกษา
                                </button>
                            </fieldset>
                            </>
                            )}

                            {userData.role === "4" && (
                            <>
                                <fieldset>
                                    <legend className="legend-title">ข้อมูลส่วนตัว</legend>
                                    <div className="form-group">
                                        <label>คำนำหน้า<span className="importent">*</span></label>
                                        <select name="title" value={userData.title} onChange={handleInputChange} required>
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
                                        <label>อีเมล<span className="importent">*</span></label>
                                        <input type="email" className="form-control" id="email" name="email" placeholder='อีเมล'
                                        value={userData.email}
                                        onChange={handleInputChange}
                                        required
                                        />
                                    </div>                    
                                </fieldset>

                                <fieldset>
                                    <legend className="legend-title">ข้อมูลการศึกษา</legend>
                                    {userData.education.map((edu, index) => (
                                        <div key={index} className="education-item mb-4">
                                            <div className="form-group">
                                                <label>ระดับการศึกษา<span className="importent">*</span></label>
                                                <select
                                                  name="degree"
                                                  value={edu.degree}
                                                  onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                                                  className="form-control"
                                                  required
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
                                                  required
                                                >
                                                  <option value="">เลือกสาขา</option>
                                                  {major.length > 0 ? (
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
                                                  required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>ปีที่เรียน<span className="importent">*</span></label>
                                                <select
                                                name="student_year"
                                                value={edu.student_year || ''}
                                                onChange={(e) => handleEducationChange(index, 'student_year', e.target.value)}
                                                className="form-control"
                                                required
                                                >
                                                <option value="">เลือกปีที่เรียน</option>
                                                <option value="1">ปี 1</option>
                                                <option value="2">ปี 2</option>
                                                <option value="3">ปี 3</option>
                                                <option value="4">ปี 4</option>
                                                <option value="5">ปี 5</option>
                                                <option value="อื่นๆ">อื่นๆ</option>
                                                </select>
                                            </div>
                                        </div>
                                    ))}        
                                </fieldset>
                            </>
                            )}
                            
                            {userData.role === "1" && (
                                <>
                                    <fieldset>
                                        <legend className="legend-title">ข้อมูลเพิ่มเติม</legend>
                                        <div className="form-group">
                                            <label>ชื่อ-สกุล<span className="importent">*</span></label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="full_name"
                                                name="full_name"
                                                placeholder="ชื่อ-สกุล"
                                                value={userData.full_name || ''}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>อีเมล<span className="importent">*</span></label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                id="email"
                                                name="email"
                                                placeholder="example@email.com"
                                                value={userData.email}
                                                onChange={handleInputChange}
                                                required 
                                            />
                                        </div>
                                    </fieldset>
                                </>
                            )}

                            {userData.role === "2" && (
                                <>
                                    <fieldset>
                                        <legend className="legend-title">ข้อมูลเพิ่มเติม</legend>
                                        <div className="form-group">
                                            <label>ชื่อ-สกุล<span className="importent">*</span></label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="full_name"
                                                name="full_name"
                                                placeholder="ชื่อ-สกุล"
                                                value={userData.full_name || ''}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>อีเมล<span className="importent">*</span></label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                id="email"
                                                name="email"
                                                placeholder="example@email.com"
                                                value={userData.email}
                                                onChange={handleInputChange}
                                                required 
                                            />
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