import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../css/adminDonate-Detail.css';
import { HiOutlineClock } from "react-icons/hi";
import {HOSTNAME} from '../../config.js';

function AdminProjectDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [project, setProject] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const fetchProject = async () => {
            try {
                // console.log('Fetching project with ID:', id);
                const response = await axios.get(HOSTNAME +`/admin/donatedetail/${id}`);
                setProject(response.data);
                setLoading(false);
            } catch (error) {
                // console.error('Error fetching project:', error);
                setError('ไม่พบโครงการที่ต้องการแสดงรายละเอียด');
                setLoading(false);
            }
        };
        fetchProject();
    }, [id]);

    // ฟังก์ชันแปลงประเภทการบริจาค
    const getDonationTypeText = (type) => {
        switch (type) {
            case 'things':
                return 'สิ่งของ';
            case 'fundraising':
                return 'บริจาคแบบระดมทุน';
            case 'unlimited':
                return 'บริจาคแบบไม่จำกัดจำนวน';
            default:
                return type;
        }
    };

    // ฟังก์ชันตรวจสอบว่าโครงการสิ้นสุดหรือยัง
    const isProjectExpired = (endDate) => {
        if (!endDate) return false;
        const today = new Date();
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        return today > end;
    };

    //ฟังก์ชันสถานะ
    const getStatusText = (status, endDate) => {
        if (isProjectExpired(endDate)) {
            return { text: 'สิ้นสุดแล้ว', class: 'stt-success' };
        }

        switch (status) {
            case '0':
                return { text: 'ไม่ได้ใช้งาน', class: 'bg-secondary' };
            case '1':
                return { text: 'ใช้งาน', class: 'stt-use' };
            case '2':
                return { text: 'สิ้นสุดแล้ว', class: 'stt-success' };
            default:
                return { text: 'ไม่ทราบสถานะ', class: 'stt-null' };
        }
    };

    // ฟังก์ชันแปลงวันที่
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getDaysRemaining = (endDate) => {
        if (!endDate) return null;

        const today = new Date();
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const timeDiff = end - today;
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        if (daysDiff < 0) {
            return { text: 'โครงการสิ้นสุดแล้ว', class: 'text-danger' };
        } else if (daysDiff === 0) {
            return { text: 'วันสุดท้าย', class: 'text-warning' };
        } else if (daysDiff <= 7) {
            return { text: `เหลือ ${daysDiff} วัน`, class: 'text-warning' };
        } else {
            return { text: `เหลือ ${daysDiff} วัน`, class: 'text-success' };
        }
    };

    const formatAmount = (amount) => {
        if (!amount) return '0';
        return Number(amount).toLocaleString('th-TH');
    };

    const getProgress = () => {
        if (!project.target_amount || project.target_amount <= 0) return 0;
        const progress = (project.current_amount / project.target_amount) * 100;
        return Math.min(progress, 100);
    };

    const handleEdit = () => {
        navigate(`/admin/donations/edit/${id}`);
    };

    const handleBack = () => {
        navigate('/admin/donations');
    };

    if (!project) {
        return (
            <div className="container mt-5">
                <div className="alert alert-warning" role="alert">
                    <h4 className="alert-heading">ไม่พบข้อมูล</h4>
                    <p>ไม่พบโครงการที่ต้องการแสดงรายละเอียด</p>
                    <button
                        className="btn btn-outline-warning"
                        onClick={handleBack}
                    >
                        กลับหน้าจัดการโครงการ
                    </button>
                </div>
            </div>
        );
    }

    const statusInfo = getStatusText(project.status, project.end_date);
    const progress = getProgress();
    const daysRemaining = getDaysRemaining(project.end_date);

    return (
        <div className="donate-activity-container">
            {/* Enhanced Navigation */}
            <div className="mb-4">
                <nav className="nav Adminnav-tabs position-relative">
                    <div className="nav-background-blur"></div>
                    <Link
                        className={`adminnav-link position-relative ${location.pathname.startsWith('/admin/donations') ? 'active' : ''}`}
                        to="/admin/donations"
                    >
                        การจัดการโครงการบริจาค
                        <div className="nav-hover-effect"></div>
                    </Link>
                </nav>
            </div>

            <div className="container mt-4">
                <div className="row justify-content-center">
                    <div className="px-0">
                        {/* Enhanced Card with Animations */}
                        <div className="card shadow-lg border-0 project-detail-card">
                            <div className="card-header-infoDonate text-white position-relative overflow-hidden">
                                <div className="header-gradient-overlay"></div>
                                <div className="floating-shapes">
                                    <div className="shape shape-1"></div>
                                    <div className="shape shape-2"></div>
                                    <div className="shape shape-3"></div>
                                </div>
                                <h4 className="mb-0 position-relative z-index-10">
                                    <i className="fas fa-info-circle me-2"></i>
                                    รายละเอียดโครงการ
                                </h4>
                            </div>

                            <div className="card-body p-4">
                                <div className="text-center image-container">
                                    {project.image_path ? (
                                        <div className="image-wrapper position-relative">
                                            <img
                                                src={HOSTNAME +`/uploads/${project.image_path}`}
                                                alt={project.project_name}
                                                className="img-fluid shadow-lg project-image mx-auto d-block"
                                                style={{ maxHeight: '400px', width: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                    ) : (
                                        <div
                                            className="no-image-placeholder border-0 rounded-3 d-flex align-items-center justify-content-center shadow-sm mx-auto"
                                            style={{
                                                height: '400px',
                                                width: '100%',
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            }}
                                        >
                                            <div className="text-white text-center">
                                                <div className="placeholder-icon-wrapper">
                                                    <i className="fas fa-image fa-4x mb-3 opacity-75"></i>
                                                </div>
                                                <p className="mt-2 mb-0 fw-semibold">ไม่มีรูปภาพ</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Enhanced Project Information */}
                                <div className="col-md-10 mx-auto mt-5">
                                    {/* <div className="project-info-section bg-white rounded-4 shadow-lg p-4"> */}

                                        {/* Title & Tag */}
                                        <div className="mb-4 text-center">
                                            <h2 className="fw-bold mb-2">{project.project_name}</h2>
                                            <p className="text-muted mb-2">
                                                <i className="fas fa-tag me-2 "></i>
                                                <span className=" px-3 py-2 rounded-pill text-primary">
                                                    {getDonationTypeText(project.donation_type)}
                                                </span>
                                            </p>
                                            {daysRemaining && (
                                                <span className={`badge px-3 py-2 fs-6 ${daysRemaining.class}`}>
                                                    <HiOutlineClock className="me-1" />
                                                    {daysRemaining.text}
                                                </span>
                                            )}
                                        </div>

                                        {/* Amount Cards */}
                                        <div className="row g-4 mb-4 text-center">
                                            <div className="col-md-6">
                                                <div className="amount-card border rounded-3 p-4 h-100 shadow-sm">
                                                    <h6 className="fw-bold text-muted mb-2">เป้าหมายเงินบริจาค</h6>
                                                    <p className="amount-value fs-3 fw-bold mb-0">
                                                        {formatAmount(project.target_amount)} บาท
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="amount-card border rounded-3 p-4 h-100 shadow-sm">
                                                    <h6 className="fw-bold text-muted mb-2">ยอดบริจาคปัจจุบัน</h6>
                                                    <p className="amount-value fs-3 fw-bold mb-0">
                                                        {formatAmount(project.current_amount)} บาท
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="progress-section mb-5">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <h6 className="fw-bold mb-0 d-flex align-items-center">
                                                    <i className="fas fa-chart-line me-2 text-primary"></i>
                                                    ความคืบหน้า
                                                </h6>
                                                <span className="badge bg-primary fs-6 rounded-pill">
                                                    {progress.toFixed(1)}%
                                                </span>
                                            </div>
                                            <div className="progress" style={{ height: '22px' }}>
                                                <div
                                                    className="progress-bar"
                                                    role="progressbar"
                                                >
                                                    {progress > 15 ? `${progress.toFixed(1)}%` : ''}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Dates */}
                                        <div className="row g-4 text-center">
                                            <div className="col-md-6">
                                                <div className="date-card border p-4 rounded-3 shadow-sm">
                                                    <h6 className="fw-bold text-muted mb-2">วันที่เริ่มต้น</h6>
                                                    <p className="mb-0">{formatDate(project.start_date)}</p>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="date-card border p-4 rounded-3 shadow-sm">
                                                    <h6 className="fw-bold text-muted mb-2">วันที่สิ้นสุด</h6>
                                                    <p className="mb-0 ">{formatDate(project.end_date)}</p>
                                                </div>
                                            </div>
                                        </div>
                                </div>


                                {/* Enhanced Project Description */}
                                <div className="row mt-4">
                                    <div className="col-12">
                                        <div className="description-section">
                                            <h5 className="fw-bold mb-3 d-flex align-items-center">
                                                รายละเอียดโครงการ
                                            </h5>
                                            <div className="description-content p-4 rounded-3 shadow-sm">
                                                <div className="description-text">
                                                    <p className="mb-0 lh-lg" style={{ whiteSpace: 'pre-wrap' }}>
                                                        {project.description || (
                                                            <span className="text-muted fst-italic">
                                                                ไม่มีรายละเอียด
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Enhanced Bank Information */}
                                <div className="row mt-5">
                                    <div className="col-12">
                                        <h5 className="fw-bold mb-4 d-flex align-items-center">
                                            ข้อมูลการโอนเงิน
                                        </h5>
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <div className="payment-card bank-card h-100">
                                                    <div className="card-gradient-bg"></div>
                                                    <div className="card-content p-4">
                                                        <div className="card-header-custom mb-3">
                                                            <h6 className="card-title fw-bold d-flex align-items-center mb-0">
                                                                ธนาคาร  {project.bank_name || 'ไม่ระบุธนาคาร'}
                                                            </h6>
                                                        </div>
                                                        <div className="bank-info">
                                                            <div className="account-number-section">
                                                                <span className="text-muted small">เลขบัญชี</span>
                                                                <p className="account-number fs-4 fw-bold text-primary mb-0 font-monospace">
                                                                    {project.account_number || 'ไม่ระบุเลขบัญชี'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <div className="payment-card promptpay-card h-100">
                                                    <div className="card-gradient-bg-green"></div>
                                                    <div className="card-content p-4">
                                                        <div className="card-header-custom mb-3">
                                                            <h6 className="card-title fw-bold d-flex align-items-center mb-0">
                                                                พร้อมเพย์
                                                            </h6>
                                                        </div>
                                                        <div className="promptpay-info">
                                                            <span className="text-muted small">หมายเลขพร้อมเพย์</span>
                                                            <p className="promptpay-number fs-4 fw-bold text-success mb-0 font-monospace">
                                                                {project.number_promtpay || 'ไม่มีข้อมูล PromptPay'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Enhanced Action Buttons */}
                                <div className="action-buttons-section mt-5 pt-4 border-top">
                                    <div className="d-flex gap-3 justify-content-end flex-wrap">
                                        <button
                                            className="btn btn-secondary btn-lg px-4 enhanced-btn back-btn"
                                            onClick={handleBack}
                                        >
                                            ย้อนกลับ
                                        </button>
                                        <button
                                            className="btn btn-warning btn-lg px-4 enhanced-btn edit-btn"
                                            onClick={handleEdit}
                                        >
                                            แก้ไข
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminProjectDetail;