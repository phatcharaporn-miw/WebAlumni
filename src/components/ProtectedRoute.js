import { useLocation, Navigate } from 'react-router-dom';
// import Swal from 'sweetalert2';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, requiredRoles }) {
  const location = useLocation();
  const { user, isLoading, isLoggingOut, initDone } = useAuth(); 
  const [shouldRedirect, setShouldRedirect] = useState(null);
  // const role = user?.role;
  // const userId = user?.user_id;

useEffect(() => {
 // ถ้ายัง init ไม่เสร็จ → ยังไม่ต้องเช็ค
    if (!initDone || isLoading || isLoggingOut) {
      console.log('Waiting for auth init...');
      return;
    }

  // ถ้าไม่มี user
  if (!user || !user.user_id) {
    const publicPaths = ['/', '/login', '/register'];
    
    // ถ้าเป็น public path → แค่ปล่อยไป ไม่เตือน ไม่ redirect
    if (publicPaths.includes(location.pathname)) {
      setShouldRedirect(null);
      return;
    }

    // ถ้าไม่ใช่ public path → redirect ไปหน้าแรก
    setShouldRedirect('/');
    return;
  }

  // ถ้ามี user → เช็ก role
  if (requiredRoles?.length > 0) {
    const userRole = Number(user.role || 0);
    const hasPermission = requiredRoles.map(Number).includes(userRole);

    if (!hasPermission) {
      const fallback = userRole === 1 ? '/admin-home' : '/';
      setShouldRedirect(fallback);
      return;
    }
  }

  setShouldRedirect(null);
}, [user, isLoading, isLoggingOut, location.pathname, requiredRoles]);


  // Show loading
  if (isLoading || isLoggingOut) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        <div className="ml-4 text-lg">
          {isLoading ? 'กำลังตรวจสอบสิทธิ์...' : 'กำลังออกจากระบบ...'}
        </div>
      </div>
    );
  }

  // Handle redirect
  if (shouldRedirect) {
    return <Navigate to={shouldRedirect} state={{ from: location }} replace />;
  }

  // Render children
  return children;
}

export default ProtectedRoute;