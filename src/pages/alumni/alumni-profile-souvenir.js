import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useOutletContext } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { FaFolderOpen, FaCheckCircle, FaImage, FaFilePdf } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import Swal from "sweetalert2";

// CSS & Bootstrap
import '../../css/profile.css';
import '../../css/reUploadSlip.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function AlumniProfileSouvenir({ order }) {
    const [profile, setProfile] = useState({});
    const { handleLogout } = useOutletContext();
    const navigate = useNavigate();
    const [orderHistory, setOrderHistory] = useState([]);
    const [previewImage, setPreviewImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    // const itemPerPage = 5; 
    const [orders, setOrders] = useState([]);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [currentOrderId, setCurrentOrderId] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const userId = localStorage.getItem("userId");

    // ดึงข้อมูลโปรไฟล์
    useEffect(() => {
        axios.get('http://localhost:3001/users/profile', {
            withCredentials: true
        })
            .then((response) => {
                if (response.data.success) {
                    setProfile(response.data.user);
                }
            })
            .catch((error) => {
                console.error('เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์:', error.response ? error.response.data.message : error.message);
            });
    }, []);

    // การค้นหาประวัติการสั่งซื้อ
    const filteredOrders = useMemo(() => {
        return orderHistory.filter(order => {
            const keyword = searchTerm.toLowerCase();
            return (
                order.order_id.toString().includes(keyword) ||
                order.order_status.toLowerCase().includes(keyword) ||
                order.products.some(prod =>
                    prod.product_name.toLowerCase().includes(keyword))
            );
        });
    }, [orderHistory, searchTerm]);

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

    const confirmReceived = async (orderId) => {
        try {
            const res = await axios.put(`http://localhost:3001/orders/orders-confirm/${orderId}`, {
                withCredentials: true
            });
            if (res.data && res.data.success) {
                await Swal.fire({
                    icon: 'success',
                    title: 'ยืนยันสำเร็จ',
                    text: 'คำสั่งซื้อของคุณ "จัดส่งสำเร็จ" แล้ว',
                    confirmButtonText: 'ตกลง'
                });
                // อัปเดตสถานะในหน้าเว็บ (refresh order history)
                setOrderHistory(prev =>
                    prev.map(order =>
                        order.order_id === orderId
                            ? { ...order, order_status: "delivered" }
                            : order
                    )
                );
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: res.data?.message || 'ไม่สามารถยืนยันได้',
                });
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: 'ไม่สามารถยืนยันได้',
            });
        }
    };

    const reuploadSlip = (orderId) => {
        setShowUploadModal(true);
        setCurrentOrderId(orderId); // เก็บ orderId ที่จะอัปโหลด
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

            // อัปเดต state ทันทีโดยใช้ค่าจาก backend
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
        if (e.target.classList.contains("modal-backdrop")) {
            setShowUploadModal(false);
        }
    };


    const buyAgain = (productId) => {
        // พาไปหน้า product เดิมหรือเพิ่มลงตะกร้า
        navigate(`/souvenir/souvenirDetail/${productId}`);
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
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/alumni-profile")}>โปรไฟล์ของฉัน</div>
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/alumni-profile/alumni-request")}>คำร้องขอ</div>
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/alumni-profile/alumni-manage-orders")}>จัดการคำสั่งซื้อของที่ระลึก</div>
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/alumni-profile/alumni-profile-webboard")}>กระทู้ที่สร้าง</div>
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/alumni-profile/alumni-profile-donation")}>ประวัติการบริจาค</div>
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/alumni-profile/alumni-profile-activity")}>ประวัติการเข้าร่วมกิจกรรม</div>
                                <div className="menu-item active py-2 mb-2 rounded" onClick={() => handleClick("/alumni-profile/alumni-profile-souvenir")}>ประวัติการสั่งซื้อของที่ระลึก</div>
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
                                    <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                                        <i className="fas fa-calendar-check text-primary fs-5"></i>
                                    </div>
                                    <div>
                                        <h4 className="fw-bold mb-1">ประวัติการสั่งซื้อของที่ระลึก</h4>
                                        <p className="text-muted mb-0 small">รวบรวมการสั่งซื้อสินค้าทั้งหมด</p>
                                    </div>
                                </div>
                                {orderHistory.length > 0 && (
                                    <div className="d-flex align-items-center">
                                        <span className="badge bg-primary text-white px-3 py-2 rounded-pill">
                                            {orderHistory.length} รายการ
                                        </span>
                                    </div>
                                )}
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
                                                    {new Date(order.order_date).toLocaleDateString("th-TH", {
                                                        year: "numeric",
                                                        month: "short",
                                                        day: "numeric",
                                                    })}
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
                                                                    ? "ถูกปฏิเสธ"
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
                                                            {new Date(order.order_date).toLocaleDateString("th-TH", {
                                                                year: "numeric",
                                                                month: "short",
                                                                day: "numeric",
                                                            })}
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
                                                                            ? "ถูกปฏิเสธ"
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
                                                            onClick={() => confirmReceived(order.order_id)}
                                                        >
                                                            ยืนยันได้รับสินค้าแล้ว
                                                        </button>
                                                    )}

                                                    <div>
                                                        {order.order_status === "cancelled" && (
                                                            <button
                                                                className="btn btn-warning btn-sm px-3"
                                                                onClick={() => reuploadSlip(order.order_id)}
                                                            >
                                                                อัปโหลดสลิปใหม่
                                                            </button>
                                                        )}

                                                        {/* Modal new slip */}
                                                        {showUploadModal && (
                                                            <div
                                                                className="modal-backdrop"
                                                                onClick={handleBackdropClick}
                                                            >
                                                                <div className="modal-reupload">
                                                                    <div className="modal-header">
                                                                        <h5 className="modal-title">อัปโหลดสลิปใหม่</h5>
                                                                        <button
                                                                            type="button"
                                                                            className="close-btn"
                                                                            onClick={() => setShowUploadModal(false)}
                                                                        >
                                                                            ✕
                                                                        </button>
                                                                    </div>

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
                                                                                    className="close-btn-file"
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
        </section>
    );
}

export default AlumniProfileSouvenir;
