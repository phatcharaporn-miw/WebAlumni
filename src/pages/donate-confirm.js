import { useLocation, useNavigate, Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/Donate-confirm.css";
import { MdDateRange, MdAttachMoney, MdReceipt } from "react-icons/md";
import { IoInformationCircleOutline, IoCheckmarkCircleOutline, IoWarningOutline } from "react-icons/io5";
import { FaUser, FaIdCard, FaPhone, FaEnvelope, FaBuilding, FaFileImage } from "react-icons/fa";
import Swal from "sweetalert2";
import { useAuth } from '../context/AuthContext';
import {HOSTNAME} from '../config.js';

const API_BASE_URL = HOSTNAME;

function DonateConfirm() {
    const [userData, setUserData] = useState({});
    const [loading, setLoading] = useState(false);
    const [projectData, setProjectData] = useState({});
    const [error, setError] = useState(null);
    const [isDataValid, setIsDataValid] = useState(false);
    // const userId = sessionStorage.getItem("userId");
    const { user } = useAuth();
    const userId = user?.user_id;
    const role = user?.role;
    const location = useLocation();
    const navigate = useNavigate();

    const { formData, file: initialFile, filePreview, showTaxForm, projectData: passedProjectData } = location.state || {};
    const projectId = formData.project_id;
    const [file, setFile] = useState(initialFile || null);

    const useTax = showTaxForm && (formData.type_tax === "individual" || formData.type_tax === "corporate");
    const taxType = formData?.tax_type || formData?.type_tax;
    useEffect(() => {
        const validateData = () => {
            if (!formData || Object.keys(formData).length === 0 || !projectId) {
                setIsDataValid(false);
                setError("ไม่มีข้อมูลการบริจาค กรุณาเริ่มต้นใหม่");
                return;
            }

            // ตรวจสอบหลักฐานการโอน
            const hasProof = file || formData.slipText;
            if (!hasProof) {
                setIsDataValid(false);
                setError("กรุณาอัปโหลดหลักฐานการโอนเงิน");
                return;
            }

            const required = [formData.amount, projectId, userId, hasProof];

            // ฟิลด์ใบกำกับภาษี ตรวจสอบเฉพาะเมื่อ showTaxForm = true
            let taxRequired = [];
            if (showTaxForm && formData.type_tax) {
                if (taxType === "individual") {
                    taxRequired = [formData.name, formData.tax_number];
                } else if (taxType === "corporate") {
                    taxRequired = [formData.company_name, formData.tax_number];
                }
            }

            // ตรวจสอบความครบถ้วน
            const allValid = [...required, ...taxRequired].every(
                item => item !== undefined && item !== null && item !== ""
            );

            setIsDataValid(allValid);

            if (!allValid && showTaxForm) {
                setError("กรุณากรอกข้อมูลให้ครบถ้วน");
            } else {
                setError(null);
            }

        };

        validateData();
    }, [formData, projectId, showTaxForm, taxType, userId, file]);

    // console.log("isDataValid:", isDataValid);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // โหลดข้อมูลผู้ใช้
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/users/profile`, {
                    credentials: 'include'
                });
                const data = await response.json();
                if (data.success) {
                    setUserData(data.user);
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        };

        fetchUserProfile();
    }, []);

    // ใช้ข้อมูลโครงการที่ส่งมาจาก DonateDetail หรือโหลดใหม่
    useEffect(() => {
        if (passedProjectData) {
            setProjectData(passedProjectData);
        } else if (projectId && !error) {
            const fetchProjectData = async () => {
                try {
                    setLoading(true);
                    const response = await axios.get(`${API_BASE_URL}/donate/donatedetail/${projectId}`);
                    setProjectData(response.data);
                } catch (error) {
                    console.error('Error fetching project data:', error);
                    setError("เกิดข้อผิดพลาดในการโหลดข้อมูลโครงการ");
                } finally {
                    setLoading(false);
                }
            };
            fetchProjectData();
        }
    }, [projectId, passedProjectData, error]);

    // คำนวณวันที่เหลือ
    const daysLeft = projectData.end_date
        ? Math.max(0, Math.ceil((new Date(projectData.end_date) - new Date()) / (1000 * 3600 * 24)))
        : 0;

    // จัดรูปแบบวันที่
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return "-";
        }
    };

    // จัดรูปแบบเวลา
    const formatDateTime = () => {
        const now = new Date();
        return now.toLocaleString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // ฟังก์ชันยืนยันการบริจาค
    const handleConfirm = async () => {
        if (!isDataValid) {
            Swal.fire({
                icon: 'warning',
                title: 'ข้อมูลไม่ครบถ้วน',
                text: 'กรุณาตรวจสอบข้อมูลให้ครบถ้วนก่อนยืนยันการบริจาค',
            });
            return;
        }

        if (!userId) {
            Swal.fire({
                icon: 'warning',
                title: 'กรุณาเข้าสู่ระบบ',
                text: 'กรุณาเข้าสู่ระบบก่อนทำการบริจาค',
            });
            navigate("/login");
            return;
        }

        if (daysLeft <= 0) {
            Swal.fire({
                icon: 'error',
                title: 'หมดเขตการบริจาค',
                text: 'โครงการนี้หมดเขตการบริจาคแล้ว ไม่สามารถดำเนินการต่อได้',
            });
            return;
        }


        const confirmMessage = `คุณต้องการยืนยันการบริจาค จำนวน ${new Intl.NumberFormat('th-TH').format(formData.amount)} บาท ให้โครงการ "${projectData.project_name}" หรือไม่?`;

        const result = await Swal.fire({
            title: 'ยืนยันการบริจาค',
            text: confirmMessage,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'ยืนยัน',
            cancelButtonText: 'ยกเลิก',
            reverseButtons: true,
        });

        if (!result.isConfirmed) return;


        setLoading(true);

        try {
            const donationData = new FormData();
            donationData.append("amount", formData.amount);
            donationData.append("userId", userId); 
            donationData.append("projectId", projectId);

            if (file) {
                donationData.append("slip", file); // Multer จะรับได้
            }

            if (useTax) {
                donationData.append("useTax", "1");
                donationData.append("type_tax", formData.type_tax);

                if (formData.useExistingTax && formData.taxId) {
                    // ใช้ tax record ที่มีอยู่
                    donationData.append("useExistingTax", "1");
                    donationData.append("taxId", formData.taxId);
                } else {
                    // สร้าง tax record ใหม่
                    donationData.append("useExistingTax", "0");
                    if (formData.type_tax === "individual") {
                        donationData.append("name", formData.name || ""); // backend ใช้ field name
                        donationData.append("tax_number", formData.tax_number || "");
                        donationData.append("phone", formData.phone || "");
                        donationData.append("email", formData.email || "");
                    } else if (formData.type_tax === "corporate") {
                        donationData.append("name", formData.company_name || "");
                        donationData.append("tax_number", formData.tax_number || "");
                        donationData.append("phone", formData.phone || "");
                        donationData.append("email", formData.email || "");
                    }
                }
            } else {
                donationData.append("useTax", "0");
            }

            if (formData.useExistingTax && formData.taxId) {
                donationData.append("useExistingTax", "1");
                donationData.append("taxId", formData.taxId);
            }

            const response = await axios.post(HOSTNAME + `/donate/donation`, donationData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
            });

            if (response.data?.donationId) {
                Swal.fire({
                    icon: 'success',
                    title: 'บริจาคสำเร็จ',
                    text: 'ขอบคุณสำหรับการบริจาคของคุณ! ระบบได้บันทึกการบริจาคเรียบร้อยแล้ว',
                });
                sessionStorage.removeItem("donationFormData");
                if (role === 3) {
                    navigate("/alumni-profile/alumni-profile-donation");
                } else if (role === 4) {
                    navigate("/student-profile/student-profile-donation");
                } else if (role === 2) {
                    navigate("/president-profile/president-profile-donation");
                } else {
                    navigate("/"); // fallback
                }
            } else {
                throw new Error(response.data?.message || "การบริจาคไม่สำเร็จ");
            }

        } catch (error) {
            console.error('Donation error:', error);
            let errorMessage = error.response?.data?.error || error.message || "เกิดข้อผิดพลาดในการส่งข้อมูล";
            alert(`เกิดข้อผิดพลาด: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    // คำนวณเปอร์เซ็นต์ความคืบหน้า
    const progressPercent = projectData.target_amount && projectData.current_amount
        ? Math.min(100, (projectData.current_amount / projectData.target_amount) * 100)
        : 0;

    // แสดงข้อผิดพลาด
    if (error) {
        return (
            <div className="error-container">
                <IoWarningOutline size={48} color="#ff4444" />
                <h3>เกิดข้อผิดพลาด</h3>
                <p>{error}</p>
                <button onClick={() => navigate(-1)} className="back-button">
                    กลับ
                </button>
            </div>
        );
    }

    // ไม่มีข้อมูล
    if (!formData || !projectId) {
        return (
            <div className="no-data-container">
                <IoWarningOutline size={48} color="#ffa500" />
                <h3>ไม่มีข้อมูล</h3>
                <p>ไม่มีข้อมูลการบริจาค กรุณากลับไปกรอกฟอร์มใหม่</p>
                <Link to="/donate" className="back-link">
                    กลับไปหน้าบริจาค
                </Link>
            </div>
        );
    }

    return (
        <div className="donate-confirm-container">
            {/* Header */}
            <div className="confirm-header">
                <h2>ยืนยันข้อมูลการบริจาค</h2>
                <p className="confirm-subtitle">กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนยืนยัน</p>
            </div>

            {/* Status Banner */}
            <div className={`status-banner ${isDataValid ? 'valid' : 'invalid'}`}>
                <div className="status-content">
                    {isDataValid ? (
                        <>
                            <IoCheckmarkCircleOutline size={20} />
                            <span>ข้อมูลครบถ้วน พร้อมยืนยันการบริจาค</span>
                        </>
                    ) : (
                        <>
                            <IoWarningOutline size={20} />
                            <span>ข้อมูลไม่ครบถ้วน กรุณาตรวจสอบ</span>
                        </>
                    )}
                </div>
                <div className="confirmation-time">
                    <small>เวลาที่ยืนยัน: {formatDateTime()}</small>
                </div>
            </div>

            <div className="donate-confirm-content">
                {/* ข้อมูลการบริจาค - ส่วนหลัก */}
                <div className="confirmation-section main-donation-info">
                    <div className="section-header">
                        <MdAttachMoney className="section-icon" />
                        <h3>ข้อมูลการบริจาค</h3>
                    </div>

                    <div className="info-grid">
                        <div className="info-item highlight-amount">
                            <label>จำนวนเงินที่บริจาค</label>
                            <div className="amount-display">
                                <span className="amount-number">
                                    {formData.amount ? new Intl.NumberFormat('th-TH').format(formData.amount) : "0"}
                                </span>
                                <span className="currency">บาท</span>
                            </div>
                        </div>

                        <div className="info-item">
                            <label>โครงการที่บริจาค</label>
                            <div className="project-name">
                                {projectData.project_name || "กำลังโหลด..."}
                            </div>
                        </div>

                        <div className="info-item">
                            <label>รหัสโครงการ</label>
                            <div className="project-id">#{projectId}</div>
                        </div>
                    </div>
                </div>

                {/* ข้อมูลใบกำกับภาษี */}
                {useTax && showTaxForm && (
                    <div className="confirmation-section tax-info-section">
                        <div className="section-header">
                            <MdReceipt className="section-icon" />
                            {taxType === "individual" && (
                                <h3>ข้อมูลใบกำกับภาษี (บุคคลธรรมดา) </h3>
                            )}
                            {taxType === "corporate" && (
                                <h3>ข้อมูลใบกำกับภาษี (นิติบุคคล) </h3>
                            )}
                        </div>

                        <div className="info-grid">
                            {taxType === "individual" && (
                                <div className="info-item">
                                    <label>
                                        <FaUser className="input-icon" />
                                        ชื่อ-นามสกุล
                                    </label>
                                    <div className="info-value">
                                        {formData.name || <span className="missing-data">ไม่ระบุ</span>}
                                    </div>
                                </div>
                            )}

                            {taxType === "corporate" && (
                                <div className="info-item">
                                    <label>
                                        <FaBuilding className="input-icon" />
                                        ชื่อบริษัท
                                    </label>
                                    <div className="info-value">
                                        {formData.company_name || <span className="missing-data">ไม่ระบุ</span>}
                                    </div>
                                </div>
                            )}

                            <div className="info-item">
                                <label>
                                    <FaIdCard className="input-icon" />
                                    เลขประจำตัวผู้เสียภาษี
                                </label>
                                <div className="info-value">
                                    {formData.tax_number || <span className="missing-data">ไม่ระบุ</span>}
                                </div>
                            </div>

                            {formData.phone && (
                                <div className="info-item">
                                    <label>
                                        <FaPhone className="input-icon" />
                                        หมายเลขโทรศัพท์
                                    </label>
                                    <div className="info-value">{formData.phone}</div>
                                </div>
                            )}

                            {formData.email && (
                                <div className="info-item">
                                    <label>
                                        <FaEnvelope className="input-icon" />
                                        อีเมล
                                    </label>
                                    <div className="info-value">{formData.email}</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* หลักฐานการโอนเงิน */}
                <div className="confirmation-section slip-section">
                    <div className="section-header">
                        <FaFileImage className="section-icon" />
                        <h3>หลักฐานการโอนเงิน</h3>
                    </div>

                    {filePreview ? (
                        <div className="slip-preview">
                            <img
                                src={filePreview}
                                alt="สลิปการโอนเงิน"
                                className="slip-image"
                                style={{ maxWidth: "300px", maxHeight: "300px", objectFit: "contain", cursor: "pointer" }}
                            />
                        </div>
                    ) : (
                        <div className="no-file-warning">
                            <IoWarningOutline size={24} />
                            <span>ไม่มีไฟล์หลักฐานการโอนเงิน</span>
                        </div>
                    )}
                </div>

                {/* รายละเอียดโครงการ */}
                <div className="confirmation-section project-details">
                    <div className="section-header">
                        <IoInformationCircleOutline className="section-icon" />
                        <h3>รายละเอียดโครงการ</h3>
                    </div>

                    <div className="project-summary">
                        {projectData.image_path && (
                            <img
                                src={`${API_BASE_URL}/uploads/${projectData.image_path}`}
                                alt="รูปโครงการ"
                                className="project-image"
                                onError={(e) => {
                                    e.target.src = `${process.env.PUBLIC_URL}/image/default.png`;
                                }}
                            />
                        )}

                        <div className="project-info">
                            <div className="progress-section-confirm">
                                <div className="progress-info-item">
                                    {/* <label>โครงการที่บริจาค</label> */}
                                    <div className="project-name">
                                        {projectData.project_name || "กำลังโหลด..."}
                                    </div>
                                </div>
                                <div className="progress-bar-container">
                                    <div
                                        className="progress-bar-confirm"
                                        style={{ width: `${progressPercent}%` }}
                                    ></div>
                                    <span className="progress-percent">
                                        {progressPercent.toFixed(0)}%
                                    </span>
                                </div>
                                <div className="progress-details">
                                    <span>ยอดปัจจุบัน: <strong>{new Intl.NumberFormat('th-TH').format(projectData.current_amount || 0)} บาท</strong></span>
                                    <span>เป้าหมาย: <strong>{new Intl.NumberFormat('th-TH').format(projectData.target_amount || 0)} บาท</strong></span>
                                </div>
                            </div>

                            <div className="project-description">
                                <p>{projectData.description || "ไม่มีรายละเอียด"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* สรุปและการดำเนินการ */}
                <div className="confirmation-section action-section">
                    <div className="section-header">
                        <IoCheckmarkCircleOutline className="section-icon" />
                        <h3>สรุปการดำเนินการ</h3>
                    </div>

                    <div className="summary-box">
                        <h4>คุณกำลังจะบริจาค</h4>
                        <div className="summary-amount">
                            {new Intl.NumberFormat('th-TH').format(formData.amount || 0)} บาท
                        </div>
                        <p>ให้โครงการ <strong>"{projectData.project_name}"</strong></p>

                        {/* แสดงเฉพาะเมื่อเลือกออกใบกำกับภาษี */}
                        {showTaxForm && useTax && (
                            <p className="tax-note">
                                <MdReceipt size={16} />
                                พร้อมออกใบกำกับภาษี
                            </p>
                        )}
                    </div>

                    {/* คำเตือน */}
                    {!isDataValid && (
                        <div className="warning-box">
                            <IoWarningOutline size={20} />
                            <p>กรุณาตรวจสอบข้อมูลให้ครบถ้วนก่อนยืนยันการบริจาค</p>
                        </div>
                    )}

                    {daysLeft <= 0 && (
                        <div className="error-box">
                            <IoWarningOutline size={20} />
                            <p>โครงการนี้หมดเขตการบริจาคแล้ว ไม่สามารถดำเนินการต่อได้</p>
                        </div>
                    )}

                    {/* ปุ่มดำเนินการ */}
                    <div className="action-buttons">
                        <button
                            className="cancel-button-donate"
                            onClick={() =>
                                navigate(`/donate/donatedetail/${projectId}`, {
                                    state: { fromConfirm: true }
                                })
                            }
                        >
                            ← กลับไปแก้ไข
                        </button>

                        <button
                            className="confirm-button"
                            onClick={handleConfirm}
                            disabled={loading || !isDataValid || daysLeft <= 0}
                        >
                            {loading ? (
                                <span>กำลังดำเนินการ...</span>
                            ) : (
                                <span>✓ ยืนยันการบริจาค</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default DonateConfirm;