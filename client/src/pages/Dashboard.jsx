import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Dashboard = () => {
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  if (!user || user.role !== "OWNER") {
    return <Navigate to="/inventory" replace />;
  }

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/reports/dashboard");

        setDashboard(response.data.dashboard);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-lg font-semibold text-slate-500">
          Loading dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Dashboard</h2>

        <p className="mt-1 text-slate-500">
          Overview of your shop's current performance.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Today's Sales</p>

          <p className="mt-3 text-3xl font-bold text-indigo-600">
            {dashboard?.today_sales_count ?? 0}
          </p>

          <p className="mt-1 text-sm text-slate-400">Transactions today</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Today's Revenue</p>

          <p className="mt-3 text-3xl font-bold text-green-600">
            ₹{Number(dashboard?.today_revenue || 0).toFixed(2)}
          </p>

          <p className="mt-1 text-sm text-slate-400">Including GST</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Low Stock</p>

          <p className="mt-3 text-3xl font-bold text-orange-500">
            {dashboard?.low_stock_count ?? 0}
          </p>

          <p className="mt-1 text-sm text-slate-400">Products need attention</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Monthly Revenue</p>

          <p className="mt-3 text-3xl font-bold text-purple-600">
            ₹{Number(dashboard?.monthly_revenue || 0).toFixed(2)}
          </p>

          <p className="mt-1 text-sm text-slate-400">Current month</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Low Stock Alerts
              </h3>

              <p className="text-sm text-slate-500">
                Products at or below threshold
              </p>
            </div>

            <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">
              {dashboard?.low_stock_count || 0}
            </span>
          </div>

          {dashboard?.low_stock_products?.length ? (
            <div className="space-y-3">
              {dashboard.low_stock_products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
                >
                  <div>
                    <p className="font-semibold text-slate-800">
                      {product.name}
                    </p>

                    <p className="text-sm text-slate-500">
                      {product.category || "Uncategorized"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-red-600">{product.quantity}</p>

                    <p className="text-xs text-slate-400">
                      Threshold: {product.low_stock_threshold}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-green-50 p-5 text-center text-green-700">
              All products have healthy stock levels.
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">Top Products</h3>

          <p className="mb-5 text-sm text-slate-500">
            Best-selling products by quantity
          </p>

          {dashboard?.top_products?.length ? (
            <div className="space-y-4">
              {dashboard.top_products.map((item, index) => (
                <div
                  key={item.product_id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                      {index + 1}
                    </div>

                    <div>
                      <p className="font-semibold text-slate-800">
                        {item.product?.name}
                      </p>

                      <p className="text-xs text-slate-500">
                        {item.product?.category}
                      </p>
                    </div>
                  </div>

                  <p className="font-bold text-slate-800">
                    {item.total_quantity} sold
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">No sales data available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
