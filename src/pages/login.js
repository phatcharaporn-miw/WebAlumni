import React, {useState, useEffect} from "react";
import { Link } from 'react-router-dom';
import '../css/Login.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// import { GoogleLogin } from '@react-oauth/google';
import { useOutletContext } from "react-router-dom";


function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const { handleLogin } = useOutletContext();  // รับ handleLogin จาก Outlet context


    const handleSubmit = async (e) => {
      e.preventDefault();

      try {
        // ส่งคำขอไปยัง backend เพื่อตรวจสอบข้อมูล
        const response = await axios.post('http://localhost:3001/login/login', {
          username:username,
          password:password,
        }, {withCredentials: true });
  
        if (response.data.success) {
           const {role, userId} = response.data;

           // เก็บข้อมูลใน localStorage
          localStorage.setItem('userRole', role);
          localStorage.setItem('userId', userId);
         
         //เรียกใช้ handleLogin เพื่ออัปเดตข้อมูลใน AppLayout
         handleLogin(userId, role);

          console.log('Login success, userId:',  userId, 'userRole:', role);

          // ตรวจสอบ role
          if (role === 1) {
            navigate('/admin-home');
        } else if (role === 2) {
            navigate('/president-home');
        } else if (role === 3) {
            navigate('/alumni-home');
        } else if (role === 4) {
            navigate('/student-home');
        } else {
            setErrorMessage('Unknown role. Please contact support.');
        }
    } else {
        setErrorMessage('Invalid username or password');
    }
      } catch (error) {
        if (error.response) {
          setErrorMessage(error.response.data.message || 'An error occurred');
        } else if (error.request) {
          setErrorMessage('No response from server. Please try again later.');
        } else {        
          setErrorMessage('An unexpected error occurred.');
        }
      }
    };

    const logo = <img className="form-login-logo" src="./image/สมาคม-logo.png" alt="Logo" />;
    return (
        <div className="all-form">
            {logo}
            <div className="form-login-bg">
                <div className="form-login">
                    <form onSubmit={handleSubmit}>
                        <h2>เข้าสู่ระบบ</h2>
                        <p>
                            <label>ชื่อผู้ใช้งาน<span className="important">*</span></label><br />
                            <input placeholder="ชื่อผู้ใช้งาน" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required/>
                        </p>
                        <p>
                            <label>รหัสผ่าน<span className="important">*</span></label><br />
                            <input placeholder="รหัสผ่าน" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required/>
                        </p>
                        <div className="fn-login">
                            <Link to="/register"><p className="regist">สมัครสมาชิก</p></Link>
                            <Link to="/forgotPassword"><p className="forget-pass">ลืมรหัสผ่าน?</p></Link>
                        </div>

                        <div className="button-group">
                            <div>
                                <Link to="/">
                                    <button className="regist-bt" type="button">ยกเลิก</button></Link>
                            </div>
                            <div>
                                <button className="login-bt" type="submit">เข้าสู่ระบบ</button>
                               
                            </div>
                        </div>

                    </form>
                     
                      {errorMessage && <p className="error-message">{errorMessage}</p>}
                </div>
            </div>
        </div>
    );
  }


export default Login;