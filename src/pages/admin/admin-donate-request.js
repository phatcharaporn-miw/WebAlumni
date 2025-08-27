import React, { useState } from "react";
import { Button, Modal, Box, Typography } from '@mui/material';
import "../../css/adminDonate.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';

function AdminDonateRequest() {
    const navigate = useNavigate();
    const location = useLocation();
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
        quantityThings: "",
        userRole: "",
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
        setIsSubmitting(true);

        try {
            const data = new FormData();

            // ตรวจสอบการเข้าสู่ระบบ
            const adminId = localStorage.getItem('userId'); // ใช้ userId แทน adminId
            const userRole = localStorage.getItem('userRole');

            if (!adminId) {
                alert("กรุณาเข้าสู่ระบบก่อน");
                setIsSubmitting(false);
                navigate("/login");
                return;
            }

            // ตรวจสอบว่าเป็น admin หรือไม่
            if (userRole !== "1") {
                alert("คุณไม่มีสิทธิ์ในการเพิ่มโครงการ");
                setIsSubmitting(false);
                return;
            }

            // เพิ่มข้อมูลลงใน FormData - ใช้ชื่อที่ตรงกับ backend
            data.append("userId", adminId); // แก้จาก adminId
            data.append("userRole", userRole);  // ชื่อเหมือนกับ destructuring ของ backend
            data.append("projectName", formData.projectName); // แก้จาก projectName
            data.append("description", formData.description);
            data.append("startDate", formData.startDate); // แก้จาก startDate
            data.append("endDate", formData.endDate); // แก้จาก endDate
            data.append("donationType", formData.donationType); // แก้จาก donationType
            data.append("bankName", formData.bankName); // แก้จาก bankName
            data.append("accountName", formData.accountName); // แก้จาก accountName
            data.append("accountNumber", formData.accountNumber); // แก้จาก accountNumber
            data.append("numberPromtpay", formData.numberPromtpay); // แก้จาก numberPromtpay
            data.append("status", "1"); // แอดมินสร้างโครงการจะได้รับการอนุมัติทันที

            // เพิ่มข้อมูลตามประเภท
            if (formData.donationType === "fundraising") {
                data.append("targetAmount", formData.targetAmount);
                data.append("currentAmount", 0);
            } else if (formData.donationType === "things") {
                data.append("forThings", formData.forThings); // แก้จาก forThings
                data.append("typeThing", formData.typeThings); // แก้จาก typeThings
                data.append("quantity_things", formData.quantityThings); // แก้จาก quantityThings
                data.append("targetAmount", 0);
                data.append("currentAmount", 0);
            } else {
                // unlimited
                data.append("targetAmount", 0);
                data.append("currentAmount", 0);
            }

            // เพิ่มไฟล์รูปภาพ
            if (formData.image) {
                data.append("image", formData.image);
            } else {
                alert("กรุณาเลือกไฟล์รูปภาพ");
                setIsSubmitting(false);
                return;
            }

            // ส่งข้อมูลไปยัง backend - แก้ไขตรงนี้
            const response = await axios.post("http://localhost:3001/admin/donateRequest", data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                timeout: 30000
            });

            setSuccessMessage("เพิ่มโครงการบริจาคสำเร็จ!");
            setErrorMessage("");

            // รีเซ็ตฟอร์ม
            setFormData({
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

            setTimeout(() => {
                navigate("/admin/donations");
            }, 2000);

        } catch (error) {
            let errorMsg = "เกิดข้อผิดพลาด";
            if (error.response?.status === 401) {
                errorMsg = "ไม่มีสิทธิ์ในการเข้าถึง กรุณาเข้าสู่ระบบใหม่";
                localStorage.removeItem('userId');
                localStorage.removeItem('userRole');
                setTimeout(() => navigate("/login"), 1500);
            } else if (error.response?.status === 403) {
                errorMsg = "คุณไม่มีสิทธิ์ในการดำเนินการนี้";
            } else if (error.response?.data?.error) {
                errorMsg = error.response.data.error;
            } else if (error.response?.data?.message) {
                errorMsg = error.response.data.message;
            } else if (error.message) {
                errorMsg = error.message;
            }

            setErrorMessage(errorMsg);
            setSuccessMessage("");
        } finally {
            setIsSubmitting(false);
            handleClose();
        }
    };
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => {
        // ตรวจสอบข้อมูลก่อนเปิด modal
        if (!formData.projectName || !formData.description || !formData.donationType ||
            !formData.startDate || !formData.endDate || !formData.image) {
            alert("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
            return;
        }
        setOpen(true);
    };
    const handleClose = () => setOpen(false);
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 500,
        maxHeight: '80vh',
        overflow: 'auto',
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 24,
        p: 4,
    };
    return (
        <div className="donate-activity-container">
            {/* Top Menu Navigation */}
            <div className="mb-4">
                <nav className="nav Adminnav-tabs">
                    <Link
                        className={`adminnav-link ${location.pathname === '/admin/donations' ? 'active' : ''}`}
                        to="/admin/donations"
                    >
                        <i className="fas fa-project-diagram me-2"></i>
                        การจัดการโครงการบริจาค
                    </Link>
                    <Link
                        className={`adminnav-link ${location.pathname === '/admin/donations/donate-request' ? 'active' : ''}`}
                        to="/admin/donations/donate-request"
                    >
                        <i className="fas fa-plus me-2"></i>
                        เพิ่มโครงการใหม่
                    </Link>
                </nav>
            </div>

            <div className="container mt-4">
                <div className="row justify-content-center">
                    <div className="px-0">
                        <div className="card shadow">
                            <div className="card-header-addDonate text-white">
                                <h4 className=" mb-0">
                                    เพิ่มโครงการบริจาค
                                </h4>
                            </div>
                            <div className="card-body">
                                <form encType="multipart/form-data">
                                    <div className="data-AdminRequestDonate">
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
                                                rows="5"
                                                style={{ width: '100%', minHeight: '100px' }}
                                                required
                                            />
                                        </p>
                                        <p>
                                            <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px', margin: '10px 0' }}>
                                                <label>ประเภทการบริจาค<span className="important">*</span></label><br />
                                                <label className="typeDonateAdminPage" style={{ display: 'block', marginBottom: '10px' }}>
                                                    <input
                                                        type="radio"
                                                        name="donationType"
                                                        value="fundraising"
                                                        onChange={handleChange}
                                                        checked={formData.donationType === "fundraising"}
                                                        required
                                                        style={{ marginRight: '8px' }}
                                                    />บริจาคแบบระดมทุน
                                                </label>
                                                <label className="typeDonateAdminPage" style={{ display: 'block', marginBottom: '10px' }}>
                                                    <input
                                                        type="radio"
                                                        name="donationType"
                                                        value="unlimited"
                                                        onChange={handleChange}
                                                        checked={formData.donationType === "unlimited"}
                                                        style={{ marginRight: '8px' }}
                                                    />บริจาคแบบไม่จำกัดจำนวน
                                                </label>
                                                <label className="typeDonateAdminPage" style={{ display: 'block' }}>
                                                    <input
                                                        type="radio"
                                                        name="donationType"
                                                        value="things"
                                                        onChange={handleChange}
                                                        checked={formData.donationType === "things"}
                                                        style={{ marginRight: '8px' }}
                                                    />บริจาคสิ่งของ
                                                </label>
                                            </div>
                                        </p>

                                        {formData.donationType === "fundraising" && (
                                            <p>
                                                <label htmlFor="targetAmount">เป้าหมายยอดบริจาค (บาท)<span className="important">*</span></label><br />
                                                <input
                                                    id="targetAmount"
                                                    name="targetAmount"
                                                    placeholder="เป้าหมายยอดบริจาค"
                                                    type="number"
                                                    min="1"
                                                    value={formData.targetAmount}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </p>
                                        )}

                                        {formData.donationType === "things" && (
                                            <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px', margin: '10px 0' }}>
                                                <label><strong>ข้อมูลการบริจาคสิ่งของ<span className="important">*</span></strong></label><br />
                                                <div style={{ marginTop: '10px' }}>
                                                    <label>ประเภทสิ่งของ:</label><br />
                                                    <label style={{ display: 'block', margin: '5px 0' }}>
                                                        <input
                                                            name="typeThings"
                                                            type="radio"
                                                            value="เครื่องคอมพิวเตอร์"
                                                            onChange={handleChange}
                                                            checked={formData.typeThings === "เครื่องคอมพิวเตอร์"}
                                                            required
                                                            style={{ marginRight: '8px' }}
                                                        />เครื่องคอมพิวเตอร์
                                                    </label>
                                                    <label style={{ display: 'block', margin: '5px 0' }}>
                                                        <input
                                                            name="typeThings"
                                                            type="radio"
                                                            value="อุปกรณ์การเรียน"
                                                            onChange={handleChange}
                                                            checked={formData.typeThings === "อุปกรณ์การเรียน"}
                                                            required
                                                            style={{ marginRight: '8px' }}
                                                        />อุปกรณ์การเรียน
                                                    </label>
                                                </div>
                                                <div style={{ marginTop: '15px' }}>
                                                    <label htmlFor="quantityThings">จำนวน (ชิ้น):</label><br />
                                                    <input
                                                        id="quantityThings"
                                                        name="quantityThings"
                                                        placeholder="เช่น 20"
                                                        type="number"
                                                        min="1"
                                                        max={1000}
                                                        value={formData.quantityThings}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>

                                                <div style={{ marginTop: '15px' }}>
                                                    <label htmlFor="forThings">บริจาคให้กับ:</label><br />
                                                    <input
                                                        id="forThings"
                                                        name="forThings"
                                                        placeholder="เช่น นักศึกษาวิทยาลัยการคอมพิวเตอร์"
                                                        type="text"
                                                        value={formData.forThings}
                                                        onChange={handleChange}
                                                        style={{ width: '100%' }}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="time" style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px', margin: '10px 0' }}>
                                            <label><strong>ระยะเวลาการรับบริจาค<span className="important">*</span></strong></label>
                                            <div className="time-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
                                                <div>
                                                    <label className="title-time-donate">เริ่มต้น:</label><br />
                                                    <input
                                                        name="startDate"
                                                        type="date"
                                                        value={formData.startDate}
                                                        onChange={handleChange}
                                                        required
                                                        min={new Date().toISOString().split('T')[0]}
                                                        style={{ width: '100%' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="title-time-donate">สิ้นสุด:</label><br />
                                                    <input
                                                        name="endDate"
                                                        type="date"
                                                        value={formData.endDate}
                                                        onChange={handleChange}
                                                        required
                                                        min={formData.startDate ? formData.startDate : new Date().toISOString().split('T')[0]}
                                                        style={{ width: '100%' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px', margin: '10px 0' }}>
                                            <p>
                                                <label htmlFor="image">รูปภาพประกอบโครงการ<span className="important">*</span></label><br />
                                                <input
                                                    id="image"
                                                    name="image"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    required
                                                />
                                                {formData.image && (
                                                    <div style={{ marginTop: '10px' }}>
                                                        <img
                                                            src={URL.createObjectURL(formData.image)}
                                                            alt="ตัวอย่างรูปภาพ"
                                                            style={{ maxWidth: '200px', height: 'auto', border: '1px solid #ddd' }}
                                                        />
                                                    </div>
                                                )}
                                            </p>
                                        </div>

                                        <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px', margin: '10px 0' }}>
                                            <label><strong>ข้อมูลบัญชีธนาคาร<span className="important">*</span></strong></label><br />

                                            <div style={{ marginTop: '10px' }}>
                                                <label>ธนาคาร:</label><br />
                                                <input
                                                    id="bankName"
                                                    name="bankName"
                                                    type="text"
                                                    placeholder="เช่น ธนาคารกรุงไทย"
                                                    value={formData.bankName}
                                                    onChange={handleChange}
                                                    style={{ width: '100%', marginBottom: '10px' }}
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label>ชื่อบัญชีธนาคาร:</label><br />
                                                <input
                                                    id="accountName"
                                                    name="accountName"
                                                    type="text"
                                                    placeholder="เช่น หน่วยรับบริจาคเพื่อการศึกษา"
                                                    value={formData.accountName}
                                                    onChange={handleChange}
                                                    style={{ width: '100%', marginBottom: '10px' }}
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label>เลขบัญชี:</label><br />
                                                <input
                                                    id="accountNumber"
                                                    name="accountNumber"
                                                    type="text"
                                                    placeholder="เช่น 123-4-56789-0"
                                                    value={formData.accountNumber}
                                                    onChange={handleChange}
                                                    style={{ width: '100%', marginBottom: '10px' }}
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="numberPromtpay">หมายเลขพร้อมเพย์<span className="important">*</span></label><br />
                                                <input
                                                    name="numberPromtpay"
                                                    type="tel"
                                                    placeholder="0999999999"
                                                    value={formData.numberPromtpay}
                                                    onChange={handleChange}
                                                    maxLength="10"
                                                    pattern="[0-9]{13}|[0-9]{10}"
                                                    style={{ width: '100%', marginBottom: '10px' }}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="group-donate-btAdmin" >
                                            <Link to="/admin/donations">
                                                <button className="cancle-button-requestAdmin"
                                                    type="button"
                                                >ยกเลิก
                                                </button>
                                            </Link>
                                            <button className="submit-button-requestAdmin"
                                                type="button"
                                                onClick={handleOpen}
                                                disabled={isSubmitting}
                                            >เพิ่มโครงการ
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                {/* Modal แสดงข้อมูลที่กรอก */}
                <Modal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="modal-title"
                    aria-describedby="modal-description"
                >
                    <Box sx={style}>
                        <Typography id="modal-title" variant="h6" style={{ color: '#2196F3', marginBottom: '20px' }}>
                            🔍 ตรวจสอบข้อมูลโครงการ
                        </Typography>
                        <Typography id="modal-description" component="div" sx={{ mt: 2 }}>
                            <div style={{ lineHeight: '1.6' }}>
                                <strong>📋 ชื่อโครงการ:</strong> {formData.projectName} <br />
                                <strong>📝 รายละเอียด:</strong> <br />
                                <div style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '5px', margin: '5px 0' }}>
                                    {formData.description}
                                </div>
                                <strong>🏷️ ประเภทการบริจาค:</strong> {
                                    formData.donationType === "fundraising" ? "📈 ระดมทุน" :
                                        formData.donationType === "unlimited" ? "💝 ไม่จำกัดจำนวน" :
                                            formData.donationType === "things" ? "📦 บริจาคสิ่งของ" : formData.donationType
                                } <br />

                                {formData.donationType === "fundraising" && (
                                    <><strong>🎯 เป้าหมาย:</strong> {Number(formData.targetAmount).toLocaleString()} บาท <br /></>
                                )}

                                {formData.donationType === "things" && (
                                    <>
                                        <strong>📦 ประเภทสิ่งของ:</strong> {formData.typeThings} <br />
                                        <strong>🔢 จำนวน:</strong> {formData.quantityThings} ชิ้น <br />
                                        <strong>👥 บริจาคให้กับ:</strong> {formData.forThings} <br />
                                    </>
                                )}

                                <strong>📅 วันที่เริ่มต้น:</strong> {new Date(formData.startDate).toLocaleDateString('th-TH')} <br />
                                <strong>📅 วันที่สิ้นสุด:</strong> {new Date(formData.endDate).toLocaleDateString('th-TH')} <br />
                                <strong>🏦 ธนาคาร:</strong> {formData.bankName} <br />
                                <strong>👤 ชื่อบัญชี:</strong> {formData.accountName} <br />
                                <strong>💳 เลขบัญชี:</strong> {formData.accountNumber} <br />
                                <strong>📱 พร้อมเพย์:</strong> {formData.numberPromtpay} <br />

                                {formData.image && (
                                    <div style={{ marginTop: '15px' }}>
                                        <strong>🖼️ รูปภาพประกอบโครงการ:</strong>
                                        <br />
                                        <img
                                            src={URL.createObjectURL(formData.image)}
                                            alt="โครงการ"
                                            style={{
                                                maxWidth: "100%",
                                                height: "auto",
                                                marginTop: "10px",
                                                borderRadius: '5px',
                                                border: '1px solid #ddd'
                                            }}
                                            onError={(e) => {
                                                e.target.src = `${process.env.PUBLIC_URL}/image/default.png`;
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </Typography>

                        <div style={{ marginTop: '30px', textAlign: 'center', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <Button
                                onClick={handleClose}
                                color="secondary"
                                variant="outlined"
                                style={{ padding: '10px 20px' }}
                            >แก้ไข
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                color="primary"
                                disabled={isSubmitting}
                                variant="contained"
                                style={{ padding: '10px 20px' }}
                            >
                                {isSubmitting ? "กำลังเพิ่ม..." : "ยืนยันเพิ่มโครงการ"}
                            </Button>
                        </div>
                    </Box>
                </Modal>
            </div>
        </div>
    );
}

export default AdminDonateRequest;