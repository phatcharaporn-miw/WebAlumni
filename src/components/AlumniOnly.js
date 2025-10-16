import ProtectedRoute from "./ProtectedRoute";
const AlumniOnly = ({ children }) => (
  <ProtectedRoute requiredRoles={["3"]} >
    {children}
  </ProtectedRoute>
);
export default AlumniOnly;
