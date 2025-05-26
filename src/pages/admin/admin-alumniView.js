import { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../css/major-detail.css';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function AdminAlumniView() {
    const { major } = useParams(); 
    const [alumniData, setAlumniData] = useState([]);
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [activeTab, setActiveTab] = useState("ป.ตรี"); // ค่าเริ่มต้นเป็นแท็บ ป.ตรี
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();
    // const [selectedYear, setSelectedYear] = useState("");

    const majors = [
        { title: "วิทยาการคอมพิวเตอร์", slug: "cs" },
        { title: "เทคโนโลยีสารสนเทศ", slug: "it" },
        { title: "ภูมิสารสนเทศศาสตร์", slug: "gis" },
        { title: "ความปลอดภัยไซเบอร์", slug: "cy" },
        { title: "ปัญญาประดิษฐ์", slug: "ai" },
    ];

    useEffect(() => {
        axios.get(`http://localhost:3001/alumni/major/${major}`)
            .then(res => {
                // แปลง degree_id เป็นข้อความ
                const updatedData = res.data.map(student => ({
                    ...student,
                    degree: mapDegreeIdToText(student.degree_id) 
                }));

                setStudents(updatedData);
                setFilteredStudents(updatedData.filter(student => student.degree === "ป.ตรี")); 
            })
            .catch(err => console.error(err));
    }, [major]);

    const handleTabChange = (degree) => {
        setActiveTab(degree);
        const filteredByDegree = students.filter(student => student.degree === degree);
        const filteredBySearch = searchTerm === "" ? filteredByDegree : filteredByDegree.filter(student =>
            student.full_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredStudents(filteredBySearch);
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        const filteredBySearch = term === "" ? students : students.filter(student =>
            student.full_name.toLowerCase().includes(term.toLowerCase())
        );
        const filteredByDegree = filteredBySearch.filter(student => student.degree === activeTab);
        setFilteredStudents(filteredByDegree);
    };

    const mapDegreeIdToText = (degreeId) => {
        switch (degreeId) {
            case 1:
                return "ป.ตรี";
            case 2:
                return "ป.โท";
            case 3:
                return "ป.เอก";
            default:
                return "ไม่ทราบระดับการศึกษา";
        }
    };

    // export file to CSV
    const exportToCSV = () => {
        const headers = ["ลำดับ", "ชื่อ", "รหัสนักศึกษา", "ปีที่จบการศึกษา", "ระดับการศึกษา"];
        const rows = filteredStudents.map((student, index) => [
            index + 1,
            student.full_name,
            student.studentId,
            student.graduation_year,
            student.degree
        ]);

        let csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
            + [headers, ...rows].map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `รายชื่อศิษย์เก่าสาขา_${major}_${activeTab}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // useEffect(() => {
    //     axios.get("http://localhost:3001/alumni/outstanding-alumni")
    //         .then((res) => setAlumniData(res.data))
    //         .catch((err) => console.error("โหลดศิษย์เก่าดีเด่นล้มเหลว:", err));
    // }, []);

    // const handleAlumniClick = (userId) => navigate(`/admin/users/user-profile/${userId}`);

    return (
        <section className="container my-5">
            <h3 className="text-center mb-4">ทำเนียบศิษย์เก่าสาขา {major}</h3>

           <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                {/* Dropdown ทางซ้าย */}
                <div style={{ minWidth: "250px", maxWidth: "100%" }}>
                <select
                    id="majorSelect"
                    className="form-select"
                    onChange={(e) =>
                    navigate(`/admin/admin-alumni/admin-alumniView/${e.target.value}`)
                    }
                >
                    <option value="">-- เลือกสาขา --</option>
                    {majors.map((major, idx) => (
                    <option key={idx} value={major.slug}>
                        {major.title}
                    </option>
                    ))}
                </select>
                </div>

                {/* ปุ่มดาวน์โหลดทางขวา */}
                <button className="btn btn-outline-success" onClick={exportToCSV}>
                ดาวน์โหลดรายชื่อ
                </button>
            </div>

            <div className="major-detail">
                <ul className="nav nav-tabs mb-4">
                    {["ป.ตรี", "ป.โท", "ป.เอก"].map((degree) => (
                        <li className="nav-item" key={degree}>
                            <button
                                className={`nav-link ${activeTab === degree ? "active" : ""}`}
                                onClick={() => handleTabChange(degree)}
                            >
                                {degree}
                            </button>
                        </li>
                    ))}
                </ul>

                <div className="search-box mb-4">
                    <input
                        type="text"
                        className="form-control w-25"
                        placeholder="ค้นหารายชื่อ..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>

                <div className="students">
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th scope="col">ลำดับ</th>
                                <th scope="col">ชื่อนักศึกษา</th>
                                <th scope="col">ปีที่จบการศึกษา</th>
                                <th scope="col">รหัสนักศึกษา</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((student, index) => (
                                    <tr key={index}>
                                        <th scope="row">{index + 1}</th>
                                        <td>{student.full_name}</td>
                                        <td>{student.graduation_year}</td>
                                        <td>{student.studentId}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center text-muted">
                                        ยังไม่มีรายชื่อ
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <hr className="my-5" />

            {/* <div className="outstanding">
                <h5 className="mb-4">ศิษย์เก่าดีเด่น</h5>
                <div className="row">
                    {alumniData.map((alumni, index) => (
                        <div
                            key={index}
                            className="col-md-6 col-lg-4 mb-4"
                            onClick={() => handleAlumniClick(alumni.user_id)}
                            style={{ cursor: "pointer" }}
                        >
                            <div className="d-flex align-items-center shadow p-3 rounded-3 bg-light">
                                <img
                                    src={alumni.image_path ? `http://localhost:3001/${alumni.image_path}` : "/default-profile-pic.jpg"}
                                    alt={alumni.name}
                                    className="rounded-circle me-3"
                                    style={{ width: "70px", height: "70px", objectFit: "cover", border: "2px solid #0F75BC" }}
                                />
                                <div>
                                    <h6 className="mb-1">{alumni.name}</h6>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div> */}
        </section>
    );
}

export default AdminAlumniView;
