import React, { useState, useEffect, useCallback, useMemo } from "react";
import "../css/Donate-detail.css";
import { MdDateRange } from "react-icons/md";
import { ImUser } from "react-icons/im";
import { BiScan } from "react-icons/bi";
import { IoInformationCircleOutline } from "react-icons/io5";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaCheck, FaExclamationTriangle, FaTimes, FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import jsQR from "jsqr";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/jpg"];
const MAX_AMOUNT = 1000000;
const QR_DEBOUNCE_DELAY = 500;

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('th-TH').format(amount);
};

const formatDate = (date, locale = 'th-TH') => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString(locale, options);
};

const calculateDaysRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
};

const validateTaxId = (taxId) => {
    if (!/^\d{13}$/.test(taxId)) return false;

    // Thai tax ID checksum validation
    const digits = taxId.split('').map(Number);
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        sum += digits[i] * (13 - i);
    }
    const checkDigit = (11 - (sum % 11)) % 10;
    return checkDigit === digits[12];
};

function DonateDetail() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");
    const userRole = localStorage.getItem("userRole");

    // State management
    const [projectData, setProjectData] = useState({});
    const [showTaxForm, setShowTaxForm] = useState(false);
    const [formData, setFormData] = useState({
        amount: "",
        user_id: "",
        project_id: "",
        file: null,
        name: "",
        address: "",
        tax_number: "",
        slipText: "",
        phone: "",
        email: ""
    });
    const [qrCode, setQrCode] = useState(null);
    const [ocrLoading, setOcrLoading] = useState(false);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedTaxId, setSelectedTaxId] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [qrGenerating, setQrGenerating] = useState(false);
    const [filePreview, setFilePreview] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [showTaxPreview, setShowTaxPreview] = useState(false);
    const [networkError, setNetworkError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    // Enhanced validation functions
    const validateAmount = useCallback((amount) => {
        const num = parseFloat(amount);
        if (!amount || amount.trim() === "") return "กรุณาระบุจำนวนเงิน";
        if (isNaN(num)) return "กรุณาระบุจำนวนเงินเป็นตัวเลข";
        if (num <= 0) return "จำนวนเงินต้องมากกว่า 0";
        if (num > MAX_AMOUNT) return `จำนวนเงินสูงสุด ${formatCurrency(MAX_AMOUNT)} บาท`;
        if (num < 1) return "จำนวนเงินขั้นต่ำ 1 บาท";
        return "";
    }, []);

    const validateTaxNumber = useCallback((taxNumber) => {
        if (!taxNumber || taxNumber.trim() === "") return "กรุณาใส่เลขประจำตัวผู้เสียภาษี";
        if (!/^\d{13}$/.test(taxNumber)) return "เลขประจำตัวผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก";
        if (!validateTaxId(taxNumber)) return "เลขประจำตัวผู้เสียภาษีไม่ถูกต้อง";
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

    // API functions with retry logic
    const apiCall = useCallback(async (url, options = {}, retries = 3) => {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await axios({
                    url: `${API_BASE_URL}${url}`,
                    timeout: 10000,
                    ...options
                });
                setNetworkError(false);
                return response;
            } catch (error) {
                if (i === retries - 1) {
                    setNetworkError(true);
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
    }, []);

    // Load project data with error handling
    useEffect(() => {
        const loadProjectData = async () => {
            if (!projectId) {
                setErrors(prev => ({ ...prev, project: "ไม่พบรหัสโครงการ" }));
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setNetworkError(false);
                const response = await apiCall(`/donate/donatedetail/${projectId}`);

                if (!response.data) {
                    throw new Error("ไม่พบข้อมูลโครงการ");
                }

                setProjectData(response.data);
                setErrors(prev => ({ ...prev, project: "" }));
            } catch (error) {
                console.error("Error loading project:", error);
                const errorMessage = error.response?.status === 404
                    ? "ไม่พบโครงการที่ระบุ"
                    : "เกิดข้อผิดพลาดในการโหลดข้อมูลโครงการ";
                setErrors(prev => ({ ...prev, project: errorMessage }));
            } finally {
                setLoading(false);
            }
        };

        loadProjectData();
    }, [projectId, apiCall, retryCount]);

    // Authentication check
    useEffect(() => {
        if (!userId) {
            const timer = setTimeout(() => {
                alert("กรุณาเข้าสู่ระบบก่อนทำการบริจาค");
                navigate("/login");
            }, 1000);
            return () => clearTimeout(timer);
        }

        setFormData(prevFormData => ({
            ...prevFormData,
            user_id: userId,
            project_id: projectId
        }));
    }, [userId, projectId, navigate]);

    // Load saved addresses
    useEffect(() => {
        const loadSavedAddresses = async () => {
            if (!userId) return;

            try {
                const response = await apiCall(`/donate/tax_addresses/user/${userId}`);
                setSavedAddresses(response.data || []);
            } catch (error) {
                console.error("Error loading tax addresses:", error);
                setSavedAddresses([]);
            }
        };

        loadSavedAddresses();
    }, [userId, apiCall]);

    // Enhanced QR Code generation with caching
    const qrCache = useMemo(() => new Map(), []);

    const generateQRCode = useCallback(async () => {
        if (!formData.amount || !projectData.number_promtpay) return;

        const cacheKey = `${formData.amount}-${projectData.number_promtpay}`;
        if (qrCache.has(cacheKey)) {
            setQrCode(qrCache.get(cacheKey));
            return;
        }

        try {
            setQrGenerating(true);
            const response = await apiCall('/donate/generateQR', {
                method: 'POST',
                data: {
                    amount: parseFloat(formData.amount),
                    numberPromtpay: projectData.number_promtpay
                }
            });

            if (response.data.Result) {
                qrCache.set(cacheKey, response.data.Result);
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
    }, [formData.amount, projectData.number_promtpay, apiCall, qrCache]);

    // Debounced QR generation
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (formData.amount && !errors.amount && parseFloat(formData.amount) > 0) {
                generateQRCode();
            } else {
                setQrCode(null);
            }
        }, QR_DEBOUNCE_DELAY);

        return () => clearTimeout(timeoutId);
    }, [formData.amount, generateQRCode, errors.amount]);

    // Enhanced input change handler
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;

        // Clear previous errors for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }

        // Format specific inputs
        let formattedValue = value;
        if (name === "amount") {
            // Remove non-numeric characters except decimal point
            formattedValue = value.replace(/[^0-9.]/g, '');
            // Ensure only one decimal point
            const parts = formattedValue.split('.');
            if (parts.length > 2) {
                formattedValue = parts[0] + '.' + parts.slice(1).join('');
            }
        } else if (name === "tax_number" || name === "phone") {
            // Only allow numbers
            formattedValue = value.replace(/[^0-9]/g, '');
        }

        setFormData(prev => ({
            ...prev,
            [name]: formattedValue,
        }));

        // Real-time validation
        if (name === "amount") {
            const amountError = validateAmount(formattedValue);
            if (amountError) {
                setErrors(prev => ({ ...prev, amount: amountError }));
            }
        } else if (name === "tax_number" && showTaxForm) {
            const taxError = validateTaxNumber(formattedValue);
            if (taxError && formattedValue.length === 13) {
                setErrors(prev => ({ ...prev, tax_number: taxError }));
            }
        } else if (name === "email") {
            const emailError = validateEmail(formattedValue);
            if (emailError) {
                setErrors(prev => ({ ...prev, email: emailError }));
            }
        } else if (name === "phone") {
            const phoneError = validatePhone(formattedValue);
            if (phoneError && formattedValue.length === 10) {
                setErrors(prev => ({ ...prev, phone: phoneError }));
            }
        }
    }, [errors, showTaxForm, validateAmount, validateTaxNumber, validateEmail, validatePhone]);

    // Enhanced file handling with better preview and validation
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) {
            setFormData(prev => ({ ...prev, file: null, slipText: "" }));
            setFilePreview(null);
            return;
        }

        const fileError = validateFile(file);
        if (fileError) {
            setErrors(prev => ({ ...prev, file: fileError }));
            setFilePreview(null);
            return;
        }

        setErrors(prev => ({ ...prev, file: "" }));
        setFormData(prev => ({
            ...prev,
            file: file,
            slipText: ""
        }));

        // Create file preview
        try {
            const reader = new FileReader();
            reader.onload = (event) => {
                setFilePreview(event.target.result);
            };
            reader.onerror = () => {
                setErrors(prev => ({ ...prev, file: "ไม่สามารถอ่านไฟล์ได้" }));
            };
            reader.readAsDataURL(file);

            // QR Code detection with better error handling
            const qrReader = new FileReader();
            qrReader.onload = (event) => {
                try {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.getElementById("canvas");
                        if (!canvas) return;

                        const ctx = canvas.getContext("2d");
                        canvas.width = img.width;
                        canvas.height = img.height;
                        ctx.drawImage(img, 0, 0);

                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        const code = jsQR(imageData.data, imageData.width, imageData.height);

                        if (code) {
                            console.log("QR Code Detected:", code.data);
                            // Could implement QR validation logic here
                        }
                    };
                    img.onerror = () => {
                        console.warn("Could not process image for QR detection");
                    };
                    img.src = event.target.result;
                } catch (error) {
                    console.warn("QR detection failed:", error);
                }
            };
            qrReader.readAsDataURL(file);
        } catch (error) {
            console.error("File processing failed:", error);
            setErrors(prev => ({ ...prev, file: "ไม่สามารถประมวลผลไฟล์ได้" }));
        }
    };

    const handleTaxOptionChange = (e) => {
        const selected = e.target.value;
        if (selected === "yes") {
            setShowTaxForm(true);
        } else {
            setShowTaxForm(false);
            setSelectedTaxId("");
            setFormData({
                name: "",
                address: "",
                tax_number: "",
                phone: "",
                email: ""
            });
        }
    };
    const getFilterTitle = (usersType) => {
        switch (Number(usersType)) {
            case 1: return "แอดมิน";
            case 2: return "นายกสมาคม";
            case 3: return "ศิษย์เก่า";
            case 4: return "ศิษย์ปัจจุบัน";
            default: return "ไม่พบผู้ใช้";
        }
    };

    const handleTaxAddressChange = useCallback((e) => {
        const taxId = e.target.value;
        setSelectedTaxId(taxId);
        setEditMode(false);

        if (taxId !== "") {
            const selected = savedAddresses.find(addr => addr.tax_id === parseInt(taxId));
            if (selected) {
                setFormData(prev => ({
                    ...prev,
                    name: selected.name || "",
                    address: selected.address || "",
                    tax_number: selected.tax_number || "",
                    phone: selected.phone || "",
                    email: selected.email || ""
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                name: "",
                address: "",
                tax_number: "",
                phone: "",
                email: ""
            }));
        }
    }, [savedAddresses]);

    // Enhanced form validation
    const validateForm = useCallback(() => {
        const newErrors = {};

        const amountError = validateAmount(formData.amount);
        if (amountError) newErrors.amount = amountError;

        const fileError = validateFile(formData.file);
        if (fileError) newErrors.file = fileError;

        if (showTaxForm) {
            if (!formData.name.trim()) newErrors.name = "กรุณาใส่ชื่อ";
            if (!formData.address.trim()) newErrors.address = "กรุณาใส่ที่อยู่";

            const taxError = validateTaxNumber(formData.tax_number);
            if (taxError) newErrors.tax_number = taxError;

            if (formData.email) {
                const emailError = validateEmail(formData.email);
                if (emailError) newErrors.email = emailError;
            }

            if (formData.phone) {
                const phoneError = validatePhone(formData.phone);
                if (phoneError) newErrors.phone = phoneError;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData, showTaxForm, validateAmount, validateFile, validateTaxNumber, validateEmail, validatePhone]);

    // Enhanced form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (submitting) return;

        if (ocrLoading) {
            alert("กำลังประมวลผลข้อความจากรูปภาพ กรุณารอสักครู่");
            return;
        }

        if (!validateForm()) {
            const firstError = Object.keys(errors)[0];
            if (firstError) {
                const errorElement = document.querySelector(`[name="${firstError}"]`);
                errorElement?.focus();
            }
            return;
        }

        // Check project status
        const now = new Date();
        const endDate = projectData?.end_date ? new Date(projectData.end_date) : null;
        const startDate = projectData?.start_date ? new Date(projectData.start_date) : null;

        if (startDate && now < startDate) {
            alert("โครงการยังไม่เริ่ม");
            return;
        }

        if (endDate && now > endDate) {
            alert("โครงการนี้ได้สิ้นสุดแล้ว ไม่สามารถบริจาคได้");
            return;
        }

        setSubmitting(true);

        try {
            const formDataWithOCR = {
                ...formData,
                ocrText: formData.slipText || "",
                project_id: projectId,
                timestamp: new Date().toISOString()
            };

            // Navigate to confirmation page
            navigate(`/donate/donatedetail/donateconfirm/${projectId}`, {
                state: {
                    formData: formDataWithOCR,
                    projectId,
                    showTaxForm,
                    projectData
                }
            });
        } catch (error) {
            console.error("Error preparing submission:", error);
            alert("เกิดข้อผิดพลาดในการเตรียมข้อมูล กรุณาลองใหม่อีกครั้ง");
        } finally {
            setSubmitting(false);
        }
    };

    // Calculate project status and dates
    const projectStatus = useMemo(() => {
        if (!projectData.start_date || !projectData.end_date) return { status: 'unknown' };

        const now = new Date();
        const startDate = new Date(projectData.start_date);
        const endDate = new Date(projectData.end_date);

        const formattedStartDate = formatDate(startDate);
        const formattedEndDate = formatDate(endDate);
        const countDay = calculateDaysRemaining(endDate);

        const progress = projectData.target_amount && projectData.target_amount > 0
            ? Math.min((projectData.current_amount / projectData.target_amount) * 100, 100)
            : 0;

        const isProjectActive = now >= startDate && now <= endDate;
        const isProjectUpcoming = now < startDate;
        const isProjectExpired = now > endDate;

        return {
            isProjectActive,
            isProjectUpcoming,
            isProjectExpired,
            formattedStartDate,
            formattedEndDate,
            countDay: Math.max(countDay, 0),
            progress,
            status: isProjectExpired ? 'expired' : isProjectUpcoming ? 'upcoming' : 'active'
        };
    }, [projectData]);

    // Loading state
    if (loading) {
        return (
            <div className="donate-detail-loading">
                <AiOutlineLoading3Quarters className="loading-spinner" />
                <p>กำลังโหลดข้อมูลโครงการ...</p>
            </div>
        );
    }

    // Error state with retry option
    if (errors.project) {
        return (
            <div className="donate-detail-error">
                <FaExclamationTriangle className="error-icon" />
                <p>{errors.project}</p>
                {networkError && (
                    <p className="network-error">ตรวจสอบการเชื่อมต่ออินเทอร์เน็ตและลองใหม่</p>
                )}
                <button
                    onClick={() => setRetryCount(prev => prev + 1)}
                    className="retry-button"
                >
                    ลองใหม่
                </button>
            </div>
        );
    }

    return (
        <div className="donate-detail-content">
            <div className="donate-detail-content-item">
                <h5>{projectData.project_name}</h5>
                <img
                    src={`${API_BASE_URL}/uploads/${projectData.image_path}`}
                    alt="กิจกรรม"
                    onError={(e) => {
                        e.target.src = `${process.env.PUBLIC_URL}/image/default.png`;
                    }}
                    loading="lazy"
                />

                <div className="donate-detail-progress">
                    {projectData.target_amount && projectData.target_amount > 0
                        ? `${projectStatus.progress.toFixed(1)}%`
                        : ""}
                </div>

                <div className="bar">
                    {(projectData.donation_type !== "unlimited" && projectData.donation_type !== "things") && (
                        <div className="progress-bar-container">
                            <div
                                className="progress-bar"
                                style={{ width: `${Math.min(projectStatus.progress, 100)}%` }}
                            >
                                <span className="progress-percent">
                                    {`${Math.min(projectStatus.progress, 100).toFixed(0)}%`}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="donate-detail-details">
                    <span>ยอดบริจาคปัจจุบัน: {formatCurrency(projectData.current_amount || 0)} บาท</span>
                    {projectData.target_amount > 0 && (
                        <span>เป้าหมาย: {formatCurrency(projectData.target_amount)} บาท</span>
                    )}
                </div>

                <div className="donate-detail-discription-day">
                    {projectStatus.isProjectUpcoming ? (
                        <span className="upcoming">
                            กำลังจะมาถึงในอีก {Math.ceil((new Date(projectData.start_date) - new Date()) / (1000 * 60 * 60 * 24))} วัน
                        </span>
                    ) : projectStatus.isProjectExpired ? (
                        <span className="expired">โครงการสิ้นสุดแล้ว</span>
                    ) : (
                        <span className="remaining">
                            เหลืออีก {projectStatus.countDay} วัน
                        </span>
                    )}
                </div>

                <div className="donate-detail-discription">
                    <div className="donate-detail-header">
                        <IoInformationCircleOutline className="custom-icon" />
                        <p>รายละเอียดโครงการ</p>
                    </div>
                    <p className="donate-detail-informations">{projectData.description}</p>
                </div>

                <div className="donate-detail-discription">
                    <div className="donate-detail-header">
                        <MdDateRange className="custom-icon" />
                        <p>ระยะเวลาระดมทุน</p>
                    </div>
                    <p className="donate-detail-informations">
                        {projectStatus.formattedStartDate} - {projectStatus.formattedEndDate}
                    </p>
                </div>

                <div className="donate-detail-discription">
                    <div className="donate-detail-header">
                        <ImUser className="custom-icon" />
                        <p>ผู้รับผิดชอบโครงการ</p>
                    </div>
                    <p className="donate-detail-informations">
                        {/* สถานะผู้รับผิดชอบ */}
                        {projectData.creator_role
                            ? "(" + getFilterTitle(String(projectData.creator_role)) + ") "
                            : 'ไม่ระบุชื่อผู้รับผิดชอบ'}
                        {projectData.creator_name || 'ไม่ระบุชื่อผู้รับผิดชอบ'}
                    </p>
                </div>
            </div>

            {/* ฟอร์มบริจาค */}
            <div className="donate-detail-content-item">
                <form onSubmit={handleSubmit} noValidate>
                    <div className="donate-detail-form-items">
                        <label htmlFor="amount">ระบุจำนวนเงิน *</label>
                        <input
                            className={`styled-input ${errors.amount ? 'error' : ''}`}
                            type="text"
                            name="amount"
                            id="amount"
                            value={formData.amount}
                            onChange={handleInputChange}
                            placeholder="กรอกจำนวน เช่น 1000"
                            required
                            autoComplete="off"
                        />
                        {errors.amount && <span className="error-message">{errors.amount}</span>}
                    </div>

                    <div className="donate-detail-form-items">
                        <label>ช่องทางการชำระเงิน</label>
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
                                        <a
                                            href={qrCode}
                                            download={`PromptPay_${formData.amount || 0}Baht.png`}
                                            className="download-qr-btn"
                                        >
                                            ดาวน์โหลด QR Code
                                        </a>
                                    </div>

                                ) : formData.amount && !errors.amount && parseFloat(formData.amount) > 0 ? (
                                    <p>กรุณารอสักครู่...</p>
                                ) : (
                                    <p>กรอกจำนวนเงินเพื่อสร้าง QR Code</p>
                                )}
                                {errors.qr && <span className="error-message">{errors.qr}</span>}
                            </div>
                        </div>
                    </div>

                    <div className="donate-detail-form-items">
                        <label htmlFor="slip">หลักฐานการชำระเงิน *</label>
                        <input
                            className={`styled-input ${errors.file ? 'error' : ''}`}
                            type="file"
                            id="slip"
                            onChange={handleFileChange}
                            accept=".jpg, .jpeg, .png , .jfif"
                            required
                        />
                        {errors.file && <span className="error-message">{errors.file}</span>}

                        {filePreview && (
                            <div className="file-preview">
                                <img
                                    src={filePreview}
                                    alt="ตัวอย่างไฟล์"
                                    style={{ maxWidth: "200px", maxHeight: "200px", objectFit: "contain" }}
                                />
                                <div className="file-info">
                                    <FaCheck className="upload-success" />
                                    <span>อัปโหลดสำเร็จ</span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFilePreview(null);
                                            setFormData(prev => ({ ...prev, file: null }));
                                            document.getElementById('slip').value = '';
                                        }}
                                        className="remove-file"
                                    >
                                        <FaTimes /> ลบไฟล์
                                    </button>
                                </div>
                            </div>
                        )}

                        <canvas id="canvas" style={{ display: "none" }}></canvas>
                    </div>

                    <div className="donate-detail-form-items">
                        <label>ใบกำกับภาษี</label>
                        <div className="tax-options">
                            <label className="radio-option">
                                <input
                                    type="radio"
                                    name="tax"
                                    value="no"
                                    onChange={handleTaxOptionChange}
                                    defaultChecked
                                />
                                <span className="radio-custom"></span>
                                ไม่ต้องการ
                            </label>
                            <label className="radio-option">
                                <input
                                    type="radio"
                                    name="tax"
                                    value="yes"
                                    onChange={handleTaxOptionChange}
                                />
                                <span className="radio-custom"></span>
                                ต้องการ
                            </label>
                        </div>

                        {showTaxForm && (
                            <div className="donate-detail-tax-form">
                                {savedAddresses.length > 0 && (
                                    <div className="saved-addresses">
                                        <label htmlFor="saved-address">เลือกที่อยู่ที่เคยบันทึก</label>
                                        <select
                                            id="saved-address"
                                            className="styled-select"
                                            onChange={handleTaxAddressChange}
                                            value={selectedTaxId}
                                        >
                                            <option value="">-- เลือกที่อยู่ที่เคยบันทึก --</option>
                                            {savedAddresses.map(addr => (
                                                <option key={addr.tax_id} value={addr.tax_id}>
                                                    {addr.name} - {addr.address.substring(0, 50)}...
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {showTaxPreview && (
                                    formData.name.trim() !== "" &&
                                    formData.address.trim() !== "" &&
                                    /^\d{13}$/.test(formData.tax_number)
                                ) ? (
                                    <div className="donate-tax-summary">
                                        <div className="tax-summary-header">
                                            <h4>ข้อมูลใบกำกับภาษี</h4>
                                            <button
                                                type="button"
                                                onClick={() => setShowTaxPreview(!showTaxPreview)}
                                                className="toggle-preview"
                                            >
                                                {showTaxPreview ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                        <div className="tax-summary-content">

                                            <p><strong>ชื่อ:</strong> {formData.name}</p>
                                            <p><strong>ที่อยู่:</strong> {formData.address}</p>
                                            <p><strong>เลขประจำตัวผู้เสียภาษี:</strong> {formData.tax_number}</p>
                                            {formData.phone && <p><strong>โทรศัพท์:</strong> {formData.phone}</p>}
                                            {formData.email && <p><strong>อีเมล:</strong> {formData.email}</p>}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedTaxId("");
                                                setFormData(prev => ({
                                                    ...prev,
                                                    name: "",
                                                    address: "",
                                                    tax_number: "",
                                                    phone: "",
                                                    email: ""
                                                }));
                                            }}
                                            className="edit-tax-info"
                                        >
                                            แก้ไข
                                        </button>
                                    </div>
                                ) : (
                                    <div className="tax-input-fields">
                                        <div className="input-group">
                                            <label htmlFor="slip">ชื่อบริษัท/นิติบุคคล *</label>
                                            <input
                                                className={`styled-inputTax ${errors.name ? 'error' : ''}`}
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                placeholder="ชื่อบริษัท/นิติบุคคล"
                                                required
                                            />
                                            {errors.name && <span className="error-message">{errors.name}</span>}
                                        </div>

                                        <div className="input-group">
                                            <label htmlFor="address">ที่อยู่ *</label>
                                            <textarea
                                                className={`styled-inputTax ${errors.address ? 'error' : ''}`}
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                placeholder="ที่อยู่ *"
                                                rows="3"
                                                required
                                            />
                                            {errors.address && <span className="error-message">{errors.address}</span>}
                                        </div>

                                        <div className="input-group">
                                            <label htmlFor="address">เลขประจำตัวผู้เสียภาษี (13 หลัก) *</label>
                                            <input
                                                className={`styled-inputTax ${errors.tax_number ? 'error' : ''}`}
                                                type="text"
                                                name="tax_number"
                                                value={formData.tax_number}
                                                onChange={handleInputChange}
                                                placeholder="เลขประจำตัวผู้เสียภาษี (13 หลัก)"
                                                maxLength="13"
                                                pattern="\d{13}"
                                                required
                                            />
                                            {errors.tax_number && <span className="error-message">{errors.tax_number}</span>}
                                            {formData.tax_number && formData.tax_number.length === 13 && !errors.tax_number && (
                                                <span className="success-message">
                                                    <FaCheck /> เลขประจำตัวผู้เสียภาษีถูกต้อง
                                                </span>
                                            )}
                                        </div>

                                        <div className="optional-fields">
                                            <div className="input-group">
                                                <input
                                                    className={`styled-inputTax ${errors.phone ? 'error' : ''}`}
                                                    type="text"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    placeholder="หมายเลขโทรศัพท์ (10 หลัก)"
                                                    maxLength="10"
                                                />
                                                {errors.phone && <span className="error-message">{errors.phone}</span>}
                                            </div>

                                            <div className="input-group">
                                                <input
                                                    className={`styled-inputTax ${errors.email ? 'error' : ''}`}
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    placeholder="อีเมล"
                                                />
                                                {errors.email && <span className="error-message">{errors.email}</span>}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="form-group-btn">
                        <button
                            type="button"
                            onClick={() => {
                                if (window.confirm('คุณต้องการยกเลิกการบริจาคใช่หรือไม่?')) {
                                    navigate(-1);
                                }
                            }}
                            className="cancel-button"
                        >
                            ยกเลิก
                        </button>

                        <button
                            type="submit"
                            className="donate-bt"
                            disabled={!projectStatus.isProjectActive || submitting || ocrLoading}
                            style={!projectStatus.isProjectActive || submitting ? {
                                backgroundColor: "#ccc",
                                cursor: "not-allowed"
                            } : {}}
                        >
                            {submitting ? (
                                <>
                                    <AiOutlineLoading3Quarters className="loading-spinner" />
                                    กำลังดำเนินการ...
                                </>
                            ) : projectStatus.isProjectExpired ? (
                                "โครงการสิ้นสุดแล้ว"
                            ) : projectStatus.isProjectUpcoming ? (
                                "โครงการยังไม่เริ่ม"
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

export default DonateDetail;