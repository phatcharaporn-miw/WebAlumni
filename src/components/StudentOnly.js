import ProtectedRoute from "./ProtectedRoute";
const StudentOnly = ({ children }) => (
  <ProtectedRoute requiredRoles={["4"]} >
    {children}
  </ProtectedRoute>
);
export default StudentOnly;

