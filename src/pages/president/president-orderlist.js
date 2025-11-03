// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { HOSTNAME } from "../../config";
// import { 
//     FaChevronLeft, 
//     FaShoppingCart, 
//     FaBoxOpen,
//     FaClock,
//     FaCheckCircle,
//     FaTimesCircle,
//     FaSearch,
//     FaFilter
// } from "react-icons/fa";
// import "../../css/DonationSummaryDetail.css";

// function PresidentOrdersList() {
//     const navigate = useNavigate();
//     const [orders, setOrders] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [searchTerm, setSearchTerm] = useState("");
//     const [filterStatus, setFilterStatus] = useState("all");

//     const statusMap = {
//         pending: { label: "รอดำเนินการ", color: "#f59e0b", icon: FaClock },
//         processing: { label: "กำลังดำเนินการ", color: "#3b82f6", icon: FaBoxOpen },
//         completed: { label: "สำเร็จ", color: "#10b981", icon: FaCheckCircle },
//         cancelled: { label: "ยกเลิก", color: "#ef4444", icon: FaTimesCircle }
//     };

//     // โหลดข้อมูลคำสั่งซื้อ
//     useEffect(() => {
//         setLoading(true);
//         axios
//             .get(`${HOSTNAME}/souvenir/orders`, { withCredentials: true })
//             .then((response) => {
//                 // ปรับโครงสร้างข้อมูลให้เหมาะสม
//                 const orderData = Array.isArray(response.data) ? response.data : [];
//                 const formattedOrders = orderData.map(order => ({
//                     order_id: order.order_id || order.id,
//                     customer_name: order.customer_name || order.full_name || "ไม่ระบุชื่อ",
//                     customer_email: order.customer_email || order.email,
//                     customer_phone: order.customer_phone || order.phone,
//                     items: order.items || [],
//                     total_amount: parseFloat(order.total_amount || order.total_price || 0),
//                     order_status: order.order_status || order.status || "pending",
//                     order_date: order.order_date || order.created_at,
//                     shipping_address: order.shipping_address || order.address,
//                     payment_method: order.payment_method || "โอนเงิน",
//                     tracking_number: order.tracking_number || ""
//                 }));
//                 setOrders(formattedOrders);
//             })
//             .catch((error) => {
//                 console.error("เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ:", error);
//                 setOrders([]);
//             })
//             .finally(() => setLoading(false));
//     }, []);

//     const formatCurrency = (num) => new Intl.NumberFormat("th-TH").format(num || 0);
    
//     const formatDate = (dateStr) => {
//         if (!dateStr) return "-";
//         return new Date(dateStr).toLocaleString("th-TH", {
//             year: "numeric",
//             month: "long",
//             day: "numeric",
//             hour: "2-digit",
//             minute: "2-digit"
//         });
//     };

//     // กรองข้อมูล
//     const filteredOrders = orders.filter(order => {
//         const matchSearch = 
//             order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             order.order_id.toString().includes(searchTerm) ||
//             (order.customer_email && order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()));
        
//         const matchStatus = filterStatus === "all" || order.order_status === filterStatus;
        
//         return matchSearch && matchStatus;
//     });

//     // คำนวณสถิติ
//     const statistics = {
//         total: orders.length,
//         pending: orders.filter(o => o.order_status === "pending").length,
//         processing: orders.filter(o => o.order_status === "processing").length,
//         completed: orders.filter(o => o.order_status === "completed").length,
//         cancelled: orders.filter(o => o.order_status === "cancelled").length,
//         totalAmount: orders.reduce((sum, o) => sum + o.total_amount, 0)
//     };

//     if (loading) {
//         return (
//             <div className="donation-summary-detail-page">
//                 <div className="loading-spinner">กำลังโหลดข้อมูล...</div>
//             </div>
//         );
//     }

//     return (
//         <div className="donation-summary-detail-page">
//             <button className="btn-back-modern" onClick={() => navigate(-1)}>
//                 <FaChevronLeft /> กลับ
//             </button>

//             <div className="detail-page-header">
//                 <div className="header-content">
//                     <h1><FaShoppingCart style={{ marginRight: '0.5rem' }} />รายการสินค้าที่ขายไป</h1>
//                     <p className="header-subtitle">จัดการและติดตามคำสั่งซื้อทั้งหมด</p>
//                 </div>
//             </div>

//             {/* สถิติคำสั่งซื้อ */}
//             <div className="summary-cards-row" style={{ 
//                 display: 'grid', 
//                 gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
//                 gap: '1rem', 
//                 marginBottom: '2rem' 
//             }}>
//                 <div className="summary-card-small">
//                     <div className="summary-card-icon" style={{ backgroundColor: '#8b5cf6' }}>
//                         <FaShoppingCart />
//                     </div>
//                     <div className="summary-card-info">
//                         <h3>{statistics.total}</h3>
//                         <p>คำสั่งซื้อทั้งหมด</p>
//                     </div>
//                 </div>

//                 <div className="summary-card-small">
//                     <div className="summary-card-icon" style={{ backgroundColor: '#f59e0b' }}>
//                         <FaClock />
//                     </div>
//                     <div className="summary-card-info">
//                         <h3>{statistics.pending}</h3>
//                         <p>รอดำเนินการ</p>
//                     </div>
//                 </div>

//                 <div className="summary-card-small">
//                     <div className="summary-card-icon" style={{ backgroundColor: '#3b82f6' }}>
//                         <FaBoxOpen />
//                     </div>
//                     <div className="summary-card-info">
//                         <h3>{statistics.processing}</h3>
//                         <p>กำลังดำเนินการ</p>
//                     </div>
//                 </div>

//                 <div className="summary-card-small">
//                     <div className="summary-card-icon" style={{ backgroundColor: '#10b981' }}>
//                         <FaCheckCircle />
//                     </div>
//                     <div className="summary-card-info">
//                         <h3>{statistics.completed}</h3>
//                         <p>สำเร็จแล้ว</p>
//                     </div>
//                 </div>

//                 <div className="summary-card-small" style={{ gridColumn: 'span 1' }}>
//                     <div className="summary-card-icon" style={{ backgroundColor: '#10b981' }}>
//                         <FaShoppingCart />
//                     </div>
//                     <div className="summary-card-info">
//                         <h3>฿{formatCurrency(statistics.totalAmount)}</h3>
//                         <p>ยอดขายรวม</p>
//                     </div>
//                 </div>
//             </div>

//             {/* ค้นหาและกรอง */}
//             <div style={{ 
//                 display: 'flex', 
//                 gap: '1rem', 
//                 marginBottom: '1.5rem',
//                 flexWrap: 'wrap'
//             }}>
//                 <div style={{ flex: '1', minWidth: '200px', position: 'relative' }}>
//                     <FaSearch style={{ 
//                         position: 'absolute', 
//                         left: '12px', 
//                         top: '50%', 
//                         transform: 'translateY(-50%)',
//                         color: '#9ca3af'
//                     }} />
//                     <input
//                         type="text"
//                         placeholder="ค้นหาชื่อลูกค้า, อีเมล, หมายเลขคำสั่งซื้อ..."
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                         style={{
//                             width: '100%',
//                             padding: '0.75rem 1rem 0.75rem 2.5rem',
//                             border: '1px solid #e5e7eb',
//                             borderRadius: '8px',
//                             fontSize: '0.95rem'
//                         }}
//                     />
//                 </div>

//                 <div style={{ minWidth: '200px' }}>
//                     <select
//                         value={filterStatus}
//                         onChange={(e) => setFilterStatus(e.target.value)}
//                         style={{
//                             width: '100%',
//                             padding: '0.75rem 1rem',
//                             border: '1px solid #e5e7eb',
//                             borderRadius: '8px',
//                             fontSize: '0.95rem',
//                             cursor: 'pointer'
//                         }}
//                     >
//                         <option value="all">ทุกสถานะ</option>
//                         <option value="pending">รอดำเนินการ</option>
//                         <option value="processing">กำลังดำเนินการ</option>
//                         <option value="completed">สำเร็จ</option>
//                         <option value="cancelled">ยกเลิก</option>
//                     </select>
//                 </div>
//             </div>

//             {/* รายการคำสั่งซื้อ */}
//             <div className="recent-donors-section">
//                 <div className="recent-donors-header">
//                     <FaShoppingCart />
//                     <h4>รายการคำสั่งซื้อ ({filteredOrders.length})</h4>
//                 </div>

//                 {filteredOrders.length > 0 ? (
//                     <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
//                         {filteredOrders.map((order) => {
//                             const StatusIcon = statusMap[order.order_status]?.icon || FaClock;
//                             const statusColor = statusMap[order.order_status]?.color || "#6b7280";
//                             const statusLabel = statusMap[order.order_status]?.label || order.order_status;

//                             return (
//                                 <div 
//                                     key={order.order_id} 
//                                     style={{
//                                         backgroundColor: '#fff',
//                                         border: '1px solid #e5e7eb',
//                                         borderRadius: '12px',
//                                         padding: '1.5rem',
//                                         cursor: 'pointer',
//                                         transition: 'all 0.2s',
//                                         boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
//                                     }}
//                                     onClick={() => navigate(`/orders/${order.order_id}`)}
//                                     onMouseEnter={(e) => {
//                                         e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
//                                         e.currentTarget.style.transform = 'translateY(-2px)';
//                                     }}
//                                     onMouseLeave={(e) => {
//                                         e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
//                                         e.currentTarget.style.transform = 'translateY(0)';
//                                     }}
//                                 >
//                                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
//                                         <div>
//                                             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
//                                                 <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>
//                                                     คำสั่งซื้อ #{order.order_id}
//                                                 </h3>
//                                                 <span style={{
//                                                     display: 'inline-flex',
//                                                     alignItems: 'center',
//                                                     gap: '0.25rem',
//                                                     padding: '0.25rem 0.75rem',
//                                                     backgroundColor: statusColor + '20',
//                                                     color: statusColor,
//                                                     borderRadius: '20px',
//                                                     fontSize: '0.85rem',
//                                                     fontWeight: '600'
//                                                 }}>
//                                                     <StatusIcon size={12} />
//                                                     {statusLabel}
//                                                 </span>
//                                             </div>
//                                             <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>
//                                                 {formatDate(order.order_date)}
//                                             </p>
//                                         </div>
//                                         <div style={{ textAlign: 'right' }}>
//                                             <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
//                                                 ฿{formatCurrency(order.total_amount)}
//                                             </div>
//                                         </div>
//                                     </div>

//                                     <div style={{ 
//                                         display: 'grid', 
//                                         gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
//                                         gap: '1rem',
//                                         padding: '1rem',
//                                         backgroundColor: '#f9fafb',
//                                         borderRadius: '8px'
//                                     }}>
//                                         <div>
//                                             <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0 0 0.25rem 0' }}>ชื่อลูกค้า</p>
//                                             <p style={{ fontSize: '0.95rem', fontWeight: '600', margin: 0 }}>{order.customer_name}</p>
//                                         </div>
//                                         {order.customer_phone && (
//                                             <div>
//                                                 <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0 0 0.25rem 0' }}>เบอร์โทร</p>
//                                                 <p style={{ fontSize: '0.95rem', fontWeight: '600', margin: 0 }}>{order.customer_phone}</p>
//                                             </div>
//                                         )}
//                                         {order.items && order.items.length > 0 && (
//                                             <div>
//                                                 <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0 0 0.25rem 0' }}>รายการสินค้า</p>
//                                                 <p style={{ fontSize: '0.95rem', fontWeight: '600', margin: 0 }}>
//                                                     {order.items.length} รายการ
//                                                 </p>
//                                             </div>
//                                         )}
//                                         {order.tracking_number && (
//                                             <div>
//                                                 <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0 0 0.25rem 0' }}>เลขพัสดุ</p>
//                                                 <p style={{ fontSize: '0.95rem', fontWeight: '600', margin: 0 }}>{order.tracking_number}</p>
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>
//                             );
//                         })}
//                     </div>
//                 ) : (
//                     <div style={{ 
//                         textAlign: 'center', 
//                         padding: '3rem', 
//                         color: '#9ca3af' 
//                     }}>
//                         <FaShoppingCart size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
//                         <p style={{ fontSize: '1.1rem' }}>
//                             {searchTerm || filterStatus !== "all" 
//                                 ? "ไม่พบคำสั่งซื้อที่ตรงกับการค้นหา" 
//                                 : "ยังไม่มีคำสั่งซื้อ"}
//                         </p>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }

// export default PresidentOrdersList;