import React, { useEffect, useState } from "react";
import "../css/Donate.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

function Donate() {
    const [projects, setProjects] = useState([]);
    const [filter, setFilter] = useState("all"); // สถานะการกรอง
    const [error] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        axios
            .get("http://localhost:3001/donate",{
                withCredentials: true
            })
            .then((response) => {
                setProjects(response.data);
            })
            .catch((err) => {
                console.log("เกิดข้อผิดพลาดในการดึงข้อมูล");
            });
    }, []);

    const handleCreateDonation = () => {
        const isLoggedIn = localStorage.getItem("userId"); // ตรวจสอบว่าผู้ใช้เข้าสู่ระบบหรือไม่
        if (!isLoggedIn) {
            Swal.fire({
                title: "กรุณาเข้าสู่ระบบ",
                text: "คุณต้องเข้าสู่ระบบก่อนสร้างการบริจาค",
                icon: "warning",
                confirmButtonText: "เข้าสู่ระบบ",
                confirmButtonColor: "#3085d6",
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate("/login"); 
                }
            });
        } else {
            navigate("/donate/donaterequest"); 
        }
    };

    const filteredProjects = projects.filter((project) => {
        if (filter === "all") return true;
        return project.donation_type === filter;
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

    return (
        <div>
            <img src="./image/donation (1).jpg" className="head-donate" alt="donation-image" />
            <div className="content-donate">
                <div className="donate-request">
                    <button className="donate-bt" onClick={handleCreateDonation}>
                        สร้างการบริจาค
                    </button>
                </div>
                <div className="donate-filter">
                    <label htmlFor="donation-type">เลือกประเภทการบริจาค:</label>
                    <select
                        id="donation-type"
                        className="filter-select"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)} // เปลี่ยน filter ตามค่าที่เลือก
                    >
                        <option value="all">โครงการบริจาคทั้งหมด</option>
                        <option value="fundraising">บริจาคแบบระดมทุน</option>
                        <option value="unlimited">บริจาคแบบไม่จำกัดจำนวน</option>
                        <option value="things">บริจาคสิ่งของ</option>
                    </select>
                </div>
            </div>

            {/* รายการบริจาค */}
            <h3 id="title-donate">{getFilterTitle()}</h3>
            <div className="donate-content">
                {filteredProjects.length === 0 ? (
                    <p>ขออภัย ไม่มีโครงการบริจาคในขณะนี้</p>
                ) : (
                    <div className="donate-content-item">
                        {filteredProjects.map((project) => {
                            const startDate = project?.start_date ? new Date(project.start_date) : null;
                            const endDate = project?.end_date ? new Date(project.end_date) : null;
                            const options = { year: "numeric", month: "long", day: "numeric" };

                            const formattedStartDate = startDate
                                ? startDate.toLocaleDateString("th-TH", options)
                                : "-";
                            const formattedEndDate = endDate
                                ? endDate.toLocaleDateString("th-TH", options)
                                : "-";

                            const progress = project.target_amount
                                ? (project.current_amount / project.target_amount) * 100
                                : 0;
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
                                        <p className={`tagDonate ${project.donation_type || "default"}`}>
                                            {getFilterTitle(project.donation_type)}
                                        </p>
                                        <p className="donate-discription-date">
                                            {formattedStartDate} - {formattedEndDate}
                                        </p>
                                        <h5>
                                            <b>{project.project_name}</b>
                                        </h5>
                                        <p>{project.description}</p>
                                        <div id="description_">
                                            {project.donation_type !== "unlimited" &&
                                                project.donation_type !== "things" && (
                                                    <div className="progress">{`${progress.toFixed(
                                                        2
                                                    )}%`}</div>
                                                )}
                                            <div className="bar">
                                                {project.donation_type !== "unlimited" &&
                                                    project.donation_type !== "things" && (
                                                        <div className="progress-bar-container">
                                                            <div
                                                                className="progress-bar"
                                                                style={{
                                                                    width: `${progress ? progress.toFixed(0) : 0}%`,
                                                                }}
                                                            >
                                                                <span className="progress-percent">
                                                                    {`${progress ? progress.toFixed(0) : 0}%`}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                            </div>
                                        </div>
                                        <div className="donate-details">
                                            <div className="details-amount1">
                                                <p>
                                                    ยอดบริจาคปัจจุบัน:
                                                    <br />
                                                    <span className="details-amount-title">
                                                        {project.current_amount
                                                            ? project.current_amount.toLocaleString()
                                                            : "0"}{" "}
                                                    </span>
                                                    บาท
                                                </p>
                                                <br />
                                            </div>
                                            <div className="details-amount2">
                                                {project.donation_type !== "unlimited" &&
                                                    project.donation_type !== "things" &&
                                                    project.target_amount > 0 && (
                                                        <p>
                                                            เป้าหมาย:
                                                            <br />
                                                            <span className="details-amount-title">
                                                                {project.target_amount
                                                                    ? project.target_amount.toLocaleString()
                                                                    : "0"}{" "}
                                                            </span>
                                                            บาท
                                                        </p>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="button-container">
                                        <Link to={`/donate/donatedetail/${project.project_id}`}>
                                            <button className="donate-bt">บริจาค</button>
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