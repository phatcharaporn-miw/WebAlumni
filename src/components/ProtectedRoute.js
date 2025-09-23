import { useLocation, Navigate} from 'react-router-dom';
import Swal from 'sweetalert2';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, requiredRoles }) {
  const location = useLocation();
  const { user, loading, isLoggingOut, initializing } = useAuth(); 
  const [redirectPath, setRedirectPath] = useState(null);

  useEffect(() => {
  if (loading || isLoggingOut || initializing) {
    console.log('Waiting for auth to complete:', { loading, isLoggingOut, initializing });
    return;
  }

  if (!user) {
    const publicPaths = ['/login', '/', '/register'];
    if (!publicPaths.includes(location.pathname)) {
      Swal.fire({
        title: 'กรุณาเข้าสู่ระบบ',
        text: 'คุณต้องเข้าสู่ระบบก่อนเข้าถึงหน้านี้',
        icon: 'warning',
        confirmButtonColor: '#0F75BC',
      }).then(() => setRedirectPath('/login'));
    } 
    return;
  }

  if (requiredRoles?.length > 0) {
    const userRole = Number(user.role);
    if (!requiredRoles.map(Number).includes(userRole)) {
      Swal.fire({
        title: 'ไม่มีสิทธิ์เข้าถึง',
        text: 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้',
        icon: 'error',
        confirmButtonColor: '#0F75BC',
      }).then(() => {
        const fallback = userRole === 1 ? '/admin-home' : '/';
        setRedirectPath(fallback);
      });
    }
  }
}, [user, loading, isLoggingOut, initializing, location.pathname, requiredRoles]);

if (redirectPath) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  if (loading || isLoggingOut || initializing) {
  return (
    <div>Loading...</div>
  );
}
  return children;
}

export default ProtectedRoute;
