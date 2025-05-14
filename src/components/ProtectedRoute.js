// import React from "react";
// import { Navigate, useLocation } from "react-router-dom";
// import Swal from "sweetalert2";

// // ตรวจสอบว่าผู้ใช้ login แล้วหรือไม่
// const isAuthenticated = () => {
//   return !!localStorage.getItem("token"); // true ถ้ามี token
// };

// // ตรวจสอบว่า role ของผู้ใช้ตรงกับที่ระบุไว้หรือไม่
// const hasRole = (requiredRoles) => {
//   const userRole = parseInt(localStorage.getItem("role"));
//   return requiredRoles.includes(userRole);
// };

// // Component ที่ใช้เป็น Route Guard
// const ProtectedRoute = ({ children, requiredRoles }) => {
//   const location = useLocation();

//   if (!isAuthenticated()) {
//     Swal.fire({
//       icon: "warning",
//       title: "กรุณาเข้าสู่ระบบก่อน",
//       text: "คุณต้องเข้าสู่ระบบเพื่อใช้งานหน้านี้",
//       confirmButtonText: "ตกลง",
//     });
//     return <Navigate to="/login" state={{ from: location }} replace />;
//   }

//   if (requiredRoles && !hasRole(requiredRoles)) {
//     Swal.fire({
//       icon: "error",
//       title: "เข้าถึงไม่ได้",
//       text: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
//       confirmButtonText: "ตกลง",
//     });
//   }

//   return children;
// };

// export default ProtectedRoute;

