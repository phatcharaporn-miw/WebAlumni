import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from 'sweetalert2';
import {HOSTNAME} from '../../config.js';

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
    axios.get(HOSTNAME +`/admin/users/${userId}`)
      .then(res => {
        // console.log("User data fetched:", res.data);
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
          axios.get(HOSTNAME +"/admin/degrees"),
          axios.get(HOSTNAME +"/admin/majors"),
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
      const res = await axios.put(HOSTNAME +`/admin/edit-profile-users/${userId}`, formData);
      if (res.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'สำเร็จ',
          text: 'แก้ไขข้อมูลเรียบร้อยแล้ว',
          confirmButtonText: 'ตกลง'
        }).then(() => {
          navigate(`/admin/users/user-profile/${userId}`);
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'เกิดข้อผิดพลาดในการบันทึก',
        confirmButtonText: 'ตกลง'
      });
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-start py-5">
      <div className="w-100" style={{ maxWidth: "720px" }}>
        <h3 className="text-center mb-4 fw-bold ">แก้ไขข้อมูลผู้ใช้</h3>

        <div className="card shadow-lg rounded-4 p-4">
          <h5 className="text-primary border-bottom pb-2 mb-4 fw-semibold">ข้อมูลส่วนตัว</h5>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">อีเมล</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-control w-100"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">เบอร์โทร</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="form-control w-100"
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">ที่อยู่</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="form-control w-100"
                rows={3}
              />
            </div>

            <h5 className="text-primary border-bottom pb-2 mb-4 mt-5 fw-semibold">ข้อมูลการศึกษา</h5>

            {formData.educations.map((edu, idx) => (
              <div key={idx} className="border rounded-3 p-3 mb-4 bg-body-tertiary">
                <div className="mb-3">
                  <label className="form-label">วุฒิการศึกษา</label>
                  <select
                    value={edu.degree_name || ""}
                    onChange={e => handleEduChange(idx, "degree_name", e.target.value)}
                    className="form-select"
                  >
                    <option value="">เลือกระดับการศึกษา</option>
                    {degrees.map(degree => (
                      <option key={degree.degree_name} value={degree.degree_name}>
                        {degree.degree_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">สาขา</label>
                  <select
                    value={edu.major_name || ""}
                    onChange={e => handleEduChange(idx, "major_name", e.target.value)}
                    className="form-select"
                  >
                    <option value="">เลือกสาขาวิชา</option>
                    {majors.map(major => (
                      <option key={major.major_name} value={major.major_name}>
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
                    className="form-control w-100"
                  />
                </div>

                <div className="mb-0">
                  <label className="form-label">ปีที่เข้าศึกษา</label>
                  <input
                    type="text"
                    name="entry_year"
                    value={edu.entry_year || ""}
                    onChange={e => handleEduChange(idx, "entry_year", e.target.value)}
                    className="form-control w-100"
                  />
                </div>

                <div className="mb-0">
                  <label className="form-label">ปีที่จบ</label>
                  <input
                    type="text"
                    name="graduation_year"
                    value={edu.graduation_year || ""}
                    onChange={e => handleEduChange(idx, "graduation_year", e.target.value)}
                    className="form-control w-100"
                  />
                </div>
              </div>
            ))}

            <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mt-4">
              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={() => navigate(`/admin/users/user-profile/${userId}`)}
              >
                ยกเลิก
              </button>
              <button type="submit" className="btn btn-primary w-100">
                บันทึก
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

}

export default EditUserProfile;
