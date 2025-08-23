import React, { useEffect, useState } from "react";
import "../css/Donate.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

function Donate() {
    const [projects, setProjects] = useState([]);
    const [filter, setFilter] = useState("all");
    const [error] = useState(null);
    const [filterStatus, setFilterStatus] = useState("all");
    const userId =localStorage.getItem("userid");

    useEffect(() => {
        axios
            .get("http://localhost:3001/donate")
            .then((response) => {
                setProjects(response.data);
            })
            .catch((err) => {
                console.log("เกิดข้อผิดพลาดในการดึงข้อมูล");
            });
    }, []);

    const handleCreateDonate = () => {
        if (!userId) {
            // แจ้งเตือนและนำไปหน้าเข้าสู่ระบบ
            Swal.fire({
                icon: 'warning',
                title: 'กรุณาเข้าสู่ระบบ',
                text: 'คุณต้องเข้าสู่ระบบก่อนสร้างโครงการบริจาค',
                confirmButtonText: 'เข้าสู่ระบบ',
                allowOutsideClick: false
            }).then(() => {
                window.location.href = "/login";
            });
            return;
        }
        window.location.href = "/donate/donaterequest";
    };

    const calculateDaysRemaining = (endDate) => {
        const now = new Date();
        const end = new Date(endDate);
        return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    };

    const handleFilterChange = (e) => {
        setFilterStatus(e.target.value);
    };

    if (error) return <p>{error}</p>;

    // ฟิลเตอร์โปรเจกต์ตามประเภทและสถานะกิจกรรม
    const filteredProjects = projects.filter((project) => {
        const now = new Date();
        const endDate = project?.end_date ? new Date(project.end_date) : null;

        // กรองตามประเภทการบริจาค
        if (filter !== "all" && project.donation_type !== filter) {
            return false;
        }

        // กรองตามสถานะกิจกรรม
        if (filterStatus === "active" && endDate && now > endDate) {
            return false; // หมดอายุแล้ว
        }
        if (filterStatus === "expired" && endDate && now <= endDate) {
            return false; // ยังไม่หมดอายุ
        }

        return true;
    });

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
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + "...";
    };

    return (
        <div>
            <img src="./image/donation (1).jpg" className="head-donate" alt="donation-image" />
            <div className="content-donate" >
                <div className="donate-request">
                    <button className="donate-bt" onClick={handleCreateDonate}>
                        สร้างการบริจาค
                    </button>
                </div>

                <div className="donate-filter ">
                    <label htmlFor="donation-type">ประเภทการบริจาค:</label>
                    <select
                        id="donation-type"
                        className="filter-select"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">โครงการบริจาคทั้งหมด</option>
                        <option value="fundraising">บริจาคแบบระดมทุน</option>
                        <option value="unlimited">บริจาคแบบไม่จำกัดจำนวน</option>
                        <option value="things">บริจาคสิ่งของ</option>
                    </select>

                    <label htmlFor="status-filter" style={{ marginLeft: "1rem" }}>สถานะกิจกรรม:</label>
                    <select
                        id="status-filter"
                        className="filter-select"
                        value={filterStatus}
                        onChange={handleFilterChange}
                    >
                        <option value="all">ทั้งหมด</option>
                        <option value="active">กำลังจัดอยู่</option>
                        <option value="expired">สิ้นสุดแล้ว</option>
                    </select>
                </div>
            </div>

            {/* รายการบริจาค */}
            <h3 id="title-donate">{getFilterTitle()}</h3>
            <div className="donate-content">
                {filteredProjects.length === 0 ? (
                    <div className="no-projects">
                        <p>ขออภัย ไม่มีโครงการบริจาคในขณะนี้</p>
                    </div>
                ) : (
                    <div className="donate-content-grid">
                        {filteredProjects.map((project) => {
                            const now = new Date();
                            const startDate = project?.start_date ? new Date(project.start_date) : null;
                            const endDate = project?.end_date ? new Date(project.end_date) : null;

                            const options = { year: 'numeric', month: 'long', day: 'numeric' };
                            const formattedStartDate = startDate ? startDate.toLocaleDateString('th-TH', options) : "-";
                            const formattedEndDate = endDate ? endDate.toLocaleDateString('th-TH', options) : "-";
                            const progress = project.target_amount
                                ? (project.current_amount / project.target_amount) * 100
                                : 0;

                            const countDay = calculateDaysRemaining(endDate);

                            return (
                                <div className="item-detail" key={project.project_id}>
                                    <div className="image-frame">
                                        <img
                                            src={`http://localhost:3001/uploads/${project.image_path}`}
                                            alt={project.project_name}
                                            onError={(e) => {
                                                e.target.src = "./image/default.jpg";
                                            }}
                                        />
                                    </div>
                                    <div className="donate-discription">
                                        <div className="tag-date-container">
                                            <p className={`tagDonante ${project.donation_type || "default"}`}>
                                                {getFilterTitle(project.donation_type)}
                                            </p>
                                            <p className="donate-discription-date">{formattedStartDate} - {formattedEndDate}</p>
                                        </div>

                                        <div className="project-title">
                                            <h5><b>{truncateText(project.project_name, 60)}</b></h5>
                                        </div>

                                        <div className="project-description">
                                            <p>{truncateText(project.description, 120)}</p>
                                        </div>

                                        <div className="progress-section">
                                            {(project.donation_type !== "unlimited" && project.donation_type !== "things") && (
                                                <>
                                                    <div className="progress-text">{`${progress.toFixed(2)}%`}</div>
                                                    <div className="progress-bar-container">
                                                        <div
                                                            className="progress-bar"
                                                            style={{ width: `${progress ? progress.toFixed(0) : 0}%` }}
                                                        >
                                                            <span className="progress-percent">
                                                                {`${progress ? progress.toFixed(0) : 0}%`}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        <div className="donate-details">
                                            <div className="details-amount1">
                                                <p>ยอดบริจาคปัจจุบัน:<br />
                                                    <span className="details-amount-title">
                                                        {project.current_amount ? project.current_amount.toLocaleString() : "0"}
                                                    </span> บาท
                                                </p>
                                            </div>
                                            <div className="details-amount2">
                                                {project.donation_type !== "unlimited" && project.donation_type !== "things" && project.target_amount > 0 && (
                                                    <p>เป้าหมาย:<br />
                                                        <span className="details-amount-title">
                                                            {project.target_amount ? project.target_amount.toLocaleString() : "0"}
                                                        </span> บาท
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="donate-detail-discription-day">
                                            {endDate && now > endDate ? (
                                                <span className="expired">โครงการสิ้นสุดแล้ว</span>
                                            ) : (
                                                <span className="remaining">เหลืออีก {countDay} วัน</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="button-container">
                                        <Link to={`/donate/donatedetail/${project.project_id}`}>
                                            <button className="donate-bt">
                                                ดูรายละเอียด
                                            </button>
                                        </Link>
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

export default Donate;