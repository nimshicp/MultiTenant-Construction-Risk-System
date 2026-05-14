import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RoleRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
      </div>
    );
  }

  // If we have a user but they don't have the right role
  if (user && !allowedRoles.includes(user.role)) {
    // Redirect to their respective dashboard
    if (user.role === "SUPER_ADMIN") return <Navigate to="/platform-admin" replace />;
    if (user.role === "COMPANY_ADMIN") return <Navigate to="/company-dashboard" replace />;
    if (user.role === "PROJECT_MANAGER") return <Navigate to="/project-manager-dashboard" replace />;
    
    // Fallback
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleRoute;
