import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useOutletContext } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";

// CSS & Bootstrap
import '../../css/profile.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function AlumniProfileSouvenir() {
    const [profile, setProfile] = useState({});
    const { handleLogout } = useOutletContext();
    const navigate = useNavigate();
    const [orderHistory, setOrderHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const userId = localStorage.getItem("userId");
    const [previewImage, setPreviewImage] = useState(null);

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
                {/* <h3 className="alumni-title text-center">โปรไฟล์ของฉัน</h3> */}
                <div className="row justify-content-between">
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
                            <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/alumni-profile")}>ข้อมูลส่วนตัว</div>
                            <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/alumni-profile/alumni-profile-webboard")}>กระทู้ที่สร้าง</div>
                            <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/alumni-profile/donation-history")}>ประวัติการบริจาค</div>
                            <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/alumni-profile/alumni-profile-activity")}>ประวัติการเข้าร่วมกิจกรรม</div>
                            <div className="menu-item active py-2 mb-2 rounded" onClick={() => handleClick("/alumni-profile/alumni-profile-souvenir")}>ประวัติการสั่งซื้อ</div>
                            <div className="menu-item py-2 rounded" onClick={handleLogout}>ออกจากระบบ</div>
                        </div>
                        </div>
                    </div>

                    {/* <div className="col-7">
                        <h4 className="alumni-title text-center">ประวัติการสั่งซื้อ</h4>
                        {orderHistory.length === 0 ? (
                            <div className="no-orders text-center">ยังไม่มีการสั่งซื้อ</div>
                        ) : (
                            <div className="order-history-list">
                                {orderHistory.map(order => (
                                    <div key={order.order_id} className="order-card">
                                        <div className="order-header">
                                            <h4>คำสั่งซื้อ #{order.order_id}</h4>
                                            <p>{new Date(order.order_date).toLocaleDateString()}</p>
                                            <p>สถานะ: {order.order_status}</p>
                                            <p>ยอดรวม: ฿{order.total_amount}</p>
                                            <p>สถานะการชำระเงิน: {order.payment_status}</p>
                                        </div>

                                        <div className="order-details">
                                            <h5>รายละเอียดสินค้า</h5>
                                            {order.details?.map(item => (
                                                <div key={item.product_id} className="order-item">
                                                    <img
                                                        src={`http://localhost:3001/uploads/${item.image || "product-default.png"}`}
                                                        alt={item.product_name}
                                                        className="product-image"
                                                    />
                                                    <div>
                                                        <h5>{item.product_name}</h5>
                                                        <p>จำนวน: {item.quantity}</p>
                                                        <p>ราคารวม: ฿{item.total}</p>
                                                    </div>
                                                </div>
                                            )) || <p>ไม่มีรายการสินค้า</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button className="back-button mt-3" onClick={() => navigate("/souvenir")}>ย้อนกลับ</button>
                    </div> */}
                </div>
            </div>
        </section>
    );
}

export default AlumniProfileSouvenir;
