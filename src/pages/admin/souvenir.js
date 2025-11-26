import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaRegEdit } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";
import "../../css/admin.css";
import Swal from "sweetalert2";
import { useAuth } from '../../context/AuthContext';
import { HOSTNAME } from '../../config.js';
import { FaSearch } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";

function Souvenir() {
    const [products, setProducts] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const { user } = useAuth();
    const user_id = user?.user_id;

    useEffect(() => {
        window.scrollTo(0, 0);
        axios.get(HOSTNAME + "/admin/souvenir")
            .then((response) => {
                // console.log(response.data.data);
                const sortedProducts = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                setProducts(sortedProducts);
            })
            .catch((error) => {
                console.error("Error fetching souvenirs:", error);
            });
    }, [user_id]);

    const handleOpen = (product) => {
        setSelectedProduct(product);
    };

    const handleClose = () => {
        setSelectedProduct(null);
    };


    const handleDetail = (product) => {
        setSelectedProduct(product);
        setOpen(true);
    };

    const style = {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 400,
        bgcolor: "background.paper",
        boxShadow: 24,
        p: 4,
    };

    const handleDelete = (productId, productStatus, stockRemain) => {
        // เช็กสถานะการจำหน่ายสินค้า
        if (productStatus === "1" && stockRemain !== "0") {
            Swal.fire({
                title: 'ไม่สามารถลบสินค้า',
                text: 'สินค้ากำลังจำหน่ายอยู่ ไม่สามารถลบได้',
                icon: 'warning',
                confirmButtonText: 'ตกลง'
            });
            return;
        }

        // เมื่อผู้ใช้ยืนยันการลบ กรณีที่สินค้ายังไม่จำหน่าย
        Swal.fire({
            title: "ลบสินค้า?",
            text: "คุณต้องการลบสินค้านี้ใช่หรือไม่?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "ใช่, ลบ",
            cancelButtonText: "ยกเลิก"
        }).then((result) => {
            if (result.isConfirmed) {
                axios.delete(HOSTNAME + `/admin/deleteSouvenir/${productId}`)
                    .then(() => {
                        setProducts(products.filter(product => product.product_id !== productId));
                    })
                    .catch(error => {
                        console.error("เกิดข้อผิดพลาดในการลบ:", error);
                    });
            }
        });
    };

    const handleApprove = (productId) => {
        Swal.fire({
            title: "ยืนยันการอนุมัติ?",
            text: "คุณต้องการอนุมัติสินค้านี้ใช่หรือไม่?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "ใช่, อนุมัติ",
            cancelButtonText: "ยกเลิก"
        }).then((result) => {
            if (result.isConfirmed) {
                axios.put(HOSTNAME + `/admin/approveSouvenir/${productId}`, {
                    approver_id: user_id,
                    action: "approved"
                })
                    .then(() => {
                        setProducts(prevProducts =>
                            prevProducts.map(product =>
                                product.product_id === productId ? { ...product, status: "1" } : product
                            )
                        );
                        Swal.fire("สำเร็จ!", "อนุมัติสินค้าเรียบร้อยแล้ว", "success");
                    })
                    .catch(() => {
                        Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถอนุมัติสินค้าได้", "error");
                    });
            }
        });
    };


    const handleEditSubmit = (e) => {
        e.preventDefault(); // ป้องกันการโหลดหน้าซ้ำ

        axios.put(HOSTNAME + `/admin/editSouvenir/${selectedProduct.product_id}`, selectedProduct)
            .then(response => {
                console.log("บันทึกข้อมูลสินค้าสำเร็จ:", response.data);
                // อัปเดต State ในตาราง
                setProducts(prevProducts =>
                    prevProducts.map(product =>
                        product.product_id === selectedProduct.product_id
                            ? { ...product, ...selectedProduct }
                            : product
                    )
                );
                handleClose();
            })
            .catch(error => {
                console.error("เกิดข้อผิดพลาดในการบันทึก:", error);
                // อาจเพิ่มการแจ้งเตือนข้อผิดพลาด
            });
    };

    const getStatusColor = (status) => status === "1" ? "green" : "red";

    const roleNames = { 1: "แอดมิน", 2: "นายกสมาคม", 3: "สมาชิกทั่วไป" };
    const statusLabel = (status) => status === "1" ? "กำลังจำหน่าย" : "ยังไม่จำหน่าย";

    const filteredProducts = products.filter(product =>
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container-fluid p-5">
            {/* Header Section */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="admin-title">ของที่ระลึก (สำหรับผู้ดูแล)</h3>
                <Link to="/admin/souvenir/admin-manage-orders" className="text-decoration-none">
                    <button className="btn btn-outline-success d-flex align-items-center">
                        <FaRegEdit className="me-2" />
                        จัดการคำสั่งซื้อ
                    </button>
                </Link>
            </div>

            {/* Controls Section */}
            <div className="donate-filters mb-4">
                <div className="row g-3">
                    {/* ค้นหาสินค้า */}
                    <div className="col-md-6">
                        <label htmlFor="search" className="form-label fw-semibold">
                            ค้นหาสินค้า:
                        </label>
                        <div className="input-group">
                            <span className="input-group-text">
                                <FaSearch />
                            </span>
                            <input
                                type="text"
                                id="search"
                                className="form-control"
                                placeholder="ค้นหาชื่อสินค้าหรือรายละเอียด..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/*เรียงตามวันที่ */}
                    <div className="col-md-4">
                        <label htmlFor="sort" className="form-label fw-semibold">
                            เรียงตามวันที่:
                        </label>
                        <select
                            id="sort"
                            className="form-select"
                            onChange={(e) => {
                                const sorted = [...products].sort((a, b) =>
                                    e.target.value === "newest"
                                        ? new Date(b.created_at) - new Date(a.created_at)
                                        : new Date(a.created_at) - new Date(b.created_at)
                                );
                                setProducts(sorted);
                            }}
                        >
                            <option value="newest">ล่าสุด</option>
                            <option value="oldest">เก่าสุด</option>
                        </select>
                    </div>

                    {/* ปุ่มล้างตัวกรอง / เพิ่มของที่ระลึก */}
                    <div className="col-md-2 d-flex flex-column">
                        <label className="form-label invisible">เพิ่ม</label>
                        <div className="d-flex gap-2">
                            <button
                                className="btn btn-outline-secondary flex-fill"
                                onClick={() => setSearchTerm("")}
                                title="ล้างตัวกรอง"
                            >
                                <AiOutlineClose /> ล้าง
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-md-3 offset-md-9 d-flex align-items-end mb-2">
                <Link
                    to="/admin/souvenir/souvenir_request"
                    className="text-decoration-none w-100"
                >
                    <button className="btn btn-primary w-100 d-flex align-items-center justify-content-center">
                        เพิ่มของที่ระลึก
                    </button>
                </Link>
            </div>


            <div className="row g-4 ">
                {/* สินค้าของสมาคม */}
                {filteredProducts.filter(p => p.is_official === 1).length > 0 && (
                    <>
                        <h4 className="fw-bold">สินค้าของสมาคม</h4>
                        {filteredProducts
                            .filter(p => p.is_official === 1)
                            .map((product) => (
                                <div
                                    key={product.product_id}
                                    className="col-12 col-sm-6 col-md-4 col-lg-3"
                                    onClick={() => handleDetail(product)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <div className="card h-100 shadow-sm position-relative">
                                        {/* รูปสินค้า */}
                                        <div className="position-relative">
                                            <img
                                                src={HOSTNAME + `/uploads/${product.image}`}
                                                alt={product.image}
                                                onError={(e) => (e.target.src = "/image/default.jpg")}
                                                className="card-img-top"
                                                style={{ height: "180px", objectFit: "cover" }}
                                            />

                                            {/* สถานะสินค้า */}
                                            <span
                                                className={`badge position-absolute top-0 end-0 m-2 px-2 py-1 
                                            ${product.stock_remain === "0"
                                                        ? "bg-danger"
                                                        : product.status === "1"
                                                            ? "bg-success"
                                                            : "bg-warning"
                                                    }`}
                                                style={{ fontSize: "0.9rem" }}
                                            >
                                                {product.stock_remain === "0"
                                                    ? "สินค้าหมด"
                                                    : product.status === "1"
                                                        ? "กำลังจำหน่าย"
                                                        : "ยังไม่จำหน่าย"}
                                            </span>
                                        </div>

                                        {/* เนื้อหา card */}
                                        <div className="card-body d-flex flex-column">
                                            <h5 className="card-title">{product.product_name}</h5>
                                            <p className="card-text mb-1">
                                                <span className="fw-bold text-success">฿{product.price}</span>
                                            </p>
                                            <p className="mb-1">
                                                เหลือ {product.stock_remain} ชิ้น
                                                <br />
                                                <small className="text-muted">
                                                    (ทั้งหมด {product.total_quantity}, ขายแล้ว {product.total_sold}, จอง {product.total_reserved})
                                                </small>
                                            </p>
                                            <p className="small text-muted mb-2">
                                                ผู้ดูแล: {roleNames[product.role_id]}
                                                <br />
                                                เพิ่มเมื่อ {new Date(product.created_at).toLocaleDateString("th-TH")}
                                            </p>

                                            {/* ปุ่มจัดการ */}
                                            <div
                                                className="mt-auto btn-group-vertical btn-group-sm gap-1"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {product.status === "0" && (
                                                    <button
                                                        className="btn btn-outline-secondary btn-sm"
                                                        onClick={() => handleApprove(product.product_id)}
                                                    >
                                                        กดอนุมัติ
                                                    </button>
                                                )}
                                                <button
                                                    className="btn btn-outline-warning btn-sm"
                                                    onClick={() => handleOpen(product)}
                                                >
                                                    แก้ไข
                                                </button>
                                                <button
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() => handleDelete(product.product_id, product.status, product.stock_remain)}
                                                >
                                                    ลบ
                                                </button>
                                                <Link
                                                    to={`/admin/souvenir/product-slot/${product.product_id}`}
                                                    className="btn btn-outline-primary btn-sm"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    เพิ่มล็อตสินค้า
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </>
                )}

                {/* สินค้าของสมาชิกทั่วไป */}
                {filteredProducts.filter(p => p.is_official === 0).length > 0 && (
                    <>
                        <h4 className="fw-bold">สินค้าของสมาชิกทั่วไป</h4>
                        {filteredProducts
                            .filter(p => p.is_official === 0)
                            .map((product) => (
                                <div
                                    key={product.product_id}
                                    className="col-12 col-sm-6 col-md-4 col-lg-3"
                                    onClick={() => handleDetail(product)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <div className="card h-100 shadow-sm position-relative">
                                        {/* รูปสินค้า */}
                                        <div className="position-relative">
                                            <img
                                                src={HOSTNAME + `/uploads/${product.image}`}
                                                alt={product.image}
                                                onError={(e) => (e.target.src = "/image/default.jpg")}
                                                className="card-img-top"
                                                style={{ height: "180px", objectFit: "cover" }}
                                            />

                                            {/* สถานะสินค้า */}
                                            <span
                                            className={`badge position-absolute top-0 end-0 m-2 px-2 py-1 
                                            ${product.stock_remain === "0"
                                                        ? "bg-danger"
                                                        : product.status === "1"
                                                            ? "bg-success"
                                                            : "bg-warning"
                                                    }`}
                                                style={{ fontSize: "0.9rem" }}
                                            >
                                                {product.stock_remain === "0"
                                                    ? "สินค้าหมด"
                                                    : product.status === "1"
                                                        ? "กำลังจำหน่าย"
                                                        : "ยังไม่จำหน่าย"}
                                            </span>
                                        </div>

                                        {/* เนื้อหา card */}
                                        <div className="card-body d-flex flex-column">
                                            <h5 className="card-title">{product.product_name}</h5>
                                            <p className="card-text mb-1">
                                                <span className="fw-bold text-success">฿{product.price}</span>
                                            </p>
                                            <p className="mb-1">
                                                เหลือ {product.stock_remain} ชิ้น
                                                <br />
                                                <small className="text-muted">
                                                    (ทั้งหมด {product.total_quantity}, ขายแล้ว {product.total_sold}, จอง {product.total_reserved})
                                                </small>
                                            </p>
                                            <p className="small text-muted mb-2">
                                                ผู้ดูแล: {roleNames[product.role_id]}
                                                <br />
                                                เพิ่มเมื่อ {new Date(product.created_at).toLocaleDateString("th-TH")}
                                            </p>

                                            {/* ปุ่มจัดการ */}
                                            <div
                                                className="mt-auto btn-group-vertical btn-group-sm gap-1"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {product.status === "0" && (
                                                    <button
                                                        className="btn btn-outline-secondary btn-sm"
                                                        onClick={() => handleApprove(product.product_id)}
                                                    >
                                                        กดอนุมัติ
                                                    </button>
                                                )}
                                                <button
                                                    className="btn btn-outline-warning btn-sm"
                                                    onClick={() => handleOpen(product)}
                                                >
                                                    แก้ไข
                                                </button>
                                                <button
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() => handleDelete(product.product_id, product.status, product.stock_remain)}
                                                >
                                                    ลบ
                                                </button>
                                                <Link
                                                    to={`/admin/souvenir/product-slot/${product.product_id}`}
                                                    className="btn btn-outline-primary btn-sm"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    เพิ่มล็อตสินค้า
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </>
                )}

                {/* ไม่พบสินค้า */}
                {filteredProducts.length === 0 && (
                    <div className="col-12 text-center text-muted py-4">
                        ไม่พบสินค้าที่ค้นหา
                    </div>
                )}
            </div>

            {/* modal */}
            {selectedProduct && (
                <div className="custom-modal-overlay fade show d-block" tabIndex="-1">
                    <div className="custom-modal-slot"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <form onSubmit={handleEditSubmit}>
                            <div className="custom-edit-header">
                                <h5 className="modal-title fw-bold">
                                    <FaRegEdit className="me-2" />
                                    แก้ไขของที่ระลึก
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-black"
                                    onClick={handleClose}
                                ></button>
                            </div>
                            <div className="custom-edit-body">

                                <div className="row mb-4">
                                    <div className="col-12 d-flex justify-content-center">
                                        <div
                                            className="border rounded p-3 bg-light"
                                            style={{ width: "250px", height: "200px" }}
                                        >
                                            <img
                                                src={HOSTNAME + `/uploads/${selectedProduct.image}`}
                                                alt={selectedProduct.image}
                                                onError={(e) => (e.target.src = "/image/default.jpg")}
                                                className="w-100 h-100 rounded"
                                                style={{ objectFit: "contain" }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-semibold">
                                        ชื่อสินค้า
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control w-100"
                                        value={selectedProduct.product_name}
                                        onChange={(e) => setSelectedProduct({
                                            ...selectedProduct,
                                            product_name: e.target.value,
                                        })}
                                        placeholder="กรอกชื่อสินค้า"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">
                                        ราคา (บาท)
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text">฿</span>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={selectedProduct.price}
                                            onChange={(e) => setSelectedProduct({
                                                ...selectedProduct,
                                                price: e.target.value,
                                            })}
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-semibold">
                                        สถานะสินค้า
                                    </label>
                                    <select
                                        className="form-select"
                                        value={selectedProduct.status}
                                        onChange={(e) => setSelectedProduct({
                                            ...selectedProduct,
                                            status: e.target.value,
                                        })}
                                    >
                                        <option value="1">กำลังจำหน่าย</option>
                                        <option value="0">ยังไม่จำหน่าย</option>
                                    </select>
                                </div>
                            </div>
                            <div className="custom-edit-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary px-4 rounded-3"
                                    onClick={handleClose}
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-success px-4 rounded-3 shadow-sm"
                                >
                                    บันทึก
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
};

export default Souvenir;