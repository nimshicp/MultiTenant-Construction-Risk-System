import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getPlatformDashboard } from "../api/platform";

const PlatformDashboard = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    total_tenants: 0,
    active: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch dashboard data using API helper
        const data = await getPlatformDashboard();

        // Backend response format:
        // {
        //   platform_admin: {...},
        //   stats: {
        //     total_tenants: 1,
        //     active: 1
        //   }
        // }
        setStats(data.stats);
      } catch (error) {
        console.error("Error fetching platform stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">
        Platform Dashboard
      </h1>

      <p className="text-gray-600">
        Welcome back, {user?.name || user?.email}
      </p>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Tenants */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-1 text-sm font-medium text-gray-500">
            Total Tenants
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {loading ? "..." : stats.total_tenants}
          </div>
        </div>

        {/* Active Tenants */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-1 text-sm font-medium text-gray-500">
            Active Tenants
          </div>
          <div className="text-3xl font-bold text-green-600">
            {loading ? "..." : stats.active}
          </div>
        </div>
      </div>

      {/* Placeholder for future tenant list */}
      <div className="mt-8 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          Recent Companies
        </h2>

        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 py-10 text-center text-gray-500">
          Tenant list table will be implemented here
        </div>
      </div>
    </div>
  );
};

export default PlatformDashboard;