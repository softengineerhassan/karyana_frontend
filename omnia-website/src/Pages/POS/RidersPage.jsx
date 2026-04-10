import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { ridersApi } from "@/Services/posApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const emptyRider = { full_name: "", phone_number: "", email: "", profile_image: "" };

export default function RidersPage() {
  const [riders, setRiders] = useState([]);
  const [form, setForm] = useState(emptyRider);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  const loadRiders = async () => {
    const res = await ridersApi.list(search ? { search } : {});
    setRiders(res?.data?.data || []);
  };

  useEffect(() => {
    loadRiders().catch(() => {});
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    try {
      if (editingId) {
        await ridersApi.update(editingId, form);
        toast.success("Rider updated");
      } else {
        await ridersApi.create(form);
        toast.success("Rider created");
      }
      setForm(emptyRider);
      setEditingId(null);
      await loadRiders();
    } catch {}
  };

  const editRider = (item) => {
    setEditingId(item.id);
    setForm(item);
  };

  const deleteRider = async (id) => {
    if (!confirm("Delete rider?")) return;
    try {
      await ridersApi.remove(id);
      toast.success("Rider deleted");
      await loadRiders();
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Riders</h2>
        <p className="mt-1 text-sm text-gray-600">Manage rider profiles from the backend.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>{editingId ? "Update rider" : "Create rider"}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
            {[["Full name", "full_name"], ["Phone number", "phone_number"], ["Email", "email"], ["Profile image", "profile_image"]].map(([label, key]) => (
              <Field key={key} label={label}>
                <Input value={form[key]} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} />
              </Field>
            ))}
            <div className="md:col-span-2 flex gap-3">
              <Button type="submit">{editingId ? "Update" : "Create"}</Button>
              <Button type="button" variant="outline" onClick={() => { setForm(emptyRider); setEditingId(null); }}>Reset</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rider list</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex-1">
              <Label className="mb-2 block text-sm font-medium text-gray-700">Search by rider name</Label>
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Type rider name..." />
            </div>
            <div className="flex gap-2">
              <Button type="button" onClick={() => loadRiders().catch(() => {})}>Search</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearch("");
                  ridersApi.list().then((res) => setRiders(res?.data?.data || [])).catch(() => {});
                }}
              >
                Clear
              </Button>
            </div>
          </div>
          <div className="space-y-3">
            {riders.length === 0 ? <p className="text-sm text-gray-500">No riders yet.</p> : riders.map((item) => (
              <div key={item.id} className="flex flex-col gap-3 rounded-lg border p-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-medium">{item.full_name}</div>
                  <div className="text-sm text-gray-500">{item.phone_number} {item.email ? `• ${item.email}` : ""}</div>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => editRider(item)}>Edit</Button>
                  <Button type="button" variant="destructive" onClick={() => deleteRider(item.id)}>Delete</Button>
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
