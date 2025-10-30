import React, { useEffect, useState, useMemo } from "react";
import "../../css/Donate.css";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { FaSearch, FaRegClock, FaArrowRight, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { HOSTNAME } from '../../config.js';
import Swal from 'sweetalert2';

function AdminDashboarsProjectsPage() {
    const [projects, setProjects] = useState([]);
    const [filter, setFilter] = useState("all");
    const [filterYear, setFilterYear] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedRange, setSelectedRange] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editProject, setEditProject] = useState(null);
    const [editLoading, setEditLoading] = useState(false);

    const navigate = useNavigate();
    const projectsPerPage = 6;

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(HOSTNAME + "/api/donate/ongoing");
                setProjects(response.data || []);
                // console.log(response.data);
            } catch (err) {
                console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", err);
                setError("ไม่สามารถโหลดข้อมูลโครงการได้ กรุณาลองใหม่อีกครั้ง");
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    // Add these functions before the return statement
    const handleEdit = (project) => {
        setEditProject(project);
        setShowEditModal(true);
    };

    const handleDelete = async (projectId) => {
        const result = await Swal.fire({
            title: 'ยืนยันการลบ',
            text: 'คุณต้องการลบโครงการนี้หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'ลบ',
            cancelButtonText: 'ยกเลิก'
        });

        if (result.isConfirmed) {
            try {
                const response = await axios.delete(
                    `${HOSTNAME}/admin/donate/${projectId}`,
                    { withCredentials: true }
                );
                if (response.data.success) {
                    Swal.fire('สำเร็จ', 'ลบโครงการเรียบร้อยแล้ว', 'success');
                    setProjects(projects.filter(p => p.project_id !== projectId));
                }
            } catch (error) {
                Swal.fire('ผิดพลาด', 'ไม่สามารถลบโครงการได้', 'error');
            }
        }
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        setEditLoading(true);
        try {
            const response = await axios.put(HOSTNAME + `/admin/editDonate/${editProject.project_id}`,
                editProject,
                { withCredentials: true }
            );
            if (response.data.success) {
                setProjects(projects.map(p =>
                    p.project_id === editProject.project_id ? editProject : p
                ));
                Swal.fire('สำเร็จ', 'แก้ไขโครงการเรียบร้อยแล้ว', 'success');
                setShowEditModal(false);
            }
        } catch (error) {
            Swal.fire('ผิดพลาด', 'ไม่สามารถแก้ไขโครงการได้', 'error');
        } finally {
            setEditLoading(false);
        }
    };

    // ฟิลเตอร์ข้อมูล
    const years = [...new Set(
        projects.map(d => d.start_date ? new Date(d.start_date).getFullYear() : null).filter(Boolean)
    )].sort((a, b) => b - a);


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

    //  Filter projects
    const filteredProjects = useMemo(() => {
        return projects.filter((project) => {
            const now = new Date();
            const startDate = project?.start_date ? new Date(project.start_date) : null;
            const endDate = project?.end_date ? new Date(project.end_date) : null;

            // ประเภทการบริจาค
            if (filter !== "all" && project.donation_type !== filter) return false;

            // สถานะโครงการ
            if (filterStatus === "active" && endDate && now > endDate) return false;
            if (filterStatus === "expired" && endDate && now <= endDate) return false;

            // ฟิลเตอร์ช่วงเดือน
            if (selectedRange !== "all") {
                // ถ้าไม่มี start_date หรือ end_date ก็ไม่ผ่าน
                if (!startDate && !endDate) return false;
                const startInRange = isInSelectedMonthRange(startDate, selectedRange);
                const endInRange = isInSelectedMonthRange(endDate, selectedRange);
                if (!startInRange && !endInRange) return false;
            }

            // ค้นหาชื่อหรือคำอธิบาย
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
        const now = new Date();
        const endDate = project?.end_date ? new Date(project.end_date) : null;
        const startDate = new Date(project?.start_date);
        const comingSoonDays = startDate && now < startDate;

        if (!endDate) return null;

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

    return (
        <div className="donate-page p-5">
            <div className="text-center">
                <h3 className="admin-title">
                    โครงการที่เปิดรับบริจาค
                </h3>
            </div>

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

                    <div className="col-md-2">
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

                    <div className="col-md-2">
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

                    <div className="col-md-2">
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

            <div className="donate-projects-container">
                {filteredProjects.length === 0 ? (
                    <div className="donate-no-projects">
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
                                                src={`${HOSTNAME}/uploads/${project.image_path}`}
                                                alt={project.project_name}
                                                onError={(e) => {
                                                    if (e.target.src !== window.location.origin + "/image/default.jpg") {
                                                    e.target.src = "/image/default.jpg";
                                                    }
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

                                        <div className="donate-project-footer d-flex justify-content-center gap-2 mt-3">
                                            <button
                                                className="btn btn-sm btn-outline-warning px-3 py-2 donate-btn-action"
                                                onClick={() => handleEdit(project)}
                                            >
                                                แก้ไข
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-danger px-3 py-2 donate-btn-action"
                                                onClick={() => handleDelete(project.project_id)}
                                            >
                                                ลบ
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
            {/* แก้ไขโครงการ */}
            {showEditModal && (
                <div className="custom-modal-overlay" style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.6)',
                    zIndex: 1050,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'fadeIn 0.2s ease-in-out'
                }}>
                    <div className="card shadow-lg p-4 rounded-4" style={{
                        width: '880px',
                        maxWidth: '95%',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        border: 'none',
                        animation: 'slideIn 0.3s ease-out'
                    }}>
                        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
                            <h5 className="mb-0 fw-bold">แก้ไขโครงการบริจาค</h5>
                            <button
                                className="btn-close"
                                onClick={() => setShowEditModal(false)}
                            />
                        </div>

                        <form onSubmit={handleSaveEdit}>
                            <div className="mb-3">
                                <label className="form-label fw-semibold">ชื่อโครงการ</label>
                                <input
                                    type="text"
                                    className="form-control shadow-sm rounded-3 w-100"
                                    value={editProject?.project_name || ''}
                                    onChange={e => setEditProject({ ...editProject, project_name: e.target.value })}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-semibold">รายละเอียด</label>
                                <textarea
                                    className="form-control shadow-sm rounded-3 w-100"
                                    rows="4"
                                    value={editProject?.description || ''}
                                    onChange={e => setEditProject({ ...editProject, description: e.target.value })}
                                />
                            </div>

                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">วันที่เริ่ม</label>
                                    <input
                                        type="date"
                                        className="form-control shadow-sm rounded-3 w-100"
                                        value={editProject?.start_date?.split('T')[0] || ''}
                                        onChange={e => setEditProject({ ...editProject, start_date: e.target.value })}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">วันที่สิ้นสุด</label>
                                    <input
                                        type="date"
                                        className="form-control shadow-sm rounded-3 w-100"
                                        value={editProject?.end_date?.split('T')[0] || ''}
                                        onChange={e => setEditProject({ ...editProject, end_date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="mt-4 d-flex justify-content-end gap-2">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary rounded-3"
                                    onClick={() => setShowEditModal(false)}
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-success rounded-3"
                                    disabled={editLoading}
                                >
                                    {editLoading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboarsProjectsPage;