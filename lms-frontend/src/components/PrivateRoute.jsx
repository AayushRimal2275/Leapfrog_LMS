import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children }) {
  const { loading } = useAuth();

  // Still restoring session from localStorage → show spinner
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

  // After loading: gate on token only.
  // user state in AuthContext is populated before navigate() fires (via login()),
  // so there's no race between "token set" and "user null".
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;

  return children;
}
