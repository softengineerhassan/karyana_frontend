import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { CalendarDays, FileText, Mail, MapPin, Phone, ShieldCheck, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getProfile, logout, sendVerificationOtp, updateOwnProfile } from "@/store/slices/AuthSlice";

export default function ProfileSetupPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state?.auth?.user);
  const isLoading = useSelector((state) => state?.auth?.isLoading);

  const [form, setForm] = useState({
    email: "",
    full_name: "",
    phone_number: "",
    location: "",
    bio: "",
    date_of_birth: "",
  });

  useEffect(() => {
    if (!user) {
      dispatch(getProfile());
    }
  }, [dispatch, user]);

  useEffect(() => {
    setForm({
      email: user?.email || "",
      full_name: user?.full_name || "",
      phone_number: user?.phone_number || "",
      location: user?.location || "",
      bio: user?.bio || "",
      date_of_birth: user?.date_of_birth ? String(user.date_of_birth).slice(0, 10) : "",
    });
  }, [user]);

  const setField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      email: form.email?.trim() || null,
      full_name: form.full_name?.trim() || null,
      phone_number: form.phone_number?.trim() || null,
      location: form.location?.trim() || null,
      bio: form.bio?.trim() || null,
      date_of_birth: form.date_of_birth || null,
    };

    try {
      const result = await dispatch(updateOwnProfile(payload)).unwrap();
      const nextEmail = result?.data?.email || payload.email;

      if (nextEmail) {
        navigate("/verify-otp", { state: { email: nextEmail }, replace: true });
        return;
      }

      navigate("/pos/dashboard", { replace: true });
    } catch {
      // handled by thunk
    }
  };

  const sendVerificationCode = async () => {
    if (!form.email?.trim()) {
      return;
    }

    try {
      await dispatch(sendVerificationOtp({ email: form.email.trim().toLowerCase() })).unwrap();
      navigate("/verify-otp", { state: { email: form.email.trim().toLowerCase() }, replace: true });
    } catch {
      // handled by thunk
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Complete profile</h2>
        <p className="mt-1 text-sm text-gray-600">
          Add your real email first so email verification and password recovery work.
        </p>
      </div>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ShieldCheck className="h-4 w-4 text-amber-600" />
            Profile settings
          </div>
          <CardTitle className="text-xl text-gray-900">Update profile</CardTitle>
          <CardDescription>
            Keep your account details up to date for verification and recovery.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
            <Field label="Email" icon={<Mail className="h-4 w-4" />}>
              <Input type="email" value={form.email} onChange={setField("email")} placeholder="tracksuitwaly@gmail.com" />
            </Field>

            <Field label="Full name" icon={<User className="h-4 w-4" />}>
              <Input value={form.full_name} onChange={setField("full_name")} placeholder="Hassan" />
            </Field>

            <Field label="Phone number" icon={<Phone className="h-4 w-4" />}>
              <Input value={form.phone_number} onChange={setField("phone_number")} placeholder="03086881047" />
            </Field>

            <Field label="Location" icon={<MapPin className="h-4 w-4" />}>
              <Input value={form.location} onChange={setField("location")} placeholder="Lahore" />
            </Field>

            <Field label="Date of birth" icon={<CalendarDays className="h-4 w-4" />}>
              <Input type="date" value={form.date_of_birth} onChange={setField("date_of_birth")} />
            </Field>

            <div className="md:col-span-2">
              <Label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                <FileText className="h-4 w-4" />
                Bio
              </Label>
              <textarea
                value={form.bio}
                onChange={setField("bio")}
                placeholder="Mobile app user"
                className="min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/10"
              />
            </div>

            <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-600">
                After save, if email changed, the backend sends a verification code automatically.
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={sendVerificationCode}
                  disabled={!form.email?.trim()}
                >
                  Send verification code
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    dispatch(logout());
                    navigate("/login", { replace: true });
                  }}
                >
                  Logout
                </Button>
                <Button type="submit" className="bg-black text-white hover:bg-black/90">
                  Save profile
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, icon, children }) {
  return (
    <div>
      <Label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
        {icon}
        {label}
      </Label>
      {children}
    </div>
  );
}
