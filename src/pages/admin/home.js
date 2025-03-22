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

function AdminHome() {
    const [products, setProducts] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [notification, setNotification] = useState({
        open: false,
        message: "",
        severity: "info",
    });

    useEffect(() => {
        window.scrollTo(0, 0);
        axios.get("http://localhost:3001/admin/souvenir").then((response) => {
            setProducts(response.data);
        });
    }, []);
    

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

    const handleDelete = (productId) => {
        axios.delete(`http://localhost:3001/admin/deleteSouvenir/${productId}`)
            .then(() => {
                setProducts(products.filter(product => product.product_id !== productId));
            })
            .catch(error => {
                console.error("เกิดข้อผิดพลาดในการลบ:", error);
            });
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

            <h2 className="titlesouvenir">AdminHome (สำหรับผู้ดูแล)</h2>

        
        </>
    );
}

export default AdminHome;
