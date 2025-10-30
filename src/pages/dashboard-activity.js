import { useState, useEffect, useMemo } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "../css/activity.css"
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { IoMdClose } from "react-icons/io";
import { FaSearch } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";
import { useAuth } from '../context/AuthContext';
import { HOSTNAME } from '../config.js';

function DashboardActivitiesPages() {
    const [activityId, setActivityId] = useState(null);
    const [activity, setActivity] = useState([]);
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
    const [hasJoined, setHasJoined] = useState(false);

    const handleJoinClick = (activityId) => {
        if (!userId) {
            Swal.fire({
                title: "กรุณาเข้าสู่ระบบ",
                text: "คุณต้องเข้าสู่ระบบก่อนเข้าร่วมกิจกรรม",
                icon: "warning",
                confirmButtonText: "เข้าสู่ระบบ"
            }).then(() => {
                navigate("/login");
            });
            return;
        }
        setActivityId(activityId);
        setFormData({ ...formData, activity_id: activityId });
        setShowForm(true);
    };

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
        navigate(`/activity/${activityId}`);
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

    // const activityId = formData.activity_id;

    const handleFormSubmit = (e) => {
        e.preventDefault();

        if (hasJoined) {
            Swal.fire({
                title: "แจ้งเตือน",
                text: "คุณได้เข้าร่วมกิจกรรมนี้แล้ว",
                icon: "info",
                confirmButtonText: "ตกลง"
            });
            return;
        }

        if (!/^\d{10}$/.test(formData.phone)) {
            Swal.fire({
                title: "ข้อผิดพลาด!",
                text: "กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (10 หลัก)",
                icon: "error",
                confirmButtonText: "ตกลง"
            });
            return;
        }

        axios.post(HOSTNAME + '/activity/activity-form', formData, {
            withCredentials: true,
        })
            .then(response => {
                Swal.fire({
                    title: "สำเร็จ!",
                    text: "คุณได้เข้าร่วมกิจกรรมเรียบร้อยแล้ว",
                    icon: "success",
                    confirmButtonText: "ตกลง",
                    timer: 3000
                });
                setHasJoined(true);
                setShowForm(false);
            })
            .catch(error => {
                if (error.response?.status === 400) {
                    Swal.fire({
                        title: "แจ้งเตือน!",
                        text: error.response.data.message,
                        icon: "warning",
                        confirmButtonText: "ตกลง"
                    });
                } else {
                    Swal.fire({
                        title: "เกิดข้อผิดพลาด!",
                        text: "ไม่สามารถเข้าร่วมกิจกรรมได้ กรุณาลองใหม่",
                        icon: "error",
                        confirmButtonText: "ตกลง"
                    });
                }
            });
    };

    useEffect(() => {
        if (activityId) {
            setHasJoined(false);
            axios.get(HOSTNAME + `/activity/check-join/${activityId}`, {
                withCredentials: true,
            })
                .then((res) => {
                    if (res.data.success) {
                        setHasJoined(res.data.joined);
                    }
                })
                .catch((err) => {
                    console.error("เกิดข้อผิดพลาดในการตรวจสอบกิจกรรม:", err);
                });
        }
    }, [activityId]);

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




    const formatTime = (startTime, endTime) => {
        if (!startTime && !endTime) return "";
        const start = startTime ? new Date(`1970-01-01T${startTime}:00`) : null;
        const end = endTime ? new Date(`1970-01-01T${endTime}:00`) : null;

        const startHours = start ? start.getHours().toString().padStart(2, '0') : "--";
        const startMinutes = start ? start.getMinutes().toString().padStart(2, '0') : "--";
        const endHours = end ? end.getHours().toString().padStart(2, '0') : "--";
        const endMinutes = end ? end.getMinutes().toString().padStart(2, '0') : "--";

        return `${startHours}:${startMinutes} - ${endHours}:${endMinutes} น.`;
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

    return (
        <section className="container">
            <div className="activity-page">
                <div className="text-center mb-5">
                    <div className="d-inline-block position-relative">
                        <h3 id="head-text" className="text-center mb-3 position-relative">
                            กิจกรรมที่กำลังดำเนินการ
                            <div className="title-underline position-absolute start-50 translate-middle-x mt-2"
                                style={{
                                    width: '120px',
                                    height: '4px',
                                    background: 'linear-gradient(90deg, #007bff, #6610f2)',
                                    borderRadius: '2px',
                                    boxShadow: '0 2px 8px rgba(0,123,255,0.3)'
                                }}>
                            </div>
                        </h3>

                        {/* Decorative elements */}
                        <div className="position-absolute top-0 start-0 translate-middle">
                            <div className="bg-primary opacity-25 rounded-circle"
                                style={{ width: '20px', height: '20px' }}>
                            </div>
                        </div>
                        <div className="position-absolute top-0 end-0 translate-middle">
                            <div className="bg-success opacity-25 rounded-circle"
                                style={{ width: '15px', height: '15px' }}>
                            </div>
                        </div>
                    </div>
                </div>

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
                                            <div className="button-group">
                                                {activity.status === 0 && (  // ตรวจสอบกิจกรรมที่ยังไม่เสร็จสิ้น
                                                    hasJoined ? (
                                                        <button className="btn btn-secondary" disabled>
                                                            เข้าร่วมแล้ว
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="btn btn-primary"
                                                            onClick={() => handleJoinClick(activity.activity_id)}
                                                        >
                                                            เข้าร่วมกิจกรรม
                                                        </button>
                                                    )
                                                )}
                                                <button onClick={() => handleViewDetails(activity.activity_id)} className="btn btn-info">
                                                    ดูรายละเอียด
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
                    {/* Pagination */}
                    <div className="donate-page-info">
                        <small>
                            หน้า {currentPage} จาก {totalPages} (แสดง{" "}
                            {(currentPage - 1) * itemsPerPage + 1} -{" "}
                            {Math.min(currentPage * itemsPerPage, filteredActivity.length)} จาก{" "}
                            {filteredActivity.length} โครงการ)
                        </small>
                    </div>
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
                </div>


                {showForm && (
                    <div className="form-overlay">
                        <form className="join-form " onSubmit={handleFormSubmit}>
                            <button
                                type="button"
                                className="close-button"
                                onClick={() => setShowForm(false)}
                            >
                                <IoMdClose />
                            </button>
                            <h4 className="mb-4 text-center">เข้าร่วมกิจกรรม</h4>
                            <div className="activity-info">
                                <label className="form-label"><strong>กิจกรรม:</strong></label>
                                <p>{activity.find(act => act.activity_id === formData.activity_id)?.activity_name || "ไม่พบข้อมูลกิจกรรม"}</p>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="full_name" className="form-label">ชื่อ-นามสกุล</label>
                                <input
                                    type="text"
                                    className="form-control w-100"
                                    id="full_name"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="email" className="form-label">อีเมล</label>
                                <input
                                    type="email"
                                    className="form-control w-100"
                                    id="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="phone_number" className="form-label">เบอร์โทรศัพท์</label>
                                <input
                                    type="text"
                                    className="form-control w-100"
                                    id="phone_number"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                />
                            </div>
                            {/* แสดงปีการศึกษา/ระดับการศึกษา */}
                            {userRole === '4' ? ( // ถ้าเป็นศิษย์ปัจจุบัน
                                <>
                                    <div className="mb-3">
                                        <label htmlFor="education_level" className="form-label">ระดับการศึกษา</label>
                                        <select
                                            className="form-control w-100"
                                            id="education_level"
                                            value={formData.education_level}
                                            onChange={(e) => setFormData({ ...formData, education_level: e.target.value })}
                                            required
                                        >
                                            <option value="">เลือกระดับการศึกษา</option>
                                            <option value="undergraduate">ป.ตรี</option>
                                            <option value="graduate">ป.โท</option>
                                            <option value="doctorate">ป.เอก</option>
                                        </select>
                                    </div>

                                    {/* ถ้าเลือก ป.ตรี จะแสดงช่องเลือกปีการศึกษา */}
                                    {formData.education_level === 'undergraduate' && (
                                        <div className="mb-3">
                                            <label htmlFor="year_level" className="form-label">ชั้นปีการศึกษา</label>
                                            <select
                                                className="form-control w-100"
                                                id="year_level"
                                                value={formData.year_level}
                                                onChange={(e) => setFormData({ ...formData, year_level: e.target.value })}
                                                required
                                            >
                                                <option value="">เลือกชั้นปี</option>
                                                <option value="1">ปี 1</option>
                                                <option value="2">ปี 2</option>
                                                <option value="3">ปี 3</option>
                                                <option value="4">ปี 4</option>
                                            </select>
                                        </div>
                                    )}
                                </>
                            ) : (
                                // ถ้าเป็นศิษย์เก่าจะแสดงฟิลด์ปีที่จบการศึกษา
                                <div className="mb-3">
                                    <label htmlFor="batch_year" className="form-label">ปีที่จบการศึกษา</label>
                                    <input
                                        type="text"
                                        className="form-control w-100"
                                        id="batch_year"
                                        value={formData.batch_year}
                                        onChange={(e) => setFormData({ ...formData, batch_year: e.target.value })}
                                        required
                                    />
                                </div>
                            )}

                            <div className="mb-3">
                                <label htmlFor="department" className="form-label">สาขา</label>
                                <input
                                    type="text"
                                    className="form-control w-100"
                                    id="department"
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="d-flex justify-content-between">
                                <button type="submit" className="btn btn-success">
                                    ยืนยัน
                                </button>
                            </div>

                        </form>
                    </div>
                )}
            </div>
        </section>
    )
}

export default DashboardActivitiesPages;