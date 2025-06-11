import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

function EditUserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [degrees, setDegrees] = useState([]);
  const [majors, setMajors] = useState([]);
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    address: "",
    // is_active: true,
    educations: [],
  });

  useEffect(() => {
    axios.get(`http://localhost:3001/admin/users/${userId}`)
      .then(res => {
        if (res.data.success) {
          setFormData({
            email: res.data.data.email || "",
            phone: res.data.data.phone || "",
            address: res.data.data.address || "",
            // is_active: res.data.data.is_active,
            educations: res.data.data.educations || []
          });
        }
      })
      .catch(err => console.error(err));
  }, [userId]);

  useEffect(() => {
    const fetchDegreesAndMajors = async () => {
      try {
        const [resDeg, resMaj] = await Promise.all([
          axios.get("http://localhost:3001/admin/degrees"),
          axios.get("http://localhost:3001/admin/majors"),
        ]);
        setDegrees(resDeg.data);
        setMajors(resMaj.data);
      } catch (error) {
        console.error("Failed to fetch degrees/majors", error);
      }
    };

    fetchDegreesAndMajors();
  }, []);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleEduChange = (index, field, value) => {
    const updatedEdu = [...formData.educations];
    updatedEdu[index][field] = value;
    setFormData(prev => ({ ...prev, educations: updatedEdu }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.put(`http://localhost:3001/admin/edit-profile-users/${userId}`, formData);
      if (res.data.success) {
        alert("แก้ไขข้อมูลเรียบร้อยแล้ว");
        navigate(`/admin/users/user-profile/${userId}`);
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  return (
    <div className="container my-5" style={{ maxWidth: "700px" }}>
      <div className="card shadow p-4 rounded-4">
        <h3 className="mb-4 text-primary border-bottom pb-2">แก้ไขข้อมูลผู้ใช้</h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-medium">อีเมล</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-medium">เบอร์โทร</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-medium">ที่อยู่</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="form-control"
              rows={3}
            />
          </div>

          <h5 className="text-primary mb-3 mt-4 border-bottom pb-2">ข้อมูลการศึกษา</h5>

          {formData.educations.map((edu, idx) => (
            <div key={idx} className="border rounded-3 p-3 mb-4 bg-light-subtle">
              <div className="mb-3">
                <label className="form-label">วุฒิการศึกษา</label>
                <select
                  value={edu.degree_id || ""}
                  onChange={e => handleEduChange(idx, "degree_id", e.target.value)}
                  className="form-select"
                >
                  <option value="">เลือกระดับการศึกษา</option>
                  {degrees.map(degree => (
                    <option key={degree.degree_id} value={degree.degree_id}>
                      {degree.degree_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">สาขา</label>
                <select
                  value={edu.major_id || ""}
                  onChange={e => handleEduChange(idx, "major_id", e.target.value)}
                  className="form-select"
                >
                  <option value="">เลือกสาขาวิชา</option>
                  {majors.map(major => (
                    <option key={major.major_id} value={major.major_id}>
                      {major.major_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">รหัสนักศึกษา</label>
                <input
                  type="text"
                  name="studentId"
                  value={edu.studentId || ""}
                  onChange={e => handleEduChange(idx, "studentId", e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="mb-0">
                <label className="form-label">ปีที่จบ</label>
                <input
                  type="text"
                  name="graduation_year"
                  value={edu.graduation_year || ""}
                  onChange={e => handleEduChange(idx, "graduation_year", e.target.value)}
                  className="form-control"
                />
              </div>
            </div>
          ))}

          <div className="d-flex justify-content-between gap-3 mt-4">
            <button
              type="button"
              className="btn btn-outline-secondary w-50"
              onClick={() => navigate(`/admin/users/user-profile/${userId}`)}
            >
              ยกเลิก
            </button>
            <button type="submit" className="btn btn-primary w-50">
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );

}

export default EditUserProfile;
