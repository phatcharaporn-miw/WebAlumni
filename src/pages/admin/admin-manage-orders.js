import { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import '../../css/admin-manage-order.css';
import Swal from 'sweetalert2';

Modal.setAppElement('#root');

function AdminOrderManager() {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderDetails, setOrderDetails] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("all");

    // จัดการปัญหา
    const [issueOrders, setIssueOrders] = useState([]);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [resolutionType, setResolutionType] = useState("");
    const [resolutionNote, setResolutionNote] = useState("");
    const [issueModalOpen, setIssueModalOpen] = useState(false);

    const navigate = useNavigate();

    const fetchOrders = () => {
        axios.get('http://localhost:3001/orders/admin/orders-user')
            .then(res => {
                if (res.data.success && Array.isArray(res.data.data)) {
                    setOrders(res.data.data);
                } else {
                    setOrders([]);
                }
            })
            .catch(err => console.error(err));
    };

    const fetchOrderDetails = (orderId) => {
        axios.get(`http://localhost:3001/orders/admin/orders-detail/${orderId}`)
            .then(res => {
                if (res.data.success) {
                    // console.log("Order details fetched successfully:", res.data.data);

                    const order = res.data.data;

                    // เซ็ตทั้ง order และ products (จาก order.items)
                    setOrderDetails(order);

                    setSelectedOrder({
                        ...order,
                        products: order.items
                    });
                } else {
                    setOrderDetails(null);
                    setSelectedOrder(null);
                }
            })
            .catch(err => {
                console.error(err);
                setOrderDetails(null);
                setSelectedOrder(null);
            });
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleUpdate = (orderId) => {
        const status = document.getElementById(`status-${orderId}`)?.value;
        const tracking = document.getElementById(`track-${orderId}`)?.value;

        if (!status) return alert("กรุณาเลือกสถานะ");

        axios.put(`http://localhost:3001/admin/orders-status/${orderId}`, {
            order_status: status,
            tracking_number: tracking || null,
        })
            .then(res => {
                if (res.data.success) {
                    alert('อัปเดตคำสั่งซื้อเรียบร้อยแล้ว');

                    // อัปเดต state orders แบบเรียลไทม์
                    setOrders(prevOrders =>
                        prevOrders.map(order =>
                            order.order_id === orderId
                                ? { ...order, order_status: status, tracking_number: tracking || null }
                                : order
                        )
                    );

                } else {
                    alert('เกิดข้อผิดพลาดในการอัปเดต');
                }
            })
            .catch(err => {
                console.error(err);
                alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
            });
    };


    // ฟังก์ชันดึงคำสั่งซื้อที่มีปัญหา
    const fetchIssueOrders = () => {
        axios.get(`http://localhost:3001/admin/order-issue`,
            { withCredentials: true })
            .then(res => {
                // if (res.data.success) {
                setIssueOrders(res.data.data);
                // }
            })
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchOrders();
        fetchIssueOrders();
    }, []);

    const handleEditIssue = (issue) => {
        setSelectedIssue(issue);
        setResolutionType(issue.resolution_type || "");
        setResolutionNote(issue.resolution_note || "");
        setIssueModalOpen(true);
    };

    // ฟังก์ชันอัปเดตสถานะปัญหา
    const handleUpdateIssue = async () => {
        try {
            const res = await axios.put(
                `http://localhost:3001/admin/update-issue-status/${selectedIssue.issue_id}`,
                { resolution_type: resolutionType, resolution_note: resolutionNote },
                { withCredentials: true }
            );
            Swal.fire("สำเร็จ", res.data.message, "success");
            setIssueModalOpen(false);
            fetchOrders();
            fetchIssueOrders();
        } catch (err) {
            console.error(err);
            Swal.fire("ผิดพลาด", err.response?.data?.error || "เกิดข้อผิดพลาด", "error");
        }
    };


    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        fetchOrderDetails(order.order_id);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedOrder(null);
        navigate("/admin/souvenir/admin-manage-orders"); // ปิดแล้วกลับหน้า list
    };

    return (
        <div className="orders-container p-5">
            <h3 className="admin-title">จัดการคำสั่งซื้อ</h3>
            <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                <div className="d-flex gap-2 mb-3">
                    <button
                        className={`btn ${activeTab === "all" ? "btn-primary" : "btn-outline-primary"}`}
                        onClick={() => setActiveTab("all")}
                    >
                        ทั้งหมด {orders.length} รายการ
                    </button>
                    <button
                        className={`btn ${activeTab === "issues" ? "btn-danger" : "btn-outline-danger"}`}
                        onClick={() => setActiveTab("issues")}
                    >
                        ปัญหา {issueOrders.length} รายการ
                    </button>
                </div>
            </div>


            {(activeTab === "all" ? orders : issueOrders).length === 0 ? (
                <div className="text-center py-5">
                    <h5 className="text-muted">ไม่มีรายการคำสั่งซื้อ</h5>
                </div>
            ) : (
                <div className="accordion" id="ordersAccordion">
                    {(activeTab === "all" ? orders : issueOrders).map(order => (
                        <div className="accordion-item" key={order.order_id}>
                            <h2 className="accordion-header" id={`heading-${order.order_id}`}>
                                <button
                                    className="accordion-button collapsed"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target={`#collapse-${order.order_id}`}
                                    aria-expanded="false"
                                    aria-controls={`collapse-${order.order_id}`}
                                >
                                    <div className="d-flex flex-column">
                                        <span className="fw-bold text-primary">#{order.order_id}</span>
                                        <small className="text-muted">ผู้ขาย: {order.seller_name}</small>
                                    </div>
                                </button>
                            </h2>

                            <div
                                id={`collapse-${order.order_id}`}
                                className="accordion-collapse collapse"
                                aria-labelledby={`heading-${order.order_id}`}
                                data-bs-parent="#ordersAccordion"
                            >
                                <div className="accordion-body">
                                    <div className="mb-2">
                                        <strong>ผู้สั่งซื้อ:</strong> {order.buyer_name || 'ไม่ระบุ'}<br />
                                        <small className="text-muted">ID: {order.user_id}</small>
                                    </div>

                                    <div className="mb-2">
                                        <strong>สถานะคำสั่งซื้อ: </strong>
                                        <span className={`badge rounded-pill px-2 py-1 ${order.order_status === 'delivered' ? "text-success bg-success bg-opacity-10"
                                                : order.order_status === "shipping" ? "text-primary bg-primary bg-opacity-10"
                                                    : order.order_status === "processing" ? "text-warning bg-warning bg-opacity-10"
                                                        : order.order_status === "cancelled" ? "text-danger bg-danger bg-opacity-10"
                                                            : order.order_status === "pending_verification" ? "text-dark bg-secondary bg-opacity-10"
                                                                : "bg-secondary text-white"
                                            }`}>
                                            {order.order_status === "delivered" ? "จัดส่งสำเร็จ"
                                                : order.order_status === "shipping" ? "กำลังจัดส่ง"
                                                    : order.order_status === "processing" ? "กำลังดำเนินการ"
                                                        : order.order_status === "cancelled" ? "ยกเลิก"
                                                            : order.order_status === "pending_verification" ? "รอตรวจสอบการชำระเงิน"
                                                                : "รอชำระเงิน"}
                                        </span>
                                    </div>

                                    {activeTab !== "all" && (
                                        <>
                                            <div className="mb-2">
                                                <strong>ประเภทปัญหา:</strong> {order.issue_type}
                                            </div>
                                            <div className="mb-2">
                                                <strong>รายละเอียด:</strong> {order.description || '-'}
                                            </div>
                                            {order.evidence_path && (
                                                <div className="mb-2">
                                                    <strong>หลักฐาน:</strong><br />
                                                    <img
                                                        src={`http://localhost:3001/uploads/${order.evidence_path} `}
                                                        alt="หลักฐานปัญหา"
                                                        className="img-thumbnail"
                                                        style={{ maxWidth: '200px' }}
                                                    />
                                                </div>
                                            )}
                                        </>
                                    )}

                                    <div className="mb-2">
                                        <strong>เลขพัสดุ:</strong>
                                        <div className="input-group input-group-sm mt-1">
                                            <span className="input-group-text">
                                            </span>
                                            <input
                                                type="text"
                                                id={`track-${order.order_id}`}
                                                defaultValue={order.tracking_number || ''}
                                                className="form-control"
                                                placeholder="ใส่เลขพัสดุ..."
                                            />
                                        </div>
                                        {order.tracking_number && (
                                            <small className="text-success mt-1 d-block">
                                                <i className="fas fa-check-circle me-1"></i> มีเลขพัสดุแล้ว
                                            </small>
                                        )}
                                    </div>

                                    <div className="d-flex justify-content-end gap-2 mt-3">
                                        <button
                                            className="btn btn-sm btn-primary fw-bold"
                                            onClick={() => handleUpdate(order.order_id)}
                                        >
                                            บันทึก
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-secondary"
                                            onClick={() => handleViewDetails(order)}
                                        >
                                            ดูรายละเอียด
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                className="order-modal"
                style={{
                    overlay: { backgroundColor: "rgba(0, 0, 0, 0.75)", zIndex: 1050 },
                }}
            >
                <div className="position-relative p-4 rounded-4 bg-white shadow-lg">
                    {/* ปุ่มปิด */}
                    <button
                        className="position-absolute top-0 end-0 m-3 border-0 bg-transparent"
                        onClick={closeModal}
                        aria-label="Close"
                        style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            backdropFilter: "blur(10px)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "rgba(220,53,69,0.15)";
                            e.target.style.transform = "scale(1.1)";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "rgba(255,255,255,0.9)";
                            e.target.style.transform = "scale(1)";
                        }}
                    >
                        <span
                            style={{
                                fontSize: "20px",
                                fontWeight: "bold",
                                color: "#6c757d",
                                transition: "color 0.3s ease",
                            }}
                            onMouseEnter={(e) => (e.target.style.color = "#dc3545")}
                            onMouseLeave={(e) => (e.target.style.color = "#6c757d")}
                        >
                            ✕
                        </span>
                    </button>

                    {/* Header */}
                    <h4 className="text-center fw-bold mb-4">
                        คำสั่งซื้อ #{selectedOrder?.order_id}
                    </h4>

                    <div className="modal-body">
                        {selectedOrder ? (
                            <div className="rounded-4 shadow-sm p-3">
                                {/* สถานะ */}
                                <div className="d-flex justify-content-center mb-4">
                                    <span
                                        className={`badge rounded-pill px-2 py-1 ${selectedOrder.order_status === 'delivered'
                                            ? "text-success bg-success bg-opacity-10"
                                            : selectedOrder.order_status === "shipping"
                                                ? "text-primary bg-primary bg-opacity-10"
                                                : selectedOrder.order_status === "processing"
                                                    ? "text-warning bg-warning bg-opacity-10"
                                                    : selectedOrder.order_status === "cancelled"
                                                        ? "text-danger bg-danger bg-opacity-10"
                                                        : selectedOrder.order_status === "pending_verification"
                                                            ? "text-dark bg-secondary bg-opacity-10"
                                                            : "bg-secondary text-white"
                                            }`}
                                        style={{ fontSize: '0.8rem' }}
                                    >
                                        {selectedOrder.order_status === "delivered"
                                            ? "จัดส่งสำเร็จ"
                                            : selectedOrder.order_status === "shipping"
                                                ? "กำลังจัดส่ง"
                                                : selectedOrder.order_status === "processing"
                                                    ? "กำลังดำเนินการ"
                                                    : selectedOrder.order_status === "cancelled"
                                                        ? "ยกเลิก"
                                                        : selectedOrder.order_status === "pending_verification"
                                                            ? "รอตรวจสอบการชำระเงิน"
                                                            : "รอชำระเงิน"}
                                    </span>
                                </div>

                                {/* ข้อมูลหลัก */}
                                <div className="row g-3 mb-4">
                                    <div className="col-md-6">
                                        <div className="p-3 bg-light rounded-3 d-flex align-items-center">
                                            <div>
                                                <small className="text-muted">วันที่สั่งซื้อ</small>
                                                <div className="fw-semibold">
                                                    {selectedOrder.order_date
                                                        ? new Date(selectedOrder.order_date).toLocaleDateString(
                                                            "th-TH",
                                                            {
                                                                year: "numeric",
                                                                month: "long",
                                                                day: "numeric",
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            }
                                                        )
                                                        : "-"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="p-3 bg-light rounded-3 d-flex align-items-center">
                                            {/* <div className="bg-white rounded-circle p-2 me-3 shadow-sm">
                                                💰
                                            </div> */}
                                            <div>
                                                <small className="text-muted">ยอดรวม</small>
                                                <div className="fw-bold text-success fs-5">
                                                    ฿{Number(selectedOrder.total_amount).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ที่อยู่จัดส่ง */}
                                <div className="p-3 bg-light rounded-3 mb-3 d-flex align-items-start">
                                    {/* <div className="bg-white rounded-circle p-2 me-3 shadow-sm">🏠</div> */}
                                    <div>
                                        <small className="text-muted">ที่อยู่จัดส่ง</small>
                                        <div className="fw-semibold">{selectedOrder.shippingAddress}</div>
                                    </div>
                                </div>

                                {/* Tracking */}
                                {selectedOrder.tracking_number && (
                                    <div className="p-3 bg-light rounded-3 mb-3 d-flex align-items-start">
                                        <div>
                                            <small className="text-muted">เลขพัสดุ</small>
                                            <div className="fw-bold text-primary font-monospace">
                                                {selectedOrder.tracking_number}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* สินค้า */}
                                {selectedOrder.items &&
                                    Array.isArray(selectedOrder.items) &&
                                    selectedOrder.items.length > 0 && (
                                        <div className="mt-4">
                                            <h6 className="fw-bold mb-3">🛒 รายการสินค้า</h6>
                                            <div className="row g-3">
                                                {selectedOrder.items.map((prod, i) => (
                                                    <div className="col-md-6 col-lg-4" key={i}>
                                                        <div className="card border-0 shadow-sm h-100 rounded-3 overflow-hidden">
                                                            <div className="position-relative">
                                                                <img
                                                                    src={
                                                                        prod.image
                                                                            ? `http://localhost:3001/uploads/${prod.image}`
                                                                            : ""
                                                                    }
                                                                    alt={prod.product_name}
                                                                    className="card-img-top"
                                                                    style={{ height: "140px", objectFit: "cover" }}
                                                                />
                                                                <div className="position-absolute top-0 end-0 m-2">
                                                                    <span className="badge bg-dark bg-opacity-75 rounded-pill">
                                                                        x{prod.quantity}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="card-body p-3">
                                                                <h6
                                                                    className="card-title fw-semibold mb-2 text-truncate"
                                                                    title={prod.product_name}
                                                                >
                                                                    {prod.product_name}
                                                                </h6>
                                                                <div className="d-flex justify-content-between align-items-center">
                                                                    <small className="text-muted">
                                                                        จำนวน: {prod.quantity} ชิ้น
                                                                    </small>
                                                                    <span className="fw-bold text-primary">
                                                                        ฿{Number(prod.price).toLocaleString()}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                {issueModalOpen && selectedIssue && (
                                    <div className="modal-backdrop">
                                        <div className="modal-report p-4">
                                            <h5>ตรวจสอบ Issue #{selectedIssue.issue_id}</h5>
                                            <p>Order ID: {selectedIssue.order_id}</p>
                                            <p>ประเภทปัญหา: {selectedIssue.issue_type}</p>
                                            <p>รายละเอียด: {selectedIssue.description}</p>

                                            {selectedIssue.evidence_path && (
                                                <div className="mb-3">
                                                    <a href={`http://localhost:3001/uploads/${selectedIssue.evidence_path}`} target="_blank" rel="noreferrer">
                                                        📎 ดูหลักฐานแนบ
                                                    </a>
                                                </div>
                                            )}

                                            <div className="mb-3">
                                                <label>สถานะการแก้ไข</label>
                                                <select className="form-select" value={resolutionType} onChange={(e) => setResolutionType(e.target.value)}>
                                                    <option value="">-- เลือก --</option>
                                                    <option value="refund">คืนเงิน</option>
                                                    <option value="replacement">ส่งสินค้าใหม่</option>
                                                    <option value="rejected">ปฏิเสธ</option>
                                                </select>
                                            </div>

                                            <div className="mb-3">
                                                <label>หมายเหตุ / เหตุผล</label>
                                                <textarea className="form-control" rows="3" value={resolutionNote} onChange={(e) => setResolutionNote(e.target.value)} />
                                            </div>

                                            <div className="d-flex justify-content-end gap-2">
                                                <button className="btn btn-secondary" onClick={() => setIssueModalOpen(false)}>ยกเลิก</button>
                                                <button className="btn btn-success" onClick={handleUpdateIssue}>บันทึก</button>
                                            </div>
                                        </div>
                                    </div>
                                )}


                            </div>

                        ) : (
                            <p className="text-muted text-center">
                                กรุณาเลือกคำสั่งซื้อเพื่อดูรายละเอียด
                            </p>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AdminOrderManager;
