import { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import '../../css/admin-manage-order.css';
import Swal from 'sweetalert2';
import { HOSTNAME } from '../../config.js';
import { CiSearch } from "react-icons/ci";
import { FaSearch, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";

Modal.setAppElement('#root');

function AdminOrderManager() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [trackingStatus, setTrackingStatus] = useState({});
  // จัดการปัญหา
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [resolutionType, setResolutionType] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [activeTabInfo, setActiveTabInfo] = useState("info");
  const [trackingNumber, setTrackingNumber] = useState(selectedIssue?.tracking_number || "");
  const [refundDate, setRefundDate] = useState(""); // วันที่คืนเงิน
  const [refundNote, setRefundNote] = useState(""); // หมายเหตุเพิ่มเติม

  // tab header
  const [orders, setOrders] = useState([]);
  const [issueOrders, setIssueOrders] = useState([]);
  const [returnOrders, setReturnOrders] = useState([])

  // ตัวกรองและค้นหา
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [issueFilter, setIssueFilter] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");



  // ปีล่าสุด 5 ปี (พ.ศ.)
  const currentYear = new Date().getFullYear() + 543;
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const navigate = useNavigate();

  const fetchOrders = () => {
    axios.get(HOSTNAME + '/orders/admin/orders-user')
      .then(res => {
        if (res.data.success && Array.isArray(res.data.data)) {
          const allOrders = res.data.data;
          setOrders(allOrders);

          // filter ออกมาแยก (ใช้ setCancelOrders ที่ประกาศไว้)
          setCancelOrders(allOrders.filter(order => order.order_status === "repeal_pending" || order.order_status === "repeal_approved"));
          setReturnOrders(allOrders.filter(order => order.order_status === "return_pending"));

          // เซ็ตสถานะอัปเดตสำหรับแต่ละ order
          const statusObj = {};
          allOrders.forEach(order => {
            statusObj[order.order_id] = !!order.tracking_number;
          });
          setTrackingStatus(statusObj);
        } else {
          setOrders([]);
          setCancelOrders([]);
          setReturnOrders([]);
        }
      })
      .catch(err => console.error(err));
  };

  const fetchOrderDetails = (orderId) => {
    axios.get(HOSTNAME + `/orders/admin/orders-detail/${orderId}`)
      .then(res => {
        if (res.data.success) {
          console.log("Order details fetched successfully:", res.data.data);

          const order = res.data.data;

          // เซ็ตorder และ products (จาก order.items)
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


  const handleUpdate = (orderId, tracking) => {
    axios.post(HOSTNAME + `/orders/admin/orders-status/${orderId}`, {
      tracking_number: tracking || null,
    })
      .then(res => {
        if (res.data.success) {
          Swal.fire("คำสั่งซื้อ", "อัปเดตคำสั่งซื้อเรียบร้อยแล้ว", "success");

          const updatedOrder = res.data.updatedOrder;

          // อัปเดต state ของ orders ทันที
          setOrders(prevOrders =>
            prevOrders.map(order =>
              order.order_id === orderId
                ? {
                  ...order,
                  tracking_number: tracking || null,
                  order_status: updatedOrder?.order_status || order.order_status,
                  updated_at: new Date().toISOString() // optional อัปเดตเวลาแสดงผลทันที
                }
                : order
            )
          );

          // disable input และซ่อนปุ่มอัปเดตทันที
          setTrackingStatus(prev => ({
            ...prev,
            [orderId]: true
          }));
        } else {
          Swal.fire("คำสั่งซื้อ", "เกิดข้อผิดพลาดในการอัปเดต", "error");
        }
      })
      .catch(err => {
        console.error(err);
        Swal.fire("คำสั่งซื้อ", "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์", "error");
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ฟังก์ชันดึงคำสั่งซื้อที่มีปัญหา
  const fetchIssueOrders = () => {
    axios.get(HOSTNAME + `/admin/order-issue`, { withCredentials: true })
      .then(res => {
        if (res.data.success) {
          setIssueOrders(res.data.data);
          // console.log("Issue Orders:", res.data.data);
        }
      })
      .catch(err => console.error("Error fetching issues:", err));
  };

  useEffect(() => {
    fetchOrders();
    fetchIssueOrders();
  }, []);

  // const handleEditIssue = (issue) => {
  //   setResolutionType(issue.resolution_type || "");
  //   setResolutionNote(issue.resolution_note || "");
  //   setActiveTabInfo("info");
  //   setSelectedIssue(issue);
  //   setIssueModalOpen(true);
  // };

  const handleEditIssue = (order) => {
    const issue = order.issue || {};
    const products = order.products || [];

    const productNames = products
      .map(p => `${p.product_name || "-"} x ${p.quantity || 1}`)
      .join(", ") || "-";

    setResolutionType(issue.resolution_type || "");
    setResolutionNote(issue.resolution_note || "");
    setActiveTabInfo("info");

    setSelectedIssue({
      ...order,
      issue_id: issue.issue_id || null,
      issue_type: issue.issue_type || null,
      description: issue.description || "-",
      evidence_path: issue.evidence_path || "",
      product_names: productNames
    });

    setIssueModalOpen(true);
  };

  // Action handlers
  const handleRefundComplete = async (refundDate, refundNote) => {
    await handleUpdateIssue("refund", `คืนเงินวันที่ ${refundDate} | หมายเหตุ ${refundNote}`);
  };

  const handleGenerateTracking = async () => {
    const tracking = prompt("กรอก Tracking Number");
    if (!tracking) return;
    await handleUpdateIssue("resend", `${tracking}`);
  };

  const handleMarkDelivered = async () => {
    await handleUpdateIssue("delivered", "ส่งสินค้าเรียบร้อย");
  };

  const handleUpdateIssue = async (overrideResolutionType = null, overrideNote = null) => {
    const typeToUse = overrideResolutionType || resolutionType;
    const noteToUse = overrideNote || resolutionNote;
    const issueId = selectedIssue.issue_id; // <-- top-level

    if (!typeToUse) {
      Swal.fire("แจ้งเตือน", "กรุณาเลือกสถานะการแก้ไข", "warning");
      return;
    }

    try {
      let adminStatus;
      if (typeToUse === "refund" || typeToUse === "resend") {
        adminStatus = "approved";
      } else if (typeToUse === "rejected") {
        adminStatus = "rejected";
      } else {
        adminStatus = "resolved";
      }

      const res = await axios.put(
        `${HOSTNAME}/admin/update-issue-status/${issueId}`,
        {
          resolution_type: typeToUse,
          resolution_note: noteToUse,
          admin_status: adminStatus
        },
        { withCredentials: true }
      );

      Swal.fire("สำเร็จ", res.data.message, "success");

      // update state
      setSelectedIssue(prev => ({
        ...prev,
        admin_status: res.data.issue_status,
        resolution_type: res.data.resolution_type,
        resolution_note: res.data.resolution_note,
        order_status: res.data.order_status
      }));

      setIssueOrders(prev =>
        prev.map(issue =>
          issue.issue_id === issueId
            ? { ...issue, order_status: res.data.order_status, admin_status: res.data.issue_status }
            : issue
        )
      );

      setOrders(prev =>
        prev.map(order =>
          order.order_id === selectedIssue.order_id
            ? { ...order, order_status: res.data.order_status }
            : order
        )
      );

      setIssueModalOpen(false);
    } catch (err) {
      console.error(err);
      Swal.fire("ผิดพลาด", err.response?.data?.error || "เกิดข้อผิดพลาด", "error");
    }
  };

  const fetchReturnedOrders = () => {
    axios.get(HOSTNAME + "/admin/returned-orders", { withCredentials: true })
      .then(res => {
        if (res.data.success) {
          setReturnOrders(res.data.data);
          console.log("return Orders:", res.data);
        } else {
          setReturnOrders([]);
        }
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchReturnedOrders();
  }, []);

  // อนุมัติการส่งคืน
  const handleApproveReturn = async (returnId, orderId) => {
    try {
      await axios.put(HOSTNAME + `/admin/approve-return/${returnId}`, {
        expected_delivery_days: 5
      });
      Swal.fire("สำเร็จ", "แจ้งผู้ซื้อเรียบร้อยแล้ว", "success");
      fetchReturnedOrders(); // รีเฟรชข้อมูล

      // อัปเดต state realtime
      setReturnOrders(prev =>
        prev.map(order =>
          order.returns && order.returns.return_id === returnId
            ? {
              ...order,
              order_status: "return_approved",
              returns: { ...order.returns, admin_checked: 1 }
            }
            : order
        )
      );

    } catch (err) {
      Swal.fire("เกิดข้อผิดพลาด", err.response?.data?.error || err.message, "error");
    }
  };

  const [showResendModal, setShowResendModal] = useState(false);

  // ฟังก์ชันยืนยันคืนเงิน(สำหรับยกเลิกสินค้า)
  const handleRefundSubmit = async () => {
    if (!selectedOrderForRefund) return;

    setIsRefunding(true);
    try {
      const res = await axios.put(
        `${HOSTNAME}/admin/refund/${selectedOrderForRefund.order_id}`,
        {
          refundAmount,
          refundNote,
        },
        { withCredentials: true }
      );

      Swal.fire("สำเร็จ", res.data.message || "คืนเงินเรียบร้อยแล้ว", "success");
      closeRefundModal();

      // อัปเดต state หรือโหลดข้อมูลใหม่
      fetchReturnedOrders(); // ฟังก์ชันโหลดรายการคืนสินค้าใหม่
    } catch (err) {
      console.error(err);
      Swal.fire("ผิดพลาด", err.response?.data?.error || "เกิดข้อผิดพลาด", "error");
    } finally {
      setIsRefunding(false);
    }
  };

  // กดส่งสินค้าใหม่
  const handleResendProduct = async (orderId) => {
    try {
      const res = await axios.put(HOSTNAME + `/admin/resend/${orderId}`, {
        tracking_number: trackingNumber
      });
      Swal.fire("สำเร็จ", res.data.message, "success");

      setReturnOrders(prev =>
        prev.map(o =>
          o.order_id === orderId
            ? { ...o, order_status: "resend_processing", tracking_number: trackingNumber }
            : o
        )
      );

      setShowResendModal(false);
      setTrackingNumber("");
    } catch (err) {
      Swal.fire("ผิดพลาด", "ไม่สามารถส่งสินค้าใหม่ได้", "error");
    }
  };


  // เปิด modal ส่งสินค้าใหม่ (Safe)
  const openResendModal = (order) => {
    const productNames = (order.products || [])
      .map(p => `${p.product_name || "สินค้าไม่ระบุ"} x ${p.quantity || 1}`)
      .join(", ") || "ไม่มีข้อมูลสินค้า";

    setSelectedOrder({
      ...order,
      product_names: productNames,
      full_address: order.full_address || "ไม่ระบุที่อยู่จัดส่ง"
    });

    setShowResendModal(true);
  };

  // ยกเลิก
  const [cancelOrders, setCancelOrders] = useState([]);

  // จัดการการยกเลิกคำสั่งซื้อ
  const handleCancelAction = async (orderId, userId, action) => {
    try {
      const res = await axios.put(HOSTNAME + `/admin/cancel-manage/${orderId}`, {
        action,
        userId,
      });

      Swal.fire("สำเร็จ", res.data.message, "success");

      // อัปเดต UI ทันที
      setCancelOrders(prev =>
        prev.map(order =>
          order.order_id === orderId
            ? { ...order, order_status: action === "approve" ? "repeal_approved" : "repeal_rejected" }
            : order
        )
      );
    } catch (err) {
      Swal.fire("ผิดพลาด", err.response?.data?.message || "ดำเนินการไม่สำเร็จ", "error");
    }
  };

  // state
  const [selectedOrderForRefund, setSelectedOrderForRefund] = useState(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [isRefunding, setIsRefunding] = useState(false);

  // ฟังก์ชันเปิด Modal คืนเงิน
  const openRefundModal = (order) => {
    setSelectedOrderForRefund(order);
    setRefundAmount(order.total_amount || "");
    setRefundNote("");
    setShowRefundModal(true);
  };

  // ฟังก์ชันปิด Modal
  const closeRefundModal = () => {
    setSelectedOrderForRefund(null);
    setRefundAmount("");
    setRefundNote("");
    setShowRefundModal(false);
  };



  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    fetchOrderDetails(order.order_id);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setIssueModalOpen(false);
    setModalIsOpen(false);
    setSelectedOrder(null);
    navigate("/admin/souvenir/admin-manage-orders");
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterYear("all");
    setFilterStatus("all");
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterYear, filterStatus, issueFilter, activeTab]);

  const getBaseData = () => {
    if (activeTab === "all") return orders;
    if (activeTab === "issues_returns") {
      const returnedOrderIds = new Set(returnOrders.map(ret => ret.order_id));
      const issuesWithoutReturn = issueOrders
        .filter(issue => !returnedOrderIds.has(issue.order_id))
        .map(issue => ({ ...issue, type: 'issue', id: issue.issue_id, display_id: issue.issue_id }));
      const combined = [
        ...returnOrders.map(ret => ({ ...ret, type: 'return', id: ret.order_id, display_id: ret.order_id })),
        ...issuesWithoutReturn
      ];
      return combined;
    }
    if (activeTab === "cancel") return cancelOrders;
    return [];
  };


  const filteredOrders = (() => {
    const base = getBaseData();

    const q = searchTerm.trim().toLowerCase();

    return base
      .filter(item => {
        // search across common fields
        if (q) {
          const matchesSearch =
            String(item.order_id || "").toLowerCase().includes(q) ||
            (item.buyer_name || "").toLowerCase().includes(q) ||
            (item.seller_name || "").toLowerCase().includes(q) ||
            (item.product_name || "").toLowerCase().includes(q) ||
            (item.phone || "").toLowerCase().includes(q) ||
            (item.full_address || "").toLowerCase().includes(q) ||
            (item.issue_type || "").toLowerCase().includes(q);
          if (!matchesSearch) return false;
        }

        if (filterYear !== "all") {
          const createdYearBE = item.created_at ? (new Date(item.created_at).getFullYear() + 543).toString() : "";
          if (createdYearBE !== filterYear) return false;
        }
        // status filter
        if (filterStatus !== "all") {
          if (typeof item.order_status === "string") {
            if (item.order_status !== filterStatus) return false;
          } else {
            if (String(item.status) !== String(filterStatus)) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (typeof a.status === "number" && typeof b.status === "number") {
          const order = [2, 0, 1];
          return order.indexOf(a.status) - order.indexOf(b.status);
        }
        return 0;
      });
  })();



  const totalItems = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const pageStart = (currentPage - 1) * itemsPerPage;
  const pageEnd = currentPage * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(pageStart, pageEnd);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const normalizedOrders = paginatedOrders.map(item => ({
    ...item,
    id: item.issue_id || item.order_id,
    type: "issue",
    project_names: item.product_names,
    description: item.issue?.description,
    issue_type: item.issue?.issue_type,
    evidence_path: item.issue?.evidence_path,
    resolution_options: item.resolution_options || item.issue?.resolution_options
  }));



  return (
    <div className="orders-container p-5">
      <h3 className="admin-title">จัดการคำสั่งซื้อของสมาคม</h3>
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <div className="d-flex gap-2 mb-3">
          <button
            className={`btn ${activeTab === "all" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setActiveTab("all")}
          >
            สินค้าไม่มีปัญหา {orders.length} รายการ
          </button>
          <button
            className={`btn ${activeTab === "issues_returns" ? "btn-danger" : "btn-outline-danger"}`}
            onClick={() => setActiveTab("issues_returns")}
          >
            สินค้ามีปัญหา {(issueOrders.length + returnOrders.length)} รายการ
          </button>
          <button
            className={`btn ${activeTab === "cancel" ? "btn-warning" : "btn-outline-warning"}`}
            onClick={() => setActiveTab("cancel")}
          >
            สินค้าที่ถูกยกเลิก {cancelOrders.length} รายการ
          </button>
        </div>
      </div>

      {/* ส่วนค้นหาและฟิลเตอร์ */}
      {/* Filters */}
      <div className="donate-filters">
        <div className="row g-3">
          <div className="col-md-4">
            <label htmlFor="search" className="form-label">ค้นหา:</label>
            <div className="input-group">
              <span className="input-group-text"><FaSearch /></span>
              <input
                type="text"
                id="search"
                className="form-control"
                placeholder="ค้นหาหมายเลขคำสั่งซื้อ, ชื่อผู้สั่ง, สินค้า, เบอร์, ที่อยู่..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* สถานะ */}
          <div className="col-md-3">
            <label htmlFor="status-filter" className="form-label">สถานะ:</label>
            <select
              id="status-filter"
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">ทั้งหมด</option>
              {Object.entries(ORDER_STATUS_LABEL).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}

              <option value="2">กำลังดำเนินการ</option>
              <option value="1">เสร็จสิ้นแล้ว</option>
              <option value="0">กำลังจะจัดขึ้น</option>
            </select>
          </div>

          {/* ปี */}
          <div className="col-md-3">
            <label htmlFor="year-filter" className="form-label">ปี:</label>
            <select
              id="year-filter"
              className="form-select"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
            >
              <option value="all">ทุกปี</option>
              {yearOptions.map(y => (
                <option key={y} value={String(y)}>{y}</option>
              ))}
            </select>
          </div>

          {/* ปุ่มล้างตัวกรอง */}
          <div className="col-md-2 d-flex flex-column">
            <label className="form-label invisible">ล้าง</label>
            <button
              className="btn btn-outline-secondary"
              onClick={handleClearFilters}
              title="ล้างตัวกรอง"
            >
              <AiOutlineClose /> ล้าง
            </button>
          </div>
        </div>
      </div>

      {/* Accordion - แสดงเฉพาะคำสั่งซื้อที่มีปัญหา/ส่งคืน */}
      <div className="accordion" id="ordersAccordion">
        {/* ถ้าไม่มีข้อมูล */}
        {paginatedOrders.length === 0 ? (
          <div className="text-center py-5">
            <h5 className="text-muted">ไม่มีรายการคำสั่งซื้อ</h5>
          </div>
        ) : (
          <>
            {/*TAB: ทั้งหมด */}
            {activeTab === "all" && paginatedOrders.map(order => (
              <div className="accordion-item" key={order.order_id}>
                <h2 className="accordion-header" id={`heading-${order.order_id}`}>
                  <button className="accordion-button collapsed mb-3" data-bs-toggle="collapse" data-bs-target={`#collapse-${order.order_id}`}>
                    <div className="d-flex justify-content-between align-items-center w-100 pe-3">
                      <div className="d-flex flex-column">
                        <span className="fw-bold text-primary">สินค้า: {order.product_name}</span>
                        <small className="text-muted">ผู้ซื้อ: {order.buyer_name}</small>
                      </div>
                      <span className={`badge rounded-pill px-2 py-1 ${BADGE_CLASS[order.order_status] || "bg-secondary"}`}>
                        {ORDER_STATUS_LABEL[order.order_status] || "ไม่ระบุ"}
                      </span>
                    </div>
                  </button>
                </h2>
                <div id={`collapse-${order.order_id}`} className="accordion-collapse collapse" data-bs-parent="#ordersAccordion">
                  <div className="accordion-body">
                    {/* รายละเอียดคำสั่งซื้อ */}
                    <p><strong>วันที่สั่งซื้อ:</strong> {new Date(order.order_date).toLocaleString("th-TH")}</p>
                    <p><strong>ยอดรวม:</strong> ฿{Number(order.total_amount).toLocaleString()}</p>
                    <p><strong>ที่อยู่จัดส่ง:</strong> {order.full_address}</p>

                    <div className="input-group input-group-sm mt-2">
                      <input
  type="text"
  value={order.tracking_number || ""}
  className="form-control"
  onChange={e => {
    const val = e.target.value;
    setOrders(prev =>
      prev.map(o =>
        o.order_id === order.order_id ? { ...o, tracking_number: val } : o
      )
    );
  }}
  placeholder="กรอกเลขพัสดุ..."
  disabled={trackingStatus[order.order_id] || order.order_status === "refund_approved"} // ปิด input ถ้าเป็นคืนเงิน
/>

{!(trackingStatus[order.order_id] || order.order_status === "refund_approved") ? (
  <button
    className="btn btn-primary btn-sm"
    onClick={() => handleUpdate(order.order_id, order.tracking_number)}
  >
    บันทึก
  </button>
) : (
  <button className="btn btn-success btn-sm" disabled>
    เรียบร้อย
  </button>
)}

                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* รายการมีปัญหา */}
            {activeTab === "issues_returns" &&
              normalizedOrders
                .filter(item => item.type === "issue")
                .map(it => {
                  const key = `issue-${it.id}`;

                  return (
                    <div className="accordion-item" key={key}>
                      <h2 className="accordion-header" id={`heading-${key}`}>
                        <button
                          className="accordion-button collapsed mb-3"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target={`#collapse-${key}`}
                        >
                          <div className="d-flex justify-content-between align-items-center w-100">
                            <div className="d-flex flex-column">
                              <span className="fw-bold text-danger">
                                ปัญหา: {it.project_names}
                              </span>
                              <small className="text-muted">
                                ผู้แจ้ง: {it.buyer_name || "ไม่ระบุ"}
                              </small>
                            </div>

                            <div>
                              {it.order_status === "issue_reported" && (
                                <span className="text-danger">รอตรวจสอบ</span>
                              )}
                              {it.order_status === "return_pending" && (
                                <span className="text-warning">รอรับสินค้าคืน</span>
                              )}
                              {it.order_status === "return_approved" && (
                                <span className="text-info">รอจัดส่งสินค้าใหม่</span>
                              )}
                              {it.order_status === "resend_processing" && (
                                <span className="text-success">ส่งสินค้าใหม่แล้ว</span>
                              )}
                            </div>
                          </div>
                        </button>
                      </h2>

                      <div
                        id={`collapse-${key}`}
                        className="accordion-collapse collapse"
                        data-bs-parent="#ordersAccordion"
                      >
                        <div className="accordion-body">
                          <p>
                            <strong>รายละเอียดปัญหา:</strong>{" "}
                            {it.description || "ไม่ระบุ"}
                          </p>

                          <div className="d-flex justify-content-end gap-2 mt-3">
                            {it.order_status === "issue_reported" && (
                              <button
                                className="btn btn-warning btn-sm"
                                onClick={() => handleEditIssue(it)}
                              >
                                ตรวจสอบปัญหา
                              </button>
                            )}

                            {it.order_status === "return_pending" && (
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleApproveReturn(it.returns?.return_id, it.order_id)}
                              >
                                ยืนยันรับสินค้าคืน
                              </button>
                            )}

                            {it.order_status === "return_approved" && (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleEditIssue(it)}
                              >
                                ส่งสินค้าใหม่/คืนเงิน
                              </button>
                            )}

                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}



            {/*รายการยกเลิก */}
            {activeTab === "cancel" &&
              paginatedOrders.map(order => (
                <div className="accordion-item" key={order.order_id}>
                  <h2 className="accordion-header" id={`heading-cancel-${order.order_id}`}>
                    <button className="accordion-button collapsed" data-bs-toggle="collapse" data-bs-target={`#collapse-cancel-${order.order_id}`}>
                      <div className="d-flex justify-content-between align-items-center w-100">
                        <div>
                          <span className="fw-bold text-warning">รายการที่: {order.order_id}</span>
                        </div>
                        <span className={`badge ${order.order_status === "repeal_approved" ? "bg-success" : "bg-secondary"}`}>
                          {ORDER_STATUS_LABEL[order.order_status]}
                        </span>
                      </div>
                    </button>
                  </h2>
                  <div id={`collapse-cancel-${order.order_id}`} className="accordion-collapse collapse" data-bs-parent="#ordersAccordion">
                    <div className="accordion-body">
                      <p><strong>เหตุผล:</strong> {order.reason || "ไม่ระบุ"}</p>

                      {/* ปุ่ม Action */}
                      {order.order_status === "repeal_pending" && (
                        <div className="d-flex justify-content-end gap-2 mt-2">
                          <button className="btn btn-success btn-sm"
                            onClick={() => handleCancelAction(order.order_id, order.user_id, "approve")}>
                            ยืนยัน
                          </button>
                          <button className="btn btn-danger btn-sm"
                            onClick={() => handleCancelAction(order.order_id, order.user_id, "reject")}>
                            ปฏิเสธ
                          </button>
                        </div>
                      )}

                      {/* ถ้าอนุมัติแล้ว ให้ปุ่มคืนเงิน */}
                      {order.order_status === "repeal_approved" && (
                        <div className="d-flex justify-content-end mt-2">
                          <button className="btn btn-primary btn-sm"
                            onClick={() => openRefundModal(order)}
                          >
                            คืนเงิน
                          </button>
                        </div>
                      )}

                      {/* ถ้าปฏิเสธแล้ว */}
                      {order.order_status === "repeal_rejected" && (
                        <div className="mt-2 text-danger">
                          <p className="text-muted mt-2">คำขอยกเลิกถูกปฏิเสธ ระบบจะจัดส่งตามปกติ</p>
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              ))
            }

          </>
        )}
      </div>




      {/* Pagination */}
      <div className="donate-page-info mt-3">
        <small>
          หน้า {currentPage} จาก {totalPages} (แสดง {pageStart + 1} - {Math.min(pageEnd, totalItems)} จาก {totalItems} รายการ)
        </small>
      </div>

      {/* Pagination Buttons */}
      {totalPages > 1 && (
        <nav aria-label="Page navigation" className="donate-pagination mt-2">
          <ul className="pagination">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}><FaChevronLeft /></button>
            </li>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
              <li key={number} className={`page-item ${number === currentPage ? "active" : ""}`}>
                <button className="page-link" onClick={() => handlePageChange(number)}>{number}</button>
              </li>
            ))}

            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}><FaChevronRight /></button>
            </li>
          </ul>
        </nav>
      )}


      {/* Modal: คำสั่งซื้อที่ปกติ*/}
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
            รายการที่: {selectedOrder?.order_id}
          </h4>

          <div className="modal-body">
            {selectedOrder ? (
              <div className="rounded-4 shadow-sm p-3">
                {/* สถานะ */}
                <div className="d-flex justify-content-center mb-4">
                  <span className={`badge rounded-pill px-2 py-1 ${BADGE_CLASS[selectedOrder.order_status] || "bg-secondary text-white"}`} style={{ fontSize: "0.9rem" }}>
                    {ORDER_STATUS_LABEL[selectedOrder.order_status] || "สถานะไม่ระบุ"}
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
                  <div>
                    <small className="text-muted">ที่อยู่จัดส่ง</small>
                    <div className="fw-semibold">
                      {selectedOrder.full_address || "ไม่พบที่อยู่จัดส่ง"}
                    </div>
                    {selectedOrder.phone && (
                      <div className="text-muted">{selectedOrder.phone}</div>
                    )}
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
                                      ? HOSTNAME + `/uploads/${prod.image}`
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
              </div>
            ) : (
              <p className="text-muted text-center">
                กรุณาเลือกคำสั่งซื้อเพื่อดูรายละเอียด
              </p>
            )}
          </div>
        </div>
      </Modal>

      {/*Modal: คำสั่งซื้อที่มีปัญหา*/}
      <Modal
        isOpen={issueModalOpen}
        onRequestClose={closeModal}
        className="order-modal"
        style={{ overlay: { backgroundColor: "rgba(0, 0, 0, 0.75)", zIndex: 1050 } }}

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
          >
            <span style={{ fontSize: "20px", fontWeight: "bold", color: "#6c757d" }}>✕</span>
          </button>

          {/* หัวข้อ */}
          <h4 className="text-center fw-bold mb-4">
            รายการที่: {ISSUE_TYPE_LABEL[selectedIssue?.issue_type] || "-"}
          </h4>

          {selectedIssue && (
            <div>
              {/* ข้อมูลผู้แจ้งและสถานะ */}
              <div className="mb-3 p-3 bg-light rounded-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span><strong>ผู้แจ้ง:</strong> {selectedIssue?.buyer_name || "-"}</span>
                  <span className={`badge rounded-pill px-2 py-1 ${selectedIssue.order_status === "return_pending"
                    ? "bg-warning text-dark"
                    : selectedIssue.order_status === "return_approved"
                      ? "bg-success text-white"
                      : "bg-secondary text-white"}`}
                    style={{ fontSize: "0.9rem" }}
                  >
                    {selectedIssue.order_status === "return_pending"
                      ? "รอผู้ใช้ส่งสินค้าคืน"
                      : selectedIssue.order_status === "return_approved"
                        ? "ได้รับสินค้าคืนแล้ว"
                        : "ยังไม่เริ่มกระบวนการคืนสินค้า"}
                  </span>
                </div>
                <p><strong>สินค้า:</strong> {selectedIssue?.product_names || "-"}</p>
                <p><strong>ประเภทปัญหา:</strong> {ISSUE_TYPE_LABEL[selectedIssue?.issue_type] || "-"}</p>
                <p><strong>รายละเอียด:</strong> {selectedIssue?.description || "-"}</p>
                {selectedIssue?.evidence_path && (
                  <img
                    src={HOSTNAME + `/${selectedIssue?.evidence_path}`}
                    alt="หลักฐาน"
                    className="img-thumbnail"
                    style={{ maxWidth: "250px" }}
                  />
                )}
                {selectedIssue.resolution_options && selectedIssue.resolution_options.length > 0 && (
                  <div className="mb-3 p-3 bg-light rounded-3">
                    <h6 className="fw-bold mb-2">ความต้องการของผู้ใช้</h6>
                    <ul className="mb-0">
                      {selectedIssue.resolution_options.map((opt, idx) => (
                        <li key={idx}>
                          {RESOLUTION_LABEL[opt] || opt}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* ช่องกรอกคืนเงิน */}
              <div className="mb-3 p-3 bg-light rounded-3">
                <h6 className="fw-bold mb-2">คืนเงิน</h6>
                <div className="mb-2">
                  <label className="form-label">จำนวนเงินที่ต้องคืน</label>
                  <input type="text" className="form-control w-100" value={selectedIssue?.total_amount} disabled />
                </div>
                <div className="mb-2">
                  <label className="form-label">วันที่คืนเงิน</label>
                  <input
                    type="date"
                    className="form-control w-100"
                    value={refundDate}
                    onChange={(e) => setRefundDate(e.target.value)}
                    disabled={selectedIssue.order_status !== "return_approved"}
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">หมายเหตุเพิ่มเติม</label>
                  <textarea
                    className="form-control w-100"
                    rows={2}
                    value={refundNote}
                    onChange={(e) => setRefundNote(e.target.value)}
                    placeholder="ระบุหมายเหตุเพิ่มเติม (เช่น ช่องทางโอน / ธนาคาร)"
                    disabled={selectedIssue.order_status !== "return_approved"}
                  />
                </div>
                <button
                  className="btn btn-success mt-2"
                  disabled={selectedIssue.order_status !== "return_approved"}
                  onClick={() => handleRefundComplete(refundDate, refundNote)}
                >
                  บันทึกการคืนเงิน
                </button>
              </div>

              {/* ช่องกรอกเลขพัสดุส่งสินค้าใหม่ */}
              <div className="mb-3 p-3 bg-light rounded-3">
                <h6 className="fw-bold mb-2">ส่งสินค้าใหม่</h6>
                <div className="mb-2">
                  <label className="form-label">เลขพัสดุ / Tracking Number</label>
                  <input
                    type="text"
                    className="form-control w-100"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="กรอกเลขพัสดุ..."
                    disabled={selectedIssue.order_status !== "return_approved"}
                  />
                </div>
                <button
                  className="btn btn-primary"
                  disabled={selectedIssue.order_status !== "return_approved"}
                  onClick={() => handleUpdateIssue("resend", trackingNumber)}
                >
                  บันทึกเลขพัสดุ
                </button>
              </div>
            </div>
          )}

        </div>
      </Modal>

      {/* Modal คืนเงินจากที่ยกเลิก */}
      <Modal
        isOpen={showRefundModal}
        onRequestClose={closeRefundModal}
        className="order-modal"
        style={{ overlay: { backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 } }}
      >
        <div className="p-4 bg-white rounded-4 position-relative">
          <button
            className="position-absolute top-0 end-0 border-0 bg-transparent"
            style={{ fontSize: "1.5rem", cursor: "pointer" }}
            onClick={closeRefundModal}
          >
            ✕
          </button>

          <h5 className="fw-bold mb-3">คืนเงิน: รายการที่ {selectedOrderForRefund?.order_id}</h5>

          <div className="mb-3">
            <label className="form-label">จำนวนเงินที่คืน</label>
            <input
              type="text"
              className="form-control w-100"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">หมายเหตุเพิ่มเติม</label>
            <textarea
              className="form-control w-100"
              rows={2}
              value={refundNote}
              onChange={(e) => setRefundNote(e.target.value)}
              placeholder="เช่น ช่องทางโอน / ธนาคาร"
            />
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button className="btn btn-secondary" onClick={closeRefundModal} disabled={isRefunding}>
              ยกเลิก
            </button>
            <button className="btn btn-success" onClick={handleRefundSubmit} disabled={isRefunding}>
              {isRefunding ? "กำลังคืนเงิน..." : "ยืนยันคืนเงิน"}
            </button>
          </div>
        </div>
      </Modal>
    </div>

  );
};

const RESOLUTION_LABEL = {
  refund: "คืนเงิน",
  return: "ขอคืนสินค้า",
  replace: "เปลี่ยนสินค้า",
  resend: "ส่งสินค้าใหม่"
};

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
  issue_reported: "มีปัญหาการจัดส่ง",
  refund_approved: "คืนเงินสำเร็จ",
  resend_processing: "ส่งสินค้าใหม่กำลังดำเนินการ",
  issue_rejected: "ปัญหาไม่ได้รับการแก้ไข",
  return_pending: "ผู้ใช้ส่งสินค้าคืน",
  return_approved: "ผู้ใช้ส่งคืนสินค้าสำเร็จ",
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
  delivered: "text-success bg-success bg-opacity-10",           // เขียว
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


export default AdminOrderManager;