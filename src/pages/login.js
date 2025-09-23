// // import React, { useState, useEffect } from "react";
// // import { Link } from 'react-router-dom';
// // import '../css/Login.css';
// // import axios from 'axios';
// // import { useNavigate, useLocation } from 'react-router-dom'; // เพิ่ม useLocation
// // // import { GoogleLogin } from '@react-oauth/google';
// // import { useOutletContext } from "react-router-dom";


// // function Login() {
// //   const [username, setUsername] = useState('');
// //   const [password, setPassword] = useState('');
// //   const [errorMessage, setErrorMessage] = useState('');
// //   const [passwordError, setPasswordError] = useState('');
// //   const navigate = useNavigate();
// //   const location = useLocation();
// //   // อ่าน redirect path จาก query string
// //   // const redirectPath = new URLSearchParams(location.search).get("redirect") || null;
// //   const { handleLogin } = useOutletContext();

// //   const validatePassword = (password) => {
// //     const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]+$/;
// //     return passwordRegex.test(password);
// //   };

// //   const handlePasswordChange = (e) => {
// //     const value = e.target.value;
// //     setPassword(value);

// //     if (!validatePassword(value)) {
// //       setPasswordError('รหัสผ่านต้องมีอักขระพิมพ์ใหญ่ พิมพ์เล็ก และตัวเลข และห้ามใช้อักขระพิเศษ');
// //     } else {
// //       setPasswordError('');
// //     }
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();

// //     try {
// //       const response = await axios.post('http://localhost:3001/api/login', {
// //         username: username,
// //         password: password,
// //       }, { withCredentials: true });

// //       if (response.data.success) {
// //         const { role, userId, username, image_path, firstLogin } = response.data;

// //         // ถ้าเข้าสู่ระบบครั้งแรก
// //         if (firstLogin) {
// //           sessionStorage.setItem('userId', userId);
// //           sessionStorage.setItem('username', username);
// //           sessionStorage.setItem('userRole', role);

// //           return navigate('/change-password'); // ไปหน้าตั้งรหัสผ่านใหม่
// //         }

// //         // เข้าระบบปกติ
// //         sessionStorage.setItem('userId', userId);
// //         sessionStorage.setItem('userRole', role);
// //         sessionStorage.setItem('username', username);
// //         sessionStorage.setItem('image_path', image_path);

// //         handleLogin(userId, role);

// //         if (role === 1) {
// //           navigate('/admin-home');
// //         } else if (role === 2) {
// //           navigate('/president-home');
// //         } else if (role === 3) {
// //           navigate('/alumni-home');
// //         } else if (role === 4) {
// //           navigate('/student-home');
// //         } else {
// //           setErrorMessage('Unknown role. Please contact support.');
// //         }
// //       }
// //     } catch (error) {
// //       if (error.response) {
// //         setErrorMessage(error.response.data.message || 'An error occurred');
// //       } else if (error.request) {
// //         setErrorMessage('No response from server. Please try again later.');
// //       } else {
// //         setErrorMessage('An unexpected error occurred.');
// //       }
// //     }
// //   };

// //   const logo = <img className="form-login-logo" src="./image/สมาคม-logo.png" alt="Logo" />;
// //   return (
// //     <div className="all-form">
// //       {logo}
// //       <div className="form-login-bg">
// //         <div className="form-login">
// //           <form onSubmit={handleSubmit}>
// //             <h2>เข้าสู่ระบบ</h2>
// //             <p>
// //               <label>ชื่อผู้ใช้งาน<span className="important">*</span></label><br />
// //               <input placeholder="ชื่อผู้ใช้งาน" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
// //             </p>
// //             <p>
// //               <label>รหัสผ่าน<span className="important">*</span></label><br />
// //               <input placeholder="รหัสผ่าน" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
// //               {passwordError && <span className="error-message">{passwordError}</span>}
// //             </p>
// //             <div className="fn-login">
// //               <Link to="/register"><p className="regist">สมัครสมาชิก</p></Link>
// //               <Link to="/forgotPassword"><p className="forget-pass">ลืมรหัสผ่าน?</p></Link>
// //             </div>

// //             <div className="button-group">
// //               <div>
// //                 <Link to="/">
// //                   <button className="regist-bt" type="button">ยกเลิก</button></Link>
// //               </div>
// //               <div>
// //                 <button className="login-bt" type="submit">เข้าสู่ระบบ</button>
// //               </div>
// //             </div>
// //           </form>
// //           {errorMessage && <p className="error-message">{errorMessage}</p>}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }


// // export default Login;

// import React, { useState } from "react";
// import { Link, useNavigate } from 'react-router-dom';
// import '../css/Login.css';
// import axios from 'axios';
// import { useOutletContext } from "react-router-dom";

// function Login() {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [errorMessage, setErrorMessage] = useState('');
//   const [passwordError, setPasswordError] = useState('');
//   const navigate = useNavigate();
//   const { handleLogin } = useOutletContext();

//   const validatePassword = (password) => {
//     const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]+$/;
//     return passwordRegex.test(password);
//   };

//   const handlePasswordChange = (e) => {
//     const value = e.target.value;
//     setPassword(value);

//     if (!validatePassword(value)) {
//       setPasswordError('รหัสผ่านต้องมีอักขระพิมพ์ใหญ่ พิมพ์เล็ก และตัวเลข และห้ามใช้อักขระพิเศษ');
//     } else {
//       setPasswordError('');
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!username || !password) {
//     setErrorMessage("กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน");
//     return;
//   }

//     try {
//       const response = await axios.post(
//         'http://localhost:3001/api/login',
//         { username, password },
//         { headers: { 'Content-Type': 'application/json' }, withCredentials: true }  //เพื่อให้ cookie ถูกส่งไปกับ request
//       );

//       if (response.data.success) {
//         const { role, firstLogin } = response.data;

//         // backend จะเก็บ userId, username, role ไว้ใน session ให้เอง
//         // React ไม่ต้องเก็บใน localStorage/sessionStorage

//         handleLogin(); // context ของคุณเอาไว้จัดการ state global

//         if (firstLogin) {
//           return navigate('/change-password');
//         }

//         if (role === 1) {
//           navigate('/admin-home');
//         } else if (role === 2) {
//           navigate('/president-home');
//         } else if (role === 3) {
//           navigate('/alumni-home');
//         } else if (role === 4) {
//           navigate('/student-home');
//         } else {
//           setErrorMessage('Unknown role. Please contact support.');
//         }
//       }
//     } catch (error) {
//       if (error.response) {
//         setErrorMessage(error.response.data.message || 'An error occurred');
//       } else if (error.request) {
//         setErrorMessage('No response from server. Please try again later.');
//       } else {
//         setErrorMessage('An unexpected error occurred.');
//       }
//     }
//   };

//   const logo = <img className="form-login-logo" src="./image/สมาคม-logo.png" alt="Logo" />;
//   return (
//     <div className="all-form">
//       {logo}
//       <div className="form-login-bg">
//         <div className="form-login">
//           <form onSubmit={handleSubmit}>
//             <h2>เข้าสู่ระบบ</h2>
//             <p>
//               <label>ชื่อผู้ใช้งาน<span className="important">*</span></label><br />
//               <input
//                 placeholder="ชื่อผู้ใช้งาน"
//                 type="text"
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//                 required
//               />
//             </p>
//             <p>
//               <label>รหัสผ่าน<span className="important">*</span></label><br />
//               <input
//                 placeholder="รหัสผ่าน"
//                 type="password"
//                 value={password}
//                 onChange={handlePasswordChange}
//                 required
//               />
//               {passwordError && <span className="error-message">{passwordError}</span>}
//             </p>
//             <div className="fn-login">
//               <Link to="/register"><p className="regist">สมัครสมาชิก</p></Link>
//               <Link to="/forgotPassword"><p className="forget-pass">ลืมรหัสผ่าน?</p></Link>
//             </div>

//             <div className="button-group">
//               <div>
//                 <Link to="/"><button className="regist-bt" type="button">ยกเลิก</button></Link>
//               </div>
//               <div>
//                 <button className="login-bt" type="submit">เข้าสู่ระบบ</button>
//               </div>
//             </div>
//           </form>
//           {errorMessage && <p className="error-message">{errorMessage}</p>}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Login;

import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import '../css/Login.css';
import axios from 'axios';
import { useAuth } from "../context/AuthContext";

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // ใช้ setUserFromLoginResponse แทน setUser
  const { setUserFromLoginResponse } = useAuth();

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]+$/;
    return passwordRegex.test(password);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    if (passwordError) setPasswordError('');
    if (errorMessage) setErrorMessage('');

    if (value && !validatePassword(value)) {
      setPasswordError('รหัสผ่านต้องมีอักขระพิมพ์ใหญ่ พิมพ์เล็ก และตัวเลข และห้ามใช้อักขระพิเศษ');
    }
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    // ตรวจสอบข้อมูลก่อนส่ง
    if (!username.trim() || !password.trim()) {
      setErrorMessage("กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน");
      setIsLoading(false);
      return;
    }

    // ตรวจสอบรูปแบบรหัสผ่าน
    // if (!validatePassword(password)) {
    //   setPasswordError('รหัสผ่านต้องมีอักขระพิมพ์ใหญ่ พิมพ์เล็ก และตัวเลข และห้ามใช้อักขระพิเศษ');
    //   setIsLoading(false);
    //   return;
    // }

    try {
      console.log('Sending login request...'); // Debug log
      
      const response = await axios.post(
        'http://localhost:3001/api/login',
        { 
          username: username.trim(), 
          password: password.trim() 
        },
        { 
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }, 
          withCredentials: true,
          timeout: 10000
        }
      );

      console.log('Login response:', response.data); // Debug log

      if (response.data.success) {
        const { role, firstLogin, userId, username: responseUsername, image_path, email, firstName, lastName } = response.data;

        // สร้าง userData ให้ตรงกับ format ที่ AuthContext คาดหวัง
        const userData = {
          userId: userId,
          id: userId, // เพิ่ม id field ด้วย
          role: role,
          username: responseUsername,
          email: email,
          firstName: firstName,
          lastName: lastName,
          image_path: image_path,
          isAdmin: role === 1,
          isUser: role !== 1,
        };

        console.log('Setting user data:', userData); // Debug log

        // ใช้ setUserFromLoginResponse แทน setUser
        setUserFromLoginResponse(userData);

        // รอให้ state update เสร็จก่อน navigate
        setTimeout(() => {
          if (firstLogin) {
            return navigate('/change-password');
          }

          // นำทางไปหน้าหลักตาม role
          switch (role) {
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
        }, 100); // รอ 100ms เพื่อให้ state update

      } else {
        setErrorMessage(response.data.message || 'เข้าสู่ระบบไม่สำเร็จ');
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
        setErrorMessage('เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      setIsLoading(false);
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
              <input
                placeholder="ชื่อผู้ใช้งาน"
                type="text"
                value={username}
                onChange={handleUsernameChange}
                disabled={isLoading}
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
                disabled={isLoading}
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
                  <button className="regist-bt" type="button" disabled={isLoading}>
                    ยกเลิก
                  </button>
                </Link>
              </div>
              <div>
                <button className="login-bt" type="submit" disabled={isLoading}>
                  {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
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