import { NavLink, Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Bell, ChevronDown, LayoutGrid, LogOut, Package2, ReceiptText, Search, Settings2, ShoppingCart, Store, Users } from "lucide-react";

import { logout } from "@/store/slices/AuthSlice";

const linkClass = ({ isActive }) =>
  [
    "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all",
    isActive
      ? "border-l-4 border-primary bg-surface-bright text-primary shadow-sm"
      : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900",
  ].join(" ");

const navItems = [
  { to: "/pos/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/pos/sales", label: "POS Terminal", icon: ShoppingCart },
  { to: "/pos/inventory", label: "Inventory", icon: Package2 },
  { to: "/pos/customers", label: "Customers", icon: Users },
  { to: "/pos/riders", label: "Riders", icon: Store },
  { to: "/pos/rider-items", label: "Rider Items", icon: ReceiptText },
  { to: "/pos/profile", label: "Settings", icon: Settings2 },
];

export default function POSLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useSelector((state) => state?.auth?.user);
  const globalQuery = searchParams.get("q") || "";
  const isSalesRoute = location.pathname.startsWith("/pos/sales");

  const handleHeaderSearch = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value?.trim()) {
      next.set("q", value);
    } else {
      next.delete("q");
    }
    setSearchParams(next, { replace: true });
  };
  const displayName = user?.full_name || user?.employee_id || "POS User";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen bg-surface text-on-surface">
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-200 bg-slate-100 px-4 py-6">
        <div className="mb-8 px-2">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-container text-primary shadow-sm">
            <Store className="h-5 w-5" />
          </div>
          <h1 className="font-headline text-xl font-extrabold tracking-tight text-slate-900">Precision POS</h1>
          <p className="text-xs font-medium text-slate-500">Main Terminal</p>
        </div>

        <button
          type="button"
          className="mb-8 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-on-primary shadow-lg shadow-primary/20 transition-transform active:scale-95"
          onClick={() => navigate("/pos/sales")}
        >
          <ShoppingCart className="h-4 w-4" />
          New Sale
        </button>

        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={linkClass}>
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-slate-200 pt-4">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-200/70 hover:text-slate-900"
            onClick={() => navigate("/pos/profile")}
          >
            <Settings2 className="h-4 w-4" />
            Help
          </button>
          <button
            type="button"
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-200/70 hover:text-slate-900"
            onClick={() => {
              dispatch(logout());
              navigate("/login", { replace: true });
            }}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <div className="ml-64 min-h-screen flex-1">
        <header className="fixed right-0 top-0 z-30 flex h-16 w-[calc(100%-16rem)] items-center justify-between border-b border-slate-200 bg-white/80 px-8 backdrop-blur-md">
          <div className="flex items-center gap-6">
            <div className="font-headline text-lg font-extrabold text-slate-900">Precision Merchant</div>
            <div className="relative hidden w-[28rem] lg:block">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                className="precision-input pl-10"
                placeholder="Search products, SKUs, or barcodes..."
                value={globalQuery}
                onChange={(e) => handleHeaderSearch(e.target.value)}
                disabled={!isSalesRoute}
              />
            </div>
            <div className="hidden items-center gap-2 text-sm font-medium text-slate-500 md:flex">
              <span className="text-primary">
                <ChevronDown className="h-4 w-4" />
              </span>
              <span>Store Location: Downtown</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button type="button" className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-primary">
              <Bell className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="flex items-center gap-3 rounded-full bg-surface-container-low px-2 py-2 transition hover:bg-surface-container"
              onClick={() => navigate("/pos/profile")}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-container font-bold text-primary">{initials || "P"}</div>
              <div className="pr-2">
                <div className="text-sm font-bold text-slate-900">{displayName}</div>
                <div className="text-[11px] font-medium text-slate-500">Admin Level</div>
              </div>
            </button>
          </div>
        </header>

        <main className="min-h-screen px-8 pb-8 pt-24">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
