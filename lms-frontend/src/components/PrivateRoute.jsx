import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * PrivateRoute
 * - No token → redirect to /login
 * - allowedRoles provided → redirect if user's role isn't in the list
 */
export default function PrivateRoute({ children, allowedRoles }) {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#11111b]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-[#cba6f7] border-t-transparent animate-spin" />
          <p className="text-[#6c7086] text-sm">Loading Leapfrog Connect...</p>
        </div>
      </div>
    );
  }

  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/landing" replace />;

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to the correct home for their role
    const roleHome =
      user.role === "admin" ? "/admin" : user.role === "hr" ? "/hr" : "/";
    return <Navigate to={roleHome} replace />;
  }

  return children;
}
