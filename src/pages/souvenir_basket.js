import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import "../css/Souvenir.css";

function SouvenirBasket() {
    const [cart, setCart] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [formData, setFormData] = useState({ amount: 0 });
    const userId = localStorage.getItem('userId');
    const navigate = useNavigate();

    const fetchCart = useCallback(() => {
        if (!userId) return;

        axios.get(`http://localhost:3001/souvenir/cart?user_id=${userId}`)
            .then(response => {
                setCart(Array.isArray(response.data) ? response.data : []);
            })
            .catch(error => {
                console.error("Error fetching cart:", error);
                setCart([]);
            });
    }, [userId]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const handleSelectItem = (productId) => {
        const selectedItem = cart.find(item => item.product_id === productId);

        setSelectedItems(prevState => {
            const isAlreadySelected = prevState.some(item => item.product_id === productId);

            if (isAlreadySelected) {
                return prevState.filter(item => item.product_id !== productId);
            } else {
                return [...prevState, { ...selectedItem, isSelected: true }];
            }
        });
    };

    const handleDeleteItem = (productId) => {
        axios.delete(`http://localhost:3001/souvenir/cart/${productId}`, {
        data: { userId: userId } // ส่ง userId ไปใน body ของ request
    })
        .then(() => {
            setCart(prevCart => prevCart.filter(item => item.product_id !== productId));
        })
        .catch(error => {
            console.error("Error deleting item:", error);
        });
    };

    const handleUpdateQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) return;

        axios.put(`http://localhost:3001/souvenir/cart/update`, {
            user_id: userId,
            product_id: productId,
            quantity: newQuantity
        })
            .then(() => {
                setCart(prevCart => prevCart.map(item =>
                    item.product_id === productId ? { ...item, quantity: newQuantity } : item
                ));
            })
            .catch(error => {
                console.error("Error updating quantity:", error);
            });
    };

    const getTotalPrice = () => {
        return cart.reduce((total, item) => selectedItems.includes(item.product_id)
            ? total + (item.price * item.quantity) : total, 0);
    };

    const handleCheckoutClick = () => {
        if (selectedItems.length === 0) {
            alert("กรุณาเลือกสินค้าอย่างน้อย 1 รายการก่อนดำเนินการชำระเงิน");
            return;
        }
        navigate("/souvenir/checkout", {
            state: { selectedItems: selectedItems }
        });
    };



    return (
        <>
            <h3 className="titlesouvenirBasket">ตะกร้าสินค้า</h3>
            <div className="souvenirBasket-content">
                <hr />
                {cart.length > 0 ? (
                    <div className="cart-items-container">
                        <h5>รายการสินค้า</h5>
                        <div className="cart-items-title">
                            <p>เลือก</p>
                            <p>สินค้า</p>
                            <p>ราคาต่อชิ้น</p>
                            <p>จำนวน</p>
                            <p>ราคารวม</p>
                            <p>จัดการ</p>
                        </div>
                        {cart.map((item) => (
                            <div
                                key={item.product_id}
                                className={`cart-item-card ${selectedItems.some(selectedItem => selectedItem.product_id === item.product_id) ? 'selected' : ''}`}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedItems.some(selectedItem => selectedItem.product_id === item.product_id)}
                                    onChange={() => handleSelectItem(item.product_id)}
                                />
                                <div className="cart-item-img">
                                    <img
                                        src={item.image ? `http://localhost:3001/uploads/${item.image}` : "/images/product-default.png"}
                                        alt={item.product_name}
                                    />
                                    <p>{item.product_name}</p>
                                </div>
                                <p>฿{item.price}</p>
                                <div className="quantity-control">
                                    <button className="quantity-btn" onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}>-</button>
                                    <span>{item.quantity}</span>
                                    <button className="quantity-btn" onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}>+</button>
                                </div>
                                <p>฿{item.price * item.quantity}</p>
                                <button className="souvenir-del" onClick={() => handleDeleteItem(item.product_id)}>ลบ</button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>ไม่มีสินค้าในตะกร้า</p>
                )}
                <button className="souvenir-checkout" onClick={handleCheckoutClick}>ดำเนินการชำระเงิน</button>
            </div>
        </>
    );
}

export default SouvenirBasket;
