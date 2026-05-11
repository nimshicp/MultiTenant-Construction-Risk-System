import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PlatformDashboard from "./pages/PlatformDashboard";
import CompanyDashboard from "./pages/CompanyDashboard";
import Projects from "./pages/Projects";
import ProjectManagerDashboard from "./pages/ProjectManagerDashboard";
import TeamManagement from "./pages/TeamManagement";

// Layout & Protection
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";

// Auto-redirector for the root path
const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  if (user?.role === "SUPER_ADMIN") return <Navigate to="/platform-admin" replace />;
  if (user?.role === "COMPANY_ADMIN") return <Navigate to="/company-dashboard" replace />;
  if (user?.role === "PROJECT_MANAGER") return <Navigate to="/project-manager-dashboard" replace />;
  
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes inside the Main Layout */}
          <Route element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            
            {/* SUPER ADMIN Routes */}
            <Route path="/platform-admin" element={
              <RoleRoute allowedRoles={["SUPER_ADMIN"]}>
                <PlatformDashboard />
              </RoleRoute>
            } />

            {/* COMPANY ADMIN Routes */}
            <Route path="/company-dashboard" element={
              <RoleRoute allowedRoles={["COMPANY_ADMIN"]}>
                <CompanyDashboard />
              </RoleRoute>
            } />
            <Route path="/company-dashboard/projects" element={
              <RoleRoute allowedRoles={["COMPANY_ADMIN"]}>
                <Projects />
              </RoleRoute>
            } />
            <Route path="/company-dashboard/team" element={
              <RoleRoute allowedRoles={["COMPANY_ADMIN"]}>
                <TeamManagement />
              </RoleRoute>
            } />

            {/* PROJECT MANAGER Routes */}
            <Route path="/project-manager-dashboard" element={
              <RoleRoute allowedRoles={["PROJECT_MANAGER"]}>
                <ProjectManagerDashboard />
              </RoleRoute>
            } />
            
          </Route>

          {/* Root catch-all */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
