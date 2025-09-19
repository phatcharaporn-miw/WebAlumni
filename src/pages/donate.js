import React, { useEffect, useState, useMemo } from "react";
import "../css/Donate.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaSearch, FaRegClock, FaArrowRight, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { IoIosAddCircleOutline } from "react-icons/io";
import { FaPlus } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";
import { IoTimeOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

function Donate() {
    const [projects, setProjects] = useState([]);
    const [filter, setFilter] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    const navigate = useNavigate();
    const projectsPerPage = 6;

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get("http://localhost:3001/donate/donate");
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

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("th-TH", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    const calculateDaysRemaining = (endDate) => {
        if (!endDate) return null;
        const now = new Date();
        const end = new Date(endDate);
        const diffTime = end - now;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
        setCurrentPage(1);
    };

    // Filter projects
    const filteredProjects = useMemo(() => {
        return projects.filter((project) => {
            const now = new Date();
            const endDate = project?.end_date ? new Date(project.end_date) : null;

            if (filter !== "all" && project.donation_type !== filter) return false;
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
    }, [projects, filter, filterStatus, searchTerm]);

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
        const now = new Date();
        const endDate = project?.end_date ? new Date(project.end_date) : null;
        const startDate = new Date(project?.start_date);
        const comingSoonDays = startDate && now < startDate;

        if (!endDate) return null;

        if (now > endDate) {
            return <span className="donate-badge donate-badge-expired">สิ้นสุดแล้ว</span>;
        }

        const daysRemaining = calculateDaysRemaining(endDate);
        if (daysRemaining <= 5) {
            return <span className="donate-badge donate-badge-warning">ใกล้สิ้นสุด</span>;
        }

        if (now < startDate) {
            return (
                <span className="donate-badge donate-badge-secondary">
                    กำลังจะเริ่ม
                </span>
            );
        }
        if (now > startDate && now <= endDate) {
            return (
                <span className="donate-badge donate-badge-active">
                    กำลังดำเนินการ
                </span>
            );
        }

    };

    const handleTagClick = (type) => {
        setFilter(type || "all");
        setCurrentPage(1);
    };

    if (error) {
        return (
            <div className="donate-error">
                <i className="fas fa-exclamation-triangle fa-2x mb-3"></i>
                <h5>เกิดข้อผิดพลาด</h5>
                <p>{error}</p>
                <button
                    className="btn btn-primary"
                    onClick={() => window.location.reload()}
                >
                    ลองใหม่
                </button>
            </div>
        );
    }

    return (
        <div className="donate-page">
            <img src="./image/donation (1).jpg" className="donate-header-image" alt="donation" />

            <div className="donate-content-wrapper">
                {/* Filters */}
                <div className="donate-filters">
                    <div className="row g-3">
                        <div className="col-md-4">
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

                        <div className="col-md-3">
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

                        <div className="col-md-3">
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

                        <div className="col-md-2 d-flex flex-column">
                            <label className="form-label invisible">ล้าง</label>
                            <button
                                className="btn btn-outline-secondary"
                                onClick={handleClearFilters}
                                title="ล้างตัวกรอง"
                            >
                                <AiOutlineClose />ล้าง
                            </button>
                        </div>
                    </div>
                </div>

                {/* Create donation button */}
                <div className="donate-create-button-wrapper">
                    <Link to="/donate/donaterequest">
                        <button className="donate-create-button">
                            <FaPlus className="me-2" />
                            สร้างการบริจาค
                        </button>
                    </Link>
                </div>

                <h2 className="donate-title">
                    {getFilterTitle(filter)} {filteredProjects.length > 0 && `(${filteredProjects.length})`}
                </h2>

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
                                                    src={`http://localhost:3001/uploads/${project.image_path}`}
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
                                                    >
                                                        {getFilterTitle(project.donation_type)}
                                                    </span>
                                                    <small className="donate-project-date">
                                                        <i className="far fa-calendar-alt me-1"></i>
                                                        {formattedStartDate} - {formattedEndDate}
                                                    </small>
                                                </div>

                                                <h5 className="donate-project-title">
                                                    {truncateText(project.project_name, 60)}
                                                </h5>

                                                <p className="donate-project-description">
                                                    {truncateText(project.description, 120)}
                                                </p>

                                                {/* Progress section */}
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
                                                        <div style={{ height: "52px" }}>{/* div เปล่าเพื่อรักษาความสูง */}</div>
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
                                            </div>

                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <nav aria-label="Page navigation" className="donate-pagination">
                                    <ul className="pagination">
                                        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                            >
                                                <FaChevronLeft />
                                            </button>
                                        </li>

                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                                            <li
                                                key={number}
                                                className={`page-item ${number === currentPage ? "active" : ""}`}
                                            >
                                                <button className="page-link" onClick={() => handlePageChange(number)}>
                                                    {number}
                                                </button>
                                            </li>
                                        ))}

                                        <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                            >
                                                <FaChevronRight />
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            )}


                            {/* Page info */}
                            <div className="donate-page-info">
                                <small>
                                    หน้า {currentPage} จาก {totalPages} (แสดง {indexOfFirstProject + 1}-
                                    {Math.min(indexOfLastProject, filteredProjects.length)} จาก{" "}
                                    {filteredProjects.length} โครงการ)
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