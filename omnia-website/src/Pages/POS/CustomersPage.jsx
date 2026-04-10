import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ChevronRight, Mail, MapPin, Phone, Pencil } from "lucide-react";

import { salesApi } from "@/Services/posApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const emptyCustomer = {
  name: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  opening_balance: 0,
  customer_type: "walk_in",
  notes: "",
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(emptyCustomer);
  const [editingId, setEditingId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const loadCustomers = async () => {
    const res = await salesApi.customers.list();
    setCustomers(res?.data?.data || []);
  };

  useEffect(() => {
    loadCustomers().catch(() => {});
  }, []);

  const selectedCustomer = useMemo(
    () => customers.find((item) => item.id === selectedId) || customers[0] || null,
    [customers, selectedId]
  );

  useEffect(() => {
    if (!selectedId && customers.length > 0) {
      setSelectedId(customers[0].id);
    }
  }, [customers, selectedId]);

  const submit = async (event) => {
    event.preventDefault();
    try {
      if (editingId) {
        await salesApi.customers.update(editingId, form);
        toast.success("Customer updated");
      } else {
        await salesApi.customers.create(form);
        toast.success("Customer created");
      }
      setForm(emptyCustomer);
      setEditingId(null);
      await loadCustomers();
    } catch {}
  };

  const editCustomer = (item) => {
    setEditingId(item.id);
    setSelectedId(item.id);
    setForm({ ...item, opening_balance: item.opening_balance ?? 0 });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h2 className="font-headline text-3xl font-extrabold tracking-tight text-slate-900">Customer Relations</h2>
          <p className="mt-1 text-sm font-medium text-on-surface-variant">Manage your loyal patrons and their purchase history.</p>
        </div>
        <div className="flex gap-3">
          <div className="precision-soft-card px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Average Loyalty</p>
            <p className="mt-1 font-headline text-lg font-bold text-slate-900">1,240 pts</p>
          </div>
          <div className="precision-soft-card px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Monthly Retention</p>
            <p className="mt-1 font-headline text-lg font-bold text-slate-900">+12.4%</p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-12">
        <div className="xl:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-lg font-bold text-slate-900">Recent Activity</h3>
            <div className="flex gap-2 text-xs font-bold text-slate-500">
              <button type="button" className="rounded-lg bg-white px-3 py-1.5 shadow-sm">All</button>
              <button type="button" className="rounded-lg px-3 py-1.5 hover:text-primary">VIP</button>
              <button type="button" className="rounded-lg px-3 py-1.5 hover:text-primary">New</button>
            </div>
          </div>

          <div className="space-y-3">
            {customers.length === 0 ? (
              <Card className="precision-card p-6">
                <CardContent className="p-0">
                  <p className="text-sm text-on-surface-variant">No customers yet.</p>
                </CardContent>
              </Card>
            ) : (
              customers.map((item) => {
                const active = selectedCustomer?.id === item.id;
                const initials = (item.name || "C")
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join("")
                  .toUpperCase();

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={[
                      "group w-full rounded-2xl border bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm",
                      active ? "border-primary/20 ring-1 ring-primary/10" : "border-slate-100",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-full font-bold ${active ? "bg-primary-container text-primary" : "bg-secondary-container text-secondary"}`}>
                          {initials}
                        </div>
                        <div>
                          <h4 className="font-headline text-base font-bold text-slate-900">{item.name}</h4>
                          <p className="text-xs text-slate-500">{item.email || item.phone || "No contact set"}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-6 text-right text-xs">
                        <div>
                          <p className="font-bold uppercase tracking-[0.16em] text-slate-400">Spend</p>
                          <p className="mt-1 font-headline text-sm font-bold text-slate-900">{item.opening_balance || 0}</p>
                        </div>
                        <div>
                          <p className="font-bold uppercase tracking-[0.16em] text-slate-400">Type</p>
                          <p className="mt-1 font-headline text-sm font-bold text-slate-900">{item.customer_type}</p>
                        </div>
                        <div>
                          <p className="font-bold uppercase tracking-[0.16em] text-slate-400">Status</p>
                          <p className="mt-1 font-headline text-sm font-bold text-slate-900">Today</p>
                        </div>
                      </div>

                      <ChevronRight className="h-4 w-4 text-slate-300" />
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="flex justify-center pt-2">
            <button type="button" className="text-sm font-bold text-primary hover:underline">
              Load more customers
            </button>
          </div>
        </div>

        <div className="xl:col-span-5 space-y-6">
          <Card className="precision-card p-6">
            <CardContent className="p-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-container font-bold text-xl text-primary">
                    {(selectedCustomer?.name || "CU")
                      .split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <h3 className="font-headline text-2xl font-extrabold text-slate-900">{selectedCustomer?.name || "Customer profile"}</h3>
                    <button type="button" className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-primary">
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm text-on-surface-variant">Customer ID: {selectedCustomer?.id || "--"}</p>
                </div>
                <div className="precision-chip">Platinum Member</div>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                <InfoTile title="Loyalty Tier" value="Platinum" />
                <InfoTile title="Member Since" value={selectedCustomer?.created_at ? new Date(selectedCustomer.created_at).getFullYear().toString() : "Jan 2021"} />
              </div>

              <div className="mt-6 space-y-3 rounded-2xl bg-surface-container-low p-4">
                <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-on-surface-variant">Contact Details</h4>
                <ContactRow icon={Mail} value={selectedCustomer?.email || "No email"} />
                <ContactRow icon={Phone} value={selectedCustomer?.phone || "No phone"} />
                <ContactRow icon={MapPin} value={[selectedCustomer?.address, selectedCustomer?.city].filter(Boolean).join(", ") || "No address"} />
              </div>
            </CardContent>
          </Card>

          <Card className="precision-card p-6">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">Manage Customer</p>
                  <h3 className="font-headline text-lg font-bold text-slate-900">{editingId ? "Update customer" : "Create customer"}</h3>
                </div>
              </div>

              <form onSubmit={submit} className="mt-5 grid gap-4 md:grid-cols-2">
                {[["Name", "name"], ["Phone", "phone"], ["Email", "email"], ["City", "city"], ["Address", "address"], ["Notes", "notes"]].map(([label, key]) => (
                  <Field key={key} label={label}>
                    <Input value={form[key] || ""} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} />
                  </Field>
                ))}
                <Field label="Opening balance">
                  <Input type="number" value={form.opening_balance} onChange={(e) => setForm((p) => ({ ...p, opening_balance: Number(e.target.value) }))} />
                </Field>
                <Field label="Customer type">
                  <select className="precision-input" value={form.customer_type} onChange={(e) => setForm((p) => ({ ...p, customer_type: e.target.value }))}>
                    <option value="walk_in">walk_in</option>
                    <option value="regular">regular</option>
                    <option value="wholesale">wholesale</option>
                  </select>
                </Field>
                <div className="md:col-span-2 flex gap-3 pt-1">
                  <Button type="submit" className="precision-cta">{editingId ? "Update" : "Create"}</Button>
                  <Button type="button" variant="outline" onClick={() => { setForm(emptyCustomer); setEditingId(null); }}>
                    Reset
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
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

function ContactRow({ icon: Icon, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm">
      <span className="rounded-full bg-primary-container p-2 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <p className="text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

function InfoTile({ title, value }) {
  return (
    <div className="rounded-2xl bg-surface-container-low p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">{title}</p>
      <p className="mt-2 font-headline text-base font-bold text-slate-900">{value}</p>
    </div>
  );
}
