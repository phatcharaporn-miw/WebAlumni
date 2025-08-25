import ProtectedRoute from "./ProtectedRoute";
const PresidentOnly = ({ children }) => (
  <ProtectedRoute requiredRoles={["2"]}>{children}</ProtectedRoute>
);
export default PresidentOnly;
