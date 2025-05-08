import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function UserProfile() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/admin/users/${userId}`);
        if (res.data.success) {
          console.log(res.data.data);
          setUser(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUser();
  }, [userId]);

  if (!user) {
    return <p className="text-center mt-4">กำลังโหลดข้อมูล...</p>;
  }

  return (
    <div className="container mt-5">
      <div className="card shadow-lg rounded-4 mx-auto p-4" style={{ maxWidth: "800px" }}>
        <div className="text-center mb-4">
          <img
            src={user.image_path ? `http://localhost:3001/${user.image_path}` : "/default-profile-pic.jpg"}
            alt="Profile"
            className="rounded-circle shadow"
            style={{ width: "120px", height: "120px", objectFit: "cover" }}
          />
          <h4 className="mt-3 mb-0">{user.full_name || "ไม่ระบุชื่อ"}</h4>
          <span className="badge bg-secondary">{user.role_name}</span>
        </div>

        <hr />

        {/* ข้อมูลทั่วไป */}
        <section className="mb-4">
          <h5 className="text-primary mb-3">ข้อมูลส่วนตัว</h5>
          <ul className="list-group list-group-flush">
            <Info label="อีเมล" value={user.email} />
            <Info label="เบอร์โทร" value={user.phone} />
            <Info label="ที่อยู่" value={user.address} />
            <Info
              label="สถานะ"
              value={
                user.is_active ? (
                  <span className="text-success fw-semibold">ใช้งาน</span>
                ) : (
                  <span className="text-danger fw-semibold">ระงับ</span>
                )
              }
            />
          </ul>
        </section>

        {/* การศึกษา */}
        {user.educations?.length > 0 && (
          <section className="mb-4">
            <h5 className="text-primary mb-3">ข้อมูลการศึกษา</h5>
            <ul className="list-group list-group-flush">
              {user.educations.map((edu, index) => (
                <li key={index} className="list-group-item">
                  <strong>{edu.degree_name || "-"}</strong> - {edu.major_name || "-"}<br />
                  <small className="text-muted">รหัสนักศึกษา: {edu.studentId || "-"}</small><br />
                  <small className="text-muted">ปีที่จบ: {edu.graduation_year || "-"}</small>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* กิจกรรม */}
        {user.activities?.length > 0 && (
          <section className="mb-4">
            <h5 className="text-primary mb-3">ประวัติเข้าร่วมกิจกรรม</h5>
            <ul className="list-group list-group-flush">
              {user.activities.map((act, index) => (
                <li key={index} className="list-group-item d-flex align-items-start gap-3">
                  <img
                    src={act.image_path ? `http://localhost:3001${act.image_path}` : "/default-activity.jpg"}
                    alt={act.activity_name}
                    className="rounded"
                    style={{ width: "60px", height: "60px", objectFit: "cover" }}
                  />
                  <div>
                    <strong>{act.activity_name}</strong><br />
                    <small className="text-muted">วันที่: {new Date(act.activity_date).toLocaleDateString()}</small><br />
                    <span className={`badge mt-1 ${
                      act.status === 1 ? "bg-success" :
                      act.status === 0 ? "bg-warning" :
                      act.status === 2 ? "bg-primary" :
                      "bg-warning text-dark"
                    }`}>
                      {act.status === 1 ? "เสร็จสิ้นแล้ว" : act.status === 0 ? "ยังไม่เริ่ม" : "กำลังดำเนินการ"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* กระทู้ */}
        {user.posts?.length > 0 && (
          <section>
            <h5 className="text-primary mb-3">กระทู้ที่เคยสร้าง</h5>
            <ul className="list-group list-group-flush">
              {user.posts.map((post, index) => (
                <li key={index} className="list-group-item">
                  <strong>{post.title}</strong><br />
                  <small className="text-muted">วันที่โพสต์: {new Date(post.created_at).toLocaleDateString()}</small>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );

  function Info({ label, value }) {
    return (
      <li className="list-group-item d-flex">
        <div style={{ width: "120px" }} className="text-secondary fw-medium">
          {label}:
        </div>
        <div className="flex-grow-1">{value || "-"}</div>
      </li>
    );
  }
  
}

export default UserProfile;
