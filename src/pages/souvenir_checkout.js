import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import "../css/Souvenir.css";


function SouvenirCheckout() {
    const [deliveryAddress, setDeliveryAddress] = useState("");
    const [checkoutCart, setCheckoutCart] = useState([]);
    const userId = localStorage.getItem("userId");
    const location = useLocation();
    const selectedItems = location.state?.selectedItems || [];
    const navigate = useNavigate();

    console.log("Selected items in checkout:", selectedItems); 
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

    //ยอดรวมของการสั่งซื้อ
    const getCheckoutTotalPrice = () => {
        return checkoutCart
            .filter(item => selectedItems.includes(item.product_id))
            .reduce((total, item) => total + item.price * item.quantity, 0);
    };

    //ยืนยันการชำระเงิน
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
        if (!totalAmount) {
            alert("ยอดรวมไม่ถูกต้อง");
            return;
        }

        const selectedProducts = checkoutCart.filter(item => selectedItems.includes(item.product_id));
        console.log("selectedProducts:", selectedProducts);

        const orderData = {
            user_id: userId,
            products: selectedProducts,
            total_amount: totalAmount,
            shippingAddress: deliveryAddress,
        };

        // ส่งข้อมูลคำสั่งซื้อไปที่เซิร์ฟเวอร์
        axios.post("http://localhost:3001/souvenir/checkout", orderData)
            .then(response => {
                console.log("Order response:", response.data);
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
            <h3 className="souvenir-checkout-title">หน้าชำระเงิน</h3>
            <div className="souvenir-checkout-content">
                <div className="souvenir-checkout-items">
                    <h4>สินค้าในตะกร้า</h4>
                    <div className="souvenir-cart-items-container">
                        {checkoutCart.length > 0 ? (
                            checkoutCart.filter(item => selectedItems.includes(item.product_id)).map((item) => (
                                <div className="souvenir-cart-item-card" key={item.product_id}>
                                    <div className="souvenir-cart-item-img">
                                        <img
                                            src={item.image ? `http://localhost:3001/uploads/${item.image}` : "/images/product-default.png"}
                                            alt={item.product_name}
                                        />
                                    </div>
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
                </div>

                <div className="souvenir-checkout-form">
                    <h4>ข้อมูลการจัดส่ง</h4>
                    <textarea
                        placeholder="ที่อยู่จัดส่ง"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                    />

                    <h4>การชำระเงิน</h4>

                    <div className="souvenir-checkout-summary">
                        <h4>ยอดรวม: ฿{getCheckoutTotalPrice()}</h4>
                    </div>

                    <button className="souvenir-checkout-button" onClick={handleCheckout}>
                        ยืนยันการชำระเงิน
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SouvenirCheckout;
