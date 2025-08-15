import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { IoIosAddCircleOutline } from "react-icons/io";
import { FaRegEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { BsCheck2Square } from "react-icons/bs";
import { CiSearch } from "react-icons/ci";
import { TextField, FormControl, InputLabel, Select, MenuItem,
    Button, Typography, Box, Modal, Snackbar, Alert, InputAdornment
} from "@mui/material";
import "../../css/admin.css";

function Souvenir() {
    const [products, setProducts] = useState([]);
    const [open, setOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [detailProduct, setDetailProduct] = useState(null);
    const [notification, setNotification] = useState({ open: false, message: "", severity: "info" });
    const [searchTerm, setSearchTerm] = useState("");
    const user_id = localStorage.getItem("user_id");

    useEffect(() => {
        window.scrollTo(0, 0);
        axios.get("http://localhost:3001/admin/souvenir")
            .then((response) => {
                const sortedProducts = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                setProducts(sortedProducts);
            })
            .catch((error) => console.error("Error fetching souvenirs:", error));
    }, [user_id]);

    const handleCloseNotification = () => setNotification({ ...notification, open: false });

    const handleOpen = (product) => {
        setSelectedProduct(product);
        setOpen(true);
    };
    const handleClose = () => setOpen(false);

    const handleDetail = (product) => {
        setDetailProduct(product);
        setDetailOpen(true);
    };
    const handleCloseDetail = () => setDetailOpen(false);

    const handleDelete = (productId) => {
        if (window.confirm("คุณต้องการลบสินค้านี้จริงหรือไม่?")) {
            axios.delete(`http://localhost:3001/admin/deleteSouvenir/${productId}`)
                .then(() => {
                    setProducts(products.filter(p => p.product_id !== productId));
                    setNotification({ open: true, message: "ลบสินค้าสำเร็จ", severity: "success" });
                })
                .catch(() => {
                    setNotification({ open: true, message: "ลบไม่สำเร็จ กรุณาลองใหม่", severity: "error" });
                });
        }
    };

    const handleApprove = (productId) => {
        axios.put(`http://localhost:3001/admin/approveSouvenir/${productId}`, { status: "1" })
            .then(() => {
                setProducts(prev => prev.map(p => p.product_id === productId ? { ...p, status: "1" } : p));
                alert("อนุมัติสินค้าสำเร็จ");
            })
            .catch(() => alert("เกิดข้อผิดพลาดในการอนุมัติ"));
    };

    const getStatusColor = (status) => status === "1" ? "green" : "red";

    const roleNames = { 1: "แอดมิน", 2: "นายกสมาคม", 3: "สมาชิกทั่วไป" };
    const statusLabel = (status) => status === "1" ? "กำลังจำหน่าย" : "ยังไม่จำหน่าย";

    const filteredProducts = products.filter(product =>
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <Snackbar open={notification.open} autoHideDuration={4000} onClose={handleCloseNotification}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}>
                <Alert onClose={handleCloseNotification} severity={notification.severity}>{notification.message}</Alert>
            </Snackbar>

            <div className="souvenir-top">
                <div className="sort-options">
                    <label>เรียงตามวันที่:</label>
                    <select onChange={(e) => {
                        const sorted = [...products].sort((a, b) =>
                            e.target.value === "newest" ? new Date(b.created_at) - new Date(a.created_at)
                                : new Date(a.created_at) - new Date(b.created_at)
                        );
                        setProducts(sorted);
                    }}>
                        <option value="newest">ล่าสุด</option>
                        <option value="oldest">เก่าสุด</option>
                    </select>
                </div>

                <TextField
                    className="search_souvenir"
                    label="ค้นหาชื่อสินค้า"
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ marginLeft: 16 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <CiSearch />
                            </InputAdornment>
                        ),
                    }}
                />
                <div className="souvenir-bt">
                    <Link to={`/admin/souvenir/souvenir_request`} style={{ textDecoration: 'none' }}>
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
                                <th>รูปภาพสินค้า</th>
                                <th>ชื่อสินค้า</th>
                                <th>ราคา</th>
                                <th>จำนวน (ชิ้น)</th>
                                <th>ผู้ดูแล</th>
                                <th>สถานะ</th>
                                <th>วันที่เพิ่ม</th>
                                <th>จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={8} style={{ padding: 20, textAlign: "center", color: "gray" }}>
                                        ไม่พบสินค้าที่ค้นหา
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product.product_id} onClick={() => handleDetail(product)} style={{ cursor: "pointer" }}>
                                        <td>{product.product_id}</td>
                                        <td className="image-product">
                                            <img src={`http://localhost:3001/uploads/${product.image}`} alt={product.image}
                                                onError={(e) => e.target.src = "/image/default.jpg"} />
                                        </td>
                                        <td>{product.product_name}</td>
                                        <td>{product.price}</td>
                                        <td>{product.stock}</td>
                                        <td>{roleNames[product.role_id]}</td>
                                        <td>
                                            <p className="statusProduct-label" style={{ color: getStatusColor(product.status) }}>
                                                {statusLabel(product.status)}
                                            </p>
                                        </td>
                                        <td>{new Date(product.created_at).toLocaleDateString("th-TH")}</td>
                                        <td className="souvenir-bt-group" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                className="souvenir-bt-approve"
                                                onClick={() => handleApprove(product.product_id)}
                                                disabled={product.status !== "0"}
                                            >
                                                <BsCheck2Square /> อนุมัติ
                                            </button>

                                            <button className="souvenir-bt-edit" onClick={() => handleOpen(product)}>
                                                <FaRegEdit /> แก้ไข
                                            </button>
                                            <button className="souvenir-bt-del" onClick={() => handleDelete(product.product_id)}>
                                                <MdDelete /> ลบ
                                            </button>
                                        </td>

                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal open={open} onClose={handleClose}>
                <Box sx={{ width: 400, ...modalStyle }}>
                    <Typography variant="h6" gutterBottom>
                        แก้ไขข้อมูลสินค้า
                    </Typography>

                    {selectedProduct && (
                        <form style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    height: 180,
                                    maxWidth: 340,
                                    mx: "auto",
                                    my: 2,
                                    border: "1px solid #ddd",
                                    borderRadius: 2,
                                    backgroundColor: "#fafafa",
                                    overflow: "hidden",
                                }}
                            >
                                <img
                                    src={`http://localhost:3001/uploads/${selectedProduct.image}`}
                                    alt={selectedProduct.image}
                                    onError={(e) => (e.target.src = "/image/default.jpg")}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "contain",
                                    }}
                                />
                            </Box>
                            <TextField
                                label="ชื่อสินค้า"
                                variant="outlined"
                                fullWidth
                                value={selectedProduct.product_name}
                                onChange={(e) =>
                                    setSelectedProduct({ ...selectedProduct, product_name: e.target.value })
                                }
                            />

                            <TextField
                                label="ราคา"
                                variant="outlined"
                                type="number"
                                fullWidth
                                value={selectedProduct.price}
                                onChange={(e) =>
                                    setSelectedProduct({ ...selectedProduct, price: e.target.value })
                                }
                            />

                            <TextField
                                label="จำนวนในคลัง"
                                variant="outlined"
                                type="number"
                                fullWidth
                                value={selectedProduct.stock}
                                onChange={(e) =>
                                    setSelectedProduct({ ...selectedProduct, stock: e.target.value })
                                }
                            />

                            <FormControl fullWidth>
                                <InputLabel>สถานะ</InputLabel>
                                <Select
                                    value={selectedProduct.status}
                                    label="สถานะ"
                                    onChange={(e) =>
                                        setSelectedProduct({ ...selectedProduct, status: e.target.value })
                                    }
                                >
                                    <MenuItem value="1">กำลังจำหน่าย</MenuItem>
                                    <MenuItem value="0">ยังไม่จำหน่าย</MenuItem>
                                </Select>
                            </FormControl>

                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "flex-end", 
                                    alignItems: "center",
                                    gap: 2,                    
                                    padding: 2,                 
                                    mt: 2,                     
                                    borderTop: "1px solid #eee" ,
                                    maxWidth: 340,
                                }}
                            >
                                <Button onClick={handleClose} color="secondary" variant="outlined">
                                    ยกเลิก
                                </Button>
                                <Button
                                    color="primary"
                                    variant="contained"
                                    onClick={() => {
                                        axios.put(
                                            `http://localhost:3001/admin/editSouvenir/${selectedProduct.product_id}`,
                                            selectedProduct
                                        )
                                            .then(() => {
                                                setProducts((prev) =>
                                                    prev.map((p) =>
                                                        p.product_id === selectedProduct.product_id
                                                            ? selectedProduct
                                                            : p
                                                    )
                                                );
                                                setNotification({
                                                    open: true,
                                                    message: "บันทึกข้อมูลสำเร็จ",
                                                    severity: "success",
                                                });
                                                handleClose();
                                            })
                                            .catch(() => {
                                                setNotification({
                                                    open: true,
                                                    message: "บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่",
                                                    severity: "error",
                                                });
                                            });
                                    }}
                                >
                                    บันทึก
                                </Button>
                            </Box>

                        </form>
                    )}
                </Box>
            </Modal>

            <Modal open={detailOpen} onClose={handleCloseDetail}>
                <Box sx={{ width: 500, ...modalStyle }}>
                    {detailProduct && (
                        <>
                            <Typography variant="h6">{detailProduct.product_name}</Typography>
                            <img src={`http://localhost:3001/uploads/${detailProduct.image}`} alt="preview"
                                style={{ width: "100%", maxHeight: "200px", objectFit: "contain" }} />
                            <Typography>ราคา: {detailProduct.price} บาท</Typography>
                            <Typography>สถานะ: {statusLabel(detailProduct.status)}</Typography>
                            <Typography>ดูแลโดย: {roleNames[detailProduct.role_id]}</Typography>
                            <Typography>วันที่เพิ่ม: {new Date(detailProduct.created_at).toLocaleDateString("th-TH")}</Typography>
                            <div style={{ textAlign: "right", marginTop: 20 }}>
                                <Button onClick={() => {
                                    setSelectedProduct(detailProduct);
                                    setDetailOpen(false);
                                    setOpen(true);
                                }}>
                                    แก้ไข
                                </Button>
                                <Button onClick={handleCloseDetail}>ปิด</Button>
                            </div>
                        </>
                    )}
                </Box>
            </Modal>
        </>
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