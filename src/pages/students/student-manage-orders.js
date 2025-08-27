import React, { useEffect, useState } from "react";
import axios from 'axios';
import { useOutletContext } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import { format } from 'date-fns';


function StudentManageOrders() {
    const [profile, setProfile] = useState({});
    const { handleLogout } = useOutletContext();
    const navigate = useNavigate();
    const [previewImage, setPreviewImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const userId = localStorage.getItem("userId");
    const [orders, setOrders] = useState([]);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [orderStatus, setOrderStatus] = useState('');
    const [trackingNumber, setTrackingNumber] = useState('');
    const [orderId, setOrderId] = useState('');

    // ดึงข้อมูลโปรไฟล์
    useEffect(() => {
        axios.get('http://localhost:3001/users/profile', { withCredentials: true })
            .then((response) => {
                if (response.data.success) {
                    // console.log("Profile:", response.data.user);
                    setProfile(response.data.user);
                }
            })
            .catch((error) => {
                console.error('เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์:', error.response ? error.response.data.message : error.message);
            });
    }, []);

    // ดึงรายการที่ตัวเองเป็นผู้ขาย
    useEffect(() => {
        if (profile && profile.userId) {
            axios.get(`http://localhost:3001/orders/orders-seller?seller_id=${profile.userId}`)
                .then(res => {
                    console.log("Orders:", res.data);
                    if (res.data.success) {
                        setOrders(res.data.data);
                    }
                })
                .catch(err => {
                    console.error("โหลดคำสั่งซื้อผู้ขายล้มเหลว", err);
                });
        }
    }, [profile]);

    // อัปเดตสถานะและเลขtracking
    const handleUpdate = () => {
        axios.post(`http://localhost:3001/orders/orders-status/${selectedOrderId}`, {
            order_id: selectedOrderId,
            order_status: orderStatus,
            tracking_number: trackingNumber
        })
            .then(res => {
                Swal.fire({
                    icon: "success",
                    title: "อัปเดตสำเร็จ",
                    text: res.data.message,
                    timer: 1500,
                    showConfirmButton: false
                });

                // อัปเดต state orders โดยไม่ต้องรีหน้า
                setOrders(prevOrders =>
                    prevOrders.map(order =>
                        order.order_id === selectedOrderId
                            ? { ...order, order_status: orderStatus, tracking_number: trackingNumber }
                            : order
                    )
                );
            })
            .catch(err => console.error(err));
    };


    // ฟังก์ชันเปลี่ยนหน้า
    const handleClick = (path) => {
        navigate(path);
    };

    // อัปโหลดรูปภาพ
    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setPreviewImage(URL.createObjectURL(file));

        const formData = new FormData();
        formData.append("image_path", file);
        formData.append("user_id", profile.userId);

        try {
            const res = await axios.post("http://localhost:3001/users/update-profile-image", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }, {
                withCredentials: true
            });

            if (res.status === 200) {
                alert("อัปโหลดรูปสำเร็จ");
                setProfile((prev) => ({
                    ...prev,
                    profilePicture: res.data.newImagePath,
                }));
            } else {
                alert(res.data.message || "เกิดข้อผิดพลาด");
            }
        } catch (err) {
            console.error(err);
            alert("ไม่สามารถอัปโหลดรูปได้");
        }
    };

    return (
        <section className='container py-4'>
            <div className='alumni-profile-page'>
                <div className="row justify-content-center g-4">
                    {/* Sidebar Profile */}
                    <div className="col-12 col-md-3 mb-4">
                        <div className="bg-white rounded-4 shadow-sm text-center p-4">
                            <img
                                src={previewImage || profile.profilePicture}
                                alt="Profile"
                                style={{ width: "130px", height: "130px", borderRadius: "50%", objectFit: "cover", marginBottom: 16, border: '3px solid #eee' }}
                                className="img-fluid mb-2"
                            />
                            <div className="mt-2 mb-3">
                                <label
                                    htmlFor="upload-profile-pic"
                                    className="btn btn-sm btn-outline-secondary"
                                    style={{ cursor: "pointer" }}
                                >
                                    เปลี่ยนรูป
                                </label>
                                <input
                                    type="file"
                                    id="upload-profile-pic"
                                    className="d-none"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </div>
                            <hr className="w-100" />
                            <div className="menu d-block mt-3 w-100">
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/student-profile")}>โปรไฟล์ของฉัน</div>
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/student-profile/student-request")}>คำร้องขอ</div>
                                <div className="menu-item active py-2 mb-2 rounded" onClick={() => handleClick("/student-profile/student-manage-orders")}>จัดการคำสั่งซื้อของที่ระลึก</div>
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/student-profile/student-profile-webboard")}>กระทู้ที่สร้าง</div>
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/student-profile/student-profile-donation")}>ประวัติการบริจาค</div>
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/student-profile/student-profile-activity")}>ประวัติการเข้าร่วมกิจกรรม</div>
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/student-profile/student-profile-souvenir")}>ประวัติการสั่งซื้อของที่ระลึก</div>
                                <div className="menu-item py-2 rounded" onClick={handleLogout}>ออกจากระบบ</div>
                            </div>
                        </div>
                    </div>
                    {/* Main Content */}
                    <div className="col-12 col-md-8">
                        <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center">
                                    <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                                        <i className="fas fa-box text-primary fs-5"></i>
                                    </div>
                                    <div>
                                        <h4 className="fw-bold mb-1">จัดการคำสั่งซื้อของที่ระลึก</h4>
                                        <p className="text-muted mb-0 small">รายการที่คุณเป็นผู้ขาย</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* แสดงการสั่งซื้อ */}
                        <div className="container-fluid">
                            {orders.length > 0 ? (
                                <div className="row">
                                    <div className="col-12">
                                        {orders.map(order => (
                                            <div key={order.order_id} className="card shadow-sm mb-2 border-0 rounded-2">
                                                {/* Minimal Header */}
                                                <div className="card-body py-3">
                                                    <div className="row align-items-center">
                                                        <div className="col-6 col-md-3">
                                                            <div className="fw-bold text-primary mb-1">#{order.order_id}</div>
                                                            <small className="text-muted d-none d-md-block">
                                                                {order.order_date ? format(new Date(order.order_date), 'dd/MM/yyyy') : '-'}
                                                            </small>
                                                            <small className="text-muted d-md-none">
                                                                {order.order_date ? format(new Date(order.order_date), 'dd/MM') : '-'}
                                                            </small>
                                                        </div>

                                                        <div className="col-6 col-md-3 d-none d-md-block">
                                                            <small className="text-muted">ผู้สั่งซื้อ</small>
                                                            <div className="fw-semibold text-truncate">
                                                                {order.buyer_name || "ไม่ระบุชื่อ"}
                                                            </div>
                                                        </div>

                                                        {/* Status */}
                                                        <div className="col-3 col-md-2">
                                                            <span
                                                                className={`badge rounded-pill px-2 py-1 ${order.order_status === 'delivered'
                                                                    ? "text-success bg-success bg-opacity-10"
                                                                    : order.order_status === "shipping"
                                                                        ? "text-primary bg-primary bg-opacity-10"
                                                                        : order.order_status === "processing"
                                                                            ? "text-warning bg-warning bg-opacity-10"
                                                                            : order.order_status === "cancelled"
                                                                                ? "text-danger bg-danger bg-opacity-10"
                                                                                : order.order_status === "pending_verification"
                                                                                    ? "text-dark bg-secondary bg-opacity-10"
                                                                                    : "bg-secondary text-white"
                                                                    }`}
                                                                style={{ fontSize: '0.8rem' }}
                                                            >
                                                                {order.order_status === "delivered"
                                                                    ? "จัดส่งสำเร็จ"
                                                                    : order.order_status === "shipping"
                                                                        ? "กำลังจัดส่ง"
                                                                        : order.order_status === "processing"
                                                                            ? "กำลังดำเนินการ"
                                                                            : order.order_status === "cancelled"
                                                                                ? "ยกเลิก"
                                                                                : order.order_status === "pending_verification"
                                                                                    ? "รอตรวจสอบการชำระเงิน"
                                                                                    : "รอชำระเงิน"}
                                                            </span>
                                                        </div>

                                                        {/* Payment Status */}
                                                        <div className="col-2 col-md-2 d-none d-sm-block text-center">
                                                            {/* ถ้าออเดอร์อยู่ระหว่างรอตรวจสอบ จะแสดงแค่สถานะคำสั่งซื้อ */}
                                                            {order.order_status !== 'pending_verification' && (
                                                                <span
                                                                    className={`badge rounded-pill px-2 py-1 ${order.payment_status === 'paid'
                                                                        ? 'text-success'
                                                                        : order.payment_status === 'pending'
                                                                            ? 'text-dark'
                                                                            : order.payment_status === 'rejected'
                                                                                ? 'text-danger'
                                                                                : 'text-secondary'
                                                                        }`}
                                                                    style={{ fontSize: '0.8rem' }}
                                                                >
                                                                    {order.payment_status === 'paid'
                                                                        ? 'ชำระเงินแล้ว'
                                                                        : order.payment_status === 'pending'
                                                                            ? 'รอชำระเงิน'
                                                                            : order.payment_status === 'rejected'
                                                                                ? 'ถูกปฏิเสธ'
                                                                                : 'ไม่ทราบ'}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Action Button */}
                                                        <div className="col-3 col-md-2 text-end">
                                                            <button
                                                                className="btn btn-outline-primary btn-sm px-2 py-1"
                                                                style={{ fontSize: "0.7rem" }}
                                                                data-bs-toggle="collapse"
                                                                data-bs-target={`#orderDetail-${order.order_id}`}
                                                                aria-expanded="false"
                                                                aria-controls={`orderDetail-${order.order_id}`}
                                                            >
                                                                <span className="d-none d-sm-inline">จัดการ</span>
                                                                <span className="d-sm-none">
                                                                    <i className="fas fa-edit"></i>
                                                                </span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Detailed Collapse Content */}
                                                <div className="collapse" id={`orderDetail-${order.order_id}`}>
                                                    <div className="card-body border-top pt-3 bg-light bg-opacity-25">
                                                        {/* Customer & Order Info */}
                                                        <div className="row mb-3">
                                                            <div className="col-md-6 mb-2">
                                                                <small className="text-muted d-block">ผู้สั่งซื้อ</small>
                                                                <div className="bg-white p-2 rounded border">
                                                                    <span className={order.buyer_name ? 'text-dark' : 'text-muted'}>
                                                                        {order.buyer_name || "ยังไม่ทราบชื่อผู้สั่งซื้อ"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6 mb-2">
                                                                <small className="text-muted d-block">วันที่สั่งซื้อ</small>
                                                                <div className="bg-white p-2 rounded border">
                                                                    <span className={order.order_date ? 'text-dark' : 'text-muted'}>
                                                                        {order.order_date
                                                                            ? format(new Date(order.order_date), 'dd/MM/yyyy')
                                                                            : "ยังไม่ทราบวันที่สั่งซื้อ"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Current Status Info */}
                                                        <div className="row mb-3">
                                                            <div className="col-md-6 mb-2">
                                                                <small className="text-muted d-block">สถานะปัจจุบัน</small>
                                                                <div className="bg-white p-2 rounded border">
                                                                    {/* Order Status */}
                                                                    <span
                                                                        className={`badge rounded-pill px-2 py-1 ${order.order_status === 'delivered'
                                                                            ? "text-success bg-success bg-opacity-10"
                                                                            : order.order_status === "shipping"
                                                                                ? "text-primary bg-primary bg-opacity-10"
                                                                                : order.order_status === "processing"
                                                                                    ? "text-warning bg-warning bg-opacity-10"
                                                                                    : order.order_status === "cancelled"
                                                                                        ? "text-danger bg-danger bg-opacity-10"
                                                                                        : order.order_status === "pending_verification"
                                                                                            ? "text-dark bg-secondary bg-opacity-10"
                                                                                            : "bg-secondary text-white"
                                                                            }`}
                                                                    >
                                                                        {order.order_status === "delivered"
                                                                            ? "จัดส่งสำเร็จ"
                                                                            : order.order_status === "shipping"
                                                                                ? "กำลังจัดส่ง"
                                                                                : order.order_status === "processing"
                                                                                    ? "กำลังดำเนินการ"
                                                                                    : order.order_status === "cancelled"
                                                                                        ? "ยกเลิก"
                                                                                        : order.order_status === "pending_verification"
                                                                                            ? "รอตรวจสอบการชำระเงิน"
                                                                                            : "รอชำระเงิน"}
                                                                    </span>
                                                                </div>

                                                            </div>
                                                            <div className="col-md-6 mb-2">
                                                                <small className="text-muted d-block">เลขพัสดุ</small>
                                                                <div className="bg-white p-2 rounded border">
                                                                    <span className={order.tracking_number ? 'text-primary fw-bold' : 'text-muted'}>
                                                                        {order.tracking_number || "ยังไม่ระบุเลขพัสดุ"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Update Section */}
                                                        <div className="border-top pt-3">
                                                            <h6 className="text-muted mb-3 d-flex align-items-center">
                                                                <i className="fas fa-edit me-2"></i>
                                                                อัปเดตข้อมูล
                                                            </h6>

                                                            <div className="row">
                                                                {/* Order Status Update */}
                                                                {/* <div className="col-md-4 mb-3">
                                                                    <label className="form-label small fw-bold text-muted">สถานะคำสั่งซื้อ</label>
                                                                    <select
                                                                        value={orderStatus && selectedOrderId === order.order_id ? orderStatus : order.order_status}
                                                                        onChange={e => {
                                                                            setSelectedOrderId(order.order_id);
                                                                            setOrderStatus(e.target.value);
                                                                        }}
                                                                        className="form-select form-select-sm"
                                                                    >
                                                                        <option value="awaiting_payment">รอชำระเงิน</option>
                                                                        <option value="processing">กำลังดำเนินการ</option>
                                                                        <option value="shipping">กำลังจัดส่ง</option>
                                                                        <option value="delivered">จัดส่งสำเร็จ</option>
                                                                        <option value="cancelled">ยกเลิก</option>
                                                                    </select>
                                                                </div> */}

                                                                {/* Tracking Number Update */}
                                                                <div className="col-md-5 mb-3">
                                                                    <label className="form-label small fw-bold text-muted">หมายเลขพัสดุ</label>
                                                                    <div className="input-group input-group-sm">
                                                                        <input
                                                                            type="text"
                                                                            className="form-control"
                                                                            placeholder="ใส่เลขพัสดุ..."
                                                                            value={trackingNumber && selectedOrderId === order.order_id ? trackingNumber : order.tracking_number || ""}
                                                                            onChange={e => {
                                                                                setSelectedOrderId(order.order_id);
                                                                                setTrackingNumber(e.target.value);
                                                                            }}
                                                                            disabled={order.order_status === "delivered"} // ปิดแก้ไขถ้าส่งสำเร็จ
                                                                        />
                                                                    </div>
                                                                </div>

                                                                {/* Update Button */}
                                                                <div className="col-md-3 mb-3 d-flex align-items-end">
                                                                    {order.order_status !== "delivered" && ( // ซ่อนปุ่มถ้าส่งสำเร็จ
                                                                        <button
                                                                            className="btn btn-primary btn-sm w-100"
                                                                            onClick={() => {
                                                                                setSelectedOrderId(order.order_id);
                                                                                handleUpdate();
                                                                            }}
                                                                        >
                                                                            อัปเดต
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Last Updated Footer */}
                                                        <div className="border-top pt-2 mt-3">
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <small className="text-muted">
                                                                    อัปเดตล่าสุด
                                                                </small>
                                                                <small className="text-muted">
                                                                    { format(new Date(), 'dd/MM/yyyy')}
                                                                </small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-5">
                                    <div className="mb-4">
                                        <div className="bg-light rounded-circle mx-auto mb-3" style={{ width: "80px", height: "80px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <i className="fas fa-shopping-cart fa-2x text-muted"></i>
                                        </div>
                                    </div>
                                    <h5 className="text-muted mb-3">ไม่มีคำสั่งซื้อ</h5>
                                    <p className="text-muted">
                                        ยังไม่มีคำสั่งซื้อที่คุณเป็นผู้ขาย
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default StudentManageOrders;