import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useOutletContext } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";

// CSS & Bootstrap
import '../../css/profile.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function PresidentProfileSouvenir() {
    const [profile, setProfile] = useState({});
    const { handleLogout } = useOutletContext();
    const navigate = useNavigate();
    const [orderHistory, setOrderHistory] = useState([]);
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

    if (loading) {
        return <div className="loading-container">กำลังโหลด...</div>;
    }

    return (
        <section className='container'>
            <div className='alumni-profile-page'>
                {/* <h3 className="alumni-title text-center">โปรไฟล์ของฉัน</h3> */}
                <div className="row justify-content-between">
                    <div className="col-12 col-md-4 bg-light rounded text-center p-4 my-4">
                        <div className="profile-pic-container mb-3">
                            <img 
                            src={`${profile.profilePicture}`} 
                            alt="Profile" 
                            style={{ width: '140px', height: '140px', borderRadius: '50%' }}
                            className="img-fluid"
                            />
                        </div>

                        <p className="fw-bold mb-3">{profile.fullName}</p>
                        
                        <div className="menu">
                            <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick('/president-profile')}>
                            ข้อมูลส่วนตัว
                            </div>
                            <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick('/president-profile/president-profile-webboard')}>
                            กระทู้ที่สร้าง
                            </div>
                            <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick('/president-profile/president-profile-donation')}>
                            ประวัติการบริจาค
                            </div>
                            <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick('/president-profile/president-profile-activity')}>
                            ประวัติการเข้าร่วมกิจกรรม
                            </div>
                            <div className="menu-item active py-2 mb-2 rounded" onClick={() => handleClick('/president-profile/president-profile-souvenir')}>
                            ประวัติการสั่งซื้อ
                            </div>
                            <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick('/president-profile/president-approve')}>
                            การอนุมัติ
                            </div>
                            <div className="menu-item py-2 rounded" onClick={handleLogout}>
                            ออกจากระบบ
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

export default PresidentProfileSouvenir;
