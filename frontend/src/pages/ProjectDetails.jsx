import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { deleteTask, updateTask } from "../api/projects";

const ProjectDetails = () => {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    task_type: "FEATURE",
    priority: "MEDIUM",
    due_date: "",
    assigned_to: ""
  });

  const fetchData = async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        api.get(`/api/projects/${projectId}/`),
        api.get(`/api/projects/${projectId}/tasks/`)
      ]);
      setProject(projRes.data);
      setTasks(taskRes.data);
    } catch (err) {
      console.error("Failed to fetch project details", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setTaskForm({ title: "", description: "", task_type: "FEATURE", priority: "MEDIUM", due_date: "", assigned_to: "" });
    setIsTaskModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      task_type: task.task_type,
      priority: task.priority,
      due_date: task.due_date || "",
      assigned_to: task.assigned_to || ""
    });
    setIsTaskModalOpen(true);
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await updateTask(editingTask.id, taskForm);
      } else {
        await api.post(`/api/projects/${projectId}/tasks/create/`, taskForm);
      }
      setIsTaskModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || err.message || "Operation failed.");
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Are you sure you want to permanently delete this task?")) return;
    try {
      await deleteTask(taskId);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-20 text-center font-black text-slate-300 animate-pulse uppercase tracking-widest">Accessing Project Vault...</div>;
  if (!project) return <div className="p-20 text-center text-red-500 font-bold">Project Not Found</div>;

  const isManagerOrAdmin = 
    user?.role === "ADMIN" || 
    user?.role === "SUPERADMIN" || 
    user?.role === "PROJECT_MANAGER" ||
    project.project_manager === user?.id ||
    project.project_manager_detail?.email?.toLowerCase() === user?.user?.toLowerCase();

  return (
    <div className="space-y-8 pb-20">
      {/* Dynamic Header */}
      <div className="rounded-[40px] bg-slate-900 p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <Link to="/company-dashboard/projects" className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-white transition mb-4 inline-block">← Back to Ecosystem</Link>
            <h1 className="text-4xl font-black tracking-tighter italic leading-none">{project.name}</h1>
            <p className="text-slate-400 mt-3 font-medium max-w-2xl text-sm">{project.description || "Project parameters synchronized and active."}</p>
          </div>
          {isManagerOrAdmin && (
            <button 
              onClick={handleOpenCreateModal}
              className="bg-blue-600 hover:bg-blue-700 px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 transition-all active:scale-95 text-xs"
            >
              + Initialize Task
            </button>
          )}
        </div>
        <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-blue-600/10 to-transparent blur-3xl"></div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Project Intelligence Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-6 border-b border-slate-50 pb-2">Core Intel</h3>
            <div className="space-y-6">
              <IntelItem label="Current Status" value={project.status_display} color="text-blue-600" />
              <IntelItem label="Lead Manager" value={project.project_manager_detail?.full_name || "Unassigned"} />
              <IntelItem label="Project Velocity" value={`${project.progress_percentage}%`} />
              <IntelItem label="Tech Environment" value={project.tech_stack || "Standard"} />
              <IntelItem label="Final Deadline" value={project.deadline || "TBD"} />
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-6 border-b border-slate-50 pb-2">Project Force</h3>
            <div className="flex flex-wrap gap-2">
              {project.team_members_detail?.map(m => (
                <div key={m.id} className="bg-slate-50 px-4 py-2 rounded-xl text-[10px] font-black text-slate-600 border border-slate-100 uppercase tracking-tight">
                  {m.full_name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Task Control Center */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black text-slate-800 tracking-tighter">Task Matrix</h2>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1 rounded-md border border-slate-100">Syncing Live</span>
          </div>

          {tasks.length === 0 ? (
            <div className="rounded-[32px] border-2 border-dashed border-slate-100 p-24 text-center text-slate-300 font-black uppercase tracking-widest">
              No Active Operations
            </div>
          ) : (
            <div className="grid gap-6">
              {tasks.map(task => (
                <div key={task.id} className="group bg-white rounded-[32px] p-8 border border-slate-50 shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all duration-500">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getPriorityStyles(task.priority)}`}>{task.priority}</span>
                          <h4 className="text-xl font-black text-slate-800 tracking-tight">{task.title}</h4>
                        </div>
                        {isManagerOrAdmin && (
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button onClick={() => handleOpenEditModal(task)} className="p-2 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => handleDelete(task.id)} className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-all">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">{task.description}</p>
                      
                      <div className="flex flex-wrap gap-4 pt-2">
                        <MiniField label="Status" value={task.status_display} color="text-blue-600" />
                        <MiniField label="Assignee" value={task.assigned_to_detail?.full_name || "Unassigned"} />
                        <MiniField label="Type" value={task.task_type_display} />
                      </div>

                      {task.notes && (
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mt-4">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Technical Summary</p>
                          <p className="text-xs font-medium text-slate-600 italic">"{task.notes}"</p>
                        </div>
                      )}
                      
                      {/* MICRO-TASK CHECKLIST REMOVED AS REQUESTED */}
                    </div>

                    <div className="w-full md:w-32 text-right">
                      <div className="text-3xl font-black text-slate-900 tracking-tighter">{task.progress_percentage}%</div>
                      <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">Completion</div>
                      <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full transition-all duration-700" style={{ width: `${task.progress_percentage}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Modal (Create & Edit) */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-xl p-10 animate-in zoom-in duration-300">
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter italic mb-8">
              {editingTask ? "Modify Existing Operation" : "Initialize New Operation"}
            </h2>
            <form onSubmit={handleSubmitTask} className="space-y-5">
              <Input label="Task Title" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} required />
              <div className="grid grid-cols-2 gap-5">
                <SelectField label="Priority" value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </SelectField>
                <SelectField label="Type" value={taskForm.task_type} onChange={e => setTaskForm({...taskForm, task_type: e.target.value})}>
                  <option value="FEATURE">Feature</option>
                  <option value="BUG_FIX">Bug Fix</option>
                  <option value="CODE_REVIEW">Code Review</option>
                  <option value="TESTING">QA / Testing</option>
                </SelectField>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <Input label="Due Date" type="date" value={taskForm.due_date} onChange={e => setTaskForm({...taskForm, due_date: e.target.value})} />
                <SelectField label="Assign Personnel" value={taskForm.assigned_to} onChange={e => setTaskForm({...taskForm, assigned_to: e.target.value})} required>
                  <option value="">Select Member</option>
                  {project.team_members_detail?.map(m => (
                    <option key={m.id} value={m.id}>{m.full_name}</option>
                  ))}
                </SelectField>
              </div>
              <textarea 
                className="w-full h-24 rounded-2xl border border-slate-100 bg-slate-50 p-5 text-sm font-medium outline-none focus:bg-white focus:border-blue-400 transition-all"
                placeholder="Technical specifications..."
                value={taskForm.description}
                onChange={e => setTaskForm({...taskForm, description: e.target.value})}
              />
              <div className="flex gap-4 mt-6">
                <button type="button" onClick={() => setIsTaskModalOpen(false)} className="flex-1 bg-slate-100 text-slate-500 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px]">Abort</button>
                <button type="submit" className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">
                  {editingTask ? "Update Parameters" : "Initialize Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const IntelItem = ({ label, value, color = "text-slate-800" }) => (
  <div>
    <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-1">{label}</p>
    <p className={`text-sm font-black uppercase tracking-tight ${color}`}>{value || "UNSET"}</p>
  </div>
);

const MiniField = ({ label, value, color = "text-slate-700" }) => (
  <div className="bg-slate-50 border border-slate-100 px-3 py-1 rounded-xl">
    <span className="text-[8px] font-black uppercase tracking-widest text-slate-300 mr-2">{label}:</span>
    <span className={`text-[9px] font-black uppercase tracking-tight ${color}`}>{value}</span>
  </div>
);

const Input = ({ label, ...props }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
    <input {...props} className="w-full rounded-xl border border-slate-100 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-800 focus:bg-white focus:border-blue-400 outline-none transition-all" />
  </div>
);

const SelectField = ({ label, children, ...props }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
    <select {...props} className="w-full rounded-xl border border-slate-100 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-800 focus:bg-white focus:border-blue-400 outline-none transition-all appearance-none">
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

export default ProjectDetails;
