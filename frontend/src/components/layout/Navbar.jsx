import React from "react";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // Redirect is handled inside the logout function in api/auth.js
  };

  // Helper to get initials for the avatar
  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-10">
      <div className="flex h-16 items-center justify-between px-8">
        
        {/* Left: Company Identifier */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-blue-600 rounded-full"></div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none">
              Workspace
            </span>
            <span className="text-lg font-black text-slate-800 leading-tight">
              {user?.tenant || "BuildFlow Platform"}
            </span>
          </div>
        </div>

        {/* Right: User Profile & Actions */}
        <div className="flex items-center gap-6">
          
          <div className="flex items-center gap-3 border-r border-slate-100 pr-6">
            {/* User Text Info */}
            <div className="flex flex-col text-right">
              <span className="text-sm font-bold text-slate-900 leading-tight">
                {user?.user || "New User"}
              </span>
              <div className="flex items-center justify-end gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${getRoleColor(user?.role)}`}>
                  {user?.role?.replace("_", " ") || "MEMBER"}
                </span>
              </div>
            </div>

            {/* Avatar */}
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md border-2 border-white">
              {getInitials(user?.user)}
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-red-50 hover:border-red-100 hover:text-red-600 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

const getRoleColor = (role) => {
  switch (role) {
    case "SUPERADMIN": return "bg-purple-100 text-purple-700";
    case "ADMIN": return "bg-blue-100 text-blue-700";
    case "PROJECT_MANAGER": return "bg-amber-100 text-amber-700";
    default: return "bg-slate-100 text-slate-700";
  }
};

export default Navbar;
