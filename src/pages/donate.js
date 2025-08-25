import React, { useEffect, useState, useMemo } from "react";
import "../css/Donate.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

function Donate() {
    const [projects, setProjects] = useState([]);
    const [filter, setFilter] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const projectsPerPage = 6;

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get("http://localhost:3001/donate");
                setProjects(response.data);
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

    // กรองข้อมูล
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
        switch (donationType) {
            case "fundraising":
                return "บริจาคแบบระดมทุน";
            case "unlimited":
                return "บริจาคแบบไม่จำกัดจำนวน";
            case "things":
                return "บริจาคสิ่งของ";
            default:
                return "โครงการบริจาคทั้งหมด";
        }
    };

    const truncateText = (text, maxLength) => {
        if (!text) return "";
        return text.length <= maxLength ? text : text.substring(0, maxLength) + "...";
    };

    const getProjectStatusBadge = (project) => {
        const now = new Date();
        const endDate = project?.end_date ? new Date(project.end_date) : null;

        if (!endDate) return null;

        if (now > endDate) {
            return <span className="badge badge-danger">สิ้นสุดแล้ว</span>;
        }

        const daysRemaining = calculateDaysRemaining(endDate);
        if (daysRemaining <= 5) {
            return <span className="badge badge-warning">ใกล้สิ้นสุด</span>;
        }

        return <span className="badge badge-success">กำลังดำเนินการ</span>;
    };

    const handleTagClick = (type) => {
        setFilter(type || "all");
        setCurrentPage(1);
    };

    // Loading state
    if (loading) {
        return (
            <div className="text-center" style={{ padding: "100px" }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">กำลังโหลด...</span>
                </div>
                <p className="mt-3">กำลังโหลดโครงการ...</p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="alert alert-danger text-center" style={{ margin: "50px" }}>
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
        <div>
            <img src="./image/donation (1).jpg" className="head-donate" alt="donation-image" />
            <div className="content-donate">

                {/* Filter */}
                <div className="donate-filter">
                    <div className="row g-3 align-items-stretch mt-0">
                        {/* ช่องค้นหา */}
                        <div className="col-12 col-md-4 d-flex flex-column h-100">
                            <label htmlFor="search" className="form-label">
                                ค้นหาโครงการ:
                            </label>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="fas fa-search"></i>
                                </span>
                                <input
                                    type="text"
                                    id="search"
                                    className="form-control"
                                    placeholder="ค้นหาชื่อโครงการหรือรายละเอียด..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    aria-label="ค้นหาโครงการ"
                                />
                            </div>
                        </div>

                        {/* ช่องประเภทการบริจาค */}
                        <div className="col-12 col-md-3 d-flex flex-column h-100">
                            <label htmlFor="donation-type" className="form-label">
                                ประเภทการบริจาค:
                            </label>
                            <select
                                id="donation-type"
                                className="form-select filter-select"
                                value={filter}
                                onChange={handleFilterTypeChange}
                            >
                                <option value="all">โครงการบริจาคทั้งหมด</option>
                                <option value="fundraising">บริจาคแบบระดมทุน</option>
                                <option value="unlimited">บริจาคแบบไม่จำกัดจำนวน</option>
                                <option value="things">บริจาคสิ่งของ</option>
                            </select>
                        </div>

                        {/* ช่องสถานะกิจกรรม */}
                        <div className="col-12 col-md-3 d-flex flex-column h-100">
                            <label htmlFor="status-filter" className="form-label">
                                สถานะกิจกรรม:
                            </label>
                            <select
                                id="status-filter"
                                className="form-select filter-select"
                                value={filterStatus}
                                onChange={handleFilterChange}
                            >
                                <option value="all">ทั้งหมด</option>
                                <option value="active">กำลังจัดอยู่</option>
                                <option value="expired">สิ้นสุดแล้ว</option>
                            </select>
                        </div>

                        {/* ช่องปุ่มล้าง */}
                        <div className="col-12 col-md-2 d-flex flex-column h-100">
                            {/* invisible label เพื่อให้ความสูงเท่าช่องอื่น */}
                            <label className="form-label invisible">ล้าง</label>
                            <button
                                className="btn btn-outline-secondary w-100"
                                onClick={handleClearFilters}
                                title="ล้างตัวกรอง"
                            >
                                <i className="fas fa-times me-1"></i>
                                ล้าง
                            </button>
                        </div>
                    </div>
                </div>

                <div className="donate-request">
                    <Link to={`/donaterequest`}>
                        <button className="donate-bt-request">
                            <i className="fas fa-plus me-2"></i>
                            สร้างการบริจาค
                        </button>
                    </Link>
                </div>

                <div className="results-summary">
                    <p className="text-muted">
                        แสดง {currentProjects.length} จาก {filteredProjects.length} โครงการ
                        {searchTerm && ` (ค้นหา: "${searchTerm}")`}
                    </p>
                </div>
            </div>

            <h3 id="title-donate">
                {getFilterTitle(filter)} {filteredProjects.length > 0 && `(${filteredProjects.length})`}
            </h3>

            <div className="donate-content">
                {filteredProjects.length === 0 ? (
                    <div className="no-projects text-center" style={{ padding: "50px" }}>
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
                        <div className="donate-content-grid">
                            {currentProjects.map((project) => {
                                const now = new Date();
                                const startDate = project?.start_date ? new Date(project.start_date) : null;
                                const endDate = project?.end_date ? new Date(project.end_date) : null;
                                const formattedStartDate = startDate?.toLocaleDateString("th-TH") || "-";
                                const formattedEndDate = endDate?.toLocaleDateString("th-TH") || "-";
                                const progress =
                                    project.target_amount > 0
                                        ? (project.current_amount / project.target_amount) * 100
                                        : 0;
                                const daysRemaining = calculateDaysRemaining(endDate);
                                const isExpired = endDate && now > endDate;
                                const isUpcoming = startDate && now < startDate;

                                return (
                                    <div
                                        className={`item-detail ${isExpired ? "expired-project" : ""}`}
                                        key={project.project_id}
                                    >
                                        <div className="image-frame">
                                            <img
                                                src={`http://localhost:3001/uploads/${project.image_path}`}
                                                alt={project.project_name}
                                                onError={(e) => {
                                                    e.target.src = "./image/default.jpg";
                                                }}
                                                loading="lazy"
                                            />
                                            <div className="status-badge-overlay">
                                                {getProjectStatusBadge(project)}
                                            </div>
                                        </div>

                                        <div className="donate-discription">
                                            <div className="tag-date-container">
                                                <p
                                                    className={`tagDonante ${project.donation_type || "default"}`}
                                                    onClick={() => handleTagClick(project.donation_type)}
                                                    style={{ cursor: "pointer" }}
                                                >
                                                    {getFilterTitle(project.donation_type)}
                                                </p>
                                            </div>

                                            <p className="donate-discription-date">
                                                <i className="far fa-calendar-alt me-1"></i>
                                                {formattedStartDate} - {formattedEndDate}
                                            </p>

                                            <div className="project-title">
                                                <h5>
                                                    <b>{truncateText(project.project_name, 60)}</b>
                                                </h5>
                                            </div>

                                            <div className="project-description">
                                                <p>{truncateText(project.description, 120)}</p>
                                            </div>

                                            {/* Progress */}
                                            {/* Progress */}
                                            <div className="progress-section">
                                                {project.donation_type !== "unlimited" &&
                                                    project.donation_type !== "things" &&
                                                    project.target_amount > 0 && (
                                                        <>
                                                            {/** แสดง progress เป็นจำนวนเต็ม */}
                                                            <div className="progress-info d-flex justify-content-between align-items-center mb-2">
                                                                <small className="text-muted">ความคืบหน้า</small>
                                                                <span className="progress-percentage font-weight-bold">
                                                                    {Math.round(progress)}%
                                                                </span>
                                                            </div>
                                                            <div className="progress mb-2" style={{ height: "8px" }}>
                                                                <div
                                                                    className="progress-bar bg-primary"
                                                                    role="progressbar"
                                                                    style={{ width: `${Math.min(Math.round(progress), 100)}%` }}
                                                                    aria-valuenow={Math.round(progress)}
                                                                    aria-valuemin="0"
                                                                    aria-valuemax="100"
                                                                ></div>
                                                            </div>
                                                        </>
                                                    )}
                                            </div>

                                            <div className="donate-details d-flex">
                                                <div className={`details-amount1 ${project.donation_type === "unlimited" || project.donation_type === "things" || !project.target_amount ? "full-width" : ""}`}>
                                                    <p>
                                                        <small className="text-muted">ยอดบริจาคปัจจุบัน:</small>
                                                        <br />
                                                        <span className="details-amount-title text-success">
                                                            ฿{formatCurrency(project.current_amount || 0)}
                                                        </span>
                                                    </p>
                                                </div>

                                                {(project.donation_type !== "unlimited" && project.donation_type !== "things" && project.target_amount > 0) && (
                                                    <div className="details-amount2">
                                                        <p>
                                                            <small className="text-muted">เป้าหมาย:</small>
                                                            <br />
                                                            <span className="details-amount-title">
                                                                ฿{formatCurrency(project.target_amount || 0)}
                                                            </span>
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="page-donate-detail-discription-day">
                                                {isUpcoming ? (
                                                    <span className="upcoming ">
                                                        <i className="fas fa-clock me-1"></i>
                                                        กำลังจะเริ่มในอีก {Math.ceil((startDate - now) / (1000 * 60 * 60 * 24))} วัน
                                                    </span>
                                                ) : isExpired ? (
                                                    <span className="expired ">
                                                        <i className="fas fa-clock me-1"></i>
                                                        โครงการสิ้นสุดแล้ว
                                                    </span>
                                                ) : daysRemaining !== null ? (
                                                    <span className={`remaining ${daysRemaining <= 7 ? "text-warning" : "text-success"}`}>
                                                        <i className="fas fa-hourglass-half me-1"></i>
                                                        เหลืออีก {daysRemaining} วัน
                                                    </span>
                                                ) : (
                                                    <span className="text-muted">ไม่จำกัดเวลา</span>
                                                )}
                                            </div>

                                        </div>

                                        <div className="button-container">
                                            <Link to={`/donate/donatedetail/${project.project_id}`}>
                                                <button
                                                    className={`maindonate-bt ${isExpired ? "btn-outline-secondary" : ""}`}
                                                    disabled={isUpcoming}
                                                >
                                                    {isExpired ? "ดูรายละเอียด" : isUpcoming ? "กำลังจะเริ่ม" : "บริจาคเลย"}

                                                    {!isExpired && !isUpcoming && <i className="fas fa-arrow-right ms-1"></i>}
                                                </button>
                                            </Link>
                                        </div>

                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <nav aria-label="Page navigation" className="d-flex justify-content-center mt-4">
                                <ul className="pagination">
                                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            aria-label="หน้าก่อนหน้า"
                                        >
                                            <i className="fas fa-chevron-left"></i>
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
                                            <i className="fas fa-chevron-right"></i>
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        )}

                        <div className="page-info text-center text-muted mt-3">
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
    );
}

export default Donate;