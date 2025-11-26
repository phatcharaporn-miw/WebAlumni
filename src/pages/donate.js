import React, { useEffect, useState, useMemo } from "react";
import "../css/Donate.css";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { FaSearch, FaRegClock, FaArrowRight, FaChevronLeft, FaChevronRight, FaHeart, FaUsers } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { BiCoin } from 'react-icons/bi';
import { FaCoins } from 'react-icons/fa6';
import { HOSTNAME } from '../config.js';
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext.js";

function Donate() {
    const { user } = useAuth();
    const userId = user?.user_id;
    const [projects, setProjects] = useState([]);
    const [recentDonors, setRecentDonors] = useState([]);
    const [filter, setFilter] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedRange, setSelectedRange] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    const navigate = useNavigate();
    const projectsPerPage = 6;

    const [summary, setSummary] = useState({
        totalProjectsAmount: 0,
        totalGeneralAmount: 0,
    });

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(HOSTNAME + "/donate/donate");
                setProjects(response.data || []);
            } catch (err) {
                console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", err);
                setError("ไม่สามารถโหลดข้อมูลโครงการได้ กรุณาลองใหม่อีกครั้ง");
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    // ดึงคนบริจาคล่าสุด
    useEffect(() => {
        const fetchRecentDonation = async () => {
            try {
                const response = await axios.get(HOSTNAME + "/donate/recent-donation");
                setRecentDonors(response.data || []);
            } catch (err) {
                console.error("เกิดข้อผิดพลาดในการดึงข้อมูลผู้บริจาค:", err);
            }
        };
        fetchRecentDonation();
    }, []);

    useEffect(() => {
        const fetchDonationSummary = async () => {
            try {
                const response = await axios.get(HOSTNAME + "/donate/donation-summary");
                setSummary(response.data || { totalProjectsAmount: 0, totalGeneralAmount: 0 });
            } catch (err) {
                console.error("ไม่สามารถโหลดสรุปยอดบริจาคได้:", err);
            }
        };
        fetchDonationSummary();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("th-TH", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };


    // เพิ่ม state สำหรับเก็บ filters (ถ้ายังไม่มี)
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        minAmount: '',
        maxAmount: ''
    });

    const calculateDaysRemaining = (endDate) => {
        if (!endDate) return null;
        const now = new Date();
        const end = new Date(endDate);
        const diffTime = end - now;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const getTimeSince = (dateString) => {
        const now = new Date();
        const donationDate = new Date(dateString);
        const diffMs = now - donationDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "เมื่อสักครู่";
        if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
        if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
        if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
        return donationDate.toLocaleDateString("th-TH");
    };

    const handleFilterChange = (e) => {
        setFilterStatus(e.target.value);
        setCurrentPage(1);
    };

    const handleFilterTypeChange = (e) => {
        setFilter(e.target.value);
        setCurrentPage(1);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        setFilter("all");
        setFilterStatus("all");
        setSearchTerm("");
        setSelectedRange("all");
        setCurrentPage(1);
    };

    // ฟังก์ชันช่วยเช็กว่าเดือนอยู่ในช่วงที่เลือกหรือไม่
    const isInSelectedMonthRange = (date, range) => {
        if (!date || range === "all") return true;
        const month = new Date(date).getMonth() + 1; // getMonth() = 0-11
        const [start, end] = range.split("-").map(Number);
        return month >= start && month <= end;
    };

    // Filter projects
    const filteredProjects = useMemo(() => {
        return projects.filter((project) => {
            const now = new Date();
            const startDate = project?.start_date ? new Date(project.start_date) : null;
            const endDate = project?.end_date ? new Date(project.end_date) : null;

            if (filter !== "all" && project.donation_type !== filter) return false;

            // ฟิลเตอร์ช่วงเดือน
            if (selectedRange !== "all") {
                // ถ้าไม่มี start_date หรือ end_date ก็ไม่ผ่าน
                if (!startDate && !endDate) return false;
                const startInRange = isInSelectedMonthRange(startDate, selectedRange);
                const endInRange = isInSelectedMonthRange(endDate, selectedRange);
                if (!startInRange && !endInRange) return false;
            }

            if (filterStatus === "active" && endDate && now > endDate) return false;
            if (filterStatus === "expired" && endDate && now <= endDate) return false;

            if (searchTerm.trim()) {
                const searchLower = searchTerm.toLowerCase();
                const nameMatch = project.project_name?.toLowerCase().includes(searchLower);
                const descMatch = project.description?.toLowerCase().includes(searchLower);
                if (!nameMatch && !descMatch) return false;
            }
            return true;
        });
    }, [projects, filter, filterStatus, searchTerm, selectedRange]);

    // Pagination
    const indexOfLastProject = currentPage * projectsPerPage;
    const indexOfFirstProject = indexOfLastProject - projectsPerPage;
    const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);
    const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const getFilterTitle = (donationType) => {
        const titles = {
            "fundraising": "บริจาคแบบระดมทุน",
            "unlimited": "บริจาคแบบไม่จำกัดจำนวน",
            "things": "บริจาคสิ่งของ",
        };
        return titles[donationType] || "โครงการบริจาคทั้งหมด";
    };

    const truncateText = (text, maxLength) => {
        if (!text) return "";
        return text.length <= maxLength ? text : text.substring(0, maxLength) + "...";
    };


    const getProjectStatusBadge = (project) => {
        if (!project?.start_date || !project?.end_date) return null;

        const now = new Date();
        const startDate = new Date(project.start_date);
        const endDate = new Date(project.end_date);

        // คำนวณวันเหลือ
        const calculateDaysRemaining = (end) => {
            const diffTime = end - now;
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        };
        const daysRemaining = calculateDaysRemaining(endDate);

        // เงื่อนไขสถานะ
        if (now < startDate) {
            return (
                <span className="donate-badge donate-badge-secondary">
                    กำลังจะเริ่ม
                </span>
            );
        }

        if (now >= startDate && now <= endDate) {
            if (daysRemaining <= 5) {
                return (
                    <span className="donate-badge donate-badge-warning">
                        ใกล้สิ้นสุด
                    </span>
                );
            }
            return (
                <span className="donate-badge donate-badge-active">
                    กำลังดำเนินการ
                </span>
            );
        }

        if (now > endDate) {
            return (
                <span className="donate-badge donate-badge-expired">
                    สิ้นสุดแล้ว
                </span>
            );
        }

        return null;
    };

    const handleDonateClick = () => {
        if (!userId) {
            //ถ้ายังไม่เข้าสู่ระบบ
            Swal.fire({
                title: "กรุณาเข้าสู่ระบบ",
                text: "คุณต้องเข้าสู่ระบบก่อน",
                icon: "warning",
                confirmButtonText: "เข้าสู่ระบบ"
            }).then(() => {
                navigate("/login");
            });
            return;
        }

        navigate("/donate/donate-general");
    };


    const handleTagClick = (type) => {
        setFilter(type || "all");
        setCurrentPage(1);
    };

    return (
        <div className="donate-page">
            <img src="./image/donation (1).jpg" className="donate-header-image" alt="donation" />
            <div className="donate-content-wrapper">

                {/* Filters */}
                <div className="donate-filters">
                    <div className="row g-3">
                        <div className="col-lg-3 col-md-4">
                            <label htmlFor="search" className="form-label">ค้นหาโครงการ:</label>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <FaSearch />
                                </span>
                                <input
                                    type="text"
                                    id="search"
                                    className="form-control"
                                    placeholder="ค้นหาชื่อโครงการหรือรายละเอียด..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                />
                            </div>
                        </div>

                        <div className="col-lg-3 col-md-4">
                            <label htmlFor="donation-type" className="form-label">ประเภทการบริจาค:</label>
                            <select
                                id="donation-type"
                                className="form-select"
                                value={filter}
                                onChange={handleFilterTypeChange}
                            >
                                <option value="all">โครงการทั้งหมด</option>
                                <option value="fundraising">บริจาคแบบระดมทุน</option>
                                <option value="unlimited">บริจาคแบบไม่จำกัดจำนวน</option>
                                <option value="things">บริจาคสิ่งของ</option>
                            </select>
                        </div>

                        <div className="col-lg-2 col-md-3">
                            <label htmlFor="month-range" className="form-label">ช่วงเดือน:</label>
                            <select
                                id="month-range"
                                className="form-select"
                                value={selectedRange}
                                onChange={(e) => setSelectedRange(e.target.value)}
                            >
                                <option value="all">ทุกเดือน</option>
                                <option value="1-4">มกราคม - เมษายน</option>
                                <option value="5-8">พฤษภาคม - สิงหาคม</option>
                                <option value="9-12">กันยายน - ธันวาคม</option>
                            </select>
                        </div>

                        <div className="col-lg-2 col-md-4">
                            <label htmlFor="status-filter" className="form-label">สถานะกิจกรรม:</label>
                            <select
                                id="status-filter"
                                className="form-select"
                                value={filterStatus}
                                onChange={handleFilterChange}
                            >
                                <option value="all">ทั้งหมด</option>
                                <option value="active">กำลังจัดอยู่</option>
                                <option value="expired">สิ้นสุดแล้ว</option>
                            </select>
                        </div>

                        <div className="col-lg-2 col-md-4 d-flex flex-column">
                            <label className="form-label invisible">ล้าง</label>
                            <button
                                className="btn btn-outline-secondary"
                                onClick={handleClearFilters}
                                title="ล้างตัวกรอง"
                            >
                                <AiOutlineClose className="me-1" />
                                ล้าง
                            </button>
                        </div>
                    </div>
                </div>

                {/* สรุปยอดบริจาค */}
                <div className="donation-summary-section">
                    <div className="donation-summary-header">
                        {/* <FaHeart className="summary-header-icon" /> */}
                        <h3>สรุปยอดบริจาคทั้งหมด</h3>
                    </div>

                    <div className="donation-summary-grid">
                        <div
                            className="summary-card summary-card-projects cursor-pointer hover:shadow-lg transition"
                            onClick={() => navigate("/donate/donation-summary-detail/project")}
                        >
                            <div className="summary-card-icon">
                                <FaCoins />
                            </div>
                            <div className="summary-card-content">
                                <h6 className="summary-card-title text-start">ยอดบริจาคโครงการ</h6>
                                <p className="summary-card-amount">
                                    ฿{formatCurrency(summary.totalProjectsAmount)}
                                </p>
                                <span className="summary-card-label">จากโครงการทั้งหมด</span>
                            </div>
                        </div>

                        {/* การ์ดยอดบริจาคทั่วไป */}
                        <div
                            className="summary-card summary-card-general cursor-pointer hover:shadow-lg transition"
                            onClick={() => navigate("/donate/donation-summary-detail/general")}
                        >
                            <div className="summary-card-icon">
                                <FaHeart />
                            </div>
                            <div className="summary-card-content">
                                <h6 className="summary-card-title text-start">ยอดบริจาคทั่วไป</h6>
                                <p className="summary-card-amount">
                                    ฿{formatCurrency(summary.totalGeneralAmount)}
                                </p>
                                <span className="summary-card-label">สนับสนุนสมาคมโดยตรง</span>
                            </div>
                        </div>

                        {/* การ์ดยอดรวมทั้งหมด */}
                        <div
                            className="summary-card summary-card-total cursor-pointer hover:shadow-lg transition"
                            onClick={() => navigate("/donate/donation-summary-detail/all")}
                        >
                            <div className="summary-card-icon">
                                <BiCoin />
                            </div>
                            <div className="summary-card-content">
                                <h6 className="summary-card-title text-start">ยอดบริจาครวมทั้งหมด</h6>
                                <p className="summary-card-amount highlight">
                                    ฿{formatCurrency(summary.totalProjectsAmount + summary.totalGeneralAmount)}
                                </p>
                                <span className="summary-card-label">ยอดบริจาครวม</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="general-donation-banner">
                    <div className="general-donation-content">
                        <div className="general-donation-icon">
                            <FaHeart />
                        </div>
                        <div className="general-donation-text mb-0">
                            <h3>บริจาคทั่วไป</h3>
                            <p className="text-center">สนับสนุนสมาคมศิษย์เก่าวิทยาลัยการคอมพิวเตอร์โดยตรง ไม่ผ่านโครงการเฉพาะ</p>
                        </div>
                        <button className="btn-general-donate" onClick={handleDonateClick}>
                            บริจาคเลย
                            <FaArrowRight className="ms-2" />
                        </button>
                    </div>
                </div>

                {/* ผู้บริจาคล่าสุด */}
                <div className="recent-donors-section">
                    <div className="recent-donors-header">
                        <FaUsers />
                        <h4>รายชื่อผู้บริจาคล่าสุด</h4>
                        <button
                            className="btn btn-sm btn-primary"
                            style={{ marginLeft: 'auto' }}
                            onClick={() => navigate('/donate/donation-all')}
                        >
                            ดูทั้งหมด
                        </button>
                    </div>

                    {recentDonors.length > 0 ? (
                        <div className="recent-donors-list">
                            {recentDonors.map((donor, index) => (
                                <div key={index} className="donor-item">
                                    <div className="donor-avatar bg-gray-400 text-white overflow-hidden">
                                        {donor.profile_image ? (
                                            <img
                                                src={HOSTNAME + `/${donor.profile_image}`}
                                                alt={donor.full_name || "ผู้บริจาค"}
                                                onError={(e) => e.target.src = HOSTNAME + `/uploads/default-profile.png`}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            donor.full_name ? donor.full_name.charAt(0).toUpperCase() : "?"
                                        )}
                                    </div>
                                    <div className="donor-info">
                                        <div className="donor-name">
                                            {donor.full_name || 'ผู้บริจาคไม่ประสงค์ออกนาม'}
                                        </div>
                                        <div className="donor-details">
                                            <span className="donor-amount">฿{formatCurrency(donor.amount)}</span>
                                            <span className="donor-separator">•</span>
                                            <span className="donor-time">{getTimeSince(donor.donation_date)}</span>
                                        </div>
                                        {donor.project_name && (
                                            <div className="donor-project">
                                                โครงการ: {truncateText(donor.project_name, 40)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-donors-message">ยังไม่มีผู้บริจาค</p>
                    )}
                </div>

                {/* <div className="donate-create-button-wrapper">
                    <Link to="/donate/donaterequest">
                        <button className="donate-create-button">
                            <FaPlus className="me-2" />
                            สร้างโครงการบริจาค
                        </button>
                    </Link>
                </div> */}

                <h2 className="donate-title">
                    {getFilterTitle(filter)}
                    {filteredProjects.length > 0 && (
                        <span className="project-count">({filteredProjects.length})</span>
                    )}
                </h2>

                {error && (
                    <div className="alert alert-danger" role="alert">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        {error}
                    </div>
                )}

                <div className="donate-projects-container">
                    {filteredProjects.length === 0 ? (
                        <div className="donate-no-projects">
                            <i className="fas fa-search fa-3x text-muted mb-3"></i>
                            <h5>ไม่พบโครงการที่ตรงกับเงื่อนไข</h5>
                            <p className="text-muted">
                                {searchTerm
                                    ? `ไม่พบโครงการที่ตรงกับคำค้นหา "${searchTerm}"`
                                    : "ไม่มีโครงการบริจาคในขณะนี้"}
                            </p>
                            {(filter !== "all" || filterStatus !== "all" || searchTerm) && (
                                <button
                                    className="btn btn-primary mt-3"
                                    onClick={handleClearFilters}
                                >
                                    <AiOutlineClose className="me-2" />
                                    แสดงโครงการทั้งหมด
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="donate-projects-grid">
                                {currentProjects.map((project) => {
                                    const now = new Date();
                                    const startDate = project?.start_date ? new Date(project.start_date) : null;
                                    const endDate = project?.end_date ? new Date(project.end_date) : null;
                                    const formattedStartDate = startDate?.toLocaleDateString("th-TH") || "-";
                                    const formattedEndDate = endDate?.toLocaleDateString("th-TH") || "-";
                                    const progress = project.target_amount > 0
                                        ? (project.current_amount / project.target_amount) * 100
                                        : 0;
                                    const daysRemaining = calculateDaysRemaining(endDate);
                                    const isExpired = endDate && now > endDate;
                                    const isUpcoming = startDate && now < startDate;

                                    return (
                                        <div
                                            className={`donate-project-card ${isExpired ? "expired" : ""}`}
                                            key={project.project_id}
                                        >
                                            <div className="donate-project-image">
                                                <img
                                                    src={HOSTNAME + `/uploads/${project.image_path}`}
                                                    alt={project.project_name}
                                                    onError={(e) => {
                                                        e.target.src = "./image/default.jpg";
                                                    }}
                                                    loading="lazy"
                                                />
                                                <div className="donate-status-overlay">
                                                    {getProjectStatusBadge(project)}
                                                </div>
                                            </div>

                                            <div className="donate-project-content">
                                                <div className="donate-project-header">
                                                    <span
                                                        className={`donate-tag ${project.donation_type || "default"}`}
                                                        onClick={() => handleTagClick(project.donation_type)}
                                                        role="button"
                                                        tabIndex={0}
                                                    >
                                                        {getFilterTitle(project.donation_type)}
                                                    </span>
                                                    <small className="donate-project-date">
                                                        {formattedStartDate} - {formattedEndDate}
                                                    </small>
                                                </div>

                                                <h5 className="donate-project-title">
                                                    {truncateText(project.project_name, 60)}
                                                </h5>

                                                <p className="donate-project-description">
                                                    {truncateText(project.description, 120)}
                                                </p>

                                                <div className="donate-progress-section">
                                                    {project.donation_type !== "unlimited" &&
                                                        project.donation_type !== "things" &&
                                                        project.target_amount > 0 ? (
                                                        <div>
                                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                                <small className="text-muted">ความคืบหน้า</small>
                                                                <span className="donate-progress-percentage">
                                                                    {Math.round(progress)}%
                                                                </span>
                                                            </div>
                                                            <div className="bar">
                                                                <div className="progress-bar-container">
                                                                    <div
                                                                        className="progress-bar"
                                                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div style={{ height: "52px" }}></div>
                                                    )}
                                                </div>

                                                {/* Amount details */}
                                                <div className="donate-amounts">
                                                    <div className="donate-current-amount">
                                                        <small>ยอดบริจาคปัจจุบัน:</small>
                                                        <strong className="text-success">
                                                            ฿{formatCurrency(project.current_amount || 0)}
                                                        </strong>
                                                    </div>

                                                    {(project.donation_type !== "unlimited" &&
                                                        project.donation_type !== "things" &&
                                                        project.target_amount > 0) && (
                                                            <div className="donate-target-amount">
                                                                <small>เป้าหมาย:</small>
                                                                <strong>
                                                                    ฿{formatCurrency(project.target_amount || 0)}
                                                                </strong>
                                                            </div>
                                                        )}
                                                </div>

                                                {/* Days remaining */}
                                                <div className="donate-days-remaining">
                                                    {isUpcoming ? (
                                                        <span className="donate-upcoming">
                                                            <FaRegClock className="me-1" />
                                                            กำลังจะเริ่มในอีก {Math.ceil((startDate - now) / (1000 * 60 * 60 * 24))} วัน
                                                        </span>
                                                    ) : isExpired ? (
                                                        <span className="donate-expired">
                                                            <FaRegClock className="me-1" />
                                                            โครงการสิ้นสุดแล้ว
                                                        </span>
                                                    ) : daysRemaining !== null ? (
                                                        <span className={`donate-remaining ${daysRemaining <= 7 ? "warning" : "success"}`}>
                                                            <FaRegClock className="me-1" />
                                                            เหลืออีก {daysRemaining} วัน
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted">ไม่จำกัดเวลา</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* <div className="donate-project-footer">
                                                <button
                                                    className={`btn donate-action-button ${isExpired
                                                        ? "btn-detail"
                                                        : isUpcoming
                                                            ? "btn-secondary"
                                                            : "btn-primary"
                                                        } rounded-pill px-3`}
                                                    disabled={isUpcoming}
                                                    onClick={() => {
                                                        if (!isUpcoming) {
                                                            navigate(`/donate/donatedetail/${project.project_id}`);
                                                        }
                                                    }}
                                                >
                                                    {isExpired
                                                        ? "ดูรายละเอียด"
                                                        : isUpcoming
                                                            ? "กำลังจะเริ่ม"
                                                            : <>
                                                                บริจาคเลย
                                                                <FaArrowRight className="ms-2" size={14} />
                                                            </>
                                                    }
                                                </button>
                                            </div> */}
                                            <div className="donate-project-footer">
                                                <button
                                                    className={`btn donate-action-button ${isExpired
                                                        ? "btn-detail"
                                                        : isUpcoming
                                                            ? "btn-secondary"
                                                            : "btn-primary"
                                                        } rounded-pill px-3`}
                                                    disabled={isUpcoming}
                                                    onClick={() => {
                                                        if (isUpcoming) return;

                                                        if (!userId) {
                                                            Swal.fire({
                                                                title: "กรุณาเข้าสู่ระบบ",
                                                                text: "คุณต้องเข้าสู่ระบบก่อน",
                                                                icon: "warning",
                                                                confirmButtonText: "เข้าสู่ระบบ"
                                                            }).then(() => {
                                                                navigate("/login");
                                                            });
                                                            return;
                                                        }

                                                        navigate(`/donate/donatedetail/${project?.project_id}`);
                                                    }}
                                                >
                                                    {isExpired ? (
                                                        "ดูรายละเอียด"
                                                    ) : isUpcoming ? (
                                                        "กำลังจะเริ่ม"
                                                    ) : (
                                                        <>
                                                            บริจาคเลย
                                                            <FaArrowRight className="ms-2" size={14} />
                                                        </>
                                                    )}
                                                </button>
                                            </div>

                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <nav aria-label="Page navigation" className="donate-pagination">
                                    <ul className="pagination justify-content-center">
                                        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                aria-label="หน้าก่อนหน้า"
                                            >
                                                <FaChevronLeft />
                                            </button>
                                        </li>

                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                                            <li
                                                key={number}
                                                className={`page-item ${number === currentPage ? "active" : ""}`}
                                            >
                                                <button
                                                    className="page-link"
                                                    onClick={() => handlePageChange(number)}
                                                    aria-label={`หน้า ${number}`}
                                                    aria-current={number === currentPage ? "page" : undefined}
                                                >
                                                    {number}
                                                </button>
                                            </li>
                                        ))}

                                        <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                aria-label="หน้าถัดไป"
                                            >
                                                <FaChevronRight />
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            )}

                            <div className="donate-page-info text-center">
                                <small className="text-muted">
                                    แสดงหน้า {currentPage} จาก {totalPages}
                                    {" "}({indexOfFirstProject + 1}-{Math.min(indexOfLastProject, filteredProjects.length)} จาก {filteredProjects.length} โครงการ)
                                </small>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Donate;