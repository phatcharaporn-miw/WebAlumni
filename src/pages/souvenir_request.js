// import React, { useState } from "react";
// import { Button, Modal, Box, Typography } from '@mui/material';
// import "../css/Souvenir_request.css";
// import { useNavigate } from "react-router-dom";
// import axios from 'axios';
// import DeleteIcon from '@mui/icons-material/Delete';
// import AddIcon from '@mui/icons-material/Add';
// import Swal from "sweetalert2";

// function SouvenirRequest() {
//     const navigate = useNavigate();
//     const [formData, setFormData] = useState({
//         productName: "",
//         description: "",
//         variants: [],
//         paymentMethod: "",
//         bankName: "",
//         accountNumber: "",
//         accountName: "",
//         promptpayNumber: "",
//     });

//     const user_id = sessionStorage.getItem('userId');
//     const role = sessionStorage.getItem('userRole');

//     const [notification, setNotification] = useState({
//         open: false,
//         message: "",
//         severity: "info",
//     });

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prevData => ({ ...prevData, [name]: value }));
//     };

//     const handleNumberChange = (e) => {
//         const { name, value } = e.target;
//         if (/^\d*$/.test(value)) {
//             setFormData(prevData => ({ ...prevData, [name]: value }));
//         }
//     };

//     const handleFileChange = (e) => {
//         const { files } = e.target;
//         if (files && files[0]) {
//             const file = files[0];
//             const fileType = file.type.split("/")[0];
//             if (fileType !== "image") {
//                 alert("กรุณาเลือกไฟล์รูปภาพ");
//             } else {
//                 setFormData(prevData => ({ ...prevData, image: file }));
//             }
//         } else {
//             alert("กรุณาเลือกไฟล์รูปภาพของที่ระลึก");
//         }
//     };

//     const handleCloseNotification = () => {
//         setNotification({ ...notification, open: false });
//     };

//     const validateForm = () => {
//         if (!formData.productName || !formData.description || !formData.price || !formData.stock || !formData.image || !formData.paymentMethod || !formData.bankName || !formData.accountNumber) {
//             Swal.fire({
//                 title: "ข้อผิดพลาด",
//                 text: "กรุณากรอกข้อมูลให้ครบถ้วน!",
//                 icon: "error",
//                 confirmButtonText: "ตกลง"
//             });
//             return false;
//         }
//         if (isNaN(formData.price) || formData.price <= 0) {
//             Swal.fire({
//                 title: "ข้อผิดพลาด",
//                 text: "กรุณากรอกราคาที่ถูกต้อง",
//                 icon: "error",
//                 confirmButtonText: "ตกลง"
//             });
//             return false;
//         }
//         if (isNaN(formData.stock) || formData.stock <= 0) {
//             Swal.fire({
//                 title: "ข้อผิดพลาด",
//                 text: "กรุณากรอกจำนวนสินค้าเป็นตัวเลขที่ถูกต้อง",
//                 icon: "error",
//                 confirmButtonText: "ตกลง"
//             });
//             return false;
//         }
//         return true;
//     };

//     // ตัวเลือกของสินค้า
//     const handleChangeVariant = (index, field, value) => {
//         const newVariants = [...formData.variants];
//         newVariants[index][field] = value;
//         setFormData(prev => ({ ...prev, variants: newVariants }));
//     };
//     const addVariant = () => {
//         setFormData(prev => ({
//             ...prev,
//             variants: [...prev.variants, { color: "", size: "", price: "", stock: "", image: null }]
//         }));
//     };
//     const handleVariantFileChange = (index, file) => {
//         const newVariants = [...formData.variants];
//         newVariants[index].image = file;
//         setFormData(prev => ({ ...prev, variants: newVariants }));
//     };

//     const removeVariant = (index) => {
//         const newVariants = formData.variants.filter((_, i) => i !== index);
//         setFormData(prev => ({ ...prev, variants: newVariants }));
//     };


//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (!validateForm()) return;

//         const data = new FormData();
//         data.append("productName", formData.productName);
//         data.append("description", formData.description);
//         data.append("price", formData.price);
//         data.append("stock", formData.stock);
//         data.append('image', formData.image);
//         data.append("paymentMethod", formData.paymentMethod);
//         data.append("bankName", formData.bankName);
//         data.append("accountNumber", formData.accountNumber);
//         data.append("accountName", formData.accountName);
//         data.append("promptpayNumber", formData.promptpayNumber);
//         data.append("status", "0"); // รอการอนุมัติ

//         const role = sessionStorage.getItem('userRole');
//         const user_id = sessionStorage.getItem('userId');
//         if (user_id) {
//             data.append("user_id", user_id);
//         } else {
//             alert("ผู้ใช้ไม่ได้เข้าสู่ระบบ");
//             return;
//         }

//         const url = role === '1'
//             ? 'http://localhost:3001/admin/addsouvenir'
//             : 'http://localhost:3001/souvenir/addsouvenir';

//         try {
//             const response = await axios.post(url, data, {
//                 headers: { 'Content-Type': 'multipart/form-data' },
//             }, {
//                 withCredentials: true
//             });

//             handleClose(); // ปิด modal หลังจากส่งข้อมูลสำเร็จ

//             // แสดงข้อความตาม role
//             if (role === '1') {
//                 // Admin - เพิ่มสินค้าได้ทันทีโดยไม่ต้องรอการอนุมัติ
//                 Swal.fire({
//                     title: "เพิ่มสินค้าสำเร็จ!",
//                     text: "สินค้าถูกเพิ่มเข้าระบบแล้ว",
//                     icon: "success",
//                     confirmButtonText: "ตกลง"
//                 }).then(() => {
//                     // นำทางไปหน้าจัดการสินค้าของ admin
//                     navigate("/admin/souvenir"); 
//                 });
//             } else {
//                 // User อื่นๆ - ต้องรอการอนุมัติ
//                 Swal.fire({
//                     title: "เพิ่มสินค้าสำเร็จ!",
//                     text: "สินค้าของคุณถูกส่งแล้ว กรุณารอการอนุมัติ",
//                     icon: "success",
//                     confirmButtonText: "ตกลง"
//                 }).then(() => {
//                     // นำทางไปยังหน้าตาม role
//                     if (role === '2') {
//                         navigate("/president-profile/president-request");
//                     } else if (role === '4') {
//                         navigate("/student-profile/student-request");
//                     } else {
//                         navigate("/alumni-profile/alumni-request");
//                     }
//                 });
//             }

//         } catch (error) {
//             handleClose();
//             console.error("Error:", error);

//             // แสดง error message ที่เหมาะสม
//             const errorMessage = error.response?.data?.error || "เกิดข้อผิดพลาด";
//             Swal.fire({
//                 title: "เกิดข้อผิดพลาด!",
//                 text: errorMessage,
//                 icon: "error",
//                 confirmButtonText: "ตกลง"
//             });
//         };
//     };

//         const handleCancel = () => {
//             const role = sessionStorage.getItem("userRole"); // หรือ user?.role
//             if (role === "1") {
//                 navigate("/admin/souvenir");
//             } else {
//                 navigate("/souvenir");
//             }
//         };

//         const [open, setOpen] = useState(false);
//         const handleOpen = () => setOpen(true);
//         const handleClose = () => setOpen(false);

//         const style = {
//             position: 'absolute',
//             top: '50%',
//             left: '50%',
//             transform: 'translate(-50%, -50%)',
//             width: 400,
//             bgcolor: 'background.paper',
//             boxShadow: 24,
//             p: 4,
//         };
//         return (
//             <div>
//                 <h3 className="alumni-title text-center">เพิ่มสินค้าของที่ระลึก</h3>
//                 <div className="request-souvenir-form ">
//                     <form encType="multipart/form-data" onSubmit={handleSubmit}>
//                         {/* รายละเอียดเกี่ยวกับสินค้า */}
//                         <div className="data-requestSouvenir">
//                             <p className="data-requestSouvenir-title">รายละเอียดเกี่ยวกับสินค้า</p>
//                             <div>
//                                 <label htmlFor="productName">ชื่อสินค้าของที่ระลึก<span className="important">*</span></label><br />
//                                 <input
//                                     className="data-requestSouvenir-input"
//                                     name="productName"
//                                     placeholder="ชื่อสินค้าของที่ระลึก"
//                                     type="text"
//                                     value={formData.productName}
//                                     onChange={handleChange}
//                                     required
//                                 />
//                             </div>
//                             <div>
//                                 <label htmlFor="description">รายละเอียดสินค้า<span className="important">*</span></label><br />
//                                 <textarea
//                                     className="data-requestSouvenir-input"
//                                     name="description"
//                                     placeholder="รายละเอียดของสินค้า"
//                                     value={formData.description}
//                                     onChange={handleChange}
//                                     required
//                                 />
//                             </div>
//                             <div>
//                                 <label htmlFor="image">รูปหลักสินค้า<span className="important">*</span></label><br />
//                                 <input
//                                     className="data-requestSouvenir-input"
//                                     type="file"
//                                     name="image"
//                                     placeholder="รูปสินค้า"
//                                     onChange={handleFileChange}
//                                     required
//                                 />
//                             </div>
//                             <div>
//                                 <label htmlFor="price">ราคาต่อชิ้น (บาท)<span className="important">*</span></label><br />
//                                 <input
//                                     className="data-requestSouvenir-input"
//                                     name="price"
//                                     placeholder="ex.259"
//                                     type="text"
//                                     value={formData.price}
//                                     onChange={handleNumberChange}
//                                     required
//                                 />
//                             </div>

//                             <div>
//                                 <label htmlFor="stock">จำนวนสินค้า (ชิ้น)<span className="important">*</span></label><br />
//                                 <input
//                                     className="data-requestSouvenir-input"
//                                     name="stock"
//                                     placeholder="ex.30"
//                                     type="text"
//                                     value={formData.stock}
//                                     onChange={handleNumberChange}
//                                     required
//                                 />
//                             </div>

//                             <div className="data-requestSouvenir">
//                                 <p className="data-requestSouvenir-title">ตัวเลือกสินค้า (สี, ขนาด, ราคา, จำนวน)</p>
//                                 <Button
//                                     variant="outlined"
//                                     onClick={addVariant}
//                                     startIcon={<AddIcon />}
//                                     sx={{ mt: 2 }}
//                                 >
//                                     เพิ่มตัวเลือกสินค้า
//                                 </Button>
//                                 {formData.variants.length > 0 && formData.variants.map((variant, index) => (
//                                     <div key={index} className="variant-box">
//                                         {/* ปุ่มลบอยู่มุมขวาบน */}
//                                         {formData.variants.length > 1 && (
//                                             <Button
//                                                 className="variant-remove-btn"
//                                                 onClick={() => removeVariant(index)}
//                                                 color="error"
//                                                 size="small"
//                                             >
//                                                 <DeleteIcon fontSize="small" />
//                                             </Button>
//                                         )}

//                                         <label>สี</label>
//                                         <input
//                                             className="data-requestSouvenir-input"
//                                             type="text"
//                                             value={variant.color}
//                                             onChange={e => handleChangeVariant(index, 'color', e.target.value)}
//                                         />

//                                         <label>ขนาด</label>
//                                         <input
//                                             className="data-requestSouvenir-input"
//                                             type="text"
//                                             value={variant.size}
//                                             onChange={e => handleChangeVariant(index, 'size', e.target.value)}
//                                         />

//                                         <label>ราคา</label>
//                                         <input
//                                             className="data-requestSouvenir-input"
//                                             type="text"
//                                             value={variant.price}
//                                             onChange={e => handleChangeVariant(index, 'price', e.target.value)}
//                                         />

//                                         <label>สต็อก</label>
//                                         <input
//                                             className="data-requestSouvenir-input"
//                                             type="text"
//                                             value={variant.stock}
//                                             onChange={e => handleChangeVariant(index, 'stock', e.target.value)}
//                                         />

//                                         <label>รูปภาพตัวเลือก</label>
//                                         <input
//                                             className="data-requestSouvenir-input"
//                                             type="file"
//                                             onChange={e => handleVariantFileChange(index, e.target.files[0])}
//                                         />
//                                     </div>
//                                 ))}
//                             </div>

//                         </div>
//                         {/* ช่องทางการชำระเงิน */}
//                         <div className="payment-info">
//                             <p className="data-requestSouvenir-title">ช่องทางการชำระเงิน</p>
//                             <div>
//                                 <label htmlFor="paymentMethod">ช่องทางการชำระเงิน<span className="important">*</span></label><br />
//                                 <select
//                                     className="data-requestSouvenir-input"
//                                     name="paymentMethod"
//                                     value={formData.paymentMethod}
//                                     onChange={handleChange}
//                                     required
//                                 >
//                                     <option value="" disabled>เลือกช่องทางการชำระเงิน</option>
//                                     <option value="พร้อมเพย์">พร้อมเพย์</option>
//                                 </select>
//                             </div>

//                             <div>
//                                 <label htmlFor="bankName">ชื่อธนาคาร<span className="important">*</span></label><br />
//                                 <input
//                                     className="data-requestSouvenir-input"
//                                     name="bankName"
//                                     placeholder="ชื่อธนาคาร"
//                                     type="text"
//                                     value={formData.bankName}
//                                     onChange={handleChange}
//                                     required
//                                 />
//                             </div>

//                             <div>
//                                 <label htmlFor="accountName">ชื่อบัญชี<span className="important">*</span></label><br />
//                                 <input
//                                     className="data-requestSouvenir-input"
//                                     name="accountName"
//                                     placeholder="หมายเลขบัญชี"
//                                     type="text"
//                                     value={formData.accountName}
//                                     onChange={handleChange}
//                                     required
//                                 />
//                             </div>

//                             <div>
//                                 <label htmlFor="accountNumber">หมายเลขบัญชี<span className="important">*</span></label><br />
//                                 <input
//                                     className="data-requestSouvenir-input"
//                                     name="accountNumber"
//                                     placeholder="หมายเลขบัญชี"
//                                     type="text"
//                                     value={formData.accountNumber}
//                                     onChange={handleChange}
//                                     required
//                                 />
//                             </div>

//                             <div>
//                                 <label htmlFor="promptpayNumber">หมายเลขพร้อมเพย์<span className="important">*</span></label><br />
//                                 <input
//                                     className="data-requestSouvenir-input"
//                                     name="promptpayNumber"
//                                     placeholder="หมายเลขพร้อมเพย์"
//                                     type="text"
//                                     value={formData.promptpayNumber}
//                                     onChange={handleChange}
//                                     required
//                                 />
//                             </div>
//                         </div>

//                         <div className="group-souvenir-bt">
//                             <button className="cancle-button-souvenirRequest" type="button" onClick={handleCancel}>
//                                 ยกเลิก
//                             </button>
//                             <button type="button" className="button-souvenirRequest" onClick={handleOpen}>
//                                 เพิ่มสินค้าของที่ระลึก
//                             </button>
//                         </div>
//                     </form>
//                 </div>

//                 {/* Modal */}
//                 <Modal
//                     open={open}
//                     onClose={handleClose}
//                     aria-labelledby="modal-title"
//                     aria-describedby="modal-description"
//                 >
//                     <Box sx={{ ...style, width: 500 }}>
//                         <Typography id="modal-title" variant="h6" sx={{ mb: 2, textAlign: "center" }}>
//                             ตรวจสอบข้อมูลสินค้า
//                         </Typography>
//                         <div style={{ marginBottom: "20px" }}>
//                             <table style={{ width: "100%", borderCollapse: "collapse" }}>
//                                 <tbody>
//                                     <tr>
//                                         <td style={{ fontWeight: "bold", padding: "8px", borderBottom: "1px solid #ddd" }}>ชื่อสินค้า:</td>
//                                         <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{formData.productName}</td>
//                                     </tr>
//                                     <tr>
//                                         <td style={{ fontWeight: "bold", padding: "8px", borderBottom: "1px solid #ddd" }}>รายละเอียด:</td>
//                                         <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{formData.description}</td>
//                                     </tr>
//                                     <tr>
//                                         <td style={{ fontWeight: "bold", padding: "8px", borderBottom: "1px solid #ddd" }}>ราคาต่อชิ้น:</td>
//                                         <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{formData.price} บาท</td>
//                                     </tr>
//                                     <tr>
//                                         <td style={{ fontWeight: "bold", padding: "8px", borderBottom: "1px solid #ddd" }}>จำนวนสินค้า:</td>
//                                         <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{formData.stock} ชิ้น</td>
//                                     </tr>
//                                     <tr>
//                                         <td style={{ fontWeight: "bold", padding: "8px", borderBottom: "1px solid #ddd" }}>ช่องทางการชำระเงิน:</td>
//                                         <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{formData.paymentMethod}</td>
//                                     </tr>
//                                     <tr>
//                                         <td style={{ fontWeight: "bold", padding: "8px", borderBottom: "1px solid #ddd" }}>ชื่อธนาคาร:</td>
//                                         <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{formData.bankName}</td>
//                                     </tr>
//                                     <tr>
//                                         <td style={{ fontWeight: "bold", padding: "8px", borderBottom: "1px solid #ddd" }}>หมายเลขบัญชี:</td>
//                                         <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{formData.accountNumber}</td>
//                                     </tr>
//                                 </tbody>
//                             </table>
//                         </div>

//                         {formData.image && (
//                             <div style={{ textAlign: "center", marginBottom: "20px" }}>
//                                 <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
//                                     รูปภาพของสินค้า
//                                 </Typography>
//                                 <img
//                                     src={URL.createObjectURL(formData.image)}
//                                     alt="สินค้าของที่ระลึก"
//                                     style={{ maxWidth: "100%", height: "200px", objectFit: "cover", borderRadius: "8px" }}
//                                 />
//                             </div>
//                         )}

//                         <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
//                             <Button onClick={handleClose} variant="outlined" color="secondary">
//                                 แก้ไข
//                             </Button>
//                             <Button onClick={handleSubmit} variant="contained" color="primary">
//                                 ยืนยันเพิ่มสินค้า
//                             </Button>
//                         </div>
//                     </Box>
//                 </Modal>
//             </div>
//         );

//     }

//     export default SouvenirRequest;

import React, { useState } from "react";
import { Button, Modal, Box, Typography } from '@mui/material';
import "../css/Souvenir_request.css";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Swal from "sweetalert2";
import { useAuth } from '../context/AuthContext';

function SouvenirRequest() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        productName: "",
        description: "",
        price: "",
        quantity: "",
        slot_name: "",
        start_date: "",
        end_date: "",
        variants: [],
        paymentMethod: "",
        bankName: "",
        accountNumber: "",
        accountName: "",
        promptpayNumber: "",
        image: null
    });

    const { user } = useAuth();
    const user_id = user?.id;
    const role = user?.role;

    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (e) => {
        const { name, value } = e.target;
        if (/^\d*$/.test(value)) {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (e) => {
        const { files } = e.target;
        if (files && files[0]) {
            const file = files[0];
            if (file.type.split("/")[0] !== "image") {
                Swal.fire("ข้อผิดพลาด", "กรุณาเลือกไฟล์รูปภาพ", "error");
            } else {
                setFormData(prev => ({ ...prev, image: file }));
            }
        } else {
            Swal.fire("ข้อผิดพลาด", "กรุณาเลือกไฟล์รูปภาพของที่ระลึก", "error");
        }
    };

    const handleChangeVariant = (index, field, value) => {
        const newVariants = [...formData.variants];
        newVariants[index][field] = value;
        setFormData(prev => ({ ...prev, variants: newVariants }));
    };

    const handleVariantFileChange = (index, file) => {
        const newVariants = [...formData.variants];
        newVariants[index].image = file;
        setFormData(prev => ({ ...prev, variants: newVariants }));
    };

    const addVariant = () => {
        setFormData(prev => ({
            ...prev,
            variants: [...prev.variants, { color: "", size: "", price: "", quantity: "", image: null }]
        }));
    };

    const removeVariant = (index) => {
        const newVariants = formData.variants.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, variants: newVariants }));
    };

    const validateForm = () => {
        if (!formData.productName || !formData.description || !formData.price ||
            !formData.quantity || !formData.image || !formData.paymentMethod ||
            !formData.bankName || !formData.accountNumber || !formData.accountName ||
            !formData.slot_name) {
            Swal.fire("ข้อผิดพลาด", "กรุณากรอกข้อมูลให้ครบถ้วน", "error");
            return false;
        }
        if (isNaN(formData.price) || formData.price <= 0) {
            Swal.fire("ข้อผิดพลาด", "กรุณากรอกราคาที่ถูกต้อง", "error");
            return false;
        }
        if (!Number.isInteger(Number(formData.quantity)) || formData.quantity <= 0) {
            Swal.fire("ข้อผิดพลาด", "กรุณากรอกจำนวนสินค้าเป็นตัวเลขที่ถูกต้อง", "error");
            return false;
        }
        if (formData.end_date && new Date(formData.end_date) < new Date(formData.start_date)) {
            Swal.fire("ข้อผิดพลาด", "วันที่สิ้นสุดต้องไม่น้อยกว่าวันที่เริ่มต้น", "error");
            return false;
        }
        for (let i = 0; i < formData.variants.length; i++) {
            const variant = formData.variants[i];
            if (!variant.color || !variant.size || !variant.price || !variant.quantity) {
                Swal.fire("ข้อผิดพลาด", `กรุณากรอกข้อมูลตัวเลือกสินค้าที่ ${i + 1} ให้ครบถ้วน`, "error");
                return false;
            }
            if (isNaN(variant.price) || variant.price <= 0 || !Number.isInteger(Number(variant.quantity)) || variant.quantity <= 0) {
                Swal.fire("ข้อผิดพลาด", `ราคาหรือจำนวนในตัวเลือกสินค้าที่ ${i + 1} ไม่ถูกต้อง`, "error");
                return false;
            }
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
        data.append("quantity", formData.quantity);
        data.append("slot_name", formData.slot_name);
        data.append("start_date", formData.start_date);
        data.append("end_date", formData.end_date || null);
        data.append("image", formData.image);
        data.append("paymentMethod", formData.paymentMethod);
        data.append("bankName", formData.bankName);
        data.append("accountNumber", formData.accountNumber);
        data.append("accountName", formData.accountName);
        data.append("promptpayNumber", formData.promptpayNumber || "");
        data.append("user_id", user_id);
        data.append("variants", JSON.stringify(formData.variants));
        formData.variants.forEach((variant, index) => {
            if (variant.image) {
                data.append(`variant_image_${index}`, variant.image);
            }
        });

        const url = role === '1'
            ? 'http://localhost:3001/admin/addsouvenir'
            : 'http://localhost:3001/souvenir/addsouvenir';

        try {
            const response = await axios.post(url, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });

            handleClose();
            Swal.fire({
                title: "เพิ่มสินค้าสำเร็จ!",
                text: (role === '1' || role === '2')
                    ? "เพิ่มสินค้าเรียบร้อยแล้ว"
                    : "สินค้าของคุณอยู่ระหว่างการตรวจสอบ กรุณารอการอนุมัติ",
                icon: "success",
                confirmButtonText: "ตกลง"
            }).then(() => {
                if (role === '1') {
                    navigate("/admin/souvenir");
                } else if (role === '2') {
                    navigate("/souvenir");
                } else if (role === '4') {
                    navigate("/student-profile/student-request");
                } else {
                    navigate("/alumni-profile/alumni-request");
                }
            });
        } catch (error) {
            handleClose();
            console.error("Error:", error);
            Swal.fire({
                title: "เกิดข้อผิดพลาด!",
                text: error.response?.data?.error || "เกิดข้อผิดพลาดในการเพิ่มสินค้า",
                icon: "error",
                confirmButtonText: "ตกลง"
            });
        }
    };

    const handleCancel = () => {
        if (role === "1") {
            navigate("/admin/souvenir");
        } else {
            navigate("/souvenir");
        }
    };

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        maxHeight: '80vh',
        overflowY: 'auto'
    };

    return (
        <div>
            <h3 className="alumni-title text-center">เพิ่มสินค้าของที่ระลึก</h3>
            <div className="request-souvenir-form">
                <form encType="multipart/form-data" onSubmit={handleSubmit}>
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
                            <label htmlFor="image">รูปหลักสินค้า<span className="important">*</span></label><br />
                            <input
                                className="data-requestSouvenir-input"
                                type="file"
                                name="image"
                                accept="image/*"
                                onChange={handleFileChange}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="price">ราคาต่อชิ้น (บาท)<span className="important">*</span></label><br />
                            <input
                                className="data-requestSouvenir-input"
                                name="price"
                                placeholder="เช่น 259"
                                type="text"
                                value={formData.price}
                                onChange={handleNumberChange}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="quantity">จำนวนสินค้า (ชิ้น)<span className="important">*</span></label><br />
                            <input
                                className="data-requestSouvenir-input"
                                name="quantity"
                                placeholder="เช่น 30"
                                type="text"
                                value={formData.quantity}
                                onChange={handleNumberChange}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="slot_name">ชื่อล็อต<span className="important">*</span></label><br />
                            <input
                                className="data-requestSouvenir-input"
                                name="slot_name"
                                placeholder="เช่น ล็อตที่ 1"
                                type="text"
                                value={formData.slot_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="start_date">วันที่เริ่ม<span className="important">*</span></label><br />
                            <input
                                className="data-requestSouvenir-input"
                                name="start_date"
                                type="date"
                                value={formData.start_date}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="end_date">วันที่สิ้นสุด</label><br />
                            <input
                                className="data-requestSouvenir-input"
                                name="end_date"
                                type="date"
                                value={formData.end_date}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="data-requestSouvenir">
                            <p className="data-requestSouvenir-title">ตัวเลือกสินค้า (สี, ขนาด, ราคา, จำนวน)</p>
                            <Button
                                variant="outlined"
                                onClick={addVariant}
                                startIcon={<AddIcon />}
                                sx={{ mt: 2 }}
                            >
                                เพิ่มตัวเลือกสินค้า
                            </Button>
                            {formData.variants.map((variant, index) => (
                                <div key={index} className="variant-box" style={{ position: 'relative', marginTop: '16px', padding: '16px', border: '1px solid #ddd', borderRadius: '4px' }}>
                                    {formData.variants.length > 0 && (
                                        <Button
                                            className="variant-remove-btn"
                                            onClick={() => removeVariant(index)}
                                            color="error"
                                            size="small"
                                            sx={{ position: 'absolute', top: '8px', right: '8px' }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </Button>
                                    )}
                                    <label>สี<span className="important">*</span></label>
                                    <input
                                        className="data-requestSouvenir-input"
                                        type="text"
                                        value={variant.color}
                                        onChange={e => handleChangeVariant(index, 'color', e.target.value)}
                                        required
                                    />
                                    <label>ขนาด<span className="important">*</span></label>
                                    <input
                                        className="data-requestSouvenir-input"
                                        type="text"
                                        value={variant.size}
                                        onChange={e => handleChangeVariant(index, 'size', e.target.value)}
                                        required
                                    />
                                    <label>ราคา (บาท)<span className="important">*</span></label>
                                    <input
                                        className="data-requestSouvenir-input"
                                        type="text"
                                        value={variant.price}
                                        onChange={e => handleChangeVariant(index, 'price', e.target.value)}
                                        required
                                    />
                                    <label>จำนวน (ชิ้น)<span className="important">*</span></label>
                                    <input
                                        className="data-requestSouvenir-input"
                                        type="text"
                                        value={variant.quantity}
                                        onChange={e => handleChangeVariant(index, 'quantity', e.target.value)}
                                        required
                                    />
                                    <label>รูปภาพตัวเลือก</label>
                                    <input
                                        className="data-requestSouvenir-input"
                                        type="file"
                                        accept="image/*"
                                        onChange={e => handleVariantFileChange(index, e.target.files[0])}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
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
                                <option value="bank_transfer">โอนเงินผ่านธนาคาร</option>
                                <option value="promptpay">พร้อมเพย์</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="bankName">ชื่อธนาคาร<span className="important">*</span></label><br />
                            <input
                                className="data-requestSouvenir-input"
                                name="bankName"
                                placeholder="เช่น ธนาคารกสิกรไทย"
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
                                placeholder="ชื่อบัญชี"
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
                                placeholder="เช่น 123-4-56789-0"
                                type="text"
                                value={formData.accountNumber}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="promptpayNumber">หมายเลขพร้อมเพย์</label><br />
                            <input
                                className="data-requestSouvenir-input"
                                name="promptpayNumber"
                                placeholder="เช่น 0991234567"
                                type="text"
                                value={formData.promptpayNumber}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="group-souvenir-bt">
                        <button className="cancle-button-souvenirRequest" type="button" onClick={handleCancel}>
                            ยกเลิก
                        </button>
                        <button type="button" className="button-souvenirRequest" onClick={handleOpen}>
                            ตรวจสอบข้อมูล
                        </button>
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
                    <Typography id="modal-title" variant="h6" sx={{ mb: 2, textAlign: "center" }}>
                        ตรวจสอบข้อมูลสินค้า
                    </Typography>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <tbody>
                            <tr>
                                <td style={{ fontWeight: "bold", padding: "8px", borderBottom: "1px solid #ddd" }}>ชื่อสินค้า:</td>
                                <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{formData.productName}</td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: "bold", padding: "8px", borderBottom: "1px solid #ddd" }}>รายละเอียด:</td>
                                <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{formData.description}</td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: "bold", padding: "8px", borderBottom: "1px solid #ddd" }}>ราคาต่อชิ้น:</td>
                                <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{formData.price} บาท</td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: "bold", padding: "8px", borderBottom: "1px solid #ddd" }}>จำนวนสินค้า:</td>
                                <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{formData.quantity} ชิ้น</td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: "bold", padding: "8px", borderBottom: "1px solid #ddd" }}>ชื่อล็อต:</td>
                                <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{formData.slot_name}</td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: "bold", padding: "8px", borderBottom: "1px solid #ddd" }}>วันที่เริ่ม:</td>
                                <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>
                                    {formData.start_date ? new Date(formData.start_date).toLocaleDateString('th-TH') : '-'}
                                </td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: "bold", padding: "8px", borderBottom: "1px solid #ddd" }}>วันที่สิ้นสุด:</td>
                                <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>
                                    {formData.end_date ? new Date(formData.end_date).toLocaleDateString('th-TH') : '-'}
                                </td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: "bold", padding: "8px", borderBottom: "1px solid #ddd" }}>ช่องทางการชำระเงิน:</td>
                                <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{formData.paymentMethod}</td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: "bold", padding: "8px", borderBottom: "1px solid #ddd" }}>ชื่อธนาคาร:</td>
                                <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{formData.bankName}</td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: "bold", padding: "8px", borderBottom: "1px solid #ddd" }}>ชื่อบัญชี:</td>
                                <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{formData.accountName}</td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: "bold", padding: "8px", borderBottom: "1px solid #ddd" }}>หมายเลขบัญชี:</td>
                                <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{formData.accountNumber}</td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: "bold", padding: "8px", borderBottom: "1px solid #ddd" }}>หมายเลขพร้อมเพย์:</td>
                                <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{formData.promptpayNumber || '-'}</td>
                            </tr>
                        </tbody>
                    </table>
                    {formData.variants.length > 0 && (
                        <div style={{ marginTop: "20px" }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                                ตัวเลือกสินค้า
                            </Typography>
                            {formData.variants.map((variant, index) => (
                                <div key={index} style={{ marginBottom: "16px", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}>
                                    <Typography variant="body2">ตัวเลือก {index + 1}</Typography>
                                    <Typography variant="body2">สี: {variant.color}</Typography>
                                    <Typography variant="body2">ขนาด: {variant.size}</Typography>
                                    <Typography variant="body2">ราคา: {variant.price} บาท</Typography>
                                    <Typography variant="body2">จำนวน: {variant.quantity} ชิ้น</Typography>
                                    {variant.image && (
                                        <img
                                            src={URL.createObjectURL(variant.image)}
                                            alt={`ตัวเลือก ${index + 1}`}
                                            style={{ maxWidth: "100px", height: "100px", objectFit: "cover", borderRadius: "4px", marginTop: "8px" }}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    {formData.image && (
                        <div style={{ textAlign: "center", marginTop: "20px" }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                                รูปภาพของสินค้า
                            </Typography>
                            <img
                                src={URL.createObjectURL(formData.image)}
                                alt="สินค้าของที่ระลึก"
                                style={{ maxWidth: "100%", height: "200px", objectFit: "cover", borderRadius: "8px" }}
                            />
                        </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
                        <Button onClick={handleClose} variant="outlined" color="secondary">
                            แก้ไข
                        </Button>
                        <Button onClick={handleSubmit} variant="contained" color="primary">
                            ยืนยันเพิ่มสินค้า
                        </Button>
                    </div>
                    {/* </div> */}

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
                        <button className="cancle-button-souvenirRequest" type="button" onClick={handleCancel}>
                            ยกเลิก
                        </button>
                        <button type="button" className="button-souvenirRequest" onClick={handleOpen}>
                            เพิ่มสินค้าของที่ระลึก
                        </button>
                    </div>
                </Box>

            </Modal>
        </div>

        // {/* Modal */}
        // <Modal
        //     open={open}
        //     onClose={handleClose}
        //     aria-labelledby="modal-title"
        //     aria-describedby="modal-description"
        // >
        //     <Box sx={{ ...style, width: 500 }}>
        //         <Typography id="modal-title" variant="h6" sx={{ mb: 2, textAlign: "center" }}>
        //             ตรวจสอบข้อมูลสินค้า
        //         </Typography>
        //         <div style={{ marginBottom: "20px" }}>
        //             <table style={{ width: "100%", borderCollapse: "collapse" }}>
        //                 <tbody>
        //                     <tr>
        //                         <td style={{ fontWeight: "bold", padding: "8px", borderBottom: "1px solid #ddd" }}>ชื่อสินค้า:</td>
        //                         <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{formData.productName}</td>
        //                     </tr>
        //                     <tr>
        //                         <td style={{ fontWeight: "bold", padding: "8px", borderBottom: "1px solid #ddd" }}>รายละเอียด:</td>
        //                         <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{formData.description}</td>
        //                     </tr>
        //                     <tr>
        //                         <td style={{ fontWeight: "bold", padding: "8px", borderBottom: "1px solid #ddd" }}>ราคาต่อชิ้น:</td>
        //                         <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{formData.price} บาท</td>
        //                     </tr>
        //                     <tr>
        //                         <td style={{ fontWeight: "bold", padding: "8px", borderBottom: "1px solid #ddd" }}>จำนวนสินค้า:</td>
        //                         <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{formData.stock} ชิ้น</td>
        //                     </tr>
        //                     <tr>
        //                         <td style={{ fontWeight: "bold", padding: "8px", borderBottom: "1px solid #ddd" }}>ช่องทางการชำระเงิน:</td>
        //                         <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{formData.paymentMethod}</td>
        //                     </tr>
        //                     <tr>
        //                         <td style={{ fontWeight: "bold", padding: "8px", borderBottom: "1px solid #ddd" }}>ชื่อธนาคาร:</td>
        //                         <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{formData.bankName}</td>
        //                     </tr>
        //                     <tr>
        //                         <td style={{ fontWeight: "bold", padding: "8px", borderBottom: "1px solid #ddd" }}>หมายเลขบัญชี:</td>
        //                         <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{formData.accountNumber}</td>
        //                     </tr>
        //                 </tbody>
        //             </table>
        //         </div>

        //         {formData.image && (
        //             <div style={{ textAlign: "center", marginBottom: "20px" }}>
        //                 <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
        //                     รูปภาพของสินค้า
        //                 </Typography>
        //                 <img
        //                     src={URL.createObjectURL(formData.image)}
        //                     alt="สินค้าของที่ระลึก"
        //                     style={{ maxWidth: "100%", height: "200px", objectFit: "cover", borderRadius: "8px" }}
        //                 />
        //             </div>
        //         )}

        //         <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
        //             <Button onClick={handleClose} variant="outlined" color="secondary">
        //                 แก้ไข
        //             </Button>
        //             <Button onClick={handleSubmit} variant="contained" color="primary">
        //                 ยืนยันเพิ่มสินค้า
        //             </Button>
        //         </div>
        //     </Box>
        // </Modal>
    );

}

export default SouvenirRequest;