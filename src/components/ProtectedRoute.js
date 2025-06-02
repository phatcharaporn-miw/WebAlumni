import { useLocation, Navigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";

function ProtectedRoute({ children, requiredRoles }) {
  const location = useLocation();
  const [redirectPath, setRedirectPath] = useState(null);
  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("userRole"); 

useEffect(() => {
    if (!userId) {
      Swal.fire({
        title: "กรุณาเข้าสู่ระบบ",
        text: "คุณต้องเข้าสู่ระบบก่อนเข้าถึงหน้านี้",
        icon: "warning",
        confirmButtonColor: "#0F75BC",
      }).then(() => {
        setRedirectPath("/login");
      });
    } else if (requiredRoles && !requiredRoles.includes(userRole)) {
      Swal.fire({
        title: "ไม่มีสิทธิ์เข้าถึง",
        text: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
        icon: "error",
        confirmButtonColor: "#0F75BC",
      }).then(() => {
        const fallback = userRole === "1" ? "/admin-home" : "/";
        setRedirectPath(fallback);
      });
    }
//     console.log("🧪 userId =", userId);
// console.log("🧪 userRole =", userRole);
// console.log("🧪 requiredRoles =", requiredRoles);

  }, [userId, userRole, requiredRoles]);

  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}

export default ProtectedRoute;
