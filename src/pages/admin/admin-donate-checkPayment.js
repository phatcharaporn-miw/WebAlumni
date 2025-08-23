import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/adminDonate.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Link, useLocation, useNavigate } from "react-router-dom";

function AdminCheckPaymentDonate() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [sortBy, setSortBy] = useState("date");
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                setLoading(true);
                const response = await axios.get("http://localhost:3001/admin/check-payment-donate");
                setPayments(response.data);
            } catch (err) {
                setError(err.response?.data?.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, []);

    const handleSearchChange = (e) => setSearchQuery(e.target.value);
    const handleFilterChange = (e) => setFilterStatus(e.target.value);
    const handleSortChange = (e) => setSortBy(e.target.value);

    const approvePayment = async (donationId) => {
        if (!window.confirm("คุณต้องการอนุมัติการชำระเงินนี้หรือไม่?")) return;
        try {
            await axios.put(`http://localhost:3001/admin/check-payment-donate/approve/${donationId}`);
            setPayments(payments.map(p =>
                p.donation_id === donationId ? { ...p, payment_status: "paid" } : p
            ));
            alert("อนุมัติการชำระเงินสำเร็จ");
        } catch {
            alert("เกิดข้อผิดพลาดในการอนุมัติ");
        }
    };

    const rejectPayment = async (donationId) => {
        if (!window.confirm("คุณต้องการปฏิเสธการชำระเงินนี้หรือไม่?")) return;
        try {
            await axios.put(`http://localhost:3001/admin/check-payment-donate/reject/${donationId}`);
            setPayments(payments.map(p =>
                p.donation_id === donationId ? { ...p, payment_status: "failed" } : p
            ));
            alert("ปฏิเสธการชำระเงินสำเร็จ");
        } catch {
            alert("เกิดข้อผิดพลาดในการปฏิเสธ");
        }
    };

    const keyword = searchQuery.trim().toLowerCase();
    const filteredPayments = payments.filter(payment => {
        const matchesSearch =
            (payment.donor_name || "").toLowerCase().includes(keyword) ||
            (payment.order_number || "").toLowerCase().includes(keyword) ||
            (payment.project_name || "").toLowerCase().includes(keyword);
        const matchesStatus = filterStatus === "all" || payment.payment_status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const sortedPayments = [...filteredPayments].sort((a, b) => {
        if (sortBy === "date") {
            return new Date(b.created_at || b.start_date) - new Date(a.created_at || a.start_date);
        } else if (sortBy === "name") {
            return (a.donor_name || "").localeCompare(b.donor_name || "");
        } else if (sortBy === "amount") {
            return (b.amount || 0) - (a.amount || 0);
        }
        return 0;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case "pending": return <span className="badge bg-warning">รอการตรวจสอบ</span>;
            case "paid": return <span className="badge bg-success">อนุมัติแล้ว</span>;
            case "failed": return <span className="badge bg-danger">ไม่อนุมัติ</span>;
            default: return <span className="badge bg-secondary">ไม่ระบุ</span>;
        }
    };

    return (
        <div className="donate-activity-container">
            <div className="mb-4">
                <nav className="nav Adminnav-tabs">
                    <Link className={`adminnav-link ${location.pathname === '/admin/donations' ? 'active' : ''}`} to="/admin/donations">
                        <i className="fas fa-project-diagram me-2"></i> การจัดการโครงการบริจาค
                    </Link>
                    <Link className={`adminnav-link ${location.pathname === '/admin/donations/check-payment-donate' ? 'active' : ''}`} to="/admin/donations/check-payment-donate">
                        <i className="fas fa-credit-card me-2"></i> การจัดการตรวจสอบการชำระเงินบริจาค
                    </Link>
                    <Link className={`adminnav-link ${location.pathname === '/admin/donations/donate-request' ? 'active' : ''}`} to="/admin/donations/donate-request">
                        <i className="fas fa-plus me-2"></i>เพิ่มโครงการใหม่
                    </Link>
                </nav>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="donate-activity-title">การจัดการตรวจสอบการชำระเงินบริจาค</h2>
            </div>

            <div className="row mb-4">
                <div className="col-md-4">
                    <div className="input-group">
                        <span className="input-group-text"><i className="fas fa-search"></i></span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="ค้นหาชื่อผู้บริจาค หรือ รายชื่อโครงการบริจาค"
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                    </div>
                </div>
                <div className="col-md-3">
                    <select className="form-select" value={filterStatus} onChange={handleFilterChange}>
                        <option value="all">สถานะทั้งหมด</option>
                        <option value="pending">รอการตรวจสอบ</option>
                        <option value="paid">อนุมัติแล้ว</option>
                        <option value="failed">ไม่อนุมัติ</option>
                    </select>
                </div>
                <div className="col-md-3">
                    <select className="form-select" value={sortBy} onChange={handleSortChange}>
                        <option value="date">เรียงตามวันที่</option>
                        <option value="name">เรียงตามชื่อ</option>
                        <option value="amount">เรียงตามยอดบริจาค</option>
                    </select>
                </div>
                <div className="col-md-2 d-flex align-items-center">
                    <div className="text-muted">พบ {filteredPayments.length} รายการ</div>
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
                <div className="text-center my-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-2">กำลังโหลดข้อมูล...</p>
                </div>
            ) : sortedPayments.length === 0 ? (
                <div className="text-center text-muted my-5">
                    <i className="fas fa-search fa-3x mb-3"></i>
                    <p>ไม่พบรายการชำระเงินบริจาคที่ค้นหา</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-bordered align-middle">
                        <thead>
                            <tr>
                                <th>หมายเลขคำสั่งซื้อ</th>
                                <th>ชื่อผู้บริจาค</th>
                                <th>ชื่อโครงการ</th>
                                <th>จำนวนเงิน (บาท)</th>
                                <th>วันที่ชำระ</th>
                                <th>สถานะ</th>
                                <th>หลักฐานชำระเงิน</th>
                                <th>จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedPayments.map((payment, index) => (
                                <tr
                                    key={`${payment.donation_id}-${index}`}
                                    onClick={() => navigate(`/admin/donations/check-payment-donate-detail/${payment.donation_id}`)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <td>{payment.order_number || "-"}</td>
                                    <td>{payment.donor_name || "-"}</td>
                                    <td>{payment.project_name || "-"}</td>
                                    <td>{payment.amount ? Number(payment.amount).toLocaleString() : "-"}</td>
                                    <td>{payment.created_at ? new Date(payment.created_at).toLocaleDateString("th-TH") : "-"}</td>
                                    <td>{getStatusBadge(payment.payment_status)}</td>
                                    <td>
                                        {payment.proof_image ? (
                                            <img
                                                src={`http://localhost:3001/uploads/${payment.proof_image}`}
                                                alt="หลักฐานชำระเงิน"
                                                style={{ maxWidth: "150px", maxHeight: "100px", objectFit: "contain" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open(`http://localhost:3001/uploads/${payment.proof_image}`, "_blank");
                                                }}
                                            />
                                        ) : "ไม่มี"}
                                    </td>
                                    <td>
                                        <div onClick={(e) => e.stopPropagation()}>
                                            {payment.payment_status === "pending" ? (
                                                <>
                                                    <button className="btn btn-success btn-sm me-1" onClick={() => approvePayment(payment.donation_id)}>อนุมัติ</button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => rejectPayment(payment.donation_id)}>ปฏิเสธ</button>
                                                </>
                                            ) : <span className="text-muted">-</span>}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default AdminCheckPaymentDonate;