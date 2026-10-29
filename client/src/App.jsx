import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Billing from "./pages/Billing";
import Sales from "./pages/Sales";
import Suppliers from "./pages/Suppliers";
import Reports from "./pages/Reports";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public pages */}
          <Route path="/login" element={<Login />} />

          <Route path="/signup" element={<Signup />} />

          {/* Protected pages */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              <Route path="/dashboard" element={<Dashboard />} />

              <Route path="/inventory" element={<Inventory />} />

              <Route path="/billing" element={<Billing />} />

              <Route path="/sales" element={<Sales />} />

              <Route path="/suppliers" element={<Suppliers />} />

              <Route path="/reports" element={<Reports />} />
            </Route>
          </Route>

          {/* Unknown URL */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
