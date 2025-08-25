import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext'; // เพิ่มการ import

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  
  // เชื่อมต่อกับ AuthContext
  const { user } = useAuth();

  // ฟังก์ชันล้างตะกร้า
  const clearCart = () => {
    setCartCount(0);
  };

  // ฟังก์ชันดึงจำนวนสินค้าในตะกร้า
  const getCartCount = async (userId) => {
    if (!userId) {
      setCartCount(0);
      return;
    }

    try {
      const response = await axios.get(`http://localhost:3001/souvenir/cart/count?user_id=${userId}`, {
        headers: { "Cache-Control": "no-cache" },
        withCredentials: true
      });
      setCartCount(response.data.cartCount || 0);
    } catch (error) {
      console.error("Error fetching cart count:", error);
      setCartCount(0);
    }
  };

  // ฟังก์ชันเพิ่มสินค้าลงตะกร้า
  const addToCart = async (productId, quantity, total) => {
    // ตรวจสอบจาก user state แทน localStorage
    if (!user) {
      throw new Error('กรุณาเข้าสู่ระบบก่อน');
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('กรุณาเข้าสู่ระบบก่อน');
    }

    try {
      const response = await axios.post("http://localhost:3001/souvenir/cart/add", {
        user_id: userId,
        product_id: productId,
        quantity: quantity,
        total: total
      }, {
        withCredentials: true
      });

      // อัปเดตจำนวนตะกร้าทันที
      await getCartCount(userId);
      
      return response.data;
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการเพิ่มสินค้าลงในตะกร้า:", error);
      throw error;
    }
  };

  // ฟังก์ชันลบสินค้าจากตะกร้า (เพิ่มเติม)
  const removeFromCart = async (cartId) => {
    if (!user) return;

    try {
      const response = await axios.delete(`http://localhost:3001/souvenir/cart/remove/${cartId}`, {
        withCredentials: true
      });

      if (response.data.success) {
        const userId = localStorage.getItem('userId');
        await getCartCount(userId);
      }
      
      return response.data;
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการลบสินค้า:", error);
      throw error;
    }
  };

  // ฟังก์ชันสำหรับ refresh cart count
  const refreshCartCount = async () => {
    if (user) {
      const userId = localStorage.getItem('userId');
      await getCartCount(userId);
    } else {
      clearCart();
    }
  };

  // ตรวจสอบสถานะ user และจัดการตะกร้า
  useEffect(() => {
    if (user) {
      // ถ้ามี user ให้โหลดจำนวนตะกร้า
      const userId = localStorage.getItem('userId');
      if (userId) {
        getCartCount(userId);
      }
    } else {
      // ถ้าไม่มี user (logout แล้ว) ให้ล้างตะกร้าทันที
      clearCart();
    }
  }, [user]); // dependency คือ user จาก AuthContext

  // เพิ่ม useEffect สำหรับ initial load (เผื่อกรณี refresh หน้า)
  useEffect(() => {
    // รอให้ AuthContext โหลดเสร็จก่อน
    const timer = setTimeout(() => {
      const userId = localStorage.getItem('userId');
      if (userId && user) {
        getCartCount(userId);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const value = {
    cartCount,
    setCartCount,
    getCartCount,
    addToCart,
    removeFromCart,
    clearCart,
    refreshCartCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};