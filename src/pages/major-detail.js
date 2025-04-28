import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../css/major-detail.css';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function MajorDetail() {
    const { major } = useParams(); 
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [activeTab, setActiveTab] = useState("ป.ตรี"); // ค่าเริ่มต้นเป็นแท็บ ป.ตรี
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedYear, setSelectedYear] = useState("");

    useEffect(() => {
        axios.get(`http://localhost:3001/alumni/major/${major}`)
            .then(res => {
                // console.log("API Response:", res.data);

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

    // const filterByYear = (year) => {
    //     setSelectedYear(year);
    //     const filteredByYear = year === "" ? students : students.filter(student => student.graduation_year === year);
    //     const filteredBySearch = searchTerm === "" ? filteredByYear : filteredByYear.filter(student =>
    //         student.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    //     );
    //     setFilteredStudents(filteredBySearch);
    // };

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

    return (
        <section className="container my-5">
            <div className="major-detail">
                <h3 className="text-center mb-4">รายชื่อศิษย์เก่า - สาขา {major}</h3>

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
                        className="form-control"
                        placeholder="ค้นหารายชื่อ..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>

                {/* <div className="year-filter" style={{ minWidth: "150px" }}>
                    <label htmlFor="yearSelect" className="form-label d-none">กรองตามปีที่จบการศึกษา</label>
                    <select
                                id="yearSelect"
                                className="form-select"
                                value={selectedYear}
                                onChange={(e) => filterByYear(e.target.value)}
                    >
                                <option value="">ทั้งหมด</option>
                                <option value="2563">2563</option>
                                <option value="2564">2564</option>
                                <option value="2565">2565</option>
                    </select>
                </div> */}

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
        </section>
    );
}


export default MajorDetail;
