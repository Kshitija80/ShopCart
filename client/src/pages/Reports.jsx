import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useMemo, useState } from "react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar, Line } from "react-chartjs-2";

import api from "../services/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
);

const Reports = () => {
  const { user } = useAuth();

  if (!user || user.role !== "OWNER") {
    return <Navigate to="/inventory" replace />;
  }
  const [dashboard, setDashboard] = useState(null);

  const [profitLoss, setProfitLoss] = useState(null);

  const [sales, setSales] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        setError("");

        const [dashboardResponse, profitResponse, salesResponse] =
          await Promise.all([
            api.get("/reports/dashboard"),
            api.get("/reports/profit-loss"),
            api.get("/sales"),
          ]);

        setDashboard(dashboardResponse.data.dashboard);

        setProfitLoss(profitResponse.data.report);

        setSales(salesResponse.data.sales || []);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load reports.");
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const topProductChart = useMemo(() => {
    const products = dashboard?.top_products || [];

    return {
      labels: products.map(
        (item) => item.product?.name || `Product ${item.product_id}`,
      ),

      datasets: [
        {
          label: "Units Sold",
          data: products.map((item) => Number(item.total_quantity)),
        },
      ],
    };
  }, [dashboard]);

  const salesTrendData = useMemo(() => {
    const grouped = {};

    sales.forEach((sale) => {
      const date = new Date(sale.created_at).toISOString().split("T")[0];

      grouped[date] = (grouped[date] || 0) + Number(sale.total_amount || 0);
    });

    const dates = Object.keys(grouped).sort();

    return {
      labels: dates,
      datasets: [
        {
          label: "Revenue",
          data: dates.map((date) => grouped[date]),
          tension: 0.3,
        },
      ],
    };
  }, [sales]);

  const profitChartData = useMemo(() => {
    return {
      labels: ["Revenue", "Cost", "Gross Profit", "GST"],

      datasets: [
        {
          label: "Amount (₹)",
          data: [
            Number(profitLoss?.sales_revenue || 0),
            Number(profitLoss?.total_cost || 0),
            Number(profitLoss?.gross_profit || 0),
            Number(profitLoss?.gst_collected || 0),
          ],
        },
      ],
    };
  }, [profitLoss]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-lg font-semibold text-slate-500">
          Loading reports...
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
        <h2 className="text-3xl font-bold text-slate-900">
          Reports & Analytics
        </h2>

        <p className="mt-1 text-slate-500">
          Analyze revenue, profit and product performance.
        </p>
      </div>

      <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Sales Revenue</p>

          <p className="mt-2 text-3xl font-bold text-indigo-600">
            ₹{Number(profitLoss?.sales_revenue || 0).toFixed(2)}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total Cost</p>

          <p className="mt-2 text-3xl font-bold text-red-500">
            ₹{Number(profitLoss?.total_cost || 0).toFixed(2)}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Gross Profit</p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            ₹{Number(profitLoss?.gross_profit || 0).toFixed(2)}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">GST Collected</p>

          <p className="mt-2 text-3xl font-bold text-orange-500">
            ₹{Number(profitLoss?.gst_collected || 0).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="mb-1 text-xl font-bold text-slate-900">Sales Trend</h3>

          <p className="mb-6 text-sm text-slate-500">
            Revenue by transaction date.
          </p>

          <Line
            data={salesTrendData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: true,
                },
              },
            }}
          />
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="mb-1 text-xl font-bold text-slate-900">
            Top 5 Products
          </h3>

          <p className="mb-6 text-sm text-slate-500">
            Products with the highest sales quantity.
          </p>

          <Bar
            data={topProductChart}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: true,
                },
              },
            }}
          />
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm xl:col-span-2">
          <h3 className="mb-1 text-xl font-bold text-slate-900">
            Profit & Loss
          </h3>

          <p className="mb-6 text-sm text-slate-500">
            Revenue, cost, gross profit and GST.
          </p>

          <Bar
            data={profitChartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: true,
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Reports;
