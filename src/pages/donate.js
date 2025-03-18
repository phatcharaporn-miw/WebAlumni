import React, { useEffect, useState } from "react";
import "../css/Donate.css";
import { Link } from "react-router-dom";
import axios from "axios";

function Donate() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios
            .get("http://localhost:3001/donate")
            .then((response) => {
                setProjects(response.data);
                setLoading(false);
            })
            .catch((err) => {
                // setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
                setLoading(false);
            });
    }, []);

    if (loading) return <p>กำลังโหลดข้อมูล...</p>;

    return (
        <div>
            <img src="./image/donation.jpg" className="head-donate" alt="donation-image" />
            <button className="donate-button">บริจาค</button>

            {/* ปุ่มประเภทบริจาค */}
            <div>
                <div className="donate-type">
                    <button className="donate-type-items-all">โครงการบริจาคทั้งหมด</button>
                    <Link to="/donateraise"><button className="donate-type-items">บริจาคแบบระดมทุน</button></Link>
                    <Link to="/donatunlimit"><button className="donate-type-items">บริจาคแบบไม่จำกัดจำนวน</button></Link>
                    <Link to="/donaterequest"><button className="donate-type-items">เพิ่มโครงการบริจาค</button></Link>
                </div>

                {/* รายการบริจาค */}
                <h3>โครงการบริจาคทั้งหมด</h3>
                <div className="donate-content">
<<<<<<< Updated upstream
                    {projects.length === 0 ? (
                        <p>ขออภัย ไม่มีโครงการบริจาคในขณะนี้</p>
                    ) : (
                        <div className="donate-content-item">
                            {projects.map((project) => {
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
                                            <h5><b>{project.project_name}</b></h5>
                                            <p>{project.description}</p>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="progress">{`${progress.toFixed(2)}%`}</div>
                                        <div className="bar">
                                            <div className="progress-bar-container">
                                                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                                                <span className="progress-percent">{`${progress.toFixed(0)}%`}</span>
                                            </div>
                                        </div>
                                        <div className="donate-details">
                                            <span>ยอดบริจาคปัจจุบัน: {project.current_amount ? project.current_amount.toLocaleString() : "0"} บาท</span>
                                            <span>เป้าหมาย: {project.target_amount ? project.target_amount.toLocaleString() : "0"} บาท</span>
                                        </div>
                                        <Link to={`/donate/donatedetail/${project.project_id}`}>
                                            <button className="donate-bt">บริจาค</button>
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    )}
=======
                    <h3>โครงการบริจาคทั้งหมด</h3>
                    <div className="donate-content-item">
                        <div className="item-detail">
                            <div className="image-frame">
                                <img src="./image/activitie1.jpg" alt="Avatar" />
                            </div>
                            <div className="donate-discription">
                                <h5><b>ยิ้มสู่ชุมชน</b></h5>
                                <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry...</p>
                            </div>
                            {/* Progress Bar */}
                            <div className="progress">{`${progress}%`}</div>
                            <div className="bar">
                                <div className="progress-bar-container">
                                    <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                                    <span className="progress-percent">{`${progress.toFixed(0)}%`}</span>
                                </div>
                            </div>

                            <div className="donate-details">
                                <span>ยอดบริจาคปัจจุบัน: {currentAmount.toLocaleString()} บาท</span>
                                <span>เป้าหมาย: {goalAmount.toLocaleString()} บาท</span>
                            </div>
                            <Link to="/donatedetail">
                                <button className="donate-bt">บริจาค</button>
                            </Link>
                        </div>

                        <div className="item-detail">
                            <div className="image-frame">
                                <img src="./image/activitie2.jpg" alt="Avatar" />
                            </div>
                            <div className="donate-discription">
                                <h5><b>ยิ้มสู่ชุมชน</b></h5>
                                <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry...</p>
                            </div>
                            {/* Progress Bar */}
                            <div className="progress">{`${progress}%`}</div>
                            <div className="bar">
                                <div className="progress-bar-container">
                                    <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                                    <span className="progress-percent">{`${progress.toFixed(0)}%`}</span>
                                </div>
                            </div>

                            <div className="donate-details">
                                <span>ยอดบริจาคปัจจุบัน: {currentAmount.toLocaleString()} บาท</span>
                                <span>เป้าหมาย: {goalAmount.toLocaleString()} บาท</span>
                            </div>
                            <button className="donate-bt">บริจาค</button>
                        </div>
                        <div className="item-detail">
                            <div className="image-frame">
                                <img src="./image/กิจกรรม1.png" alt="Avatar" />
                            </div>
                            <div className="donate-discription">
                                <h5><b>ยิ้มสู่ชุมชน</b></h5>
                                <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry...</p>
                            </div>
                            {/* Progress Bar */}
                            <div className="progress">{`${progress}%`}</div>
                            <div className="bar">
                                <div className="progress-bar-container">
                                    <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                                    <span className="progress-percent">{`${progress.toFixed(0)}%`}</span>
                                </div>
                            </div>

                            <div className="donate-details">
                                <span>ยอดบริจาคปัจจุบัน: {currentAmount.toLocaleString()} บาท</span>
                                <span>เป้าหมาย: {goalAmount.toLocaleString()} บาท</span>
                            </div>
                            <button className="donate-bt">บริจาค</button>
                        </div>
                    </div>
>>>>>>> Stashed changes
                </div>
            </div>
        </div>
    );
}

export default Donate;
