import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
// import {HOSTNAME} from '../config.js';
import '../css/Login.css';
// import axios from 'axios';
import { useAuth } from "../context/AuthContext";
function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  // ใช้ handleLogin จาก AuthContext แทน
  const { handleLogin, isLoading } = useAuth();

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]+$/;
    return passwordRegex.test(password);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    if (passwordError) setPasswordError('');
    if (errorMessage) setErrorMessage('');

    // if (value && !validatePassword(value)) {
    //   setPasswordError('รหัสผ่านต้องมีอักขระพิมพ์ใหญ่ พิมพ์เล็ก และตัวเลข และห้ามใช้อักขระพิเศษ');
    // }
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    // ตรวจสอบข้อมูลก่อนส่ง
    if (!username.trim() || !password.trim()) {
      setErrorMessage("กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน");
      setIsSubmitting(false);
      return;
    }

    try {
      
      // ใช้ handleLogin จาก AuthContext
      const response = await handleLogin(username.trim(), password.trim());

      console.log('Login successful:', response);

      if (response.success) {
        const { role, firstLogin } = response;

        // รอให้ state update เสร็จก่อน navigate
        setTimeout(() => {
          if (firstLogin) {
            return navigate('/change-password');
          }

          // นำทางไปหน้าหลักตาม role
          switch (Number(role)) {
            case 1:
              navigate('/admin-home');
              break;
            case 2:
              navigate('/president-home');
              break;
            case 3:
              navigate('/alumni-home');
              break;
            case 4:
              navigate('/student-home');
              break;
            default:
              setErrorMessage('Unknown role. Please contact support.');
          }
        }, 100);

      } else {
        setErrorMessage(response.message || 'เข้าสู่ระบบไม่สำเร็จ');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message;
        
        switch (status) {
          case 400:
            setErrorMessage(message || 'ข้อมูลที่ส่งไม่ถูกต้อง กรุณาตรวจสอบชื่อผู้ใช้และรหัสผ่าน');
            break;
          case 401:
            setErrorMessage('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
            break;
          case 403:
            setErrorMessage('บัญชีของคุณถูกระงับ กรุณาติดต่อผู้ดูแลระบบ');
            break;
          case 500:
            setErrorMessage('เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง');
            break;
          default:
            setErrorMessage(message || `เกิดข้อผิดพลาด (${status})`);
        }
      } else if (error.request) {
        setErrorMessage('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ท');
      } else if (error.code === 'ECONNABORTED') {
        setErrorMessage('การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง');
      } else {
        setErrorMessage(error.message || 'เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const logo = <img className="form-login-logo" src="./image/สมาคม-logo.png" alt="Logo" />;
  
  const isDisabled = isLoading || isSubmitting;
  
  return (
    <div className="all-form">
      {logo}
      <div className="form-login-bg">
        <div className="form-login">
          <form onSubmit={handleSubmit}>
            <h2>เข้าสู่ระบบ</h2>
            <p>
              <label>ชื่อผู้ใช้งาน<span className="important">*</span></label><br />
              <input
                placeholder="ชื่อผู้ใช้งาน"
                type="text"
                value={username}
                onChange={handleUsernameChange}
                disabled={isDisabled}
                required
              />
            </p>
            <p>
              <label>รหัสผ่าน<span className="important">*</span></label><br />
              <input
                placeholder="รหัสผ่าน"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                disabled={isDisabled}
                required
              />
              {passwordError && <span className="error-message">{passwordError}</span>}
            </p>
            <div className="fn-login">
              <Link to="/register"><p className="regist">สมัครสมาชิก</p></Link>
              <Link to="/forgotPassword"><p className="forget-pass">ลืมรหัสผ่าน?</p></Link>
            </div>

            <div className="button-group">
              <div>
                <Link to="/">
                  <button className="regist-bt" type="button" disabled={isDisabled}>
                    ยกเลิก
                  </button>
                </Link>
              </div>
              <div>
                <button className="login-bt" type="submit" disabled={isDisabled}>
                  {isDisabled ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                </button>
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