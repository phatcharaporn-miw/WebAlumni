import React, { useState } from "react";
import "../css/Donate-request.css";
import { Link } from "react-router-dom";

function DonateRequest() {
    const [formData, setFormData] = useState({
        projectName: "",
        description: "",
        targetAmount: "",
        startDate: "",
        endDate: "",
        donationType: "",
        bankName: "",
        accountNumber: "",
        image: null, // รูปภาพหลักประกอบโครงการ
        activityImage: null, // รูปกิจกรรมใหม่
        paymentMethod: [],
        qrcodeImage: null, // QR Code สำหรับพร้อมเพย์
    });

    const [showQRUpload, setShowQRUpload] = useState(false); // แสดงช่องอัปโหลด QR Code

    const handleChange = (e) => {
        const { name, value, type, files, checked } = e.target;

        if (type === "file") {
            setFormData({ ...formData, [name]: files[0] });
        } else if (type === "checkbox") {
            if (value === "พร้อมเพย์") {
                setShowQRUpload(checked); // ควบคุมการแสดงช่อง QR Code
            }
            setFormData((prev) => ({
                ...prev,
                paymentMethod: checked
                    ? [...prev.paymentMethod, value]
                    : prev.paymentMethod.filter((item) => item !== value),
            }));
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form Submitted: ", formData);
    };

    return (
        <div>
            <h3>เพิ่มโครงการบริจาค</h3>

            <div className="request-form">
                <form onSubmit={handleSubmit}>
                    {/* ชื่อโครงการ */}
                    <div className="data-requestDonate">
                        <p>
                            <label htmlFor="projectName">ชื่อโครงการ/หัวข้อการขอรับบริจาค<span className="important">*</span></label><br />
                            <input
                                id="projectName"
                                name="projectName"
                                placeholder="ชื่อโครงการ/หัวข้อการขอรับบริจาค"
                                type="text"
                                value={formData.projectName}
                                onChange={handleChange}
                                required
                            />
                        </p>

                        {/* รายละเอียด */}
                        <p>
                            <label htmlFor="description">รายละเอียดของโครงการบริจาค<span className="important">*</span></label><br />
                            <textarea
                                id="description"
                                name="description"
                                placeholder="รายละเอียดของโครงการบริจาค"
                                value={formData.description}
                                onChange={handleChange}
                                required
                            />
                        </p>

                        {/* เป้าหมาย */}
                        <p>
                            <label htmlFor="targetAmount">เป้าหมายยอดบริจาค<span className="important">*</span></label><br />
                            <input
                                id="targetAmount"
                                name="targetAmount"
                                placeholder="เป้าหมายยอดบริจาค"
                                type="number"
                                value={formData.targetAmount}
                                onChange={handleChange}
                                required
                            />
                        </p>

                        {/* ระยะเวลา */}
                        <p className="time">
                            <label>ระยะเวลาการรับบริจาค<span className="important">*</span></label>
                            <div className="time-container">
                                <span className="title-time">เริ่มต้น:</span>
                                <input
                                    name="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    required
                                />
                                <span className="title-time">สิ้นสุด:</span>
                                <input
                                    name="endDate"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </p>

                        {/* ประเภทการบริจาค */}
                        <p>
                            <label>ประเภทการบริจาค<span className="important">*</span></label>
                            <br />
                            
                                <input
                                    type="radio"
                                    name="donationType"
                                    value="ระดมทุน"
                                    onChange={handleChange}
                                    checked={formData.donationType === "ระดมทุน"}
                                    required
                                /> บริจาคแบบระดมทุน
                            
                            <br />
                            
                                <input
                                    type="radio"
                                    name="donationType"
                                    value="ไม่จำกัดจำนวน"
                                    onChange={handleChange}
                                    checked={formData.donationType === "ไม่จำกัดจำนวน"}
                                /> บริจาคแบบไม่จำกัดจำนวน
                            
                        </p>

                        {/* รูปภาพประกอบโครงการ */}
                        <p>
                            <label htmlFor="image">รูปภาพประกอบโครงการ<span className="important">*</span></label><br />
                            <input
                                id="image"
                                name="image"
                                type="file"
                                onChange={handleChange}
                                required
                            />
                        </p>

                        {/* ข้อมูลบัญชี */}
                        <p>
                            <label htmlFor="bankName">ข้อมูลบัญชีธนาคาร<span className="important">*</span></label>
                            <br />
                            ชื่อธนาคาร:<br />
                            <input
                                id="bankName"
                                name="bankName"
                                type="text"
                                placeholder="ชื่อธนาคาร"
                                value={formData.bankName}
                                onChange={handleChange}
                                required
                            />
                            <br />
                            เลขบัญชี:<br />
                            <input
                                name="accountNumber"
                                type="number"
                                placeholder="เลขที่ธนาคาร"
                                value={formData.accountNumber}
                                onChange={handleChange}
                                required
                            />
                        </p>
                        {/* วิธีการบริจาค */}
                        <p>
                            <label>วิธีการบริจาค</label>
                            <br />
                           
                                <input
                                    type="checkbox"
                                    value="พร้อมเพย์"
                                    onChange={handleChange}
                                    checked={formData.paymentMethod.includes("พร้อมเพย์")}
                                /> พร้อมเพย์
                            
                        </p>
                         {/* ช่องอัปโหลด QR Code */}
                         {showQRUpload && (
                            <p>
                                <label htmlFor="qrcodeImage">อัปโหลด QR Code พร้อมเพย์<span className="important">*</span></label><br />
                                <input
                                    id="qrcodeImage"
                                    type="file"
                                    name="qrcodeImage"
                                    onChange={handleChange}
                                    required
                                />
                            </p>
                        )}

                        {/* ปุ่มยืนยัน */}
                        <div className="group-donate-bt">
                            <Link to="/donate">
                            <button  className="cancle-button-request" type="button">ยกเลิก</button>
                            </Link>
                            <Link to="/donate">
                            <button type="submit" className="submit-button-request">เพิ่มโครงการ</button>
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default DonateRequest;
