import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../../css/adminDonate.css";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";

function AdminDonate() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [sortBy, setSortBy] = useState("date");
    const location = useLocation();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true);
                const response = await axios.get("http://localhost:3001/admin/donate");
                const updatedProjects = response.data.map((project) => ({
                    ...project,
                    showFullDescription: false,
                }));
                setProjects(updatedProjects);
            } catch (error) {
                setError(error.response?.data?.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    // ฟังก์ชันสำหรับค้นหาโครงการ
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // ฟังก์ชันเปลี่ยนสถานะฟิลเตอร์
    const handleFilterChange = (e) => {
        setFilterStatus(e.target.value);
    };

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
    };

    //ลบโครงการ
    const Delete = async (projectId) => {
        const confirmDelete = window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบโครงการนี้?");
        if (confirmDelete) {
            try {
                await axios.delete(`http://localhost:3001/admin/donate/${projectId}`);
                setProjects(projects.filter((project) => project.project_id !== projectId));
                alert("ลบโครงการสำเร็จ");
            } catch (error) {
                alert("เกิดข้อผิดพลาดในการลบโครงการ");
            }
        }
    };

    //ฟังก์ชันสำหรับอนุมัติโครงการ
    const Approve = async (projectId) => {
        try {
            await axios.put(`http://localhost:3001/admin/approveDonate/${projectId}`);
            setProjects(projects.map(project =>
                project.project_id === projectId
                    ? { ...project, status: "1" }
                    : project
            ));
            alert("อนุมัติโครงการสำเร็จ");
        } catch (error) {
            alert("เกิดข้อผิดพลาดในการอนุมัติโครงการ");
        }
    };

    // ฟังก์ชันสำหรับแสดง/ซ่อนรายละเอียดเพิ่มเติม
    const handleViewMoreToggle = (projectId) => {
        setProjects(
            projects.map((project) => {
                if (project.project_id === projectId) {
                    return { ...project, showFullDescription: !project.showFullDescription };
                }
                return project;
            })
        );
    };

    // ฟังก์ชันกรองและเรียงลำดับโครงการ
    const getFilteredAndSortedProjects = () => {
        let filtered = projects.filter((project) => {
            const matchesSearch = project.project_name?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = filterStatus === "all" || project.status === filterStatus;
            return matchesSearch && matchesStatus;
        });

        // เรียงลำดับ
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "date":
                    return new Date(b.created_at) - new Date(a.created_at);
                case "name":
                    return a.project_name.localeCompare(b.project_name);
                case "amount":
                    return b.current_amount - a.current_amount;
                default:
                    return 0;
            }
        });

        return filtered;
    };

    // ฟังก์ชันแสดงสถานะ
    const getStatusBadge = (status) => {
        switch (status) {
            case "0":
                return <span className="badge bg-warning">รอการอนุมัติ</span>;
            case "1":
                return <span className="badge bg-success">อนุมัติแล้ว</span>;
            case "2":
                return <span className="badge bg-danger">ไม่อนุมัติ</span>;
            case "3":
                return <span className="badge bg-danger">โครงการสิ้นสุดแล้ว</span>;
            default:
                return <span className="badge bg-secondary">ไม่ระบุ</span>;
        }
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

    const filteredProjects = getFilteredAndSortedProjects();

    return (
        <div className="donate-activity-container">
            {/* Top Menu Navigation */}
            <div className="mb-4">
                <nav className="nav Adminnav-tabs">
                    <Link 
                        className={`adminnav-link ${location.pathname === '/admin/donations' ? 'active' : ''}`}
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

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="donate-activity-title">การจัดการโครงการบริจาค</h2>
                <div className="d-flex gap-2">
                    <Link to="/admin/donations/donate-request" className="btn-admin-donate-request">
                        <i className="fas fa-plus"></i> เพิ่มโครงการใหม่
                    </Link>
                </div>
            </div>

            <div className="row mb-4">
                <div className="col-md-4">
                    <div className="input-group">
                        <span className="input-group-text">
                            <i className="fas fa-search"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="ค้นหาโครงการ..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                    </div>
                </div>
                <div className="col-md-3">
                    <select
                        className="form-select"
                        value={filterStatus}
                        onChange={handleFilterChange}
                    >
                        <option value="all">สถานะทั้งหมด</option>
                        <option value="0">รอการอนุมัติ</option>
                        <option value="1">อนุมัติแล้ว</option>
                        <option value="2">ไม่อนุมัติ</option>
                    </select>
                </div>

                <div className="col-md-3">
                    <select
                        className="form-select"
                        value={sortBy}
                        onChange={handleSortChange}
                    >
                        <option value="date">เรียงตามวันที่</option>
                        <option value="name">เรียงตามชื่อ</option>
                        <option value="amount">เรียงตามยอดบริจาค</option>
                    </select>
                </div>
                <div className="col-md-2 d-flex align-items-center">
                    <div className="text-muted">
                        พบ {filteredProjects.length} รายการ
                    </div>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    <i className="fas fa-exclamation-triangle"></i> {error}
                </div>
            )}

            {/* แสดงการโหลดข้อมูล */}
            {loading && (
                <div className="text-center my-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">กำลังโหลด...</span>
                    </div>
                    <p className="mt-2">กำลังโหลดข้อมูล...</p>
                </div>
            )}

            {/* แสดงโครงการ */}
            {!loading && (
                <div className="donate-admin-content">
                    {filteredProjects.length === 0 ? (
                        <div className="text-center my-5">
                            <div className="display-1 text-muted">
                                <i className="fas fa-search"></i>
                            </div>
                            <p className="h5 text-muted">ไม่พบโครงการที่ค้นหา</p>
                        </div>
                    ) : (
                        <div className="row">
                            {filteredProjects.map((project) => {
                                const startDate = project.start_date ? new Date(project.start_date) : null;
                                const endDate = project.end_date ? new Date(project.end_date) : null;
                                const options = { year: "numeric", month: "long", day: "numeric" };
                                const formattedStartDate = startDate?.toLocaleDateString("th-TH", options);
                                const formattedEndDate = endDate?.toLocaleDateString("th-TH", options);

                                const progress =
                                    project.target_amount && project.target_amount > 0
                                        ? (project.current_amount / project.target_amount) * 100
                                        : null;

                                const isDescriptionLong = project.description.length > 200;

                                return (
                                    <div className="col-12 mb-4" key={project.project_id}>
                                        <div className="card shadow-sm">
                                            <div className="card-body">
                                                <div className="row">
                                                    <div className="col-md-3">
                                                        <div className="donate-admin-item-image-frame">
                                                            <img
                                                                src={`http://localhost:3001/uploads/${project.image_path}`}
                                                                alt={project.project_name}
                                                                className="img-fluid rounded"
                                                                onError={(e) => {
                                                                    e.target.src = "/image/default.jpg";
                                                                }}
                                                                style={{
                                                                    width: "100%",
                                                                    height: "200px",
                                                                    objectFit: "cover"
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-9">
                                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                                            <h5 className="card-title">{project.project_name}</h5>
                                                            {getStatusBadge(project.status)}
                                                        </div>

                                                        <div className="tag-date-container">
                                                            <p className={`tagDonante ${project.donation_type || "default"}`}>
                                                                <i className="fas fa-tag"></i> {getFilterTitle(project.donation_type)}
                                                            </p>
                                                        </div>

                                                        <p className="text-muted small mb-2">
                                                            <i className="fas fa-calendar"></i> {formattedStartDate} - {formattedEndDate}
                                                        </p>

                                                        <p className="card-text">
                                                            {project.showFullDescription || !isDescriptionLong
                                                                ? project.description
                                                                : `${project.description.substring(0, 200)}...`}
                                                        </p>

                                                        {isDescriptionLong && (
                                                            <button
                                                                className="btn btn-link p-0 text-decoration-none"
                                                                onClick={() => handleViewMoreToggle(project.project_id)}
                                                            >
                                                                {project.showFullDescription ? "ย่อข้อมูล" : "ดูเพิ่มเติม"}
                                                            </button>
                                                        )}

                                                        {/* Progress Bar */}
                                                        {progress !== null && (
                                                            <div className="mt-3">
                                                                <div className="d-flex justify-content-between mb-1">
                                                                    <span>ความคืบหน้า</span>
                                                                    <span>{progress.toFixed(0)}%</span>
                                                                </div>
                                                                <div className="progress">
                                                                    <div
                                                                        className="progress-bar"
                                                                        role="progressbar"
                                                                        style={{ width: `${progress}%` }}
                                                                        aria-valuenow={progress}
                                                                        aria-valuemin="0"
                                                                        aria-valuemax="100"
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* ยอดเงิน */}
                                                        <div className="row mt-3">
                                                            <div className="col-md-6">
                                                                <div className="text-center p-2 bg-light rounded">
                                                                    <div className="text-muted small">ยอดปัจจุบัน</div>
                                                                    <div className="h6 text-primary mb-0">
                                                                        {Number(project.current_amount).toLocaleString()} บาท
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {project.donation_type !== "unlimited" && project.donation_type !== "things" && (
                                                                <div className="col-md-6">
                                                                    <div className="text-center p-2 bg-light rounded">
                                                                        <div className="text-muted small">เป้าหมาย</div>
                                                                        <div className="h6 text-success mb-0">
                                                                            {Number(project.target_amount).toLocaleString()} บาท
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* ปุ่มจัดการ */}
                                                        <div className="d-flex gap-2 mt-3">
                                                            {project.status === "0" && (
                                                                <button
                                                                    className="btn btn-success btn-sm"
                                                                    onClick={() => Approve(project.project_id)}
                                                                >
                                                                    <i className="fas fa-check"></i> อนุมัติ
                                                                </button>
                                                            )}
                                                            <Link
                                                                to={`/admin/donations/edit/${project.project_id}`}
                                                                className="btn fasfa-edit btn-sm"
                                                            >
                                                                <i className="fas fa-edit"></i> แก้ไข
                                                            </Link>
                                                            <button
                                                                className="btn fasfa-delete btn-sm"
                                                                onClick={() => Delete(project.project_id)}
                                                            >
                                                                <i className="fas fa-trash"></i> ลบ
                                                            </button>
                                                            <Link
                                                                to={`/admin/donations/donatedetail/${project.project_id}`}
                                                                className="btn fasfa-info btn-sm"
                                                            >
                                                                <i className="fas fa-eye"></i> ดูรายละเอียด
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default AdminDonate;