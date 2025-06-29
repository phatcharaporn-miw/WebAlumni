import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import "../css/Souvenir.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Swal from "sweetalert2";
import { useCart } from '../context/CartContext'; // เพิ่มการ import Cart Context

function SouvenirBasket() {
    const [cart, setCart] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [formData, setFormData] = useState({ amount: 0 });
    const userId = localStorage.getItem('userId');
    const navigate = useNavigate();

    // ใช้ Cart Context
    const { getCartCount } = useCart();

    const fetchCart = useCallback(() => {
        if (!userId) return;

        axios.get(`http://localhost:3001/souvenir/cart?user_id=${userId}`, {
            withCredentials: true
        })
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

    const handleDeleteItem = async (productId) => {
        try {
            await axios.delete(`http://localhost:3001/souvenir/cart/${productId}`, {
                data: { userId: userId },
                withCredentials: true
            });

            // อัปเดต local state
            setCart(prevCart => prevCart.filter(item => item.product_id !== productId));

            // อัปเดต selectedItems ถ้าสินค้าที่ลบถูกเลือกอยู่
            setSelectedItems(prevSelected =>
                prevSelected.filter(item => item.product_id !== productId)
            );

            // อัปเดตจำนวนตะกร้าใน Header ทันที
            await getCartCount(userId);

            // แสดงข้อความแจ้งเตือน
            Swal.fire({
                title: "ลบสินค้าสำเร็จ",
                text: "ลบสินค้าออกจากตะกร้าแล้ว",
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });

        } catch (error) {
            console.error("Error deleting item:", error);

            Swal.fire({
                title: "เกิดข้อผิดพลาด",
                text: "ไม่สามารถลบสินค้าได้ กรุณาลองใหม่อีกครั้ง",
                icon: "error",
                confirmButtonText: "ตกลง"
            });
        }
    };

    const handleUpdateQuantity = async (productId, newQuantity) => {
        if (newQuantity <= 0) return;

        try {
            await axios.put(`http://localhost:3001/souvenir/cart/update`, {
                user_id: userId,
                product_id: productId,
                quantity: newQuantity
            }, {
                withCredentials: true
            });

            // อัปเดต local state
            setCart(prevCart => prevCart.map(item =>
                item.product_id === productId ? { ...item, quantity: newQuantity } : item
            ));

            // อัปเดต selectedItems ถ้าสินค้าที่แก้ไขถูกเลือกอยู่
            setSelectedItems(prevSelected =>
                prevSelected.map(item =>
                    item.product_id === productId ? { ...item, quantity: newQuantity } : item
                )
            );

            // อัปเดตจำนวนตะกร้าใน Header ทันที (ถ้า backend คำนวณจำนวนจาก quantity รวม)
            await getCartCount(userId);

        } catch (error) {
            console.error("Error updating quantity:", error);

            Swal.fire({
                title: "เกิดข้อผิดพลาด",
                text: "ไม่สามารถแก้ไขจำนวนสินค้าได้ กรุณาลองใหม่อีกครั้ง",
                icon: "error",
                confirmButtonText: "ตกลง"
            });
        }
    };

    // เพิ่มฟังก์ชันลบสินค้าที่เลือกทั้งหมด
    const handleDeleteSelectedItems = async () => {
        if (selectedItems.length === 0) {
            Swal.fire({
                title: "ไม่มีสินค้าที่เลือก",
                text: "กรุณาเลือกสินค้าที่ต้องการลบ",
                icon: "warning",
                confirmButtonText: "ตกลง"
            });
            return;
        }

        const result = await Swal.fire({
            title: "ยืนยันการลบ",
            text: `คุณต้องการลบสินค้า ${selectedItems.length} รายการหรือไม่?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "ลบ",
            cancelButtonText: "ยกเลิก",
            confirmButtonColor: "#d33"
        });

        if (result.isConfirmed) {
            try {
                // ลบสินค้าทีละรายการ
                for (const item of selectedItems) {
                    await axios.delete(`http://localhost:3001/souvenir/cart/${item.product_id}`, {
                        data: { userId: userId },
                        withCredentials: true
                    });
                }

                // อัปเดต local state
                setCart(prevCart =>
                    prevCart.filter(item =>
                        !selectedItems.some(selected => selected.product_id === item.product_id)
                    )
                );

                // ล้าง selectedItems
                setSelectedItems([]);

                // อัปเดตจำนวนตะกร้าใน Header
                await getCartCount(userId);

                Swal.fire({
                    title: "ลบสินค้าสำเร็จ",
                    text: `ลบสินค้า ${selectedItems.length} รายการแล้ว`,
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false
                });

            } catch (error) {
                console.error("Error deleting selected items:", error);

                Swal.fire({
                    title: "เกิดข้อผิดพลาด",
                    text: "ไม่สามารถลบสินค้าได้ กรุณาลองใหม่อีกครั้ง",
                    icon: "error",
                    confirmButtonText: "ตกลง"
                });
            }
        }
    };

    const getTotalPrice = () => {
        return selectedItems.reduce((total, selectedItem) => {
            const cartItem = cart.find(item => item.product_id === selectedItem.product_id);
            return cartItem ? total + (cartItem.price * cartItem.quantity) : total;
        }, 0);
    };

    const handleCheckoutClick = () => {
        if (selectedItems.length === 0) {
            Swal.fire({
                title: "ไม่มีสินค้าที่เลือก",
                text: "กรุณาเลือกสินค้าอย่างน้อย 1 รายการก่อนดำเนินการชำระเงิน",
                icon: "warning",
                confirmButtonText: "ตกลง"
            });
            return;
        }

        navigate("/souvenir/checkout", {
            state: { selectedItems: selectedItems }
        });
    };

    // เพิ่มฟังก์ชันเลือกสินค้าทั้งหมด
    const handleSelectAll = () => {
        if (selectedItems.length === cart.length) {
            // ถ้าเลือกครบแล้ว ให้ยกเลิกการเลือกทั้งหมด
            setSelectedItems([]);
        } else {
            // เลือกสินค้าทั้งหมด
            setSelectedItems(cart.map(item => ({ ...item, isSelected: true })));
        }
    };

    return (
        <>
            <h3 className="titlesouvenirBasket">ตะกร้าสินค้า</h3>
            <div className="souvenirBasket-content">
                <hr />
                {cart.length > 0 ? (
                    <div className="cart-items-container">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5>รายการสินค้า ({cart.length} รายการ)</h5>
                            <div>
                                <button
                                    className="btn btn-outline-primary btn-sm me-2"
                                    onClick={handleSelectAll}
                                >
                                    {selectedItems.length === cart.length ? "ยกเลิกเลือกทั้งหมด" : "เลือกทั้งหมด"}
                                </button>
                                {selectedItems.length > 0 && (
                                    <button
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={handleDeleteSelectedItems}
                                    >
                                        ลบที่เลือก ({selectedItems.length})
                                    </button>
                                )}
                            </div>
                        </div>

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
                                    <button
                                        className="quantity-btn"
                                        onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}
                                        disabled={item.quantity <= 1}
                                    >
                                        -
                                    </button>
                                    <span>{item.quantity}</span>
                                    <button
                                        className="quantity-btn"
                                        onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                                    >
                                        +
                                    </button>
                                </div>
                                <p>฿{item.price * item.quantity}</p>
                                <button
                                    className="souvenir-del"
                                    onClick={() => handleDeleteItem(item.product_id)}
                                >
                                    ลบ
                                </button>
                            </div>
                        ))}

                        {selectedItems.length > 0 && (
                            <div className="cart-summary mt-3 p-3 bg-light rounded">
                                <div className="d-flex justify-content-between">
                                    <span>สินค้าที่เลือก: {selectedItems.length} รายการ</span>
                                    <span className="fw-bold">รวม: ฿{getTotalPrice().toLocaleString()}</span>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center text-muted py-5">
                        <p>ไม่มีสินค้าในตะกร้า 😢</p>
                        <button
                            className="btn btn-primary mt-3"
                            onClick={() => navigate('/souvenir')}
                        >
                            เลือกซื้อสินค้า
                        </button>
                    </div>
                )}

                {cart.length > 0 && selectedItems.length > 0 && (
                    <div className="text-end mt-4">
                        <button
                            className="btn btn-success px-4 py-2"
                            onClick={handleCheckoutClick}
                        >
                            ดำเนินการชำระเงิน ({selectedItems.length} รายการ)
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}

export default SouvenirBasket;