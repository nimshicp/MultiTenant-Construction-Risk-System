import React, { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../api/auth";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ loading: false, success: false, error: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: "" });
    try {
      await requestPasswordReset(email);
      setStatus({ loading: false, success: true, error: "" });
    } catch (err) {
      setStatus({ 
        loading: false, 
        success: false, 
        error: err.response?.data?.detail || "Failed to send reset link." 
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Background glow effects matching landing page */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-15%] right-[-5%] w-[45%] h-[45%] bg-blue-500/5 rounded-full blur-[140px]"></div>
        <div className="absolute top-[30%] right-[20%] w-80 h-80 bg-blue-500/10 rounded-full blur-[100px]"></div>
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <Link to="/" className="inline-flex items-center text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors gap-2 group">
            <svg className="w-3 h-3 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Terminal Home
          </Link>
        </div>
        <div className="flex justify-center">
          <Link to="/" className="h-16 w-16 bg-blue-600 rounded-[20px] flex items-center justify-center shadow-xl shadow-blue-200 hover:scale-105 transition-transform">
             <span className="text-white text-3xl font-black italic">B</span>
          </Link>
        </div>
        <h2 className="mt-6 text-center text-4xl font-black tracking-tighter text-white italic">
          RECOVER ACCESS
        </h2>
        <p className="mt-2 text-center text-sm font-bold text-slate-400 uppercase tracking-widest">
          BuildFlow Security Terminal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10">
        <div className="bg-white/5 backdrop-blur-xl py-10 px-8 shadow-2xl rounded-[40px] border border-white/10">
          {status.success ? (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-50 text-emerald-500 mb-4">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">Transmission Successful</h3>
              <p className="text-sm font-medium text-slate-400 leading-relaxed">
                If an account exists for <span className="text-blue-400 font-bold">{email}</span>, a secure reset link has been dispatched to your inbox.
              </p>
              <Link
                to="/login"
                className="mt-6 block w-full bg-white/10 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/20 transition-all shadow-xl border border-white/10"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 mb-2">
                  Registered Email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-sm focus:bg-white/10 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none placeholder-slate-500"
                    placeholder="name@company.com"
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
                  {status.loading ? "Processing..." : "Generate Reset Link"}
                </button>
              </div>

              <div className="text-center mt-6">
                <Link to="/login" className="text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors">
                  Remember your credentials? <span className="text-blue-600">Back to Login</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
