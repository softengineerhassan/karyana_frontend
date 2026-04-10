import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { ArrowUpRight, Package2, ReceiptText, ShoppingCart, Users, Store, Settings2, Loader2 } from "lucide-react";

import { dashboardApi } from "@/Services/posApi";

const cards = [
  {
    title: "Inventory",
    points: ["Categories", "Units", "Products"],
    to: "/pos/inventory",
  },
  {
    title: "Customers",
    points: ["Create customer", "Update customer", "Opening balance"],
    to: "/pos/customers",
  },
  {
    title: "Sales",
    points: ["Create sale", "Invoices", "Payments", "Cancel sale"],
    to: "/pos/sales",
  },
  {
    title: "Riders",
    points: ["Rider CRUD", "Delivery profiles", "Contact data"],
    to: "/pos/riders",
  },
  {
    title: "Rider Items",
    points: ["Purchase items", "Batch info", "Payment status"],
    to: "/pos/rider-items",
  },
  {
    title: "Profile",
    points: ["Update email", "OTP verify", "Password flows"],
    to: "/pos/profile",
  },
];

const shortcuts = [
  { label: "POS Terminal", icon: ShoppingCart, to: "/pos/sales" },
  { label: "Inventory", icon: Package2, to: "/pos/inventory" },
  { label: "Customers", icon: Users, to: "/pos/customers" },
  { label: "Riders", icon: Store, to: "/pos/riders" },
  { label: "Rider Items", icon: ReceiptText, to: "/pos/rider-items" },
  { label: "Settings", icon: Settings2, to: "/pos/profile" },
];

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadSummary = async () => {
      setLoading(true);
      try {
        const response = await dashboardApi.summary();
        if (mounted) {
          setSummary(response?.data?.data || null);
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load dashboard summary");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadSummary();

    return () => {
      mounted = false;
    };
  }, []);

  const metrics = summary?.metrics || [];
  const salesTrend = summary?.sales_trend || [];
  const recentSales = summary?.recent_sales || [];
  const lowStockItems = summary?.low_stock_items || [];

  const trendPoints = useMemo(() => {
    return salesTrend.map((point, index) => {
      const rawDay = String(point?.day || "");
      const parsedDate = new Date(rawDay);
      const isValidDate = !Number.isNaN(parsedDate.getTime());

      return {
        ...point,
        id: `${rawDay}-${index}`,
        grossSales: Number(point?.gross_sales || 0),
        netRevenue: Number(point?.net_revenue || 0),
        label: isValidDate ? parsedDate.toLocaleDateString(undefined, { weekday: "short" }) : rawDay.slice(0, 3),
        fullDate: isValidDate ? parsedDate.toLocaleDateString() : rawDay,
      };
    });
  }, [salesTrend]);

  const trendStats = useMemo(() => {
    const grossTotal = trendPoints.reduce((sum, point) => sum + point.grossSales, 0);
    const netTotal = trendPoints.reduce((sum, point) => sum + point.netRevenue, 0);
    const averageGross = trendPoints.length ? grossTotal / trendPoints.length : 0;
    const captureRate = grossTotal > 0 ? (netTotal / grossTotal) * 100 : 0;
    const peakDay = trendPoints.reduce(
      (max, point) => (point.grossSales > max.grossSales ? point : max),
      { grossSales: 0, label: "-", fullDate: "-" },
    );

    return {
      grossTotal,
      netTotal,
      averageGross,
      captureRate,
      peakDay,
    };
  }, [trendPoints]);

  const maxTrendValue = useMemo(
    () => Math.max(1, ...trendPoints.flatMap((point) => [point.grossSales, point.netRevenue])),
    [trendPoints],
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h2 className="font-headline text-3xl font-extrabold tracking-tight text-slate-900">Terminal Overview</h2>
          <p className="mt-1 text-sm font-medium text-on-surface-variant">Performance metrics and fast access to your backend modules.</p>
        </div>
        <div className="flex gap-3">
          <button type="button" className="precision-chip">
            <ArrowUpRight className="h-4 w-4" />
            Export
          </button>
          <button type="button" className="precision-chip">
            Today
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
            <section key={index} className="precision-soft-card p-6">
              <div className="h-3 w-28 animate-pulse rounded-full bg-surface-container-high" />
              <div className="mt-4 h-10 w-24 animate-pulse rounded-2xl bg-surface-container-high" />
              <div className="mt-3 h-3 w-36 animate-pulse rounded-full bg-surface-container-high" />
            </section>
          ))
          : metrics.map((stat) => (
            <section key={stat.label} className="precision-soft-card p-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">{stat.label}</p>
              <h3 className="mt-3 font-headline text-3xl font-extrabold text-inverse-surface">{stat.value}</h3>
              <p className="mt-2 text-xs font-semibold text-on-surface-variant">{stat.meta}</p>
            </section>
          ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="precision-card p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-headline text-lg font-bold text-slate-900">Sales Trends</h3>
              <p className="text-xs text-on-surface-variant">Last 7 days with actionable sales insights</p>
            </div>
            <div className="flex gap-4 text-xs font-semibold text-on-surface-variant">
              <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-primary" />Gross Sales</span>
              <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-surface-container-highest" />Net Revenue</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
            <div className="rounded-xl bg-surface-container-low px-3 py-2">
              <p className="font-semibold uppercase tracking-wide text-on-surface-variant">Gross (7d)</p>
              <p className="mt-1 text-sm font-bold text-slate-900">PKR {trendStats.grossTotal.toFixed(2)}</p>
            </div>
            <div className="rounded-xl bg-surface-container-low px-3 py-2">
              <p className="font-semibold uppercase tracking-wide text-on-surface-variant">Net (7d)</p>
              <p className="mt-1 text-sm font-bold text-slate-900">PKR {trendStats.netTotal.toFixed(2)}</p>
            </div>
            <div className="rounded-xl bg-surface-container-low px-3 py-2">
              <p className="font-semibold uppercase tracking-wide text-on-surface-variant">Avg / Day</p>
              <p className="mt-1 text-sm font-bold text-slate-900">PKR {trendStats.averageGross.toFixed(2)}</p>
            </div>
            <div className="rounded-xl bg-surface-container-low px-3 py-2">
              <p className="font-semibold uppercase tracking-wide text-on-surface-variant">Net Capture</p>
              <p className="mt-1 text-sm font-bold text-slate-900">{trendStats.captureRate.toFixed(1)}%</p>
            </div>
          </div>

          <div className="mt-8 grid h-72 grid-cols-7 items-end gap-4 px-1">
            {trendPoints.map((point) => {
              const grossHeight = Math.max(12, (point.grossSales / maxTrendValue) * 100);
              const netHeight = Math.max(8, (point.netRevenue / maxTrendValue) * 100);

              return (
                <div key={point.id} className="relative h-full rounded-t-2xl bg-surface-container-low" title={`${point.fullDate} | Gross: PKR ${point.grossSales.toFixed(2)} | Net: PKR ${point.netRevenue.toFixed(2)}`}>
                  <div className="absolute inset-x-2 bottom-0 rounded-t-2xl bg-primary/85" style={{ height: `${grossHeight}%` }} />
                  <div className="absolute inset-x-5 bottom-0 rounded-t-2xl bg-slate-300/80" style={{ height: `${netHeight}%` }} />
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex justify-between px-1 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            {trendPoints.map((point) => (
              <span key={point.id} title={point.fullDate}>{point.label}</span>
            ))}
          </div>

          <div className="mt-4 rounded-xl bg-surface-container-low px-3 py-2 text-xs text-on-surface-variant">
            Peak day: <span className="font-bold text-slate-900">{trendStats.peakDay.label}</span> ({trendStats.peakDay.fullDate}) with
            <span className="font-bold text-slate-900"> PKR {Number(trendStats.peakDay.grossSales || 0).toFixed(2)}</span> gross sales.
          </div>
        </section>

        <section className="precision-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-headline text-lg font-bold text-slate-900">Quick Actions</h3>
              <p className="text-xs text-on-surface-variant">Jump into the modules you use most.</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {shortcuts.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.label} to={item.to} className="rounded-2xl border border-slate-100 bg-surface-container-low p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm">
                  <Icon className="h-5 w-5 text-primary" />
                  <div className="mt-8 font-semibold text-slate-900">{item.label}</div>
                  <div className="mt-1 text-xs text-on-surface-variant">Open module</div>
                </Link>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl bg-surface-container-low p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">Focused Modules</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {cards.map((card) => (
                <Link key={card.title} to={card.to} className="rounded-xl border border-white bg-white p-4 transition hover:border-primary/20 hover:shadow-sm">
                  <h4 className="font-headline text-base font-bold text-slate-900">{card.title}</h4>
                  <ul className="mt-2 space-y-1 text-sm text-slate-600">
                    {card.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">Low Stock Watch</p>
                <p className="text-xs text-on-surface-variant">Real products below threshold</p>
              </div>
              <span className="precision-chip">{lowStockItems.length} alerts</span>
            </div>

            <div className="mt-3 space-y-2">
              {lowStockItems.length === 0 ? (
                <p className="text-sm text-on-surface-variant">No low stock products right now.</p>
              ) : (
                lowStockItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-xl bg-surface-container-low px-3 py-2 text-sm">
                    <div>
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="text-xs text-on-surface-variant">SKU: {item.sku || "N/A"}</p>
                    </div>
                    <div className="text-right text-xs text-on-surface-variant">
                      <p>{Number(item.available_quantity || 0).toFixed(3)} left</p>
                      <p>Alert at {Number(item.minimum_stock_alert || 0).toFixed(3)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>

      <section className="precision-card p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-headline text-lg font-bold text-slate-900">Recent Sales</h3>
            <p className="text-xs text-on-surface-variant">Latest completed and posted transactions</p>
          </div>
          <span className="precision-chip">{recentSales.length} items</span>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-on-surface-variant">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading recent sales...
            </div>
          ) : recentSales.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No recent sales found.</p>
          ) : (
            recentSales.map((sale) => (
              <article key={sale.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-headline text-sm font-bold text-slate-900">{sale.sale_number}</p>
                    <p className="mt-1 text-xs text-on-surface-variant">{sale.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-headline text-base font-extrabold text-primary">PKR {Number(sale.grand_total || 0).toFixed(2)}</p>
                    <p className="text-xs font-semibold text-on-surface-variant">{sale.payment_status}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-on-surface-variant">
                  <span>{sale.invoice_number || "No invoice"}</span>
                  <span>{sale.sale_date ? new Date(sale.sale_date).toLocaleDateString() : "-"}</span>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
