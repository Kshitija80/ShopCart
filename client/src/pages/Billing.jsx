import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

const GST_RATE = 18;

const Billing = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [creatingSale, setCreatingSale] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [lastSale, setLastSale] = useState(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/products");

      setProducts(response.data.products || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) =>
        product.name.toLowerCase().includes(search.toLowerCase()),
      )
      .slice(0, 30);
  }, [products, search]);

  const addToCart = (product) => {
    setError("");
    setSuccess("");

    const availableStock = Number(product.quantity);

    if (availableStock <= 0) {
      setError(`${product.name} is out of stock.`);
      return;
    }

    const existingItem = cart.find((item) => item.product_id === product.id);

    if (existingItem) {
      if (existingItem.quantity >= availableStock) {
        setError(
          `Only ${availableStock} units of ${product.name} are available.`,
        );
        return;
      }

      setCart((currentCart) =>
        currentCart.map((item) =>
          item.product_id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        ),
      );

      return;
    }

    setCart((currentCart) => [
      ...currentCart,
      {
        product_id: product.id,
        name: product.name,
        category: product.category,
        price: Number(product.selling_price),
        maxStock: availableStock,
        quantity: 1,
      },
    ]);
  };

  const increaseQuantity = (productId) => {
    setCart((currentCart) =>
      currentCart.map((item) => {
        if (item.product_id !== productId) {
          return item;
        }

        if (item.quantity >= item.maxStock) {
          setError(`Maximum available stock is ${item.maxStock}.`);

          return item;
        }

        setError("");

        return {
          ...item,
          quantity: item.quantity + 1,
        };
      }),
    );
  };

  const decreaseQuantity = (productId) => {
    setCart((currentCart) =>
      currentCart
        .map((item) => {
          if (item.product_id !== productId) {
            return item;
          }

          return {
            ...item,
            quantity: item.quantity - 1,
          };
        })
        .filter((item) => item.quantity > 0),
    );

    setError("");
  };

  const removeFromCart = (productId) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.product_id !== productId),
    );

    setError("");
  };

  const clearCart = () => {
    setCart([]);
    setError("");
    setSuccess("");
  };

  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  const gstAmount = useMemo(() => {
    return (subtotal * GST_RATE) / 100;
  }, [subtotal]);

  const grandTotal = subtotal + gstAmount;

  const createBill = async () => {
    if (cart.length === 0) {
      setError("Please add at least one product.");
      return;
    }

    try {
      setCreatingSale(true);
      setError("");
      setSuccess("");

      const saleData = {
        items: cart.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      };

      const response = await api.post("/sales", saleData);

      setLastSale({
        ...response.data,
        items: cart.map((item) => ({
          product_id: item.product_id,
          name: item.name,
          quantity: item.quantity,
          price_at_sale: item.price,
        })),
      });

      setSuccess(`Bill ${response.data.invoice_no} created successfully.`);

      setCart([]);
      setSearch("");

      await loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create bill.");
    } finally {
      setCreatingSale(false);
    }
  };

  const printReceipt = () => {
    window.print();
  };

  return (
    <div>
      {/* Page heading */}
      <div className="mb-8 print:hidden">
        <h2 className="text-3xl font-bold text-slate-900">Billing / POS</h2>

        <p className="mt-1 text-slate-500">
          Create customer bills quickly and update stock automatically.
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 print:hidden">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 print:hidden">
          {success}
        </div>
      )}

      {/* Product picker + cart */}
      <div className="grid gap-6 lg:grid-cols-3 print:hidden">
        {/* Products */}
        <div className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900">
              Select Products
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Search and click a product to add it to the cart.
            </p>
          </div>

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search product..."
            className="mb-6 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />

          {loading ? (
            <div className="py-10 text-center text-slate-500">
              Loading products...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-xl bg-slate-50 p-10 text-center text-slate-500">
              No products found.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => addToCart(product)}
                  disabled={Number(product.quantity) <= 0}
                  className="rounded-xl border border-slate-200 p-4 text-left transition hover:border-indigo-400 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-800">
                        {product.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {product.category || "General"}
                      </p>
                    </div>

                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                      {product.quantity} left
                    </span>
                  </div>

                  <p className="mt-4 text-xl font-bold text-indigo-600">
                    ₹{Number(product.selling_price).toFixed(2)}
                  </p>

                  <p className="mt-2 text-xs text-indigo-500">Click to add</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cart */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Cart</h3>

              <p className="text-sm text-slate-500">
                {cart.length} product type(s)
              </p>
            </div>

            {cart.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-sm font-semibold text-red-500 hover:text-red-700"
              >
                Clear
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="rounded-xl bg-slate-50 p-8 text-center text-slate-500">
              <div className="text-4xl">🛒</div>

              <p className="mt-3 font-medium">Your cart is empty</p>

              <p className="mt-1 text-sm">Select products from the left.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.product_id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-800">
                          {item.name}
                        </p>

                        <p className="text-sm text-slate-500">
                          ₹{item.price.toFixed(2)} each
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product_id)}
                        className="text-xs font-semibold text-red-500"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => decreaseQuantity(item.product_id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 font-bold hover:bg-slate-200"
                        >
                          −
                        </button>

                        <span className="w-8 text-center font-semibold">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => increaseQuantity(item.product_id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 font-bold hover:bg-slate-200"
                        >
                          +
                        </button>
                      </div>

                      <p className="font-bold text-slate-900">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-slate-200 pt-5">
                <div className="flex justify-between py-2 text-sm text-slate-500">
                  <span>Subtotal</span>

                  <span>₹{subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between py-2 text-sm text-slate-500">
                  <span>GST ({GST_RATE}%)</span>

                  <span>₹{gstAmount.toFixed(2)}</span>
                </div>

                <div className="mt-2 flex justify-between border-t border-slate-200 pt-4">
                  <span className="text-lg font-bold text-slate-900">
                    Total
                  </span>

                  <span className="text-2xl font-bold text-indigo-600">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={createBill}
                  disabled={creatingSale}
                  className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                >
                  {creatingSale ? "Creating Bill..." : "Create Bill"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Receipt */}
      {lastSale && (
        <div className="mt-8">
          <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm print:mt-0 print:max-w-none print:rounded-none print:p-4 print:shadow-none">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-900">ShopEase</h2>

              <p className="text-sm text-slate-500">
                Inventory & Sales Management
              </p>

              <div className="my-5 border-b border-dashed border-slate-300" />

              <h3 className="text-xl font-bold">TAX INVOICE</h3>

              <p className="mt-2 text-sm text-slate-500">
                Invoice No: {lastSale.invoice_no}
              </p>

              <p className="text-sm text-slate-500">
                Date: {new Date().toLocaleString()}
              </p>
            </div>

            <div className="my-7">
              <div className="mb-3 grid grid-cols-4 border-b border-slate-300 pb-2 text-sm font-bold">
                <span className="col-span-2">Product</span>

                <span className="text-center">Qty</span>

                <span className="text-right">Amount</span>
              </div>

              {lastSale.items?.map((item) => (
                <div
                  key={item.product_id}
                  className="grid grid-cols-4 border-b border-slate-100 py-3 text-sm"
                >
                  <span className="col-span-2">{item.name}</span>

                  <span className="text-center">{item.quantity}</span>

                  <span className="text-right">
                    ₹
                    {(
                      Number(item.price_at_sale) * Number(item.quantity)
                    ).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="ml-auto max-w-sm space-y-2 border-t border-slate-200 pt-5">
              <div className="flex justify-between">
                <span>Subtotal</span>

                <span>₹{Number(lastSale.subtotal).toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>GST ({lastSale.gst_rate}%)</span>

                <span>₹{Number(lastSale.gst_amount).toFixed(2)}</span>
              </div>

              <div className="flex justify-between border-t border-slate-200 pt-3 text-xl font-bold">
                <span>Total</span>

                <span>₹{Number(lastSale.total_amount).toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-slate-500">
                Thank you for shopping with ShopEase!
              </p>

              <button
                type="button"
                onClick={printReceipt}
                className="mt-5 rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-800 print:hidden"
              >
                🖨️ Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
