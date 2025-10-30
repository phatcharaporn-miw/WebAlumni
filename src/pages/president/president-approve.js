import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { FaUser, FaBarcode, FaEdit, FaTrash, FaCheckCircle, FaHourglassHalf, FaTimesCircle } from "react-icons/fa";
import { Modal, Button, Box, Typography } from "@mui/material";
import Swal from "sweetalert2";
import { useAuth } from '../../context/AuthContext';
import {HOSTNAME} from '../../config.js';

// CSS & Bootstrap
import '../../css/profile.css';
import "../../css/president.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function Approve() {
    const [profile, setProfile] = useState({});
    const { user, handleLogout } = useAuth();
    const user_id = user?.user_id;
    const navigate = useNavigate();
    const [previewImage, setPreviewImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [notification, setNotification] = useState({
        open: false,
        message: "",
        severity: "info",
    });

    // ดึงข้อมูลโปรไฟล์
    useEffect(() => {
        axios.get(HOSTNAME +'/users/profile', { withCredentials: true })
            .then((response) => {
                if (response.data.success) {
                    setProfile(response.data.user);
                }
            })
            .catch((error) => {
                console.error('เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์:', error.response ? error.response.data.message : error.message);
            });
    }, []);


    useEffect(() => {
        window.scrollTo(0, 0);
        axios.get(HOSTNAME +"/admin/souvenir")
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
                axios.put(HOSTNAME +`/admin/approveSouvenir/${productId}`, {
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
                axios.put(HOSTNAME +`/admin/approveSouvenir/${productId}`, {
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
                axios.delete(HOSTNAME +`/admin/deleteSouvenir/${productId}`)
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

    // ฟังก์ชันเปลี่ยนหน้า
    const handleClick = (path) => {
        navigate(path);
    };

    // อัปโหลดรูปภาพ
    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // แสดง preview รูปก่อนอัปโหลด
        setPreviewImage(URL.createObjectURL(file));

        const formData = new FormData();
        formData.append("image_path", file);
        formData.append("user_id", profile.userId);

        try {
            const res = await axios.post(HOSTNAME +"/users/update-profile-image", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }, {
                withCredentials: true
            });

            if (res.status === 200) {
                alert("อัปโหลดรูปสำเร็จ");

                // อัปเดตรูปโปรไฟล์ใน state
                setProfile((prev) => ({
                    ...prev,
                    profilePicture: res.data.newImagePath,
                }));
            } else {
                alert(res.data.message || "เกิดข้อผิดพลาด");
            }
        } catch (err) {
            console.error(err);
            alert("ไม่สามารถอัปโหลดรูปได้");
        }
    };

    // if (loading) {
    //     return <div className="loading-container">กำลังโหลด...</div>;
    // }

    return (
        <section className="container py-4">
            <div className="president-profile-page">
                <div className="row justify-content-center g-4">
                    {/* Sidebar/Profile */}
                    <div className="col-12 col-md-3 mb-4">
                        <div className="bg-white rounded-4 shadow-sm text-center p-4">
                            <img
                                src={previewImage || profile.profilePicture}
                                alt="Profile"
                                style={{ width: "130px", height: "130px", borderRadius: "50%", objectFit: "cover", marginBottom: 16, border: '3px solid #eee' }}
                                className="img-fluid mb-2"
                            />
                            <div className="mt-2 mb-3">
                                <label
                                    htmlFor="upload-profile-pic"
                                    className="btn btn-sm btn-outline-secondary"
                                    style={{ cursor: "pointer" }}
                                >
                                    เปลี่ยนรูป
                                </label>
                                <input
                                    type="file"
                                    id="upload-profile-pic"
                                    className="d-none"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </div>
                            <hr className="w-100" />
                            <div className="menu d-block mt-3 w-100">
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/president-profile")}>โปรไฟล์ของฉัน</div>
                                {/* <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/president-profile/president-manage-orders")}>จัดการคำสั่งซื้อของที่ระลึก</div> */}
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/president-profile/president-profile-webboard")}>กระทู้ที่สร้าง</div>
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/president-profile/president-profile-donation")}>ประวัติการบริจาค</div>
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/president-profile/president-profile-activity")}>ประวัติการเข้าร่วมกิจกรรม</div>
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/president-profile/president-profile-souvenir")}>ประวัติการสั่งซื้อของที่ระลึก</div>
                                <div className="menu-item active py-2 mb-2 rounded" onClick={() => handleClick("/president-profile/president-approve")}>การอนุมัติ</div>
                                <div className="menu-item py-2 rounded" onClick={handleLogout}>ออกจากระบบ</div>
                            </div>
                        </div>
                    </div>
                    {/* Main Content */}
                    <div className="col-12 col-md-8">
                        {/* Header Section */}
                        <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center">
                                    <div>
                                        <h4 className="fw-bold mb-1">การอนุมัติ</h4>
                                        <p className="text-muted mb-0 small">รวบรวมการการอนุมัติ</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row g-3">
                            {products.map((product) => (
                                <div key={product.product_id} className="col-12 col-sm-6 col-md-4">
                                    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">

                                        {/* Product Image */}
                                        <div className="position-relative">
                                            <img
                                                src={HOSTNAME +`/uploads/${product.image}`}
                                                alt={product.product_name}
                                                className="card-img-top"
                                                style={{ height: "180px", objectFit: "cover" }}
                                            />
                                            {product.stock === 0 && (
                                                <span className="position-absolute top-0 start-0 bg-danger text-white px-2 py-1 rounded-end fw-bold small">
                                                    <FaTimesCircle className="me-1" /> สินค้าหมด
                                                </span>
                                            )}
                                        </div>

                                        {/* Card Body */}
                                        <div className="card-body d-flex flex-column p-3">
                                            <h6 className="card-title text-dark fw-semibold mb-2" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {product.product_name}
                                            </h6>

                                            {/* Price */}
                                            <div className="mb-2">
                                                <span className="bg-light border rounded-pill px-3 py-1 d-inline-flex align-items-center">
                                                    <span className="text-success fw-semibold">
                                                        ฿{product.price.toLocaleString()}
                                                    </span>
                                                </span>
                                            </div>

                                            {/* Admin Info */}
                                            <div className="d-flex align-items-center mb-3 text-muted small">
                                                <FaUser className="me-1" />
                                                ผู้ดูแล: <span className="fw-semibold ms-1">{product.full_name}</span>
                                            </div>

                                            {/* Status Badge */}
                                            <div className="mb-3">
                                                <span
                                                    className={`badge rounded-pill px-3 py-2 ${product.status === "1"
                                                            ? "bg-success text-white"
                                                            : "bg-warning text-white"
                                                        }`}
                                                    style={{ fontSize: "0.75rem", fontWeight: '600' }}
                                                >
                                                    {product.status === "1" ? (
                                                        <>
                                                            <FaCheckCircle className="me-1" /> กำลังจำหน่าย
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FaHourglassHalf className="me-1" /> ยังไม่จำหน่าย
                                                        </>
                                                    )}
                                                </span>
                                            </div>

                                            {/* Buttons */}
                                            <div className="mt-auto d-flex flex-column gap-2">
                                                {product.status === "0" ? (
                                                    <>
                                                        <button
                                                            className="btn btn-sm btn-outline-success rounded-pill w-100"
                                                            onClick={() => handleApprove(product.product_id)}
                                                        >
                                                            อนุมัติ
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger rounded-pill w-100"
                                                            onClick={() => handleReject(product.product_id)}
                                                        >
                                                            ปฏิเสธ
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            className="btn btn-sm btn-outline-warning rounded-pill w-100"
                                                            onClick={() => handleOpen(product)}
                                                        >
                                                            แก้ไข
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger rounded-pill w-100"
                                                            onClick={() => handleDelete(product.product_id)}
                                                        >
                                                            ลบ
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
                                axios.put(HOSTNAME +`/admin/editSouvenir/${selectedProduct.product_id}`, selectedProduct)
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
        </section>
    );
}

export default Approve;
