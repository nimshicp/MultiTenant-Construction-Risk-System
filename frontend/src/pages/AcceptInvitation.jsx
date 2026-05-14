import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const AcceptInvitation = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    password: "",
    confirm_password: "",
  });

  // Fetch invitation details
  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        // We use the current hostname to ensure we hit the correct tenant schema
        const res = await axios.get(`http://${window.location.hostname}:8000/employee/accept-invitation/${token}/`);
        setInvitation(res.data);
      } catch (err) {
        setError(err?.response?.data?.detail || "Invalid or expired invitation link.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await axios.post(`http://${window.location.hostname}:8000/employee/accept-invitation/${token}/complete/`, formData);
      setSuccess("Account set up successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      const errorData = err?.response?.data;
      if (errorData) {
        // Handle DRF validation errors which are often objects { field: [messages] }
        if (typeof errorData === "object") {
          const messages = Object.values(errorData).flat().join(" ");
          setError(messages || "Failed to complete account setup.");
        } else {
          setError(errorData.detail || "Failed to complete account setup.");
        }
      } else {
        setError("Failed to connect to the server.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to the Team
          </h2>
          {invitation && (
            <p className="mt-2 text-center text-sm text-gray-600">
              Hello <span className="font-semibold text-blue-600">{invitation.full_name}</span>, please set your password to join <span className="font-semibold">{invitation.email}</span>'s account.
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {!success && !error && invitation && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="New Password"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={8}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input
                  name="confirm_password"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm Password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  minLength={8}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:opacity-50"
              >
                {submitting ? "Setting up account..." : "Complete Setup"}
              </button>
            </div>
          </form>
        )}
        
        {error && !invitation && (
          <div className="text-center mt-6">
            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Go back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcceptInvitation;
