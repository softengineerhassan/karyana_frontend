import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Minus, Plus, Search, ShoppingCart, Tag, Trash2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { inventoryApi, salesApi } from "@/Services/posApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const paymentMethods = ["cash", "bank_transfer", "easypaisa", "jazzcash", "card", "credit"];

const formatPKR = (value) => `PKR ${Number(value || 0).toFixed(2)}`;

export default function SalesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [customerId, setCustomerId] = useState("");
  const [paidAmount, setPaidAmount] = useState(0);
  const [otherCharges, setOtherCharges] = useState(0);
  const [notes, setNotes] = useState("");

  const loadData = async () => {
    const [productRes, customerRes, salesRes] = await Promise.all([
      inventoryApi.products.list(),
      salesApi.customers.list(),
      salesApi.sales.list({ limit: 50 }),
    ]);
    setProducts(productRes?.data?.data || []);
    setCustomers(customerRes?.data?.data || []);
    setSales(salesRes?.data?.data || []);
  };

  useEffect(() => {
    loadData().catch(() => {});
  }, []);

  const searchTerm = searchParams.get("q") || "";

  const updateSearchQuery = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value?.trim()) {
      next.set("q", value);
    } else {
      next.delete("q");
    }
    setSearchParams(next, { replace: true });
  };

  const categories = useMemo(() => {
    const names = products
      .map((item) => item?.category?.name || item?.category_name || item?.category || "Uncategorized")
      .filter(Boolean);
    return ["all", ...Array.from(new Set(names))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    return products.filter((item) => {
      const name = (item.name || "").toLowerCase();
      const sku = (item.sku || "").toLowerCase();
      const barcode = (item.barcode || "").toLowerCase();
      const category = (item?.category?.name || item?.category_name || item?.category || "Uncategorized").toLowerCase();
      const matchesSearch = !normalized || name.includes(normalized) || sku.includes(normalized) || barcode.includes(normalized);
      const matchesCategory = selectedCategory === "all" || category === selectedCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const subtotal = cart.reduce((total, item) => total + item.quantity * item.unit_price, 0);
  const taxAmount = cart.reduce((total, item) => total + item.quantity * item.unit_price * (item.tax_percent / 100), 0);
  const grandTotal = subtotal + taxAmount + Number(otherCharges || 0);
  const changeDue = Math.max(Number(paidAmount || 0) - grandTotal, 0);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === product.id);
      if (existing) {
        return prev.map((item) => (item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      }

      return [
        ...prev,
        {
          product_id: product.id,
          unit_id: product.unit_id || product.sales_unit_id || product.purchase_unit_id || "",
          name: product.name,
          quantity: 1,
          unit_price: Number(product.default_selling_price || 0),
          discount_type: "",
          discount_value: 0,
          tax_percent: Number(product.tax_percent || 0),
          notes: "",
        },
      ];
    });
  };

  const updateCartItem = (productId, field, value) => {
    setCart((prev) => prev.map((item) => (item.product_id === productId ? { ...item, [field]: value } : item)));
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product_id !== productId));
  };

  const submitSale = async () => {
    if (cart.length === 0) {
      toast.error("Add at least one item");
      return;
    }

    try {
      await salesApi.sales.create({
        customer_id: customerId || null,
        sale_date: new Date().toISOString().slice(0, 10),
        invoice_number: `INV-${Date.now().toString().slice(-8)}`,
        payment_method: paymentMethod,
        paid_amount: Number(paidAmount || 0),
        other_charges: Number(otherCharges || 0),
        notes,
        items: cart.map((item) => ({
          product_id: item.product_id,
          unit_id: item.unit_id || null,
          quantity: Number(item.quantity || 0),
          unit_price: Number(item.unit_price || 0),
          discount_type: item.discount_type || null,
          discount_value: Number(item.discount_value || 0),
          tax_percent: Number(item.tax_percent || 0),
          notes: item.notes || null,
        })),
      });
      toast.success("Sale created");
      setCart([]);
      setPaidAmount(0);
      setOtherCharges(0);
      setNotes("");
      setCustomerId("");
      await loadData();
    } catch {}
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h2 className="font-headline text-3xl font-extrabold tracking-tight text-slate-900">POS Terminal</h2>
          <p className="mt-1 text-sm font-medium text-on-surface-variant">Search products, build the order, and complete the sale from one screen.</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <SummaryStat label="Subtotal" value={formatPKR(subtotal)} />
          <SummaryStat label="Tax" value={formatPKR(taxAmount)} />
          <SummaryStat label="Total Due" value={formatPKR(grandTotal)} highlight />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="space-y-6">
          <Card className="precision-card p-4">
            <CardContent className="p-0">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="relative w-full max-w-xl">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input value={searchTerm} onChange={(e) => updateSearchQuery(e.target.value)} className="precision-input pl-10" placeholder="Search products, SKUs, or barcodes..." />
                </div>
                <button type="button" className="precision-chip">
                  <Tag className="h-4 w-4" />
                  Filter By
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={[
                      "rounded-full px-4 py-2 text-xs font-bold transition",
                      selectedCategory === category
                        ? "bg-primary text-on-primary shadow-sm"
                        : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high",
                    ].join(" ")}
                  >
                    {category === "all" ? "All Products" : category}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredProducts.length === 0 ? (
              <Card className="precision-card p-8 sm:col-span-2 xl:col-span-3 2xl:col-span-4">
                <CardContent className="p-0 text-sm text-on-surface-variant">No products found.</CardContent>
              </Card>
            ) : (
              filteredProducts.map((product) => {
                const categoryName = product?.category?.name || product?.category_name || product?.category || "Uncategorized";
                const stockLabel = product.track_inventory === false ? "Service" : product.minimum_stock_alert && product.minimum_stock_alert > 0 ? "Stocked" : "In Stock";
                const initials = (product.name || "P")
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join("")
                  .toUpperCase();

                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => addToCart(product)}
                    className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-0 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    <div className="flex aspect-square items-center justify-center bg-surface-container-low">
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-container text-2xl font-bold text-primary">
                        {initials}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{categoryName}</div>
                      <h3 className="font-headline text-base font-bold text-slate-900">{product.name}</h3>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="font-headline text-lg font-extrabold text-primary">{formatPKR(product.default_selling_price)}</span>
                        <span className="rounded-full bg-secondary-container px-2 py-1 text-[10px] font-bold text-secondary">{stockLabel}</span>
                      </div>
                      <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-slate-400">SKU: {product.sku || "N/A"}</div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/8 opacity-0 transition group-hover:opacity-100">
                      <span className="rounded-full bg-primary p-3 text-white shadow-lg">
                        <ShoppingCart className="h-4 w-4" />
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <Card className="precision-card p-5">
            <CardContent className="p-0">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-headline text-lg font-bold text-slate-900">Recent Sales</h3>
                <span className="precision-chip">{sales.length} records</span>
              </div>

              {sales.length === 0 ? (
                <p className="text-sm text-on-surface-variant">No sales yet.</p>
              ) : (
                <div className="space-y-3">
                  {sales.map((sale) => (
                    <div key={sale.id} className="rounded-2xl border border-slate-100 bg-white p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-headline text-sm font-bold text-slate-900">{sale.sale_number || sale.invoice_number || sale.id}</p>
                          <p className="mt-1 text-xs text-on-surface-variant">
                            {sale.sale_date ? new Date(sale.sale_date).toLocaleString() : "-"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-headline text-base font-extrabold text-primary">{formatPKR(sale.grand_total)}</p>
                          <p className="text-xs font-semibold text-on-surface-variant">{sale.payment_status || "pending"}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <aside className="flex min-h-[calc(100vh-10rem)] flex-col rounded-3xl border border-slate-200 bg-surface-container-low shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <h3 className="font-headline text-xl font-extrabold text-slate-900">Current Order</h3>
            <div className="mt-4 space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Customer</Label>
              <select className="precision-input" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                <option value="">Walk-in Customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto p-6">
            {cart.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-on-surface-variant">
                No items in the cart yet.
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.product_id} className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-headline text-sm font-bold text-slate-900">{item.name}</h4>
                      <p className="text-[10px] font-medium text-slate-500">{formatPKR(item.unit_price)} / unit</p>
                    </div>
                    <button type="button" onClick={() => removeFromCart(item.product_id)} className="rounded-md p-1 text-error transition hover:bg-error-container/20">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="flex items-center rounded-xl bg-surface-container px-2 py-1">
                      <button type="button" className="rounded-lg bg-white p-1 shadow-sm" onClick={() => updateCartItem(item.product_id, "quantity", Math.max(Number(item.quantity) - 1, 1))}>
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                      <button type="button" className="rounded-lg bg-white p-1 shadow-sm" onClick={() => updateCartItem(item.product_id, "quantity", Number(item.quantity) + 1)}>
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="font-headline text-sm font-bold text-slate-900">{formatPKR(Number(item.quantity) * Number(item.unit_price))}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="space-y-4 border-t border-slate-200 p-6">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Subtotal</p>
                <p className="mt-1 font-headline text-xl font-bold text-slate-900">{formatPKR(subtotal)}</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Total Due</p>
                <p className="mt-1 font-headline text-xl font-bold text-primary">{formatPKR(grandTotal)}</p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Payment method">
                <select className="precision-input" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Paid amount">
                <Input type="number" className="precision-input" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} />
              </Field>
            </div>

            <Field label="Other charges">
              <Input type="number" className="precision-input" value={otherCharges} onChange={(e) => setOtherCharges(e.target.value)} />
            </Field>

            <Field label="Notes">
              <Input className="precision-input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add payment or order notes" />
            </Field>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Change Due</p>
                <p className="mt-1 font-headline text-xl font-bold text-slate-900">{formatPKR(changeDue)}</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Items</p>
                <p className="mt-1 font-headline text-xl font-bold text-slate-900">{cart.length}</p>
              </div>
            </div>

            <Button type="button" className="h-12 w-full precision-cta" onClick={submitSale}>
              Complete Sale
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <Label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-on-surface-variant">{label}</Label>
      {children}
    </div>
  );
}

function SummaryStat({ label, value, highlight = false }) {
  return (
    <div className={`rounded-2xl p-4 shadow-sm ${highlight ? "bg-primary text-on-primary" : "bg-white text-slate-900"}`}>
      <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${highlight ? "text-on-primary/80" : "text-slate-500"}`}>{label}</p>
      <p className={`mt-2 font-headline text-lg font-extrabold ${highlight ? "text-on-primary" : "text-slate-900"}`}>{value}</p>
    </div>
  );
}
