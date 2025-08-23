import React, { use, useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaHeart, FaShoppingCart } from 'react-icons/fa';
import '../../css/verify.css';

function AdminVerifySlip() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rejectReason, setRejectReason] = useState("");
    const [rejectingOrderId, setRejectingOrderId] = useState(null);
    const [activeTab, setActiveTab] = useState('purchase');
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://localhost:3001/orders/pending-payment", {
                withCredentials: true
            });
            setOrders(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    // ฟังก์ชันการยืนยันสลิปโอนเงิน
    const handleApprove = async (orderId) => {
        const confirm = await Swal.fire({
            title: "ยืนยันการตรวจสอบ?",
            text: "คุณต้องการยืนยันสลิปนี้หรือไม่",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "ยืนยัน",
            cancelButtonText: "ยกเลิก"
        });

        if (!confirm.isConfirmed) return;

        try {
            const res = await axios.post(
                "http://localhost:3001/orders/verify-payment",
                { order_id: orderId, isApproved: true, admin_id: userId },
                { withCredentials: true }
            );

            if (res.data && res.data.success) {
                Swal.fire({ icon: "success", title: "ยืนยันสำเร็จ", timer: 1200, showConfirmButton: false });

                // อัปเดต state orders แบบเรียลไทม์
                setOrders(prev =>
                    prev.map(order =>
                        order.order_id === orderId
                            ? { ...order, order_status: "approved", payment_status: "verified" }
                            : order
                    )
                );

            } else {
                Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: res.data?.message || "ไม่สามารถยืนยันได้" });
            }
        } catch (err) {
            Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: "ไม่สามารถยืนยันได้" });
        }
    };

    // ฟังก์ชันเรียกใช้ตอนกดปุ่ม "ปฏิเสธ"
    const handleRejectClick = (orderId) => {
        setRejectingOrderId(orderId);
        setRejectReason("");
    };

    // ฟังก์ชันส่งข้อมูลปฏิเสธไป backend
    const handleRejectSubmit = async () => {
        if (!rejectReason.trim()) {
            Swal.fire("กรุณากรอกเหตุผล", "", "warning");
            return;
        }

        try {
            const res = await axios.post(
                "http://localhost:3001/orders/verify-payment",
                {
                    order_id: rejectingOrderId,
                    isApproved: false,
                    admin_id: userId,
                    reject_reason: rejectReason,
                },
                { withCredentials: true }
            );

            if (res.data.success) {
                Swal.fire("สำเร็จ", "ปฏิเสธสลิปเรียบร้อย", "success");

                // อัปเดต state orders แบบเรียลไทม์
                setOrders(prev =>
                    prev.map(order =>
                        order.order_id === rejectingOrderId
                            ? { ...order, order_status: "rejected", payment_status: "rejected" }
                            : order
                    )
                );

                setRejectingOrderId(null);
                setRejectReason("");

            } else {
                Swal.fire("ผิดพลาด", res.data.message || "ไม่สามารถปฏิเสธได้", "error");
            }
        } catch (error) {
            Swal.fire("ผิดพลาด", "เกิดข้อผิดพลาดในการติดต่อเซิร์ฟเวอร์", "error");
        }
    };



    if (loading) {
        return <div className="text-center py-5">กำลังโหลด...</div>;
    }


    return (
        <section className="verify-container p-3 p-md-5">
            {/* Header*/}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="admin-title mb-0">ตรวจสอบสลิปการโอนเงิน</h3>
                <div className="d-flex gap-2">
                    <button
                        className={`btn btn-sm ${activeTab === 'purchase' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setActiveTab('purchase')}
                    >
                        <i className="fas fa-shopping-cart me-1"></i>
                        การสั่งซื้อ
                        <span
                            className={`badge ${activeTab === 'purchase' ? 'bg-white text-primary' : 'bg-primary'} ms-1`}
                        >
                            {orders.filter(o => o.type === 'purchase' || !o.type).length}
                        </span>
                    </button>

                    {/* Donation*/}
                    <button
                        className={`btn btn-sm ${activeTab === 'donation' ? 'btn-success' : 'btn-outline-success'}`}
                        onClick={() => setActiveTab('donation')}
                    >
                        <i className="fas fa-heart me-1"></i>
                        การบริจาค
                        <span
                            className={`badge ${activeTab === 'donation' ? 'bg-white text-success' : 'bg-success'} ms-1`}
                        >
                            {orders.filter(o => o.type === 'donation').length}
                        </span>
                    </button>
                </div>
            </div>

            {/* Orders Container */}
            <div className="container-fluid">
                {(() => {
                    const filteredOrders = orders.filter(order =>
                        (activeTab === 'donation'
                            ? order.type === 'donation'
                            : order.type === 'purchase' || !order.type
                        ) && order.payment_status === 'pending'
                    );

                    if (filteredOrders.length === 0) {
                        return (
                            <div className="row justify-content-center">
                                <div className="col-lg-6">
                                    <div className="text-center py-5">
                                        <div className="mb-4">

                                        </div>
                                        <h5 className="text-muted mb-3">
                                            {activeTab === 'donation'
                                                ? 'ไม่มีสลิปการบริจาคที่รอตรวจสอบ'
                                                : 'ไม่มีสลิปการสั่งซื้อที่รอตรวจสอบ'}
                                        </h5>
                                        <p className="text-muted">
                                            {activeTab === 'donation'
                                                ? 'ยังไม่มีการบริจาคที่ส่งสลิปมาตรวจสอบ'
                                                : 'ไม่มีสลิปการโอนเงินจากการสั่งซื้อที่รอการตรวจสอบ'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    // Orders List
                    return (
                        <div className="row">
                            <div className="col-12">
                                {filteredOrders.map((order, idx) => {
                                    const isDonation = order.type === 'donation';
                                    const isPurchase = order.type === 'purchase' || !order.type;

                                    return (
                                        <div
                                            className="card border-0 shadow-sm mb-2 rounded-3"
                                            key={order.order_id || idx}
                                        >
                                            <div className="card-body py-3">
                                                <div className="row align-items-center">
                                                    <div className="col-6 col-md-4">
                                                        <div className="d-flex align-items-center">
                                                            <div
                                                                className={`me-3 rounded-circle d-flex align-items-center justify-content-center ${isDonation ? 'bg-success bg-opacity-10' : 'bg-primary bg-opacity-10'
                                                                    }`}
                                                                style={{ width: '40px', height: '40px' }}
                                                            >
                                                                {isDonation ? (
                                                                    <FaHeart className="text-success" size={16} />
                                                                ) : (
                                                                    <FaShoppingCart className="text-primary" size={16} />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="fw-bold">#{order.order_id}</div>
                                                                <small
                                                                    className={`${isDonation ? 'text-success' : 'text-primary'
                                                                        } fw-semibold`}
                                                                >
                                                                    {isDonation ? 'บริจาค' : 'สั่งซื้อ'}
                                                                </small>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="col-6 col-md-3 d-none d-md-block">
                                                        <div>
                                                            <div className="fw-semibold text-truncate">
                                                                {order.buyer_name}
                                                            </div>
                                                            <small className="text-muted">
                                                                {order.order_date
                                                                    ? new Date(order.order_date).toLocaleDateString(
                                                                        'th-TH',
                                                                        {
                                                                            day: '2-digit',
                                                                            month: 'short',
                                                                        }
                                                                    )
                                                                    : '-'}
                                                            </small>
                                                        </div>
                                                    </div>

                                                    <div className="col-3 col-md-2">
                                                        <div className="fw-bold text-success">
                                                            ฿{parseFloat(order.total_amount).toLocaleString()}
                                                        </div>
                                                    </div>

                                                    <div className="col-3 col-md-2 text-center">
                                                        <span
                                                            className={`badge px-2 py-1 rounded-pill 
                                                                ${order.payment_status === 'pending' ? 'bg-warning bg-opacity-10 text-warning' :
                                                                    order.payment_status === 'approved' ? 'bg-success text-success bg-opacity-10' :
                                                                        order.payment_status === 'rejected' ? 'bg-danger text-danger bg-opacity-10' : ''
                                                                }`}
                                                            style={{ fontSize: '0.8rem' }}
                                                        >
                                                            {order.payment_status === 'pending' && 'รอตรวจสอบ'}
                                                            {order.payment_status === 'approved' && 'ยืนยันแล้ว'}
                                                            {order.payment_status === 'rejected' && 'ถูกปฏิเสธ'}
                                                        </span>
                                                    </div>

                                                    <div className="col-12 col-md-1 text-end mt-2 mt-md-0">
                                                        <button
                                                            className="btn btn-outline-primary btn-sm px-2 py-1"
                                                            style={{ fontSize: '0.7rem' }}
                                                            data-bs-toggle="collapse"
                                                            data-bs-target={`#slipDetail-${idx}`}
                                                            aria-expanded="false"
                                                            aria-controls={`slipDetail-${idx}`}
                                                        >
                                                            <span className="d-none d-sm-inline">ตรวจสอบ</span>
                                                            <span className="d-sm-none">
                                                                <i className="fas fa-search"></i>
                                                            </span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="collapse" id={`slipDetail-${idx}`}>
                                                <div className="card-body border-top pt-3 bg-light bg-opacity-25">
                                                    <div className="row g-4">
                                                        {/* Slip Image */}
                                                        <div className="col-lg-4">
                                                            <div className="card border-2 border-primary border-opacity-25">
                                                                <div className="card-header bg-primary bg-opacity-10 text-center py-2">
                                                                    <i className="fas fa-receipt me-2 text-primary"></i>
                                                                    <small className="text-primary fw-bold">
                                                                        สลิปการโอน
                                                                    </small>
                                                                </div>
                                                                <div className="card-body p-2 text-center">
                                                                    {order.slip_path ? (
                                                                        <>
                                                                            <img
                                                                                src={`http://localhost:3001/uploads/${order.slip_path}`}
                                                                                alt="slip"
                                                                                className="img-fluid rounded-2 shadow-sm border"
                                                                                style={{
                                                                                    maxHeight: 200,
                                                                                    objectFit: 'contain',
                                                                                    cursor: 'pointer',
                                                                                }}
                                                                                onClick={() => {
                                                                                    window.open(
                                                                                        `http://localhost:3001/uploads/${order.slip_path}`,
                                                                                        '_blank'
                                                                                    );
                                                                                }}
                                                                            />
                                                                            <div className="mt-2">
                                                                                <button
                                                                                    className="btn btn-outline-primary btn-sm"
                                                                                    onClick={() => {
                                                                                        window.open(
                                                                                            `http://localhost:3001/uploads/${order.slip_path}`,
                                                                                            '_blank'
                                                                                        );
                                                                                    }}
                                                                                >
                                                                                    ดูเต็มจอ
                                                                                </button>
                                                                            </div>
                                                                        </>
                                                                    ) : (
                                                                        <div className="text-muted py-3">
                                                                            <i className="fas fa-image fa-2x mb-2 opacity-25"></i>
                                                                            <p className="small">ไม่มีสลิป</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="col-lg-8">
                                                            <div className="card border-0 bg-white shadow-sm mb-3">
                                                                <div className="card-body p-3">
                                                                    {/* หัวข้อ */}
                                                                    <h6 className="fw-bold text-primary mb-3 d-flex align-items-center">
                                                                        <i
                                                                            className={`${isDonation ? 'fas fa-heart' : 'fas fa-user'} me-2`}
                                                                        ></i>
                                                                        {isDonation ? 'ผู้บริจาค' : 'ผู้สั่งซื้อ'}
                                                                    </h6>

                                                                    {/* รายการสินค้า */}
                                                                    {order.products && order.products.length > 0 && (
                                                                        <div className="mb-3">
                                                                            <h6 className="fw-bold text-primary mb-2">
                                                                                <i className="fas fa-box me-2"></i>
                                                                                สินค้า ({order.products.length} รายการ)
                                                                            </h6>
                                                                            <div className="row g-2">
                                                                                {order.products.slice(0, 3).map((prod, i) => (
                                                                                    <div key={i} className="col-12 col-sm-6 col-md-4">
                                                                                        <div className="d-flex align-items-center p-2 bg-light rounded-2 h-100">
                                                                                            <img
                                                                                                src={
                                                                                                    prod.image
                                                                                                        ? `http://localhost:3001/uploads/${prod.image}`
                                                                                                        : '/api/placeholder/40/40'
                                                                                                }
                                                                                                alt={prod.product_name}
                                                                                                className="rounded flex-shrink-0"
                                                                                                style={{
                                                                                                    width: 80,
                                                                                                    height: 80,
                                                                                                    objectFit: 'cover',
                                                                                                }}
                                                                                            />
                                                                                            <div className="ms-2 flex-grow-1">
                                                                                                <div
                                                                                                    className="fw-semibold text-truncate"
                                                                                                    style={{ fontSize: '0.9rem' }}
                                                                                                >
                                                                                                    {prod.product_name}
                                                                                                </div>
                                                                                                <small className="text-muted d-block">
                                                                                                    จำนวน: {prod.quantity}
                                                                                                </small>
                                                                                                <small className="text-muted d-block">
                                                                                                    ราคา: ฿{parseFloat(prod.price).toLocaleString()}
                                                                                                </small>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                                {order.products.length > 3 && (
                                                                                    <div className="col-12">
                                                                                        <small className="text-muted">
                                                                                            และอีก {order.products.length - 3} รายการ...
                                                                                        </small>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* ข้อมูลผู้ซื้อ */}
                                                                    <div className="row mb-3">
                                                                        <div className="col-12 col-md-6 mb-2">
                                                                            <small className="text-muted">ชื่อ</small>
                                                                            <div className="fw-semibold">{order.buyer_name}</div>
                                                                        </div>
                                                                        <div className="col-12 col-md-6 mb-2">
                                                                            <small className="text-muted">วันที่</small>
                                                                            <div className="fw-semibold">
                                                                                {order.order_date
                                                                                    ? new Date(order.order_date).toLocaleDateString('th-TH', {
                                                                                        year: 'numeric',
                                                                                        month: 'short',
                                                                                        day: 'numeric',
                                                                                        hour: '2-digit',
                                                                                        minute: '2-digit',
                                                                                    })
                                                                                    : '-'}
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* ยอดรวม */}
                                                                    <div className="bg-success bg-opacity-10 rounded-2 p-3 text-center">
                                                                        <small className="text-muted d-block">ยอดโอนรวม</small>
                                                                        <div className="fs-4 fw-bold text-success">
                                                                            ฿{parseFloat(order.total_amount).toLocaleString()}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>


                                                            {/* Products */}
                                                            {!isDonation && (
                                                                <>
                                                                    {/* ข้อมูลผู้ขาย */}
                                                                    <div className="card border-0 bg-white mb-3">
                                                                        <div className="card-body p-3">
                                                                            <h6 className="fw-bold text-primary mb-2">
                                                                                <i className="fas fa-store me-2"></i>
                                                                                ข้อมูลผู้ขาย
                                                                            </h6>
                                                                            <div className="row">
                                                                                <div className="col-md-6 mb-2">
                                                                                    <small className="text-muted">ชื่อผู้ขาย</small>
                                                                                    <div className="fw-semibold">{order.seller_name || '-'}</div>
                                                                                </div>
                                                                                <div className="col-md-6 mb-2">
                                                                                    <small className="text-muted">บัญชีธนาคาร</small>
                                                                                    <div className="fw-semibold">{order.seller_account_name || '-'}</div>
                                                                                </div>
                                                                                <div className="col-md-6 mb-2">
                                                                                    <small className="text-muted">หมายเลขบัญชี</small>
                                                                                    <div className="fw-semibold">{order.account_number || '-'}</div>
                                                                                </div>
                                                                                <div className="col-md-6 mb-2">
                                                                                    <small className="text-muted">หมายเลขพร้อมเพย์</small>
                                                                                    <div className="fw-semibold">{order.promptpay_number || '-'}</div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* รายการสินค้า */}
                                                                    {/* {order.products && order.products.length > 0 && (
                                                                        <div className="card border-0 bg-white mb-3">
                                                                            <div className="card-body p-3">
                                                                                <h6 className="fw-bold text-primary mb-2">
                                                                                    <i className="fas fa-box me-2"></i>
                                                                                    สินค้า ({order.products.length} รายการ)
                                                                                </h6>
                                                                                <div className="row g-2">
                                                                                    {order.products.slice(0, 3).map((prod, i) => (
                                                                                        <div key={i} className="col-md-4">
                                                                                            <div className="d-flex align-items-center p-2 bg-light rounded-2">
                                                                                                <img
                                                                                                    src={
                                                                                                        prod.image
                                                                                                            ? `http://localhost:3001/uploads/${prod.image}`
                                                                                                            : '/api/placeholder/40/40'
                                                                                                    }
                                                                                                    alt={prod.product_name}
                                                                                                    className="rounded"
                                                                                                    style={{
                                                                                                        width: 100,
                                                                                                        height: 100,
                                                                                                        objectFit: 'cover',
                                                                                                    }}
                                                                                                />
                                                                                                <div className="ms-2 flex-grow-1">
                                                                                                    <div
                                                                                                        className="text-truncate fw-semibold"
                                                                                                        style={{ fontSize: '0.9rem' }}
                                                                                                    >
                                                                                                        {prod.product_name}
                                                                                                    </div>
                                                                                                    <small className="text-muted">
                                                                                                        จำนวน: {prod.quantity}
                                                                                                    </small><br />
                                                                                                    <small className="text-muted">
                                                                                                        ราคา: ฿{parseFloat(prod.price).toLocaleString()}
                                                                                                    </small>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    ))}
                                                                                    {order.products.length > 3 && (
                                                                                        <div className="col-12">
                                                                                            <small className="text-muted">
                                                                                                และอีก {order.products.length - 3} รายการ...
                                                                                            </small>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )} */}
                                                                </>
                                                            )}


                                                            {/* Details */}
                                                            {isDonation && (
                                                                <div className="card border-0 bg-white mb-3">
                                                                    <div className="card-body p-3">
                                                                        <h6 className="fw-bold text-success mb-2">
                                                                            <i className="fas fa-heart me-2"></i>
                                                                            รายละเอียดการบริจาค
                                                                        </h6>
                                                                        <div className="bg-success bg-opacity-10 rounded-2 p-3 text-center">
                                                                            <i className="fas fa-hand-holding-heart fa-2x text-success mb-2"></i>
                                                                            <div className="fw-semibold">
                                                                                การบริจาคเพื่อสาธารณกุศล
                                                                            </div>
                                                                            <small className="text-muted">
                                                                                ขอบคุณสำหรับน้ำใจที่ดี
                                                                            </small>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="border-top pt-3 mt-3">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <h6 className="mb-0 fw-bold">
                                                                <i className="fas fa-tasks me-2 text-secondary"></i>
                                                                การดำเนินการ
                                                            </h6>
                                                        </div>

                                                        {rejectingOrderId !== order.order_id ? (
                                                            <div className="d-flex gap-2 mt-3">
                                                                <button
                                                                    className="btn btn-success btn-sm flex-fill"
                                                                    onClick={() =>
                                                                        handleApprove(order.order_id)
                                                                    }
                                                                >
                                                                    <i className="fas fa-check me-2"></i>
                                                                    ยืนยันสลิป
                                                                </button>
                                                                <button
                                                                    className="btn btn-danger btn-sm flex-fill"
                                                                    onClick={() => {
                                                                        setRejectingOrderId(order.order_id);
                                                                        setRejectReason('');
                                                                    }}
                                                                >
                                                                    <i className="fas fa-times me-2"></i>
                                                                    ปฏิเสธ
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="bg-white rounded-2 p-3 border border-danger border-opacity-25 mt-3">
                                                                <div className="mb-2">
                                                                    <label className="form-label fw-bold text-danger">
                                                                        <i className="fas fa-comment-alt me-2"></i>
                                                                        เหตุผลในการปฏิเสธ
                                                                    </label>
                                                                    <textarea
                                                                        className="form-control border-2"
                                                                        placeholder="กรุณาระบุเหตุผลที่ชัดเจน..."
                                                                        rows={3}
                                                                        value={rejectReason}
                                                                        onChange={e =>
                                                                            setRejectReason(e.target.value)
                                                                        }
                                                                    />
                                                                </div>
                                                                <div className="d-flex gap-2">
                                                                    <button
                                                                        className="btn btn-outline-secondary btn-sm"
                                                                        onClick={() =>
                                                                            setRejectingOrderId(null)
                                                                        }
                                                                    >
                                                                        ยกเลิก
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-danger btn-sm"
                                                                        onClick={handleRejectSubmit}
                                                                        disabled={!rejectReason.trim()}
                                                                    >
                                                                        ยืนยันการปฏิเสธ
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })()}
            </div>
        </section>
    );

}

export default AdminVerifySlip;