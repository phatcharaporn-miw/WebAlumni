import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function RegisterForm(){
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const [major, setMajor] = useState([]);
  const [formData, setFormData] = useState({
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
    major: ''
  });


  const handleInputChange = (e) => {
    const {name, value} = e.target;
    setFormData({
      ...formData,[name]: value, // เก็บค่าของฟอร์มไว้
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    // แสดงข้อมูลที่กรอกไป
    console.log("FormData on submit:", formData);

    if (!formData.username || !formData.password || !formData.email || !formData.role) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน!", { position: toast.POSITION.TOP_CENTER });
      return;
    }

     // ทำการส่งข้อมูลไป Backend
     try {
      const response = await axios.post("http://localhost:3001/add/register", formData) ;
      if (response.data.success) {
        setSuccess("ลงทะเบียนสำเร็จ!");
        toast.success("ลงทะเบียนสำเร็จ!", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 3000, 
          onClose: () => navigate('/president-home'), 
        });
        setError("");
        
      }
     } catch (error) {
      setError("เกิดข้อผิดพลาดในการลงทะเบียน");
      toast.error("เกิดข้อผิดพลาดในการลงทะเบียน!", { position: toast.POSITION.TOP_CENTER });
      console.error("Register error:", error);
     }
  };
  
  // ดึงข้อมูลสาขามาแสดงใน dropdown 
  useEffect(() => {
    const fetchMajors = async () => {
      try {
        const response = await axios.get('http://localhost:3001/add/major');
        console.log("Fetched majors:", response.data);
        setMajor(response.data);
      } catch (err) {
        setError("ไม่สามารถดึงข้อมูลสาขาได้");
        console.error("Error fetching majors:", err);
      }
    };
    fetchMajors();
  }, []);

  return(
    <div className="register-page">
        <div className="container">
        <h2>ลงทะเบียน</h2>
        <form onSubmit={handleSubmit}>

        <div className='mb-3'>
          <label className="form-label">เลือกประเภทผู้ใช้:</label>
          <select  name="role" value={formData.role} onChange={(e) => handleInputChange({ target: { name: 'role', value: e.target.value } })} className="form-control">
            <option value="">เลือกบทบาท</option>
            <option value="0">แอดมิน</option>
            <option value="1">นายกสมาคม</option>
            <option value="2">ศิษย์เก่า</option>
            <option value="3">ศิษย์ปัจจุบัน</option>
          </select>
        </div>

          <div className="mb-3">
            <label className="form-label">ชื่อผู้ใช้</label>
            <input type="text" className="form-control" id="username" name="username" 
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </div>


          <div className="mb-3">
            <label className="form-label">รหัสผ่าน</label>
            <input type="password" className="form-control" id="password" name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>


          {/* ศิษย์เก่า */}
          {formData.role === "2" && ( 
          <>
            <div className="form-group">
              <label htmlFor="title">คำนำหน้า<span className="importent">*</span></label>
              <select name="title" value={formData.title} onChange={handleInputChange}>
                <option value="">คำนำหน้า</option>
                <option value="นาย">นาย</option>
                <option value="นาง">นาง</option>
                <option value="นางสาว">นางสาว</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">ชื่อ-นามสกุล</label>
              <input type="text" className="form-control" id="full_name" name="full_name" 
                value={formData.full_name}
                onChange={handleInputChange}
                required
              />
            </div>


            <div className="mb-3">
              <label className="form-label">ชื่อเล่น</label>
              <input type="text" className="form-control" id="nick_name" name="nick_name" 
                value={formData.nick_name}
                onChange={handleInputChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">อีเมล</label>
              <input type="email" className="form-control" id="email" name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className='mb-3'>
                <label className="form-label">สาขาที่เรียน:</label>
                <select
                  name="major"
                  value={formData.major}
                  onChange={(e) => handleInputChange({ target: { name: 'major', value: e.target.value } })}
                  className="form-control"
                >
                  <option value="">เลือกสาขา</option>
                  {major.map((majorItem) => (
                    <option key={majorItem.major_id} value={majorItem.major_id}>
                      {majorItem.major_name}
                    </option>
                  ))}
                </select>
            </div>

            <div className="mb-3">
              <label className="form-label">ที่อยู่</label>
              <input type="text" className="form-control" id="address" name="address" 
                value={formData.address}
                onChange={handleInputChange}
                
              />
            </div>

            <div className="mb-3">
              <label className="form-label">วันเกิด</label>
              <input type="date" className="form-control" id="birthday" name="birthday" 
                value={formData.birthday}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">เบอร์โทร</label>
              <input type="number" className="form-control" id="phone" name="phone" 
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">โซเชียล</label>
              <input type="text" className="form-control" id="line" name="line" 
                value={formData.line}
                onChange={handleInputChange}
              
              />
            </div>

            {/* <div className="mb-3">
              <label className="form-label">เกี่ยวกับตัวเอง</label>
              <input type="text" className="form-control" id="" name="line" 
                value={formData.line}
                onChange={handleInputChange}
              
              />
            </div> */}
          </>
        )}
          <button type="submit" className="btn btn-primary">ลงทะเบียน</button>
        </form>

        <ToastContainer />
      </div>
    </div>
   
  );

}
  
export default RegisterForm;

{/* <div className="education-row">
                                        <div className="education-item">
                                            <label>
                                                <input type="checkbox" name="degree" value="master" onChange={handleInputChange}/>
                                                ป.โท
                                            </label>
                                        </div>
                                        <input type="text" className="form-control" id="studentId2" name="studentId2" placeholder='รหัสนักศึกษา'
                                            value={formData.studentId2}
                                            onChange={handleInputChange}
                                           
                                        />

                                        <input type="text" className="form-control" id="graduation_year2" name="graduation_year2" placeholder='ปีการศึกษาที่จบ'
                                            value={formData.graduation_year2}
                                            onChange={handleInputChange}
                                           
                                        />
                                        <select>
                                            <option value="">เลือกหลักสูตร</option>
                                            <option value="course1">วิทยาศาสตรบัณฑิต</option>
                                        </select>
                                        <select
                                            name="major1"
                                            value={formData.major1}
                                            onChange={(e) => handleInputChange({ target: { name: 'major1', value: e.target.value } })}
                                            
                                            >
                                            <option value="">เลือกสาขา</option>
                                            {major.map((majorItem) => (
                                                <option key={majorItem.major_id} value={majorItem.major_id}>
                                                {majorItem.major_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="education-row">
                                        <div className="education-item">
                                            <label>
                                                <input type="checkbox" name="degree" value="doctorate" />
                                                 ป.เอก
                                            </label>
                                        </div>
                                        <input type="text" className="form-control" id="studentId3" name="studentId3" placeholder='รหัสนักศึกษา'
                                            value={formData.studentId3}
                                            onChange={handleInputChange}
                                            
                                        />

                                        <input type="text" className="form-control" id="graduation_year3" name="graduation_year3" placeholder='ปีการศึกษาที่จบ'
                                            value={formData.graduation_year3}
                                            onChange={handleInputChange}
                                            
                                        />
                                        <select>
                                            <option value="">เลือกหลักสูตร</option>
                                            <option value="course1">วิทยาศาสตรบัณฑิต</option>
                                        </select>
                                        <select
                                            name="major2"
                                            value={formData.major2}
                                            onChange={(e) => handleInputChange({ target: { name: 'major2', value: e.target.value } })}
                                            
                                            >
                                            <option value="">เลือกสาขา</option>
                                            {major.map((majorItem) => (
                                                <option key={majorItem.major_id} value={majorItem.major_id}>
                                                {majorItem.major_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div> */}