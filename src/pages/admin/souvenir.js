import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { IoIosAddCircleOutline } from "react-icons/io";
import { FaRegEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { MdNotifications } from "react-icons/md";
import { Badge, IconButton } from "@mui/material";
import { Modal, Button, Box, Typography, Snackbar, Alert } from "@mui/material";
import "../../css/admin.css";
import Swal from "sweetalert2";

function Souvenir() {
    const [products, setProducts] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    
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

    // const handleDelete = (productId) => {

    //     axios.delete(`http://localhost:3001/admin/deleteSouvenir/${productId}`)
    //         .then(() => {
    //             setProducts(products.filter(product => product.product_id !== productId));
    //         })
    //         .catch(error => {
    //             console.error("เกิดข้อผิดพลาดในการลบ:", error);
    //         });
    // };

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
    
    const statusLabel = (status) => {
        return status === "1" ? "กำลังจำหน่าย" : "ยังไม่จำหน่าย";
    };

    return (
        <>   
            <div className="souvenir-top">
                <div className="souvenir-bt">
                    <Link to={`/admin/souvenir/souvenir_request`}>
                        <button className="souvenir-bt-add"><IoIosAddCircleOutline />เพิ่มของที่ระลึก</button>
                    </Link>
                </div>
            </div>
    
            <h2 className="titlesouvenir">ของที่ระลึก (สำหรับผู้ดูแล)</h2>
    
            <div className="souvenir-content">
                <div className="souvenir-content-item">
                    <table>
                        <thead>
                            <tr>
                                <th>รหัสสินค้า</th>
                                <th>ชื่อสินค้า</th>
                                <th>ราคา</th>
                                <th>ผู้ดูแล</th>
                                <th>สถานะ</th>
                                <th>จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length > 0 ? (
                                products.map((product) => (
                                    <tr key={product.product_id}>
                                        <td>{product.product_id}</td>
                                        <td>{product.product_name}</td>
                                        <td>{product.price}</td>
                                        <td>{product.role_id}</td>
                                        <td>
                                            <p
                                                className="status-label"
                                                style={{ color: getStatusColor(product.status) }}
                                            >
                                                {product.status === "1" ? "กำลังจำหน่าย" : "ยังไม่จำหน่าย"}
                                            </p>
                                        </td>
                                        <td>
                                            {product.status === "0" ? (
                                                <>
                                                <button
                                                    className="souvenir-bt-approve"
                                                    onClick={() => handleApprove(product.product_id)}
                                                    style={{ fontSize: "12px", marginRight: "8px" }}
                                                >
                                                    อนุมัติ
                                                </button>
                                                <button
                                                    className="souvenir-bt-del"
                                                    onClick={() => handleReject(product.product_id)}
                                                    style={{ fontSize: "12px" }}
                                                >
                                                    <MdDelete /> ปฏิเสธ
                                                </button>
                                                </>
                                            ) : (
                                                <>
                                                <button
                                                    className="souvenir-bt-edit"
                                                    onClick={() => handleOpen(product)}
                                                    style={{ fontSize: "12px", marginRight: "8px" }}
                                                >
                                                    <FaRegEdit /> แก้ไข
                                                </button>
                                                <button
                                                    className="souvenir-bt-del"
                                                    onClick={() => handleDelete(product.product_id)}
                                                    style={{ fontSize: "12px" }}
                                                >
                                                    <MdDelete /> ลบ
                                                </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6">ขออภัย ไม่มีสินค้าในขณะนี้</td></tr>
                            )}
                        </tbody>
                    </table>
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

export default Souvenir;
