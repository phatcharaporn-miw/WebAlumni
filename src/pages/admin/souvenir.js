import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { IoIosAddCircleOutline } from "react-icons/io";
import { FaRegEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { CiSearch } from "react-icons/ci";
import { BsCheck2Square } from "react-icons/bs";
import {
    TextField, FormControl, InputLabel, Select, MenuItem,
    Button, Typography, Box, Modal, InputAdornment
} from "@mui/material";
import "../../css/admin.css";
import Swal from "sweetalert2";

function Souvenir() {
    const [products, setProducts] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [detailProduct, setDetailProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // useEffect(() => {
    //     window.scrollTo(0, 0);
    //     axios.get("http://localhost:3001/admin/souvenir").then((response) => {
    //         setProducts(response.data);
    //     });
    //     console.log(user_id)
    // }, []);

    const user_id = localStorage.getItem("userId");

    useEffect(() => {
        window.scrollTo(0, 0);
        axios.get("http://localhost:3001/admin/souvenir")
            .then((response) => {
                setProducts(response.data);
            })
            .catch((error) => {
                console.error("Error fetching souvenirs:", error);
            });
    }, [user_id]);

    const handleOpen = (product) => {
        setSelectedProduct(product);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
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

    const handleDelete = (productId) => {
        // เมื่อผู้ใช้ยืนยันการลบ
        const confirmDelete = window.confirm("คุณต้องการลบสินค้านี้จริงหรือ?");

        if (confirmDelete) {
            axios.delete(`http://localhost:3001/admin/deleteSouvenir/${productId}`)
                .then(() => {
                    setProducts(products.filter(product => product.product_id !== productId));
                })
                .catch(error => {
                    console.error("เกิดข้อผิดพลาดในการลบ:", error);

                });
        }
    };

    const handleApprove = (productId) => {
        Swal.fire({
            title: "ยืนยันการอนุมัติ?",
            text: "คุณต้องการอนุมัติสินค้านี้ใช่หรือไม่?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "ใช่, อนุมัติเลย",
            cancelButtonText: "ยกเลิก"
        }).then((result) => {
            if (result.isConfirmed) {
                axios.put(`http://localhost:3001/admin/approveSouvenir/${productId}`, {
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

    const handleReject = (productId) => {
        Swal.fire({
            title: "ยืนยันการปฏิเสธ?",
            text: "คุณต้องการปฏิเสธสินค้านี้ใช่หรือไม่?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "ใช่, ปฏิเสธเลย",
            cancelButtonText: "ยกเลิก"
        }).then((result) => {
            if (result.isConfirmed) {
                axios.put(`http://localhost:3001/admin/approveSouvenir/${productId}`, {
                    approver_id: user_id,
                    action: "rejected"
                })
                    .then(() => {
                        setProducts(prevProducts =>
                            prevProducts.filter(product => product.product_id !== productId)
                        );
                        Swal.fire("สำเร็จ!", "ปฏิเสธสินค้าสำเร็จแล้ว", "success");
                    })
                    .catch(() => {
                        Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถปฏิเสธสินค้าได้", "error");
                    });
            }
        });
    };


    const getStatusColor = (status) => {
        if (status === "1") {
            return "green";
        } else {
            return "red";
        }
    };

    const roleNames = { 1: "แอดมิน", 2: "นายกสมาคม", 3: "ศิษย์เก่า", 4: "ศิษย์ปัจจุบัน" };
    const statusLabel = (status) => status === "1" ? "กำลังจำหน่าย" : "ยังไม่จำหน่าย";

    const filteredProducts = products.filter(product =>
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container-fluid p-5">
            {/* Header Section */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="admin-title">ของที่ระลึก (สำหรับผู้ดูแล)</h3>
                <Link to="/admin/admin-manage-orders" className="text-decoration-none">
                    <button className="btn btn-outline-success d-flex align-items-center">
                        <FaRegEdit className="me-2" />
                        จัดการคำสั่งซื้อ
                    </button>
                </Link>
            </div>

            {/* Controls Section */}
            <div className="row mb-4">
                <div className="col-md-3">
                    <label className="form-label fw-semibold">เรียงตามวันที่:</label>
                    <select
                        className="form-select"
                        onChange={(e) => {
                            const sorted = [...products].sort((a, b) =>
                                e.target.value === "newest" ? new Date(b.created_at) - new Date(a.created_at)
                                    : new Date(a.created_at) - new Date(b.created_at)
                            );
                            setProducts(sorted);
                        }}
                    >
                        <option value="newest">ล่าสุด</option>
                        <option value="oldest">เก่าสุด</option>
                    </select>
                </div>

                <div className="col-md-6">
                    <label className="form-label fw-semibold">ค้นหาสินค้า:</label>
                    <div className="input-group">
                        <span className="input-group-text bg-light">
                            <CiSearch />
                        </span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="ค้นหาชื่อสินค้า"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="col-md-3 d-flex align-items-end">
                    <Link to="/admin/souvenir/souvenir_request" className="text-decoration-none w-100">
                        <button className="btn btn-primary w-100 d-flex align-items-center justify-content-center">
                            <IoIosAddCircleOutline className="me-2" />
                            เพิ่มของที่ระลึก
                        </button>
                    </Link>
                </div>
            </div>

            {/* Table Section */}
            <div className="card shadow-sm">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead className="table-primary">
                                <tr>
                                    <th scope="col" className="text-center">รหัสสินค้า</th>
                                    <th scope="col" className="text-center">รูปภาพ</th>
                                    <th scope="col">ชื่อสินค้า</th>
                                    <th scope="col" className="text-center">ราคา</th>
                                    <th scope="col" className="text-center">จำนวน</th>
                                    <th scope="col" className="text-center">ผู้ดูแล</th>
                                    <th scope="col" className="text-center">สถานะ</th>
                                    <th scope="col" className="text-center">วันที่เพิ่ม</th>
                                    <th scope="col" className="text-center">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="text-center py-4 text-muted">
                                            <div className="d-flex flex-column align-items-center">
                                                ไม่พบสินค้าที่ค้นหา
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts.map((product) => (
                                        <tr
                                            key={product.product_id}
                                            onClick={() => handleDetail(product)}
                                            className="cursor-pointer"
                                            style={{ cursor: "pointer" }}
                                        >
                                            <td className="text-center align-middle fw-semibold">
                                                {product.product_id}
                                            </td>
                                            <td className="text-center align-middle">
                                                <div className="d-flex justify-content-center">
                                                    <img
                                                        src={`http://localhost:3001/uploads/${product.image}`}
                                                        alt={product.image}
                                                        onError={(e) => e.target.src = "/image/default.jpg"}
                                                        className="rounded shadow-sm"
                                                        style={{
                                                            width: "70px",
                                                            height: "70px",
                                                            objectFit: "cover"
                                                        }}
                                                    />
                                                </div>
                                            </td>
                                            <td className="align-middle">
                                                <span className="fw-semibold">{product.product_name}</span>
                                            </td>
                                            <td className="text-center align-middle">
                                                <span className="text-success fs-6 fw-bold">
                                                    ฿{product.price}
                                                </span>
                                            </td>
                                            <td className="text-center align-middle">
                                                <span className="fs-6 ">
                                                    {product.stock} ชิ้น
                                                </span>
                                            </td>
                                            <td className="text-center align-middle">
                                                {roleNames[product.role_id]}
                                            </td>
                                            <td className="text-center align-middle">
                                                <span
                                                    className={`badge fs-7 
                                                        ${product.stock === 0
                                                            ? "bg-danger bg-opacity-10 text-danger"
                                                            : product.status === "1"
                                                                ? "bg-success bg-opacity-10 text-success"
                                                                : "bg-warning bg-opacity-10 text-warning"
                                                        }`}
                                                >
                                                    {product.stock === 0
                                                        ? "สินค้าหมด"
                                                        : statusLabel(product.status)}
                                                </span>
                                            </td>
                                            <td className="text-center align-middle">
                                                {new Date(product.created_at).toLocaleDateString("th-TH")}
                                            </td>
                                            <td className="text-center align-middle" onClick={(e) => e.stopPropagation()}>
                                                <div className="btn-group-vertical btn-group-sm gap-1">
                                                    {product.status === "0" && (
                                                        <button
                                                            className="btn btn-outline-success btn-sm"
                                                            onClick={() => handleApprove(product.product_id)}
                                                            title="อนุมัติสินค้า"
                                                        >
                                                            <BsCheck2Square className="me-1" />
                                                            อนุมัติ
                                                        </button>
                                                    )}
                                                    <button
                                                        className="btn btn-outline-primary btn-sm"
                                                        onClick={() => handleOpen(product)}
                                                        title="แก้ไขสินค้า"
                                                    >
                                                        <FaRegEdit className="me-1" />
                                                        แก้ไข
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-danger btn-sm"
                                                        onClick={() => handleDelete(product.product_id)}
                                                        title="ลบสินค้า"
                                                    >
                                                        <MdDelete className="me-1" />
                                                        ลบ
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <div
                className={`modal fade ${open ? 'show' : ''}`}
                style={{ display: open ? 'block' : 'none' }}
                tabIndex="-1"
                role="dialog"
            >
                <div className="modal-dialog modal-lg" role="document">
                    <div className="modal-content">
                        <div className="modal-header bg-primary text-white">
                            <h5 className="modal-title fw-bold">
                                <FaRegEdit className="me-2" />
                                แก้ไขข้อมูลสินค้า
                            </h5>
                            <button
                                type="button"
                                className="btn-close btn-close-white"
                                onClick={handleClose}
                            ></button>
                        </div>

                        {selectedProduct && (
                            <div className="modal-body">
                                <form>
                                    {/* Product Image */}
                                    <div className="row mb-4">
                                        <div className="col-12 d-flex justify-content-center">
                                            <div
                                                className="border rounded p-3 bg-light"
                                                style={{ width: "250px", height: "200px" }}
                                            >
                                                <img
                                                    src={`http://localhost:3001/uploads/${selectedProduct.image}`}
                                                    alt={selectedProduct.image}
                                                    onError={(e) => (e.target.src = "/image/default.jpg")}
                                                    className="w-100 h-100 rounded"
                                                    style={{ objectFit: "contain" }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Form Fields */}
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-semibold">
                                                <i className="bi bi-tag me-2"></i>
                                                ชื่อสินค้า
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={selectedProduct.product_name}
                                                onChange={(e) => setSelectedProduct({
                                                    ...selectedProduct,
                                                    product_name: e.target.value,
                                                })}
                                                placeholder="กรอกชื่อสินค้า"
                                            />
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-semibold">
                                                <i className="bi bi-currency-dollar me-2"></i>
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

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-semibold">
                                                <i className="bi bi-box me-2"></i>
                                                จำนวนในคลัง
                                            </label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={selectedProduct.stock}
                                                onChange={(e) =>
                                                    setSelectedProduct({
                                                        ...selectedProduct,
                                                        stock: e.target.value
                                                    })
                                                }
                                                placeholder="จำนวน"
                                                min="0"
                                            />
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-semibold">
                                                <i className="bi bi-check-circle me-2"></i>
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
                                </form>
                            </div>
                        )}

                        <div className="modal-footer bg-light">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={handleClose}
                            >
                                <i className="bi bi-x-circle me-2"></i>
                                ยกเลิก
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => {
                                    axios.put(`http://localhost:3001/admin/editSouvenir/${selectedProduct.product_id}`, selectedProduct)
                                        .then(response => {
                                            console.log("บันทึกข้อมูลสินค้าสำเร็จ:", response.data);
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
                                        });
                                }}
                            >
                                <i className="bi bi-check-lg me-2"></i>
                                บันทึกข้อมูล
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Backdrop */}
            {open && <div className="modal-backdrop fade show" onClick={handleClose}></div>}
        </div>
    );
}

export default Souvenir;
