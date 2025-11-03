import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import "../css/Souvenir.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Swal from "sweetalert2";
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {HOSTNAME} from '../config.js';

function SouvenirBasket() {
    const [cart, setCart] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const [selectedItems, setSelectedItems] = useState([]);
    const [updatingItems, setUpdatingItems] = useState(new Set());
    const [stockInfo, setStockInfo] = useState({});
    // const userId = sessionStorage.getItem('userId');
    const [totalPrice, setTotalPrice] = useState(0);
    const { user } = useAuth();
    const navigate = useNavigate();
    const { getCartCount } = useCart();
    const { setCartCount: setGlobalCartCount } = useCart();
    const fetchCart = useCallback(() => {
        if (!user || !user.user_id) {
            Swal.fire({
                title: "กรุณาเข้าสู่ระบบ",
                text: "คุณต้องเข้าสู่ระบบเพื่อดูตะกร้าสินค้า",
                icon: "warning",
                confirmButtonText: "ตกลง"
            }).then(() => navigate('/login'));
            return;
        }

        axios.get(HOSTNAME + `/souvenir/cart?user_id=${user.user_id}`, {
            withCredentials: true,
            headers: { "Cache-Control": "no-cache" }
        })
            .then(response => {
                const cartData = Array.isArray(response.data) ? response.data : [];
                setCart(cartData);
                const stockData = {};
                cartData.forEach(item => {
                    if (item.stock_remaining !== undefined) {
                        stockData[item.product_id] = {
                            remaining: item.stock_remaining,
                            reserved: item.stock_reserved,
                            sold: item.stock_sold
                        };
                    }
                });
                setStockInfo(stockData);
            })
            .catch(error => {
                console.error("Error fetching cart:", error);
                setCart([]);
                if (error.response?.status !== 401) {
                    Swal.fire({
                        title: "เกิดข้อผิดพลาด",
                        text: "ไม่สามารถดึงข้อมูลตะกร้าได้",
                        icon: "error",
                        confirmButtonText: "ตกลง"
                    });
                }
            });
    }, [user, navigate]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    // ปรับ handleSelectItem
    const handleSelectItem = (productId) => {
        const selectedItem = cart.find(item => item.product_id === productId);
        if (!selectedItem) return;

        const isAlreadySelected = selectedItems.some(item => item.product_id === productId);

        if (isAlreadySelected) {
            setSelectedItems(prev => prev.filter(item => item.product_id !== productId));
        } else if (selectedItems.length === 0) {
            setSelectedItems([{ ...selectedItem, isSelected: true }]);
        } else {
            const currentPromptpay = selectedItems[0].promptpay_number;
            const currentSeller = selectedItems[0].seller_id;

            if (selectedItem.promptpay_number === currentPromptpay &&
                selectedItem.seller_id === currentSeller) {
                setSelectedItems(prev => [...prev, { ...selectedItem, isSelected: true }]);
            } else {
                Swal.fire({
                    title: "เลือกสินค้าไม่ได้",
                    text: "สามารถเลือกได้เฉพาะสินค้าที่มี PromptPay และผู้ขายเดียวกันเท่านั้น",
                    icon: "warning",
                    confirmButtonText: "ตกลง"
                });
            }
        }
    };

    const handleDeleteItem = async (productId) => {
        const result = await Swal.fire({
            title: "ยืนยันการลบ",
            text: "คุณต้องการลบสินค้านี้ออกจากตะกร้าหรือไม่?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "ลบ",
            cancelButtonText: "ยกเลิก",
            confirmButtonColor: "#d33"
        });

        if (!result.isConfirmed) return;

        try {
            const response = await axios.delete(HOSTNAME + `/souvenir/cart/${productId}`, {
                data: { userId: user.user_id },
                withCredentials: true
            });

            setCart(prev => prev.filter(item => item.product_id !== productId));
            setSelectedItems(prev => prev.filter(item => item.product_id !== productId));
            await getCartCount(user.user_id);

            Swal.fire({
                title: "ลบสินค้าสำเร็จ",
                text: response.data.message || "ลบสินค้าออกจากตะกร้าแล้ว",
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            console.error("Error deleting item:", error);
            Swal.fire({
                title: "เกิดข้อผิดพลาด",
                text: error.response?.data?.message || "ไม่สามารถลบสินค้าได้ กรุณาลองใหม่อีกครั้ง",
                icon: "error",
                confirmButtonText: "ตกลง"
            });
        }
    };

    // เปลี่ยน handleUpdateQuantity ให้ใช้ delta
    const handleUpdateQuantity = async (productId, delta) => {
        const cartItem = cart.find(item => item.product_id === productId);
        if (!cartItem) return;

        const newQuantity = cartItem.quantity + delta;
        if (newQuantity < 1) return;

        const stock = stockInfo[productId];
        if (stock && newQuantity > stock.remaining + cartItem.quantity) {
            Swal.fire({
                title: "จำนวนสินค้าไม่เพียงพอ",
                text: `สินค้ามีจำนวนคงเหลือ ${stock.remaining} ชิ้น`,
                icon: "warning",
                confirmButtonText: "ตกลง"
            });
            return;
        }

        // ป้องกันการกดซ้ำ
        if (updatingItems.has(productId)) {
            console.log('Product is already being updated, skipping...');
            return;
        }

        // Update UI ทันที (Optimistic Update)
        setCart(prev =>
            prev.map(item =>
                item.product_id === productId
                    ? {
                        ...item,
                        quantity: newQuantity,
                        subtotal: (item.price || 0) * newQuantity  // อัปเดตราคาใหม่ทันที
                    }
                    : item
            )
        );

        setUpdatingItems(prev => new Set([...prev, productId]));

        try {
            console.log(`Updating cart: Product ${productId}, New quantity: ${newQuantity}`);

            const res = await axios.put(HOSTNAME + `/souvenir/cart/update`, {
                user_id: user.user_id,
                product_id: productId,
                quantity: newQuantity
            }, { withCredentials: true });

            // console.log('Backend response:', res.data);

            // ใช้ cart_summary.total_items ตาม Backend
            if (res.data.cart_summary && res.data.cart_summary.total_items !== undefined) {
                const totalItems = res.data.cart_summary.total_items;

                // อัปเดต cart count
                setCartCount(totalItems);
                setGlobalCartCount(totalItems);

                console.log(`Cart count updated from cart_summary: ${totalItems}`);

                // อัปเดต cart items ด้วยข้อมูลล่าสุดจาก backend
                if (res.data.cart_summary.items) {
                    setCart(res.data.cart_summary.items.map(i => ({
                        ...i,
                        subtotal: i.total 
                    })));
                }

            } else {
                console.log('No cart_summary found, using fallback method');
                // Fallback: fetch ข้อมูลใหม่
                await Promise.all([
                    fetchCart(),
                    getCartCount(user.user_id)
                ]);
            }

            // อัปเดต stock info ถ้ามี
            if (res.data.stock_remaining !== undefined) {
                setStockInfo(prev => ({
                    ...prev,
                    [productId]: {
                        ...prev[productId],
                        remaining: res.data.stock_remaining,
                        reserved: res.data.stock_reserved || prev[productId]?.reserved,
                    }
                }));
                console.log(`Stock updated - Product ${productId}: ${res.data.stock_remaining} remaining`);
            }

            console.log(`Cart update successful!`);

        } catch (error) {
            console.error("Error updating quantity:", error);

            Swal.fire({
                title: "ไม่สามารถอัปเดตจำนวนได้",
                text: error.response?.data?.message || "กรุณาลองใหม่อีกครั้ง",
                icon: "warning",
                confirmButtonText: "ตกลง"
            });

            // Revert กลับถ้า error และ fetch ข้อมูลใหม่
            console.log('Error occurred, reverting and fetching fresh data...');
            try {
                await Promise.all([
                    fetchCart(),
                    getCartCount(user.user_id)
                ]);
            } catch (revertError) {
                console.error('Error reverting cart data:', revertError);
            }

        } finally {
            setUpdatingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(productId);
                return newSet;
            });
        }
    };


    // ลบสินค้าออกจากตะกร้า
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
                let deletedCount = 0;
                for (const item of selectedItems) {
                    try {
                        await axios.delete(HOSTNAME + `/souvenir/cart/${item.product_id}`, {
                            data: { userId: user.user_id },
                            withCredentials: true
                        });
                        deletedCount++;
                    } catch (error) {
                        console.error(`Error deleting item ${item.product_id}:`, error);
                    }
                }

                setCart(prev => prev.filter(item => !selectedItems.some(selected => selected.product_id === item.product_id)));
                setSelectedItems([]);
                await getCartCount(user.user_id);

                Swal.fire({
                    title: "ลบสินค้าสำเร็จ",
                    text: `ลบสินค้า ${deletedCount} รายการแล้ว`,
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
            state: { selectedItems }
        });
    };

    const handleSelectAll = () => {
        if (selectedItems.length === cart.length) {
            setSelectedItems([]);
        } else if (cart.length > 0) {
            const firstItem = cart[0];
            const validItems = cart.filter(item =>
                item.promptpay_number === firstItem.promptpay_number &&
                item.seller_id === firstItem.seller_id
            );
            setSelectedItems(validItems.map(item => ({ ...item, isSelected: true })));
        }
    };

    const renderStockInfo = (productId) => {
        const stock = stockInfo[productId];
        if (!stock) return null;

        return (
            <div className="text-muted small mt-1">
                <div>คงเหลือ: {stock.remaining} | จองแล้ว: {stock.reserved} | ขายแล้ว: {stock.sold}</div>
            </div>
        );
    };

    const groupedCart = cart.reduce((groups, item) => {
        const key = item.promptpay_number || "ไม่ระบุ PromptPay";
        if (!groups[key]) groups[key] = [];
        groups[key].push(item);
        return groups;
    }, {});

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

                        {Object.entries(groupedCart).map(([promptpay, items], idx) => (
                            <div key={promptpay} className="mb-4 p-3 rounded border" style={{ background: "#f0f8ff" }}>
                                <div className="mb-2 d-flex align-items-center">
                                    <span className="badge bg-info text-dark me-2" style={{ fontSize: "1rem" }}>
                                        รายการที่ {idx + 1}
                                    </span>
                                </div>
                                <div className="cart-items-title">
                                    <p>เลือก</p>
                                    <p>สินค้า</p>
                                    <p>ราคาต่อชิ้น</p>
                                    <p>จำนวน</p>
                                    <p>ราคารวม</p>
                                    <p>จัดการ</p>
                                </div>
                                {items.map((item) => (
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
                                                src={item.image ? HOSTNAME + `/uploads/${item.image}` : "/images/product-default.png"}
                                                alt={item.product_name}
                                            />
                                            <div>
                                                <p>{item.product_name}</p>
                                                {item.slot_name && (
                                                    <p className="text-muted small">ล็อต: {item.slot_name}</p>
                                                )}
                                                {item.slot_status && (
                                                    <p className={`text-muted small ${item.slot_status === 'active' ? 'text-success' : 'text-warning'}`}>
                                                        สถานะ: {item.slot_status === 'active' ? 'ใช้งานได้' : 'ไม่ใช้งาน'}
                                                    </p>
                                                )}
                                                {renderStockInfo(item.product_id)}
                                            </div>
                                        </div>
                                        <p>฿{(item.price * item.quantity).toLocaleString()}</p>
                                        <div className="quantity-control">
                                            <button
                                                className="quantity-btn"
                                                onClick={() => handleUpdateQuantity(item.product_id, -1)}
                                                disabled={item.quantity <= 1 || updatingItems.has(item.product_id)}
                                            >
                                                -
                                            </button>
                                            <span>{item.quantity}</span>
                                            <button
                                                className="quantity-btn"
                                                onClick={() => handleUpdateQuantity(item.product_id, 1)}
                                                disabled={updatingItems.has(item.product_id) || (stockInfo[item.product_id]?.remaining <= 0)}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <p>฿{(item.price * item.quantity).toLocaleString()}</p>
                                        <button
                                            className="souvenir-del"
                                            onClick={() => handleDeleteItem(item.product_id)}
                                        >
                                            ลบ
                                        </button>
                                    </div>
                                ))}
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
                        <p>ไม่มีสินค้าในตะกร้า</p>
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