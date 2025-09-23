import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useOutletContext } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { FaFolderOpen, FaCheckCircle, FaImage, FaFilePdf } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import Swal from "sweetalert2";
import { useAuth } from '../../context/AuthContext';

// CSS & Bootstrap
import '../../css/profile.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function PresidentProfileSouvenir() {
    const [profile, setProfile] = useState({});
    const navigate = useNavigate();
    const [orderHistory, setOrderHistory] = useState([]);
    const [previewImage, setPreviewImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [orders, setOrders] = useState([]);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [currentOrderId, setCurrentOrderId] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const { user, handleLogout } = useAuth();
    const userId = user?.id;
    // const userId = sessionStorage.getItem("userId");

    // สำหรับฟังก์ชันอัปโหลดหลักฐานการสั่งซื้อ
    const [showProofModal, setShowProofModal] = useState(false);
    const [proofFile, setProofFile] = useState(null);
    const [proofOrderId, setProofOrderId] = useState(null);
    const [isProofUploading, setIsProofUploading] = useState(false);

    // ดึงข้อมูลโปรไฟล์
    useEffect(() => {
        axios.get('http://localhost:3001/users/profile', { withCredentials: true })
            .then((response) => {
                if (response.data.success) {
                    setProfile(response.data.user);
                }
            })
            .catch((error) => {
                console.error('เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์:', error.response ? error.response.data.message : error.message);
            });
    }, []);

    // ดึงประวัติการสั่งซื้อ
    useEffect(() => {
        if (userId) {
            axios.get(`http://localhost:3001/orders/orders-user/${userId}`)
                .then(response => {
                    setOrderHistory(response.data);
                })
                .catch(error => {
                    console.error("Error fetching order history:", error);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [userId]);

    // const confirmReceived = async (orderId) => {
    //     try {
    //         const res = await axios.put(`/api/orders-confirm/${orderId}`);
    //         if (res.data && res.data.success) {
    //             await Swal.fire({
    //                 icon: 'success',
    //                 title: 'ยืนยันสำเร็จ',
    //                 text: 'คำสั่งซื้อของคุณ "จัดส่งสำเร็จ" แล้ว',
    //                 confirmButtonText: 'ตกลง'
    //             });
    //             // อัปเดตสถานะในหน้าเว็บ (refresh order history)
    //             setOrderHistory(prev =>
    //                 prev.map(order =>
    //                     order.order_id === orderId
    //                         ? { ...order, order_status: "delivered" }
    //                         : order
    //                 )
    //             );
    //         } else {
    //             Swal.fire({
    //                 icon: 'error',
    //                 title: 'เกิดข้อผิดพลาด',
    //                 text: res.data?.message || 'ไม่สามารถยืนยันได้',
    //             });
    //         }
    //     } catch (err) {
    //         Swal.fire({
    //             icon: 'error',
    //             title: 'เกิดข้อผิดพลาด',
    //             text: 'ไม่สามารถยืนยันได้',
    //         });
    //     }
    // };

    const handleConfirmReceived = (orderId) => {
            setProofOrderId(orderId);
            setShowProofModal(true);
        };
    
        // อัปโหลดหลักฐาน
        const handleProofFileChange = (e) => {
            setProofFile(e.target.files[0]);
        };
    
        const handleProofSubmit = async (e) => {
            if (!proofFile) return;
            setIsProofUploading(true);
    
            try {
                const formData = new FormData();
                formData.append("proofImage", proofFile);
    
                const res = await axios.post(
                    `http://localhost:3001/orders/${proofOrderId}/upload-proof`,
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );
    
                if (res.data && res.data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'อัปโหลดหลักฐานสำเร็จ',
                        text: 'สินค้าของคุณจัดส่งสำเร็จแล้ว',
                        confirmButtonText: 'ตกลง'
                    });
                    setOrderHistory(prev =>
                        prev.map(order =>
                            order.order_id === proofOrderId
                                ? { ...order, order_status: "delivered" }
                                : order
                        )
                    );
                    setShowProofModal(false);
                    setProofFile(null);
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'เกิดข้อผิดพลาด',
                        text: res.data?.message || 'ไม่สามารถอัปโหลดหลักฐานได้',
                    });
                }
            } catch (err) {
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: 'ไม่สามารถอัปโหลดหลักฐานได้',
                });
            } finally {
                setIsProofUploading(false);
            }
        };

    const reuploadSlip = (orderId) => {
        // เปิด modal
        setShowUploadModal(true);
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    // อัปเดต order_status และ payment_status ใน backend
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) return;

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append("paymentSlip", selectedFile);

            const res = await axios.post(
                `http://localhost:3001/orders/${currentOrderId}/reupload-slip`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            Swal.fire({
                icon: "success",
                title: "อัปโหลดสลิปสำเร็จ",
                text: res.data.message || "",
                timer: 2000,
                showConfirmButton: false,
            });

            //อัปเดต state ทันทีโดยใช้ค่าจาก backend
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.order_id === currentOrderId
                        ? {
                            ...order,
                            payment_status: res.data.payment_status || 'pending',
                            order_status: res.data.order_status || 'pending_verification',
                            payment_slip: res.data.paymentSlipUrl || order.payment_slip,
                            updated_at: new Date().toISOString()
                        }
                        : order
                )
            );

            setShowUploadModal(false);
            setSelectedFile(null);

        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "เกิดข้อผิดพลาด",
                text: error.response?.data?.error || error.message,
            });
        } finally {
            setIsUploading(false);
        }
    };


    const handleBackdropClick = (e) => {
        if (e.target.classList.contains('modal-backdrop')) {
            setShowUploadModal(false);
        }
    };

    const buyAgain = async (orderId) => {
        try {
            const res = await fetch(`http://localhost:3001/orders/order-buyAgain/${orderId}`);
            const data = await res.json();

            // ถ้ามีสินค้าที่พร้อมเพิ่ม
            if (data.availableItems && data.availableItems.length > 0) {
                let cart = JSON.parse(sessionStorage.getItem("cart")) || [];

                data.availableItems.forEach(item => {
                    const existingIndex = cart.findIndex(c => c.product_id === item.product_id);
                    if (existingIndex >= 0) {
                        cart[existingIndex].quantity += item.quantity;
                    } else {
                        cart.push({
                            product_id: item.product_id,
                            name: item.product_name,
                            price: item.price,
                            quantity: item.quantity
                        });
                    }
                });

                sessionStorage.setItem("cart", JSON.stringify(cart));

                if (data.unavailableItems && data.unavailableItems.length > 0) {
                    alert(`มีสินค้า ${data.unavailableItems.length} รายการที่สต็อกไม่เพียงพอ`);
                }

                navigate("/souvenir/souvenir_basket");
            }
            // ถ้าไม่มีสินค้าที่พร้อมเพิ่มเลย
            else {
                Swal.fire({
                    icon: 'info',
                    title: 'ไม่มีสินค้าในคำสั่งซื้อ',
                    text: 'สินค้าหมด',
                    confirmButtonText: 'ตกลง'
                });
            }
        } catch (err) {
            console.error("Error fetching order items:", err);
            alert("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        }
    };

    // ฟังก์ชันเปลี่ยนหน้า
    const handleClick = (path) => {
        navigate(path);
    };

    // อัปโหลดรูปภาพ
    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // แสดง preview รูปก่อนอัปโหลด
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

                // อัปเดตรูปโปรไฟล์ใน state
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

    const formatDate = (dateStr) => {
        if (!dateStr || dateStr === "0000-00-00") return "ไม่ระบุวันที่";
        const date = new Date(dateStr);
        const day = date.getDate();
        const month = date.getMonth() + 1; // เดือนเป็นเลข
        const year = date.getFullYear() + 543; // ปีไทย
        return `${day}/${month}/${year}`;
    };

    if (loading) {
        return <div className="loading-container">กำลังโหลด...</div>;
    }

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
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/president-profile")}>โปรไฟล์ของฉัน</div>
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/president-profile/president-manage-orders")}>จัดการคำสั่งซื้อของที่ระลึก</div>
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/president-profile/president-profile-webboard")}>กระทู้ที่สร้าง</div>
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/president-profile/president-profile-donation")}>ประวัติการบริจาค</div>
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/president-profile/president-profile-activity")}>ประวัติการเข้าร่วมกิจกรรม</div>
                                <div className="menu-item active py-2 mb-2 rounded" onClick={() => handleClick("/president-profile/president-profile-souvenir")}>ประวัติการสั่งซื้อของที่ระลึก</div>
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/president-profile/president-approve")}>การอนุมัติ</div>
                                <div className="menu-item py-2 rounded" onClick={handleLogout}>ออกจากระบบ</div>
                            </div>
                        </div>
                    </div>
                    {/* Main Content */}
                    <div className="col-12 col-md-8">
                        {/* Header Section */}
                        <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center">
                                    <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                                        <i className="fas fa-calendar-check text-success fs-5"></i>
                                    </div>
                                    <div>
                                        <h4 className="fw-bold mb-1">ประวัติการสั่งซื้อของที่ระลึก</h4>
                                        <p className="text-muted mb-0 small">รวบรวมการสั่งซื้อสินค้าทั้งหมด</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ width: "250px" }}>
                            <input
                                type="text"
                                className="form-control mb-3 "
                                placeholder="ค้นหาประวัติการสั่งซื้อ"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1); // รีเซ็ตหน้าเมื่อพิมพ์ค้นหา
                                }}
                            />
                        </div>

                        <div className="order-history-list">

                            {orderHistory.length === 0 ? (
                                <div className="text-center py-5">
                                    <div className="empty-state">
                                        <div className="mb-4">
                                            <div className="bg-light rounded-circle mx-auto mb-3" style={{ width: "80px", height: "80px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                <span className="fs-1 text-muted">📦</span>
                                            </div>
                                            <h5 className="text-muted">ยังไม่มีประวัติการสั่งซื้อ</h5>
                                            <p className="text-muted mb-4">เมื่อคุณทำการสั่งซื้อสินค้า ประวัติจะแสดงที่นี่</p>

                                        </div>
                                    </div>
                                </div>
                            ) : (
                                orderHistory.map((order, idx) => (
                                    <div className="card border-0 shadow-sm mb-3 rounded-3" key={order.order_id || idx}>
                                        <div className="card-body d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
                                            <div className="mb-2 mb-md-0">
                                                <h6 className="fw-bold mb-1">รหัสคำสั่งซื้อ #{order.order_id}</h6>
                                                <small className="text-muted">
                                                    วันที่:{" "}
                                                    {order.order_date
                                                        ? `${formatDate(order.order_date)}`
                                                        : "-"}
                                                </small>
                                            </div>
                                            <div className="d-flex flex-column flex-md-row align-items-md-center gap-2">
                                                <span
                                                    className={`badge rounded-pill fs-6 px-3 py-2 text-capitalize ${order.order_status === "delivered"
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
                                                <button
                                                    className="btn btn-outline-secondary btn-sm"
                                                    data-bs-toggle="collapse"
                                                    data-bs-target={`#orderDetail-${idx}`}
                                                    aria-expanded="false"
                                                    aria-controls={`orderDetail-${idx}`}
                                                >
                                                    ดูรายละเอียด
                                                </button>
                                            </div>
                                        </div>

                                        {/* Collapse content */}
                                        <div className="collapse" id={`orderDetail-${idx}`}>
                                            <div className="card-body border-top pt-3 bg-light bg-opacity-25">
                                                {/* Order Details */}
                                                <div className="row mb-3">
                                                    <div className="col-md-6 mb-2">
                                                        <small className="text-muted d-block">วันที่สั่งซื้อ</small>
                                                        <span className="fw-semibold">
                                                            {order.order_date
                                                                ? `${formatDate(order.order_date)}`
                                                                : "ยังไม่ทราบวันที่สั่งซื้อ"}
                                                        </span>
                                                    </div>
                                                    <div className="col-md-6 mb-2">
                                                        <small className="text-muted d-block">สถานะ</small>
                                                        <span className="fw-semibold">
                                                            {order.order_status === "delivered"
                                                                ? "จัดส่งสำเร็จ"
                                                                : order.order_status === "shipping"
                                                                    ? "กำลังจัดส่ง"
                                                                    : order.order_status === "processing"
                                                                        ? "กำลังดำเนินการ"
                                                                        : order.order_status === "cancelled"
                                                                            ? "ยกเลิก"
                                                                            : "รอชำระเงิน"}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Shipping Address */}
                                                <div className="mb-3">
                                                    <small className="text-muted d-block">ที่อยู่จัดส่ง</small>
                                                    <span className="fw-semibold">{order.shippingAddress}</span>
                                                </div>

                                                {/* Tracking Number */}
                                                {order.tracking_number && (
                                                    <div className="mb-3">
                                                        <small className="text-muted d-block">เลขพัสดุ</small>
                                                        <span className="text-primary fw-semibold">{order.tracking_number}</span>
                                                    </div>
                                                )}

                                                {/* Products Grid */}
                                                <div className="mb-3">
                                                    <small className="text-muted d-block mb-2">สินค้าในคำสั่งซื้อ ({order.products.length} รายการ)</small>
                                                    <div className="row g-2">
                                                        {order.products.map((prod, i) => (
                                                            <div className="col-6 col-md-4 col-lg-3" key={i}>
                                                                <div className="card border-0 bg-white shadow-sm h-100 rounded-2">
                                                                    <div className="position-relative">
                                                                        <img
                                                                            src={prod.image ? `http://localhost:3001/uploads/${prod.image}` : "http://localhost:3001/uploads/default-product.png"}
                                                                            alt={prod.product_name}
                                                                            className="card-img-top rounded-top-2"
                                                                            style={{ height: "80px", objectFit: "cover" }}
                                                                        />
                                                                        <div className="position-absolute top-0 end-0 m-1">
                                                                            <span className="badge bg-dark bg-opacity-75 rounded-pill" style={{ fontSize: "0.6rem" }}>
                                                                                x{prod.quantity}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="card-body p-2">
                                                                        <div className="text-truncate mb-1" style={{ fontSize: "0.8rem" }} title={prod.product_name}>
                                                                            <strong>{prod.product_name}</strong>
                                                                        </div>
                                                                        <div className="d-flex justify-content-between align-items-center">
                                                                            <small className="text-muted">{prod.quantity} ชิ้น</small>
                                                                            <small className="fw-bold text-primary">฿{Number(prod.price).toLocaleString()}</small>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Order Summary */}
                                                <div className="row mb-3">
                                                    <div className="col-12">
                                                        <div className="bg-white rounded-2 p-3 border">
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <span className="fw-semibold">ยอดรวมทั้งหมด</span>
                                                                <span className="h5 mb-0 text-success fw-bold">
                                                                    ฿{Number(order.total_amount).toLocaleString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action Button */}
                                                <div className="text-end">
                                                    {order.order_status === "shipping" && (
                                                        <button
                                                            className="btn btn-success btn-sm px-3"
                                                            onClick={() => handleConfirmReceived(order.order_id)}
                                                        >
                                                            ยืนยันได้รับสินค้าแล้ว
                                                        </button>
                                                    )}

                                                    <div>
                                                        {order.order_status === "cancelled" && (
                                                            <button
                                                                className="btn btn-warning btn-sm px-3"
                                                                onClick={() => setShowUploadModal(true)}
                                                            >
                                                                อัปโหลดสลิปใหม่
                                                            </button>
                                                        )}

                                                        {/* Modal mockup */}
                                                        {showUploadModal && (
                                                            <div
                                                                className="modal-backdrop"
                                                                onClick={handleBackdropClick}
                                                            >
                                                                <div className="modal-reupload">
                                                                    {/* Modal Header */}
                                                                    <div className="modal-header">
                                                                        <h5 className="modal-title">อัปโหลดสลิปใหม่</h5>
                                                                        <button
                                                                            type="button"
                                                                            className="close-btn"
                                                                            onClick={() => reuploadSlip(order.order_id)}
                                                                        >
                                                                            ✕
                                                                        </button>
                                                                    </div>

                                                                    {/* Modal Body */}
                                                                    <div className="modal-body">
                                                                        <div
                                                                            className={`file-upload-area ${selectedFile ? "has-file" : ""}`}
                                                                            onClick={() => !selectedFile && document.getElementById("file-input").click()}
                                                                            style={{ cursor: selectedFile ? "default" : "pointer" }}
                                                                        >
                                                                            <input
                                                                                id="file-input"
                                                                                type="file"
                                                                                className="file-input"
                                                                                accept="image/*,application/pdf"
                                                                                onChange={handleFileChange}
                                                                                style={{ display: "none" }}
                                                                            />

                                                                            {!selectedFile ? (
                                                                                <>
                                                                                    <FaFolderOpen size={40} color="#fdcd0dff" className="mb-2" />
                                                                                    <div className="upload-text">คลิกเพื่อเลือกไฟล์</div>
                                                                                    <div className="upload-subtext text-muted">รองรับไฟล์รูปภาพและ PDF</div>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <FaCheckCircle size={40} color="green" className="mb-2" />
                                                                                    <div className="upload-text">ไฟล์พร้อมอัปโหลด</div>
                                                                                    <div className="upload-subtext text-muted">คลิกเพื่อเปลี่ยนไฟล์</div>
                                                                                </>
                                                                            )}
                                                                        </div>

                                                                        {/* File Preview */}
                                                                        {selectedFile && (
                                                                            <div className="file-preview position-relative mt-3 p-2 border rounded">
                                                                                {/* ปุ่มกากบาท */}
                                                                                <button
                                                                                    type="button"
                                                                                    className="btn-close"
                                                                                    aria-label="Close"
                                                                                    style={{
                                                                                        position: "absolute",
                                                                                        top: "5px",
                                                                                        right: "5px",
                                                                                        background: "white",
                                                                                        borderRadius: "50%",
                                                                                        padding: "4px",
                                                                                        boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
                                                                                    }}
                                                                                    onClick={() => setSelectedFile(null)}
                                                                                >
                                                                                    <MdClose size={18} />
                                                                                </button>

                                                                                <div className="d-flex align-items-center gap-2">
                                                                                    <div className="file-icon" style={{ fontSize: "1.5rem" }}>
                                                                                        {selectedFile.type.startsWith("image/") ? (
                                                                                            <FaImage color="#0d6efd" />
                                                                                        ) : (
                                                                                            <FaFilePdf color="red" />
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="file-info">
                                                                                        <div className="file-name fw-bold">{selectedFile.name}</div>
                                                                                        <div className="file-size text-muted">
                                                                                            {(selectedFile.size / 1024).toFixed(1)} KB
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Modal Footer */}
                                                                    <div className="modal-footer">
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-secondary"
                                                                            onClick={() => setShowUploadModal(false)}
                                                                            disabled={isUploading}
                                                                        >
                                                                            ยกเลิก
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-primary"
                                                                            onClick={handleSubmit}
                                                                            disabled={!selectedFile || isUploading}
                                                                        >
                                                                            {isUploading && <span className="loading-spinner"></span>}
                                                                            {isUploading ? 'กำลังอัปโหลด...' : 'อัปโหลด'}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {order.order_status === "delivered" && (
                                                        <button
                                                            className="btn btn-primary btn-sm px-3"
                                                            onClick={() => buyAgain(order.order_id)}
                                                        >
                                                            ซื้ออีกครั้ง
                                                        </button>
                                                    )}
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal อัปโหลดหลักฐาน */}
            {showProofModal && (
                <div className="modal-backdrop" onClick={e => { if (e.target.classList.contains("modal-backdrop")) setShowProofModal(false); }}>
                    <div className="modal-reupload">
                        <div className="modal-header">
                            <h5 className="modal-title">อัปโหลดหลักฐานการได้รับสินค้า</h5>
                            <button type="button" className="close-btn" onClick={() => setShowProofModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleProofFileChange}
                                disabled={isProofUploading}
                            />
                            {proofFile && (
                                <div className="mt-3">
                                    <img src={URL.createObjectURL(proofFile)} alt="proof" style={{ maxWidth: "100%", maxHeight: "200px" }} />
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowProofModal(false)} disabled={isProofUploading}>ยกเลิก</button>
                            <button type="button" className="btn btn-primary" onClick={handleProofSubmit} disabled={!proofFile || isProofUploading}>
                                {isProofUploading ? "กำลังอัปโหลด..." : "อัปโหลด"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default PresidentProfileSouvenir;

