import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

function ParticipantsPage() {
    const { activityId } = useParams();
    const navigate = useNavigate();
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [activityName, setActivityName] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`http://localhost:3001/activity/${activityId}/participants`, {
            withCredentials: true,
        })
        .then((res) => {
            if (res.data.success) {
                setParticipants(res.data.participants);
                setActivityName(res.data.activity_name);
            }
            setLoading(false);
        })
        .catch((err) => {
            console.error("เกิดข้อผิดพลาด:", err);
            setLoading(false);
        });
    }, [activityId]);

    const formatDate = (isoDateString) => {
        const date = new Date(isoDateString);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('th-TH', options);
    };

    // export file to CSV
    const exportToCSV = () => {
        const headers = ["ลำดับ", "ชื่อ-นามสกุล", "อีเมล", "สาขา", "วันที่ลงทะเบียน"];
        const rows = filteredStudents.map((student, index) => [
            index + 1,
            student.full_name,
            student.email,
            student.department,
            student.created_at
        ]);

        let csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
            + [headers, ...rows].map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `รายชื่อผู้เข้าร่วม_${activityName}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="container mt-4">         
            
        <h4>รายชื่อผู้เข้าร่วม: {activityName}</h4>
            <div className="mb-3 d-flex justify-content-end">
                <button className="btn btn-outline-success" onClick={exportToCSV}>
                    ดาวน์โหลดรายชื่อ
                </button>
            </div>
            {loading ? (
                <p>กำลังโหลดข้อมูล...</p>
            ) : participants.length > 0 ? (
                <div className="table-responsive">
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>ชื่อ-นามสกุล</th>
                                <th>อีเมล</th>
                                <th>วันที่ลงทะเบียน</th>
                                <th>สาขา</th>
                                {/* <th>ปีการศึกษา</th> */}
                                
                            </tr>
                        </thead>
                        <tbody>
                            {participants.map((p) => (
                                <tr key={p.user_id}>
                                    <td>{p.full_name}</td>
                                    <td>{p.email}</td>
                                    {/* <td>{p.batch_year}</td> */}
                                    <td>{formatDate(p.created_at)}</td>
                                    <td>{p.department}</td>
                                    
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-muted">ยังไม่มีผู้เข้าร่วมกิจกรรมนี้</p>
            )}
        </div>
    );
}

export default ParticipantsPage;
