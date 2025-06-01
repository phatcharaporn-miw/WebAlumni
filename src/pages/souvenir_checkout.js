import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "../css/SouvenirCheckout.css";

function SouvenirCheckout() {
    const [deliveryAddress, setDeliveryAddress] = useState("");
    const [checkoutCart, setCheckoutCart] = useState([]);
    const userId = localStorage.getItem("userId");
    const location = useLocation();
    const navigate = useNavigate();

    const selectedItems = location.state?.selectedItems || JSON.parse(localStorage.getItem('selectedItems')) || [];

    useEffect(() => {
        if (userId) {
            axios.get(`http://localhost:3001/souvenir/cart?user_id=${userId}`,{
                 withCredentials: true
            })
                .then(response => {
                    setCheckoutCart(Array.isArray(response.data) ? response.data : []);
                })
                .catch(error => {
                    console.error("Error fetching cart:", error);
                    setCheckoutCart([]);
                });
        }
    }, [userId]);

    const getCheckoutTotalPrice = () => {
        // ตรวจสอบว่า price และ quantity เป็นตัวเลขก่อนคำนวณ
        return selectedItems.reduce((total, item) => {
            const price = parseFloat(item.price);
            const quantity = parseInt(item.quantity);
            if (!isNaN(price) && !isNaN(quantity)) {
                return total + price * quantity;
            }
            return total;
        }, 0);
    };

    const handleCancel = () => {
        navigate(-1); 
    };

    const handleCheckout = () => {
        if (selectedItems.length === 0) {
            alert("กรุณาเลือกสินค้าก่อนชำระเงิน");
            return;
        }

        if (!deliveryAddress.trim()) {
            alert("กรุณากรอกที่อยู่จัดส่ง");
            return;
        }

        const totalAmount = getCheckoutTotalPrice();
        if (totalAmount === 0) {
            alert("ยอดรวมไม่ถูกต้อง");
            return;
        }

        const selectedProducts = checkoutCart
            .filter(item => selectedItems.some(selectedItem => selectedItem.product_id === item.product_id))
            .map(item => ({
                product_id: item.product_id,
                product_name: item.product_name,
                price: Number(item.price),
                quantity: item.quantity,
                image: item.image,
                total: item.price * item.quantity
            }));

        const orderData = {
            user_id: userId,
            products: selectedProducts,
            total_amount: totalAmount,
            shippingAddress: deliveryAddress,
        };

        axios.post("http://localhost:3001/souvenir/checkout", orderData,{
            withCredentials: true
        })
            .then(response => {
                alert("การชำระเงินสำเร็จ!");
                navigate("/souvenir/souvenir_history");
            })
            .catch(error => {
                console.error("Error during checkout:", error);
                if (error.response) {
                    // แสดงข้อความที่ได้รับจาก server
                    alert("เกิดข้อผิดพลาดในการชำระเงิน: " + error.response.data.error || "ไม่ทราบข้อผิดพลาด");
                } else {
                    alert("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
                }
            });
    };

    return (
        <div className="checkout-container">
            <h2 className="checkout-title">หน้าชำระเงิน</h2>
            <div className="checkout-content">
                <div className="checkout-items">
                    <h3>สินค้าในตะกร้า</h3>
                    {selectedItems.length > 0 ? (
                        selectedItems.map((item) => (
                            <div className="checkout-item-card" key={item.product_id}>
                                <div className="checkout-item-image">
                                    <img
                                        src={`http://localhost:3001/uploads/${item.image}`}
                                        alt={item.product_name}
                                        className="checkout-product-img"
                                    />
                                </div>
                                <div className="checkout-item-info">
                                    <p className="checkout-item-name">{item.product_name}</p>
                                    <p>฿{item.price.toLocaleString()}</p>
                                    <p>จำนวน: {item.quantity}</p>
                                    <p className="checkout-item-subtotal">ราคารวม: ฿{(item.price * item.quantity).toLocaleString()}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>ไม่มีสินค้าในตะกร้า</p>
                    )}

                </div>

                <div className="checkout-form">
                    <h3>ข้อมูลการจัดส่ง</h3>
                    <textarea
                        className="checkout-address"
                        placeholder="ที่อยู่จัดส่ง"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                    />
                    <div className="checkout-summary">
                        <h4>ยอดรวม: ฿{getCheckoutTotalPrice().toLocaleString()}</h4>
                        <div className="checkout-summary_button">
                            <button className="checkout-button_cancel" onClick={handleCancel}>
                                ยกเลิก
                            </button>
                            <button className="checkout-button" onClick={handleCheckout}>
                                ยืนยันการชำระเงิน
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SouvenirCheckout;
