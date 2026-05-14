import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchProjects } from "../api/projects";
import { Link } from "react-router-dom";

const CompanyDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await fetchProjects();
        setProjects(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load projects:", error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const stats = useMemo(() => {
    const total = projects.length;
    const active = projects.filter((project) =>
      ["PLANNING", "IN_PROGRESS"].includes(project.status)
    ).length;
    const completed = projects.filter(
      (project) => project.status === "COMPLETED"
    ).length;
    const managers = new Set(
      projects
        .map((project) => project.project_manager_id)
        .filter(Boolean)
    ).size;

    return { total, active, completed, managers };
  }, [projects]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 p-8 text-white shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-blue-200">
              Company overview
            </p>
            <h1 className="text-3xl font-bold md:text-4xl">
              Company Dashboard
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-200 md:text-base">
              Welcome to your workspace, {user?.name || user?.email}. Track
              projects, managers, and delivery progress from one place.
            </p>
          </div>

          <Link
            to="/company-dashboard/projects"
            className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-blue-50"
          >
            Manage Projects
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Total Projects" value={loading ? "..." : stats.total} />
        <SummaryCard label="Active Projects" value={loading ? "..." : stats.active} accent="blue" />
        <SummaryCard label="Completed" value={loading ? "..." : stats.completed} accent="green" />
        <SummaryCard label="Assigned Managers" value={loading ? "..." : stats.managers} accent="amber" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Projects</h2>
          {loading ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center text-sm text-gray-500">
              Loading projects...
            </div>
          ) : projects.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center text-sm text-gray-500">
              No projects yet. Use the project workspace to add your first one.
            </div>
          ) : (
            <div className="space-y-4">
              {projects.slice(0, 5).map((project) => (
                <div
                  key={project.id}
                  className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      <p className="text-sm text-gray-600">
                        {project.location} - {project.project_manager_name || "Unassigned"}
                      </p>
                    </div>
                    <StatusBadge status={project.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/company-dashboard/projects"
              className="block rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Create or review projects
            </Link>
            <Link
              to="/company-dashboard/team"
              className="block rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
            >
              Manage project managers
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ label, value, accent = "slate" }) => {
  const accentMap = {
    slate: "text-gray-900",
    blue: "text-blue-600",
    green: "text-emerald-600",
    amber: "text-amber-600",
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="text-sm font-medium text-gray-500">{label}</div>
      <div className={`mt-2 text-3xl font-bold ${accentMap[accent] || accentMap.slate}`}>
        {value}
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    PLANNING: "bg-slate-100 text-slate-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    ON_HOLD: "bg-amber-100 text-amber-700",
    COMPLETED: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status] || "bg-gray-100 text-gray-600"}`}>
      {status?.replace("_", " ") || "UNKNOWN"}
    </span>
  );
};

export default CompanyDashboard;
