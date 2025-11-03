import { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../css/alumni.css';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BsAwardFill } from "react-icons/bs";
import {HOSTNAME} from '../../config.js';

function AdminAlumni() {
    const [alumniData, setAlumniData] = useState([]);
    const navigate = useNavigate();

    const majors = [
        { title: "วิทยาการคอมพิวเตอร์", slug: "cs" },
        { title: "เทคโนโลยีสารสนเทศ", slug: "it" },
        { title: "ภูมิสารสนเทศศาสตร์", slug: "gis" },
        { title: "ความปลอดภัยไซเบอร์", slug: "cy" },
        { title: "ปัญญาประดิษฐ์", slug: "ai" },
    ];

    useEffect(() => {
        axios.get(HOSTNAME +"/alumni/outstanding-alumni")
            .then((res) => setAlumniData(res.data))
            .catch((err) => console.error("ไม่สามารถโหลดศิษย์เก่าดีเด่น:", err));
    }, []);

    const handleAlumniClick = (userId) => navigate(`/admin/users/user-profile/${userId}`);


    return (
        <section className="alumni-container p-4 p-md-5 bg-light rounded-4 shadow-sm">
            <div className="mb-5">
                <h3 className="admin-title">
                    ทำเนียบศิษย์เก่า
                </h3>

                {/* สาขา */}
                <div className="mb-4">
                    <label htmlFor="majorSelect" className="form-label fw-semibold">เลือกสาขา</label>
                    <select
                        id="majorSelect"
                        className="form-select w-100 w-md-50 shadow-sm"
                        onChange={(e) =>
                            navigate(`/admin/admin-alumni/admin-alumniView/${e.target.value}`)
                        }
                    >
                        <option value="">-- เลือกสาขา --</option>
                        {majors.map((major, idx) => (
                            <option key={idx} value={major.slug}>{major.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* ผู้มีคุณูปการ */}
            <div className="mb-5">
                <h5 className="border-start border-4 border-primary ps-3 mb-3 fw-bold">
                    ศิษย์เก่าผู้มีคุณูปการ
                </h5>
                <div className="table-responsive rounded-3 shadow-sm">
                    <table className="table table-bordered table-striped align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>ลำดับ</th>
                                <th>ชื่อ-นามสกุล</th>
                                <th>ตำแหน่ง</th>
                                <th>สถานะ</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>นายวิมล นามอาษา</td>
                                <td>นายกสมาคมศิษย์เก่าวิทยาลัยการคอมพิวเตอร์</td>
                                <td>
                                    <span className="badge bg-success px-3 py-2">ใช้งาน</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ศิษย์เก่าดีเด่น */}
            <div className="mb-5">
                <h5 className="border-start border-4 border-warning ps-3 mb-3 fw-bold">
                    ศิษย์เก่าดีเด่น
                </h5>
                <div className="table-responsive shadow-sm rounded-3">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th style={{ width: "60px" }}>#</th>
                                <th>ชื่อ</th>
                                <th style={{ width: "140px" }}>ดูโปรไฟล์</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alumniData.length > 0 ? alumniData.map((alumni, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <img
                                                src={alumni.image_path 
                                                    ? HOSTNAME +`/${alumni.image_path}` 
                                                    : HOSTNAME +"้/uploads/default-profile.png"}
                                                alt={alumni.name}
                                                className="rounded-circle me-3 border"
                                                style={{ width: "45px", height: "45px", objectFit: "cover" }}
                                            />
                                            <span className="fw-semibold">{alumni.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-outline-primary btn-sm shadow-sm"
                                            onClick={() => handleAlumniClick(alumni.user_id)}
                                        >
                                            ดูโปรไฟล์
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="3" className="text-center text-muted py-4">
                                        ไม่มีข้อมูลศิษย์เก่าดีเด่น
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}

export default AdminAlumni;
