import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// import "../../css/manage-user.css"; 

function UserProfile() {
  const { userId } = useParams(); 
  const navigate = useNavigate(); 
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/admin/users/${userId}`);
        setUser(res.data);
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
      <div className="card mx-auto shadow-sm" style={{ maxWidth: "500px" }}>
        <div className="card-body text-center">
          {/* รูปโปรไฟล์แบบวงกลม */}
          <div className="mb-3">
            <img
              src={
                user.image_path
                  ? `http://localhost:3001/${user.image_path}`
                  : "/default-profile-pic.jpg"
              }
              alt="Profile"
              className="rounded-circle shadow"
              style={{ width: "120px", height: "120px", objectFit: "cover" }}
            />
          </div>
  
          {/* ชื่อ */}
          <h4 className="card-title mb-3">{user.full_name || "ไม่ระบุชื่อ"}</h4>
  
          {/* ข้อมูลผู้ใช้ */}
          <ul className="list-group list-group-flush text-start">
            <Info label="อีเมล" value={user.email} />
            <Info label="เบอร์โทร" value={user.phone} />
            <Info label="ที่อยู่" value={user.address} />
            <Info label="บทบาท" value={user.role_name} />
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
        </div>
      </div>
    </div>
  );
  
  // ✅ component ย่อยแบบใช้ Bootstrap
  function Info({ label, value }) {
    return (
      <li className="list-group-item d-flex justify-content-between align-items-center">
        <span className="fw-medium text-secondary">{label}:</span>
        <span>{value || "-"}</span>
      </li>
    );
  }
  
  
}

export default UserProfile;