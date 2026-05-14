import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchMyProjects } from "../api/projects";

const ProjectManagerDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await fetchMyProjects();
        setProjects(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load my projects:", error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const activeProjects = projects.filter((project) =>
    ["PLANNING", "IN_PROGRESS"].includes(project.status)
  ).length;

  const criticalProjects = projects.filter(
    (project) => project.priority === "CRITICAL"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 p-8 text-white shadow-xl">
        <p className="mb-3 text-sm uppercase tracking-[0.3em] text-indigo-200 font-semibold">
          Project Manager Workspace
        </p>
        <h1 className="text-3xl font-bold md:text-4xl">My Projects</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-300 md:text-base">
          Welcome back, <span className="text-white font-bold">{user?.name || user?.email}</span>. 
          Manage your assigned software projects and track team milestones.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Assigned Projects" value={loading ? "..." : projects.length} />
        <MetricCard label="Active Projects" value={loading ? "..." : activeProjects} accent="blue" />
        <MetricCard label="Critical Priority" value={loading ? "..." : criticalProjects} accent="red" />
      </div>

      {/* Projects List */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-bold text-gray-900">Project List</h2>
        
        {loading ? (
          <div className="py-12 text-center text-gray-500 italic">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center text-sm text-gray-500">
            You do not have any assigned projects yet.
          </div>
        ) : (
          <div className="grid gap-6">
            {projects.map((project) => (
              <article
                key={project.id}
                className="group relative rounded-2xl border border-gray-100 bg-white p-6 transition hover:shadow-md hover:border-blue-200"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Link to={`/company-dashboard/projects/${project.id}`} className="text-xl font-bold text-slate-800 hover:text-blue-600 transition-colors">
                        {project.name}
                      </Link>
                      <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${getPriorityStyles(project.priority)}`}>
                        {project.priority_display}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2 max-w-2xl">
                      {project.description || "No description provided for this software project."}
                    </p>
                    
                    <div className="flex flex-wrap gap-4 pt-2 text-xs font-medium text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-slate-300"></span>
                        {project.project_type_display}
                      </div>
                      <div className="flex items-center gap-1.5 text-blue-600">
                        <span className="font-bold">Stack:</span> {project.tech_stack || "Not specified"}
                      </div>
                      <div>Deadline: {project.deadline || "TBD"}</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={project.status} />
                    <p className="text-[10px] text-slate-400 font-mono">#{project.id.slice(0, 8)}</p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-50 pt-4 md:grid-cols-4">
                  <InfoBox label="Created By" value={project.created_by_detail?.full_name || "Admin"} />
                  <InfoBox label="Team" value={`${project.team_members_detail?.length || 0} Members`} />
                  <InfoBox label="Budget" value={project.budget ? `Rs. ${project.budget}` : "N/A"} />
                  <InfoBox label="Progress" value={`${project.progress_percentage}%`} />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, accent = "slate" }) => {
  const accentMap = {
    slate: "text-slate-900",
    blue: "text-blue-600",
    red: "text-red-600",
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</div>
      <div className={`mt-2 text-3xl font-black ${accentMap[accent] || accentMap.slate}`}>{value}</div>
    </div>
  );
};

const InfoBox = ({ label, value }) => (
  <div className="rounded-xl bg-slate-50 px-4 py-3">
    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</div>
    <div className="mt-1 text-sm font-semibold text-slate-700">{value}</div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    PLANNING: "bg-slate-100 text-slate-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    ON_HOLD: "bg-amber-100 text-amber-700",
    COMPLETED: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <span className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide ${styles[status] || "bg-gray-100 text-gray-600"}`}>
      {status?.replace("_", " ")}
    </span>
  );
};

const getPriorityStyles = (priority) => {
  switch (priority) {
    case "CRITICAL": return "bg-red-500 text-white shadow-sm";
    case "HIGH": return "bg-orange-100 text-orange-700";
    case "MEDIUM": return "bg-blue-100 text-blue-700";
    default: return "bg-slate-100 text-slate-600";
  }
};

export default ProjectManagerDashboard;
