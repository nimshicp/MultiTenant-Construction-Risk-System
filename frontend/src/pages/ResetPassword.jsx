import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { confirmPasswordReset } from "../api/auth";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  const [status, setStatus] = useState({ loading: false, success: false, error: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setStatus({ ...status, error: "Passwords do not match." });
      return;
    }

    setStatus({ loading: true, success: false, error: "" });
    try {
      await confirmPasswordReset(token, formData.password, formData.confirmPassword);
      setStatus({ loading: false, success: true, error: "" });
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setStatus({ 
        loading: false, 
        success: false, 
        error: err.response?.data?.detail || "Invalid or expired token." 
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-blue-600 rounded-[20px] flex items-center justify-center shadow-xl shadow-blue-200">
             <span className="text-white text-3xl font-black italic">B</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-4xl font-black tracking-tighter text-slate-900 italic">
          NEW CREDENTIALS
        </h2>
        <p className="mt-2 text-center text-sm font-bold text-slate-400 uppercase tracking-widest">
          BuildFlow Security Protocol
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-10 px-8 shadow-2xl rounded-[40px] border border-slate-100">
          {status.success ? (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-50 text-emerald-500 mb-4">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Access Restored</h3>
              <p className="text-sm font-medium text-slate-500">Your password has been successfully updated. Redirecting to login terminal...</p>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="block w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold text-sm focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all outline-none"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="block w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold text-sm focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {status.error && (
                <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                  <p className="text-xs font-bold text-red-600 uppercase tracking-tight">{status.error}</p>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={status.loading}
                  className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-xl shadow-blue-100 text-xs font-black uppercase tracking-[0.2em] text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status.loading ? "Synchronizing..." : "Update Credentials"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
