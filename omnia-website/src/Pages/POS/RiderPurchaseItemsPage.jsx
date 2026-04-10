import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { riderPurchaseItemsApi, ridersApi } from "@/Services/posApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const emptyItem = {
  rider_profile_id: "",
  item_name: "",
  item_code: "",
  barcode: "",
  category: "",
  brand: "",
  quantity: "1",
  unit: "",
  unit_size: "",
  unit_price: "0",
  cost_price: "",
  total_price: "",
  purchase_date: new Date().toISOString().slice(0, 10),
  expiry_date: "",
  batch_number: "",
  supplier_name: "",
  supplier_contact: "",
  status: "delivered",
  payment_status: "paid",
  notes: "",
};

export default function RiderPurchaseItemsPage() {
  const [items, setItems] = useState([]);
  const [riders, setRiders] = useState([]);
  const [form, setForm] = useState(emptyItem);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const loadItems = async () => {
    const params = {};
    if (search) params.search = search;
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const res = await riderPurchaseItemsApi.list(params);
    setItems(res?.data?.data || []);
  };

  const loadRiders = async () => {
    const res = await ridersApi.list();
    setRiders(res?.data?.data || []);
  };

  useEffect(() => {
    Promise.all([loadItems(), loadRiders()]).catch(() => {});
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      quantity: Number(form.quantity || 0),
      unit_size: form.unit_size ? Number(form.unit_size) : null,
      unit_price: Number(form.unit_price || 0),
      cost_price: form.cost_price ? Number(form.cost_price) : null,
      total_price: form.total_price ? Number(form.total_price) : null,
    };

    try {
      if (editingId) {
        await riderPurchaseItemsApi.update(editingId, payload);
        toast.success("Item updated");
      } else {
        await riderPurchaseItemsApi.create(payload);
        toast.success("Item created");
      }
      setForm(emptyItem);
      setEditingId(null);
      await loadItems();
    } catch {}
  };

  const editItem = (item) => {
    setEditingId(item.id);
    setForm({
      ...item,
      rider_profile_id: item.rider_profile_id || "",
      quantity: String(item.quantity ?? 1),
      unit_price: String(item.unit_price ?? 0),
      unit_size: item.unit_size ? String(item.unit_size) : "",
      cost_price: item.cost_price ? String(item.cost_price) : "",
      total_price: item.total_price ? String(item.total_price) : "",
    });
  };

  const deleteItem = async (id) => {
    if (!confirm("Delete purchase item?")) return;
    try {
      await riderPurchaseItemsApi.remove(id);
      toast.success("Item deleted");
      await loadItems();
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Rider purchase items</h2>
        <p className="mt-1 text-sm text-gray-600">Manage rider purchase item records from the backend.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>{editingId ? "Update item" : "Create item"}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
            <Field label="Rider">
              <select className="precision-input" value={form.rider_profile_id} onChange={(e) => setForm((p) => ({ ...p, rider_profile_id: e.target.value }))}>
                <option value="">Select rider</option>
                {riders.map((rider) => (
                  <option key={rider.id} value={rider.id}>
                    {rider.full_name} {rider.phone_number ? `- ${rider.phone_number}` : ""}
                  </option>
                ))}
              </select>
            </Field>

            {[["Item name", "item_name"], ["Item code", "item_code"], ["Barcode", "barcode"], ["Category", "category"], ["Brand", "brand"], ["Quantity", "quantity"], ["Unit", "unit"], ["Unit size", "unit_size"], ["Unit price", "unit_price"], ["Cost price", "cost_price"], ["Total price", "total_price"], ["Purchase date", "purchase_date"], ["Expiry date", "expiry_date"], ["Batch number", "batch_number"], ["Supplier name", "supplier_name"], ["Supplier contact", "supplier_contact"], ["Status", "status"], ["Payment status", "payment_status"], ["Notes", "notes"]].map(([label, key]) => (
              <Field key={key} label={label}>
                <Input value={form[key] || ""} type={key.includes("date") ? "date" : "text"} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} />
              </Field>
            ))}
            <div className="md:col-span-2 flex gap-3">
              <Button type="submit">{editingId ? "Update" : "Create"}</Button>
              <Button type="button" variant="outline" onClick={() => { setForm(emptyItem); setEditingId(null); }}>Reset</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="precision-card p-4">
        <CardHeader className="pb-2"><CardTitle className="font-headline text-base font-bold text-slate-900">Created riders</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {riders.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No riders created yet.</p>
            ) : (
              riders.map((rider) => (
                <span key={rider.id} className="precision-chip">
                  {rider.full_name}
                </span>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Items list</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid gap-3 md:grid-cols-4">
            <div className="md:col-span-2">
              <Label className="mb-2 block text-sm font-medium text-gray-700">Search by rider name or item name</Label>
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Type rider or item name..." />
            </div>
            <div>
              <Label className="mb-2 block text-sm font-medium text-gray-700">From date</Label>
              <Input value={startDate} onChange={(e) => setStartDate(e.target.value)} type="date" />
            </div>
            <div>
              <Label className="mb-2 block text-sm font-medium text-gray-700">To date</Label>
              <Input value={endDate} onChange={(e) => setEndDate(e.target.value)} type="date" />
            </div>
          </div>
          <div className="mb-4 flex gap-2">
            <Button type="button" onClick={() => loadItems().catch(() => {})}>Search</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearch("");
                setStartDate("");
                setEndDate("");
                riderPurchaseItemsApi.list().then((res) => setItems(res?.data?.data || [])).catch(() => {});
              }}
            >
              Clear
            </Button>
          </div>
          <div className="space-y-3">
            {items.length === 0 ? <p className="text-sm text-gray-500">No purchase items yet.</p> : items.map((item) => (
              <div key={item.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">{item.item_name}</div>
                    <div className="text-sm text-gray-500">{item.quantity} × {item.unit_price} = {item.total_price}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => editItem(item)}>Edit</Button>
                    <Button type="button" variant="destructive" onClick={() => deleteItem(item.id)}>Delete</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <Label className="mb-2 block text-sm font-medium text-gray-700">{label}</Label>
      {children}
    </div>
  );
}
