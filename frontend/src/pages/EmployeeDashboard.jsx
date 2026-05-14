import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchMyTasks, updateTask, addChecklistItem, updateChecklistItem, deleteChecklistItem } from "../api/projects";

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const loadTasks = async () => {
    try {
      const data = await fetchMyTasks();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const stats = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter(t => t.status !== 'DONE').length;
    const completed = total - pending;
    const avgProgress = total > 0 ? Math.round(tasks.reduce((acc, t) => acc + (t.progress_percentage || 0), 0) / total) : 0;
    return { total, pending, completed, avgProgress };
  }, [tasks]);

  const handleStatusChange = async (taskId, newStatus) => {
    setUpdatingId(taskId);
    try {
      await updateTask(taskId, { status: newStatus });
      await loadTasks();
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleProgressUpdate = async (taskId, progress, notes) => {
    setUpdatingId(taskId);
    try {
      await updateTask(taskId, { progress_percentage: progress, notes });
      await loadTasks();
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddCheckpoint = async (taskId, content) => {
    try {
      await addChecklistItem(taskId, content);
      await loadTasks();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleCheckpoint = async (itemId, isCompleted) => {
    try {
      await updateChecklistItem(itemId, { is_completed: !isCompleted });
      await loadTasks();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteCheckpoint = async (itemId) => {
    try {
      await deleteChecklistItem(itemId);
      await loadTasks();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div className="p-24 text-center font-black text-slate-300 uppercase tracking-[0.5em] animate-pulse">Syncing Task Matrix...</div>;
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Premium Header */}
      <div className="rounded-[40px] bg-slate-950 p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-block px-3 py-1 bg-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">Personnel Terminal</div>
          <h1 className="text-5xl font-black tracking-tighter italic leading-none">Developer Dashboard</h1>
          <p className="mt-4 text-slate-400 max-w-xl text-lg font-medium leading-relaxed">
            Welcome back, <span className="text-emerald-400">{user?.name || user?.email}</span>. Your active assignments and development metrics are synchronized below.
          </p>
        </div>
        <div className="absolute top-0 right-0 h-full w-2/5 bg-gradient-to-l from-emerald-600/20 to-transparent blur-3xl translate-x-1/2"></div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-4">
        <MetricCard label="Total Tickets" value={stats.total} />
        <MetricCard label="Pending Action" value={stats.pending} color="text-orange-500" />
        <MetricCard label="Cycles Completed" value={stats.completed} color="text-emerald-500" />
        <MetricCard label="Velocity" value={`${stats.avgProgress}%`} color="text-blue-500" />
      </div>

      {/* Task List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl font-black text-slate-800 tracking-tighter">My Active Sprint</h2>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1 rounded-full">Sorted by Priority</span>
        </div>

        {tasks.length === 0 ? (
          <div className="rounded-[32px] border-2 border-dashed border-slate-100 p-24 text-center text-slate-300 font-black uppercase tracking-widest">
            No Active Tasks Found
          </div>
        ) : (
          <div className="grid gap-6">
            {tasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onStatusChange={handleStatusChange}
                onProgressUpdate={handleProgressUpdate}
                onAddCheckpoint={handleAddCheckpoint}
                onToggleCheckpoint={handleToggleCheckpoint}
                onDeleteCheckpoint={handleDeleteCheckpoint}
                isUpdating={updatingId === task.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const TaskCard = ({ task, onStatusChange, onProgressUpdate, onAddCheckpoint, onToggleCheckpoint, onDeleteCheckpoint, isUpdating }) => {
  const [localProgress, setLocalProgress] = useState(task.progress_percentage || 0);
  const [localNotes, setLocalNotes] = useState(task.notes || "");
  const [newCheckpoint, setNewCheckpoint] = useState("");

  const statusColors = {
    TODO: "bg-slate-100 text-slate-600",
    IN_PROGRESS: "bg-blue-50 text-blue-600",
    IN_REVIEW: "bg-orange-50 text-orange-600",
    DONE: "bg-emerald-50 text-emerald-600"
  };

  const handleAdd = (e) => {
    if (e.key === 'Enter' && newCheckpoint.trim()) {
      onAddCheckpoint(task.id, newCheckpoint.trim());
      setNewCheckpoint("");
    }
  };

  return (
    <div className={`rounded-[32px] border border-slate-100 bg-white p-8 shadow-sm transition-all duration-500 hover:shadow-2xl hover:border-blue-100 ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex flex-col xl:flex-row justify-between gap-8">
        <div className="flex-1 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getPriorityStyles(task.priority)}`}>
                {task.priority}
              </span>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Task ID: {task.id.slice(0,8)}</span>
            </div>
            
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-tight">{task.title}</h3>
            <p className="text-sm font-medium text-slate-500 leading-relaxed">{task.description || "No technical description provided."}</p>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <DataField label="Task Type" value={task.task_type?.replace("_", " ")} />
              <DataField label="Due Date" value={task.due_date || "UNSET"} />
              <DataField label="Project" value={task.project_name || "N/A"} />
            </div>
          </div>

          {/* Checklist System */}
          <div className="bg-slate-50 rounded-[28px] p-6 border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Micro-Task Checklist</h4>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{task.checklist_items?.filter(i => i.is_completed).length || 0}/{task.checklist_items?.length || 0} Done</span>
            </div>
            
            <div className="space-y-2">
              {task.checklist_items?.map(item => (
                <div key={item.id} className="flex items-center justify-between group bg-white p-3 rounded-xl border border-slate-100 transition-all hover:border-blue-200">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      checked={item.is_completed} 
                      onChange={() => onToggleCheckpoint(item.id, item.is_completed)}
                      className="h-4 w-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className={`text-xs font-bold transition-all ${item.is_completed ? 'line-through text-slate-300' : 'text-slate-700'}`}>
                      {item.content}
                    </span>
                  </div>
                  <button onClick={() => onDeleteCheckpoint(item.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="relative">
              <input 
                type="text" 
                value={newCheckpoint}
                onChange={(e) => setNewCheckpoint(e.target.value)}
                onKeyDown={handleAdd}
                placeholder="Type a sub-task and press Enter..."
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all pr-20"
              />
              <button 
                onClick={() => {
                  if (newCheckpoint.trim()) {
                    onAddCheckpoint(task.id, newCheckpoint.trim());
                    setNewCheckpoint("");
                  }
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md shadow-blue-900/20"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <div className="w-full xl:w-80 space-y-6 bg-slate-900 rounded-[32px] p-8 shadow-2xl border border-slate-800 self-start">
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Lifecycle Status</label>
              <select 
                value={task.status} 
                onChange={(e) => onStatusChange(task.id, e.target.value)}
                className={`w-full rounded-xl border-none font-black text-xs uppercase tracking-widest p-3 shadow-lg focus:ring-4 focus:ring-blue-500/20 transition-all outline-none ${statusColors[task.status]}`}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Global Progress</label>
                <span className="text-xs font-black text-blue-400">{localProgress}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={localProgress} 
                onChange={(e) => setLocalProgress(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Technical Summary</label>
              <textarea 
                value={localNotes}
                onChange={(e) => setLocalNotes(e.target.value)}
                placeholder="Summarize your progress..."
                className="w-full h-24 rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs font-medium text-slate-300 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none resize-none"
              />
            </div>

            <button 
              onClick={() => onProgressUpdate(task.id, localProgress, localNotes)}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-900/40"
            >
              Sync Metrics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, color = "text-slate-900" }) => (
  <div className="rounded-[32px] border border-slate-50 bg-white p-10 shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
    <p className="text-[11px] font-black uppercase tracking-widest text-slate-300">{label}</p>
    <p className={`mt-3 text-5xl font-black tracking-tighter ${color}`}>{value}</p>
  </div>
);

const DataField = ({ label, value }) => (
  <div className="bg-white border border-slate-100 px-3 py-1.5 rounded-xl shadow-sm">
    <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 mr-2">{label}:</span>
    <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">{value}</span>
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

export default EmployeeDashboard;
