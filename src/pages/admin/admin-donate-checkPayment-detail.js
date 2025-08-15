import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function AdminCheckPaymentDonateDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPayment = async () => {
            try {
                const res = await axios.get(`http://localhost:3001/admin/check-payment-donate/${id}`);
                setPayment(res.data);
            } catch (err) {
                setError("ไม่พบข้อมูลหรือมีข้อผิดพลาด");
            } finally {
                setLoading(false);
            }
        };

        fetchPayment();
    }, [id]);

    const approvePayment = async () => {
        if (!window.confirm("ยืนยันการอนุมัติ?")) return;
        try {
            await axios.put(`http://localhost:3001/admin/check-payment-donate/approve/${id}`);
            alert("อนุมัติเรียบร้อยแล้ว");
            navigate("/admin/check-payment-donate");
        } catch {
            alert("เกิดข้อผิดพลาด");
        }
    };

    const rejectPayment = async () => {
        if (!window.confirm("ยืนยันการปฏิเสธ?")) return;
        try {
            await axios.put(`http://localhost:3001/admin/check-payment-donate/reject/${id}`);
            alert("ปฏิเสธเรียบร้อยแล้ว");
            navigate("/admin/check-payment-donate");
        } catch {
            alert("เกิดข้อผิดพลาด");
        }
    };

    if (loading) {
        return <div className="text-center my-5">กำลังโหลด...</div>;
    }

    if (error) {
        return <div className="alert alert-danger mt-5 text-center">{error}</div>;
    }

    return (
        <div className="container mt-5">
            <h2 className="mb-4">รายละเอียดการชำระเงินบริจาค</h2>

            <table className="table table-bordered">
                <tbody>
                    <tr>
                        <th>หมายเลขคำสั่งซื้อ</th>
                        <td>{payment.order_number}</td>
                    </tr>
                    <tr>
                        <th>ชื่อผู้บริจาค</th>
                        <td>{payment.donor_name}</td>
                    </tr>
                    <tr>
                        <th>ชื่อโครงการ</th>
                        <td>{payment.project_name}</td>
                    </tr>
                    <tr>
                        <th>จำนวนเงิน</th>
                        <td>{Number(payment.amount).toLocaleString()} บาท</td>
                    </tr>
                    <tr>
                        <th>วันที่ชำระ</th>
                        <td>{new Date(payment.created_at).toLocaleDateString("th-TH")}</td>
                    </tr>
                    <tr>
                        <th>สถานะ</th>
                        <td>
                            {payment.payment_status === "pending" && <span className="badge bg-warning">รอการตรวจสอบ</span>}
                            {payment.payment_status === "paid" && <span className="badge bg-success">อนุมัติแล้ว</span>}
                            {payment.payment_status === "failed" && <span className="badge bg-danger">ไม่อนุมัติ</span>}
                        </td>
                    </tr>
                    <tr>
                        <th>หลักฐานการชำระเงิน</th>
                        <td>
                            {payment.proof_image ? (
                                <img
                                    src={`http://localhost:3001/uploads/${payment.proof_image}`}
                                    alt="หลักฐาน"
                                    style={{ maxWidth: "300px", height: "auto" }}
                                />
                            ) : (
                                "ไม่มี"
                            )}
                        </td>
                    </tr>
                </tbody>
            </table>

            {payment.payment_status === "pending" && (
                <div className="mt-4">
                    <button className="btn btn-success me-2" onClick={approvePayment}>
                        อนุมัติ
                    </button>
                    <button className="btn btn-danger" onClick={rejectPayment}>
                        ปฏิเสธ
                    </button>
                </div>
            )}

            <div className="mt-4">
                <Link to="/admin/check-payment-donate" className="btn btn-secondary">
                    ย้อนกลับ
                </Link>
            </div>
        </div>
    );
}

export default AdminCheckPaymentDonateDetail;
