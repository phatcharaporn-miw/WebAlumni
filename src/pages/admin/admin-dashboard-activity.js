import { useState, useEffect, useMemo } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "../../css/activity.css"
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaSearch } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";
import { useAuth } from '../../context/AuthContext';
import { HOSTNAME } from '../../config.js';

function AdminDashboardActivitiesPages() {
    const [activityId, setActivityId] = useState(null);
    const [activity, setActivity] = useState([]);
    // modal / edit state
    const [showEditModal, setShowEditModal] = useState(false);
    const [editActivity, setEditActivity] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [editForm, setEditForm] = useState({
        activity_name: "",
        activity_date: "",
        end_date: "",
        start_time: "",
        end_time: "",
        description: "",
        status: 0,
    });
    const [selectedStatus, setSelectedStatus] = useState('activity');
    const [showForm, setShowForm] = useState(false);
    const [filterYear, setFilterYear] = useState("all");
    const [selectedRange, setSelectedRange] = useState("all");
    const { user } = useAuth();
    const userRole = user?.role;
    const userId = user?.user_id;
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        batch_year: "",
        department: "",
        education_level: "",
        year_level: "",
        activity_id: null,
    });
    const [searchTerm, setSearchTerm] = useState("");

    // Scroll to top on mount
        useEffect(() => {
            window.scrollTo(0, 0);
        }, []);


    useEffect(() => {
        axios.get(HOSTNAME + '/api/activities/ongoing')
            .then(response => {
                const data = response.data.data || [];
                setActivity(data);

            })
            .catch(error => console.error("Error fetching activities:", error));
    }, []);


    const handleStatusChange = (e) => {
        setSelectedStatus(e.target.value);
    };

    const handleViewDetails = (activityId) => {
        // open edit modal instead of navigate to detail page
        const target = activity.find(a => String(a.activity_id) === String(activityId));
        if (!target) return;
        setEditActivity(target);
        setEditForm({
            activity_name: target.activity_name || "",
            activity_date: target.activity_date || "",
            end_date: target.end_date || "",
            start_time: target.start_time || "",
            end_time: target.end_time || "",
            description: target.description || "",
            status: target.status ?? 0,
        });
        setShowEditModal(true);
    };

    // เรียงลำดับกิจกรรม: กำลังดำเนินการ > กำลังจะจัดขึ้น > อื่นๆ
    const sortedActivity = [...activity].sort((a, b) => {
        // ให้ status 2 มาก่อน, ตามด้วย 0, ที่เหลือไว้หลังสุด
        if (a.status === 2 && b.status !== 2) return -1;
        if (a.status !== 2 && b.status === 2) return 1;
        if (a.status === 0 && b.status !== 0) return -1;
        if (a.status !== 0 && b.status === 0) return 1;
        return 0;
    });


    // ฟังก์ชันช่วยสำหรับจัดการคลาสสถานะ
    const getStatusClass = (status) => {
        switch (status) {
            case 2:
                return "กำลังดำเนินการ";
            default:
                return "";
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleYearChange = (e) => {
        setFilterYear(e.target.value);
    };

    // เคลียร์ตัวกรองทั้งหมด
    const handleClearFilters = () => {
        setSearchTerm("");
        setFilterYear("all");
        setSelectedRange("all");
    };

    // ฟังก์ชันเช็กว่าเดือนอยู่ในช่วงที่เลือกหรือไม่
    const isInSelectedMonthRange = (date, range) => {
        if (!date || range === "all") return true;
        const month = new Date(date).getMonth() + 1; // getMonth() = 0-11
        const [start, end] = range.split("-").map(Number);
        return month >= start && month <= end;
    };

    // ปีที่ให้เลือก (พ.ศ.)
    const years = useMemo(() => {
        const startYear = 2025;
        const currentYear = new Date().getFullYear();
        const list = [];
        for (let y = startYear; y <= currentYear; y++) {
            list.push(y + 543); // แปลงเป็น พ.ศ.
        }
        return list.reverse(); // แสดงจากปีล่าสุดไปเก่าสุด
    }, []);

    // ฟิลเตอร์กิจกรรม
    const filteredActivity = activity.filter((a) => {
        if (!a.activity_date) return false;

        const now = new Date();
        const startDate = a.start_date ? new Date(a.start_date) : null;
        const endDate = a.end_date ? new Date(a.end_date) : null;

        // ปี พ.ศ.
        const activityYear = new Date(a.activity_date).getFullYear() + 543;
        const matchesYear =
            filterYear === "all" ? true : activityYear.toString() === filterYear;

        // ฟิลเตอร์ช่วงเดือน
        let matchesMonth = true;
        if (selectedRange !== "all") {
            const mainDate = a.activity_date ? new Date(a.activity_date) : null;
            const startInRange = startDate && isInSelectedMonthRange(startDate, selectedRange);
            const endInRange = endDate && isInSelectedMonthRange(endDate, selectedRange);
            const activityInRange = mainDate && isInSelectedMonthRange(mainDate, selectedRange);

            // ถ้ากิจกรรมไม่ได้อยู่ในช่วงเดือนที่เลือกเลย
            matchesMonth = startInRange || endInRange || activityInRange;
        }

        // ฟิลเตอร์คำค้นหา
        const matchesSearch = a.activity_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase());

        return matchesYear && matchesMonth && matchesSearch;
    });

    // ฟังก์ชันแปลงวันที่เป็น พ.ศ.
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleString("th-TH", { month: "long" });
        const year = date.getFullYear() + 543;
        return `${day} ${month} ${year}`;
    };

    // Pagination logic
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6; // จำนวนกิจกรรมต่อหน้า
    const totalPages = Math.ceil(filteredActivity.length / itemsPerPage);
    const paginatedActivity = filteredActivity.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // add handlers for edit/delete
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (!editActivity) return;
        setEditLoading(true);
        try {
            const payload = { ...editForm };
            const res = await axios.put(HOSTNAME + `/activity/edit-activity/${editActivity.activity_id}`, payload, { withCredentials: true });
            if (res.data.success) {
                // update local list
                setActivity(prev => prev.map(a => a.activity_id === editActivity.activity_id ? { ...a, ...payload } : a));
                Swal.fire({ icon: 'success', title: 'แก้ไขสำเร็จ', confirmButtonText: 'ตกลง' });
                setShowEditModal(false);
                setEditActivity(null);
            } else {
                Swal.fire({ icon: 'error', title: 'ไม่สำเร็จ', text: res.data.message || 'ไม่สามารถแก้ไขได้' });
            }
        } catch (err) {
            console.error(err);
            Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถแก้ไขกิจกรรมได้' });
        } finally {
            setEditLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'ยืนยันการลบ',
            text: 'คุณต้องการลบกิจกรรมนี้หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'ลบ',
            cancelButtonText: 'ยกเลิก',
        });
        if (!result.isConfirmed) return;
        try {
            const res = await axios.delete(HOSTNAME + `/activity/delete-activity/${activityId}`, { withCredentials: true });
            if (res.data.success) {
                setActivity(prev => prev.filter(a => a.activity_id !== id));
                Swal.fire({ icon: 'success', title: 'ลบสำเร็จ', confirmButtonText: 'ตกลง' });
            } else {
                Swal.fire({ icon: 'error', title: 'ไม่สำเร็จ', text: res.data.message || 'ไม่สามารถลบได้' });
            }
        } catch (err) {
            console.error(err);
            Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถลบกิจกรรมได้' });
        }
    };

    return (
        <section className="container-fluid p-5">
            <div className="activity-page">
                <h3 className="admin-title">
                    กิจกรรมที่กำลังดำเนินการ
                </h3>
                {/* Filters */}
                <div className="donate-filters">
                    <div className="row g-3">
                        {/* ค้นหากิจกรรม */}
                        <div className="col-md-4">
                            <label htmlFor="search" className="form-label">ค้นหากิจกรรม:</label>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <FaSearch />
                                </span>
                                <input
                                    type="text"
                                    id="search"
                                    className="form-control"
                                    placeholder="ค้นหาชื่อกิจกรรมหรือรายละเอียด..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                />
                            </div>
                        </div>

                        <div className="col-md-3">
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

                        {/* ปี */}
                        <div className="col-md-3">
                            <label htmlFor="year-filter" className="form-label">ปี:</label>
                            <select
                                id="year-filter"
                                className="form-select"
                                value={filterYear}
                                onChange={handleYearChange}
                            >
                                <option value="all">ทุกปี</option>
                                {years.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>

                        {/* ปุ่มล้างตัวกรอง */}
                        <div className="col-md-2 d-flex flex-column">
                            <label className="form-label invisible">ล้าง</label>
                            <button
                                className="btn btn-outline-secondary"
                                onClick={handleClearFilters}
                                title="ล้างตัวกรอง"
                            >
                                <AiOutlineClose /> ล้าง
                            </button>
                        </div>
                    </div>
                </div>

                <div className="container">
                    <div className="row">
                        {paginatedActivity.length > 0 ? (
                            paginatedActivity.map(activity => (
                                <div className="col-md-4 mb-5" key={activity.activity_id}>
                                    <div className="card activity-card">
                                        <div className="image-container-act">
                                            <img
                                                src={activity.image_path ? HOSTNAME + `${activity.image_path}` : "/default-image.png"}
                                                className="card-img-top"
                                                alt="กิจกรรม"
                                            />
                                            <div className={`status-badge ${getStatusClass(activity.status)}`}>
                                                {
                                                    activity?.status === 2 ? "กำลังดำเนินการ" : "ไม่ทราบสถานะ"}
                                            </div>
                                        </div>
                                        <div className="card-body">
                                            <h5 className="card-title">{activity.activity_name}</h5>
                                            <p className="activity-text">{activity.description}</p>
                                            <p className="text-muted">
                                                <strong>วันที่จัดกิจกรรม:</strong> {formatDate(activity.activity_date)}
                                            </p>
                                            <div className="button-group d-flex gap-2">
                                                <button
                                                    className="btn btn-outline-warning"
                                                    onClick={() => handleViewDetails(activity.activity_id)}
                                                >
                                                    แก้ไข
                                                </button>
                                                <button
                                                    className="btn btn-outline-danger"
                                                    onClick={() => handleDelete(activity.activity_id)}
                                                >
                                                    ลบ
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center my-5 text-muted">
                                <p className="fs-5">ไม่มีกิจกรรมที่ตรงกับสถานะในขณะนี้</p>
                            </div>
                        )}
                    </div>
                    {/* แก้ไขกิจกรรม */}
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
                                <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                                    <h5 className="mb-0 fw-bold">แก้ไขกิจกรรม</h5>
                                    <button
                                        className="btn-close"
                                        onClick={() => { setShowEditModal(false); setEditActivity(null); }}
                                    >

                                    </button>
                                </div>
                                <form onSubmit={handleSaveEdit}>
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label className="form-label fw-semibold">ชื่อกิจกรรม</label>
                                            <input
                                                name="activity_name"
                                                value={editForm.activity_name}
                                                onChange={handleEditChange}
                                                className="form-control shadow-sm rounded-3 w-100"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">วันที่จัด</label>
                                            <input
                                                name="activity_date"
                                                type="date"
                                                value={editForm.activity_date?.split('T')?.[0] || ''}
                                                onChange={handleEditChange}
                                                className="form-control shadow-sm rounded-3 w-100"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">วันที่สิ้นสุด</label>
                                            <input
                                                name="end_date"
                                                type="date"
                                                value={editForm.end_date?.split('T')?.[0] || ''}
                                                onChange={handleEditChange}
                                                className="form-control shadow-sm rounded-3 w-100"
                                            />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label fw-semibold">รายละเอียด</label>
                                            <textarea
                                                name="description"
                                                value={editForm.description}
                                                onChange={handleEditChange}
                                                className="form-control shadow-sm rounded-3 w-100"
                                                rows={5}
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label fw-semibold">สถานะ</label>
                                            <select
                                                name="status"
                                                value={String(editForm.status)}
                                                onChange={handleEditChange}
                                                className="form-select shadow-sm rounded-3"
                                            >
                                                <option value="0">รอการยืนยัน</option>
                                                <option value="2">กำลังดำเนินการ</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mt-4 d-flex justify-content-end gap-2">
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary rounded-3"
                                            onClick={() => { setShowEditModal(false); setEditActivity(null); }}
                                        >
                                            ยกเลิก
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-success rounded-3"
                                            disabled={editLoading}
                                        >
                                            {editLoading ? 'บันทึก...' : 'บันทึกการแก้ไข'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {totalPages > 1 && (
                        <nav className="d-flex justify-content-center my-4">
                            <ul className="pagination">
                                <li className={`page-item${currentPage === 1 ? ' disabled' : ''}`}>
                                    <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>&laquo;</button>
                                </li>
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <li key={i + 1} className={`page-item${currentPage === i + 1 ? ' active' : ''}`}>
                                        <button className="page-link" onClick={() => handlePageChange(i + 1)}>{i + 1}</button>
                                    </li>
                                ))}
                                <li className={`page-item${currentPage === totalPages ? ' disabled' : ''}`}>
                                    <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>&raquo;</button>
                                </li>
                            </ul>
                        </nav>
                    )}

                    {/* Pagination */}
                    <div className="donate-page-info">
                        <small>
                            หน้า {currentPage} จาก {totalPages} (แสดง{" "}
                            {(currentPage - 1) * itemsPerPage + 1} -{" "}
                            {Math.min(currentPage * itemsPerPage, filteredActivity.length)} จาก{" "}
                            {filteredActivity.length} โครงการ)
                        </small>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default AdminDashboardActivitiesPages;