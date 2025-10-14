import { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "../css/activity.css"
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { IoMdClose } from "react-icons/io";
import { MdEdit, MdDelete } from 'react-icons/md';
import { Link } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import {HOSTNAME} from '../config.js';

function Activity() {
    const [activityId, setActivityId] = useState(null);
    const [activity, setActivity] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('activity');
    const [showForm, setShowForm] = useState(false);
    // const userRole = sessionStorage.getItem("userRole");
    const {user} = useAuth();
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
        // ดึงข้อมูลกิจกรรมที่กำลังจะจัดขึ้น
        axios.get(HOSTNAME +'/activity/all-activity')
            .then(response => {
                setActivity(response.data.data);
            })
            .catch(error => {
                console.error("Error fetching activities:", error);
            });
    }, []);


    const handleStatusChange = (e) => {
        // console.log("Selected status:", e.target.value);
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

    const filteredActivity = sortedActivity.filter((activity) => {
        const matchesSearch = activity.activity_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        if (selectedStatus === "activity") return matchesSearch;
        return matchesSearch && activity.status === Number(selectedStatus);// แปลง selectedStatus เป็นตัวเลข
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

        axios.post(HOSTNAME +'/activity/activity-form', formData, {
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
            axios.get(HOSTNAME +`/activity/check-join/${activityId}`, {
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


    const handleDeleteActivity = (activityId) => {
        Swal.fire({
            title: "ยืนยันการลบกิจกรรม?",
            text: "คุณต้องการลบกิจกรรมนี้หรือไม่?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "ลบ",
            cancelButtonText: "ยกเลิก",
        }).then((result) => {
            if (result.isConfirmed) {
                axios.delete(HOSTNAME +`/activity/delete-activity/${activityId}`, {
                    withCredentials: true,
                })
                    .then(() => {
                        Swal.fire("ลบสำเร็จ!", "กิจกรรมถูกลบเรียบร้อยแล้ว", "success");
                        setActivity((prev) =>
                            prev.filter((activity) => activity.activity_id !== activityId)
                        );
                    })
                    .catch((error) => {
                        console.error("Error deleting activity:", error);
                        Swal.fire("เกิดข้อผิดพลาด!", "ไม่สามารถลบกิจกรรมได้", "error");
                    });
            }
        });
    };

    // ฟังก์ชันช่วยสำหรับจัดการคลาสสถานะ
    const getStatusClass = (status) => {
        switch (status) {
            case 0:
                return "กำลังจะจัดขึ้น";
            case 1:
                return "เสร็จสิ้นแล้ว";
            case 2:
                return "กำลังดำเนินการ";
            default:
                return "";
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr || dateStr === "0000-00-00") return "ไม่ระบุวันที่";
        const date = new Date(dateStr);
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear() + 543; // เพิ่ม 543 ปีเพื่อให้ตรงกับปีไทย
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
    const itemsPerPage = 3; // จำนวนกิจกรรมต่อหน้า
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
                            กิจกรรม
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

                <div className="d-flex justify-content-between align-items-center mb-3 ">
                    <select className="form-select w-auto me-2" onChange={handleStatusChange}>
                        <option value="activity">กิจกรรม</option>
                        <option value="2">กำลังดำเนินการ</option>
                        <option value="1">เสร็จสิ้นแล้ว</option>
                        <option value="0">กำลังจะจัดขึ้น</option>
                    </select>

                    {userRole === "2" && (
                        <div className="ms-auto ">
                            <Link to={`/activity/president-create-activity`} className="text-decoration-none">
                                <button
                                    className="btn btn-gradient d-flex align-items-center gap-2 px-4 py-2 shadow-sm"
                                    style={{
                                        background: 'linear-gradient(45deg, #0d6efd, #4dabf7)',
                                        color: 'white',
                                        fontWeight: '600',
                                        border: 'none',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = 'linear-gradient(45deg, #0a58ca, #339af0)';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(13, 110, 253, 0.3)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = 'linear-gradient(45deg, #0d6efd, #4dabf7)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)โ';
                                    }}
                                >
                                    เพิ่มกิจกรรม
                                </button>
                            </Link>
                        </div>
                    )}
                </div>

                <div className="container">
                    <div className="row">
                        {paginatedActivity.length > 0 ? (
                            paginatedActivity.map(activity => (
                                <div className="col-md-4 mb-5" key={activity.activity_id}>
                                    <div className="card activity-card">
                                        <div className="image-container-act">
                                            <img
                                                src={activity.image_path ? HOSTNAME +`${activity.image_path}` : "/default-image.png"}
                                                className="card-img-top"
                                                alt="กิจกรรม"
                                            />
                                            <div className={`status-badge ${getStatusClass(activity.status)}`}>
                                                {activity?.status === 0 ? "กำลังจะจัดขึ้น" :
                                                    activity?.status === 1 ? "เสร็จสิ้นแล้ว" :
                                                        activity?.status === 2 ? "กำลังดำเนินการ" : "ไม่ทราบสถานะ"}
                                            </div>
                                        </div>
                                        <div className="card-body">
                                            <h5 className="card-title">{activity.activity_name}</h5>
                                            <p className="activity-text">{activity.description}</p>
                                            <p className="text-muted">
                                                ผู้เข้าร่วม: {activity.current_participants}/{activity.max_participants || "ไม่จำกัด"}
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

                                            {/* นายกสมาคม ลบ แก้ไข */}
                                            {userRole === "2" && (
                                                <div className="d-flex justify-content-end mt-3">
                                                    <button
                                                        className="btn btn-warning me-2"
                                                        onClick={() => navigate(`/activity/edit/${activity.activity_id}`)}
                                                    >
                                                        <MdEdit className="me-1" size={18} />
                                                        แก้ไข
                                                    </button>
                                                    <button
                                                        className="btn btn-danger"
                                                        onClick={() => handleDeleteActivity(activity.activity_id)}
                                                    >
                                                        <MdDelete className="me-1" size={18} />
                                                        ลบ
                                                    </button>
                                                </div>
                                            )}
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
                    {totalPages > 1 && (
                        <nav className="d-flex justify-content-center mt-4">
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

export default Activity;