import { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../css/major-detail.css';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {HOSTNAME} from '../../config.js';
import { FaSearch } from "react-icons/fa";


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
    const displayMajor = majors.find((m) => m.slug === major)?.title || major;

    useEffect(() => {
        axios.get(HOSTNAME +`/alumni/major/${major}`)
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

        const filteredBySearch = term === "" ? students : students.filter(student => {
            const lowerTerm = term.toLowerCase();
            return (
                student.full_name.toLowerCase().includes(lowerTerm) ||
                student.graduation_year?.toString().includes(lowerTerm) ||
                student.entry_year?.toString().includes(lowerTerm) ||
                student.studentId?.toString().includes(lowerTerm)
            );
        });

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
        const headers = ["ลำดับ", "ชื่อ", "รหัสนักศึกษา", "ปีที่เข้าศึกษา", "ปีที่จบการศึกษา", "ระดับการศึกษา"];
        const rows = filteredStudents.map((student, index) => [
            index + 1,
            student.full_name,
            student.studentId,
            student.entry_year,
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

    return (
        <section className="alumni-container p-5">
            <h3 className="admin-title">ทำเนียบศิษย์เก่าสาขา {displayMajor}</h3>
            




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

                <div className="donate-filters mb-4">
  <div className="row g-3 align-items-end">
    {/* Dropdown เลือกสาขา */}
    <div className="col-md-4">
      <label htmlFor="majorSelect" className="form-label">เลือกสาขา:</label>
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

    {/* Search Box */}
    <div className="col-md-4">
      <label htmlFor="searchAlumni" className="form-label">ค้นหา:</label>
      <div className="input-group">
        <span className="input-group-text">
          <FaSearch />
        </span>
        <input
          type="text"
          id="searchAlumni"
          className="form-control"
          placeholder="ค้นหาชื่อศิษย์เก่า..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
    </div>

    {/* ปุ่มดาวน์โหลดชิดขวา */}
    <div className="col-md-4 d-flex flex-column">
      <label className="form-label invisible">ดาวน์โหลด</label>
      <button
        className="btn btn-outline-success w-100"
        onClick={exportToCSV}
      >
        ดาวน์โหลดรายชื่อ
      </button>
    </div>
  </div>
</div>


                <div className="students">
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th scope="col">ลำดับ</th>
                                <th scope="col">ชื่อนักศึกษา</th>
                                <th scope="col">รหัสนักศึกษา</th>
                                <th scope="col">ปีที่เข้าศึกษา</th>
                                <th scope="col">ปีที่จบการศึกษา</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((student, index) => (
                                    <tr key={index}>
                                        <th scope="row">{index + 1}</th>
                                        <td>{student.full_name}</td>
                                        <td>{student.studentId}</td>
                                        <td>{student.entry_year}</td>
                                        <td>{student.graduation_year}</td>

                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center text-muted">
                                        ยังไม่มีรายชื่อ
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

export default AdminAlumniView;
