import React, { useState } from "react";
import { Button, Modal, Box, Typography } from '@mui/material';
import "../css/Donate-request.css";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import Swal from "sweetalert2";

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
        accountName: "",
        accountNumber: "",
        numberPromtpay: "",
        forThings: "",
        typeThings: "",
        quantityThings: ""
    });

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    //สำหรับจัดการการเปลี่ยนแปลงวันที่
    const handleChangeDate = (e) => {
        const { name, value } = e.target;
        const today = new Date().toISOString().split('T')[0];

        // ตรวจสอบว่าไม่สามารถเลือกวันที่ย้อนหลังได้
        if (name === 'startDate' || name === 'endDate') {
            if (value < today) {
                Swal.fire({
                    icon: 'warning',
                    title: "ไม่สามารถเลือกวันที่ย้อนหลังได้",
                    confirmButtonText: "ตกลง",
                });
                return;
            }

            // สำหรับ endDate ต้องไม่เก่ากว่า startDate
            if (name === 'endDate' && formData.startDate && value < formData.startDate) {
                Swal.fire({
                    icon: 'warning',
                    title: 'วันที่สิ้นสุดต้องไม่เก่ากว่าวันที่เริ่มต้น',
                    confirmButtonText: "ตกลง",
                });
                return;
            }
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }

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

        const userId = localStorage.getItem('userId');

        if (!userId) {
            alert("กรุณาเข้าสู่ระบบก่อน");
            return;
        }
        data.append("userId", userId);

        data.append("projectName", formData.projectName);
        data.append("description", formData.description);
        data.append("targetAmount", formData.targetAmount || null);
        data.append("currentAmount", formData.currentAmount || null);
        data.append("startDate", formData.startDate);
        data.append("endDate", formData.endDate);
        data.append("donationType", formData.donationType);
        data.append("bankName", formData.bankName);
        data.append("accountName", formData.accountName);
        data.append("accountNumber", formData.accountNumber);
        data.append("numberPromtpay", formData.numberPromtpay);
        data.append("forThings", formData.forThings);
        data.append("typeThings", formData.typeThings);
        data.append("quantityThings", formData.quantityThings);

        if (formData.image) {
            data.append("image", formData.image);
        } else {
            alert("กรุณาเลือกไฟล์รูปภาพ");
            return;
        }

        // Debug: ดูข้อมูลที่ส่งไป
        console.log("Data being sent:");
        for (let [key, value] of data.entries()) {
            console.log(key, value);
        }

        try {
            const response = await axios.post('http://localhost:3001/donate/donateRequest', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            }, {
                withCredentials: true
            });
            Swal.fire({
                title: "ส่งคำขอโครงการบริจาคสำเร็จ!",
                text: "โปรดรอการอนุมัติจากผู้ดูแลระบบ",
                icon: "success",
                confirmButtonText: "ตกลง"
            }).then(() => {
                setSuccessMessage("ส่งคำขอโครงการบริจาคสำเร็จ! โปรดรอการอนุมัติจากผู้ดูแลระบบ");
                setErrorMessage("");
                setIsSubmitting(false);

                const role = localStorage.getItem("userRole");

                if (role === "3") {
                    navigate("/alumni-profile/alumni-request");
                } else if (role === "4") {
                    navigate("/student-profile/student-request");
                } else if (role === "2") {
                    navigate("/president-profile/president-request");
                } else {
                    navigate("/");
                }
            });
        }
        catch (error) {
            console.error("Error:", error);
            alert(error.response?.data?.error || "เกิดข้อผิดพลาด");
        }
    };

    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
    };

    return (
        <div>
            <h3>เพิ่มโครงการบริจาค</h3>
            <div className="request-form">
                {successMessage && <div className="success-message">{successMessage}</div>}
                {errorMessage && <div className="error-message">{errorMessage}</div>}

                <form encType="multipart/form-data">
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
                            <br />
                            <input
                                type="radio"
                                name="donationType"
                                value="things"
                                onChange={handleChange}
                                checked={formData.donationType === "things"}
                            /> บริจาคสิ่งของ
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

                        {formData.donationType === "things" && (
                            <p>
                                <label htmlFor="typeThings">ข้อมูลการบริจาคสิ่งของ<span className="important">*</span></label><br />
                                ประเภทสิ่งของ:<br />
                                <input
                                    name="typeThings"
                                    type="radio"
                                    placeholder="ประเภทสิ่งของ"
                                    value="เครื่องคอมพิวเตอร์"
                                    onChange={handleChange}
                                    checked={formData.typeThings === "เครื่องคอมพิวเตอร์"}
                                    required
                                />เครื่องคอมพิวเตอร์
                                <br />
                                <input
                                    name="typeThings"
                                    type="radio"
                                    placeholder="ประเภทสิ่งของ"
                                    value="อุปกรณ์การเรียน"
                                    onChange={handleChange}
                                    checked={formData.typeThings === "อุปกรณ์การเรียน"}
                                    required
                                />อุปกรณ์การเรียน
                                <br />
                                จำนวน(ชิ้น)<br />
                                <input
                                    id="quantityThings"
                                    name="quantityThings"
                                    placeholder="ex.20"
                                    type="number"
                                    value={formData.quantityThings}
                                    onChange={handleChange}
                                    required
                                />
                                <br />
                                บริจาคให้กับ<br />
                                <input
                                    id="forThings"
                                    name="forThings"
                                    placeholder="ex.นักศึกษาวิทยาลัยการคอมพิวเตอร์"
                                    type="text"
                                    value={formData.forThings}
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
                                    onChange={handleChangeDate}
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    onKeyDown={(e) => e.preventDefault()}
                                />
                                <span className="title-time">สิ้นสุด:</span>
                                <input
                                    name="endDate"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={handleChangeDate}
                                    required
                                    min={formData.startDate ? formData.startDate : new Date().toISOString().split('T')[0]}
                                    onKeyDown={(e) => e.preventDefault()}
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
                            ธนาคาร:<br />
                            <input
                                id="bankName"
                                name="bankName"
                                type="text"
                                placeholder="ธนาคารกรุงไทย"
                                value={formData.bankName}
                                onChange={handleChange}
                                required
                            />
                            <br />
                            ชื่อบัญชีธนาคาร:<br />
                            <input
                                id="accountName"
                                name="accountName"
                                type="text"
                                placeholder="ex.หน่วยรับบริจาคเพื่อการศึกษา"
                                value={formData.accountName}
                                onChange={handleChange}
                                required
                            />
                            <br />
                            เลขบัญชี:<br />
                            <input
                                name="accountNumber"
                                type="number"
                                placeholder="ex.123-456-7890"
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
                                placeholder="0999999999"
                                value={formData.numberPromtpay}
                                onChange={handleChange}
                                required
                            />
                        </p>

                        <div className="group-donate-bt">
                            <Link to="/donate">
                                <button className="cancle-button-request" type="button">ยกเลิก</button>
                            </Link>
                            <button
                                className="submit-button-request"
                                type="button"
                                onClick={handleOpen}
                            >
                                เพิ่มโครงการ
                            </button>

                        </div>
                    </div>
                </form>
            </div>
            {/* Modal แสดงข้อมูลที่กรอก */}
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-title" variant="h6">ตรวจสอบข้อมูลโครงการ</Typography>
                    <Typography id="modal-description" sx={{ mt: 2 }}>
                        <strong>ชื่อโครงการ:</strong> {formData.projectName} <br />
                        <strong>รายละเอียด:</strong> {formData.description} <br />
                        <strong>ประเภทการบริจาค:</strong> {formData.donationType} <br />
                        <strong>วันที่เริ่มต้น:</strong> {formData.startDate} <br />
                        <strong>วันที่สิ้นสุด:</strong> {formData.endDate} <br />
                        {formData.image && (
                            <div>
                                <strong>รูปภาพประกอบโครงการ:</strong>
                                <br />
                                <img
                                    src={URL.createObjectURL(formData.image)}
                                    alt="กิจกรรม"
                                    style={{ maxWidth: "100%", height: "auto", marginTop: "10px" }}
                                    onError={(e) => {
                                        e.target.src = `${process.env.PUBLIC_URL}/image/default.png`;
                                    }}
                                />
                            </div>
                        )}
                    </Typography>

                    <div style={{ marginTop: '20px', textAlign: 'right' }}>
                        <Button onClick={handleClose} color="secondary">แก้ไข</Button>
                        <Button
                            onClick={handleSubmit}
                            color="primary"
                            disabled={isSubmitting}
                            variant="contained"
                        >
                            {isSubmitting ? "กำลังเพิ่ม..." : "ยืนยันเพิ่มโครงการ"}
                        </Button>
                    </div>
                </Box>
            </Modal>
        </div>
    );
}

export default DonateRequest;