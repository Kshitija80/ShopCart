import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import api from "../services/api";

const emptySupplier = {
  name: "",
  contact: "",
  email: "",
};

const emptyOrder = {
  supplier_id: "",
  product_id: "",
  quantity: "",
  order_date: "",
  status: "PENDING",
};

const Suppliers = () => {
  const { user } = useAuth();

  if (!user || user.role !== "OWNER") {
    return <Navigate to="/inventory" replace />;
  }
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [supplierForm, setSupplierForm] = useState(emptySupplier);

  const [orderForm, setOrderForm] = useState(emptyOrder);

  const [editingSupplierId, setEditingSupplierId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [savingSupplier, setSavingSupplier] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [supplierResponse, productResponse, orderResponse] =
        await Promise.all([
          api.get("/suppliers"),
          api.get("/products"),
          api.get("/purchase-orders"),
        ]);

      setSuppliers(supplierResponse.data.suppliers || []);

      setProducts(productResponse.data.products || []);

      setOrders(orderResponse.data.purchase_orders || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load supplier information.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSupplierChange = (event) => {
    setSupplierForm({
      ...supplierForm,
      [event.target.name]: event.target.value,
    });
  };

  const handleOrderChange = (event) => {
    setOrderForm({
      ...orderForm,
      [event.target.name]: event.target.value,
    });
  };

  const saveSupplier = async (event) => {
    event.preventDefault();

    try {
      setSavingSupplier(true);
      setError("");
      setSuccess("");

      if (editingSupplierId) {
        await api.put(`/suppliers/${editingSupplierId}`, supplierForm);

        setSuccess("Supplier updated successfully.");
      } else {
        await api.post("/suppliers", supplierForm);

        setSuccess("Supplier added successfully.");
      }

      setSupplierForm(emptySupplier);
      setEditingSupplierId(null);

      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save supplier.");
    } finally {
      setSavingSupplier(false);
    }
  };

  const editSupplier = (supplier) => {
    setEditingSupplierId(supplier.id);

    setSupplierForm({
      name: supplier.name || "",
      contact: supplier.contact || "",
      email: supplier.email || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteSupplier = async (id) => {
    const confirmed = window.confirm("Delete this supplier?");

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(`/suppliers/${id}`);

      setSuccess("Supplier deleted successfully.");

      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete supplier.");
    }
  };

  const saveOrder = async (event) => {
    event.preventDefault();

    try {
      setSavingOrder(true);
      setError("");
      setSuccess("");

      await api.post("/purchase-orders", {
        supplier_id: Number(orderForm.supplier_id),
        product_id: Number(orderForm.product_id),
        quantity: Number(orderForm.quantity),
        order_date: orderForm.order_date,
        status: orderForm.status,
      });

      setSuccess("Purchase order created successfully.");

      setOrderForm({
        ...emptyOrder,
        order_date: new Date().toISOString().split("T")[0],
      });

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to create purchase order.",
      );
    } finally {
      setSavingOrder(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      setError("");
      setSuccess("");

      await api.put(`/purchase-orders/${orderId}`, {
        status,
      });

      setSuccess("Purchase order updated successfully.");

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update purchase order.",
      );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-lg font-semibold text-slate-500">
          Loading suppliers...
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Suppliers</h2>

        <p className="mt-1 text-slate-500">
          Manage suppliers and restocking orders.
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">
          {success}
        </div>
      )}

      {/* Supplier Form */}
      <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {editingSupplierId ? "Edit Supplier" : "Add Supplier"}
            </h3>

            <p className="text-sm text-slate-500">
              Maintain supplier contact details.
            </p>
          </div>

          {editingSupplierId && (
            <button
              onClick={() => {
                setEditingSupplierId(null);
                setSupplierForm(emptySupplier);
              }}
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700"
            >
              Cancel
            </button>
          )}
        </div>

        <form onSubmit={saveSupplier} className="grid gap-4 md:grid-cols-4">
          <input
            name="name"
            value={supplierForm.name}
            onChange={handleSupplierChange}
            placeholder="Supplier Name"
            required
            className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
          />

          <input
            name="contact"
            value={supplierForm.contact}
            onChange={handleSupplierChange}
            placeholder="Contact"
            className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
          />

          <input
            type="email"
            name="email"
            value={supplierForm.email}
            onChange={handleSupplierChange}
            placeholder="Email"
            className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
          />

          <button
            type="submit"
            disabled={savingSupplier}
            className="rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 disabled:bg-indigo-300"
          >
            {savingSupplier
              ? "Saving..."
              : editingSupplierId
                ? "Update Supplier"
                : "Add Supplier"}
          </button>
        </form>
      </div>

      {/* Supplier List */}
      <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="mb-5 text-xl font-bold text-slate-900">Supplier List</h3>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead>
              <tr className="border-b border-slate-200 text-sm text-slate-500">
                <th className="px-4 py-3">Name</th>

                <th className="px-4 py-3">Contact</th>

                <th className="px-4 py-3">Email</th>

                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className="border-b border-slate-100">
                  <td className="px-4 py-4 font-semibold text-slate-800">
                    {supplier.name}
                  </td>

                  <td className="px-4 py-4 text-slate-600">
                    {supplier.contact || "-"}
                  </td>

                  <td className="px-4 py-4 text-slate-600">
                    {supplier.email || "-"}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => editSupplier(supplier)}
                        className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteSupplier(supplier.id)}
                        className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {suppliers.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    No suppliers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Purchase Order Form */}
      <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-xl font-bold text-slate-900">
          Create Purchase Order
        </h3>

        <p className="mb-5 text-sm text-slate-500">
          Create a restocking order for a product.
        </p>

        <form
          onSubmit={saveOrder}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-5"
        >
          <select
            name="supplier_id"
            value={orderForm.supplier_id}
            onChange={handleOrderChange}
            required
            className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
          >
            <option value="">Select Supplier</option>

            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>

          <select
            name="product_id"
            value={orderForm.product_id}
            onChange={handleOrderChange}
            required
            className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
          >
            <option value="">Select Product</option>

            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="1"
            name="quantity"
            value={orderForm.quantity}
            onChange={handleOrderChange}
            placeholder="Quantity"
            required
            className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
          />

          <input
            type="date"
            name="order_date"
            value={orderForm.order_date}
            onChange={handleOrderChange}
            required
            className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
          />

          <button
            type="submit"
            disabled={savingOrder}
            className="rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 disabled:bg-indigo-300"
          >
            {savingOrder ? "Creating..." : "Create Order"}
          </button>
        </form>
      </div>

      {/* Purchase Orders */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="mb-5 text-xl font-bold text-slate-900">
          Purchase Orders
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left">
            <thead>
              <tr className="border-b border-slate-200 text-sm text-slate-500">
                <th className="px-4 py-3">Supplier</th>

                <th className="px-4 py-3">Product</th>

                <th className="px-4 py-3">Quantity</th>

                <th className="px-4 py-3">Date</th>

                <th className="px-4 py-3">Status</th>

                <th className="px-4 py-3">Update</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-slate-100">
                  <td className="px-4 py-4 font-semibold">
                    {order.supplier?.name}
                  </td>

                  <td className="px-4 py-4">{order.product?.name}</td>

                  <td className="px-4 py-4">{order.quantity}</td>

                  <td className="px-4 py-4">{order.order_date}</td>

                  <td className="px-4 py-4">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
                      {order.status}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    {order.status !== "RECEIVED" &&
                      order.status !== "CANCELLED" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              updateOrderStatus(order.id, "ORDERED")
                            }
                            className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700"
                          >
                            Ordered
                          </button>

                          <button
                            onClick={() =>
                              updateOrderStatus(order.id, "RECEIVED")
                            }
                            className="rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-700"
                          >
                            Received
                          </button>

                          <button
                            onClick={() =>
                              updateOrderStatus(order.id, "CANCELLED")
                            }
                            className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                  </td>
                </tr>
              ))}

              {orders.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    No purchase orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Suppliers;
