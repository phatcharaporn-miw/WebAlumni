import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../css/major-detail.css';

function MajorDetail() {
    const studentList = [
        { name: "นายอภิชาติ ศรีลอย", graduationYear: "2563", generation: "รุ่นที่ 5" },
        { name: "นางสาวพัชราพร นิลพงษ์", graduationYear: "2564", generation: "รุ่นที่ 6" },
        { name: "นายกรกช เจริญสุข", graduationYear: "2562", generation: "รุ่นที่ 4" },
        { name: "นางสาวจุฑามาศ ศรีบุญ", graduationYear: "2565", generation: "รุ่นที่ 7" },
        { name: "นายณัฐวุฒิ สุขสม", graduationYear: "2563", generation: "รุ่นที่ 5" }
    ];

    const [selectedYear, setSelectedYear] = useState("");
    const [filteredStudents, setFilteredStudents] = useState(studentList);

    const filterByYear = (year) => {
        setSelectedYear(year);
        if (year === "") {
            setFilteredStudents(studentList);
        } else {
            setFilteredStudents(studentList.filter(student => student.graduationYear === year));
        }
    };

    return (
        <section className="container my-5">
            <div className="major-detail">
                {/*หัวข้อของหน้า*/}
                <h3 className="text-center mb-4">รายชื่อศิษย์เก่า</h3>

                <div className="students  d-flex justify-content-between align-items-center">
                    <h4>รายชื่อศิษย์เก่า ประจำปี {selectedYear}</h4>
                    <div className="filter-container">
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
                    </div>
                </div>

                <div className="students ">
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th scope="col">ลำดับ</th>
                                <th scope="col">ชื่อนักศึกษา</th>
                                <th scope="col">ปีที่จบการศึกษา</th>
                                <th scope="col">รุ่นที่</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((student, index) => (
                                <tr key={index}>
                                    <th scope="row">{index + 1}</th>
                                    <td>{student.name}</td>
                                    <td>{student.graduationYear}</td>
                                    <td>{student.generation}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}

export default MajorDetail;
