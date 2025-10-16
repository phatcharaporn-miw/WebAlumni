import ProtectedRoute from "./ProtectedRoute";
const AdminOnly = ({ children }) => (
  <ProtectedRoute requiredRoles={["1"]} >
    {children}
  </ProtectedRoute>
);
export default AdminOnly;
