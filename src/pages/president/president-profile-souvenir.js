import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaFolderOpen, FaCheckCircle, FaImage, FaFilePdf } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import Swal from "sweetalert2";
import { useAuth } from '../../context/AuthContext';
import { HOSTNAME } from '../../config.js';
import { GoArrowUpRight } from "react-icons/go";

// CSS & Bootstrap
import '../../css/profile.css';
import '../../css/reUploadSlip.css';
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
    const itemPerPage = 5; // จำนวนรายการต่อหน้า
    const [orders, setOrders] = useState([]);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [currentOrderId, setCurrentOrderId] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    // การสั่งซื้อมีปัญหา
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [issueType, setIssueType] = useState("");
    const [issueDescription, setIssueDescription] = useState("");
    const [contacted, setContacted] = useState("");
    const [evidenceFile, setEvidenceFile] = useState(null);
    const { user, handleLogout } = useAuth();
    const userId = user?.user_id;

    // สำหรับฟังก์ชันอัปโหลดหลักฐานการสั่งซื้อ
    const [showProofModal, setShowProofModal] = useState(false);
    const [selectedOrderForConfirm, setSelectedOrderForConfirm] = useState(null);
    const [proofFile, setProofFile] = useState(null);
    const [isProofUploading, setIsProofUploading] = useState(false);

    const [companies, setCompanies] = useState([]);

    function formatFullAddress(addr) {
        if (!addr) return "";
        return `${addr.shippingAddress || ""} 
        ต.${addr.sub_district_name || ""} 
        อ.${addr.district_name || ""} 
        จ.${addr.province_name || ""} 
        ${addr.zip_code || ""}`;
    }

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

    // การค้นหาประวัติการสั่งซื้อ
    const filteredOrders = useMemo(() => {
        return (orderHistory || []).filter(order => {
            const keyword = searchTerm.toLowerCase();
            return (
                order.order_id.toString().includes(keyword) ||
                order.order_status.toLowerCase().includes(keyword) ||
                order.products?.some(prod =>
                    prod.product_name.toLowerCase().includes(keyword))
            );
        });
    }, [orderHistory, searchTerm]);


    // ดึงประวัติการสั่งซื้อ
    useEffect(() => {
        if (userId) {
            axios.get(HOSTNAME + `/orders/orders-user/${userId}`)
                .then(response => {
                    setOrderHistory(response.data);
                    console.log(response.data);


                })
                .catch(error => {
                    console.error("Error fetching order history:", error);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [userId]);



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


    // เปิด Modal สำหรับยืนยันรับสินค้า
    const openConfirmModal = (order) => {
        setSelectedOrderForConfirm(order);
        setProofFile(null);
        setShowProofModal(true);
    };

    // เมื่อเลือกไฟล์หลักฐาน
    const handleProofFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // ตรวจสอบขนาดไฟล์ (ไม่เกิน 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert("ไฟล์มีขนาดใหญ่เกิน 5MB");
                return;
            }
            setProofFile(file);
        }
    };

    // Submit การยืนยันรับสินค้า
    const handleProofSubmit = async () => {
    console.log("selectedOrderForConfirm:", selectedOrderForConfirm);

    setIsProofUploading(true);

    const formData = new FormData();
    if (proofFile) {
        formData.append('proofImage', proofFile);
    }

    try {
        const response = await fetch(
            `${HOSTNAME}/orders/${selectedOrderForConfirm}/upload-proof`,
            {
                method: 'POST',
                body: formData
            }
        );

        const result = await response.json();

        if (result.success) {
            Swal.fire('สำเร็จ', 'ยืนยันการได้รับสินค้าแล้ว', 'success');
            setShowProofModal(false);
            setProofFile(null);
            // โหลดข้อมูลใหม่
            setOrderHistory(); //โหลดซ้ำ
        } else {
            alert(result.message || "เกิดข้อผิดพลาด");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("เกิดข้อผิดพลาดในการยืนยันการรับสินค้า");
    } finally {
        setIsProofUploading(false);
    }
};


    const reuploadSlip = (orderId) => {
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

            console.log("DEBUG currentOrderId:", currentOrderId);

            const res = await axios.post(
                HOSTNAME + `/orders/${currentOrderId}/reupload-slip`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true }
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
        if (e.target.classList.contains('modal-backdrop')) {
            setShowUploadModal(false);
        }
    };

    // ซื้ออีกครั้ง
    const buyAgain = async (orderId) => {
        try {
            const res = await fetch(HOSTNAME + `/orders/order-buyAgain/${orderId}`);
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

    // เปิด modal
    const handleReportIssue = (order) => {
        if (!order?.order_id) {
            console.error("Order ไม่ถูกต้อง:", order);
            Swal.fire("แจ้งเตือน", "ไม่พบคำสั่งซื้อที่เลือก", "warning");
            return;
        }
        setSelectedOrder(order);
        setShowReportModal(true);
    };

    const [resolutionOptions, setResolutionOptions] = useState([]);
    const toggleResolutionOption = (option) => {
        setResolutionOptions((prev) => {
            if (prev.includes(option)) {
                return prev.filter((item) => item !== option); // เอาออก
            } else {
                return [...prev, option]; // เพิ่มเข้า
            }
        });
    };

    // แจ้งปัญหา
    const handleReportSubmit = async (e) => {
        e.preventDefault();
        if (!selectedOrder?.order_id || !issueType || !issueDescription || !contacted) return;

        try {
            const formData = new FormData();
            formData.append("order_id", selectedOrder.order_id);
            formData.append("issue_type", issueType);
            formData.append("description", issueDescription);
            formData.append("contact", contacted);
            // แปลง Array เป็น JSON string
            formData.append("resolution_options", JSON.stringify(resolutionOptions)); if (evidenceFile) formData.append("evidenceImage", evidenceFile);

            const res = await axios.post(
                HOSTNAME + '/orders/report-issue',
                formData,
                { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true }
            );

            Swal.fire({
                icon: "success",
                title: "แจ้งปัญหาสำเร็จ",
                text: `ระบบได้รับปัญหาของคุณแล้ว (Order #${selectedOrder.order_id})`,
                timer: 2500,
                showConfirmButton: false
            });

            // สมมติ backend ส่งกลับ issue_id ของ order ที่สร้างใหม่
            const issueId = res.data.issue_id;
            setOrders(prev =>
                prev.map(order =>
                    order.order_id === selectedOrder.order_id
                        ? { ...order, order_status: "issue_reported", issue_id: issueId }
                        : order
                )
            );

            setOrderHistory(prev =>
                prev.map(order =>
                    order.order_id === selectedOrder.order_id
                        ? { ...order, order_status: "issue_reported", issue_id: issueId }
                        : order
                )
            );

            setShowReportModal(false);
            setSelectedOrder(null);
            setIssueType("");
            setIssueDescription("");
            setContacted("");
            setEvidenceFile(null);

        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "เกิดข้อผิดพลาด",
                text: error.response?.data?.error || error.message,
            });
        }
    };

    // ยืนยันแก้ปัญหาแล้ว
    const handleResolveIssue = async (orderId) => {
        try {
            const result = await Swal.fire({
                title: "ยืนยันการแก้ไขปัญหา?",
                text: "เมื่อยืนยันแล้ว รายการนี้จะถูกปิดปัญหาและสถานะจะกลับเป็นปกติ",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "ยืนยัน",
                cancelButtonText: "ยกเลิก",
            });

            if (!result.isConfirmed) return;

            const res = await axios.post(`http://localhost:3001/orders/resolve-issue/${orderId}`);

            if (res.data.success) {
                Swal.fire("สำเร็จ", "ปัญหานี้แก้ไขเรียบร้อยแล้ว", "success");

                //อัปเดตสถานะใน State 'orderHistory' ทันที
                setOrderHistory(prevHistory =>
                    prevHistory.map(order =>
                        order.order_id === orderId
                            ? { ...order, order_status: res.data.newStatus || "resolved" }
                            : order
                    )
                );

                // ล้าง selectedOrder 
                setSelectedOrder(null);

            } else {
                Swal.fire("เกิดข้อผิดพลาด", res.data.error || "ไม่สามารถอัปเดตสถานะได้", "error");
            }
        } catch (err) {
            console.error(err);
            Swal.fire("ผิดพลาด", "เกิดข้อผิดพลาดในการอัปเดตสถานะ", "error");
        }
    };

    // กดยืนยันคืนสินค้า
    const handleReturn = async (orderId) => {
        try {
            setIsUploading(true);

            // ดึง issue_id ล่าสุดของ order
            const resIssue = await axios.get(HOSTNAME + `/orders/issues/${orderId}`);
            const issueId = resIssue.data.issue_id;
            if (!issueId) throw new Error("ไม่พบปัญหาสำหรับคำสั่งซื้อนี้");

            const formData = new FormData();
            formData.append("issue_id", issueId);
            if (evidenceFile) formData.append("evidenceImage", evidenceFile);
            formData.append("reason", "ผู้ใช้คืนสินค้า");

            const res = await axios.post(HOSTNAME + "/orders/return", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true
            });

            Swal.fire({
                icon: "success",
                title: "คืนสินค้าแล้ว",
                text: "ระบบได้ส่งแจ้งเตือนไปยังแอดมินเรียบร้อยแล้ว กรุณารอการติดต่อจากแอดมิน",
            });

            // อัปเดต order ใน state ให้ซ่อนปุ่ม และเปลี่ยนสถานะ
            setOrders(prev =>
                prev.map(o =>
                    o.order_id === orderId
                        ? { ...o, order_status: res.data.newStatus, returned: true }
                        : o
                )
            )

            setShowReturnModal(false);
            setSelectedOrder(null);
            setEvidenceFile(null);

        } catch (error) {
            console.error("Error returning product:", error);
            Swal.fire({
                icon: "error",
                title: "เกิดข้อผิดพลาด",
                text: error.response?.data?.error || error.message,
            });
        } finally {
            setIsUploading(false);
        }
    };

    // ยกเลิกการสั่งซื้อ
    const [cancelReason, setCancelReason] = useState("");
    const handleCancel = async (orderId) => {
        try {
            const res = await axios.put(
                HOSTNAME + `/orders/cancel/${orderId}`,
                { reason: cancelReason, userId: userId }
            );

            Swal.fire("สำเร็จ", res.data.message, "success");
            setOrders(prev =>
                prev.map(o =>
                    o.order_id === orderId ? { ...o, order_status: "repeal" } : o
                )
            );

            setCancelReason("");
            setShowCancelModal(false);
        } catch (err) {
            Swal.fire("ผิดพลาด", err.response?.data?.message || "ไม่สามารถยกเลิกได้", "error");
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
            const res = await axios.post(HOSTNAME + "/users/update-profile-image", formData, {
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


    useEffect(() => {
        // ดัก event ของ bootstrap collapse
        const handleShow = (e) => {
            const idx = e.target.id.split('-')[1]; // ดึง index จาก id
            setSelectedOrder(orderHistory[idx]);   
        };

        const handleHide = () => {
            setSelectedOrder(null); // ปิด collapse
        };

        const collapses = document.querySelectorAll('.collapse');
        collapses.forEach((el) => {
            el.addEventListener('show.bs.collapse', handleShow);
            el.addEventListener('hide.bs.collapse', handleHide);
        });

        return () => {
            collapses.forEach((el) => {
                el.removeEventListener('show.bs.collapse', handleShow);
                el.removeEventListener('hide.bs.collapse', handleHide);
            });
        };
    }, [orderHistory]);


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
                                                <span className={`badge rounded-pill px-2 py-1 ${BADGE_CLASS[order.order_status] || "bg-secondary text-white"}`} style={{ fontSize: "0.9rem" }}>
                                                    {ORDER_STATUS_LABEL[order.order_status] || "สถานะไม่ระบุ"}
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
                                                        <span className={`badge rounded-pill px-2 py-1 ${BADGE_CLASS[order.order_status] || "bg-secondary text-white"}`} style={{ fontSize: "0.9rem" }}>
                                                            {ORDER_STATUS_LABEL[order.order_status] || "สถานะไม่ระบุ"}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Shipping Address */}
                                                <small className="text-muted d-block mb-2">ที่อยู่จัดส่ง</small>
                                                <div className="mb-3 p-2 border rounded bg-white d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <p className="mb-1 fw-semibold">
                                                            {order.full_name}  <span className="mb-1 fw-light fs-6 text-secondary">
                                                                (+66) {order.phone || "ไม่ระบุ"}
                                                            </span>
                                                        </p>

                                                        <p className="mb-0 fw-semibold ">
                                                            {formatFullAddress(order)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <button
                                                            className="btn btn-outline-secondary btn-sm"
                                                            onClick={() => {
                                                                const textToCopy = `${order.full_name} (+66) ${order.phone || ""}, ${formatFullAddress(order)}`;
                                                                navigator.clipboard.writeText(textToCopy)
                                                                    .then(() => alert("คัดลอกที่อยู่เรียบร้อยแล้ว"))
                                                                    .catch(err => console.error("คัดลอกไม่สำเร็จ:", err));
                                                            }}
                                                        >
                                                            คัดลอก
                                                        </button>
                                                    </div>
                                                </div>

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

                                                {/* Products Grid */}
                                                <div className="mb-3">
                                                    <small className="text-muted d-block mb-2">สินค้าในคำสั่งซื้อ ({order.products.length} รายการ)</small>
                                                    <div className="row g-2">
                                                        {order.products.map((prod, i) => (
                                                            <div className="col-6 col-md-4 col-lg-3" key={i}>
                                                                <div className="card border-0 bg-white shadow-sm h-100 rounded-2">
                                                                    <div className="position-relative">
                                                                        <img
                                                                            src={prod.image ? HOSTNAME + `/uploads/${prod.image}` : HOSTNAME + "/uploads/default-product.png"}
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

                                                {/* สถานะการจัดส่ง */}
                                                <div className="text-end">
                                                    {/* กำลังจัดส่ง / แจ้งปัญหา */}
                                                    {(order.order_status === "shipping" || order.order_status === "resend_processing") && (
                                                        <>
                                                            <button
                                                                className="btn btn-danger btn-sm px-3"
                                                                onClick={() => handleReportIssue(order)}
                                                            >
                                                                แจ้งปัญหา
                                                            </button>

                                                            <button
                                                                className="btn btn-success btn-sm px-3 me-2"
                                                                onClick={() => openConfirmModal(order.order_id)}
                                                            >
                                                                ยืนยันได้รับสินค้าแล้ว
                                                            </button>
                                                        </>
                                                    )}

                                                    {/* ฟอร์มแจ้งปัญหา */}
                                                    {showReportModal && selectedOrder && (
                                                        <div className="modal-backdrop" onClick={handleBackdropClick}>
                                                            <div className="modal-reupload">
                                                                {/* Modal Header */}
                                                                <div className="modal-header">
                                                                    <h5 className="modal-title">แจ้งปัญหาการสั่งซื้อ</h5>
                                                                    <button
                                                                        type="button"
                                                                        className="close-btn"
                                                                        onClick={() => setShowReportModal(false)}
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                </div>

                                                                {/* Modal Body */}
                                                                <div className="modal-body-issue">
                                                                    <form onSubmit={handleReportSubmit}>
                                                                        {/* ประเภทปัญหา */}
                                                                        <div className="mb-3 text-start">
                                                                            <label className="form-label">ประเภทปัญหา</label>
                                                                            <select
                                                                                className="form-select"
                                                                                value={issueType}
                                                                                onChange={(e) => setIssueType(e.target.value)}
                                                                                required
                                                                            >
                                                                                <option value="">-- เลือกประเภทปัญหา --</option>
                                                                                <option value="not_received">ไม่ได้รับสินค้า</option>
                                                                                <option value="damaged">สินค้าเสียหาย</option>
                                                                                <option value="wrong_item">ได้รับสินค้าผิด</option>
                                                                                <option value="other">อื่น ๆ</option>
                                                                            </select>
                                                                        </div>

                                                                        {/* ตัวเลือกวิธีแก้ไข */}
                                                                        <div className="mb-3 text-start">
                                                                            <label className="form-label">ต้องการดำเนินการ</label>
                                                                            <div className="form-check">
                                                                                <input
                                                                                    className="form-check-input"
                                                                                    type="checkbox"
                                                                                    id="refund"
                                                                                    checked={resolutionOptions.includes("refund")}
                                                                                    onChange={() => toggleResolutionOption("refund")}
                                                                                />
                                                                                <label className="form-check-label" htmlFor="refund">
                                                                                    ขอคืนเงิน
                                                                                </label>
                                                                            </div>
                                                                            <div className="form-check">
                                                                                <input
                                                                                    className="form-check-input"
                                                                                    type="checkbox"
                                                                                    id="return"
                                                                                    checked={resolutionOptions.includes("return")}
                                                                                    onChange={() => toggleResolutionOption("return")}
                                                                                />
                                                                                <label className="form-check-label" htmlFor="return">
                                                                                    ขอคืนสินค้า
                                                                                </label>
                                                                            </div>
                                                                            {/* ข้อความเตือน */}
                                                                            {(resolutionOptions.includes("refund") || resolutionOptions.includes("return")) && (
                                                                                <div className="alert alert-warning mt-2 p-2 small">
                                                                                    กรุณาส่งสินค้าคืนก่อน จากนั้นแอดมินจะตรวจสอบและดำเนินการคืนเงินให้ภายหลัง
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {/* รายละเอียดเพิ่มเติม */}
                                                                        <div className="mb-3 text-start">
                                                                            <label className="form-label">รายละเอียดเพิ่มเติม</label>
                                                                            <textarea
                                                                                className="form-control w-100"
                                                                                rows="3"
                                                                                value={issueDescription}
                                                                                onChange={(e) => setIssueDescription(e.target.value)}
                                                                                placeholder="อธิบายปัญหา..."
                                                                                required
                                                                            />
                                                                        </div>

                                                                        {/* ข้อมูลติดต่อ */}
                                                                        <div className="mb-3 text-start">
                                                                            <label className="form-label">ข้อมูลติดต่อ</label>
                                                                            <input
                                                                                className="form-control w-100"
                                                                                rows="3"
                                                                                value={contacted}
                                                                                onChange={(e) => setContacted(e.target.value)}
                                                                                placeholder="เบอร์โทร หรือ อีเมล"
                                                                                required
                                                                            />
                                                                        </div>

                                                                        {/* แนบหลักฐาน */}
                                                                        <div className="mb-3 text-start">
                                                                            <label className="form-label">แนบหลักฐาน (ถ้ามี)</label>
                                                                            <input
                                                                                type="file"
                                                                                className="form-control w-100"
                                                                                accept="image/*,application/pdf"
                                                                                onChange={(e) => setEvidenceFile(e.target.files[0])}
                                                                            />
                                                                        </div>

                                                                        {/* Preview */}
                                                                        {evidenceFile && (
                                                                            <div className="file-preview mt-2 p-2 border rounded">
                                                                                <div className="d-flex align-items-center gap-2">
                                                                                    <div className="fw-bold">{evidenceFile.name}</div>
                                                                                    <button
                                                                                        type="button"
                                                                                        className="btn-close"
                                                                                        onClick={() => setEvidenceFile(null)}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {/* Modal Footer */}
                                                                        <div className="modal-footer mt-3">
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-secondary"
                                                                                onClick={() => setShowReportModal(false)}
                                                                                disabled={isUploading}
                                                                            >
                                                                                ยกเลิก
                                                                            </button>
                                                                            <button
                                                                                type="submit"
                                                                                className="btn btn-danger"
                                                                                disabled={isUploading}
                                                                            >
                                                                                {isUploading ? "กำลังส่ง..." : "ส่งปัญหา"}
                                                                            </button>
                                                                        </div>
                                                                    </form>
                                                                </div>

                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* คืนสินค้า */}
                                                    {showReturnModal && selectedOrder && (
                                                        <div className="modal-backdrop">
                                                            <div className="modal-reupload">
                                                                <div className="modal-header">
                                                                    <h5 className="modal-title">คืนสินค้า</h5>
                                                                    <button
                                                                        type="button"
                                                                        className="close-btn"
                                                                        onClick={() => setShowReturnModal(false)}
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                </div>

                                                                {/* Modal Body */}
                                                                <div className="modal-body">
                                                                    <div className="mb-3 text-start">
                                                                        <label className="form-label fw-bold">ชื่อสินค้า</label>
                                                                        <p>{selectedOrder.product_name}</p>
                                                                    </div>

                                                                    <div className="mb-3 text-start">
                                                                        <label className="form-label fw-bold">ที่อยู่จัดส่ง</label>
                                                                        <p>{selectedOrder.address}</p>
                                                                    </div>

                                                                    <div className="mb-3 text-start">
                                                                        <label className="form-label fw-bold">แนบหลักฐาน (ถ้ามี)</label>
                                                                        <input
                                                                            type="file"
                                                                            className="form-control w-100"
                                                                            accept="image/*,application/pdf"
                                                                            onChange={(e) => setEvidenceFile(e.target.files[0])}
                                                                        />
                                                                    </div>

                                                                    {evidenceFile && (
                                                                        <div className="file-preview mt-2 p-2 border rounded">
                                                                            <div className="d-flex align-items-center gap-2">
                                                                                <div className="fw-bold">{evidenceFile.name}</div>
                                                                                <button
                                                                                    type="button"
                                                                                    className="btn-close"
                                                                                    onClick={() => setEvidenceFile(null)}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* Modal Footer */}
                                                                    <div className="modal-footer mt-3">
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-secondary"
                                                                            onClick={() => setShowReturnModal(false)}
                                                                            disabled={isUploading}
                                                                        >
                                                                            ยกเลิก
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-primary"
                                                                            onClick={() => handleReturn(selectedOrder.order_id)}
                                                                            disabled={isUploading}
                                                                        >
                                                                            {isUploading ? "กำลังบันทึก..." : "บันทึก"}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {selectedOrder && selectedOrder.products && selectedOrder.order_status === "issue_reported" && !selectedOrder.returned && (
                                                        <div className="mt-3">
                                                            {selectedOrder.products.some(p => p.is_official === 0) ? (
                                                                // มีสินค้าผู้ขายทั่วไป
                                                                <button
                                                                    className="btn btn-success btn-sm px-3"
                                                                    onClick={() => handleResolveIssue(selectedOrder.order_id)}
                                                                >
                                                                    แก้ไขแล้ว
                                                                </button>

                                                            ) : (
                                                                // มีแต่สินค้าสมาคม
                                                                <button
                                                                    className="btn btn-secondary btn-sm px-3"
                                                                    onClick={() => setShowReturnModal(true)}
                                                                >
                                                                    คืนสินค้า
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}





                                                    {/* ยกเลิกการสั่งซื้อ */}
                                                    <div>
                                                        {order.order_status === "processing" && (
                                                            <button
                                                                className="btn btn-danger btn-sm px-3"
                                                                onClick={() => {
                                                                    setSelectedOrder(order);
                                                                    setShowCancelModal(true);
                                                                }}
                                                            >
                                                                ยกเลิกการสั่งซื้อ
                                                            </button>
                                                        )}

                                                        {showCancelModal && selectedOrder && (
                                                            <div className="modal-backdrop">
                                                                <div className="modal-reupload">
                                                                    <div className="modal-header">
                                                                        <h5 className="modal-title">ยกเลิกการสั่งซื้อ</h5>
                                                                        <button
                                                                            type="button"
                                                                            className="close-btn"
                                                                            onClick={() => setShowCancelModal(false)}
                                                                        >
                                                                            ✕
                                                                        </button>
                                                                    </div>

                                                                    <div className="modal-body">
                                                                        {/* วันที่สั่งซื้อ */}
                                                                        <div className="mb-3 text-start">
                                                                            <label className="form-label fw-bold">วันที่สั่งซื้อ</label>
                                                                            <p>
                                                                                {selectedOrder.order_date
                                                                                    ? `${formatDate(selectedOrder.order_date)}`
                                                                                    : "ยังไม่ทราบวันที่สั่งซื้อ"}
                                                                            </p>
                                                                        </div>

                                                                        {/* สินค้า */}
                                                                        <div className="mb-3 text-start">
                                                                            <label className="form-label fw-bold">สินค้า</label>
                                                                            <p>{selectedOrder.product_name}</p>
                                                                        </div>

                                                                        {/* ที่อยู่จัดส่ง */}
                                                                        <div className="mb-3 text-start">
                                                                            <label className="form-label fw-bold">ที่อยู่จัดส่ง</label>
                                                                            <p>{selectedOrder.address}</p>
                                                                        </div>

                                                                        {/* เหตุผล */}
                                                                        <div className="mb-3 text-start">
                                                                            <label className="form-label fw-bold">เหตุผล/ปัญหาที่เจอ</label>
                                                                            <textarea
                                                                                className="form-control w-100"
                                                                                value={cancelReason}
                                                                                onChange={(e) => setCancelReason(e.target.value)}
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    <div className="modal-footer mt-3">
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-secondary"
                                                                            onClick={() => setShowCancelModal(false)}
                                                                        >
                                                                            ยกเลิก
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-primary"
                                                                            onClick={() => handleCancel(selectedOrder.order_id)}
                                                                        >
                                                                            ตกลง
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* โดนปฏิเสธการชำระเงิน */}
                                                    <div>
                                                        {order.order_status === "cancelled" && (
                                                            <button
                                                                className="btn btn-warning btn-sm px-3"
                                                                onClick={() => {
                                                                    setCurrentOrderId(order.order_id);
                                                                    setShowUploadModal(true);
                                                                }}
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
                                                                            onClick={() => setShowUploadModal(false)}
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

                                                    {/* จัดส่งสำเร็จ */}
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

            {/* ยืนยันได้รับสินค้าแล้ว */}
            {showProofModal && (
                <div
                    className="modal-backdrop"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1050
                    }}
                    onClick={(e) => {
                        if (e.target.classList.contains("modal-backdrop")) {
                            setShowProofModal(false);
                        }
                    }}
                >
                    <div
                        className="modal-reupload"
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            maxWidth: '500px',
                            width: '90%',
                            maxHeight: '80vh',
                            overflow: 'auto'
                        }}
                    >
                        <div className="modal-header" style={{ padding: '1rem', borderBottom: '1px solid #dee2e6' }}>
                            <h5 className="modal-title">ยืนยันการรับสินค้า</h5>
                            <button
                                type="button"
                                className="close-btn"
                                onClick={() => setShowProofModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer'
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="modal-body" style={{ padding: '1rem' }}>
                            <div className="alert alert-info mb-3">
                                <small>
                                    <strong>หมายเหตุ:</strong> กรุณาอัปโหลดรูปภาพหลักฐานการได้รับสินค้า 
                                    (เช่น รูปถ่ายสินค้าที่ได้รับ หรือหลักฐานการเซ็นรับสินค้า)
                                </small>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">
                                    อัปโหลดรูปภาพหลักฐาน (ถ้ามี)
                                </label>
                                <input
                                    type="file"
                                    className="form-control"
                                    accept="image/*"
                                    onChange={handleProofFileChange}
                                    disabled={isProofUploading}
                                />
                                <small className="text-muted">รองรับไฟล์: JPG, PNG (ไม่เกิน 5MB)</small>
                            </div>

                            {proofFile && (
                                <div className="mt-3">
                                    <label className="form-label">ตัวอย่างรูปภาพ:</label>
                                    <div style={{ textAlign: 'center' }}>
                                        <img
                                            src={URL.createObjectURL(proofFile)}
                                            alt="proof preview"
                                            style={{
                                                maxWidth: "100%",
                                                maxHeight: "300px",
                                                borderRadius: '4px',
                                                border: '1px solid #dee2e6'
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer" style={{ padding: '1rem', borderTop: '1px solid #dee2e6' }}>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setShowProofModal(false)}
                                disabled={isProofUploading}
                            >
                                ยกเลิก
                            </button>
                            <button
                                type="button"
                                className="btn btn-success"
                                onClick={handleProofSubmit}
                                disabled={isProofUploading}
                            >
                                {isProofUploading ? "กำลังอัปโหลด..." : "ยืนยันการรับสินค้า"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

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
    pending_verification: "text-dark bg-secondary bg-opacity-10", 
    processing: "text-warning bg-warning bg-opacity-10",          
    shipping: "text-primary bg-primary bg-opacity-10",            
    delivered: "text-success bg-success bg-opacity-10",
    resolved: "text-success bg-success bg-opacity-10",        
    issue_reported: "text-white bg-danger",                       
    refund_approved: "text-success bg-success bg-opacity-10",          
    resend_processing: "text-primary bg-primary bg-opacity-10",    
    issue_rejected: "text-danger bg-danger bg-opacity-25",        
    return_pending: "text-warning bg-warning bg-opacity-10",         
    return_approved: "text-success bg-success bg-opacity-10",     
    return_rejected: "text-danger bg-danger bg-opacity-25",
    cancelled: "text-dark bg-dark bg-opacity-25",
    repeal_pending: "text-dark bg-dark bg-opacity-25",
    repeal_approved: "text-success bg-success bg-opacity-10",
    repeal_rejected: "text-danger bg-danger bg-opacity-25",
};

export default PresidentProfileSouvenir;
