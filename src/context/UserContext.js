// import { createContext, useState, useEffect, useContext } from "react";
// import axios from "axios";

// export const UserContext = createContext();

// export const UserProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const fetchUserProfile = () => {
//     const userId = sessionStorage.getItem("userId");
//     const role = sessionStorage.getItem("userRole");

//     if (userId && role) {
//       setLoading(true);
//       axios.get(`http://localhost:3001/users/profile/${userId}`)
//         .then((response) => {
//           if (response.data.success) {
//             setUser({
//               userId,
//               role,
//               username: response.data.user.username || sessionStorage.getItem('username'),
//               profilePicture: response.data.user.profilePicture,
//             });
//           } else {
//             setUser(null);
//           }
//         })
//         .catch((error) => {
//           console.error("Error fetching profile:", error);
//           setUser(null);
//         })
//         .finally(() => {
//           setLoading(false);
//         });
//     } else {
//       setUser(null);
//       setLoading(false);
//     }
//   };

//   // ฟังก์ชัน logout
//   const logout = async () => {
//     try {
//       await axios.get('http://localhost:3001/api/logout', { withCredentials: true });
//     } catch (error) {
//       console.error('Logout API Error:', error);
//     } finally {
//       // ลบข้อมูลใน sessionStorage
//       sessionStorage.removeItem('userId');
//       sessionStorage.removeItem('userRole');
//       sessionStorage.removeItem('username');
//       sessionStorage.removeItem('image_path');
      
//       // เคลียร์ user state
//       setUser(null);
      
//       // ส่ง custom event เพื่อแจ้งให้ component อื่นรู้
//       window.dispatchEvent(new CustomEvent('userLogout'));
//     }
//   };

//   useEffect(() => {
//     fetchUserProfile();

//     // ฟัง storage event และ custom logout event
//     const handleStorageChange = () => {
//       fetchUserProfile();
//     };

//     const handleLogout = () => {
//       setUser(null);
//     };

//     window.addEventListener("storage", handleStorageChange);
//     window.addEventListener("userLogout", handleLogout);

//     return () => {
//       window.removeEventListener("storage", handleStorageChange);
//       window.removeEventListener("userLogout", handleLogout);
//     };
//   }, []);

//   return (
//     <UserContext.Provider value={{ 
//       user, 
//       setUser, 
//       logout, 
//       loading,
//       refreshUser: fetchUserProfile 
//     }}>
//       {children}
//     </UserContext.Provider>
//   );
// };

// // Hook สำหรับใช้งาน UserContext
// export const useUser = () => {
//   const context = useContext(UserContext);
//   if (!context) {
//     throw new Error('useUser must be used within UserProvider');
//   }
//   return context;
// };

import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/users/me");
      if (res.data.success) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post("/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, logout, loading, refreshUser: fetchUserProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

