import { Outlet, NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { logout } from "@/store/slices/AuthSlice";

const linkClass = ({ isActive }) =>
  [
    "rounded-lg px-3 py-2 text-sm font-medium transition",
    isActive ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100",
  ].join(" ");

export default function POSLayout() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.auth?.user);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Karyana POS</h1>
            <p className="text-xs text-gray-500">
              {user?.full_name || "POS User"}
            </p>
          </div>

          <button
            type="button"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100"
            onClick={() => dispatch(logout())}
          >
            Logout
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-4 md:grid-cols-[220px_1fr]">
        <aside className="rounded-xl border bg-white p-3">
          <nav className="flex flex-col gap-2">
            <NavLink to="/pos/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/pos/profile" className={linkClass}>
              Profile Setup
            </NavLink>
            <NavLink to="/pos/riders" className={linkClass}>
              Riders
            </NavLink>
            <NavLink to="/pos/rider-items" className={linkClass}>
              Rider Items
            </NavLink>
          </nav>
        </aside>

        <main className="rounded-xl border bg-white p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
