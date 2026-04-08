import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { fetchData } from "@/helpers/fetchData";
import {
  setNotifications,
  appendNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  isNotificationsStale,
} from "@/store/slices/notificationsSlice";
import {
  ArrowLeft,
  Bell,
  Gift,
  Calendar,
  CheckCheck,
  Loader2,
  Megaphone,
} from "lucide-react";

// Customer app uses size=50 per page
const PAGE_SIZE = 50;

function NotificationsLoadingSkeleton() {
  return (
    <div className="px-6 py-6 space-y-3">
      <style>{`
        @keyframes notif-sh { 0% { background-position: -600px 0; } 100% { background-position: 600px 0; } }
        .notif-sh { background: linear-gradient(90deg, #F0EBE0 25%, #E4DDD3 50%, #F0EBE0 75%); background-size: 1200px 100%; animation: notif-sh 1.5s infinite linear; }
      `}</style>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="w-full rounded-2xl p-4 border border-[#EDE8DF] bg-white">
          <div className="flex gap-4">
            {/* Icon circle — w-12 h-12 rounded-2xl */}
            <div className="notif-sh flex-shrink-0" style={{ width: 48, height: 48, borderRadius: 16 }} />
            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Title row + unread dot */}
              <div className="flex items-start justify-between gap-2" style={{ marginBottom: 6 }}>
                <div className="notif-sh" style={{ height: 15, width: '58%', borderRadius: 5 }} />
                <div className="notif-sh flex-shrink-0" style={{ width: 10, height: 10, borderRadius: 999, marginTop: 3 }} />
              </div>
              {/* Body — two lines */}
              <div className="notif-sh" style={{ height: 13, width: '85%', borderRadius: 4, marginBottom: 6 }} />
              <div className="notif-sh" style={{ height: 13, width: '65%', borderRadius: 4, marginBottom: 8 }} />
              {/* Timestamp */}
              <div className="notif-sh" style={{ height: 11, width: 72, borderRadius: 4 }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Customer app notificationType enum values (exact uppercase strings from API)
const typeConfig = {
  NEW_VENUE_ANNOUNCEMENT: { icon: Gift,      color: "from-[#D4AF37] to-[#CD7F32]" },
  BOOKING_UPDATE:         { icon: Calendar,  color: "from-emerald-500 to-emerald-600" },
  CHECK_IN_UPDATE:        { icon: Calendar,  color: "from-blue-500 to-blue-600" },
  GLOBAL_ANNOUNCEMENT:    { icon: Megaphone, color: "from-purple-500 to-purple-600" },
};

const defaultConfig = { icon: Bell, color: "from-[#8B8680] to-[#5C5850]" };

export default function Notifications() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  const dispatch = useDispatch();
  const cached = useSelector((state) => state.notifications);

  const [notifications, setNotificationsLocal] = useState(cached.items);
  const [total, setTotal] = useState(cached.total);
  const [loading, setLoading] = useState(cached.items.length === 0);
  const [loadingMore, setLoadingMore] = useState(false);
  const pageRef = useRef(cached.items.length > 0 ? Math.ceil(cached.items.length / PAGE_SIZE) : 1);
  const hasMoreRef = useRef(cached.items.length < cached.total);
  const observerRef = useRef(null);

  // Unread count — customer app computes locally: notifications.where((n) => !n.isRead).length
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Keep local state in sync helper
  const syncState = (items, total) => {
    setNotificationsLocal(items);
    setTotal(total);
  };

  // Relative time
  const relativeTime = (dateStr) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t("Just now");
    if (mins < 60) return `${mins} ${t("mins ago")}`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} ${t("hours ago")}`;
    const days = Math.floor(hours / 24);
    return `${days} ${t("days ago")}`;
  };

  // Fetch — customer app: GET /notifications?page=1&size=50
  const loadNotifications = useCallback(async (page = 1, append = false) => {
    if (!append) setLoading(true);
    else setLoadingMore(true);
    try {
      const result = await fetchData("GET", `/notifications?page=${page}&size=${PAGE_SIZE}`);
      const payload = result?.data ?? result;
      const items = Array.isArray(payload)
        ? payload
        : (payload?.items || payload?.notifications || []);
      const totalCount = payload?.total ?? 0;

      if (append) {
        const merged = [...notifications, ...items];
        syncState(merged, totalCount);
        dispatch(appendNotifications({ items, total: totalCount }));
      } else {
        syncState(items, totalCount);
        dispatch(setNotifications({ items, total: totalCount }));
      }
      pageRef.current = page;
      hasMoreRef.current = items.length === PAGE_SIZE;
    } catch {
      // fetchData already shows an error toast
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [notifications, dispatch]);

  useEffect(() => {
    // Skip fetch if cache is fresh (< 2 min old)
    if (!isNotificationsStale(cached.lastFetched)) return;
    loadNotifications(1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Infinite scroll sentinel
  const lastCardRef = useCallback(
    (node) => {
      if (loadingMore) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreRef.current && !loadingMore) {
          loadNotifications(pageRef.current + 1, true);
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [loadingMore, loadNotifications]
  );

  // Mark single as read — optimistic update to local + Redux
  const markAsRead = async (id) => {
    setNotificationsLocal((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    dispatch(markNotificationRead(id));
    try {
      await fetchData("PUT", `/notifications/${id}/read`);
    } catch {
      // silent — optimistic update already applied
    }
  };

  // Mark all as read — update local + Redux only if API succeeds
  const markAllAsRead = async () => {
    try {
      await fetchData("PUT", "/notifications/read-all");
      setNotificationsLocal((prev) => prev.map((n) => ({ ...n, isRead: true })));
      dispatch(markAllNotificationsRead());
    } catch {
      // silent
    }
  };

  // Extract reference ID — mirrors customer app NotificationService._handleNotificationNavigation
  // which checks: referenceId, reference_id, venueId, venue_id, bookingId, booking_id, id
  const extractId = (notification) => {
    const extra = notification.extraData || notification.extra_data || notification.metadata || {};
    return (
      notification.referenceId ||
      notification.reference_id ||
      extra.venueId || extra.venue_id ||
      extra.bookingId || extra.booking_id ||
      extra.id ||
      null
    );
  };

  // Navigation on tap — exact same logic as customer app _handleNotificationTap
  const handleNotificationClick = (notification) => {
    if (!notification.isRead) markAsRead(notification.id);

    const type = (notification.notificationType || notification.notification_type || notification.type || "").toUpperCase();
    const refId = extractId(notification);

    switch (type) {
      case "NEW_VENUE_ANNOUNCEMENT":
        // Customer app → NewBookingView(arguments: refId)
        // Frontend equivalent: venue detail page
        if (refId) navigate(`/venue/${refId}`);
        break;

      case "BOOKING_UPDATE":
      case "CHECK_IN_UPDATE":
        // Customer app → BookingConfirmationView(arguments: {bookingId: refId})
        // BookingSuccess already handles fetching by bookingId when only id is passed
        if (refId) {
          navigate("/booking-success", { state: { bookingData: { bookingId: refId } } });
        } else {
          navigate("/bookings");
        }
        break;

      case "GLOBAL_ANNOUNCEMENT":
        // Customer app → no navigation
        break;

      default:
        // Fallback for any other types not in customer app enum
        break;
    }
  };

  // Notification type → icon/color config — use uppercase key to match customer app enum
  const getConfig = (notification) => {
    const raw = (notification.notificationType || notification.notification_type || notification.type || "").toUpperCase();
    return typeConfig[raw] || defaultConfig;
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-24">
      {/* Header */}
      <div className="bg-white border-b border-[#E8E3D5] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-11 h-11 border border-[#E8E3D5] rounded-2xl flex items-center justify-center text-[#8B8680] hover:text-[#1A1A1C] hover:border-[#D4AF37]/40 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1
              className="text-2xl text-[#1A1A1C]"
              style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600 }}
            >
              {t("Notifications")}
            </h1>
          </div>

          {/* Mark all read — only shown when unread > 0, matches customer app */}
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 text-sm text-[#D4AF37] font-medium hover:text-[#CD7F32] transition-all cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" />
              {t("Mark all read")}
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <span className="px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] text-sm font-semibold rounded-full">
              {unreadCount} {t("new")}
            </span>
          )}
          <p className="text-[#8B8680] text-sm">
            {total} {t("total notifications")}
          </p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <NotificationsLoadingSkeleton />
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6">
          <div className="w-20 h-20 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mb-6">
            <Bell className="w-10 h-10 text-[#D4AF37]" />
          </div>
          <h2
            className="text-xl text-[#1A1A1C] mb-2"
            style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600 }}
          >
            {t("No notifications")}
          </h2>
          <p className="text-[#8B8680] text-center max-w-sm">
            {t("You're all caught up! Check back later for updates.")}
          </p>
        </div>
      ) : (
        <div className="px-6 py-6 space-y-3">
          {notifications.map((notification, index) => {
            const isLast = index === notifications.length - 1;
            const config = getConfig(notification);
            const Icon = config.icon;
            // Customer app uses isRead (camelCase)
            const isRead = notification.isRead ?? notification.is_read ?? false;
            // Customer app uses body for message content
            const title = notification.title || "";
            const body = notification.body || notification.message || "";
            // Customer app uses createdAt (camelCase)
            const timestamp = notification.createdAt || notification.created_at;

            return (
              <button
                key={notification.id}
                ref={isLast ? lastCardRef : null}
                onClick={() => handleNotificationClick(notification)}
                className={`w-full text-left rounded-2xl p-4 transition-all cursor-pointer border ${
                  isRead
                    ? "bg-white border-[#E8E3D5] opacity-80"
                    : "bg-[#FFFBF0] border-[#D4AF37]/40 shadow-md"
                } hover:border-[#D4AF37]/60 hover:shadow-lg`}
              >
                <div className="flex gap-4">
                  {/* Type icon */}
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${config.color} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3
                        className={`font-semibold leading-tight ${
                          isRead ? "text-[#8B8680]" : "text-[#1A1A1C]"
                        }`}
                      >
                        {title}
                      </h3>
                      {/* Unread dot — matches customer app gold indicator */}
                      {!isRead && (
                        <span className="w-2.5 h-2.5 bg-[#D4AF37] rounded-full flex-shrink-0 mt-1.5" />
                      )}
                    </div>

                    {body ? (
                      <p
                        className={`text-sm leading-relaxed mb-2 ${
                          isRead ? "text-[#A5A09A]" : "text-[#8B8680]"
                        }`}
                      >
                        {body}
                      </p>
                    ) : null}

                    <span className="text-xs text-[#A5A09A]">
                      {relativeTime(timestamp)}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}

          {loadingMore && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 text-[#D4AF37] animate-spin" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
