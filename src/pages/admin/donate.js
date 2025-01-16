import React, { useEffect, useState } from "react";
import "../../css/Donate.css";
import { Link } from "react-router-dom";
import axios from "axios";

function AdminDonate() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios
            .get("http://localhost:5000/donate")
            .then((response) => {
                setProjects(response.data);
                setLoading(false);
            })
            .catch((err) => {
                setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
                setLoading(false);
            });
    }, []);

    if (loading) return <p>กำลังโหลดข้อมูล...</p>;
    if (error) return <p>{error}</p>;

    // ฟังก์ชันสำหรับการลบโครงการ
    const handleDelete = (projectId) => {
        console.log('Trying to delete project with ID:', projectId); // ตรวจสอบค่าของ projectId
        if (window.confirm("คุณแน่ใจว่าจะลบโครงการนี้?")) {
            axios
                .delete(`http://localhost:5000/donate/${projectId}`)
                .then((response) => {
                    console.log('Deleted successfully', response.data);
                    setProjects(projects.filter((project) => project.project_id !== projectId));
                    alert("โครงการถูกลบเรียบร้อยแล้ว");
                })
                .catch((err) => {
                    console.error('Error deleting the project:', err);
                    alert("เกิดข้อผิดพลาดในการลบโครงการ");
                });
        }
    };
    
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
                                                src={`http://localhost:5000/uploads/${project.image_path}`}
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
                                        <Link to={`/donatedetail/${project.project_id}`}>
                                            <button className="donate-bt">บริจาค</button>
                                        </Link>

                                        {/* ปุ่มลบโครงการ */}
                                        <button 
                                            className="delete-button" 
                                            onClick={() => handleDelete(project.project_id)}
                                        >
                                            ลบ
                                        </button>
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

export default AdminDonate;
