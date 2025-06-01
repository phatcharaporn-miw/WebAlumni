import React, { useEffect, useState } from "react";
import "../css/Donate-raise.css";  // สไตล์ของหน้า
import { Link } from "react-router-dom";
import axios from "axios";

function DonateRaise() {
    const [projects, setProjects] = useState([]); 
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null); 

    useEffect(() => {
        axios
            .get("http://localhost:3001/donate",{
                withCredentials: true
            })
            .then((response) => {
                console.log('Received projects:', response.data);
                setProjects(response.data);
                setLoading(false);
            })
            .catch((err) => {
                setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
                setLoading(false);
            });
    }, []);

    const filteredProjects = projects.filter((project) => project.donation_type === "บริจาคแบบระดมทุน");

    if (loading) return <p>กำลังโหลดข้อมูล...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <img src="./image/donation.jpg" className="head-donate" alt="donation-image" />
            <button className="donate-button">บริจาค</button>

            {/* ปุ่มประเภทบริจาค */}
            <div>
                <div className="donate-type">
                    <Link to="/donate">
                        <button className="donate-type-items">โครงการบริจาคทั้งหมด</button>
                    </Link>
                    <button className="donate-type-items-raise">บริจาคแบบระดมทุน</button>
                    <Link to="/donatunlimit">
                        <button className="donate-type-items">บริจาคแบบไม่จำกัดจำนวน</button>
                    </Link>
                    <button className="donate-type-items">เพิ่มโครงการบริจาค</button>
                </div>

                {/* รายการบริจาค */}
                <div className="donate-content">
                    <h3>บริจาคแบบระดมทุน</h3>
                    {filteredProjects.length === 0 ? (
                        <p>ขออภัย ไม่มีโครงการบริจาคแบบระดมทุนในขณะนี้</p>
                    ) : (
                        <div className="donate-content-item">
                            {filteredProjects.map((project) => {
                                const progress = project.target_amount
                                    ? (project.current_amount / project.target_amount) * 100
                                    : 0; // คำนวณเปอร์เซ็นต์ความคืบหน้า
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
                                            <h5><b>{project.project_name}</b></h5>
                                            <p>{project.description}</p>
                                        </div>

                                        {/* Progress Bar */}
                                        {project.target_amount && (
                                            <div className="progress">{`${progress.toFixed(2)}%`}</div>
                                        )}
                                        {project.target_amount && (
                                            <div className="bar">
                                                <div className="progress-bar-container">
                                                    <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                                                    <span className="progress-percent">{`${progress.toFixed(0)}%`}</span>
                                                </div>
                                            </div>
                                        )}
                                        <div className="donate-details">
                                            <span>ยอดบริจาคปัจจุบัน: {project.current_amount ? project.current_amount.toLocaleString() : "0"} บาท</span>
                                            <span>เป้าหมาย: {project.target_amount ? project.target_amount.toLocaleString() : "0"} บาท</span>
                                        </div>
                                        <Link to={`/donatedetail/${project.project_id}`}>
                                            <button className="donate-bt">บริจาค</button>
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

export default DonateRaise;
