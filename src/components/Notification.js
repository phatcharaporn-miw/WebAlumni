// import React, { useEffect, useState } from "react";
// import { io } from "socket.io-client";
// import axios from "axios";

// const socket = io("http://localhost:3001"); // เชื่อมต่อกับ WebSocket

// function Notifications({ userId}) {
//     const [notifications, setNotifications] = useState([]);
//     const [unreadCount, setUnreadCount] = useState(0); // สถานะเก็บจำนวนแจ้งเตือนที่ยังไม่ได้อ่าน

//     useEffect(() => {
//       fetchNotifications();

//       // เชื่อมต่อ WebSocket
//       socket.emit("registerUser", userId);

//       // รับการแจ้งเตือนแบบเรียลไทม์
//       socket.on("newNotification", (data) => {
//           setNotifications((prev) => [data, ...prev]);
//           if (data.user_id !== userId) {
//             setUnreadCount((prev) => prev + 1); // เพิ่มจำนวนแจ้งเตือนที่ยังไม่ได้อ่าน
//         }
//       });

//       return () => {
//           socket.off("newNotification");
//       };
//   }, [userId]);

//     const fetchNotifications = async () => {
//         try {
//             const response = await axios.get(`http://localhost:3001/notice/notification/${userId}`);
//             if (response.data.success) {
//                 setNotifications(response.data.data);

//                  // คำนวณจำนวนแจ้งเตือนที่ยังไม่ได้อ่าน
//                  const unreadNotifications = response.data.data.filter(n => !n.is_read);
//                  setUnreadCount(unreadNotifications.length);
//             }
//         } catch (error) {
//             console.error("เกิดข้อผิดพลาดในการโหลดการแจ้งเตือน:", error);
//         }
//     };

//     // ฟังก์ชันอัปเดตการอ่านแจ้งเตือน
//     const markAsRead = (id) => {
//       axios.put(`http://localhost:3001/web/read/${id}`)
//           .then(() => {
//               setNotifications((prev) => prev.filter((n) => n.notification_id !== id));
//               setUnreadCount((prev) => prev - 1);
//           })
//           .catch((error) => console.error("Error marking notification as read:", error));
//     };

//      // ฟังก์ชันลบแจ้งเตือน (soft delete)
//      const deleteNotification = (id) => {
//       axios.delete(`http://localhost:3001/webboard/notification/${id}`)
//           .then(() => fetchNotifications())
//           .catch((error) => console.error("Error deleting notification:", error));
//     };


//     return (
//         <div className="notification-container">
//             <h2>การแจ้งเตือน</h2>
//             {notifications.length === 0 ? (
//                 <p>ไม่มีการแจ้งเตือน</p>
//             ) : (
//                 notifications.map((notification) => (
//                     <div key={notification.notification_id} className="notification-card">
//                         <p>{notification.message}</p>
//                         <small>{new Date(notification.send_date).toLocaleString()}</small>
//                         <div className="actions">
//                             <button onClick={() => markAsRead(notification.notification_id)}>
//                                 ✅ อ่านแล้ว
//                             </button>
//                             <button onClick={() => deleteNotification(notification.notification_id)}>
//                                 🗑 ลบ
//                             </button>
//                         </div>
//                     </div>
//                 ))
//             )}
//         </div>
//     );
// };

// export default Notifications;
