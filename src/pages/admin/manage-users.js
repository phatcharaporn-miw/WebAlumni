import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:3001/admin/users");
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // เปลี่ยนบทบาทผู้ใช้
  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`http://localhost:3001/admin/${userId}/role`, {
        role: newRole,
      });
      Swal.fire("สำเร็จ!", "เปลี่ยนบทบาทผู้ใช้เรียบร้อยแล้ว", "success");
      fetchUsers(); // รีเฟรชข้อมูล
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  // ลบผู้ใช้
  const handleDelete = async (userId) => {
    Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "คุณต้องการลบผู้ใช้นี้หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:3001/admin/delete-user/${userId}`);
          Swal.fire("ลบสำเร็จ!", "ผู้ใช้ถูกลบเรียบร้อยแล้ว", "success");
          fetchUsers(); // รีเฟรชข้อมูลผู้ใช้
        } catch (error) {
          console.error("Error deleting user:", error);
          Swal.fire("เกิดข้อผิดพลาด!", "ไม่สามารถลบผู้ใช้ได้", "error");
        }
      }
    });
  };

  // เปลี่ยนสถานะการใช้งานผู้ใช้
  const handleStatusChange = async (userId, isActive) => {
    try {
      await axios.put(`http://localhost:3001/admin/${userId}/status`, {
        is_active: isActive,
      });
      fetchUsers(); // รีเฟรชข้อมูล
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };


  const handleViewProfile = (userId) => {
    navigate(`/admin/users/user-profile/${userId}`);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="user-container p-5">
      <h3 className="admin-title">จัดการผู้ใช้งาน</h3>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          {/* ค้นหา */}
          <div className="flex-grow-1 me-2">
            <div className="input-group">
              <span className="input-group-text bg-light">
                <CiSearch />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="ค้นหารายชื่อ/อีเมล"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* ปุ่มเพิ่ม */}
          <button
            className="btn btn-primary mb-2"
            onClick={() => navigate("/admin/users/add-user")}
          >
            เพิ่มผู้ใช้ใหม่
          </button>
        </div>


        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-light">
              <tr className="text-center">
                <th>ชื่อ-สกุล</th>
                <th>อีเมล</th>
                <th>บทบาท</th>
                <th>สถานะ</th>
                <th>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.user_id}>
                  <td>{user.full_name}</td>
                  <td>{user.email}</td>
                  <td className="text-center">
                    <select
                      className="form-select form-select-sm"
                      value={user.role_id}
                      onChange={(e) =>
                        handleRoleChange(user.user_id, e.target.value)
                      }
                    >
                      <option value="2">นายกสมาคม</option>
                      <option value="3">ศิษย์เก่า</option>
                      <option value="4">ศิษย์ปัจจุบัน</option>
                    </select>
                  </td>
                  <td className="text-center">
                    <span className={`badge ${user.is_active ? "bg-success bg-opacity-10 text-success" : "bg-secondary bg-opacity-10 text-secondary"}`}>
                      {user.is_active ? "ใช้งาน" : "ระงับ"}
                    </span>
                  </td>
                  <td className="text-center text-nowrap">
                    <div className="btn-group btn-group-sm" role="group">
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => handleViewProfile(user.user_id)}
                      >
                        ดูโปรไฟล์
                      </button>
                      <button
                        className={`btn ${user.is_active ? "btn-outline-warning" : "btn-outline-success"}`}
                        onClick={() => handleStatusChange(user.user_id, user.is_active ? "0" : "1")}
                      >
                        {user.is_active ? "ระงับ" : "เปิดใช้งาน"}
                      </button>
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => handleDelete(user.user_id)}
                      >
                        ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <p className="text-center text-muted">ไม่พบผู้ใช้งานที่ตรงกับคำค้นหา</p>
          )}
        </div>
      </div>
    </div>
  );
}
export default UserManagement;