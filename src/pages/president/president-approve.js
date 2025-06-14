import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { IoIosAddCircleOutline } from "react-icons/io";
import { FaRegEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { MdNotifications } from "react-icons/md";
import { Badge, IconButton } from "@mui/material";
import { Modal, Button, Box, Typography, Snackbar, Alert } from "@mui/material";
import "../../css/president.css";
import Swal from "sweetalert2";

function Approve() {
    const [products, setProducts] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [notification, setNotification] = useState({
        open: false,
        message: "",
        severity: "info",
    });

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
                        status: "1",
                        approver_id: user_id 
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


    const handleDelete = (productId) => {
        Swal.fire({
            title: "คุณแน่ใจหรือไม่?",
            text: "เมื่อลบแล้วจะไม่สามารถกู้คืนได้!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#e3342f",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "ใช่, ลบเลย",
            cancelButtonText: "ยกเลิก"
        }).then((result) => {
            if (result.isConfirmed) {
                axios.delete(`http://localhost:3001/admin/deleteSouvenir/${productId}`)
                    .then(() => {
                        setProducts(products.filter(product => product.product_id !== productId));
                        Swal.fire("ลบเรียบร้อย!", "สินค้าถูกลบออกจากระบบแล้ว", "success");
                    })
                    .catch(() => {
                        Swal.fire("ผิดพลาด", "ไม่สามารถลบสินค้าได้", "error");
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
    
    const statusLabel = (status) => {
        return status === "1" ? "กำลังจำหน่าย" : "ยังไม่จำหน่าย";
    };

    return (
        <> 
            <div className="container my-5">
                <h2 className="mb-4 text-center text-primary fw-bold">รายการที่รออนุมัติ</h2>
                <div className="row g-4">
                    {products.map((product) => (
                    <div key={product.product_id} className="col-sm-6 col-md-4 col-lg-3">
                        <div className="card h-100 border-0 shadow-sm rounded-4 p-2">
                        <img
                            src={`http://localhost:3001/uploads/${product.image}`}
                            alt={product.product_name}
                            className="card-img-top rounded-3"
                            style={{ height: "180px", objectFit: "cover" }}
                        />

                        <div className="card-body px-2 py-3">
                            <h6 className="card-title text-dark fw-semibold mb-2">{product.product_name}</h6>
                            <p className="card-text text-muted mb-1" style={{ fontSize: "14px" }}>
                            ราคา: <strong>{product.price}</strong> บาท
                            </p>
                            <p className="card-text text-muted mb-2" style={{ fontSize: "13px" }}>
                            ผู้ดูแล ID: {product.role_id}
                            </p>

                            <span
                            className={`badge rounded-pill px-3 py-1 mb-3 ${
                                product.status === "1" ? "bg-success-subtle text-success" : "bg-secondary-subtle text-secondary"
                            }`}
                            style={{ fontSize: "12px" }}
                            >
                            {product.status === "1" ? "กำลังจำหน่าย" : "ยังไม่จำหน่าย"}
                            </span>

                            <div className="d-flex justify-content-between gap-2">
                                {product.status === "0" ? (
                                    <>
                                    <button
                                        className="btn btn-sm btn-outline-success rounded-pill flex-grow-1"
                                        onClick={() => handleApprove(product.product_id)}
                                    >
                                        ✅ อนุมัติ
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-danger rounded-pill"
                                        onClick={() => handleReject(product.product_id)}
                                    >
                                        <MdDelete className="me-1" /> ปฏิเสธ
                                    </button>
                                    </>
                                ) : (
                                    <>
                                    <button
                                        className="btn btn-sm btn-outline-primary rounded-pill"
                                        onClick={() => handleOpen(product)}
                                    >
                                        <FaRegEdit className="me-1" /> แก้ไข
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-danger rounded-pill"
                                        onClick={() => handleDelete(product.product_id)}
                                    >
                                        <MdDelete className="me-1" /> ลบ
                                    </button>
                                    </>
                                )}
                            </div>
                        </div>
                        </div>
                    </div>
                    ))}
                </div>
            </div>
    
            <Modal open={open} onClose={handleClose} aria-labelledby="modal-title" aria-describedby="modal-description">
                <Box sx={style}>
                    <Typography id="modal-title" variant="h5" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
                        แก้ไขข้อมูลสินค้า
                    </Typography>

                    {selectedProduct && (
                        <div id="modal-description">
                            <form>
                                <div style={{ marginBottom: '16px' }}>
                                    <label className="name_product" style={{ fontWeight: 'bold', display: 'block' }}>ชื่อสินค้า</label>
                                    <input
                                        type="text"
                                        value={selectedProduct.product_name}
                                        onChange={(e) => setSelectedProduct({
                                            ...selectedProduct,
                                            product_name: e.target.value,
                                        })}
                                        style={{
                                            width: '100%',
                                            padding: '8px',
                                            fontSize: '14px',
                                            borderRadius: '4px',
                                            border: '1px solid #ccc',
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ fontWeight: 'bold', display: 'block' }}>ราคา</label>
                                    <input
                                        type="number"
                                        value={selectedProduct.price}
                                        onChange={(e) => setSelectedProduct({
                                            ...selectedProduct,
                                            price: e.target.value,
                                        })}
                                        style={{
                                            width: '100%',
                                            padding: '8px',
                                            fontSize: '14px',
                                            borderRadius: '4px',
                                            border: '1px solid #ccc',
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ fontWeight: 'bold', display: 'block' }}>สถานะ</label>
                                    <select
                                        value={selectedProduct.status}
                                        onChange={(e) => setSelectedProduct({
                                            ...selectedProduct,
                                            status: e.target.value,
                                        })}
                                        style={{
                                            width: '100%',
                                            padding: '8px',
                                            fontSize: '14px',
                                            borderRadius: '4px',
                                            border: '1px solid #ccc',
                                        }}
                                    >
                                        <option value="1">กำลังจำหน่าย</option>
                                        <option value="0">ยังไม่จำหน่าย</option>
                                    </select>
                                </div>
                            </form>
                        </div>
                    )}

                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <Button
                        onClick={handleClose}
                        variant="outlined"
                        color="secondary"
                        size="small"
                        sx={{
                            paddingX: 2,
                            paddingY: 1,
                            fontSize: '14px',
                            borderRadius: '8px',
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: '#f0f0f0',
                                borderColor: '#999',
                            }
                        }}
                    >
                        ปิด
                    </Button>
                    <Button
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
                        variant="contained"
                        color="primary"
                        size="small"
                        sx={{
                            paddingX: 2.5,
                            paddingY: 1,
                            fontSize: '14px',
                            borderRadius: '8px',
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: '#2c6ad4',
                            }
                        }}
                    >
                        บันทึก
                    </Button>
                </div>

                </Box>
            </Modal>
        </>
    );    
}

export default Approve;
