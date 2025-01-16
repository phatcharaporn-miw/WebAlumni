import React from "react";
import { Link } from 'react-router-dom';
import '../css/Login.css';


function Login() {
    const logo = <img className="form-login-logo" src="./image/สมาคม-logo.png" alt="Logo" />;
    return (
        <div className="all-form">
            {logo}
            <div className="form-login-bg">
                <div className="form-login">
                    <form>
                        <h2>เข้าสู่ระบบ</h2>
                        <p>
                            <label>ชื่อผู้ใช้งาน<span className="important">*</span></label><br />
                            <input placeholder="ชื่อผู้ใช้งาน" type="text" />
                        </p>
                        <p>
                            <label>รหัสผ่าน<span className="important">*</span></label><br />
                            <input placeholder="รหัสผ่าน" type="password" />
                        </p>
                        <div className="fn-login">
                            <Link to="/register"><p className="regist">สมัครสมาชิก</p></Link>
                            <Link to="/"><p className="forget-pass">ลืมรหัสผ่าน?</p></Link>
                        </div>

                        <div className="button-group">
                            <div>
                                <Link to="/">
                                    <button className="regist-bt" type="button">ยกเลิก</button></Link>
                            </div>
                            <div>
                                <Link to="/"><button className="login-bt" type="button">เข้าสู่ระบบ</button></Link>
                            </div>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;