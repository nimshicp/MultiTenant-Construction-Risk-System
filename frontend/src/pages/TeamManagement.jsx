import React, { useState, useEffect } from "react";
import api from "../api/axios";

const TeamManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [managers, setManagers] = useState([]);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const fetchManagers = async () => {
    try {
      const res = await api.get(`/api/accounts/create/`);
      
      // Ensure we always set an array
      if (Array.isArray(res.data)) {
        setManagers(res.data);
      } else {
        console.error("API returned non-array:", res.data);
        setManagers([]);
      }
    } catch (err) {
      console.error("Failed to fetch project managers", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.post(
        `/api/accounts/create/`,
        { ...formData, username: formData.email, role: "PROJECT_MANAGER" }
      );

      setSuccess("Project Manager created successfully. An email has been sent.");
      setFormData({ name: "", email: "", password: "" });
      fetchManagers(); // Refresh list
      setTimeout(() => setIsModalOpen(false), 2000);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to create Project Manager.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
        <button
          onClick={() => { setIsModalOpen(true); setSuccess(""); setError(""); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition"
        >
          + Add Project Manager
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Project Managers</h2>
        
        {fetching ? (
          <div className="text-center py-10 text-gray-500">Loading...</div>
        ) : managers.length === 0 ? (
          <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            No project managers found. Click above to add one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-sm text-gray-600">
                  <th className="py-3 px-4 font-medium">Name</th>
                  <th className="py-3 px-4 font-medium">Email</th>
                  <th className="py-3 px-4 font-medium">Role</th>
                </tr>
              </thead>
              <tbody>
                {managers.map((pm) => (
                  <tr key={pm.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900 font-medium">{pm.name || "N/A"}</td>
                    <td className="py-3 px-4 text-gray-600">{pm.email}</td>
                    <td className="py-3 px-4">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                        {pm.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-4">Create Project Manager</h2>
            
            {success && <p className="text-green-600 bg-green-50 p-3 rounded mb-4 text-sm">{success}</p>}
            {error && <p className="text-red-600 bg-red-50 p-3 rounded mb-4 text-sm">{error}</p>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full border rounded p-2"
                />
              </div>
              
              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
