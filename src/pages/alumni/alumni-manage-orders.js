import React, { useEffect, useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import { format } from 'date-fns';
import { GoArrowUpRight } from "react-icons/go";
import { useAuth } from "../../context/AuthContext";
import { HOSTNAME } from '../../config.js';

function AlumniManageOrders() {
    const [profile, setProfile] = useState({});
    const navigate = useNavigate();
    const [previewImage, setPreviewImage] = useState(null);
    const { user, handleLogout } = useAuth();
    const userId = user?.user_id;

    // States for products and orders
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productOrders, setProductOrders] = useState([]);
    const [trackingNumber, setTrackingNumber] = useState({});
    // const [loading, setLoading] = useState(true);
    // const [orderData, setOrderData] = useState(true);


    // สำหรับขนส่ง
    const [selectedCourier, setSelectedCourier] = useState({});
    const [companies, setCompanies] = useState([]);
    // const [orderTracking, setOrderTracking] = useState({});
    // const [trackingErrors, setTrackingErrors] = useState({});

    const courierPatterns = {
        thailand_post: /^[A-Z]{2}\d{9}[A-Z]{2}$/,        // 13 ตัว
        flash: /^[A-Z]{2}[A-Z0-9]{13}$/,                // 15 ตัว: 2 ตัวแรก A-Z + 13 ตัวหลัง A-Z หรือ 0-9
        kerry: /^[A-Z]{1}\d{10}$/,                       // 11 ตัว
        dhl: /^[A-Z]{2}\d{16}$/,                         // 18 ตัว
        "j&t": /^[A-Z]{2}\d{12}$/                        // 16 ตัว
    };

    // ความยาวของแต่ละบริษัท
    const patternLengths = {
        thailand_post: 13,
        flash: 15,
        kerry: 11,
        dhl: 18,
        "j&t": 16
    };

    // ตัวแรกต้องเป็นตัวอักษรสำหรับบางบริษัท
    const patternFirstChar = {
        thailand_post: /^[A-Z]/,
        flash: /^[A-Z]/,
        kerry: /^[A-Z]/,
        dhl: /^[A-Z]/,
        "j&t": /^[A-Z]/
    };

    // ฟังก์ชัน validate
    const validateTrackingNumber = (courier, number) => {
        if (!courier || !courierPatterns[courier]) return true;
        return courierPatterns[courier].test(number);
    };

    const [trackingError, setTrackingError] = useState({});

    // กำหนด mapping ของบริษัทกับ URL
    const courierTrackingLinks = {
        thailand_post: (trackingNumber) => `https://track.thailandpost.co.th/?trackNumber=${trackingNumber}`,
        kerry: (trackingNumber) => `https://th.kerryexpress.com/th/track/?track=${trackingNumber}`,
        dhl: (trackingNumber) => `https://www.dhl.com/th-th/home/tracking/tracking-express.html?tracking-id=${trackingNumber}`,
        flash: (trackingNumber) => `https://www.flashexpress.co.th/tracking/?se=${trackingNumber}`,
        'j&t': (trackingNumber) => `https://www.jtexpress.co.th/index/query/gztracking.html?billcode=${trackingNumber}`
    };

    // ดึงข้อมูลบริษัทขนส่ง
    useEffect(() => {
        axios.get(HOSTNAME + "/orders/shipping-companies")
            .then(res => setCompanies(res.data.companies))
            .catch(err => console.error(err));
    }, []);

    // ดึงข้อมูลโปรไฟล์
    useEffect(() => {
        axios.get(HOSTNAME + '/users/profile', { withCredentials: true })
            .then((response) => {
                if (response.data.success) {
                    setProfile(response.data.user);
                }
            })
            .catch((error) => {
                console.error('เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์:', error.response ? error.response.data.message : error.message);
            });
    }, []);

    // ดึงรายการสินค้าที่ตัวเองเป็นผู้ขาย
    useEffect(() => {
        if (userId) {
            console.log("กำลังดึงสินค้าของ seller_id:", userId);
            axios.get(HOSTNAME + `/orders/seller-products?seller_id=${userId}`, {
                withCredentials: true
            })
                .then(res => {
                    console.log("Response:", res.data);
                    if (res.data.success) {
                        setProducts(res.data.data);
                    } else {
                        console.log("ไม่พบสินค้า");
                    }
                })
                .catch(err => {
                    console.error("โหลดสินค้าล้มเหลว:", err.response?.data || err.message);
                });
        } else {
            console.log("ยังไม่มี userId");
        }
    }, [userId]);

    // ดึงคำสั่งซื้อของสินค้าที่เลือก
    const fetchProductOrders = (productId) => {
        axios.get(HOSTNAME + `/seller/product-orders/${productId}`)
            .then(res => {
                if (res.data.success) {
                    setSelectedProduct(productId);
                    setProductOrders(res.data.data);
                }
            })
            .catch(err => console.error("โหลดคำสั่งซื้อของสินค้านี้ล้มเหลว", err));
    };

    // กลับไปหน้ารายการสินค้า
    const goBackToProducts = () => {
        setSelectedProduct(null);
        setProductOrders([]);
    };

    // อัปเดตสถานะและเลขtracking
    const handleUpdate = (orderId, status, tracking, courier) => {
        const newStatus = "shipping";

        axios.post(HOSTNAME + `/seller/orders-status/${orderId}`, {
            order_id: orderId,
            order_status: newStatus,
            tracking_number: tracking,
            transport_company_id: courier
        }, { withCredentials: true }
        )
            .then(res => {
                Swal.fire({
                    icon: "success",
                    title: "อัปเดตสำเร็จ",
                    text: "กำลังจัดส่งสินค้า",
                    timer: 1500,
                    showConfirmButton: false
                });

                // อัปเดต state productOrders
                setProductOrders(prevOrders =>
                    prevOrders.map(order =>
                        order.order_id === orderId
                            ? {
                                ...order,
                                order_status: newStatus,
                                tracking_number: tracking,
                                transport_company_id: courier,
                                transport_company_name: companies.find(c => c.transport_company_id === courier)?.name || ''
                            }
                            : order
                    )
                );

                // รีเซ็ต states
                setTrackingNumber(prev => ({ ...prev, [orderId]: '' }));
                setSelectedCourier(prev => ({ ...prev, [orderId]: '' }));
                setTrackingError(prev => ({ ...prev, [orderId]: '' }));

            })
            .catch(err => {
                console.error(err);
                Swal.fire({
                    icon: "error",
                    title: "เกิดข้อผิดพลาด",
                    text: "ไม่สามารถอัปเดตข้อมูลได้"
                });
            });
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
        formData.append("user_id", userId);

        try {
            const res = await axios.post(HOSTNAME + "/users/update-profile-image", formData, {
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
                    {/* Sidebar/Profile */}
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
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/alumni-profile")}>โปรไฟล์ของฉัน</div>
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/alumni-profile/alumni-request")}>คำร้องขอ</div>
                                <div className="menu-item active py-2 mb-2 rounded" onClick={() => handleClick("/alumni-profile/alumni-manage-orders")}>จัดการคำสั่งซื้อของที่ระลึก</div>
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/alumni-profile/alumni-profile-webboard")}>กระทู้ที่สร้าง</div>
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/alumni-profile/alumni-profile-donation")}>ประวัติการบริจาค</div>
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/alumni-profile/alumni-profile-activity")}>ประวัติการเข้าร่วมกิจกรรม</div>
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/alumni-profile/alumni-profile-souvenir")}>ประวัติการสั่งซื้อของที่ระลึก</div>
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
                                        <p className="text-muted mb-0 small">
                                            {selectedProduct ? 'รายการคำสั่งซื้อของสินค้า' : 'รายการสินค้าที่คุณเป็นผู้ขาย'}
                                        </p>
                                    </div>
                                </div>

                                {/* ส่วนขวา: ปุ่มควบคุม */}
                                <div className="d-flex align-items-center">
                                    {selectedProduct && (
                                        <button
                                            className="btn btn-outline-secondary btn-sm"
                                            onClick={goBackToProducts}
                                        >
                                            กลับ
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <>
                            {/* แสดงรายการสินค้าหรือรายการคำสั่งซื้อ */}
                            {!selectedProduct ? (
                                <div className="container-fluid mb-4">
                                    <div className="row">
                                        {products.length > 0 ? (
                                            products.map(product => (
                                                <div key={product.product_id} className="col-md-4 col-lg-3 mb-4">
                                                    <div
                                                        className="card h-100 shadow-sm border-0 hover-card"
                                                        style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                                                    >
                                                        <div className="position-relative overflow-hidden">
                                                            <img
                                                                src={
                                                                    product.image
                                                                        ? HOSTNAME + `/uploads/${product.image}`
                                                                        : '/default-image.png'
                                                                }
                                                                alt={product.product_name}
                                                                style={{
                                                                    width: '100%',
                                                                    height: '200px',
                                                                    objectFit: 'cover',
                                                                    backgroundColor: '#f0f0f0',
                                                                }}
                                                            />
                                                            <div className="position-absolute top-0 end-0 m-2">
                                                                <span className="badge bg-primary rounded-pill">
                                                                    ₿{product.price}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="card-body d-flex flex-column">
                                                            <h6 className="card-title fw-bold text-truncate mb-2">
                                                                {product.product_name}
                                                            </h6>
                                                            <p className="text-muted small mb-3 flex-grow-1">
                                                                รหัสสินค้า: #{product.product_id}
                                                            </p>
                                                            <button
                                                                className="btn btn-primary btn-sm w-100"
                                                                onClick={() => fetchProductOrders(product.product_id)}
                                                            >
                                                                ดูคำสั่งซื้อ
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-12">
                                                <div className="text-center py-5">
                                                    <h5 className="text-muted mb-3">ไม่มีสินค้า</h5>
                                                    <p className="text-muted">คุณยังไม่มีสินค้าที่สร้างขึ้น</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                // แสดงรายการคำสั่งซื้อของสินค้าที่เลือก
                                <div className="container-fluid">
                                    {productOrders.length > 0 ? (
                                        <div className="row">
                                            <div className="col-12">
                                                {productOrders.map(order => (
                                                    <div key={order.order_id} className="card shadow-sm mb-3 border-0 rounded-3">
                                                        {/* Order Header */}
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
                                                                    <span className={`badge rounded-pill px-2 py-1 ${BADGE_CLASS[order.order_status] || "bg-secondary text-white"}`} style={{ fontSize: "0.8rem" }}>
                                                                        {ORDER_STATUS_LABEL[order.order_status] || "สถานะไม่ระบุ"}
                                                                    </span>
                                                                </div>

                                                                {/* Action Button */}
                                                                <div className="col-3 col-md-2 text-end">
                                                                    <button
                                                                        className="btn btn-outline-primary btn-sm px-2 py-1"
                                                                        style={{ fontSize: "0.8rem" }}
                                                                        data-bs-toggle="collapse"
                                                                        data-bs-target={`#orderDetail-${order.order_id}`}
                                                                        aria-expanded="false"
                                                                        aria-controls={`orderDetail-${order.order_id}`}
                                                                    >
                                                                        <span className="d-none d-sm-inline">จัดการ</span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Detailed Collapse Content */}
                                                        <div className="collapse" id={`orderDetail-${order.order_id}`}>
                                                            <div className="card-body border-top pt-3 bg-light bg-opacity-25">
                                                                {/* Customer Info */}
                                                                <div className="row mb-3">
                                                                    <div className="col-md-6 mb-2">
                                                                        <small className="text-muted d-block">ผู้สั่งซื้อ</small>
                                                                        <div className="bg-white p-2 rounded border">
                                                                            <span className={order.buyer_name ? "text-dark" : "text-muted"}>
                                                                                {order.buyer_name || "ยังไม่ทราบชื่อผู้สั่งซื้อ"}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="col-md-6 mb-2">
                                                                        <small className="text-muted d-block">วันที่สั่งซื้อ</small>
                                                                        <div className="bg-white p-2 rounded border">
                                                                            <span className={order.order_date ? "text-dark" : "text-muted"}>
                                                                                {order.order_date
                                                                                    ? format(new Date(order.order_date), "dd/MM/yyyy")
                                                                                    : "ยังไม่ทราบวันที่สั่งซื้อ"}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="col-12 mb-2">
                                                                        <small className="text-muted d-block">ที่อยู่</small>
                                                                        <div className="bg-white p-2 rounded border">
                                                                            <span className={order.full_address ? "text-dark" : "text-muted"}>
                                                                                {order.full_address || "ยังไม่ระบุที่อยู่"}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="col-md-6 mb-2">
                                                                        <small className="text-muted d-block">ติดต่อ</small>
                                                                        <div className="bg-white p-2 rounded border">
                                                                            <span className={order.phone ? "text-dark" : "text-muted"}>
                                                                                {order.phone || "ยังไม่ระบุ"}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* ซ่อนสลิป ถ้ามีสถานะปัญหา */}
                                                                {order.order_status !== "issue_reported" && order.slip_path && (
                                                                    <div className="mb-3">
                                                                        <small className="text-muted d-block">สลิปการชำระเงิน</small>
                                                                        <a
                                                                            href={HOSTNAME + `/uploads/${order.slip_path}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                        >
                                                                            <img
                                                                                src={HOSTNAME + `/uploads/${order.slip_path}`}
                                                                                alt="Payment Slip"
                                                                                style={{ maxWidth: "200px", border: "1px solid #ccc", marginTop: "5px" }}
                                                                            />
                                                                        </a>
                                                                    </div>
                                                                )}

                                                                {/* Current Status */}
                                                                <div className="row mb-3">
                                                                    <div className="col-md-6 mb-2">
                                                                        <small className="text-muted d-block">สถานะการชำระเงิน</small>
                                                                        <div className="bg-white p-2 rounded border">
                                                                            {order.order_status !== 'pending_verification' && (
                                                                                <span
                                                                                    className={`${order.payment_status === 'paid'
                                                                                        ? 'text-success'
                                                                                        : order.payment_status === 'pending'
                                                                                            ? 'text-dark '
                                                                                            : order.payment_status === 'rejected'
                                                                                                ? 'text-danger'
                                                                                                : 'text-secondary'
                                                                                        }`}
                                                                                    style={{ fontSize: '0.9rem' }}
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
                                                                    </div>

                                                                    {/* ถ้ามีสถานะปัญหา */}
                                                                    {order.order_status === "issue_reported" && order.issue && (
                                                                        <div className="mt-4 p-4 border border-danger rounded-3 bg-white shadow-sm">
                                                                            {/* Header */}
                                                                            <div className="d-flex align-items-center mb-3">
                                                                                <h5 className="text-danger fw-bold mb-0">รายละเอียดปัญหา</h5>
                                                                            </div>

                                                                            {/* ประเภทปัญหา */}
                                                                            <div className="mb-2">
                                                                                <strong className="text-dark">ประเภทปัญหา:</strong>{" "}
                                                                                <span className="text-secondary">
                                                                                    {ISSUE_TYPE_LABEL[order.issue.issue_type] || "ไม่ระบุ"}
                                                                                </span>
                                                                            </div>

                                                                            {/* คำอธิบาย */}
                                                                            <div className="mb-3">
                                                                                <strong className="text-dark">คำอธิบาย:</strong>{" "}
                                                                                <span className="text-secondary">{order.issue.description || "-"}</span>
                                                                            </div>

                                                                            {/* สิ่งที่ผู้ใช้ต้องการ */}
                                                                            {order.issue.resolution_options && (
                                                                                <div className="mb-2">
                                                                                    <strong className="text-dark">สิ่งที่ผู้ใช้ต้องการ:</strong>{" "}
                                                                                    <span className="text-secondary">
                                                                                        {(() => {
                                                                                            let options = order.issue.resolution_options;
                                                                                            if (typeof options === "string") {
                                                                                                try {
                                                                                                    options = JSON.parse(options);
                                                                                                } catch (e) {
                                                                                                    options = [options];
                                                                                                }
                                                                                            }
                                                                                            if (Array.isArray(options)) {
                                                                                                return options
                                                                                                    .map(opt => RESOLUTION_LABEL[opt] || opt)
                                                                                                    .join(", ");
                                                                                            } else {
                                                                                                return options;
                                                                                            }
                                                                                        })()}
                                                                                    </span>
                                                                                </div>
                                                                            )}

                                                                            {/* หลักฐาน */}
                                                                            {order.issue.evidence_path && (
                                                                                <div className="mb-3">
                                                                                    <strong className="text-dark d-block mb-1">หลักฐาน:</strong>
                                                                                    <a
                                                                                        href={`${HOSTNAME}/uploads/${order.issue.evidence_path}`}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        className="btn btn-outline-danger btn-sm"
                                                                                    >
                                                                                        ดูหลักฐาน
                                                                                    </a>
                                                                                </div>
                                                                            )}

                                                                            {/* เบอร์โทร */}
                                                                            <div className="mb-3">
                                                                                <strong className="text-dark">ติดต่อผู้ใช้:</strong>{" "}
                                                                                <span className="text-secondary">{order.phone || "ไม่ระบุ"}</span>
                                                                            </div>

                                                                            {/* ปุ่มแก้ไขแล้ว */}
                                                                            {/* <div className="text-end">
                                                                        <button
                                                                            className="btn btn-success btn-sm px-4"
                                                                            onClick={() => handleResolveIssue(order.order_id)}
                                                                        >
                                                                            แก้ไขแล้ว
                                                                        </button>
                                                                        </div> */}
                                                                        </div>
                                                                    )}


                                                                    {/* ซ่อนบริษัทขนส่งและเลขพัสดุ ถ้ามีสถานะปัญหา */}
                                                                    {order.order_status !== "issue_reported" && (
                                                                        <div key={order.order_id} className="col-md-6 mb-2">
                                                                            <small className="text-muted d-block">บริษัทขนส่ง</small>
                                                                            {order.transport_company_name && order.transport_company_code && order.tracking_number ? (
                                                                                <a
                                                                                    href={courierTrackingLinks[order.transport_company_code]?.(order.tracking_number)}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="text-decoration-none"
                                                                                >
                                                                                    <div className="bg-white p-2 rounded border d-flex align-items-center justify-content-between">
                                                                                        <span className="text-primary fw-bold">{order.transport_company_name}</span>
                                                                                        <GoArrowUpRight />
                                                                                    </div>
                                                                                </a>
                                                                            ) : order.transport_company_name ? (
                                                                                <div className="bg-white p-2 rounded border text-primary fw-bold">
                                                                                    {order.transport_company_name}
                                                                                </div>
                                                                            ) : (
                                                                                <div className="bg-white p-2 rounded border text-muted">
                                                                                    ยังไม่ระบุบริษัทขนส่ง
                                                                                </div>
                                                                            )}

                                                                            <small className="text-muted d-block mt-2">เลขพัสดุ</small>
                                                                            <div className="bg-white p-2 rounded border">
                                                                                <span className={order.tracking_number ? 'text-primary fw-bold' : 'text-muted'}>
                                                                                    {order.tracking_number || "ยังไม่ระบุเลขพัสดุ"}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {order.order_status !== "issue_reported" && (
                                                                    <div className="border-top pt-3">
                                                                        <h6 className="mb-3 d-flex align-items-start justify-content-start">
                                                                            อัปเดตข้อมูล
                                                                        </h6>

                                                                        <div className="row mt-3">
                                                                            {/* บริษัทขนส่ง */}
                                                                            <div className="col-md-6 mb-3">
                                                                                <label className="form-label small fw-bold text-muted">บริษัทขนส่ง</label>
                                                                                <select
                                                                                    className="form-select"
                                                                                    value={selectedCourier[order.order_id] || ""}
                                                                                    onChange={e =>
                                                                                        setSelectedCourier(prev => ({
                                                                                            ...prev,
                                                                                            [order.order_id]: e.target.value
                                                                                        }))
                                                                                    }
                                                                                    disabled={!!order.tracking_number}
                                                                                >
                                                                                    <option value="">-- เลือกบริษัทขนส่ง --</option>
                                                                                    {companies.map(c => (
                                                                                        <option key={c.transport_company_id} value={c.transport_company_id}>
                                                                                            {c.name}
                                                                                        </option>
                                                                                    ))}
                                                                                </select>
                                                                            </div>

                                                                            {/* หมายเลขพัสดุ */}
                                                                            <div className="col-md-6 mb-3">
                                                                                <label className="form-label small fw-bold text-muted">หมายเลขพัสดุ</label>
                                                                                <input
                                                                                    type="text"
                                                                                    className="form-control"
                                                                                    placeholder="ใส่เลขพัสดุ..."
                                                                                    value={trackingNumber[order.order_id] || ""}
                                                                                    onChange={e =>
                                                                                        setTrackingNumber(prev => ({
                                                                                            ...prev,
                                                                                            [order.order_id]: e.target.value.toUpperCase()
                                                                                        }))
                                                                                    }
                                                                                    disabled={!!order.tracking_number}
                                                                                />
                                                                                {trackingError[order.order_id] && (
                                                                                    <small className="text-danger mt-1 d-block">
                                                                                        {trackingError[order.order_id]}
                                                                                    </small>
                                                                                )}
                                                                            </div>

                                                                            {/* ปุ่มอัปเดต */}
                                                                            <div className="col-md-3 mb-3 d-flex align-items-end">
                                                                                {order.order_status !== "delivered" && (
                                                                                    <button
                                                                                        className="btn btn-primary btn-sm w-100"
                                                                                        onClick={() =>
                                                                                            handleUpdate(
                                                                                                order.order_id,
                                                                                                order.order_status,
                                                                                                trackingNumber[order.order_id],
                                                                                                selectedCourier[order.order_id]
                                                                                            )
                                                                                        }
                                                                                        disabled={
                                                                                            order.tracking_number && order.tracking_number.trim() !== "" ||
                                                                                            !selectedCourier[order.order_id] ||
                                                                                            !trackingNumber[order.order_id] ||
                                                                                            (trackingError[order.order_id] && trackingError[order.order_id] !== "")
                                                                                        }
                                                                                    >
                                                                                        อัปเดต
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                    </div>
                                                                )}

                                                            </div>
                                                        </div>

                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-5">
                                            <div className="mb-4">
                                                <div
                                                    className="bg-light rounded-circle mx-auto mb-3"
                                                    style={{
                                                        width: '80px',
                                                        height: '80px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <i className="fas fa-shopping-cart fa-2x text-muted"></i>
                                                </div>
                                            </div>
                                            <h5 className="text-muted mb-3">ไม่มีคำสั่งซื้อ</h5>
                                            <p className="text-muted">สินค้านี้ยังไม่มีคำสั่งซื้อ</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    </div>
                </div>
            </div>
        </section >
    );
}

const RESOLUTION_LABEL = {
    refund: "คืนเงิน",
    return: "คืนสินค้า",
    replace: "เปลี่ยนสินค้า",
    resend: "ส่งสินค้าใหม่"
};;

const ISSUE_TYPE_LABEL = {
    not_received: "ไม่ได้รับสินค้า",
    damaged: "สินค้าเสียหาย",
    wrong_item: "ได้รับสินค้าผิด",
    other: "อื่น ๆ",
};


// สร้าง mapping ไว้ข้างนอก component
const ORDER_STATUS_LABEL = {
    pending_verification: "รอตรวจสอบการชำระเงิน",
    processing: "กำลังดำเนินการ",
    shipping: "กำลังจัดส่ง",
    delivered: "จัดส่งสำเร็จ",
    resolved: "เสร็จสิ้นแล้ว",
    issue_reported: "มีปัญหาการจัดส่ง",
    refund_approved: "คืนเงินสำเร็จ",
    resend_processing: "ส่งสินค้าใหม่กำลังดำเนินการ",
    issue_rejected: "ปัญหาไม่ได้รับการแก้ไข",
    return_pending: "ผู้ใช้ส่งสินค้าคืน",
    return_approved: "คืนสินค้าสำเร็จ",
    return_rejected: "การคืนไม่ผ่าน",
    cancelled: "สลิปไม่ถูกต้อง",
    repeal_pending: "ยกเลิกการสั่งซื้อ",
    repeal_approved: "ยกเลิกการสั่งซื้อสำเร็จ",
    repeal_rejected: "ปฏิเสธการยกเลิก",
};

const BADGE_CLASS = {
    pending_verification: "text-dark bg-secondary bg-opacity-10", // เทาเข้ม
    processing: "text-warning bg-warning bg-opacity-10",          // เหลือง
    shipping: "text-primary bg-primary bg-opacity-10",            // น้ำเงิน
    delivered: "text-success bg-success bg-opacity-10",
    resolved: "text-success bg-success bg-opacity-10",        // เขียว
    issue_reported: "text-white bg-danger",                       // แดงสด
    refund_approved: "text-success bg-success bg-opacity-10",           // ฟ้า
    resend_processing: "text-primary bg-primary bg-opacity-10",    // ม่วง (custom class)
    issue_rejected: "text-danger bg-danger bg-opacity-25",        // แดงอ่อน
    return_pending: "text-warning bg-warning bg-opacity-10",         // ส้ม (custom class)
    return_approved: "text-success bg-success bg-opacity-10",     // เขียวอ่อน
    return_rejected: "text-danger bg-danger bg-opacity-25",
    cancelled: "text-dark bg-dark bg-opacity-25",
    repeal_pending: "text-dark bg-dark bg-opacity-25",
    repeal_approved: "text-success bg-success bg-opacity-10",
    repeal_rejected: "text-danger bg-danger bg-opacity-25",
};


export default AlumniManageOrders;