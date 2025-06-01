import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/forgotPassword.css";

function ForgotPassword() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const response = await axios.post("http://localhost:3001/api/forgot-password", { email });
            if (response.data.success) {
                setMessage("OTP ถูกส่งไปยังอีเมลของคุณแล้ว");
                setStep(2);
            } else {
                setError(response.data.message || "เกิดข้อผิดพลาด");
            }
        } catch (err) {
            setError(err.response?.data?.message || "เกิดข้อผิดพลาด");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        if (newPassword !== confirmPassword) {
            setError("รหัสผ่านไม่ตรงกัน");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post("http://localhost:3001/api/reset-password", {
                email,
                otp,
                newPassword
            });

            if (response.data.success) {
                setMessage("รีเซ็ตรหัสผ่านสำเร็จ");
                setTimeout(() => navigate("/login"), 3000);
            } else {
                setError(response.data.message || "เกิดข้อผิดพลาด");
            }
        } catch (err) {
            setError(err.response?.data?.message || "เกิดข้อผิดพลาด");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-password">
            <h2>{step === 1 ? "ลืมรหัสผ่าน" : "รีเซ็ตรหัสผ่าน"}</h2>

            {step === 1 && (
                <form onSubmit={handleSendOtp}>
                    <p>
                        <label>อีเมล<span className="important">*</span></label><br />
                        <input
                            type="email"
                            placeholder="กรอกอีเมลของคุณ"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError(""); setMessage("");
                            }}
                            required
                        />
                    </p>
                    <button type="submit" disabled={loading}>{loading ? "กำลังส่ง..." : "ส่ง OTP"}</button>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleResetPassword}>
                    <p>
                        <label>OTP<span className="important">*</span></label><br />
                        <input
                            type="text"
                            placeholder="กรอก OTP"
                            value={otp}
                            onChange={(e) => {
                                setOtp(e.target.value);
                                setError(""); setMessage("");
                            }}
                            required
                        />
                    </p>
                    <p>
                        <label>รหัสผ่านใหม่<span className="important">*</span></label><br />
                        <input
                            type="password"
                            placeholder="กรอกรหัสผ่านใหม่"
                            value={newPassword}
                            onChange={(e) => {
                                setNewPassword(e.target.value);
                                setError(""); setMessage("");
                            }}
                            required
                        />
                    </p>
                    <p>
                        <label>ยืนยันรหัสผ่านใหม่<span className="important">*</span></label><br />
                        <input
                            type="password"
                            placeholder="ยืนยันรหัสผ่านใหม่"
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                setError(""); setMessage("");
                            }}
                            required
                        />
                    </p>
                    <button type="submit" disabled={loading}>
                        {loading ? "กำลังรีเซ็ต..." : "รีเซ็ตรหัสผ่าน"}
                    </button>
                </form>
            )}

            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
        </div>
    );
}

export default ForgotPassword;
