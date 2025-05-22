import { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../css/alumni.css';
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

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
        axios.get("http://localhost:3001/alumni/outstanding-alumni")
            .then((res) => setAlumniData(res.data))
            .catch((err) => console.error("ไม่สามารถโหลดศิษย์เก่าดีเด่น:", err));
    }, []);

    const handleAlumniClick = (userId) => navigate(`/admin/users/user-profile/${userId}`);


    return (
        <section className="container py-4">
            <div className="mb-5">
                <h2 className="alumni-title text-center">ทำเนียบศิษย์เก่า</h2>

                <div className="mb-4">
                     <h4 className="border-bottom pb-2">สาขา</h4>
                    <select
                        id="majorSelect"
                        className="form-select w-100 w-md-50"
                        onChange={(e) => navigate(`/admin/admin-alumni/admin-alumniView/${e.target.value}`)}
                    >
                        <option value="">-- เลือกสาขา --</option>
                        {majors.map((major, idx) => (
                            <option key={idx} value={major.slug}>{major.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="mb-5">
                <h4 className="border-bottom pb-2">ศิษย์เก่าผู้มีคุณูปการ</h4>
                <div className="table-responsive mt-3">
                    <table className="table table-bordered table-striped">
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
                                <td>นางสาวพัชราพร นิลพงษ์</td>
                                <td>นายกสมาคมศิษย์เก่า</td>
                                <td><span className="badge bg-primary">Active</span></td>
                            </tr>
                           
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mb-5">
                <h4 className="border-bottom pb-2">ศิษย์เก่าดีเด่น</h4>
                <div className="table-responsive mt-3">
                    <table className="table table-hover">
                        <thead className="table-light">
                            <tr>
                                <th>#</th>
                                <th>ชื่อ</th>
                                <th>ดูโปรไฟล์</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alumniData.map((alumni, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <img
                                                src={alumni.image_path ? `http://localhost:3001/${alumni.image_path}` : "/default-profile-pic.jpg"}
                                                alt={alumni.name}
                                                className="rounded-circle me-2"
                                                style={{ width: "40px", height: "40px", objectFit: "cover" }}
                                            />
                                            {alumni.name}
                                        </div>
                                    </td>
                                    <td>
                                        <button className="btn btn-sm btn-outline-primary" onClick={() => handleAlumniClick(alumni.user_id)}>
                                            ดูโปรไฟล์
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {alumniData.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="text-center text-muted">ไม่มีข้อมูลศิษย์เก่าดีเด่น</td>
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
