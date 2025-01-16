import React, { useState } from "react";
import "../css/Donate-request.css";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';

function DonateRequest() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        projectName: "",
        description: "",
        targetAmount: "",
        currentAmount: "",
        startDate: "",
        endDate: "",
        donationType: "",
        image: null,
        bankName: "",
        accountNumber: "",
        numberPromtpay: ""
    });

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleFileChange = (e) => {
        const { files } = e.target;
        if (files && files[0]) {
            setFormData(prevData => ({ ...prevData, image: files[0] }));
        } else {
            alert("กรุณาเลือกไฟล์รูปภาพ");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
    
        data.append("projectName", formData.projectName);
        data.append("description", formData.description);
        data.append("targetAmount", formData.targetAmount || null);
        data.append("currentAmount", formData.currentAmount || null);
        data.append("startDate", formData.startDate);
        data.append("endDate", formData.endDate);
        data.append("donationType", formData.donationType);
        data.append("bankName", formData.bankName);
        data.append("accountNumber", formData.accountNumber);
        data.append("numberPromtpay", formData.numberPromtpay);
    
        if (formData.image) {
            data.append("image", formData.image);
        } else {
            alert("กรุณาเลือกไฟล์รูปภาพ");
            return;
        }
    
        try {
            const response = await axios.post('http://localhost:5000/donate/donateRequest', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            // console.log('Success:', response.data);
            alert("เพิ่มโครงการบริจาคสำเร็จ!");
            navigate("/donate");
        } catch (error) {
            // console.error('Error:', error.response?.data || error);
            alert(error.response?.data?.error || "เกิดข้อผิดพลาด");
        }
    };
    

    return (
        <div>
            <h3>เพิ่มโครงการบริจาค</h3>

            <div className="request-form">
                {successMessage && <div className="success-message">{successMessage}</div>}
                {errorMessage && <div className="error-message">{errorMessage}</div>}

                <form onSubmit={handleSubmit} encType="multipart/form-data">
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

                        <p>
                            <label>ประเภทการบริจาค<span className="important">*</span></label><br />
                            <input
                                type="radio"
                                name="donationType"
                                value="fundraising"
                                onChange={handleChange}
                                checked={formData.donationType === "fundraising"}
                                required
                            /> บริจาคแบบระดมทุน
                            <br />
                            <input
                                type="radio"
                                name="donationType"
                                value="unlimited"
                                onChange={handleChange}
                                checked={formData.donationType === "unlimited"}
                            /> บริจาคแบบไม่จำกัดจำนวน
                        </p>

                        {formData.donationType === "fundraising" && (
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
                        )}

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

                        <p>
                            <label htmlFor="image">รูปภาพประกอบโครงการ<span className="important">*</span></label><br />
                            <input
                                id="image"
                                name="image"
                                type="file"
                                onChange={handleFileChange}
                                required
                            />
                        </p>

                        <p>
                            <label htmlFor="bankName">ข้อมูลบัญชีธนาคาร<span className="important">*</span></label><br />
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

                        <p>
                            <label htmlFor="numberPromtpay">กรอกหมายเลขพร้อมเพย์<span className="important">*</span></label><br />
                            <input
                                name="numberPromtpay"
                                type="number"
                                placeholder="เลขพร้อมเพย์"
                                value={formData.numberPromtpay}
                                onChange={handleChange}
                                required
                            />
                        </p>

                        <div className="group-donate-bt">
                            <Link to="/donate">
                                <button className="cancle-button-request" type="button">ยกเลิก</button>
                            </Link>
                            <button type="submit" className="submit-button-request" disabled={isSubmitting}>
                                {isSubmitting ? "กำลังเพิ่ม..." : "เพิ่มโครงการ"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default DonateRequest;
