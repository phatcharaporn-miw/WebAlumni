import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

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
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
      throw new Error('User not logged in');
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

  // โหลดจำนวนตะกร้าเมื่อเริ่มต้น
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      getCartCount(userId);
    }
  }, []);

  const value = {
    cartCount,
    setCartCount,
    getCartCount,
    addToCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};