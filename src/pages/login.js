import React from "react";
import { Link } from 'react-router-dom';
import './Login.css';

function Login() {
    const logo = <img className="form-login-logo" src="./images/สมาคม-logo.png" alt="Logo" />;
    return (
        <div className="all-form">
            {logo}
            <div className="form-login-bg">
                <div className="form-login">
                    <form>
                        <h2>เข้าสู่ระบบ</h2>
                        <p>
                            <label >ชื่อผู้ใช้งาน:</label><br />
                            <input placeholder="ชื่อผู้ใช้งาน" type="text" />
                        </p>
                        <p>
                            <label>รหัสผ่าน:</label><br />
                            <input placeholder="รหัสผ่าน" type="password" />
                        </p>
                        <div>
            
                            <Link to="/"><p className="forget-pass">ลืมรหัสผ่าน?</p></Link>
                        </div>
                        <p className="login-submit">
                          
                            <Link to="/"><button type="button">เข้าสู่ระบบ</button></Link>
                        </p>

                        <p>
                           
                            <Link to="/register">
                                <button type="button">สมัครสมาชิก</button>
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
