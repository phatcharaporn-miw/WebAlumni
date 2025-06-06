import React, { useState } from "react";
import { Button, Modal, Box, Typography } from '@mui/material';
import "../css/Souvenir_request.css";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';

function SouvenirRequest() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        productName: "",
        description: "",
        image: null,
        price: "",
        stock: "",
        paymentMethod: "",
        bankName: "",
        accountNumber: "",
    });

    const user_id = localStorage.getItem('userId');
    const role = localStorage.getItem('userRole');

    const [notification, setNotification] = useState({
        open: false,
        message: "",
        severity: "info",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleNumberChange = (e) => {
        const { name, value } = e.target;
        if (/^\d*$/.test(value)) {
            setFormData(prevData => ({ ...prevData, [name]: value }));
        }
    };

    const handleFileChange = (e) => {
        const { files } = e.target;
        if (files && files[0]) {
            const file = files[0];
            const fileType = file.type.split("/")[0];
            if (fileType !== "image") {
                alert("กรุณาเลือกไฟล์รูปภาพ");
            } else {
                setFormData(prevData => ({ ...prevData, image: file }));
            }
        } else {
            alert("กรุณาเลือกไฟล์รูปภาพของที่ระลึก");
        }
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    const validateForm = () => {
        if (!formData.productName || !formData.description || !formData.price || !formData.stock || !formData.image || !formData.paymentMethod || !formData.bankName || !formData.accountNumber) {
            alert("กรุณากรอกข้อมูลให้ครบถ้วน!");
            return false;
        }
        if (isNaN(formData.price) || formData.price <= 0) {
            alert("กรุณากรอกราคาที่ถูกต้อง");
            return false;
        }
        if (isNaN(formData.stock) || formData.stock <= 0) {
            alert("กรุณากรอกจำนวนสินค้าเป็นตัวเลขที่ถูกต้อง");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const data = new FormData();
        data.append("productName", formData.productName);
        data.append("description", formData.description);
        data.append("price", formData.price);
        data.append("stock", formData.stock);
        data.append('image', formData.image);
        data.append("paymentMethod", formData.paymentMethod);
        data.append("bankName", formData.bankName);
        data.append("accountNumber", formData.accountNumber);
        data.append("accountName", formData.accountName);
        data.append("promptpayNumber", formData.promptpayNumber);

        const role = localStorage.getItem('userRole');
        const user_id = localStorage.getItem('userId');
        if (user_id) {
            data.append("user_id", user_id);
        } else {
            alert("ผู้ใช้ไม่ถูกล็อกอิน");
            return;
        }

        const url = role === '1'
            ? 'http://localhost:3001/admin/addsouvenir'
            : 'http://localhost:3001/souvenir/addsouvenir';

        try {
            const response = await axios.post(url, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            // นำทางไปยังหน้าสินค้า
            navigate("/souvenir");
        } catch (error) {
            console.error("Error:", error);
            alert(error.response?.data?.error || "เกิดข้อผิดพลาด");
        }
    };


    // const generateQRCodeForPayment = (productData) => {
    //     const paymentUrl = `https://paymentgateway.com/checkout?productId=${productData.productName}&amount=${productData.price}`;

    //     QRCode.toDataURL(paymentUrl, (err, url) => {
    //         if (err) {
    //             console.error("Error generating QR code", err);
    //             return;
    //         }
    //         console.log("Generated QR Code URL:", url);
    //         return url;  
    //     });
    // };

    const [open, setOpen] = useState(false);
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
            <h3>เพิ่มสินค้าของที่ระลึก</h3>
            <div className="request-souvenir-form ">
                <form encType="multipart/form-data" onSubmit={handleSubmit}>
                    {/* รายละเอียดเกี่ยวกับสินค้า */}
                    <div className="data-requestSouvenir">
                        <p className="data-requestSouvenir-title">รายละเอียดเกี่ยวกับสินค้า</p>
                        <div>
                            <label htmlFor="productName">ชื่อสินค้าของที่ระลึก<span className="important">*</span></label><br />
                            <input
                                className="data-requestSouvenir-input"
                                name="productName"
                                placeholder="ชื่อสินค้าของที่ระลึก"
                                type="text"
                                value={formData.productName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="description">รายละเอียดสินค้า<span className="important">*</span></label><br />
                            <textarea
                                className="data-requestSouvenir-input"
                                name="description"
                                placeholder="รายละเอียดของสินค้า"
                                value={formData.description}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="image">รูปสินค้า<span className="important">*</span></label><br />
                            <input
                                className="data-requestSouvenir-input"
                                type="file"
                                name="image"
                                placeholder="รูปสินค้า"
                                onChange={handleFileChange}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="price">ราคาต่อชิ้น (บาท)<span className="important">*</span></label><br />
                            <input
                                className="data-requestSouvenir-input"
                                name="price"
                                placeholder="ex.259"
                                type="text"
                                value={formData.price}
                                onChange={handleNumberChange}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="stock">จำนวนสินค้า (ชิ้น)<span className="important">*</span></label><br />
                            <input
                                className="data-requestSouvenir-input"
                                name="stock"
                                placeholder="ex.30"
                                type="text"
                                value={formData.stock}
                                onChange={handleNumberChange}
                                required
                            />
                        </div>
                    </div>

                    {/* ช่องทางการชำระเงิน */}
                    <div className="payment-info">
                        <p className="data-requestSouvenir-title">ช่องทางการชำระเงิน</p>
                        <div>
                            <label htmlFor="paymentMethod">ช่องทางการชำระเงิน<span className="important">*</span></label><br />
                            <select
                                className="data-requestSouvenir-input"
                                name="paymentMethod"
                                value={formData.paymentMethod}
                                onChange={handleChange}
                                required
                            >
                                <option value="" disabled>เลือกช่องทางการชำระเงิน</option>
                                <option value="พร้อมเพย์">พร้อมเพย์</option>
                            </select>
                        </div>


                        <div>
                            <label htmlFor="bankName">ชื่อธนาคาร<span className="important">*</span></label><br />
                            <input
                                className="data-requestSouvenir-input"
                                name="bankName"
                                placeholder="ชื่อธนาคาร"
                                type="text"
                                value={formData.bankName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="accountName">ชื่อบัญชี<span className="important">*</span></label><br />
                            <input
                                className="data-requestSouvenir-input"
                                name="accountName"
                                placeholder="หมายเลขบัญชี"
                                type="text"
                                value={formData.accountName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="accountNumber">หมายเลขบัญชี<span className="important">*</span></label><br />
                            <input
                                className="data-requestSouvenir-input"
                                name="accountNumber"
                                placeholder="หมายเลขบัญชี"
                                type="text"
                                value={formData.accountNumber}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="promptpayNumber">หมายเลขพร้อมเพย์<span className="important">*</span></label><br />
                            <input
                                className="data-requestSouvenir-input"
                                name="promptpayNumber"
                                placeholder="หมายเลขพร้อมเพย์"
                                type="text"
                                value={formData.promptpayNumber}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="group-souvenir-bt">
                        <Link to="/souvenir">
                            <button className="cancle-button-souvenirRequest" type="button">ยกเลิก</button>
                        </Link>
                        <button type="button" className="button-souvenirRequest" onClick={handleOpen}>เพิ่มสินค้าของที่ระลึก</button>
                    </div>
                </form>
            </div>

            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-title" variant="h6">ตรวจสอบข้อมูลสินค้า</Typography>
                    <Typography id="modal-description" sx={{ mt: 2 }}>
                        <div>
                            <strong>ชื่อสินค้าของที่ระลึก:</strong> {formData.productName} <br />
                            <strong>รายละเอียดของสินค้า:</strong> {formData.description} <br />
                            <strong>ราคาต่อชิ้น:</strong> {formData.price} บาท<br />
                            <strong>จำนวนสินค้า:</strong> {formData.stock} ชิ้น<br />
                            <strong>ช่องทางการชำระเงิน:</strong> {formData.paymentMethod} <br />
                            <strong>ชื่อธนาคาร:</strong> {formData.bankName} <br />
                            <strong>หมายเลขบัญชี:</strong> {formData.accountNumber} <br />
                            {formData.image && (
                                <div>
                                    <strong>รูปภาพของสินค้า:</strong>
                                    <br />
                                    <img
                                        src={URL.createObjectURL(formData.image)}
                                        alt="สินค้าของที่ระลึก"
                                        style={{ maxWidth: "100%", height: "200px", marginTop: "10px" }}
                                    />
                                </div>
                            )}
                        </div>
                    </Typography>

                    <div style={{ marginTop: '20px', textAlign: 'right' }}>
                        <Button onClick={handleClose} color="secondary">แก้ไข</Button>
                        <Button onClick={handleSubmit} color="primary">
                            ยืนยันเพิ่มสินค้า
                        </Button>
                    </div>
                </Box>
            </Modal>
        </div>
    );
}

export default SouvenirRequest;
