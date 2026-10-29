import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import api from "../services/api";

const Sales = () => {
      const { user } = useAuth();

      if (!user || user.role !== "OWNER") {
        return <Navigate to="/inventory" replace />;
      }
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const loadSales = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (startDate) {
        params.startDate = startDate;
      }

      if (endDate) {
        params.endDate = endDate;
      }

      const response = await api.get("/sales", {
        params,
      });

      setSales(response.data.sales || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load sales.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  const handleFilter = (event) => {
    event.preventDefault();
    loadSales();
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");

    setTimeout(() => {
      loadSales();
    }, 0);
  };

  const totalRevenue = sales.reduce(
    (sum, sale) => sum + Number(sale.total_amount || 0),
    0,
  );

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Sales History</h2>

        <p className="mt-1 text-slate-500">View and filter completed sales.</p>
      </div>

      <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
        <form
          onSubmit={handleFilter}
          className="flex flex-col gap-4 md:flex-row md:items-end"
        >
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              From
            </label>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              To
            </label>

            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700"
          >
            Filter
          </button>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-lg bg-slate-100 px-5 py-2.5 font-semibold text-slate-700 hover:bg-slate-200"
          >
            Clear
          </button>
        </form>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Number of Sales</p>

          <p className="mt-2 text-3xl font-bold text-indigo-600">
            {sales.length}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total Revenue</p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            ₹{totalRevenue.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h3 className="text-xl font-bold text-slate-900">Transactions</h3>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500">
            Loading sales...
          </div>
        ) : sales.length === 0 ? (
          <div className="rounded-xl bg-slate-50 p-10 text-center text-slate-500">
            No sales found for the selected period.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead>
                <tr className="border-b border-slate-200 text-sm text-slate-500">
                  <th className="px-4 py-3">Invoice</th>

                  <th className="px-4 py-3">Date</th>

                  <th className="px-4 py-3">Items</th>

                  <th className="px-4 py-3">GST</th>

                  <th className="px-4 py-3">Total</th>

                  <th className="px-4 py-3">Created By</th>
                </tr>
              </thead>

              <tbody>
                {sales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-4 py-4 font-semibold text-indigo-600">
                      {sale.invoice_no}
                    </td>

                    <td className="px-4 py-4 text-slate-600">
                      {new Date(sale.created_at).toLocaleString()}
                    </td>

                    <td className="px-4 py-4">{sale.items?.length || 0}</td>

                    <td className="px-4 py-4">
                      ₹{Number(sale.gst_amount).toFixed(2)}
                    </td>

                    <td className="px-4 py-4 font-bold text-slate-900">
                      ₹{Number(sale.total_amount).toFixed(2)}
                    </td>

                    <td className="px-4 py-4 text-slate-600">
                      {sale.creator?.name || "User"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sales;
