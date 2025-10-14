import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import {HOSTNAME} from '../config.js';

function ChangePassword() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const {user} = useAuth();
    const userId = user?.user_id;
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError('รหัสผ่านไม่ตรงกัน');
            return;
        }

        try {
            await axios.post(HOSTNAME + '/api/change-password', {
                userId,
                newPassword,
            });
            setSuccess('เปลี่ยนรหัสผ่านสำเร็จ');
            setTimeout(() => navigate('/login'), 2000); // ไปหน้าหลักหลังจากเปลี่ยนรหัสผ่าน
        } catch (err) {
            setError('เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: '#eaf4fc' }}>
            <div className="bg-white p-5 rounded shadow" style={{ width: '100%', maxWidth: '400px' }}>
                <h4 className="mb-4 text-center text-primary">
                    <FaLock className="me-2" />
                    เปลี่ยนรหัสผ่านครั้งแรก
                </h4>

                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success"><FaCheckCircle className="me-2" />{success}</div>}

                <form onSubmit={handleChangePassword}>
                    {/* รหัสผ่านใหม่ */}
                    <div className="mb-3">
                        <label className="form-label">รหัสผ่านใหม่</label>
                        <div className="input-group">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="form-control"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                placeholder="ใส่รหัสผ่านใหม่"
                            />
                            <span
                                className="input-group-text bg-white"
                                style={{ cursor: "pointer" }}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                    </div>

                    {/* ยืนยันรหัสผ่าน */}
                    <div className="mb-4">
                        <label className="form-label">ยืนยันรหัสผ่าน</label>
                        <div className="input-group">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                className="form-control"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                            />
                            <span
                                className="input-group-text bg-white"
                                style={{ cursor: "pointer" }}
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-100 fw-bold">
                        เปลี่ยนรหัสผ่าน
                    </button>
                </form>

            </div>
        </div>
    );
}

export default ChangePassword;
