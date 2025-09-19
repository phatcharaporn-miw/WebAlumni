// import React, { createContext, useContext, useState, useEffect } from 'react';
// import axios from 'axios';
// import { useAuth } from './AuthContext';

// const CartContext = createContext();

// export const useCart = () => {
//   const context = useContext(CartContext);
//   if (!context) {
//     throw new Error('useCart must be used within a CartProvider');
//   }
//   return context;
// };

// export const CartProvider = ({ children }) => {
//   const [cartCount, setCartCount] = useState(0);
//   const [isLoading, setIsLoading] = useState(false);
  
//   // เชื่อมต่อกับ AuthContext
//   const { user } = useAuth();

//   // ฟังก์ชันล้างตะกร้า
//   const clearCart = () => {
//     setCartCount(0);
//   };

//   // ฟังก์ชันดึงจำนวนสินค้าในตะกร้า
//   const getCartCount = async (userId) => {
//     if (!userId) {
//       setCartCount(0);
//       return;
//     }

//     try {
//       // ใช้ API ดึงข้อมูลตะกร้าแล้วนับจำนวน
//       const response = await axios.get(`http://localhost:3001/souvenir/cart?user_id=${userId}`, {
//         headers: { "Cache-Control": "no-cache" },
//         withCredentials: true
//       });
      
//       // นับจำนวนสินค้าทั้งหมดในตะกร้า
//       const totalItems = response.data.reduce((total, item) => total + item.quantity, 0);
//       setCartCount(totalItems);
//     } catch (error) {
//       console.error("Error fetching cart count:", error);
//       setCartCount(0);
//     }
//   };

//   // ฟังก์ชันเพิ่มสินค้าลงตะกร้า
//   const addToCart = async (productId, quantity, total) => {
//     // ตรวจสอบจาก user state แทน localStorage
//     if (!user) {
//       throw new Error('กรุณาเข้าสู่ระบบก่อน');
//     }

//     const userId = localStorage.getItem('userId');
//     if (!userId) {
//       throw new Error('กรุณาเข้าสู่ระบบก่อน');
//     }

//     setIsLoading(true);
    
//     try {
//       const response = await axios.post("http://localhost:3001/souvenir/cart/add", {
//         user_id: userId,
//         product_id: productId,
//         quantity: quantity,
//         total: total
//       }, {
//         withCredentials: true
//       });

//       // อัปเดตจำนวนตะกร้าทันที
//       await getCartCount(userId);
      
//       return response.data;
//     } catch (error) {
//       console.error("เกิดข้อผิดพลาดในการเพิ่มสินค้าลงในตะกร้า:", error);
//       throw error;
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // ฟังก์ชันอัปเดตจำนวนสินค้าในตะกร้า
//   const updateCart = async (productId, quantity, total) => {
//     if (!user) {
//       throw new Error('กรุณาเข้าสู่ระบบก่อน');
//     }

//     const userId = localStorage.getItem('userId');
//     if (!userId) {
//       throw new Error('กรุณาเข้าสู่ระบบก่อน');
//     }

//     setIsLoading(true);

//     try {
//       const response = await axios.put("http://localhost:3001/souvenir/cart/update", {
//         user_id: userId,
//         product_id: productId,
//         quantity: quantity,
//         total: total
//       }, {
//         withCredentials: true
//       });

//       // อัปเดตจำนวนตะกร้าทันที
//       await getCartCount(userId);
      
//       return response.data;
//     } catch (error) {
//       console.error("เกิดข้อผิดพลาดในการอัปเดตสินค้า:", error);
//       throw error;
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // ฟังก์ชันลบสินค้าจากตะกร้า (แก้ไขให้ตรงกับ backend)
//   const removeFromCart = async (productId) => {
//     if (!user) {
//       throw new Error('กรุณาเข้าสู่ระบบก่อน');
//     }

//     const userId = localStorage.getItem('userId');
//     if (!userId) {
//       throw new Error('กรุณาเข้าสู่ระบบก่อน');
//     }

//     setIsLoading(true);

//     try {
//       const response = await axios.delete(`http://localhost:3001/souvenir/cart/${productId}`, {
//         data: { userId: userId }, // ส่ง userId ใน body ตามที่ backend ต้องการ
//         withCredentials: true
//       });

//       // อัปเดตจำนวนตะกร้าทันที
//       await getCartCount(userId);
      
//       return response.data;
//     } catch (error) {
//       console.error("เกิดข้อผิดพลาดในการลบสินค้า:", error);
//       throw error;
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // ฟังก์ชันดึงรายการสินค้าในตะกร้า
//   const getCartItems = async () => {
//     if (!user) return [];

//     const userId = localStorage.getItem('userId');
//     if (!userId) return [];

//     try {
//       const response = await axios.get(`http://localhost:3001/souvenir/cart?user_id=${userId}`, {
//         headers: { "Cache-Control": "no-cache" },
//         withCredentials: true
//       });
      
//       return response.data;
//     } catch (error) {
//       console.error("เกิดข้อผิดพลาดในการดึงข้อมูลตะกร้า:", error);
//       return [];
//     }
//   };

//   // ฟังก์ชันสำหรับ refresh cart count
//   const refreshCartCount = async () => {
//     if (user) {
//       const userId = localStorage.getItem('userId');
//       if (userId) {
//         await getCartCount(userId);
//       }
//     } else {
//       clearCart();
//     }
//   };

//   // ฟังก์ชันเพิ่มสินค้าหรืออัปเดต (อัตโนมัติ)
//   const addOrUpdateCart = async (productId, quantity, total) => {
//     if (!user) {
//       throw new Error('กรุณาเข้าสู่ระบบก่อน');
//     }

//     const userId = localStorage.getItem('userId');
//     if (!userId) {
//       throw new Error('กรุณาเข้าสู่ระบบก่อน');
//     }

//     setIsLoading(true);

//     try {
//       // ตรวจสอบว่าสินค้ามีในตะกร้าแล้วหรือไม่
//       const cartItems = await getCartItems();
//       const existingItem = cartItems.find(item => item.product_id == productId);

//       let response;
//       if (existingItem) {
//         // ถ้ามีแล้วให้ใช้ update
//         const newQuantity = existingItem.quantity + quantity;
//         const newTotal = total * (newQuantity / quantity); // คำนวณ total ใหม่
//         response = await updateCart(productId, newQuantity, newTotal);
//       } else {
//         // ถ้าไม่มีให้ใช้ add
//         response = await addToCart(productId, quantity, total);
//       }

//       return response;
//     } catch (error) {
//       console.error("เกิดข้อผิดพลาดในการเพิ่ม/อัปเดตสินค้า:", error);
//       throw error;
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // ตรวจสอบสถานะ user และจัดการตะกร้า
//   useEffect(() => {
//     if (user) {
//       // ถ้ามี user ให้โหลดจำนวนตะกร้า
//       const userId = localStorage.getItem('userId');
//       if (userId) {
//         getCartCount(userId);
//       }
//     } else {
//       // ถ้าไม่มี user (logout แล้ว) ให้ล้างตะกร้าทันที
//       clearCart();
//     }
//   }, [user]); // dependency คือ user จาก AuthContext

//   // เพิ่ม useEffect สำหรับ initial load (เผื่อกรณี refresh หน้า)
//   useEffect(() => {
//     // รอให้ AuthContext โหลดเสร็จก่อน
//     const timer = setTimeout(() => {
//       const userId = localStorage.getItem('userId');
//       if (userId && user) {
//         getCartCount(userId);
//       }
//     }, 100);

//     return () => clearTimeout(timer);
//   }, []);

//   const value = {
//     cartCount,
//     setCartCount,
//     getCartCount,
//     addToCart,
//     updateCart,
//     removeFromCart,
//     getCartItems,
//     addOrUpdateCart,
//     clearCart,
//     refreshCartCount,
//     isLoading
//   };

//   return (
//     <CartContext.Provider value={value}>
//       {children}
//     </CartContext.Provider>
//   );
// };

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

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
  const [isLoading, setIsLoading] = useState(false);
  
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
      // ใช้ API ดึงข้อมูลตะกร้าแล้วนับจำนวน
      const response = await axios.get(`http://localhost:3001/souvenir/cart?user_id=${userId}`, {
        headers: { "Cache-Control": "no-cache" },
        withCredentials: true
      });
      
      // นับจำนวนสินค้าทั้งหมดในตะกร้า
      const totalItems = response.data.reduce((total, item) => total + item.quantity, 0);
      setCartCount(totalItems);
    } catch (error) {
      console.error("Error fetching cart count:", error);
      setCartCount(0);
    }
  };

  // ฟังก์ชันเพิ่มสินค้าลงตะกร้า - ใช้ API ใหม่
  const addToCart = async (productId, quantity) => {
    // ตรวจสอบจาก user state แทน localStorage
    if (!user) {
      throw new Error('กรุณาเข้าสู่ระบบก่อน');
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('กรุณาเข้าสู่ระบบก่อน');
    }

    setIsLoading(true);
    
    try {
      const response = await axios.post("http://localhost:3001/souvenir/cart/add", {
        user_id: userId,
        product_id: productId,
        quantity: quantity
        // ไม่ต้องส่ง total เพราะ backend คำนวณเอง
      }, {
        withCredentials: true
      });

      // อัปเดตจำนวนตะกร้าทันที
      await getCartCount(userId);
      
      return response.data;
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการเพิ่มสินค้าลงในตะกร้า:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ฟังก์ชันอัปเดตจำนวนสินค้าในตะกร้า 
  const updateCart = async (productId, quantity) => {
    if (!user) {
      throw new Error('กรุณาเข้าสู่ระบบก่อน');
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('กรุณาเข้าสู่ระบบก่อน');
    }

    setIsLoading(true);

    try {
      const response = await axios.put("http://localhost:3001/souvenir/cart/update", {
        user_id: userId,
        product_id: productId,
        quantity: quantity
        // ไม่ต้องส่ง total เพราะ backend คำนวณเอง
      }, {
        withCredentials: true
      });

      // อัปเดตจำนวนตะกร้าทันที
      await getCartCount(userId);
      
      return response.data;
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการอัปเดตสินค้า:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ฟังก์ชันลบสินค้าจากตะกร้า 
  const removeFromCart = async (productId) => {
    if (!user) {
      throw new Error('กรุณาเข้าสู่ระบบก่อน');
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('กรุณาเข้าสู่ระบบก่อน');
    }

    setIsLoading(true);

    try {
      const response = await axios.delete(`http://localhost:3001/souvenir/cart/${productId}`, {
        data: { userId: userId }, // ส่ง userId ใน body ตามที่ backend ต้องการ
        withCredentials: true
      });

      // อัปเดตจำนวนตะกร้าทันที
      await getCartCount(userId);
      
      return response.data;
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการลบสินค้า:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ฟังก์ชันดึงรายการสินค้าในตะกร้า
  const getCartItems = async () => {
    if (!user) return [];

    const userId = localStorage.getItem('userId');
    if (!userId) return [];

    try {
      const response = await axios.get(`http://localhost:3001/souvenir/cart?user_id=${userId}`, {
        headers: { "Cache-Control": "no-cache" },
        withCredentials: true
      });
      
      return response.data;
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูลตะกร้า:", error);
      return [];
    }
  };

  // ฟังก์ชันสำหรับ refresh cart count
  const refreshCartCount = async () => {
    if (user) {
      const userId = localStorage.getItem('userId');
      if (userId) {
        await getCartCount(userId);
      }
    } else {
      clearCart();
    }
  };

  // ฟังก์ชันเพิ่มสินค้าหรืออัปเดต (อัตโนมัติ) 
  const addOrUpdateCart = async (productId, quantity) => {
    if (!user) {
      throw new Error('กรุณาเข้าสู่ระบบก่อน');
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('กรุณาเข้าสู่ระบบก่อน');
    }

    setIsLoading(true);

    try {
      // ใช้ addToCart เพราะ backend จัดการ logic เพิ่ม/อัปเดตให้แล้ว
      const response = await addToCart(productId, quantity);
      return response;
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการเพิ่ม/อัปเดตสินค้า:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ฟังก์ชันเพิ่มสำหรับเช็คสต็อกก่อนเพิ่มลงตะกร้า
  const checkStockAndAddToCart = async (productId, quantity) => {
    if (!user) {
      throw new Error('กรุณาเข้าสู่ระบบก่อน');
    }

    setIsLoading(true);

    try {
      // เช็คสต็อกก่อน 
      const response = await addToCart(productId, quantity);
      
      // แสดงข้อมูล stock ที่เหลือถ้ามี
      if (response.stock_remaining !== undefined) {
        console.log(`สินค้าคงเหลือ: ${response.stock_remaining} ชิ้น`);
        console.log(`จองแล้ว: ${response.stock_reserved} ชิ้น`);
        console.log(`ขายแล้ว: ${response.stock_sold} ชิ้น`);
      }
      
      return response;
    } catch (error) {
      if (error.response?.status === 400 && error.response.data?.message?.includes('จำนวนสินค้าไม่พอ')) {
        throw new Error(error.response.data.message);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ฟังก์ชันล้างตะกร้าทั้งหมด (สำหรับกรณี logout หรือ checkout สำเร็จ)
  const clearAllCart = async () => {
    if (!user) return;

    const userId = localStorage.getItem('userId');
    if (!userId) return;

    setIsLoading(true);

    try {
      const cartItems = await getCartItems();
      
      // ลบสินค้าทีละรายการ 
      for (const item of cartItems) {
        await removeFromCart(item.product_id);
      }
      
      setCartCount(0);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการล้างตะกร้า:", error);
    } finally {
      setIsLoading(false);
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
    updateCart,
    removeFromCart,
    getCartItems,
    addOrUpdateCart,
    clearCart,
    clearAllCart,
    refreshCartCount,
    checkStockAndAddToCart,
    isLoading
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};