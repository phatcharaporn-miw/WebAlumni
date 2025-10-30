import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/adminDonate.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Link, useLocation } from "react-router-dom";
import { Search, Eye, Trash2, UserCircle, Folder, FileText, Image as ImageIcon, MessageSquare, ArrowLeft, Users, DollarSign, Hourglass } from "lucide-react";
import { HOSTNAME } from "../../config";
// ส่วนส่งออกไฟล์เผื่อแอดมินอยากได้ข้อมูล Excel
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function AdminDonationLists() {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterType, setFilterType] = useState("all");
    const [sortBy, setSortBy] = useState("date");
    const [selectedDonation, setSelectedDonation] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [viewMode, setViewMode] = useState("projects");
    const [selectedProject, setSelectedProject] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const fetchDonations = async () => {
            try {
                setLoading(true);
                const response = await axios.get(HOSTNAME + "/admin/donate-lists");
                setDonations(response.data);
            } catch (err) {
                setError(err.response?.data?.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
            } finally {
                setLoading(false);
            }
        };
        fetchDonations();
    }, []);

    const handleSearchChange = (e) => setSearchQuery(e.target.value);
    const handleFilterChange = (e) => setFilterStatus(e.target.value);
    const handleFilterTypeChange = (e) => setFilterType(e.target.value);
    const handleSortChange = (e) => setSortBy(e.target.value);

    const viewDetail = (donation) => {
        setSelectedDonation(donation);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedDonation(null);
    };

    const deleteDonation = async (donationId) => {
        if (!window.confirm("คุณต้องการลบรายการบริจาคนี้หรือไม่? การลบไม่สามารถกู้คืนได้")) return;
        try {
            await axios.delete(HOSTNAME + `/admin/donations/${donationId}`);
            setDonations(donations.filter(d => d.donation_id !== donationId));
            closeModal();
            alert("ลบรายการสำเร็จ");
        } catch {
            alert("เกิดข้อผิดพลาดในการลบ");
        }
    };

    const viewProjectDonations = (projectName) => {
        setSelectedProject(projectName);
        setViewMode("donations");
    };

    const backToProjects = () => {
        setViewMode("projects");
        setSelectedProject(null);
        setSearchQuery("");
        setFilterStatus("all");
        setFilterType("all");
    };

    const groupedByProject = () => {
        const projects = {};
        donations.forEach(donation => {
            const projectName = donation.project_name || "บริจาคทั่วไป (ไม่ระบุโครงการ)";
            if (!projects[projectName]) {
                projects[projectName] = {
                    name: projectName,
                    donations: [],
                    totalAmount: 0,
                    paidAmount: 0,
                    onlineCount: 0,
                    walkInCount: 0,
                    pendingCount: 0,
                    paidCount: 0
                };
            }
            projects[projectName].donations.push(donation);
            const amount = Number(donation.amount) || 0;
            projects[projectName].totalAmount += amount;
            if (donation.payment_status === "paid") {
                projects[projectName].paidAmount += amount;
                projects[projectName].paidCount++;
            }
            if (donation.payment_status === "pending") {
                projects[projectName].pendingCount++;
            }
            if (donation.donation_type === "online") {
                projects[projectName].onlineCount++;
            } else if (donation.donation_type === "walk_in") {
                projects[projectName].walkInCount++;
            }
        });
        return Object.values(projects).sort((a, b) => b.paidAmount - a.paidAmount);
    };

    const getProjectDonations = () => {
        let filtered = donations.filter(d => {
            const projectName = d.project_name || "บริจาคทั่วไป (ไม่ระบุโครงการ)";
            return projectName === selectedProject;
        });

        const keyword = searchQuery.trim().toLowerCase();
        filtered = filtered.filter(donation => {
            const matchesSearch =
                (donation.donor_name || "").toLowerCase().includes(keyword) ||
                (donation.order_number || "").toLowerCase().includes(keyword) ||
                (donation.full_name || "").toLowerCase().includes(keyword);
            const matchesStatus = filterStatus === "all" || donation.payment_status === filterStatus;
            const matchesType = filterType === "all" || donation.donation_type === filterType;
            return matchesSearch && matchesStatus && matchesType;
        });

        return filtered.sort((a, b) => {
            if (sortBy === "date") {
                return new Date(b.created_at || b.start_date) - new Date(a.created_at || a.start_date);
            } else if (sortBy === "name") {
                return (a.donor_name || a.full_name || "").localeCompare(b.donor_name || b.full_name || "");
            } else if (sortBy === "amount") {
                return (b.amount || 0) - (a.amount || 0);
            }
            return 0;
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "pending": return <span className="badge bg-warning text-dark">รอการตรวจสอบ</span>;
            case "paid": return <span className="badge bg-success">ชำระแล้ว</span>;
            case "failed": return <span className="badge bg-danger">ไม่สำเร็จ</span>;
            default: return <span className="badge bg-secondary">ไม่ระบุ</span>;
        }
    };

    const getStatusTax = (tax_status) => {
        switch (tax_status) {
            case "requested": return <span className="badge bg-warning text-dark">รอดำเนินการ</span>;
            case "sent": return <span className="badge bg-success">ส่งแล้ว</span>;
            case "failed": return <span className="badge bg-danger">ไม่สำเร็จ</span>;
            default: return <span className="badge bg-secondary">ไม่ระบุ</span>;
        }
    };

    const getDonationTypeBadge = (type) => {
        switch (type) {
            case "walk_in": return <span className="badge bg-primary">Walk-in</span>;
            case "online": return <span className="badge bg-success">Online</span>;
            case "bank_transfer": return <span className="badge bg-warning text-dark">Bank Transfer</span>;
            default: return <span className="badge bg-secondary">{type}</span>;
        }
    };

    const handleExportProjectSummaryExcel = () => {
        if (projects.length === 0) {
            alert("ไม่มีข้อมูลสรุปโครงการให้ Export");
            return;
        }

        try {
            const dataToExport = projects.map(project => ({
                'ชื่อโครงการ': project.name,
                'ยอดรวมที่ชำระแล้ว (บาท)': project.paidAmount,
                'จำนวนผู้บริจาค (คน)': project.donations.length,
                'ชำระแล้ว (รายการ)': project.paidCount,
                'รอตรวจสอบ (รายการ)': project.pendingCount,
                'Online (รายการ)': project.onlineCount,
                'Walk-in (รายการ)': project.walkInCount
            }));

            const ws = XLSX.utils.json_to_sheet(dataToExport);

            ws['!cols'] = [
                { wch: 40 }, // ชื่อโครงการ
                { wch: 20 }, // ยอดรวม
                { wch: 20 }, // จำนวนผู้บริจาค
                { wch: 20 }, // ชำระแล้ว
                { wch: 20 }, // รอตรวจสอบ
                { wch: 20 }, // Online
                { wch: 20 }  // Walk-in
            ];

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'สรุปโครงการบริจาค');

            //สร้างไฟล์ .xlsx
            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

            const fileName = `สรุปโครงการบริจาค_${new Date().toISOString().split('T')[0]}.xlsx`;
            saveAs(data, fileName);

        } catch (error) {
            console.error("เกิดข้อผิดพลาดในการ Export Excel:", error);
            alert("เกิดข้อผิดพลาดในการ Export Excel");
        }
    };

    const handleExportProjectDetailsExcel = () => {
        if (projectDonations.length === 0) {
            alert("ไม่มีข้อมูลรายการบริจาคให้ Export");
            return;
        }

        try {
            //ดึงข้อมูลของ projectDonations มาบันทึกลงใน Excel
            const dataToExport = projectDonations.map(donation => ({
                'วันที่บริจาค': donation.created_at
                    ? new Date(donation.created_at).toLocaleDateString("th-TH")
                    : (donation.start_date ? new Date(donation.start_date).toLocaleDateString("th-TH") : "-"),
                'หมายเลขบริจาค': donation.order_number || "-",
                'ชื่อผู้บริจาค': donation.donor_name || donation.full_name || "-",
                'โครงการ': selectedProject,
                'ประเภท': donation.donation_type,
                'จำนวนเงิน (บาท)': Number(donation.amount) || 0,
                'สถานะ': donation.payment_status,
                'เบอร์โทร': donation.phone || "-",
                'อีเมล': donation.email || "-",
                'ที่อยู่': donation.address || "-",
                'ต้องการใบเสร็จภาษี': donation.tax_status || "-",
                'ชื่อบนใบเสร็จ': donation.name || "-",
                'เลขประจำตัวผู้เสียภาษี': donation.tax_number || "-",
                'บันทึกช่วยจำ': donation.memo || "-"
            }));

            const ws = XLSX.utils.json_to_sheet(dataToExport);

            ws['!cols'] = [
                { wch: 15 }, // วันที่
                { wch: 20 }, // หมายเลขบริจาค
                { wch: 30 }, // ชื่อผู้บริจาค
                { wch: 30 }, // โครงการ
                { wch: 15 }, // ประเภท
                { wch: 15 }, // จำนวนเงิน
                { wch: 15 }, // สถานะ
                { wch: 20 }, // เบอร์โทร
                { wch: 30 }, // อีเมล
                { wch: 40 }, // ที่อยู่
                { wch: 20 }, // เลขภาษี
                { wch: 30 }  // บันทึก
            ];

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'รายการบริจาค');

            //สร้างไฟล์ .xlsx
            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

            const projectFileName = selectedProject.replace(/[\s/\\?%*:|"<>]/g, '_'); // ทำความสะอาดชื่อไฟล์
            const fileName = `รายการบริจาค_${projectFileName}_${new Date().toISOString().split('T')[0]}.xlsx`;
            saveAs(data, fileName);

        } catch (error) {
            console.error("เกิดข้อผิดพลาดในการ Export Excel:", error);
            alert("เกิดข้อผิดพลาดในการ Export Excel");
        }
    };

    const projects = groupedByProject();
    const projectDonations = viewMode === "donations" ? getProjectDonations() : [];

    return (
        <div className="donate-activity-container">
            {/* Top Menu Navigation */}
                        <div className="mb-4">
                            <nav className="nav Adminnav-tabs">
                                <Link 
                                    className={`adminnav-link ${location.pathname === '/admin/donations/donation-list' ? 'active' : ''}`} 
                                    to="/admin/donations/donation-list"
                                >
                                    รายการบริจาคทั้งหมด
                                </Link>
                                <Link
                                    className={`adminnav-link ${location.pathname === '/admin/donations' ? 'active' : ''}`}
                                    to="/admin/donations"
                                >
                                    การจัดการโครงการบริจาค
                                </Link>
                    
                                <Link 
                                    className={`adminnav-link ${location.pathname === '/admin/donations/walkin-donation' ? 'active' : ''}`} 
                                    to="/admin/donations/walkin-donation"
                                >
                                    บันทึกการบริจาค Walk-in
                                </Link>
                                <Link
                                    className={`adminnav-link ${location.pathname === '/admin/donations/donate-request' ? 'active' : ''}`}
                                    to="/admin/donations/donate-request"
                                >
                                    เพิ่มโครงการใหม่
                                </Link>
                            </nav>
                        </div>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="donate-activity-title">
                    {viewMode === "projects" ? "รายการโครงการบริจาค" : `รายการบริจาค: ${selectedProject}`}
                </h2>
                <div className="d-flex gap-2"> {/* หุ้มปุ่มด้วย div */}
                    {viewMode === "projects" && (
                        <button
                            className="btn btn-success"
                            onClick={handleExportProjectSummaryExcel}
                            disabled={projects.length === 0}
                        >
                            <FileText size={16} className="me-2" />
                            Export สรุปโครงการ
                        </button>
                    )}
                    {viewMode === "donations" && (
                        <button className="btn btn-outline-secondary" onClick={backToProjects}>
                            <ArrowLeft size={18} className="me-2" />
                            กลับไปหน้ารายการโครงการ
                        </button>
                    )}
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
                <div className="text-center my-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-2">กำลังโหลดข้อมูล...</p>
                </div>
            ) : viewMode === "projects" ? (
                <>
                    {/* สถิติรวมทั้งหมด */}
                    <div className="row mb-4">
                        <div className="col-md-3">
                            <div className="card text-white" style={{
                                background: 'linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%)'
                            }}>
                                <div className="card-body">
                                    <div className="d-flex justify-content-start align-items-center gap-3">
                                        <div>
                                            <Folder size={40} className="text-white-50" />
                                        </div>
                                        <div>
                                            <h6 className="card-title mb-1 text-white">โครงการทั้งหมด</h6>
                                            <h2 className="mb-0">{projects.length}</h2>
                                            <small className="text-white-50">โครงการ</small>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card text-white" style={{
                                background: 'linear-gradient(135deg, #0d6efd 0%, #6610f2 100%)'
                            }}>
                                <div className="card-body">
                                    <div className="d-flex justify-content-start align-items-center gap-3">
                                        <div>
                                            <Users size={40} className="text-white-50" />
                                        </div>
                                        <div>
                                            <h6 className="card-title mb-1 text-white">ผู้บริจาคทั้งหมด</h6>
                                            <h2 className="mb-0">{donations.length}</h2>
                                            <small className="text-white-50">รายการ</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card text-white" style={{
                                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'
                            }}>
                                <div className="card-body">
                                    <div className="d-flex justify-content-start align-items-center gap-3">
                                        <div>
                                            <DollarSign size={40} className="text-white-50" />
                                        </div>
                                        <div>
                                            <h6 className="card-title mb-1 text-white">ยอดรวมที่ชำระแล้ว</h6>
                                            <h2 className="mb-0">
                                                {donations.filter(d => d.payment_status === "paid")
                                                    .reduce((sum, d) => sum + (Number(d.amount) || 0), 0)
                                                    .toLocaleString()}
                                            </h2>
                                            <small className="text-white-50">บาท</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card text-white" style={{
                                background: 'linear-gradient(135deg, #fd7e14 0%, #ffc107 100%)'
                            }}>
                                <div className="card-body">
                                    <div className="d-flex justify-content-start align-items-center gap-3">
                                        <div>
                                            <Hourglass size={40} className="text-white-50" />
                                        </div>
                                        <div>
                                            <h6 className="card-title mb-1 text-white">รอตรวจสอบ</h6>
                                            <h2 className="mb-0">
                                                {donations.filter(d => d.payment_status === "pending").length}
                                            </h2>
                                            <small className="text-white-50">รายการ</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* รายการโครงการ */}
                    {projects.length === 0 ? (
                        <div className="text-center text-muted my-5">
                            <Folder size={48} className="mb-3" />
                            <p>ไม่พบโครงการบริจาค</p>
                        </div>
                    ) : (
                        <div className="row">
                            {projects.map((project, index) => (
                                <div className="col-md-6 col-lg-4 mb-4" key={index}>
                                    <div
                                        className="card h-100 shadow-sm"
                                        style={{
                                            cursor: 'pointer',
                                            transition: 'all 0.3s',
                                            border: '1px solid #dee2e6'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-5px)';
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12)';
                                        }}
                                    >
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <h5 className="card-title mb-0" style={{ color: '#0F75BC', fontSize: '20px' }}>
                                                    {project.name}
                                                </h5>
                                            </div>

                                            <div className="mb-3">
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span className="text-muted">ยอดรวมที่ชำระแล้ว:</span>
                                                    <strong className="text-success fs-5">
                                                        {project.paidAmount.toLocaleString()} ฿
                                                    </strong>
                                                </div>
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span className="text-muted">จำนวนผู้บริจาค:</span>
                                                    <strong>{project.donations.length} คน</strong>
                                                </div>
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span className="text-muted">ชำระแล้ว / รอตรวจสอบ:</span>
                                                    <strong>
                                                        <span className="text-success">{project.paidCount}</span>
                                                        {" / "}
                                                        <span className="text-warning">{project.pendingCount}</span>
                                                    </strong>
                                                </div>
                                            </div>

                                            <div className="d-flex gap-2 mb-3">
                                                <span className="badge bg-success">
                                                    Online: {project.onlineCount}
                                                </span>
                                                <span className="badge bg-primary">
                                                    Walk-in: {project.walkInCount}
                                                </span>
                                            </div>

                                            <button
                                                className="btn btn-outline-primary w-100"
                                                onClick={() => viewProjectDonations(project.name)}
                                            >
                                                <Eye size={16} className="me-2" />
                                                ดูรายการบริจาค
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <>
                    {/* สถิติของโครงการที่เลือก */}
                    <div className="row mb-4">
                        <div className="col-md-3">
                            <div className="card text-white" style={{
                                background: 'linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%)'
                            }}>
                                <div className="card-body text-center">
                                    <h6 className="card-title mb-3 text-white">ทั้งหมด</h6>
                                    <h2 className="mb-2">{projectDonations.length}</h2>
                                    <small>รายการ</small>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card bg-success text-white" style={{
                                background: 'linear-gradient(135deg, #0d6efd 0%, #6610f2 100%)'
                            }}>
                                <div className="card-body text-center">
                                    <h6 className="card-title mb-3 text-white">Online</h6>
                                    <h2 className="mb-2">
                                        {projectDonations.filter(d => d.donation_type === "online").length}
                                    </h2>
                                    <small>รายการ</small>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card bg-primary text-white" style={{
                                background: 'linear-gradient(135deg, #fd7e14 0%, #ffc107 100%)'
                            }}>
                                <div className="card-body text-center">
                                    <h6 className="card-title mb-3 text-white">Walk-in</h6>
                                    <h2 className="mb-2">
                                        {projectDonations.filter(d => d.donation_type === "walk_in").length}
                                    </h2>
                                    <small>รายการ</small>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card bg-info text-white" style={{
                                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'
                            }}>
                                <div className="card-body text-center">
                                    <h6 className="card-title mb-3 text-white">ยอดรวม (ชำระแล้ว)</h6>
                                    <h2 className="mb-2">
                                        {projectDonations
                                            .filter(d => d.payment_status === "paid")
                                            .reduce((sum, d) => sum + (Number(d.amount) || 0), 0)
                                            .toLocaleString()}
                                    </h2>
                                    <small>บาท</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ตัวกรองและค้นหา */}
                    <div className="row mb-4">
                        <div className="col-md-3">
                            <div className="input-group">
                                <span className="input-group-text"><Search size={18} /></span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="ค้นหาชื่อผู้บริจาค หรือ หมายเลขบริจาค"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                />
                            </div>
                        </div>
                        <div className="col-md-2">
                            <select className="form-select" value={filterType} onChange={handleFilterTypeChange}>
                                <option value="all">ประเภททั้งหมด</option>
                                <option value="online">Online</option>
                                <option value="walk_in">Walk-in</option>
                            </select>
                        </div>
                        <div className="col-md-2">
                            <select className="form-select" value={filterStatus} onChange={handleFilterChange}>
                                <option value="all">สถานะทั้งหมด</option>
                                <option value="pending">รอการตรวจสอบ</option>
                                <option value="paid">ชำระแล้ว</option>
                                <option value="failed">ไม่สำเร็จ</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <select className="form-select" value={sortBy} onChange={handleSortChange}>
                                <option value="date">เรียงตามวันที่ (ล่าสุดก่อน)</option>
                                <option value="name">เรียงตามชื่อผู้บริจาค (ก-ฮ)</option>
                                <option value="amount">เรียงตามยอดบริจาค (มาก-น้อย)</option>
                            </select>
                        </div>
                        <div className="col-md-2">
                            <button
                                className="btn btn-success w-100"
                                onClick={handleExportProjectDetailsExcel}
                                disabled={projectDonations.length === 0}
                            >
                                <FileText size={16} className="me-2" />
                                Export
                            </button>
                        </div>
                    </div>

                    {/* ตารางรายการบริจาค */}
                    {projectDonations.length === 0 ? (
                        <div className="text-center text-muted my-5">
                            <FileText size={48} className="mb-3" />
                            <p>ไม่พบรายการบริจาค</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover table-bordered align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th className="text-center" style={{ width: "120px" }}>วันที่บริจาค</th>
                                        <th style={{ width: "200px" }}>ชื่อผู้บริจาค</th>
                                        <th className="text-center" style={{ width: "100px" }}>ประเภท</th>
                                        <th className="text-center" style={{ width: "120px" }}>จำนวนเงิน</th>
                                        <th className="text-center" style={{ width: "120px" }}>สถานะ</th>
                                        <th className="text-center" style={{ width: "120px" }}>จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {projectDonations.map((donation, index) => (
                                        <tr key={`${donation.donation_id}-${index}`}>
                                            <td className="text-center align-middle">
                                                <small>
                                                    {donation.created_at
                                                        ? new Date(donation.created_at).toLocaleDateString("th-TH", {
                                                            year: "numeric",
                                                            month: "numeric",
                                                            day: "numeric",
                                                        })
                                                        : donation.start_date
                                                            ? new Date(donation.start_date).toLocaleDateString("th-TH", {
                                                                year: "numeric",
                                                                month: "numeric",
                                                                day: "numeric",
                                                            })
                                                            : "-"}
                                                </small>
                                            </td>
                                            <td className="align-middle">
                                                <div className="d-flex align-items-center">
                                                    <span className="text-truncate">{donation.donor_name || donation.full_name || "-"}</span>
                                                </div>
                                            </td>
                                            <td className="text-center align-middle">
                                                {getDonationTypeBadge(donation.donation_type)}
                                            </td>
                                            <td className="text-center align-middle">
                                                <div>
                                                    <strong className="text-success fs-6">
                                                        {donation.amount ? Number(donation.amount).toLocaleString() : "0"}
                                                    </strong>
                                                    <div><small className="text-muted">บาท</small></div>
                                                </div>
                                            </td>
                                            <td className="text-center align-middle">
                                                {getStatusBadge(donation.payment_status)}
                                            </td>
                                            <td className="text-center align-middle">
                                                <div className="d-flex justify-content-center gap-1">
                                                    <button
                                                        className="btn btn-sm btn-outline-info"
                                                        onClick={() => viewDetail(donation)}
                                                        title="ดูรายละเอียด"
                                                    >
                                                        {/* <Eye size={16} /> */}
                                                        ดูรายละเอียด 
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteDonation(donation.donation_id);
                                                        }}
                                                        title="ลบ"
                                                    >
                                                        {/* <Trash2 size={16} /> */}
                                                        ลบ
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {/* Modal รายละเอียด */}
            {showModal && selectedDonation && (
                <>
                    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                            <div className="modal-content p-0">
                                <div className="modal-header text-white" style={{ backgroundColor: '#0F75BC' }}>
                                    <h5 className="modal-title">รายละเอียดการบริจาค</h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={closeModal}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="row g-3">
                                        {/* ประเภทการบริจาค */}
                                        {selectedDonation.donation_type && (
                                            <div className="col-12">
                                                {getDonationTypeBadge(selectedDonation.donation_type)}
                                            </div>
                                        )}

                                        {/* ข้อมูลการบริจาค */}
                                        <div className="col-md-6">
                                            <div className="card h-100">
                                                <div className="card-body d-flex flex-column" style={{ justifyContent: "initial" }}>
                                                    <h6 className="card-subtitle mb-3 text-muted">
                                                        <FileText size={18} className="me-2" />ข้อมูลการบริจาค
                                                    </h6>
                                                    <div className="mb-2">
                                                        <small className="text-muted">หมายเลขบริจาค:</small>
                                                        <div className="fw-bold">{selectedDonation.order_number || "-"}</div>
                                                    </div>
                                                    <div className="mb-2">
                                                        <small className="text-muted">จำนวนเงิน:</small>
                                                        <div className="fw-bold text-success fs-5">
                                                            {selectedDonation.amount ? Number(selectedDonation.amount).toLocaleString() : "0"} บาท
                                                        </div>
                                                    </div>
                                                    <div className="mb-2">
                                                        <small className="text-muted">สถานะการชำระเงิน:</small>
                                                        <div>{getStatusBadge(selectedDonation.payment_status)}</div>
                                                    </div>
                                                    <div className="mb-2">
                                                        <small className="text-muted">วันที่บริจาค:</small>
                                                        <div className="fw-bold">
                                                            {selectedDonation.created_at
                                                                ? new Date(selectedDonation.created_at).toLocaleString("th-TH", {
                                                                    dateStyle: "medium",
                                                                    timeStyle: "short",
                                                                })
                                                                : selectedDonation.start_date
                                                                    ? new Date(selectedDonation.start_date).toLocaleString("th-TH", {
                                                                        dateStyle: "medium",
                                                                        timeStyle: "short",
                                                                    })
                                                                    : "-"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* ข้อมูลผู้บริจาค */}
                                        <div className="col-md-6">
                                            <div className="card h-100">
                                                <div className="card-body d-flex flex-column" style={{ justifyContent: "initial" }}>
                                                    <h6 className="card-subtitle mb-3 text-muted">
                                                        <UserCircle size={18} className="me-2" />ข้อมูลผู้บริจาค
                                                    </h6>
                                                    <div className="mb-2">
                                                        <small className="text-muted">ชื่อผู้บริจาค:</small>
                                                        <div className="fw-bold">{selectedDonation.donor_name || selectedDonation.full_name || "-"}</div>
                                                    </div>
                                                    <div className="mb-2">
                                                        <small className="text-muted">เบอร์โทรศัพท์:</small>
                                                        <div className="fw-bold">{selectedDonation.phone || "-"}</div>
                                                    </div>
                                                    <div className="mb-2">
                                                        <small className="text-muted">อีเมล:</small>
                                                        <div className="fw-bold">{selectedDonation.email || "-"}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* ข้อมูลลดหย่อนภาษี */}
                                        <div className="col-12">
                                            <div className="card h-100">
                                                <div className="card-body">
                                                    <h6 className="card-subtitle mb-3 text-muted">
                                                        <FileText size={18} className="me-2" />ข้อมูลลดหย่อนภาษี
                                                    </h6>
                                                    <div className="row">
                                                        <div className="col-md-6 mb-2">
                                                            <small className="text-muted">สถานะการขอใบเสร็จ:</small>
                                                            <div className="fw-bold">{getStatusTax(selectedDonation.tax_status)}</div>
                                                        </div>
                                                        <div className="col-md-6 mb-2">
                                                            <small className="text-muted">ชื่อบนใบเสร็จ:</small>
                                                            <div className="fw-bold">{selectedDonation.name || "-"}</div>
                                                        </div>
                                                        <div className="col-md-6 mb-2">
                                                            <small className="text-muted">เลขประจำตัวผู้เสียภาษี:</small>
                                                            <div className="fw-bold">{selectedDonation.tax_number || "-"}</div>
                                                        </div>
                                                        <div className="col-12 mb-2">
                                                            <small className="text-muted">ที่อยู่:</small>
                                                            <div className="fw-bold">{selectedDonation.address || "-"}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* หลักฐานการโอน (ถ้ามี) */}
                                        {selectedDonation.slip_image_url && (
                                            <div className="col-12">
                                                <h6 className="mb-2 text-muted">
                                                    <ImageIcon size={18} className="me-2" />หลักฐานการโอน
                                                </h6>
                                                <img
                                                    src={HOSTNAME + selectedDonation.slip_image_url}
                                                    alt="Slip"
                                                    className="img-fluid rounded"
                                                    style={{ maxHeight: '400px', width: 'auto' }}
                                                />
                                            </div>
                                        )}

                                        {/* บันทึกช่วยจำ */}
                                        {selectedDonation.memo && (
                                            <div className="col-12">
                                                <h6 className="mb-2 text-muted">
                                                    <MessageSquare size={18} className="me-2" />บันทึกช่วยจำ
                                                </h6>
                                                <p className="form-control bg-light" style={{ minHeight: '80px' }}>
                                                    {selectedDonation.memo}
                                                </p>
                                            </div>
                                        )}

                                    </div>
                                </div>
                                <div className="modal-footer">
                                    {/* <button type="button" className="btn btn-outline-secondary" onClick={closeModal}>ปิด</button> */}
                                    <button
                                        type="button"
                                        className="btn btn-outline-danger"
                                        onClick={() => deleteDonation(selectedDonation.donation_id)}
                                    >
                                        ลบรายการนี้
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

        </div>
    );
}

export default AdminDonationLists;