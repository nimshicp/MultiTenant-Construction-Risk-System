import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Sidebar = () => {
  const { user } = useAuth();

  const getNavLinks = () => {
    const role = user?.role;

    if (role === "SUPERADMIN") {
      return [{ name: "Platform Admin", path: "/platform-admin", icon: "🌐" }];
    }

    if (role === "ADMIN") {
      return [
        { name: "Command Center", path: "/company-dashboard", icon: "📊" },
        { name: "Projects", path: "/company-dashboard/projects", icon: "🏗️" },
        { name: "Personnel", path: "/company-dashboard/team", icon: "👥" },
      ];
    }

    if (role === "PROJECT_MANAGER") {
      return [
        { name: "PM Dashboard", path: "/project-manager-dashboard", icon: "🗂️" },
        { name: "Projects", path: "/company-dashboard/projects", icon: "🏗️" },
      ];
    }

    if (role === "EMPLOYEE" || role === "VIEWER") {
      return [
        { name: "My Work", path: "/employee-dashboard", icon: "⚡" },
        { name: "Projects", path: "/company-dashboard/projects", icon: "🏗️" },
      ];
    }

    return [];
  };

  const navLinks = getNavLinks();

  return (
    <aside className="w-72 bg-slate-950 text-white min-h-screen flex flex-col border-r border-slate-900 shadow-2xl">
      <div className="p-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-xl italic shadow-lg shadow-blue-900/40">B</div>
          <h2 className="text-2xl font-black tracking-tighter italic text-white">BuildFlow</h2>
        </div>
      </div>

      <nav className="mt-4 flex flex-col gap-2 px-6 flex-1">
        <div className="mb-4 ml-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Navigation</div>
        {navLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end
            className={({ isActive }) =>
              `group flex items-center gap-4 rounded-2xl px-5 py-4 text-sm font-black uppercase tracking-widest transition-all duration-300 ${isActive
                ? "bg-blue-600 text-white shadow-xl shadow-blue-900/20"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`
            }
          >
            <span className="text-lg opacity-70 group-hover:scale-110 transition-transform">{link.icon}</span>
            <span className="tracking-tighter">{link.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-8 border-t border-slate-900">
        <div className="rounded-2xl bg-slate-900/50 p-6 border border-slate-900">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">System Mode</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-slate-300">Tenant Sync Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
