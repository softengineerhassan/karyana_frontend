import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

import { userSignIn } from "@/store/slices/AuthSlice";

export default function LoginPage() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state?.auth?.token);
  const isLoading = useSelector((state) => state?.auth?.isLoading);

  const [form, setForm] = useState({
    employee_id: "",
    password: "",
  });

  if (token) {
    return <Navigate to="/pos/dashboard" replace />;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    await dispatch(userSignIn(form));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-xl border bg-white p-6 shadow-sm"
      >
        <h1 className="text-2xl font-semibold text-gray-900">POS Login</h1>
        <p className="mt-1 text-sm text-gray-600">
          Sign in with employee ID and password.
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Employee ID
            </label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              value={form.employee_id}
              onChange={(e) => setForm((s) => ({ ...s, employee_id: e.target.value }))}
              placeholder="AB1#X9"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              value={form.password}
              onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-black px-3 py-2 font-medium text-white disabled:opacity-60"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </div>
      </form>
    </div>
  );
}
