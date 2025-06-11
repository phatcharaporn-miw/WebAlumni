import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../../css/adminDonate.css"; 
import axios from "axios";
import { Link } from "react-router-dom";

function AdminDonate() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    // ดึงข้อมูลโครงการจาก API
    useEffect(() => {
        axios
            .get("http://localhost:3001/admin/donate")
            .then((response) => {
                const updatedProjects = response.data.map((project) => ({
                    ...project,
                    showFullDescription: false,
                }));
                setProjects(updatedProjects);
                setLoading(false);
            })
            .catch((error) => {
                setError(error.response?.data?.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
                setLoading(false);
            });
    }, []);

    // ฟังก์ชันสำหรับค้นหาโครงการ
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // ฟังก์ชันสำหรับการลบโครงการ
    const handleDelete = async (projectId) => {
        const confirmDelete = window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบโครงการนี้?");
        if (confirmDelete) {
            try {
                await axios.delete(`http://localhost:3001/admin/donate/${projectId}`);
                setProjects(projects.filter((project) => project.project_id !== projectId));
            } catch (error) {
                alert("เกิดข้อผิดพลาดในการลบโครงการ");
            }
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

    // ฟังก์ชันกรองโครงการตามคำค้นหา
    const filteredProjects = projects.filter((project) =>
        project.project_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="donate-activity-container">
            <h2 className="donate-activity-title">การบริจาคและโครงการ</h2>

            <div className="donate-search-container">
                <input
                    type="text"
                    className="donate-search-input"
                    placeholder="ค้นหาโครงการ..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
            </div>

            {error && <div className="error-alert">{error}</div>}

            {/* แสดงการโหลดข้อมูล */}
            {loading && (
                <div className="spinner-container">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">กำลังโหลด...</span>
                    </div>
                </div>
            )}

            <div className="donate-admin-content">
                {filteredProjects.length === 0 ? (
                    <p>ขออภัย ไม่มีโครงการบริจาคในขณะนี้</p>
                ) : (
                    <div className="donate-admin-content-item">
                        {filteredProjects.map((project) => {
                            const startDate = project.start_date ? new Date(project.start_date) : null;
                            const endDate = project.end_date ? new Date(project.end_date) : null;
                            const options = { year: "numeric", month: "long", day: "numeric" };
                            const formattedStartDate = startDate?.toLocaleDateString("th-TH", options);
                            const formattedEndDate = endDate?.toLocaleDateString("th-TH", options);

                            // คำนวณเปอร์เซ็นต์เมื่อมีเป้าหมาย
                            const progress =
                                project.target_amount && project.target_amount > 0
                                    ? (project.current_amount / project.target_amount) * 100
                                    : null;

                            const isDescriptionLong = project.description.length > 200;

                            return (
                                <div className="donate-admin-item-detail" key={project.project_id}>
                                    <div className="donate-admin-item-image-frame">
                                        <img
                                            src={`http://localhost:3001/uploads/${project.image_path}`}
                                            alt={project.project_name}
                                            onError={(e) => {
                                                e.target.src = "/image/default.jpg";
                                            }}
                                        />
                                    </div>
                                    <div className="donate-description">
                                        <p className="donate-description-date">
                                            {formattedStartDate} - {formattedEndDate}
                                        </p>
                                        <h5>{project.project_name}</h5>
                                        <p>
                                            {project.showFullDescription || !isDescriptionLong
                                                ? project.description
                                                : `${project.description.substring(0, 200)}...`}
                                        </p>
                                        {isDescriptionLong && (
                                            <button
                                                className="view-more-btn"
                                                onClick={() => handleViewMoreToggle(project.project_id)}
                                            >
                                                {project.showFullDescription ? "ย่อข้อมูล" : "ดูเพิ่มเติม"}
                                            </button>
                                        )}

                                        {progress !== null && (
                                            <>
                                                <div className="donate-progress-bar-persen">
                                                    {progress.toFixed(0)}%
                                                </div>

                                                <div className="donate-progress-bar-container">
                                                    <div
                                                        className="donate-progress-bar-inner"
                                                        style={{ width: `${progress.toFixed(0)}%` }}
                                                    />
                                                </div>
                                            </>
                                        )}

                                        <div className="donate-details">
                                            <div className="donation-amount-info">
                                                <p>
                                                    ยอดบริจาคปัจจุบัน:
                                                    <br />
                                                    <span className="donation-amount-title">
                                                        {Number(project.current_amount).toLocaleString()}
                                                    </span>{" "}
                                                    บาท
                                                </p>
                                            </div>
                                            {project.donation_type !== "unlimited" && project.donation_type !== "things" && (
                                                <div className="donation-amount-target">
                                                    <p>
                                                        เป้าหมาย:
                                                        <br />
                                                        <span className="donation-amount-title">
                                                            {Number(project.target_amount).toLocaleString()}
                                                        </span>{" "}
                                                        บาท
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="donate-button-container">
                                            <Link to={`/admin/edit/${project.project_id}`}>
                                                <button className="admin-edit-button">แก้ไข</button>
                                            </Link>
                                            <button
                                                className="admin-delete-button"
                                                onClick={() => handleDelete(project.project_id)}
                                            >
                                                ลบ
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminDonate;