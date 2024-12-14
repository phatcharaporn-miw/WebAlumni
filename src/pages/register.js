import React from "react";
import { Link } from 'react-router-dom';
import "../css/Register.css";

function Register() {
    return (
        <div className="register-page">
            <img className="register-logo" src="./image/สมาคม-logo.png" alt="Logo" />
            <div className="content-register">
                <div className="upImage">
                    <div className="image-profile">
                        <img className="profile" src="./image/profile-picture.png" alt="Profile" />
                        <br />
                        <label htmlFor="file-upload" className="upFile">อัพโหลดรูปภาพ</label>
                        <input type="file" id="file-upload" className="upFile-input" />
                    </div>
                </div>


                <div className="form-regis-bg">
                    <div className="form-regis">
                        <form>
                            <h2>สมัครสมาชิก</h2>
                            <fieldset>
                                <legend className="legend-title">ข้อมูลส่วนตัว</legend>
                                <div className="form-group">
                                    <label htmlFor="prefix">คำนำหน้า<span className="importent">*</span></label>
                                    <select name="prefix">
                                        <option value="">คำนำหน้า</option>
                                        <option value="นาย">นาย</option>
                                        <option value="นาง">นาง</option>
                                        <option value="นางสาว">นางสาว</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="thaiName">ชื่อ-สกุล <br />(ภาษาไทย)<span className="importent">*</span></label>
                                    <input type="text" id="thaiName" placeholder="ชื่อ-สกุล" required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="engName">ชื่อ-สกุล <br /> (English)<span className="importent">*</span></label>
                                    <input type="text" id="engName" placeholder="Name-Surname" required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="birthdate">วัน/เดือน/ปีเกิด<span className="importent">*</span></label>
                                    <input type="date" id="birthdate" />
                                </div>
                            </fieldset>

                            <fieldset>
                                <legend className="legend-title">ระดับการศึกษาที่จบจาก CP</legend>
                                <div className="education-grid">
                                    <div className="header-education">ระดับการศึกษา</div>
                                    <div className="header-education">รหัสนักศึกษา</div>
                                    <div className="header-education">ปีการศึกษาที่จบ</div>
                                    <div className="header-education">หลักสูตร</div>
                                    <div className="header-education">สาขา</div>

                                    <div className="row">
                                        <div className="education-item">
                                            <label>
                                                <input type="checkbox" name="degree" value="doctor" /> ป.ตรี
                                            </label>
                                        </div>
                                        <input type="text" placeholder="รหัสนักศึกษา" />
                                        <input type="text" placeholder="ปีการศึกษาที่จบ" />
                                        <select>
                                            <option value="">เลือกหลักสูตร</option>
                                            <option value="course1">วิทยาศาสตรบัณฑิต</option>
                                        </select>
                                        <select>
                                            <option value="">เลือกสาขา</option>
                                            <option value="branch1">IT</option>
                                            <option value="branch2">CS</option>
                                            <option value="branch3">GIS</option>
                                            <option value="branch4">AI</option>
                                            <option value="branch2">CY</option>
                                        </select>
                                    </div>

                                    <div className="row">
                                        <div className="education-item">
                                            <label>
                                                <input type="checkbox" name="degree" value="doctor" /> ป.โท
                                            </label>
                                        </div>
                                        <input type="text" placeholder="รหัสนักศึกษา" />
                                        <input type="text" placeholder="ปีการศึกษาที่จบ" />
                                        <select>
                                            <option value="">เลือกหลักสูตร</option>
                                            <option value="course1">วิทยาศาสตรบัณฑิต</option>
                                        </select>
                                        <select>
                                            <option value="">เลือกสาขา</option>
                                            <option value="branch1">IT</option>
                                            <option value="branch2">CS</option>
                                            <option value="branch3">GIS</option>
                                            <option value="branch4">AI</option>
                                            <option value="branch2">CY</option>
                                        </select>
                                    </div>

                                    <div className="row">
                                        <div className="education-item">
                                            <label>
                                                <input type="checkbox" name="degree" value="doctor" /> ป.เอก
                                            </label>
                                        </div>
                                        <input type="text" placeholder="รหัสนักศึกษา" />
                                        <input type="text" placeholder="ปีการศึกษาที่จบ" />
                                        <select>
                                            <option value="">เลือกหลักสูตร</option>
                                            <option value="course1">วิทยาศาสตรบัณฑิต</option>
                                        </select>
                                        <select>
                                            <option value="">เลือกสาขา</option>
                                            <option value="branch1">IT</option>
                                            <option value="branch2">CS</option>
                                            <option value="branch3">GIS</option>
                                            <option value="branch4">AI</option>
                                            <option value="branch2">CY</option>
                                        </select>
                                    </div>
                                </div>
                            </fieldset>

                            <fieldset>
                                <legend className="legend-title">สร้างบัญชีผู้ใช้</legend>
                                <div className="group">
                                    <div className="form-group">
                                        <label>ชื่อผู้ใช้งาน<span className="importent">*</span></label><br />
                                        <input placeholder="ชื่อผู้ใช้งาน" type="text" required />
                                    </div>
                                    <div className="form-group">
                                        <label>สร้างรหัสผ่าน<span className="importent">*</span></label><br />
                                        <input placeholder="ตั้งรหัสผ่าน" type="password" required />
                                    </div>
                                    <div className="form-group">
                                        <label>อีเมล<span className="importent">*</span></label><br />
                                        <input placeholder="exam@mail.com" type="email" />
                                    </div>
                                    <div className="form-group">
                                        <label>ยืนยันรหัสผ่าน<span className="importent">*</span></label><br />
                                        <input placeholder="ยืนยันรหัสผ่าน" type="password" required />
                                    </div>
                                </div>
                            </fieldset>

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