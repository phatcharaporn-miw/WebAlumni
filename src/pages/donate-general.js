import React, { useState, useEffect, useCallback } from "react";
import "../css/Donate-detail.css";
import { MdOutlinePayment } from "react-icons/md";
import { BiScan } from "react-icons/bi";
import { IoNewspaperOutline, IoReceiptOutline } from "react-icons/io5";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { PiCoinsFill } from "react-icons/pi";
import { FaCheck, FaHeart } from "react-icons/fa";
import { FiCopy } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { RiBankLine } from 'react-icons/ri';
import axios from "axios";
import jsQR from "jsqr";
import Swal from "sweetalert2";
import { HOSTNAME } from "../config";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/jfif"];
const MAX_AMOUNT = 1000000;

function DonationGeneral() {
    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");

    const [userData, setUserData] = useState({});
    const [taxType, setTaxType] = useState("");
    const [showTaxForm, setShowTaxForm] = useState(false);
    const [formData, setFormData] = useState({
        amount: "",
        user_id: userId || "",
        slip: null,
        name: "",
        company_name: "",
        tax_number: "",
        slipText: "",
        phone: "",
        email: "",
        type_tax: "",
        purpose: ""
    });
    const [qrCode, setQrCode] = useState(null);
    const [corporateAddresses, setCorporateAddresses] = useState([]);
    const [addressesOffical, setAddressesOffical] = useState([]);
    const [selectedTaxId, setSelectedTaxId] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [qrGenerating, setQrGenerating] = useState(false);
    const [filePreview, setFilePreview] = useState(null);
    const [promptpayNumber, setPromptpayNumber] = useState("");

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('th-TH').format(amount);
    };

    const validateTaxId = (taxId) => {
        if (!/^\d{13}$/.test(taxId)) return false;
        const digits = taxId.split('').map(Number);
        let sum = 0;
        for (let i = 0; i < 12; i++) {
            sum += digits[i] * (13 - i);
        }
        const checkDigit = (11 - (sum % 11)) % 10;
        return checkDigit === digits[12];
    };

    const validateAmount = useCallback((amount) => {
        const num = parseFloat(amount);
        if (!amount || amount.trim() === "") return "กรุณาระบุจำนวนเงิน";
        if (isNaN(num)) return "กรุณาระบุจำนวนเงินเป็นตัวเลข";
        if (num < 1) return "จำนวนเงินต้องมากกว่า 1 บาท";
        if (num > MAX_AMOUNT) return `จำนวนเงินสูงสุด ${formatCurrency(MAX_AMOUNT)} บาท`;
        return "";
    }, []);

    const validateTaxNumber = useCallback((taxNumber) => {
        if (!taxNumber || taxNumber.trim() === "") return "กรุณาใส่เลขประจำตัวผู้เสียภาษี";
        if (!/^\d{13}$/.test(taxNumber)) return "เลขประจำตัวผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก";
        if (!validateTaxId(taxNumber)) return "เลขประจำตัวผู้เสียภาษีไม่ถูกต้อง";
        return "";
    }, []);

    const validateEmail = useCallback((email) => {
        if (!email) return "";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return "รูปแบบอีเมลไม่ถูกต้อง";
        return "";
    }, []);

    const validatePhone = useCallback((phone) => {
        if (!phone) return "";
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phone)) return "หมายเลขโทรศัพท์ต้องเป็นตัวเลข 10 หลัก";
        return "";
    }, []);

    const validateFile = useCallback((file) => {
        if (!file) return "กรุณาอัปโหลดหลักฐานการชำระเงิน";
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            return "กรุณาเลือกไฟล์ .jpg, .jpeg หรือ .png เท่านั้น";
        }
        if (file.size > MAX_FILE_SIZE) {
            return "ขนาดไฟล์ต้องไม่เกิน 5MB";
        }
        return "";
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        axios.get(HOSTNAME + "/users/profile", { withCredentials: true })
            .then(response => {
                if (response.data.success) {
                    setUserData(response.data.user);
                }
            })
            .catch(err => console.error("profile:", err));

        if (userId) {
            setFormData((prev) => ({
                ...prev,
                user_id: userId,
            }));
        }
    }, [userId]);

    useEffect(() => {
        const fetchPromptpayNumber = async () => {
            try {
                const response = await axios.get(HOSTNAME + "/donate/promptpay-general");
                if (response.data.number_promtpay) {
                    setPromptpayNumber(response.data.number_promtpay);
                }
            } catch (err) {
                console.error("Error fetching promptpay:", err);
            }
        };
        fetchPromptpayNumber();
    }, []);

    useEffect(() => {
        const fetchAddresses = async () => {
            if (!userId) return;
            try {
                const res = await axios.get(HOSTNAME + `/donate/tax_addresses/user/${userId}`);
                setCorporateAddresses(res.data || []);
            } catch (err) {
                console.error("Error fetching addresses:", err);
                setCorporateAddresses([]);
            }
        };
        fetchAddresses();
    }, [userId]);

    useEffect(() => {
        const fetchAddressesOffical = async () => {
            if (!userId) return;
            try {
                const res = await axios.get(HOSTNAME + `/donate/officialAddress`);
                setAddressesOffical(res.data || []);
                console.log("Official Address:", res.data);
            } catch (err) {
                console.error("Error fetching addressesOffical:", err);
                setAddressesOffical([]);
            }
        };
        fetchAddressesOffical();
    }, [userId]);

    const generateQRCode = useCallback(async () => {
        if (!formData.amount || !promptpayNumber) return;

        try {
            setQrGenerating(true);
            const response = await axios.post(HOSTNAME + '/donate/generateQR', {
                amount: parseFloat(formData.amount),
                numberPromtpay: promptpayNumber
            });

            if (response.data.Result) {
                setQrCode(response.data.Result);
                setErrors(prev => ({ ...prev, qr: "" }));
            } else {
                throw new Error("ไม่สามารถสร้าง QR Code ได้");
            }
        } catch (error) {
            console.error('Error generating QR code:', error);
            setErrors(prev => ({ ...prev, qr: "ไม่สามารถสร้าง QR Code ได้ กรุณาลองใหม่อีกครั้ง" }));
            setQrCode(null);
        } finally {
            setQrGenerating(false);
        }
    }, [formData.amount, promptpayNumber]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (formData.amount && !errors.amount && parseFloat(formData.amount) > 0) {
                generateQRCode();
            } else {
                setQrCode(null);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [formData.amount, generateQRCode, errors.amount]);

    const handleShowTaxForm = () => {
        setShowTaxForm(true);
        const defaultType = "individual";
        setTaxType(defaultType);
        setFormData(prev => ({
            ...prev,
            type_tax: defaultType,
            name: prev.fullname || prev.name || "",
            company_name: "",
            tax_number: prev.tax_number || "",
            phone: prev.phone || "",
            email: prev.email || "",
        }));
    };

    const handleTaxTypeChange = (type) => {
        setTaxType(type);
        setFormData(prev => ({
            ...prev,
            type_tax: type,
            name: type === "corporate" ? prev.company_name || "" : prev.fullname || "",
            company_name: type === "corporate" ? prev.company_name || "" : "",
        }));
    };

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }

        let formattedValue = value;
        if (name === "amount") {
            formattedValue = value.replace(/[^0-9.]/g, '');
            const parts = formattedValue.split('.');
            if (parts.length > 2) {
                formattedValue = parts[0] + '.' + parts.slice(1).join('');
            }
        } else if (name === "tax_number" || name === "phone") {
            formattedValue = value.replace(/[^0-9]/g, '');
        }

        setFormData(prev => ({
            ...prev,
            [name]: formattedValue,
        }));

        if (name === "amount") {
            const amountError = validateAmount(formattedValue);
            if (amountError) setErrors(prev => ({ ...prev, amount: amountError }));
        } else if (name === "tax_number" && showTaxForm) {
            const taxError = validateTaxNumber(formattedValue);
            if (taxError && formattedValue.length === 13) setErrors(prev => ({ ...prev, tax_number: taxError }));
        } else if (name === "email") {
            const emailError = validateEmail(formattedValue);
            if (emailError) setErrors(prev => ({ ...prev, email: emailError }));
        } else if (name === "phone") {
            const phoneError = validatePhone(formattedValue);
            if (phoneError && formattedValue.length === 10) setErrors(prev => ({ ...prev, phone: phoneError }));
        } else if (name === "company_name") {
            if (!formattedValue.trim()) {
                setErrors(prev => ({ ...prev, company_name: "กรุณากรอกชื่อบริษัท" }));
            }
        }
    }, [errors, showTaxForm, validateAmount, validateTaxNumber, validateEmail, validatePhone]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        const fileError = validateFile(selectedFile);
        if (fileError) {
            setErrors(prev => ({ ...prev, file: fileError }));
            return;
        }

        setErrors(prev => ({ ...prev, file: "" }));
        setFormData(prev => ({ ...prev, slipText: "" }));

        const reader = new FileReader();
        reader.onload = (event) => {
            setFilePreview(event.target.result);
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;
                const ratio = Math.min(MAX_WIDTH / img.width, MAX_HEIGHT / img.height, 1);
                canvas.width = img.width * ratio;
                canvas.height = img.height * ratio;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

                let code;
                try {
                    code = jsQR(imageData.data, imageData.width, imageData.height);
                } catch (err) {
                    console.error("QR detection failed", err);
                }

                if (!code) {
                    Swal.fire("ไม่พบ QR Code", "กรุณาตรวจสอบไฟล์อีกครั้ง", "error");
                    setFormData(prev => ({ ...prev, slipText: "", file: null }));
                    return;
                }

                setFormData(prev => ({ ...prev, file: selectedFile, slipText: code.data }));
                Swal.fire("พบ QR Code", "พบ QR Code ในไฟล์ที่อัปโหลดแล้ว", "success");
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(selectedFile);
    };

    const handleTaxAddressChange = useCallback((e) => {
        const taxId = e.target.value;
        setSelectedTaxId(taxId);

        if (taxId) {
            const selected = corporateAddresses.find(addr => addr.tax_id === parseInt(taxId));
            if (selected) {
                setFormData(prev => ({
                    ...prev,
                    type_tax: "corporate",
                    company_name: selected.name || "",
                    name: selected.name || "",
                    tax_number: selected.tax_number || "",
                    phone: selected.phone || "",
                    email: selected.email || "",
                    useExistingTax: true,
                    taxId: selected.tax_id,
                    tax_status: "requested"
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                company_name: "",
                name: "",
                tax_number: "",
                phone: "",
                email: "",
                useExistingTax: false,
                taxId: null
            }));
        }
    }, [corporateAddresses]);

    const validateForm = () => {
        let newErrors = {};

        if (!formData.amount) newErrors.amount = "กรุณากรอกจำนวนเงิน";
        if (!formData.file) newErrors.file = "กรุณาอัปโหลดหลักฐานการโอนเงิน";
        if (!formData.purpose || !formData.purpose.trim()) newErrors.purpose = "กรุณากรอกวัตถุประสงค์";

        if (showTaxForm) {
            if (taxType === "individual") {
                if (!formData.name) formData.name = userData.full_name || "";
                if (!formData.tax_number || formData.tax_number.length !== 13) {
                    newErrors.tax_number = "กรุณากรอกเลขบัตรประชาชนให้ครบ 13 หลัก";
                }
                if (!formData.phone || formData.phone.length !== 10) {
                    newErrors.phone = "กรุณากรอกหมายเลขโทรศัพท์ให้ถูกต้อง";
                }
                if (!formData.email) newErrors.email = "กรุณากรอกอีเมล";
            } else if (taxType === "corporate") {
                if (!formData.company_name) newErrors.company_name = "กรุณากรอกชื่อบริษัท";
                if (!formData.tax_number || formData.tax_number.length !== 13) {
                    newErrors.tax_number = "กรุณากรอกเลขประจำตัวผู้เสียภาษีให้ครบ 13 หลัก";
                }
                if (!formData.phone || formData.phone.length !== 10) {
                    newErrors.phone = "กรุณากรอกหมายเลขโทรศัพท์ให้ถูกต้อง";
                }
                if (!formData.email) newErrors.email = "กรุณากรอกอีเมล";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userId) {
            Swal.fire("กรุณาเข้าสู่ระบบ", "กรุณาเข้าสู่ระบบก่อนทำการบริจาค", "warning");
            navigate("/login");
            return;
        }

        if (submitting) return;
        if (!validateForm()) return;

        setSubmitting(true);

        try {
            const submitFormData = new FormData();
            submitFormData.append("userId", userId);
            submitFormData.append("amount", formData.amount);
            submitFormData.append("projectId", ""); // ไม่มีโครงการ
            submitFormData.append("purpose", formData.purpose);
            submitFormData.append("slip", formData.file);
            submitFormData.append("useTax", showTaxForm ? "1" : "0");

            if (showTaxForm) {
                submitFormData.append("type_tax", formData.type_tax);
                submitFormData.append("name", formData.type_tax === "corporate" ? formData.company_name : formData.name);
                submitFormData.append("tax_number", formData.tax_number);
                submitFormData.append("phone", formData.phone);
                submitFormData.append("email", formData.email);
                if (formData.useExistingTax) {
                    submitFormData.append("useExistingTax", "1");
                    submitFormData.append("taxId", formData.taxId);
                } else {
                    submitFormData.append("useExistingTax", "0");
                }
            }

            const response = await axios.post(HOSTNAME + "/donate/donation", submitFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                Swal.fire({
                    title: "บริจาคสำเร็จ!",
                    text: "ขอบคุณสำหรับการสนับสนุน",
                    icon: "success",
                    confirmButtonText: "ตกลง"
                }).then(() => {
                    navigate("/donate");
                });
            }
        } catch (error) {
            console.error("Error submitting donation:", error);
            Swal.fire({
                title: "เกิดข้อผิดพลาด",
                text: error.response?.data?.message || "ไม่สามารถบันทึกการบริจาคได้ กรุณาลองใหม่อีกครั้ง",
                icon: "error",
                confirmButtonText: "ตกลง"
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="donate-detail-content">
            <div className="donate-detail-content-item">
                <div className="general-donation-header">
                    {/* <FaHeart className="heart-icon-large" /> */}
                    <h3 className="fw-bold">บริจาคทั่วไป</h3>
                    <p className="text-muted">สนับสนุนสมาคมศิษย์เก่าวิทยาลัยการคอมพิวเตอร์โดยตรง ไม่ผ่านโครงการเฉพาะ</p>
                </div>

                <div className="general-donation-info">
                    <h6 className="text-muted">ทำไมต้องบริจาคทั่วไป?</h6>
                    <ul className="text-muted">
                        <li>สนับสนุนการดำเนินงานของสมาคมโดยรวม</li>
                        <li>ช่วยให้องค์กรมีความยืดหยุ่นในการใช้งบประมาณ</li>
                        <li>ได้รับใบเสร็จรับเงินและสามารถขอใบกำกับภาษีได้</li>
                        <li>สร้างความยั่งยืนให้กับสมาคม</li>
                    </ul>
                </div>
            </div>

            <div className="donate-detail-content-item">
                <form onSubmit={handleSubmit} noValidate>
                    <div className="donate-detail-form-items">
                        <label className="donate-detail-form-titleLabel" htmlFor="amount">
                            <PiCoinsFill className="custom-icon" />ระบุจำนวนเงิน<span className="asterisk">*</span>
                        </label>
                        <input
                            className={`styled-input ${errors.amount ? "error" : ""}`}
                            type="text"
                            name="amount"
                            value={formData.amount}
                            onChange={handleInputChange}
                            placeholder="กรอกจำนวน เช่น 1000"
                            required
                            autoComplete="off"
                        />
                        {errors.amount && <span className="error-message">{errors.amount}</span>}

                        <div className="quick-amount-buttons">
                            {[100, 500, 1000, 5000].map((amt) => (
                                <button
                                    className="quick-amount-btn"
                                    key={amt}
                                    type="button"
                                    onClick={() =>
                                        setFormData((prev) => ({ ...prev, amount: amt.toString() }))
                                    }
                                >
                                    {amt.toLocaleString()} บาท
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="donate-detail-form-items">
                        <label className="donate-detail-form-titleLabel" htmlFor="purpose">
                            วัตถุประสงค์การบริจาค<span className="asterisk">*</span>
                        </label>
                        <textarea
                            className={`styled-input ${errors.purpose ? "error" : ""}`}
                            name="purpose"
                            value={formData.purpose}
                            onChange={handleInputChange}
                            placeholder="เช่น เพื่อสนับสนุนการศึกษา, ทำบุญวันเกิด, บริจาคทั่วไป"
                            rows="3"
                            required
                        />
                        {errors.purpose && <span className="error-message">{errors.purpose}</span>}
                    </div>

                    {/* <div className="donate-detail-form-items">
                        <label><MdOutlinePayment className="custom-icon" />ช่องทางการชำระเงิน</label>
                        <div className="group-promptPay-layout">
                            <div className="title-promptPay-layout">
                                <p><BiScan className="custom-icon" /> QR PromptPay</p>
                            </div>
                            <div className="promptPay-layout">
                                {qrGenerating ? (
                                    <div className="qr-loading">
                                        <AiOutlineLoading3Quarters className="loading-spinner" />
                                        <p>กำลังสร้าง QR Code...</p>
                                    </div>
                                ) : qrCode ? (
                                    <div className="qr-container">
                                        <img
                                            src={qrCode}
                                            alt="QR Code สำหรับการชำระเงิน"
                                            style={{ width: "200px", height: "200px", objectFit: "contain" }}
                                        />
                                        <p className="qr-amount">จำนวน: {formatCurrency(parseFloat(formData.amount || 0))} บาท</p>
                                        <a href={qrCode}
                                            download={`PromptPay_General_${formData.amount || 0}Baht.png`}
                                            className="download-qr-btn"
                                        > ดาวน์โหลด QR Code </a>
                                    </div>
                                ) : formData.amount && !errors.amount && parseFloat(formData.amount) > 0 ? (
                                    <p>กรุณารอสักครู่...</p>
                                ) : (
                                    <p>กรอกจำนวนเงินเพื่อสร้าง QR Code</p>
                                )}
                                {errors.qr && <span className="error-message">{errors.qr}</span>}
                            </div>
                        </div>
                    </div> */}

                    <div className="donate-detail-form-items">
                        <label className="flex items-center gap-2 text-lg font-semibold mb-3">
                            <MdOutlinePayment className="custom-icon text-blue-600" />
                            ช่องทางการชำระเงิน
                        </label>

                        {/*ข้อมูลบัญชีธนาคาร*/}
                        <div className="bank-info-container bg-gray-50 rounded-2xl p-4 shadow-sm border border-gray-200">
                            <div className="title-bank-layout mb-3 flex items-center gap-2">
                                <RiBankLine />
                                <p className="text-base mb-0">ข้อมูลบัญชีธนาคาร</p>
                            </div>

                            <div className="bank-info-content flex flex-col gap-3 ">
                                <div className="bank-info-line flex flex-col sm:flex-row sm:items-center justify-between bg-white rounded-xl p-3 ">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <strong>ชื่อบัญชี: </strong>
                                        <span className="font-medium">{addressesOffical[0]?.account_name || "-"}</span>
                                    </div>
                                </div>

                                {addressesOffical[0]?.bank_name && (
                                    <div className="bank-info-line flex flex-col sm:flex-row sm:items-center justify-between bg-white rounded-xl p-3 ">
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <strong>ธนาคาร: </strong>
                                            <span className="font-medium">{addressesOffical[0].bank_name}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="bank-info-line flex flex-col sm:flex-row sm:items-center justify-between bg-white rounded-xl p-3  justify-between">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <strong>เลขบัญชี: </strong>
                                        <span className="font-medium">{addressesOffical[0]?.account_number || "-"}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigator.clipboard.writeText(addressesOffical[0]?.account_number || "")
                                        }
                                        className="copy-btn flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition"
                                    >
                                        <FiCopy className="text-base" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="donate-detail-form-items">
                        <label htmlFor="slip"><IoReceiptOutline className="custom-icon" />หลักฐานการชำระเงิน<span className="asterisk">*</span></label>
                        <input
                            className={`styled-input ${errors.file ? 'error' : ''}`}
                            type="file"
                            name="slip"
                            id="slip"
                            onChange={handleFileChange}
                            accept=".jpg, .jpeg, .png, .jfif"
                            required
                        />
                        {errors.file && <span className="error-message">{errors.file}</span>}
                        {filePreview && (
                            <div className="file-preview">
                                <img
                                    src={filePreview}
                                    alt="ตัวอย่างไฟล์"
                                    style={{
                                        maxWidth: "200px",
                                        maxHeight: "200px",
                                        objectFit: "contain",
                                        cursor: "zoom-in",
                                        transition: "transform 0.3s",
                                    }}
                                    onClick={(e) => {
                                        const img = e.currentTarget;
                                        if (img.style.transform === "scale(2)") {
                                            img.style.transform = "scale(1)";
                                            img.style.cursor = "zoom-in";
                                        } else {
                                            img.style.transform = "scale(2)";
                                            img.style.cursor = "zoom-out";
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Tax Receipt Section */}
                    <div className="donate-detail-form-items">
                        <label><IoNewspaperOutline className="custom-icon" />ใบกำกับภาษี</label>
                        <div className="tax-options">
                            <div className="tax-type-options">
                                <label className="radio-option-bt">
                                    <input
                                        type="radio"
                                        name="taxOption"
                                        value="no"
                                        onChange={() => {
                                            setShowTaxForm(false);
                                            setTaxType("");
                                            setFormData(prev => ({
                                                ...prev,
                                                name: "",
                                                company_name: "",
                                                tax_number: "",
                                                phone: "",
                                                email: "",
                                            }));
                                        }}
                                        checked={!showTaxForm}
                                    />
                                    ไม่ต้องการ
                                </label>
                                <label className="radio-option-bt">
                                    <input
                                        type="radio"
                                        name="taxOption"
                                        value="yes"
                                        onChange={handleShowTaxForm}
                                        checked={showTaxForm}
                                    />
                                    ต้องการ
                                </label>
                            </div>
                        </div>

                        {showTaxForm && (
                            <div className="donate-detail-tax-form">
                                <div className="tax-type-options-btn">
                                    <button
                                        type="button"
                                        className={`tax-btn ${taxType === "individual" ? "active" : ""}`}
                                        onClick={() => handleTaxTypeChange("individual")}
                                    >บุคคลธรรมดา
                                    </button>
                                    <button
                                        type="button"
                                        className={`tax-btn ${taxType === "corporate" ? "active" : ""}`}
                                        onClick={() => handleTaxTypeChange("corporate")}
                                    >นิติบุคคล
                                    </button>
                                </div>

                                <div className="tax-input-fields">
                                    {taxType === "individual" ? (
                                        <>
                                            <div className="group-input-fields">
                                                <div className="input-group">
                                                    <label>ชื่อ-นามสกุล<span className="asterisk">*</span></label>
                                                    <input
                                                        className={`styled-inputTax ${errors.name ? "error" : ""}`}
                                                        type="text"
                                                        name="name"
                                                        value={userData.full_name}
                                                        onChange={handleInputChange}
                                                        readOnly
                                                    />
                                                    {errors.name && (
                                                        <span className="error-message">{errors.name}</span>
                                                    )}
                                                </div>
                                                <div className="input-group">
                                                    <label>เลขบัตรประชาชน (13 หลัก)<span className="asterisk">*</span></label>
                                                    <input
                                                        className={`styled-inputTax ${errors.tax_number ? "error" : ""}`}
                                                        type="text"
                                                        name="tax_number"
                                                        value={formData.tax_number}
                                                        onChange={handleInputChange}
                                                        placeholder="เลขบัตรประชาชน"
                                                        maxLength="13"
                                                        pattern="\d{13}"
                                                        required
                                                    />
                                                    {errors.tax_number && (
                                                        <span className="error-message">{errors.tax_number}</span>
                                                    )}
                                                    {formData.tax_number &&
                                                        formData.tax_number.length === 13 &&
                                                        !errors.tax_number && (
                                                            <span className="success-message">
                                                                <FaCheck /> เลขถูกต้อง
                                                            </span>
                                                        )}
                                                </div>
                                                <div className="input-group">
                                                    <label>หมายเลขโทรศัพท์ (10 หลัก)<span className="asterisk">*</span></label>
                                                    <input
                                                        className={`styled-inputTax ${errors.phone ? "error" : ""}`}
                                                        type="text"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleInputChange}
                                                        placeholder="หมายเลขโทรศัพท์ (10 หลัก)"
                                                        maxLength="10"
                                                        required
                                                    />
                                                    {errors.phone && (
                                                        <span className="error-message">{errors.phone}</span>
                                                    )}
                                                </div>
                                                <div className="input-group">
                                                    <label>อีเมล<span className="asterisk">*</span></label>
                                                    <input
                                                        className={`styled-inputTax ${errors.email ? "error" : ""}`}
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleInputChange}
                                                        placeholder="อีเมล"
                                                        required
                                                    />
                                                    {errors.email && (
                                                        <span className="error-message">{errors.email}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="input-group w-100">
                                                {corporateAddresses.length > 0 && (
                                                    <div className="saved-addresses w-100">
                                                        <label htmlFor="saved-address">เลือกที่อยู่ที่เคยบันทึก</label>
                                                        <select
                                                            id="saved-address"
                                                            className="styled-select w-100"
                                                            onChange={handleTaxAddressChange}
                                                            value={selectedTaxId}
                                                            style={{ width: '100%' }}
                                                        >
                                                            <option value="">-- เลือกที่อยู่ที่เคยบันทึก --</option>
                                                            {corporateAddresses.map(addr => (
                                                                <option key={addr.tax_id} value={addr.tax_id}>
                                                                    {addr.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="input-group">
                                                <label>ชื่อบริษัท/นิติบุคคล<span className="asterisk">*</span></label>
                                                <input
                                                    className={`styled-inputTax ${errors.company_name ? "error" : ""}`}
                                                    type="text"
                                                    name="company_name"
                                                    value={formData.company_name}
                                                    onChange={handleInputChange}
                                                    readOnly={selectedTaxId !== ""}
                                                    placeholder="ชื่อบริษัท/นิติบุคคล"
                                                />
                                                {errors.company_name && (
                                                    <span className="error-message">{errors.company_name}</span>
                                                )}
                                            </div>
                                            <div className="input-group">
                                                <label>เลขประจำตัวผู้เสียภาษี (13 หลัก)<span className="asterisk">*</span></label>
                                                <input
                                                    className={`styled-inputTax ${errors.tax_number ? "error" : ""}`}
                                                    type="text"
                                                    name="tax_number"
                                                    value={formData.tax_number}
                                                    onChange={handleInputChange}
                                                    placeholder="เลขประจำตัวผู้เสียภาษี"
                                                    maxLength="13"
                                                    pattern="\d{13}"
                                                    required
                                                />
                                                {errors.tax_number && (
                                                    <span className="error-message">{errors.tax_number}</span>
                                                )}
                                                {formData.tax_number &&
                                                    formData.tax_number.length === 13 &&
                                                    !errors.tax_number && (
                                                        <span className="success-message">
                                                            <FaCheck /> เลขถูกต้อง
                                                        </span>
                                                    )}
                                            </div>
                                            <div className="input-group">
                                                <label>หมายเลขโทรศัพท์ (10 หลัก)<span className="asterisk">*</span></label>
                                                <input
                                                    className={`styled-inputTax ${errors.phone ? "error" : ""}`}
                                                    type="text"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    placeholder="หมายเลขโทรศัพท์ (10 หลัก)"
                                                    maxLength="10"
                                                    required
                                                />
                                                {errors.phone && (
                                                    <span className="error-message">{errors.phone}</span>
                                                )}
                                            </div>
                                            <div className="input-group">
                                                <label>อีเมล<span className="asterisk">*</span></label>
                                                <input
                                                    className={`styled-inputTax ${errors.email ? "error" : ""}`}
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    placeholder="อีเมล"
                                                    required
                                                />
                                                {errors.email && (
                                                    <span className="error-message">{errors.email}</span>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="form-group-btn">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="cancel-donate-bt"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            className="donate-bt"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <AiOutlineLoading3Quarters className="loading-spinner" />
                                    กำลังดำเนินการ...
                                </>
                            ) : (
                                "ดำเนินการบริจาค"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default DonationGeneral;