import React, { useState, useEffect } from "react";
import api from "../api/axios";

const TeamManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [employees, setEmployees] = useState([]);
  const [fetching, setFetching] = useState(true);
  
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    role: "EMPLOYEE",
    department: "",
    job_title: "",
  });

  const fetchEmployees = async () => {
    try {
      const res = await api.get(`/api/employee/list/`); 
      setEmployees(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch employees", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.post(`/api/employee/invite/`, formData);
      setSuccess("Invitation sent successfully!");
      setFormData({ full_name: "", email: "", role: "EMPLOYEE", department: "", job_title: "" });
      fetchEmployees(); 
      setTimeout(() => setIsInviteModalOpen(false), 2000);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to invite employee.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (emp) => {
    setSelectedEmployee(emp);
    setFormData({
      full_name: emp.name,
      role: emp.role,
      department: emp.department || "",
      job_title: emp.job_title || "",
      is_blocked: emp.is_blocked,
      is_active: emp.is_active,
    });
    setIsEditModalOpen(true);
    setSuccess("");
    setError("");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch(`/api/employee/manage/${selectedEmployee.employee_id}/`, formData);
      setSuccess("Employee updated successfully!");
      fetchEmployees();
      setTimeout(() => setIsEditModalOpen(false), 1500);
    } catch (err) {
      setError("Failed to update employee.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (!window.confirm("Are you sure you want to permanently delete this employee? This action cannot be undone.")) {
      return;
    }

    try {
      await api.delete(`/api/employee/manage/${employeeId}/`);
      setSuccess("Employee deleted successfully.");
      fetchEmployees();
    } catch (err) {
      alert("Failed to delete employee.");
    }
  };

  const toggleBlock = async (emp) => {
    try {
      await api.patch(`/api/employee/manage/${emp.employee_id}/`, { is_blocked: !emp.is_blocked });
      fetchEmployees();
    } catch (err) {
      alert("Failed to toggle block status.");
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between bg-slate-900 p-10 rounded-[32px] shadow-2xl text-white">
        <div>
          <h1 className="text-3xl font-black tracking-tighter italic">Team Management</h1>
          <p className="text-slate-400 mt-2 text-sm font-medium">Control workspace access, roles, and organizational structure.</p>
        </div>
        <button
          onClick={() => { setIsInviteModalOpen(true); setFormData({ full_name: "", email: "", role: "EMPLOYEE", department: "", job_title: "" }); setSuccess(""); setError(""); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 transition-all active:scale-95 flex items-center gap-3"
        >
          <span className="text-xl">+</span> Invite Member
        </button>
      </div>

      <div className="bg-white rounded-[32px] shadow-xl shadow-slate-100 border border-slate-50 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Active Roster</h2>
          <span className="bg-white border border-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{employees.length} Personnel</span>
        </div>
        
        {fetching ? (
          <div className="text-center py-24 text-slate-300 font-black uppercase tracking-widest animate-pulse">Scanning Bio-Metrics...</div>
        ) : employees.length === 0 ? (
          <div className="text-center py-24 text-slate-300 font-black uppercase tracking-widest">No Personnel Found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest font-black">
                <tr>
                  <th className="py-5 px-8">Employee Identity</th>
                  <th className="py-5 px-8">Assignment & Role</th>
                  <th className="py-5 px-8">Status</th>
                  <th className="py-5 px-8 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 transition-all duration-300 group">
                    <td className="py-5 px-8">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-slate-200">
                          {emp.name?.slice(0, 2) || "U"}
                        </div>
                        <div>
                          <div className="font-black text-slate-800 text-lg tracking-tight">{emp.name}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-8">
                      <div className="text-xs font-black text-blue-600 uppercase tracking-widest">{emp.role?.replace("_", " ")}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-black tracking-tighter mt-0.5">{emp.department || "Base Ops"} • {emp.job_title || "Personnel"}</div>
                    </td>
                    <td className="py-5 px-8">
                      <div className="flex flex-col gap-1">
                        {!emp.is_active ? (
                          <span className="inline-block w-fit bg-red-50 text-red-600 px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border border-red-100">Deactivated</span>
                        ) : emp.is_blocked ? (
                          <span className="inline-block w-fit bg-orange-50 text-orange-600 px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border border-orange-100">Restricted</span>
                        ) : (
                          <span className="inline-block w-fit bg-emerald-50 text-emerald-600 px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border border-emerald-100">Authorized</span>
                        )}
                      </div>
                    </td>
                    <td className="py-5 px-8 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                        <button 
                          onClick={() => handleEditClick(emp)}
                          className="p-3 bg-slate-50 hover:bg-blue-600 hover:text-white rounded-xl text-slate-400 transition-all shadow-sm"
                          title="Modify Clearance"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => toggleBlock(emp)}
                          className={`p-3 rounded-xl transition-all shadow-sm ${emp.is_blocked ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white' : 'bg-slate-50 text-slate-400 hover:bg-orange-600 hover:text-white'}`}
                          title={emp.is_blocked ? "Restore Access" : "Suspend Access"}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDeleteEmployee(emp.employee_id)}
                          className="p-3 bg-slate-50 hover:bg-red-600 hover:text-white rounded-xl text-slate-400 transition-all shadow-sm"
                          title="Purge Personnel"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <Modal title="Onboard Personnel" onClose={() => setIsInviteModalOpen(false)}>
          <form onSubmit={handleInvite} className="space-y-5 mt-6">
            {success && <div className="p-4 bg-emerald-50 text-emerald-600 text-xs font-black rounded-2xl border border-emerald-100 animate-in slide-in-from-top-2">Access Granted: Invitation Dispatched</div>}
            {error && <div className="p-4 bg-red-50 text-red-600 text-xs font-black rounded-2xl border border-red-100 animate-in slide-in-from-top-2">{error}</div>}
            
            <div className="grid grid-cols-2 gap-5">
              <Input label="Full Identity" name="full_name" value={formData.full_name} onChange={handleChange} required />
              <Input label="Email Node" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>
            
            <div className="grid grid-cols-2 gap-5">
              <SelectField label="Clearance Level" name="role" value={formData.role} onChange={handleChange}>
                <option value="EMPLOYEE">Standard Employee</option>
                <option value="PROJECT_MANAGER">Project Lead</option>
                <option value="ADMIN">Company Admin</option>
              </SelectField>
              <Input label="Sector/Dept" name="department" value={formData.department} onChange={handleChange} />
            </div>
            <Input label="Designation" name="job_title" value={formData.job_title} onChange={handleChange} />
            
            <button disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest mt-4 shadow-2xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95">
              {loading ? "Transmitting..." : "Initialize Onboarding"}
            </button>
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <Modal title={`Clearance Protocol: ${selectedEmployee?.name}`} onClose={() => setIsEditModalOpen(false)}>
          <form onSubmit={handleUpdate} className="space-y-5 mt-6">
            {success && <div className="p-4 bg-emerald-50 text-emerald-600 text-xs font-black rounded-2xl border border-emerald-100 animate-in slide-in-from-top-2">Profile Synchronized</div>}
            
            <div className="grid grid-cols-2 gap-5">
              <Input label="Full Identity" name="full_name" value={formData.full_name} onChange={handleChange} required />
              <SelectField label="Clearance Level" name="role" value={formData.role} onChange={handleChange}>
                <option value="EMPLOYEE">Standard Employee</option>
                <option value="PROJECT_MANAGER">Project Lead</option>
                <option value="ADMIN">Company Admin</option>
              </SelectField>
            </div>
            
            <div className="grid grid-cols-2 gap-5">
              <Input label="Sector/Dept" name="department" value={formData.department} onChange={handleChange} />
              <Input label="Designation" name="job_title" value={formData.job_title} onChange={handleChange} />
            </div>

            <div className="p-6 bg-slate-50 rounded-[24px] flex items-center justify-between mt-6 border border-slate-100">
              <div>
                <div className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Active Status</div>
                <div className="text-[10px] text-slate-400 uppercase font-black tracking-tighter mt-1">Global account authorization</div>
              </div>
              <input 
                type="checkbox" 
                name="is_active" 
                checked={formData.is_active} 
                onChange={handleChange}
                className="h-6 w-6 rounded-lg border-slate-200 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer" 
              />
            </div>
            
            <button disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest mt-6 hover:bg-black transition-all shadow-2xl shadow-slate-100 active:scale-95">
              {loading ? "Synchronizing..." : "Apply clearance"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-6 z-50">
    <div className="bg-white rounded-[40px] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-xl p-10 animate-in fade-in zoom-in duration-300">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-black text-slate-900 tracking-tighter italic">{title}</h2>
        <button onClick={onClose} className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all font-black">✕</button>
      </div>
      {children}
    </div>
  </div>
);

const Input = ({ label, ...props }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
    <input {...props} className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-3.5 text-sm font-bold text-slate-800 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50/50 transition-all outline-none" />
  </div>
);

const SelectField = ({ label, children, ...props }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
    <select {...props} className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-3.5 text-sm font-bold text-slate-800 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50/50 transition-all outline-none appearance-none">
      {children}
    </select>
  </div>
);

export default TeamManagement;
