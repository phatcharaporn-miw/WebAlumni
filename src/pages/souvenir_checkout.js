import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "../css/Souvenir.css";

function SouvenirCheckout() {
    const [deliveryAddress, setDeliveryAddress] = useState("");
    const [checkoutCart, setCheckoutCart] = useState([]);
    const userId = localStorage.getItem("userId");
    const location = useLocation();

    // ดึง selectedItems จาก location.state ที่ส่งมาจากหน้าตะกร้า
    const selectedItems = location.state?.selectedItems || JSON.parse(localStorage.getItem('selectedItems')) || [];
    
    const navigate = useNavigate();

    useEffect(() => {
        if (userId) {
            axios.get(`http://localhost:3001/souvenir/cart?user_id=${userId}`)
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
        return checkoutCart
            .filter(item => selectedItems.some(selectedItem => selectedItem.product_id === item.product_id))
            .reduce((total, item) => total + item.price * item.quantity, 0);
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

        const selectedProducts = checkoutCart.filter(item =>
            selectedItems.some(selectedItem => selectedItem.product_id === item.product_id)
        );

        const orderData = {
            user_id: userId,
            products: selectedProducts,
            total_amount: totalAmount,
            shippingAddress: deliveryAddress,
        };

        axios.post("http://localhost:3001/souvenir/checkout", orderData)
            .then(response => {
                alert("การชำระเงินสำเร็จ!");
                navigate("/souvenir/souvenir_history");
            })
            .catch(error => {
                console.error("Error during checkout:", error);
                alert("เกิดข้อผิดพลาดในการชำระเงิน");
            });
    };

    return (
        <div className="souvenir-checkout-container">
            <h3>หน้าชำระเงิน</h3>
            <div className="souvenir-checkout-content">
                <div className="souvenir-checkout-items">
                    <h4>สินค้าในตะกร้า</h4>
                    {selectedItems.length > 0 ? (
                        selectedItems.map((item) => (
                            <div key={item.product_id}>
                                <p>{item.product_name}</p>
                                <p>฿{item.price}</p>
                                <p>จำนวน: {item.quantity}</p>
                                <p>ราคารวม: ฿{item.price * item.quantity}</p>
                            </div>
                        ))
                    ) : (
                        <p>ไม่มีสินค้าในตะกร้า</p>
                    )}
                </div>

                <div className="souvenir-checkout-form">
                    <h4>ข้อมูลการจัดส่ง</h4>
                    <textarea
                        placeholder="ที่อยู่จัดส่ง"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                    />
                    <h4>ยอดรวม: ฿{getCheckoutTotalPrice()}</h4>
                    <button onClick={handleCheckout}>ยืนยันการชำระเงิน</button>
                </div>
            </div>
        </div>
    );
}

export default SouvenirCheckout;
