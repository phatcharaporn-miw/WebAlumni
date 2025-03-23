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

function Souvenir() {
    const [products, setProducts] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [notification, setNotification] = useState({
        open: false,
        message: "",
        severity: "info",
    });

    // useEffect(() => {
    //     window.scrollTo(0, 0);
    //     axios.get("http://localhost:3001/admin/souvenir").then((response) => {
    //         setProducts(response.data);
    //     });
    //     console.log(user_id)
    // }, []);

    const user_id = localStorage.getItem("user_id");

    useEffect(() => {
        window.scrollTo(0, 0);
        axios.get("http://localhost:3001/admin/souvenir")
            .then((response) => {
                setProducts(response.data);
            })
            .catch((error) => {
                console.error("Error fetching souvenirs:", error);
            });

        console.log("User ID:", user_id);
    }, [user_id]);



    const [notificationCount, setNotificationCount] = useState(0);

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

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
        // แสดง Snackbar เพื่อยืนยันการลบ
        setNotification({
            open: true,
            message: "คุณต้องการลบสินค้านี้จริงหรือไม่?",
            severity: "warning",
        });
    
        // เมื่อผู้ใช้ยืนยันการลบ
        const confirmDelete = window.confirm("คุณต้องการลบสินค้านี้จริงหรือ?");
        
        if (confirmDelete) {
            axios.delete(`http://localhost:3001/admin/deleteSouvenir/${productId}`)
                .then(() => {
                    setProducts(products.filter(product => product.product_id !== productId));
                    setNotification({
                        open: true,
                        message: "สินค้าถูกลบเรียบร้อยแล้ว!",
                        severity: "success",
                    });
                })
                .catch(error => {
                    console.error("เกิดข้อผิดพลาดในการลบ:", error);
                    setNotification({
                        open: true,
                        message: "ไม่สามารถลบสินค้าได้, กรุณาลองใหม่อีกครั้ง",
                        severity: "error",
                    });
                });
        } else {
            setNotification({
                open: true,
                message: "คุณยกเลิกการลบสินค้า",
                severity: "info",
            });
        }
    };
    

    const handleApprove = (productId) => {
        axios.put(`http://localhost:3001/admin/approveSouvenir/${productId}`, { status: "1" })
            .then(response => {
                setProducts(prevProducts =>
                    prevProducts.map(product =>
                        product.product_id === productId ? { ...product, status: "1" } : product
                    )
                );
                alert("อนุมัติสินค้าสำเร็จ");
            })
            .catch(error => {
                alert("เกิดข้อผิดพลาดในการอนุมัติสินค้า");
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
            <Snackbar
                open={notification.open}
                autoHideDuration={4000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert onClose={handleCloseNotification} severity={notification.severity}>
                    {notification.message}
                </Alert>
            </Snackbar>

            <IconButton
                color="inherit"
                onClick={() => setNotificationCount(0)} // เคลียร์แจ้งเตือนเมื่อกด
            >
                <Badge badgeContent={notificationCount} color="error">
                    <MdNotifications size={24} />
                </Badge>
            </IconButton>

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
                                            {product.status === "0" && (
                                                <button className="souvenir-bt-approve" onClick={() => handleApprove(product.product_id)}>
                                                    อนุมัติ
                                                </button>
                                            )}

                                            <button className="souvenir-bt-edit" onClick={() => handleOpen(product)}>
                                                <FaRegEdit />แก้ไข
                                            </button>
                                            <button className="souvenir-bt-del" onClick={() => handleDelete(product.product_id)}>
                                                <MdDelete />ลบ
                                            </button>
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
                    <Typography id="modal-title" variant="h5">แก้ไขข้อมูลสินค้า</Typography>
                    {selectedProduct && (
                        <div id="modal-description">
                            <form>
                                <div>
                                    <label className="name_product">ชื่อสินค้า</label><br />
                                    <input
                                        type="text"
                                        value={selectedProduct.product_name}
                                        onChange={(e) => setSelectedProduct({
                                            ...selectedProduct,
                                            product_name: e.target.value,
                                        })}
                                    />
                                </div>
                                <div>
                                    <label>ราคา</label><br />
                                    <input
                                        type="number"
                                        value={selectedProduct.price}
                                        onChange={(e) => setSelectedProduct({
                                            ...selectedProduct,
                                            price: e.target.value,
                                        })}
                                    />
                                </div>
                                <div>
                                    <label>สถานะ</label><br />
                                    <select
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
                            </form>
                        </div>
                    )}
                    <div style={{ marginTop: "20px", textAlign: "right" }}>
                        <Button onClick={handleClose} color="secondary">ปิด</Button>
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
                            color="primary"
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
