import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
      isActive
        ? "bg-indigo-600 text-white"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white md:flex">
          <div className="border-b border-slate-200 px-6 py-5">
            <h1 className="text-2xl font-bold text-indigo-600">ShopEase</h1>

            <p className="mt-1 text-xs text-slate-500">
              Inventory & Sales Management
            </p>
          </div>

          <nav className="flex-1 space-y-2 p-4">
            {user?.role === "OWNER" && (
              <NavLink to="/dashboard" className={linkClass}>
                <span>📊</span>
                Dashboard
              </NavLink>
            )}

            <NavLink to="/inventory" className={linkClass}>
              <span>📦</span>
              Inventory
            </NavLink>

            <NavLink to="/billing" className={linkClass}>
              <span>🧾</span>
              Billing / POS
            </NavLink>

            {user?.role === "OWNER" && (
              <>
                <div className="pt-5 pb-2 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Management
                </div>

                <NavLink to="/sales" className={linkClass}>
                  <span>💰</span>
                  Sales
                </NavLink>

                <NavLink to="/suppliers" className={linkClass}>
                  <span>🚚</span>
                  Suppliers
                </NavLink>

                <NavLink to="/reports" className={linkClass}>
                  <span>📈</span>
                  Reports
                </NavLink>
              </>
            )}
          </nav>

          <div className="border-t border-slate-200 p-4">
            <div className="mb-4 rounded-lg bg-slate-50 p-3">
              <p className="font-semibold text-slate-800">{user?.name}</p>

              <p className="text-xs text-slate-500">{user?.email}</p>

              <span className="mt-2 inline-block rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700">
                {user?.role}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="w-full rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-slate-200 bg-white px-4 py-4 md:hidden">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-indigo-600">ShopEase</h1>

              <button
                onClick={handleLogout}
                className="rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white"
              >
                Logout
              </button>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto">
              {user?.role === "OWNER" && (
                <NavLink to="/dashboard" className={linkClass}>
                  📊
                </NavLink>
              )}

              <NavLink to="/inventory" className={linkClass}>
                📦
              </NavLink>

              <NavLink to="/billing" className={linkClass}>
                🧾
              </NavLink>

              {user?.role === "OWNER" && (
                <>
                  <NavLink to="/sales" className={linkClass}>
                    💰
                  </NavLink>

                  <NavLink to="/suppliers" className={linkClass}>
                    🚚
                  </NavLink>

                  <NavLink to="/reports" className={linkClass}>
                    📈
                  </NavLink>
                </>
              )}
            </div>
          </header>

          <main className="flex-1 p-4 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
