import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  name: "",
  category: "",
  cost_price: "",
  selling_price: "",
  quantity: "",
  low_stock_threshold: "5",
  expiry_date: "",
};

const Inventory = () => {
  const { user } = useAuth();

  const isOwner = user?.role === "OWNER";

  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/products");

      setProducts(response.data.products || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const categories = useMemo(() => {
    return [
      "ALL",
      ...new Set(products.map((product) => product.category).filter(Boolean)),
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        category === "ALL" || product.category === category;

      const matchesLowStock =
        !lowStockOnly ||
        Number(product.quantity) <= Number(product.low_stock_threshold);

      return matchesSearch && matchesCategory && matchesLowStock;
    });
  }, [products, search, category, lowStockOnly]);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isOwner) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        name: form.name,
        category: form.category || null,
        cost_price: Number(form.cost_price),
        selling_price: Number(form.selling_price),
        quantity: Number(form.quantity),
        low_stock_threshold: Number(form.low_stock_threshold),
        expiry_date: form.expiry_date || null,
      };

      if (editingId) {
        await api.put(`/products/${editingId}`, payload);

        setSuccess("Product updated successfully.");
      } else {
        await api.post("/products", payload);

        setSuccess("Product added successfully.");
      }

      resetForm();
      await loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save product.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);

    setForm({
      name: product.name || "",
      category: product.category || "",
      cost_price: product.cost_price || "",
      selling_price: product.selling_price || "",
      quantity: product.quantity ?? "",
      low_stock_threshold: product.low_stock_threshold ?? "5",
      expiry_date: product.expiry_date || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    if (!isOwner) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this product?",
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(`/products/${id}`);

      setSuccess("Product deleted successfully.");

      await loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete product.");
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Inventory</h2>

        <p className="mt-1 text-slate-500">
          Manage products and monitor stock levels.
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

      {isOwner && (
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {editingId ? "Edit Product" : "Add Product"}
              </h3>

              <p className="text-sm text-slate-500">
                Enter product and stock details.
              </p>
            </div>

            {editingId && (
              <button
                onClick={resetForm}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          >
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Product Name"
              required
              className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />

            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="Category"
              className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />

            <input
              name="cost_price"
              type="number"
              min="0"
              step="0.01"
              value={form.cost_price}
              onChange={handleChange}
              placeholder="Cost Price"
              required
              className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />

            <input
              name="selling_price"
              type="number"
              min="0"
              step="0.01"
              value={form.selling_price}
              onChange={handleChange}
              placeholder="Selling Price"
              required
              className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />

            <input
              name="quantity"
              type="number"
              min="0"
              value={form.quantity}
              onChange={handleChange}
              placeholder="Quantity"
              required
              className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />

            <input
              name="low_stock_threshold"
              type="number"
              min="0"
              value={form.low_stock_threshold}
              onChange={handleChange}
              placeholder="Low Stock Threshold"
              required
              className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />

            <input
              name="expiry_date"
              type="date"
              value={form.expiry_date}
              onChange={handleChange}
              className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 disabled:bg-indigo-300"
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Product"
                  : "Add Product"}
            </button>
          </form>
        </div>
      )}

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Products</h3>

            <p className="text-sm text-slate-500">
              {filteredProducts.length} products shown
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-indigo-500"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-indigo-500"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item === "ALL" ? "All Categories" : item}
                </option>
              ))}
            </select>

            <label className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm">
              <input
                type="checkbox"
                checked={lowStockOnly}
                onChange={(e) => setLowStockOnly(e.target.checked)}
              />
              Low Stock
            </label>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500">
            Loading products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-xl bg-slate-50 py-12 text-center text-slate-500">
            No products found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-slate-200 text-sm text-slate-500">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Cost</th>
                  <th className="px-4 py-3">Selling</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Expiry</th>
                  {isOwner && <th className="px-4 py-3">Actions</th>}
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => {
                  const lowStock =
                    Number(product.quantity) <=
                    Number(product.low_stock_threshold);

                  return (
                    <tr
                      key={product.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-4 py-4 font-semibold text-slate-800">
                        {product.name}
                      </td>

                      <td className="px-4 py-4 text-slate-500">
                        {product.category || "-"}
                      </td>

                      <td className="px-4 py-4">
                        ₹{Number(product.cost_price).toFixed(2)}
                      </td>

                      <td className="px-4 py-4 font-semibold text-slate-800">
                        ₹{Number(product.selling_price).toFixed(2)}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            lowStock
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {product.quantity}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-slate-500">
                        {product.expiry_date || "-"}
                      </td>

                      {isOwner && (
                        <td className="px-4 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleDelete(product.id)}
                              className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
