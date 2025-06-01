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
    // const [selectedYear, setSelectedYear] = useState("");

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

    const filteredBySearch = term === "" ? students : students.filter(student => {
        const lowerTerm = term.toLowerCase();
        return (
            student.full_name.toLowerCase().includes(lowerTerm) ||
            student.graduation_year?.toString().includes(lowerTerm) ||
            student.admission_year?.toString().includes(lowerTerm) ||
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
                        className="form-control w-25"
                        placeholder="ค้นหา..."
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
                                        <td>{student.admission_year}</td>
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


export default MajorDetail;
