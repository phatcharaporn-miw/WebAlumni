import { useLocation, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, requiredRoles, allowedPath }) {
  const location = useLocation();
  const { user, isLoading, isLoggingOut, initDone } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(null);

  useEffect(() => {
    if (!initDone || isLoading || isLoggingOut) return;

    // ถ้าไม่ loginให้ redirect ไปหน้าแรก
    if (!user || !user.user_id) {
      const publicPaths = ['/', '/login', '/register'];
      if (!publicPaths.includes(location.pathname)) {
        setShouldRedirect('/');
      }
      return;
    }

    // ถ้ามี allowedPath แล้ว path ปัจจุบันไม่ตรงให้ redirect ไปหน้าหลัก
    if (allowedPath && location.pathname !== allowedPath) {
      setShouldRedirect('/');
      return;
    }

    // ถ้ามี role แต่ไม่ตรงให้ redirect ไปหน้าหลัก
    if (requiredRoles?.length > 0) {
      const userRole = Number(user.role || 0);
      const hasPermission = requiredRoles.map(Number).includes(userRole);
      if (!hasPermission) {
        setShouldRedirect('/');
        return;
      }
    }

    setShouldRedirect(null);
  }, [user, isLoading, isLoggingOut, location.pathname, requiredRoles, allowedPath]);

  // Loading state
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

  // Redirect if not allowed
  if (shouldRedirect) {
    return <Navigate to={shouldRedirect} replace />;
  }

  return children;
}

export default ProtectedRoute;
