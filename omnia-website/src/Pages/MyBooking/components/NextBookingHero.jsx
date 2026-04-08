import { QrCode, Calendar, Clock, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getStatusBadge } from "../utilis/bookingStatusConfig";

export default function NextBookingHero({ booking, onBookingClick, onShowQR }) {
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(
        language === "ar" ? "ar-SA" : language === "fr" ? "fr-FR" : "en-US",
        { weekday: "short", month: "short", day: "numeric" }
      );
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const parts = timeStr.split(":");
    if (parts.length >= 2) {
      const hours = parseInt(parts[0], 10);
      const minutes = parts[1];
      const period = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes} ${period}`;
    }
    return timeStr;
  };

  return (
    <div
      className="mb-6 p-6 rounded-3xl bg-gradient-to-r from-[#D4AF37] to-[#CD7F32] text-white relative overflow-hidden cursor-pointer active:opacity-90 transition-opacity"
      onClick={() => onBookingClick?.(booking)}
    >
      {/* Decorative */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />

      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs uppercase tracking-widest font-semibold opacity-90">
            {t("Next Booking")}
          </h3>
          <span className="bg-white/20 text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full">
            {t("Ready")}
          </span>
        </div>

        <h4 className="text-2xl font-serif mb-2">
          {booking.venueName}
        </h4>

        {getStatusBadge(booking.status, t)}

        <div className="mt-4 space-y-2 text-white/90 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {formatDate(booking.date)}
          </div>
          {booking.time && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {formatTime(booking.time)}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {booking.guestCount} {t("guests")}
          </div>
        </div>

        {booking.status === "confirmed" && (
          <button
            onClick={(e) => { e.stopPropagation(); onShowQR(booking); }}
            className="mt-4 w-full bg-white/20 hover:bg-white/30 py-3 rounded-xl flex justify-center items-center gap-2 transition-all cursor-pointer font-semibold"
          >
            <QrCode className="w-5 h-5" /> {t("View QR Code")}
          </button>
        )}
      </div>
    </div>
  );
}
