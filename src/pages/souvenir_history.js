import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/OrderHistory.css";
import {useAuth} from '../context/AuthContext';
import {HOSTNAME} from '../config.js';

function OrderHistory() {
    const [orderHistory, setOrderHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const {user} = useAuth();
    const userId = user?.user_id;
    const navigate = useNavigate();
    
    useEffect(() => {
        if (userId) {
            axios.get(HOSTNAME + `/souvenir/order_history?user_id=${userId}`,{
                withCredentials: true
            })
                .then(response => {
                    setOrderHistory(response.data);
                    setLoading(false);
                })
                .catch(error => {
                    console.error("Error fetching order history:", error);
                    setLoading(false);
                });
        }
    }, [userId]);

    if (loading) {
        return <div className="loading-container">กำลังโหลด...</div>;
    }

    if (orderHistory.length === 0) {
        return <div className="no-orders">การสั่งซื้อ</div>;
    }

    return (
        <div className="order-history-container">
            <h3>การสั่งซื้อ</h3>
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
                            {order.details.map(item => (
                                <div key={item.product_id} className="order-item">
                                    <img
                                        src={HOSTNAME + `/uploads/${item.image || "product-default.png"}`}
                                        alt={item.product_name}
                                        className="product-image"
                                    />
                                    <div>
                                        <h5>{item.product_name}</h5>
                                        <p>จำนวน: {item.quantity}</p>
                                        <p>ราคารวม: ฿{item.total}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <button className="back-button" onClick={() => navigate("/souvenir")}>ย้อนกลับ</button>
        </div>
    );
}

export default OrderHistory;
