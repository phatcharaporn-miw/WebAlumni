import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Search, Calendar, MapPin, Phone, MessageSquare, Mail, GraduationCap } from "lucide-react";
import '../css/CheckStudentId.css';
import 'react-toastify/dist/ReactToastify.css';
import Swal from "sweetalert2";

const RegistrationForm = () => {
  const [userData, setUserData] = useState({
    role: '3',
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

  const [studentSearchStep, setStudentSearchStep] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [studentFound, setStudentFound] = useState(null);
  const navigate = useNavigate();
  const [major, setMajor] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');

  const handleCheck = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await axios.post('http://localhost:3001/api/check-studentId', { studentId });

      if (res.data.success) {
        setResult({
          found: true,
          message: res.data.message,
          student: res.data.data,
        });
      } else {
        setResult({
          found: false,
          message: res.data.message,
        });
      }
    } catch (error) {
      console.error(error);
      setResult({
        found: false,
        message: 'เกิดข้อผิดพลาดในการตรวจสอบ',
      });
    } finally {
      setLoading(false);
    }
  };

  //ตรวจสอบรหัสผ่าน
  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]+$/;
    return passwordRegex.test(password);
  };

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setUserData(prev => ({ ...prev, role: newRole }));

    if (newRole === '3') {
      setStudentSearchStep(true);
      setStudentFound(null);
    } else {
      setStudentSearchStep(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEducationChange = (index, field, value) => {
    setUserData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };


  const handleGoToLogin = () => {
    if (studentFound) {
      setUserData(prev => ({
        ...prev,
        full_name: studentFound.full_name
      }));
      navigate('/login');
    }
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

    // Debug formData ทุก field
    for (let [key, value] of data.entries()) {
      console.log(key, value);
    }

    try {
      const response = await axios.post("http://localhost:3001/add/register", data, {
        withCredentials: true
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

  // แสดงสาขา
  useEffect(() => {
    const fetchMajors = async () => {
      try {
        const response = await axios.get('http://localhost:3001/add/major', {
          withCredentials: true
        });
        setMajor(response.data.major);
      } catch (err) {
        setError("ไม่สามารถดึงข้อมูลสาขาได้");
        console.error("Error fetching majors:", err);
      }
    };
    fetchMajors();
  }, []);

  return (
    <div className='register-page container'>
      <img className="register-logo" src="./image/สมาคม-logo.png" alt="Logo" />
      <div className="form-container">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-10 col-xl-8">
              <div className="card">
                <div className="card-body p-4 p-md-5">
                  {/* Header */}
                  <div className="text-center mb-4">
                    <h2 className="fw-bold text-dark mb-2">ลงทะเบียน</h2>
                    <p className="text-muted">สร้างบัญชีผู้ใช้งานใหม่</p>
                  </div>

                  {/* User Type Selection */}
                  <div className="section-card">
                    <h3 className="h5 fw-semibold text-dark mb-3 d-flex align-items-center">
                      <User className="me-2" size={20} />
                      เลือกประเภทผู้ใช้
                    </h3>
                    <select
                      name="role"
                      value={userData.role}
                      onChange={handleRoleChange}
                      className="form-select"
                      required
                    >
                      <option value="3">ศิษย์เก่า</option>
                      <option value="4">ศิษย์ปัจจุบัน</option>
                    </select>
                  </div>


                  <div className="upImage">
                    <div className="image-profile">
                      <img className="profile" src={selectedFile ? URL.createObjectURL(selectedFile) : "default-image.png"} alt="Profile" />
                      <br />
                      <label htmlFor="file-upload" className="upFile">อัพโหลดรูปภาพ</label>
                      <input type="file" id="file-upload" className="upFile-input" name="file-upload" onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setSelectedFile(file);
                        }
                      }} />
                    </div>
                  </div>

                  {/* Student ID Search for Alumni */}
                  {userData.role === '3' && studentSearchStep && (
                    <div className="section-card border border-primary bg-primary bg-opacity-10">
                      <h3 className="h5 fw-semibold text-primary mb-3 d-flex align-items-center">
                        <Search className="me-2" size={20} />
                        ค้นหาข้อมูลนักศึกษา
                      </h3>
                      <form onSubmit={handleCheck} className="mb-4">
                        <p className="text-primary mb-3">
                          กรุณากรอกรหัสนักศึกษาเพื่อค้นหาข้อมูลของท่าน
                        </p>
                        <div className="row g-2 mb-3">
                          <div className="col">
                            <input
                              type="text"
                              placeholder="กรอกรหัสนักศึกษา (เช่น 650123456-7 หรือ 456-7)"
                              value={studentId}
                              onChange={(e) => setStudentId(e.target.value)}
                              className="form-control w-100"
                            />
                          </div>
                          <div className="col-auto">
                            <button
                              type="button"
                              onClick={handleCheck}
                              className="btn btn-primary d-flex align-items-center"
                            >
                              {isSearching ? (
                                <>
                                  <div className="spinner-border spinner-border-sm me-2" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                  </div>
                                  กำลังค้นหา...
                                </>
                              ) : (
                                <>
                                  <Search className="me-2" size={16} />
                                  ค้นหา
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </form>

                      {result && (
                        <div className={`alert mt-3 ${result.found ? 'alert-success' : 'alert-danger'}`}>
                          {result.found ? (
                            <>
                              <h4 className="alert-heading h6 fw-semibold">พบข้อมูลนักศึกษา</h4>
                              <div className="small">
                                <p className="mb-1"><strong>รหัสนักศึกษา:</strong> {result.student.studentId}</p>
                                <p className="mb-1"><strong>ชื่อ-สกุล:</strong> {result.student.full_name}</p>
                                <p className="mb-1"><strong>สาขา:</strong> {result.student.major_name}</p>
                                <p className="mb-1"><strong>ระดับการศึกษา:</strong> {result.student.degree_name}</p>
                                <p className="mb-3"><strong>ปีที่จบ:</strong> {result.student.graduation_year}</p>
                              </div>
                              <button
                                type="button"
                                onClick={handleGoToLogin}
                                className="btn btn-success"
                              >
                                ไปหน้าเข้าสู่ระบบ
                              </button>
                            </>
                          ) : (
                            <>
                              <p className="mb-2">{result.message || 'ไม่พบบัญชีของคุณ กรุณาลงทะเบียน'}</p>
                              <a href="/register" className="btn btn-outline-danger btn-sm">ลงทะเบียน</a>
                            </>
                          )}
                        </div>
                      )}
                      <div className="alert alert-warning">
                        <small>
                          <strong>ตัวอย่างการกรอกรหัสนักศึกษาเพื่อตรวจสอบ:</strong> 650123456-7 หรือ 456-7
                        </small>
                      </div>
                    </div>
                  )}

                  {/* Show Registration Form If Not In Check Step */}
                  {userData.role && (userData.role !== '3' || !studentSearchStep) && (
                    <>
                      {/* Personal Information */}
                      {(userData.role === '3' || userData.role === '4') && (
                        <div className="section-card">
                          <h3 className="h5 fw-semibold text-dark mb-3 d-flex align-items-center">
                            <User className="me-2" size={20} />
                            ข้อมูลส่วนตัว
                          </h3>
                          <div className="row g-3">
                            <div className="col-md-6">
                              <label className="form-label">คำนำหน้า <span className="text-danger">*</span></label>
                              <select
                                name="title"
                                value={userData.title}
                                onChange={handleInputChange}
                                className="form-select"
                                required
                              >
                                <option value="">คำนำหน้า</option>
                                <option value="นาย">นาย</option>
                                <option value="นาง">นาง</option>
                                <option value="นางสาว">นางสาว</option>
                              </select>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">ชื่อ-สกุล <span className="text-danger">*</span></label>
                              <input
                                type="text"
                                name="full_name"
                                placeholder="ชื่อ-สกุล"
                                value={userData.full_name}
                                onChange={handleInputChange}
                                className="form-control"
                                required
                              />
                            </div>
                          </div>

                          {/* Alumni Only Fields */}
                          {userData.role === '3' && (
                            <>
                              <div className="row g-3 mt-2">
                                <div className="col-md-6">
                                  <label className="form-label">ชื่อเล่น</label>
                                  <input
                                    type="text"
                                    name="nick_name"
                                    value={userData.nick_name}
                                    onChange={handleInputChange}
                                    className="form-control"
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label className="form-label">วัน/เดือน/ปีเกิด <span className="text-danger">*</span></label>
                                  <div className="input-group">
                                    <span className="input-group-text">
                                      <Calendar size={20} />
                                    </span>
                                    <input
                                      type="date"
                                      name="birthday"
                                      value={userData.birthday}
                                      onChange={handleInputChange}
                                      className="form-control"
                                      required
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="mt-3">
                                <label className="form-label">ที่อยู่ <span className="text-danger">*</span></label>
                                <div className="input-group">
                                  <span className="input-group-text"><MapPin size={20} /></span>
                                  <input
                                    type="text"
                                    name="address"
                                    value={userData.address}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    required
                                  />
                                </div>
                              </div>

                              <div className="row g-3 mt-2">
                                <div className="col-md-6">
                                  <label className="form-label">เบอร์โทร <span className="text-danger">*</span></label>
                                  <div className="input-group">
                                    <span className="input-group-text"><Phone size={20} /></span>
                                    <input
                                      type="tel"
                                      name="phone"
                                      value={userData.phone}
                                      onChange={handleInputChange}
                                      className="form-control"
                                      required
                                    />
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <label className="form-label">โซเชียล</label>
                                  <div className="input-group">
                                    <span className="input-group-text"><MessageSquare size={20} /></span>
                                    <input
                                      type="text"
                                      name="line"
                                      value={userData.line}
                                      onChange={handleInputChange}
                                      className="form-control"
                                    />
                                  </div>
                                </div>
                              </div>
                            </>
                          )}

                          <div className="mt-3">
                            <label className="form-label">อีเมล <span className="text-danger">*</span></label>
                            <div className="input-group">
                              <span className="input-group-text"><Mail size={20} /></span>
                              <input
                                type="email"
                                name="email"
                                value={userData.email}
                                onChange={handleInputChange}
                                className="form-control"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Education Info for Current Students */}
                      {userData.role === '4' && userData.education.map((edu, index) => (
                        <div key={index} className="section-card">
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

                          </div>
                          <h3 className="h5 fw-semibold text-dark mb-3 d-flex align-items-center">
                            <GraduationCap className="me-2" size={20} />
                            ข้อมูลการศึกษา
                          </h3>
                          <div className="row g-3">
                            <div className="col-md-6">
                              <label className="form-label">ระดับการศึกษา <span className="text-danger">*</span></label>
                              <select
                                name="degree"
                                value={edu.degree}
                                onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                                className="form-select"
                                required
                              >
                                <option value="">เลือกระดับการศึกษา</option>
                                <option value="1">ป.ตรี</option>
                                <option value="2">ป.โท</option>
                                <option value="3">ป.เอก</option>
                              </select>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">สาขา <span className="text-danger">*</span></label>
                              <select
                                name="major"
                                value={edu.major}
                                onChange={(e) => handleEducationChange(index, 'major', e.target.value)}
                                className="form-select"
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
                          </div>

                          <div className="row g-3 mt-2">
                            <div className="col-md-6">
                              <label className="form-label">รหัสนักศึกษา <span className="text-danger">*</span></label>
                              <input
                                type="text"
                                name="studentId"
                                value={edu.studentId}
                                onChange={(e) => handleEducationChange(index, 'studentId', e.target.value)}
                                className="form-control"
                                required
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">ปีที่เรียน <span className="text-danger">*</span></label>
                              <select
                                name="student_year"
                                value={edu.student_year || ''}
                                onChange={(e) => handleEducationChange(index, 'student_year', e.target.value)}
                                className="form-select"
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
                        </div>
                      ))}

                      {/* Submit Buttons */}
                      <div className="d-grid gap-2 d-sm-flex justify-content-sm-end pt-3">
                        <button
                          type="button"
                          className="btn btn-outline-secondary flex-sm-fill"
                        >
                          ยกเลิก
                        </button>
                        <button
                          type="submit"
                          onClick={handleSubmit}
                          className="btn btn-primary flex-sm-fill"
                        >
                          ลงทะเบียน
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default RegistrationForm;