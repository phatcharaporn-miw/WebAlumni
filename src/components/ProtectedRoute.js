import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// const ProtectedRoute = ({ isLoggedIn, allowedRoles, userRole, children }) => {
//     console.log('ProtectedRoute - isLoggedIn:', isLoggedIn, 'allowedRoles:', allowedRoles, 'userRole:', userRole);

//     if (!isLoggedIn) {
//         alert('กรุณาเข้าสู่ระบบ');
//         return <Navigate to="/login" replace />;
//     }

//     if (!allowedRoles.includes(userRole)) {
//         alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
//         return <Navigate to="/" replace />;
//     }

//     return children;
// };


// export default ProtectedRoute;
