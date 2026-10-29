import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();

  const { login, loading } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!form.email || !form.password) {
      setError("Please enter email and password.");
      return;
    }

    const result = await login(form.email, form.password);

    if (!result.success) {
      setError(result.message);
      return;
    }

    if (result.user.role === "OWNER") {
      navigate("/dashboard");
    } else {
      navigate("/inventory");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white text-3xl font-bold">
              S
            </div>

            <h1 className="mt-4 text-3xl font-bold text-slate-900">ShopEase</h1>

            <p className="mt-2 text-slate-500">Inventory & Sales Management</p>
          </div>

          <h2 className="text-xl font-semibold text-slate-800 mb-6">
            Welcome Back
          </h2>

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="owner@shopease.com"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-indigo-600 hover:underline"
            >
              Create Owner Account
            </Link>
          </div>

          <div className="mt-6 rounded-xl bg-slate-50 p-4">
            <p className="font-semibold text-slate-700">Demo Owner Login</p>

            <p className="mt-2 text-sm text-slate-500">
              Email: owner@shopease.com
            </p>

            <p className="text-sm text-slate-500">Password: Owner@123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
