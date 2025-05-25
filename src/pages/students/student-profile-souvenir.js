import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useOutletContext } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";

// CSS & Bootstrap
import '../../css/profile.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function StudentProfileSouvenir() {
    const [profile, setProfile] = useState({});
    const { handleLogout } = useOutletContext();
    const navigate = useNavigate();
    const [orderHistory, setOrderHistory] = useState([]);
    const [previewImage, setPreviewImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const userId = localStorage.getItem("userId");

    // ดึงข้อมูลโปรไฟล์
    useEffect(() => {
        axios.get('http://localhost:3001/users/profile', { withCredentials: true })
            .then((response) => {
                if (response.data.success) {
                    setProfile(response.data.user);
                }
            })
            .catch((error) => {
                console.error('เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์:', error.response ? error.response.data.message : error.message);
            });
    }, []);

    // ดึงประวัติการสั่งซื้อ
    useEffect(() => {
        if (userId) {
            axios.get(`http://localhost:3001/souvenir/order_history?user_id=${userId}`)
                .then(response => {
                    setOrderHistory(response.data);
                })
                .catch(error => {
                    console.error("Error fetching order history:", error);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [userId]);

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
            const res = await axios.post("http://localhost:3001/users/update-profile-image", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
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

    if (loading) {
        return <div className="loading-container">กำลังโหลด...</div>;
    }

    return (
        <section className='container py-4'>
            <div className='alumni-profile-page'>
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
                            <div className="mt-2">
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
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/student-profile")}>ข้อมูลส่วนตัว</div>
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/student-profile/student-profile-webboard")}>กระทู้ที่สร้าง</div>
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/student-profile/donation-history")}>ประวัติการบริจาค</div>
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/student-profile/student-profile-activity")}>ประวัติการเข้าร่วมกิจกรรม</div>
                                <div className="menu-item active py-2 mb-2 rounded" onClick={() => handleClick("/student-profile/student-profile-souvenir")}>ประวัติการสั่งซื้อ</div>
                                <div className="menu-item py-2 rounded" onClick={handleLogout}>ออกจากระบบ</div>
                            </div>
                        </div>
                    </div>
                    {/* Main Content */}
                    <div className="col-12 col-md-8">
                        {/* <h4 className="alumni-title text-center mb-4">ประวัติการสั่งซื้อ</h4> */}
                        {orderHistory.length === 0 ? (
                            <div className="no-orders text-center py-5 text-muted">ยังไม่มีการสั่งซื้อ</div>
                        ) : (
                            <div className="order-history-list row g-4">
                                {orderHistory.map(order => (
                                    <div key={order.order_id} className="order-card col-12">
                                        <div className="card shadow-sm rounded-4 p-3 mb-3">
                                            <div className="order-header mb-2 d-flex flex-wrap justify-content-between align-items-center">
                                                <div>
                                                    <h5 className="mb-1">คำสั่งซื้อ #{order.order_id}</h5>
                                                    <div className="small text-secondary">{new Date(order.order_date).toLocaleDateString()}</div>
                                                </div>
                                                <div className="text-end">
                                                    <span className="badge bg-info me-1">{order.order_status}</span>
                                                    <span className="badge bg-success">{order.payment_status}</span>
                                                </div>
                                            </div>
                                            <div className="mb-2">ยอดรวม: <b>฿{order.total_amount}</b></div>
                                            <div className="order-details">
                                                <h6 className="fw-bold">รายละเอียดสินค้า</h6>
                                                {order.details?.length > 0 ? (
                                                    order.details.map(item => (
                                                        <div key={item.product_id} className="order-item d-flex align-items-center mb-2 p-2 bg-light rounded-3">
                                                            <img
                                                                src={`http://localhost:3001/uploads/${item.image || "product-default.png"}`}
                                                                alt={item.product_name}
                                                                className="product-image me-3"
                                                                style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }}
                                                            />
                                                            <div>
                                                                <div className="fw-bold">{item.product_name}</div>
                                                                <div className="small">จำนวน: {item.quantity}</div>
                                                                <div className="small">ราคารวม: ฿{item.total}</div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : <p className="text-muted">ไม่มีรายการสินค้า</p>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default StudentProfileSouvenir;
