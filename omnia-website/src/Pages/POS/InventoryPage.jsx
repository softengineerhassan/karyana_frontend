import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { AlertTriangle, Download, Filter, Layers, Pencil, Plus, Printer, Trash2 } from "lucide-react";

import { inventoryApi } from "@/Services/posApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const emptyCategory = { name: "", slug: "", description: "", is_active: true };
const emptyUnit = { name: "", symbol: "", description: "", is_active: true };
const emptyProduct = {
  name: "",
  slug: "",
  sku: "",
  barcode: "",
  category_id: "",
  brand_id: "",
  unit_id: "",
  purchase_unit_id: "",
  sales_unit_id: "",
  product_type: "stockable",
  track_inventory: true,
  has_expiry: false,
  has_batch: false,
  minimum_stock_alert: "0",
  default_purchase_price: "0",
  default_selling_price: "0",
  tax_percent: "0",
  description: "",
  image_url: "",
  is_active: true,
};

export default function InventoryPage() {
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [products, setProducts] = useState([]);

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);

  const [showProductForm, setShowProductForm] = useState(false);
  const [showMasterData, setShowMasterData] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);

  const [categoryForm, setCategoryForm] = useState(emptyCategory);
  const [unitForm, setUnitForm] = useState(emptyUnit);
  const [productForm, setProductForm] = useState(emptyProduct);

  const categoryNameById = useMemo(
    () => Object.fromEntries(categories.map((item) => [item.id, item.name])),
    [categories]
  );

  const unitNameById = useMemo(
    () => Object.fromEntries(units.map((item) => [item.id, item.name])),
    [units]
  );

  const loadAll = async () => {
    const [catRes, unitRes, productRes] = await Promise.all([
      inventoryApi.categories.list(),
      inventoryApi.units.list(),
      inventoryApi.products.list(),
    ]);

    setCategories(catRes?.data?.data || []);
    setUnits(unitRes?.data?.data || []);
    setProducts(productRes?.data?.data || []);
  };

  useEffect(() => {
    loadAll().catch(() => {});
  }, []);

  const deriveStock = (product) => {
    const min = Number(product.minimum_stock_alert || 0);
    const optimal = Math.max(min * 2, 20);
    const current = product.is_active === false ? 0 : Math.max(optimal - min, 0);

    let status = "in_stock";
    if (current <= 0) status = "out_of_stock";
    else if (current <= min) status = "low_stock";

    const ratio = optimal > 0 ? Math.min(Math.round((current / optimal) * 100), 100) : 0;

    return { min, optimal, current, status, ratio };
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const stock = deriveStock(product);
      const categoryMatch = categoryFilter === "all" || String(product.category_id) === categoryFilter;
      const statusMatch = statusFilter === "all" || stock.status === statusFilter;
      return categoryMatch && statusMatch;
    });
  }, [products, categoryFilter, statusFilter]);

  const metrics = useMemo(() => {
    const lowStock = filteredProducts.filter((p) => deriveStock(p).status === "low_stock").length;
    const outOfStock = filteredProducts.filter((p) => deriveStock(p).status === "out_of_stock").length;
    const inventoryValue = filteredProducts.reduce((sum, p) => sum + Number(p.default_selling_price || 0), 0);

    return {
      totalItems: filteredProducts.length,
      lowStock,
      outOfStock,
      inventoryValue,
    };
  }, [filteredProducts]);

  const resetForms = () => {
    setCategoryForm(emptyCategory);
    setUnitForm(emptyUnit);
    setProductForm(emptyProduct);
    setEditingProductId(null);
  };

  const submitCategory = async (event) => {
    event.preventDefault();
    try {
      await inventoryApi.categories.create(categoryForm);
      toast.success("Category created");
      setCategoryForm(emptyCategory);
      await loadAll();
    } catch {}
  };

  const submitUnit = async (event) => {
    event.preventDefault();
    try {
      await inventoryApi.units.create(unitForm);
      toast.success("Unit created");
      setUnitForm(emptyUnit);
      await loadAll();
    } catch {}
  };

  const submitProduct = async (event) => {
    event.preventDefault();

    const payload = {
      ...productForm,
      category_id: productForm.category_id,
      unit_id: productForm.unit_id,
      purchase_unit_id: productForm.purchase_unit_id || null,
      sales_unit_id: productForm.sales_unit_id || null,
      brand_id: productForm.brand_id || null,
      minimum_stock_alert: Number(productForm.minimum_stock_alert || 0),
      default_purchase_price: Number(productForm.default_purchase_price || 0),
      default_selling_price: Number(productForm.default_selling_price || 0),
      tax_percent: Number(productForm.tax_percent || 0),
    };

    try {
      if (editingProductId) {
        await inventoryApi.products.update(editingProductId, payload);
        toast.success("Product updated");
      } else {
        await inventoryApi.products.create(payload);
        toast.success("Product created");
      }

      resetForms();
      setShowProductForm(false);
      await loadAll();
    } catch {}
  };

  const editProduct = (product) => {
    setEditingProductId(product.id);
    setProductForm({
      ...emptyProduct,
      ...product,
      minimum_stock_alert: String(product.minimum_stock_alert ?? 0),
      default_purchase_price: String(product.default_purchase_price ?? 0),
      default_selling_price: String(product.default_selling_price ?? 0),
      tax_percent: String(product.tax_percent ?? 0),
      category_id: product.category_id || "",
      unit_id: product.unit_id || "",
      purchase_unit_id: product.purchase_unit_id || "",
      sales_unit_id: product.sales_unit_id || "",
      brand_id: product.brand_id || "",
    });
    setShowProductForm(true);
  };

  const removeProduct = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await inventoryApi.products.remove(id);
      toast.success("Product deleted");
      await loadAll();
    } catch {}
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const selectAll = (checked) => {
    if (!checked) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(filteredProducts.map((item) => item.id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h2 className="font-headline text-3xl font-extrabold tracking-tight text-slate-900">Inventory Management</h2>
          <p className="mt-1 text-sm font-medium text-on-surface-variant">Track and manage your product catalog.</p>
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" className="rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50" onClick={() => setShowMasterData((prev) => !prev)}>
            Manage Categories
          </Button>
          <Button type="button" className="precision-cta rounded-xl" onClick={() => { resetForms(); setShowProductForm((prev) => !prev); }}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Product
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="TOTAL ITEMS" value={metrics.totalItems.toLocaleString()} subtext="+12% from last month" />
        <MetricCard title="LOW STOCK ALERTS" value={metrics.lowStock.toLocaleString()} subtext="Requires immediate attention" danger />
        <MetricCard title="INVENTORY VALUE" value={`PKR ${metrics.inventoryValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} subtext="Current warehouse valuation" />
        <MetricCard title="OUT OF STOCK" value={metrics.outOfStock.toLocaleString()} subtext="Inactive SKU listing" />
      </div>

      {showMasterData ? (
        <Card className="precision-card p-5">
          <CardContent className="grid gap-6 p-0 md:grid-cols-2">
            <form onSubmit={submitCategory} className="space-y-3 rounded-2xl bg-surface-container-low p-4">
              <h3 className="font-headline text-lg font-bold text-slate-900">Create Category</h3>
              <LabeledInput label="Name" value={categoryForm.name} onChange={(value) => setCategoryForm((p) => ({ ...p, name: value }))} />
              <LabeledInput label="Slug" value={categoryForm.slug} onChange={(value) => setCategoryForm((p) => ({ ...p, slug: value }))} />
              <LabeledInput label="Description" value={categoryForm.description} onChange={(value) => setCategoryForm((p) => ({ ...p, description: value }))} />
              <Button type="submit" className="precision-cta">Save Category</Button>
            </form>

            <form onSubmit={submitUnit} className="space-y-3 rounded-2xl bg-surface-container-low p-4">
              <h3 className="font-headline text-lg font-bold text-slate-900">Create Unit</h3>
              <LabeledInput label="Name" value={unitForm.name} onChange={(value) => setUnitForm((p) => ({ ...p, name: value }))} />
              <LabeledInput label="Symbol" value={unitForm.symbol} onChange={(value) => setUnitForm((p) => ({ ...p, symbol: value }))} />
              <LabeledInput label="Description" value={unitForm.description} onChange={(value) => setUnitForm((p) => ({ ...p, description: value }))} />
              <Button type="submit" className="precision-cta">Save Unit</Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {showProductForm ? (
        <Card className="precision-card p-5">
          <CardContent className="p-0">
            <form onSubmit={submitProduct} className="grid gap-4 md:grid-cols-3">
              <LabeledInput label="Name" value={productForm.name} onChange={(value) => setProductForm((p) => ({ ...p, name: value }))} />
              <LabeledInput label="Slug" value={productForm.slug} onChange={(value) => setProductForm((p) => ({ ...p, slug: value }))} />
              <LabeledInput label="SKU" value={productForm.sku} onChange={(value) => setProductForm((p) => ({ ...p, sku: value }))} />

              <Field label="Category">
                <select className="precision-input" value={productForm.category_id} onChange={(e) => setProductForm((p) => ({ ...p, category_id: e.target.value }))}>
                  <option value="">Select category</option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </Field>

              <Field label="Unit">
                <select className="precision-input" value={productForm.unit_id} onChange={(e) => setProductForm((p) => ({ ...p, unit_id: e.target.value }))}>
                  <option value="">Select unit</option>
                  {units.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </Field>

              <LabeledInput label="Minimum stock alert" type="number" value={productForm.minimum_stock_alert} onChange={(value) => setProductForm((p) => ({ ...p, minimum_stock_alert: value }))} />
              <LabeledInput label="Selling price" type="number" value={productForm.default_selling_price} onChange={(value) => setProductForm((p) => ({ ...p, default_selling_price: value }))} />
              <LabeledInput label="Purchase price" type="number" value={productForm.default_purchase_price} onChange={(value) => setProductForm((p) => ({ ...p, default_purchase_price: value }))} />
              <LabeledInput label="Tax percent" type="number" value={productForm.tax_percent} onChange={(value) => setProductForm((p) => ({ ...p, tax_percent: value }))} />

              <div className="md:col-span-3 flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={Boolean(productForm.track_inventory)} onChange={(e) => setProductForm((p) => ({ ...p, track_inventory: e.target.checked }))} />
                  Track inventory
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={Boolean(productForm.is_active)} onChange={(e) => setProductForm((p) => ({ ...p, is_active: e.target.checked }))} />
                  Active
                </label>
              </div>

              <div className="md:col-span-3 flex gap-3">
                <Button type="submit" className="precision-cta">{editingProductId ? "Update Product" : "Create Product"}</Button>
                <Button type="button" variant="outline" onClick={() => { resetForms(); setShowProductForm(false); }}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Card className="precision-card p-0">
        <CardContent className="p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-surface-container-lowest p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-xl border border-outline-variant/30 bg-surface px-4 py-2">
                <label className="mr-2 text-xs font-bold uppercase text-on-surface-variant">Category:</label>
                <select className="bg-transparent text-sm font-semibold outline-none" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  <option value="all">All Categories</option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl border border-outline-variant/30 bg-surface px-4 py-2">
                <label className="mr-2 text-xs font-bold uppercase text-on-surface-variant">Status:</label>
                <select className="bg-transparent text-sm font-semibold outline-none" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="in_stock">In Stock</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="out_of_stock">Out Of Stock</option>
                </select>
              </div>

              <button type="button" className="rounded-lg p-2 text-on-surface-variant transition hover:bg-surface">
                <Filter className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button type="button" className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-on-surface-variant transition hover:bg-surface">
                <Layers className="h-4 w-4" />
                Bulk Actions
              </button>
              <div className="h-6 w-px bg-outline-variant/30" />
              <button type="button" className="rounded-lg p-2 text-on-surface-variant transition hover:bg-surface">
                <Download className="h-4 w-4" />
              </button>
              <button type="button" className="rounded-lg p-2 text-on-surface-variant transition hover:bg-surface">
                <Printer className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-100 bg-white">
            <table className="w-full min-w-[980px] text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-surface-container-low/50">
                  <th className="px-6 py-4">
                    <input type="checkbox" checked={filteredProducts.length > 0 && selectedIds.length === filteredProducts.length} onChange={(e) => selectAll(e.target.checked)} />
                  </th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-[0.16em] text-on-surface-variant">SKU</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-[0.16em] text-on-surface-variant">Product Name</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-[0.16em] text-on-surface-variant">Category</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-[0.16em] text-on-surface-variant">Unit</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-[0.16em] text-on-surface-variant">Stock Level</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-[0.16em] text-on-surface-variant">Price</th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-[0.16em] text-on-surface-variant">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-sm text-on-surface-variant">No products found.</td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const stock = deriveStock(product);
                    const statusColor =
                      stock.status === "out_of_stock"
                        ? "bg-error"
                        : stock.status === "low_stock"
                          ? "bg-error-container"
                          : "bg-primary";

                    return (
                      <tr key={product.id} className="border-b border-slate-50 transition hover:bg-slate-50/60">
                        <td className="px-6 py-4">
                          <input type="checkbox" checked={selectedIds.includes(product.id)} onChange={() => toggleSelect(product.id)} />
                        </td>

                        <td className="px-4 py-4 text-sm font-medium text-on-surface-variant">{product.sku || "-"}</td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container text-sm font-bold text-primary">
                              {(product.name || "P").slice(0, 1).toUpperCase()}
                            </div>
                            <span className="font-headline text-[1.05rem] font-bold text-slate-900">{product.name}</span>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span className="rounded-full bg-surface-container px-3 py-1 text-xs font-bold text-on-surface-variant">
                            {categoryNameById[product.category_id] || "Uncategorized"}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-sm text-on-surface-variant">{unitNameById[product.unit_id] || "-"}</td>

                        <td className="px-4 py-4">
                          <div className="w-36 space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-semibold">
                              <span>{stock.current} units</span>
                              <span className="text-on-surface-variant">Opt: {stock.optimal}</span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                              <div className={`h-full ${statusColor}`} style={{ width: `${stock.ratio}%` }} />
                            </div>
                            {stock.status !== "in_stock" ? (
                              <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-error">
                                <AlertTriangle className="h-3 w-3" />
                                {stock.status === "out_of_stock" ? "Out of stock" : "Low stock"}
                              </div>
                            ) : null}
                          </div>
                        </td>

                        <td className="px-4 py-4 font-headline text-3 font-bold text-slate-900">
                          PKR {Number(product.default_selling_price || 0).toFixed(2)}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button type="button" onClick={() => editProduct(product)} className="rounded-lg p-2 text-on-surface-variant transition hover:bg-surface-container">
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button type="button" onClick={() => removeProduct(product.id)} className="rounded-lg p-2 text-error transition hover:bg-error-container/20">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-sm text-on-surface-variant">
            Showing 1 - {filteredProducts.length} of {products.length} products
          </div>
        </CardContent>
      </Card>
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

function LabeledInput({ label, value, onChange, type = "text" }) {
  return (
    <Field label={label}>
      <Input value={value} type={type} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

function MetricCard({ title, value, subtext, danger = false }) {
  return (
    <div className="precision-soft-card p-6">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-on-surface-variant">{title}</p>
      <h3 className={`mt-2 font-headline text-5 font-extrabold ${danger ? "text-error" : "text-slate-900"}`}>{value}</h3>
      <p className={`mt-2 text-sm font-semibold ${danger ? "text-error" : "text-on-surface-variant"}`}>{subtext}</p>
    </div>
  );
}
