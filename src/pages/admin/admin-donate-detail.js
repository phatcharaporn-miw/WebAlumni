import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../css/adminDonate.css';

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
                const response = await axios.get(`http://localhost:3001/admin/donatedetail/${id}`);
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
            <div className="mb-4">
                <nav className="nav Adminnav-tabs">
                    <Link
                        className={`adminnav-link ${location.pathname.startsWith('/admin/donations') ? 'active' : ''}`}
                        to="/admin/donations"
                    >
                        <i className="fas fa-project-diagram me-2"></i>
                        การจัดการโครงการบริจาค
                    </Link>

                    <Link
                        className={`adminnav-link ${location.pathname === '/admin/donations/check-payment-donate' ? 'active' : ''}`}
                        to="/admin/donations/check-payment-donate"
                    >
                        <i className="fas fa-credit-card me-2"></i>
                        การจัดการตรวจสอบการชำระเงินบริจาค
                    </Link>
                </nav>
            </div>
            <div className="container mt-4">
                <div className="row justify-content-center">
                    <div className="px-0">
                        <div className="card shadow">
                            <div className="card-header-infoDonate text-white">
                                <h4 className="mb-0">
                                    <i className="fas fa-info-circle"></i> รายละเอียดโครงการ
                                </h4>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    {/* รูปภาพโครงการ */}
                                    <div className="col-md-4 mb-4">
                                        <div className="text-center">
                                            {project.image_path ? (
                                                <img
                                                    src={`http://localhost:3001/uploads/${project.image_path}`}
                                                    alt={project.project_name}
                                                    className="img-fluid rounded shadow"
                                                    style={{ maxHeight: '300px', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div className="border rounded d-flex align-items-center justify-content-center" style={{ height: '200px', backgroundColor: '#f8f9fa' }}>
                                                    <div className="text-muted">
                                                        <i className="fas fa-image fa-3x"></i>
                                                        <p className="mt-2">ไม่มีรูปภาพ</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* ข้อมูลโครงการ */}
                                    <div className="col-md-8">
                                        <div className="row">
                                            <div className="col-12 mb-3">
                                                <h5 className="text-primary">{project.project_name}</h5>
                                                <p className="text-muted mb-2">
                                                    <i className="fas fa-tag"></i> {getDonationTypeText(project.donation_type)}
                                                </p>
                                            </div>
                                            <div className="d-flex gap-2">
                                                <span className={`badge ${statusInfo.class} px-3 py-2`}>
                                                    {statusInfo.text}
                                                </span>
                                                {daysRemaining && (
                                                    <span className={`badge bg-light text-dark px-3 py-2 ${daysRemaining.class}`}>
                                                        <i className="fas fa-clock"></i> {daysRemaining.text}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <h6 className="fw-bold">เป้าหมายเงินบริจาค</h6>
                                                <p className="text-success fs-5">
                                                    <i className="fas fa-bullseye"></i> {formatAmount(project.target_amount)} บาท
                                                </p>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <h6 className="fw-bold">ยอดบริจาคปัจจุบัน</h6>
                                                <p className="text-info fs-5">
                                                    <i className="fas fa-coins"></i> {formatAmount(project.current_amount)} บาท
                                                </p>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mb-4">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <h6 className="fw-bold mb-0">ความคืบหน้า</h6>
                                                <span className="badge bg-primary">{progress.toFixed(1)}%</span>
                                            </div>
                                            <div className="progress" style={{ height: '20px' }}>
                                                <div
                                                    className="progress-bar progress-bar-striped progress-bar-animated"
                                                    role="progressbar"
                                                    style={{ width: `${progress}%` }}
                                                    aria-valuenow={progress}
                                                    aria-valuemin="0"
                                                    aria-valuemax="100"
                                                >
                                                    {progress > 10 ? `${progress.toFixed(1)}%` : ''}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6 ">
                                                <h6 className="fw-bold">วันที่เริ่มต้น</h6>
                                                <p><i className="fas fa-calendar-alt text-success"></i> {formatDate(project.start_date)}</p>
                                            </div>
                                            <div className="col-md-6">
                                                <h6 className="fw-bold">วันที่สิ้นสุด</h6>
                                                <p><i className="fas fa-calendar-times text-danger"></i> {formatDate(project.end_date)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* รายละเอียดโครงการ */}
                                <div className="row">
                                    <div className="col-12">
                                        <h6 className="fw-bold">รายละเอียดโครงการ</h6>
                                        <div className="p-3 bg-light rounded">
                                            <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                                                {project.description || 'ไม่มีรายละเอียด'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* ข้อมูลธนาคาร */}
                                <div className="row mt-4">
                                    <div className="col-12">
                                        <h6 className="fw-bold">ข้อมูลการโอนเงิน</h6>
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <div className="card bg-light">
                                                    <div className="card-body">
                                                        <h6 className="card-title">
                                                            <i className="fas fa-university text-primary"></i> ธนาคาร
                                                        </h6>
                                                        <p className="card-text">{project.bank_name || '-'}</p>
                                                        <p className="card-text">
                                                            <strong>เลขบัญชี:</strong> {project.account_number || '-'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <div className="card bg-light">
                                                    <div className="card-body">
                                                        <h6 className="card-title">
                                                            <i className="fas fa-mobile-alt text-success"></i> PromptPay
                                                        </h6>
                                                        <p className="card-text">
                                                            {project.number_promtpay || 'ไม่มีข้อมูล'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ปุ่มจัดการ */}
                                <div className="d-flex gap-2 justify-content-end mt-4 pt-3 border-top">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={handleBack}
                                    >
                                        <i className="fas fa-arrow-left"></i> กลับ
                                    </button>
                                    <button
                                        className="btn btn-warning"
                                        onClick={handleEdit}
                                    >
                                        <i className="fasfa-edit"></i> แก้ไข
                                    </button>
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