import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchData } from "@/helpers/fetchData";

export default function ProfileStats() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    bookings: 0,
    reviews: 0,
    favorites: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Fetch all booking statuses in parallel (API accepts one status at a time)
        // Same logic as customer app: activeBookings.length + pastBookings.length
        const [
          confirmedRes,
          pendingRes,
          completedRes,
          cancelledRes,
          reviewsRes,
          favoritesRes,
        ] = await Promise.all([
          fetchData("GET", "/bookings/my-bookings?page=1&page_size=1&status=confirmed").catch(() => null),
          fetchData("GET", "/bookings/my-bookings?page=1&page_size=1&status=pending").catch(() => null),
          fetchData("GET", "/bookings/my-bookings?page=1&page_size=1&status=completed").catch(() => null),
          fetchData("GET", "/bookings/my-bookings?page=1&page_size=1&status=cancelled").catch(() => null),
          fetchData("GET", "/venue-reviews/me?skip=0&limit=1").catch(() => null),
          fetchData("GET", "/venue-favorites/me?skip=0&limit=1").catch(() => null),
        ]);

        // API returns { success, data: [...], meta: { total } }
        // fetchData returns the envelope, so res.data is array, res.meta has total
        const getCount = (res) => {
          if (!res) return 0;
          // Try meta.total first (pagination metadata)
          if (res?.meta?.total != null) return res.meta.total;
          // Fallback: if data is array, count items
          if (Array.isArray(res?.data)) return res.data.length;
          // Fallback: nested total
          if (res?.data?.total != null) return res.data.total;
          if (res?.data?.meta?.total != null) return res.data.meta.total;
          return 0;
        };

        const bookingsCount =
          getCount(confirmedRes) +
          getCount(pendingRes) +
          getCount(completedRes) +
          getCount(cancelledRes);

        const reviewsCount = getCount(reviewsRes);
        const favoritesCount = getCount(favoritesRes);

        setStats({
          bookings: bookingsCount,
          reviews: reviewsCount,
          favorites: favoritesCount,
        });
      } catch {
        // Keep default zeros on error
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statItems = [
    { value: stats.bookings, label: t("Bookings") },
    { value: stats.reviews, label: t("Reviews") },
    { value: stats.favorites, label: t("Favorites") },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {statItems.map((item, i) => (
        <div
          key={i}
          className="bg-white/18 backdrop-blur-md rounded-2xl p-4 text-center border border-white/25"
        >
          <div className="text-2xl font-bold font-serif mb-1">
            {loading ? (
              <span className="inline-block w-6 h-6 bg-white/20 rounded animate-pulse" />
            ) : (
              item.value
            )}
          </div>
          <div className="text-white/80 text-xs uppercase tracking-wide">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}
