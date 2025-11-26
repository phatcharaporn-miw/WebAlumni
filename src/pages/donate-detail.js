import React, { useState, useEffect, useCallback, useMemo } from "react";
import { HOSTNAME } from '../config.js';
import "../css/Donate-detail.css";
import { MdDateRange, MdOutlinePayment } from "react-icons/md";
import { ImUser } from "react-icons/im";
import { BiScan } from "react-icons/bi";
import { GiPartyPopper } from "react-icons/gi";
import { IoInformationCircleOutline, IoNewspaperOutline, IoReceiptOutline } from "react-icons/io5";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { PiCoinsFill } from "react-icons/pi";
import { FiCopy } from "react-icons/fi";
import { FaCheck, FaTimes } from "react-icons/fa";
import { RiBankLine } from 'react-icons/ri';
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import axios from "axios";
import jsQR from "jsqr";
import Swal from "sweetalert2";

const API_BASE_URL = HOSTNAME;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/jfif"];
const MAX_AMOUNT = 1000000;
const QR_DEBOUNCE_DELAY = 500;

// จัดรูปแบบพวกข้อมูลต่างๆ
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('th-TH').format(amount);
};

const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear() + 543;
    return `${day}/${month}/${year}`;
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

// คำนวฯวันที่เหลือของโครงการ
const calculateDaysRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
};

function DonateDetail() {
    const location = useLocation();
    const navigate = useNavigate();
    const { projectId } = useParams();
    // const userId = sessionStorage.getItem("userId");
    const { user } = useAuth();
    const userId = user?.user_id;
    const [taxType, setTaxType] = useState("");
    const [useTax, setUseTax] = useState(false);
    // สร้าง key สำหรับ sessionStorage
    const FORM_DATA_KEY = `donateForm_${projectId}_${userId}`;
    // State management
    const donationData = location.state;
    const [projectData, setProjectData] = useState({});
    const [showTaxForm, setShowTaxForm] = useState(false);
    const [userData, setUserData] = useState({});
    const [formData, setFormData] = useState({
        amount: "",
        user_id: userId || "",
        project_id: projectId || "",
        file: null,
        name: "",
        company_name: "",
        tax_number: "",
        slipText: "",
        phone: "",
        email: "",
        type_tax: ""
    });

    const [qrCode, setQrCode] = useState(null);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [corporateAddresses, setCorporateAddresses] = useState([]);
    const [addressesOffical, setAddressesOffical] = useState([]);

    const [selectedTaxId, setSelectedTaxId] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [qrGenerating, setQrGenerating] = useState(false);
    const [filePreview, setFilePreview] = useState(null);
    const [networkError, setNetworkError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [hasSavedData, setHasSavedData] = useState(false);
    const [file, setFile] = useState(null);

    const formatDate = (date) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear() + 543;
        return `${day}/${month}/${year}`;
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

    // จัดรูปแบบพวกข้อมูล
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('th-TH').format(amount);
    };

    // คำนวนวันที่เหลือของโครงการ
    const calculateDaysRemaining = (endDate) => {
        const now = new Date();
        const end = new Date(endDate);
        return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    };

    // เรียกตอนกด "ต้องการใบกำกับ"
    const handleShowTaxForm = () => {
        setShowTaxForm(true);
        const defaultType = "individual"; // default บุคคล
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

    const validateAmount = useCallback((amount) => {
        const num = parseFloat(amount);
        if (!amount || amount.trim() === "") return "กรุณาระบุจำนวนเงิน";
        if (isNaN(num)) return "กรุณาระบุจำนวนเงินเป็นตัวเลข";
        if (num < 10) return "จำนวนเงินต้องมากกว่า 10 บาท";
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
    const validateEmail = useCallback((email) => {
        if (!email) return "";
        if (!email.includes("@") || !email.includes(".com")) return "";
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

    // ตรวจสอบไฟล์
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

    // Clear saved form data function
    const clearSavedFormData = useCallback(() => {
        sessionStorage.removeItem(FORM_DATA_KEY);
        setHasSavedData(false);
    }, [FORM_DATA_KEY]);

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Load saved form data from sessionStorage
    // ตรงนี้อยากเปลี่ยนให้มัมนข้อมูลยังคงอยู่เมื่อกดย้อนกลับมาจากหน้ายืนยันเท่านั้น หากออกไปแล้วกลับเข้ามาใหม่ ก็ไม่ควรมีข้อมูลเก่า
    useEffect(() => {
        const loadSavedFormData = () => {
            try {
                const savedData = localStorage.getItem(FORM_DATA_KEY);
                if (savedData && location.state?.fromConfirm) {
                    const parsedData = JSON.parse(savedData);

                    setFormData(prev => ({
                        ...prev,
                        ...parsedData
                    }));

                    if (parsedData.showTaxForm !== undefined) {
                        setShowTaxForm(parsedData.showTaxForm);
                    }
                    if (parsedData.taxType) {
                        setTaxType(parsedData.taxType);
                    }
                    if (parsedData.selectedTaxId) {
                        setSelectedTaxId(parsedData.selectedTaxId);
                    }
                    if (parsedData.filePreview) {
                        setFilePreview(parsedData.filePreview);
                    }
                } else {
                    clearSavedFormData();
                }
            } catch (error) {
                console.error("Error loading saved form data:", error);
                clearSavedFormData();
            }
        };

        if (projectId && userId) {
            loadSavedFormData();
        }
    }, [projectId, userId, FORM_DATA_KEY, clearSavedFormData, location.state]);


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

    // ดึงทีอยู่ is_official
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

    useEffect(() => {
        if (projectId && userId && (
            formData.amount ||
            formData.name ||
            formData.tax_number ||
            formData.phone ||
            formData.email ||
            formData.user_id
        )) {
            const saveData = {
                amount: formData.amount,
                name: formData.name,
                tax_number: formData.tax_number,
                phone: formData.phone,
                email: formData.email,
                showTaxForm,
                taxType,
                selectedTaxId,
                filePreview,
                savedTime: new Date().getTime()
            };

            try {
                sessionStorage.setItem(FORM_DATA_KEY, JSON.stringify(saveData));
            } catch (error) {
                console.error('Error saving form data:', error);
            }
        }
    }, [formData, showTaxForm, taxType, selectedTaxId, filePreview, projectId, userId, FORM_DATA_KEY]);

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

        // Real-time validation
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
        }
        // Optional: validate company_name if needed
        else if (name === "company_name") {
            if (!formattedValue.trim()) {
                setErrors(prev => ({ ...prev, company_name: "กรุณากรอกชื่อบริษัท" }));
            }
        }

    }, [errors, showTaxForm, validateAmount, validateTaxNumber, validateEmail, validatePhone]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        // ตรวจสอบไฟล์ก่อน
        const fileError = validateFile(selectedFile);
        if (fileError) {
            setErrors(prev => ({ ...prev, file: fileError }));
            return;
        }

        // เคลียร์ error เก่าและ slipText ก่อน
        setErrors(prev => ({ ...prev, file: "" }));
        setFormData(prev => ({ ...prev, slipText: "" }));

        // อัปเดต file state
        setFile(selectedFile);

        // อัปเดต formData.file หลัง QR detection เสร็จ
        const reader = new FileReader();
        reader.onload = (event) => {
            setFilePreview(event.target.result); // preview ก่อน

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
                    setFile(null);
                    return;
                }

                // อัปเดต formData.file พร้อม slipText
                setFormData(prev => ({ ...prev, file: selectedFile, slipText: code.data }));
                Swal.fire("พบ QR Code", "พบ QR Code ในไฟล์ที่อัปโหลดแล้ว", "success");
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(selectedFile);
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
                    taxId: selected.tax_id
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


    // Enhanced form validation
    const validateForm = () => {
        let newErrors = {};

        // จำนวนเงิน
        if (!formData.amount) newErrors.amount = "กรุณากรอกจำนวนเงิน";

        // หลักฐานการโอน
        if (!formData.file) newErrors.file = "กรุณาอัปโหลดหลักฐานการโอนเงิน";

        if (showTaxForm) {
            if (taxType === "individual") {
                // fallback ให้ name
                if (!formData.name) formData.name = userData.full_name || "";

                if (!formData.tax_number || formData.tax_number.length !== 13) {
                    newErrors.tax_number = "กรุณากรอกเลขบัตรประชาชนให้ครบ 13 หลัก";
                }
                if (!formData.phone || formData.phone.length !== 10) {
                    newErrors.phone = "กรุณากรอกหมายเลขโทรศัพท์ให้ถูกต้อง";
                }
                if (!formData.email) newErrors.email = "กรุณากรอกอีเมล";
            } else if (taxType === "corporate") {
                // fallback ให้ company_name
                if (!formData.company_name) formData.company_name = "";

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

    // ยืนยันการบริจาค
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userId) {
            alert("กรุณาเข้าสู่ระบบก่อนทำการบริจาค");
            navigate("/login");
            return;
        }
        if (submitting) return;
        if (!validateForm()) return;

        setSubmitting(true);

        try {
            const { ...restFormData } = formData;

            const finalFormData = {
                ...restFormData,
                type_tax: showTaxForm ? restFormData.type_tax : "",
                name: restFormData.name || userData.full_name || "",
                company_name: restFormData.company_name || "",
            };

            const dataToSave = {
                ...finalFormData,
                showTaxForm,
                taxType: formData.type_tax,
                selectedTaxId,
                filePreview,
            };
            localStorage.setItem(FORM_DATA_KEY, JSON.stringify(dataToSave));

            navigate(`/donate/donatedetail/donateconfirm/${projectId}`, {
                state: {
                    formData,
                    file,
                    projectData,
                    showTaxForm,
                    taxType: formData.type_tax,
                    userId,
                    filePreview,
                    fromForm: true,
                }
            });

        } catch (error) {
            console.error("Error preparing submission:", error);
            alert("เกิดข้อผิดพลาดในการเตรียมข้อมูล กรุณาลองใหม่อีกครั้ง");
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        const savedData = sessionStorage.getItem(FORM_DATA_KEY);

        if (savedData && location.state?.fromConfirm) {
            // ถ้ามาจาก confirm → โหลดข้อมูลกลับมา
            const parsedData = JSON.parse(savedData);
            setFormData(prev => ({ ...prev, ...parsedData }));
            setShowTaxForm(parsedData.showTaxForm || false);
            setTaxType(parsedData.taxType || "");
            setSelectedTaxId(parsedData.selectedTaxId || "");
            setFilePreview(parsedData.filePreview || null);
        } else {
            // ถ้าเข้ามาใหม่ (ไม่ใช่มาจาก confirm) → ล้างข้อมูล
            sessionStorage.removeItem(FORM_DATA_KEY);
        }
    }, [location.state]);


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

    //เมื่อโครงการสิ้นสุดแล้ว
    if (projectStatus.isProjectExpired) {
        return (
            <div className="donate-detail-content expired-project">
                <div className="donate-detail-content-item">
                    <div className="project-status-badge expired">
                        <FaTimes className="status-icon" />
                        โครงการสิ้นสุดแล้ว
                    </div>
                    <h5>{projectData.project_name}</h5>
                    <img
                        src={`${API_BASE_URL}/uploads/${projectData.image_path}`}
                        alt="กิจกรรม"
                        onError={(e) => {
                            e.target.src = `${process.env.PUBLIC_URL}/image/default.png`;
                        }}
                        loading="lazy"
                    />
                    {/* แสดงผลสรุปโครงการ */}
                    <div className=".project-summary-donate">
                        <div className="summary-card success">
                            <h6>ผลสรุปการระดมทุน</h6>
                            <div className="summary-stats">
                                <div className="stat-item">
                                    <span className="stat-value">
                                        {formatCurrency(projectData.current_amount || 0)}
                                    </span>
                                    <span className="stat-label">บาท ที่ได้รับ</span>
                                </div>
                                {projectData.target_amount > 0 && (
                                    <div className="stat-item">
                                        <span className="stat-value">
                                            {Math.min(projectStatus.progress, 100).toFixed(1)}%
                                        </span>
                                        <span className="stat-label">
                                            ของเป้าหมาย {formatCurrency(projectData.target_amount)} บาท
                                        </span>
                                    </div>
                                )}
                            </div>
                            {/* แสดง Progress Bar แบบ Completed */}
                            {projectData.target_amount > 0 && (
                                <div className="final-progress-bar">
                                    <div
                                        className={`progress-fill ${projectStatus.progress >= 100 ? 'complete' : 'partial'}`}
                                        style={{ width: `${Math.min(projectStatus.progress, 100)}%` }}
                                    ></div>
                                </div>
                            )}
                            {projectStatus.progress >= 100 ? (
                                <div className="success-message">
                                    <FaCheck className="check-icon" /><span>เป้าหมายสำเร็จแล้ว!</span>
                                </div>
                            ) : (
                                <div className="partial-message">
                                    <GiPartyPopper className="PartyPopper-icon" /><span>ขอบคุณสำหรับการสนับสนุน</span>
                                </div>
                            )}
                        </div>
                    </div>
                    {/*ข้อมูลโครงการ*/}
                    <div className="donate-detail-discription">
                        <div className="donate-detail-header">
                            <IoInformationCircleOutline className="custom-icon" />
                            <p className="donate-detail-header-title">รายละเอียดโครงการ</p>
                        </div>
                        <p className="donate-detail-informations">{projectData.description}</p>
                    </div>

                    <div className="donate-detail-discription">
                        <div className="donate-detail-header">
                            <MdDateRange className="custom-icon" />
                            <p className="donate-detail-header-title">ระยะเวลาระดมทุน</p>
                        </div>
                        <p className="donate-detail-informations">
                            {projectStatus.formattedStartDate} - {projectStatus.formattedEndDate}
                            <span className="expired-note">(สิ้นสุดแล้ว)</span>
                        </p>
                    </div>

                    <div className="donate-detail-discription">
                        <div className="donate-detail-header">
                            <ImUser className="custom-icon" />
                            <p className="donate-detail-header-title">ผู้รับผิดชอบโครงการ</p>
                        </div>
                        <p className="donate-detail-informations">
                            {projectData.creator_role
                                ? "(" + getFilterTitle(String(projectData.creator_role)) + ") "
                                : 'ไม่ระบุชื่อผู้รับผิดชอบ'}
                            {projectData.creator_name || 'ไม่ระบุชื่อผู้รับผิดชอบ'}
                        </p>
                    </div>
                </div>
                {/* ส่วนตัวเลือกสำหรับผู้ใช้ */}
                <div className="donate-detail-content-item">
                    <div className="expired-options">
                        <h6>ตัวเลือกอื่น</h6>
                        <div className="option-card">
                            <h7>โครงการอื่นที่เปิดรับบริจาค</h7>
                            <p>สำรวจโครงการอื่น ๆ ที่ยังคงเปิดรับการสนับสนุน</p>
                            <button
                                className="option-button primary"
                                onClick={() => navigate('/donate')}
                            >
                                ดูโครงการอื่น
                            </button>
                        </div>

                        {userId && (
                            <div className="option-card">
                                <h7>ประวัติการบริจาคของฉัน</h7>
                                <p>ตรวจสอบประวัติการบริจาคทั้งหมดของคุณ</p>
                                <button
                                    className="option-button secondary"
                                    onClick={() => navigate('/alumni-profile/donation-history')}
                                >
                                    ดูประวัติการบริจาค
                                </button>
                            </div>
                        )}

                        <div className="option-card">
                            <h7>ติดตามผลการดำเนินงาน</h7>
                            <p>ติดตามความคืบหนาและผลการดำเนินงานโครงการนี้</p>
                            <button
                                className="option-button secondary"
                                onClick={() => {
                                    alert('ฟีเจอร์นี้จะเปิดใช้งานเร็วๆ นี้');
                                }}
                            >
                                ติดตามผล
                            </button>
                        </div>
                        <div className="option-card">
                            <h7>แชร์โครงการ</h7>
                            <p>แบ่งปันข้อมูลโครงการให้เพื่อนและครอบครัว</p>
                            <button
                                className="option-button secondary"
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({
                                            title: projectData.project_name,
                                            text: `โครงการ ${projectData.project_name} ได้รับการสนับสนุน ${formatCurrency(projectData.current_amount)} บาทแล้ว`,
                                            url: window.location.href
                                        });
                                    } else {
                                        navigator.clipboard.writeText(window.location.href);
                                        alert('คัดลอกลิงก์แล้ว!');
                                    }
                                }}
                            >
                                แชร์
                            </button>
                        </div>
                    </div>
                    {/* ปุ่มกลับ */}
                    <div className="form-group-btn">
                        <button
                            type="button"
                            onClick={() => navigate('/donate')}
                            className="back-button-donate primary"
                        >
                            กลับไปหาโครงการอื่น
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // โครงการที่กำลังดำเนินการอยู่
    return (
        <div className="donate-detail-content">
            <div className="donate-detail-content-item">
                <h5>{projectData.project_name}</h5>
                <img
                    src={`${HOSTNAME}/uploads/${projectData.image_path}`}
                    alt={projectData.project_name}
                    onError={(e) => {
                        if (e.target.src !== window.location.origin + "/image/default.jpg") {
                            e.target.src = "/image/default.jpg";
                        }
                    }}
                    loading="lazy"
                />
                <div className="d-flex justify-content-between gap-2 align-items-center mt-3">
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
                    <div className="donate-detail-progress">
                        {projectData.target_amount && projectData.target_amount > 0
                            ? `${Math.round(projectStatus.progress)}%`
                            : ""}
                    </div>
                </div>

                <div className="bar">
                    {(projectData.donation_type !== "unlimited" && projectData.donation_type !== "things") && (
                        <div className="progress-bar-container">
                            <div
                                className="progress-bar"
                                style={{ width: `${Math.min(projectStatus.progress, 100)}%` }}
                            >
                                {/* <span className="progress-percent">
                                    {`${Math.round(Math.min(projectStatus.progress, 100))}%`}
                                </span> */}
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

                <div className="donate-detail-discription">
                    <div className="donate-detail-header">
                        <IoInformationCircleOutline className="custom-icon" />
                        <p className="donate-detail-header-title">รายละเอียดโครงการ</p>
                    </div>
                    <p className="donate-detail-informations">{projectData.description}</p>
                </div>

                <div className="donate-detail-discription">
                    <div className="donate-detail-header">
                        <MdDateRange className="custom-icon" />
                        <p className="donate-detail-header-title">ระยะเวลาระดมทุน</p>
                    </div>
                    <p className="donate-detail-informations">
                        {projectStatus.formattedStartDate} - {projectStatus.formattedEndDate}
                    </p>
                </div>

                <div className="donate-detail-discription">
                    <div className="donate-detail-header">
                        <ImUser className="custom-icon" />
                        <p className="donate-detail-header-title">ผู้รับผิดชอบโครงการ</p>
                    </div>
                    <p className="donate-detail-informations">
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
                        {errors.amount && <span>{errors.amount}</span>}
                        {/*ปุ่มจำนวนเงินที่กำหนดไว้ */}
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
                        <label className="flex items-center gap-2 text-lg font-semibold mb-3">
                            <MdOutlinePayment className="custom-icon text-blue-600" />
                            ช่องทางการชำระเงิน
                        </label>

                        <div className="bank-info-container bg-gray-50 rounded-2xl p-4 shadow-sm border border-gray-200">
                            <div className="title-bank-layout mb-3 flex items-center gap-2">
                                <RiBankLine />
                                <p className="text-base mb-0">ข้อมูลบัญชีธนาคาร</p>
                            </div>

                            {projectData?.is_official == 1 ? (
                                <div className="bank-info-content flex flex-col gap-3">
                                    {/* ชื่อบัญชี */}
                                    <div className="bank-info-line flex flex-col sm:flex-row sm:items-center justify-between bg-white rounded-xl p-3">
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <strong>ชื่อบัญชี: </strong>
                                            <span className="font-medium">{addressesOffical[0]?.account_name || projectData.account_name || "-"}</span>
                                        </div>
                                    </div>

                                    {/* ธนาคาร */}
                                    {addressesOffical[0]?.bank_name && (
                                        <div className="bank-info-line flex flex-col sm:flex-row sm:items-center justify-between bg-white rounded-xl p-3">
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <strong>ธนาคาร: </strong>
                                                <span className="font-medium">{addressesOffical[0].bank_name || projectData.bank_name || "-"}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* เลขบัญชี */}
                                    <div className="bank-info-line flex flex-col sm:flex-row sm:items-center justify-between bg-white rounded-xl p-3">
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <strong>เลขบัญชี: </strong>
                                            <span className="font-medium">{addressesOffical[0]?.account_number || projectData.account_number || "-"}</span>
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
                            ) : (
                                <div className="bank-info-content flex flex-col gap-3">
                                    {/* ชื่อบัญชี */}
                                    <div className="bank-info-line flex flex-col sm:flex-row sm:items-center justify-between bg-white rounded-xl p-3">
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <strong>ชื่อบัญชี: </strong>
                                            <span className="font-medium">{projectData?.account_name || "-"}</span>
                                        </div>
                                    </div>

                                    {/* ธนาคาร */}
                                    {projectData?.bank_name && (
                                        <div className="bank-info-line flex flex-col sm:flex-row sm:items-center justify-between bg-white rounded-xl p-3">
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <strong>ธนาคาร: </strong>
                                                <span className="font-medium">{projectData.bank_name}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* เลขบัญชี */}
                                    <div className="bank-info-line flex flex-col sm:flex-row sm:items-center justify-between bg-white rounded-xl p-3">
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <strong>เลขบัญชี: </strong>
                                            <span className="font-medium">{projectData?.account_number || "-"}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                navigator.clipboard.writeText(projectData?.account_number || "")
                                            }
                                            className="copy-btn flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition"
                                        >
                                            <FiCopy className="text-base" />
                                        </button>
                                    </div>
                                </div>
                            )}
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
                            accept=".jpg, .jpeg, .png , .jfif"
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
                        <canvas id="canvas" style={{ display: "none" }}></canvas>
                    </div>
                    {/* ใบกำกับภาษี */}
                    <div className="donate-detail-form-items">
                        <label><IoNewspaperOutline className="custom-icon" />ใบกำกับภาษี</label>
                        <div className="tax-options">
                            <div className="tax-type-options">
                                <label className="radio-option-bt">
                                    <label className="radio-option-bt">
                                        <input
                                            type="radio"
                                            name="taxOption"
                                            value="no"
                                            onChange={() => {
                                                setShowTaxForm(false);
                                                setUseTax(false);
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
                                </label>

                                <label className="radio-option-bt">
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

                                </label>
                            </div>
                        </div>

                        {/* หากเลือกต้องการ */}
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
                                                        className={`styled-inputTax ${errors.tax_number ? "error" : ""
                                                            }`}
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
                                                        <span className="error-message">
                                                            {errors.tax_number}
                                                        </span>
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
                                                        className={`styled-inputTax ${errors.phone ? "error" : ""
                                                            }`}
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
                                                        className={`styled-inputTax ${errors.email ? "error" : ""
                                                            }`}
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleInputChange}
                                                        placeholder="อีเมล"
                                                        required
                                                    />
                                                    {errors.email && (
                                                        <span className="error-message">
                                                            {errors.email}
                                                        </span>
                                                    )}
                                                </div>

                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="input-group w-100">
                                                {corporateAddresses.length > 0 ? (
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
                                                ) : (
                                                    <p>กำลังโหลดข้อมูล...</p>
                                                )}
                                            </div>

                                            <div className="input-group">
                                                <label>ชื่อบริษัท/นิติบุคคล<span className="asterisk">*</span></label>
                                                <input
                                                    className={`styled-inputTax ${errors.name ? "error" : ""
                                                        }`}
                                                    type="text"
                                                    name="company_name"
                                                    value={formData.company_name}
                                                    onChange={handleInputChange}
                                                    readOnly={selectedTaxId !== ""}
                                                    placeholder="ชื่อบริษัท/นิติบุคคล"
                                                />
                                                {errors.name && (
                                                    <span className="error-message">{errors.name}</span>
                                                )}
                                            </div>

                                            <div className="input-group">
                                                <label>เลขประจำตัวผู้เสียภาษี (13 หลัก)<span className="asterisk">*</span></label>
                                                <input
                                                    className={`styled-inputTax ${errors.tax_number ? "error" : ""
                                                        }`}
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
                                                    <span className="error-message">
                                                        {errors.tax_number}
                                                    </span>
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
                                                    className={`styled-inputTax ${errors.phone ? "error" : ""
                                                        }`}
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
                                                <label>
                                                    อีเมล<span className="asterisk">*</span>
                                                </label>
                                                <input
                                                    className={`styled-inputTax ${errors.email ? "error" : ""}`}
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={(e) => {
                                                        handleInputChange(e);
                                                        const errorMessage = validateEmail(e.target.value);
                                                        setErrors((prev) => ({ ...prev, email: errorMessage }));
                                                    }}
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
                            onClick={() => {
                                clearSavedFormData();
                                navigate(-1);
                            }}
                            className="cancel-donate-bt"
                        > ยกเลิก
                        </button>
                        <button
                            type="submit"
                            className="donate-bt"
                            disabled={!projectStatus.isProjectActive || submitting}
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
            </div >
        </div >
    );
}

export default DonateDetail;