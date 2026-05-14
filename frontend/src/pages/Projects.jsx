import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  createProject,
  updateProject,
  deleteProject,
  fetchProjectManagers,
  fetchEmployees,
  fetchProjects,
} from "../api/projects";

const initialForm = {
  name: "",
  description: "",
  project_type: "WEB_APP",
  priority: "MEDIUM",
  status: "IN_PROGRESS",
  tech_stack: "",
  repository_url: "",
  budget: "",
  start_date: "",
  deadline: "",
  project_manager: "",
  team_members: [],
};

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [managers, setManagers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [projectList, managerList, employeeList] = await Promise.all([
        fetchProjects(),
        fetchProjectManagers(),
        fetchEmployees(),
      ]);
      setProjects(Array.isArray(projectList) ? projectList : []);
      setManagers(managerList);
      setEmployees(employeeList);
    } catch (err) {
      setError(err?.message || "Could not load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const summary = useMemo(() => {
    const total = projects.length;
    const active = projects.filter((p) => p.status === "IN_PROGRESS").length;
    const critical = projects.filter((p) => p.priority === "CRITICAL").length;
    return { total, active, critical };
  }, [projects]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTeamChange = (e) => {
    const selectedIds = Array.from(e.target.selectedOptions, (opt) => opt.value);
    setFormData((prev) => ({ ...prev, team_members: selectedIds }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...formData,
        budget: formData.budget || null,
        project_manager: formData.project_manager || null,
      };

      if (isEditMode) {
        await updateProject(selectedProjectId, payload);
        setSuccess("Project updated successfully!");
      } else {
        await createProject(payload);
        setSuccess("Project created successfully!");
      }
      
      setFormData(initialForm);
      setIsEditMode(false);
      setSelectedProjectId(null);
      await loadData();
    } catch (err) {
      setError(err?.message || "Operation failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (project) => {
    setSelectedProjectId(project.id);
    setIsEditMode(true);
    setFormData({
      name: project.name,
      description: project.description || "",
      project_type: project.project_type,
      priority: project.priority,
      status: project.status,
      tech_stack: project.tech_stack || "",
      repository_url: project.repository_url || "",
      budget: project.budget || "",
      start_date: project.start_date || "",
      deadline: project.deadline || "",
      project_manager: project.project_manager || "",
      team_members: project.team_members || [],
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project? All associated tasks will also be removed.")) {
      return;
    }

    try {
      await deleteProject(projectId);
      setSuccess("Project deleted successfully.");
      await loadData();
    } catch (err) {
      setError(err?.message || "Failed to delete project.");
    }
  };

  const cancelEdit = () => {
    setIsEditMode(false);
    setSelectedProjectId(null);
    setFormData(initialForm);
    setError("");
    setSuccess("");
  };

  if (loading && projects.length === 0) {
    return <div className="p-8 text-center animate-pulse text-slate-400 font-bold uppercase tracking-widest">Synchronizing Core...</div>;
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header Section */}
      <div className="rounded-[40px] bg-slate-950 p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-block px-3 py-1 bg-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">Ecosystem Overview</div>
          <h1 className="text-5xl font-black tracking-tighter italic leading-none">Software Projects</h1>
          <p className="mt-4 text-slate-400 max-w-xl text-lg font-medium leading-relaxed">
            Centralized management of IT infrastructure development, team allocation, and project lifecycle metrics.
          </p>
        </div>
        <div className="absolute top-0 right-0 h-full w-2/5 bg-gradient-to-l from-blue-600/30 to-transparent blur-3xl translate-x-1/2"></div>
      </div>

      {/* Stats Section */}
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard label="Total Deployments" value={summary.total} />
        <StatCard label="Active Sprints" value={summary.active} color="text-blue-500" />
        <StatCard label="Critical Risks" value={summary.critical} color="text-red-500" />
      </div>

      <div className="grid gap-10 lg:grid-cols-12">
        {/* Creation/Edit Form - ONLY for Admins */}
        {(user?.role === "ADMIN" || user?.role === "SUPERADMIN") && (
          <div className="lg:col-span-5">
            <div className={`rounded-[32px] border-2 p-10 transition-all duration-500 ${isEditMode ? 'border-blue-500 bg-blue-50/20 shadow-2xl shadow-blue-100' : 'border-slate-100 bg-white shadow-xl shadow-slate-100'}`}>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-800 tracking-tighter">
                  {isEditMode ? "Update Config" : "New Project"}
                </h2>
                {isEditMode && (
                  <button onClick={cancelEdit} className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full transition">Cancel Edit</button>
                )}
              </div>
              
              {error && <div className="mb-6 rounded-2xl bg-red-50 p-4 text-xs font-black text-red-600 border border-red-100 animate-in slide-in-from-top-2">{error}</div>}
              {success && <div className="mb-6 rounded-2xl bg-emerald-50 p-4 text-xs font-black text-emerald-600 border border-emerald-100 animate-in slide-in-from-top-2">{success}</div>}

              <form onSubmit={handleSubmit} className="space-y-5">
                <InputField label="Project Title" name="name" value={formData.name} onChange={handleChange} required />
                
                <div className="grid grid-cols-2 gap-5">
                  <SelectField label="Category" name="project_type" value={formData.project_type} onChange={handleChange}>
                    <option value="WEB_APP">Web Application</option>
                    <option value="MOBILE_APP">Mobile App</option>
                    <option value="API_BACKEND">API / Backend</option>
                    <option value="UI_UX">UI/UX Design</option>
                  </SelectField>
                  <SelectField label="Priority" name="priority" value={formData.priority} onChange={handleChange}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </SelectField>
                </div>

                {isEditMode && (
                  <SelectField label="Active Status" name="status" value={formData.status} onChange={handleChange}>
                    <option value="PLANNING">Planning</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="COMPLETED">Completed</option>
                  </SelectField>
                )}

                <InputField label="Tech Stack" name="tech_stack" placeholder="e.g. React, Node.js, AWS" value={formData.tech_stack} onChange={handleChange} />
                
                <div className="grid grid-cols-2 gap-5">
                  <InputField label="Allocation ($)" name="budget" type="number" value={formData.budget} onChange={handleChange} />
                  <SelectField label="Lead Manager" name="project_manager" value={formData.project_manager} onChange={handleChange}>
                    <option value="">None Assigned</option>
                    {managers.map(m => (
                      <option key={m.id} value={m.id}>{m.name || m.email}</option>
                    ))}
                  </SelectField>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <InputField label="Start Date" name="start_date" type="date" value={formData.start_date} onChange={handleChange} required />
                  <InputField label="Final Deadline" name="deadline" type="date" value={formData.deadline} onChange={handleChange} />
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Assigned Force</label>
                  <select
                    multiple
                    name="team_members"
                    value={formData.team_members}
                    onChange={handleTeamChange}
                    className="h-40 w-full rounded-2xl border border-slate-100 bg-slate-50 p-5 text-sm focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50/50 transition-all outline-none"
                  >
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.name || e.email}</option>
                    ))}
                  </select>
                  <p className="mt-2 text-[10px] text-slate-400 italic">Hold Ctrl/Cmd for multi-select.</p>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className={`w-full rounded-2xl py-5 font-black uppercase tracking-widest text-white shadow-2xl transition-all duration-300 ${isEditMode ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100' : 'bg-slate-900 hover:bg-black shadow-slate-200'}`}
                >
                  {saving ? "Processing..." : isEditMode ? "Apply Updates" : "Initialize System"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Projects List */}
        <div className={(user?.role === "ADMIN" || user?.role === "SUPERADMIN") ? "lg:col-span-7" : "lg:col-span-12"}>
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-800 tracking-tighter ml-2">Live Ecosystem</h2>
            {projects.length === 0 ? (
              <div className="rounded-[32px] border-2 border-dashed border-slate-100 p-24 text-center text-slate-300 font-black uppercase tracking-widest">
                System Offline
              </div>
            ) : (
              projects.map((project) => (
                <div key={project.id} className="group relative rounded-[32px] border border-slate-50 bg-white p-8 shadow-sm transition-all duration-500 hover:shadow-2xl hover:border-blue-100 hover:-translate-y-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <StatusIndicator status={project.status} />
                        <Link to={`/company-dashboard/projects/${project.id}`} className="text-2xl font-black text-slate-900 tracking-tighter hover:text-blue-600 transition-colors">
                          {project.name}
                        </Link>
                      </div>
                      <div className="mt-3 flex gap-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 bg-slate-50 px-2 py-0.5 rounded-md">{project.project_type?.replace("_", " ")}</span>
                        {project.budget && <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md font-bold">${project.budget} BUDGET</span>}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest shadow-sm ${getPriorityStyles(project.priority)}`}>
                        {project.priority}
                      </span>
                      {(user?.role === "ADMIN" || user?.role === "SUPERADMIN") && (
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                          <button 
                            onClick={() => handleEditClick(project)}
                            className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                            title="Edit Project"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(project.id)}
                            className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                            title="Delete Project"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-10 grid grid-cols-2 gap-10 text-sm md:grid-cols-4">
                    <DataPoint label="Tech Stack" value={project.tech_stack} />
                    <DataPoint label="Lead Manager" value={project.project_manager_detail?.full_name} />
                    <DataPoint label="Project Force" value={`${project.team_members_detail?.length || 0} Engineers`} />
                    <DataPoint label="Deadline" value={project.deadline} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color = "text-slate-900" }) => (
  <div className="rounded-[32px] border border-slate-50 bg-white p-10 shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
    <p className="text-[11px] font-black uppercase tracking-widest text-slate-300">{label}</p>
    <p className={`mt-3 text-6xl font-black tracking-tighter ${color}`}>{value}</p>
  </div>
);

const DataPoint = ({ label, value }) => (
  <div>
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
    <p className="mt-2 font-black text-slate-800 tracking-tight">{value || "UNSET"}</p>
  </div>
);

const StatusIndicator = ({ status }) => {
  const colors = {
    PLANNING: "bg-slate-300",
    IN_PROGRESS: "bg-blue-600",
    ON_HOLD: "bg-orange-500",
    COMPLETED: "bg-emerald-500"
  };
  return <div className={`h-4 w-4 rounded-full shadow-inner ${colors[status] || "bg-slate-300"} border-2 border-white`}></div>;
};

const InputField = ({ label, ...props }) => (
  <div className="space-y-2">
    <label className="ml-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
    <input
      {...props}
      className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4 text-sm font-bold text-slate-800 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50/30 outline-none transition-all duration-300"
    />
  </div>
);

const SelectField = ({ label, children, ...props }) => (
  <div className="space-y-2">
    <label className="ml-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
    <select
      {...props}
      className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4 text-sm font-bold text-slate-800 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50/30 outline-none transition-all duration-300 appearance-none"
    >
      {children}
    </select>
  </div>
);

const getPriorityStyles = (priority) => {
  switch (priority) {
    case "CRITICAL": return "bg-red-500 text-white";
    case "HIGH": return "bg-orange-500 text-white";
    case "MEDIUM": return "bg-blue-600 text-white";
    default: return "bg-slate-100 text-slate-500";
  }
};

export default Projects;
