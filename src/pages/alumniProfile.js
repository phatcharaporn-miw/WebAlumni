import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function HomeAlumniProfile() {
  const { userId } = useParams();
  const [alumni, setAlumni] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/alumni/${userId}`, {
          withCredentials: true
        });
        if (res.data.success) {
          setAlumni(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUser();
  }, [userId]);

  const formatDate = (dateStr) => {
        if (!dateStr || dateStr === "0000-00-00") return "ไม่ระบุวันที่";
        const date = new Date(dateStr);
        const day = date.getDate();
        const month = date.getMonth() + 1; // เดือนเป็นเลข
        const year = date.getFullYear() + 543; // ปีไทย
        return `${day}/${month}/${year}`;
  };

  if (!alumni) {
    return <p className="text-center mt-4">กำลังโหลดข้อมูล...</p>;
  }

  return (
  <div className="container mt-5 mb-5">
    <div className="row justify-content-center">
      <div className="col-12 col-lg-10 col-xl-8">
        <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
          <div className="bg-gradient bg-primary text-white p-4 pb-0">
            <div className="text-center">
              <div className="position-relative d-inline-block mb-3">
                <img
                  src={alumni.image_path ? `http://localhost:3001/${alumni.image_path}` : "/default-profile-pic.jpg"}
                  alt="Profile"
                  className="rounded-circle shadow-lg border border-4 border-white"
                  style={{ 
                    width: "140px", 
                    height: "140px", 
                    objectFit: "cover",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.3)"
                  }}
                />
                <div className="position-absolute bottom-0 end-0">
                  <span className={`badge ${alumni.is_active ? 'bg-success' : 'bg-danger'} border border-2 border-white`}>
                    <i className={`fas fa-circle me-1`}></i>
                    {alumni.is_active ? 'ใช้งาน' : 'ระงับ'}
                  </span>
                </div>
              </div>
              <h3 className="mb-2 fw-bold">{alumni.full_name || "ไม่ระบุชื่อ"}</h3>
              <span className="badge bg-light text-dark px-3 py-2 rounded-pill fs-6 mb-4">
                <i className="fas fa-user-tie me-2"></i>
                {alumni.role_name}
              </span>
            </div>
          </div>

          <div className="card-body p-4">
            {/* Personal Information Section */}
            <section className="mb-5">
              <div className="d-flex align-items-center mb-4">
                <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                  <i className="fas fa-user text-primary fs-5"></i>
                </div>
                <h5 className="text-primary mb-0 fw-bold">ข้อมูลส่วนตัว</h5>
              </div>
              
              <div className="row g-3">
                <div className="col-md-6">
                  <InfoCard 
                    icon="fas fa-envelope" 
                    label="อีเมล" 
                    value={alumni.email}
                    type="email"
                  />
                </div>
                <div className="col-md-6">
                  <InfoCard 
                    icon="fas fa-phone" 
                    label="เบอร์โทร" 
                    value={alumni.phone}
                    type="phone"
                  />
                </div>
                <div className="col-12">
                  <InfoCard 
                    icon="fas fa-map-marker-alt" 
                    label="ที่อยู่" 
                    value={alumni.address}
                    type="address"
                  />
                </div>
              </div>
            </section>

            {/* Education Section */}
            {alumni.educations?.length > 0 && (
              <section className="mb-5">
                <div className="d-flex align-items-center mb-4">
                  <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                    <i className="fas fa-graduation-cap text-success fs-5"></i>
                  </div>
                  <h5 className="text-success mb-0 fw-bold">ข้อมูลการศึกษา</h5>
                </div>
                
                <div className="row g-3">
                  {alumni.educations.map((edu, index) => (
                    <div key={index} className="col-12">
                      <div className="card border-0 bg-light shadow-sm">
                        <div className="card-body p-4">
                          <div className="d-flex align-items-start">
                            <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3 flex-shrink-0">
                              <i className="fas fa-university text-success"></i>
                            </div>
                            <div className="flex-grow-1">
                              <h6 className="fw-bold text-dark mb-2">{edu.degree_name || "-"}</h6>
                              <p className="text-muted mb-2">{edu.major_name || "-"}</p>
                              <div className="row g-2 text-sm">
                                <div className="col-sm-4">
                                  <small className="text-muted">
                                    <i className="fas fa-id-card me-1"></i>
                                    รหัส: <span className="fw-semibold">{edu.studentId || "-"}</span>
                                  </small>
                                </div>
                                <div className="col-sm-4">
                                  <small className="text-muted">
                                    <i className="fas fa-calendar-alt me-1"></i>
                                    เข้าศึกษา: <span className="fw-semibold">{edu.entry_year || "-"}</span>
                                  </small>
                                </div>
                                <div className="col-sm-4">
                                  <small className="text-muted">
                                    <i className="fas fa-calendar-check me-1"></i>
                                    จบการศึกษา: <span className="fw-semibold">{edu.graduation_year || "-"}</span>
                                  </small>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Activities Section */}
            {alumni.activities?.length > 0 && (
              <section className="mb-5">
                <div className="d-flex align-items-center mb-4">
                  <div className="bg-info bg-opacity-10 rounded-circle p-2 me-3">
                    <i className="fas fa-calendar-star text-info fs-5"></i>
                  </div>
                  <h5 className="text-info mb-0 fw-bold">ประวัติเข้าร่วมกิจกรรม</h5>
                </div>
                
                <div className="row g-3">
                  {alumni.activities.map((act, index) => (
                    <div key={index} className="col-12">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-4">
                          <div className="d-flex align-items-start gap-3">
                            <div className="position-relative flex-shrink-0">
                              <img
                                src={act.image_path ? `http://localhost:3001${act.image_path}` : "/default-activity.jpg"}
                                alt={act.activity_name}
                                className="rounded-3 shadow-sm"
                                style={{ width: "80px", height: "80px", objectFit: "cover" }}
                              />
                            </div>
                            <div className="flex-grow-1">
                              <h6 className="fw-bold text-dark mb-2">{act.activity_name}</h6>
                              <p className="text-muted mb-2">
                                <i className="far fa-calendar me-2"></i>
                                {formatDate(act.activity_date)}
                              </p>
                              <span className={`badge px-3 py-2 rounded-pill ${
                                act.status === 1 ? "bg-success bg-opacity-10 text-success" :
                                act.status === 0 ? "bg-warning bg-opacity-10 text-warning" :
                                act.status === 2 ? "bg-primary bg-opacity-10 text-primary" :
                                "bg-secondary"
                              }`}>
                                {act.status === 1 ? "เสร็จสิ้นแล้ว" : 
                                 act.status === 0 ? "ยังไม่เริ่ม" : 
                                 act.status === 2 ? "กำลังดำเนินการ" : "ไม่ทราบสถานะ"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Posts Section */}
            {alumni.posts?.length > 0 && (
              <section>
                <div className="d-flex align-items-center mb-4">
                  <div className="bg-warning bg-opacity-10 rounded-circle p-2 me-3">
                    <i className="fas fa-edit text-warning fs-5"></i>
                  </div>
                  <h5 className="text-warning mb-0 fw-bold">กระทู้ที่เคยสร้าง</h5>
                </div>
                
                <div className="row g-3">
                  {alumni.posts.map((post, index) => (
                    <div key={index} className="col-12">
                      <div className="card border-0 shadow-sm">
                        <div className="card-body p-4">
                          <div className="d-flex align-items-start">
                            <div className="bg-warning bg-opacity-10 rounded-circle p-2 me-3 flex-shrink-0">
                              <i className="fas fa-comment-dots text-warning"></i>
                            </div>
                            <div className="flex-grow-1">
                              <h6 className="fw-bold text-dark mb-2">{post.title}</h6>
                              <small className="text-muted">
                                <i className="far fa-clock me-1"></i>
                                โพสต์เมื่อ: {formatDate(post.created_at)}
                              </small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

};

// Enhanced Info Card Component
function InfoCard({ icon, label, value, type }) {
  const renderValue = () => {
    if (!value || value === "-") {
      return <span className="text-muted fst-italic">ไม่ระบุ</span>;
    }
    
    switch(type) {
      case 'email':
        return (
          <a href={`mailto:${value}`} className="text-decoration-none">
            {value}
          </a>
        );
      case 'phone':
        return (
          <a href={`tel:${value}`} className="text-decoration-none">
            {value}
          </a>
        );
      default:
        return value;
    }
  };

  return (
    <div className="card border-0 bg-light shadow-sm h-100">
      <div className="card-body p-3">
        <div className="d-flex align-items-center">
          <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3 flex-shrink-0">
            <i className={`${icon} text-primary`}></i>
          </div>
          <div className="flex-grow-1 min-w-0">
            <p className="text-muted mb-1 small fw-medium">{label}</p>
            <div className="fw-semibold text-dark text-truncate">
              {renderValue()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


export default HomeAlumniProfile;
