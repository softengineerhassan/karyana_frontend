import { Calendar, Clock, Users, MapPin, QrCode, X, Edit3, Star, CheckCircle } from "lucide-react";
import BookingPerks from "./BookingPerks";
import { useTranslation } from "react-i18next";
import { Card } from "@/Shared/Card";
import { AppButton } from "@/Shared";
import { getStatusBadge } from "../utilis/bookingStatusConfig";

export default function BookingCard({
  booking,
  isExpired = false,
  onVenueClick,
  onBookingClick,
  onShowQR,
  onModify,
  onCancel,
  onWriteReview,
}) {
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(
        language === "ar" ? "ar-SA" : language === "fr" ? "fr-FR" : "en-US",
        { weekday: "short", year: "numeric", month: "short", day: "numeric" }
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

  const getPerkTitle = (perk) => {
    if (language === "ar" && perk.title_ar) return perk.title_ar;
    if (language === "fr" && perk.title_fr) return perk.title_fr;
    return perk.title_en || perk.display_value || "";
  };

  const perks = (booking.perksApplied || []).map((p) => ({
    title: getPerkTitle(p),
    description:
      language === "ar"
        ? p.description_ar
        : language === "fr"
          ? p.description_fr
          : p.description_en,
  }));

  return (
    <Card
      padding="lg"
      hover
      className={`flex flex-col h-full ${isExpired ? "opacity-50 pointer-events-none" : ""}`}
    >
      <div
        onClick={() => onBookingClick?.(booking)}
        className="cursor-pointer"
      >
        <div className="flex items-start justify-between">
          <h4
            className="text-lg mb-2"
            style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600 }}
          >
            {booking.venueName}
          </h4>
          {/* QR icon for confirmed bookings */}
          {booking.status === "confirmed" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShowQR(booking);
              }}
              className="p-2 bg-[#D4AF37]/10 rounded-xl hover:bg-[#D4AF37]/20 transition-all cursor-pointer"
            >
              <QrCode size={18} className="text-[#D4AF37]" />
            </button>
          )}
        </div>
        {getStatusBadge(booking.status, t)}
      </div>

      <div className="space-y-2 mt-4 text-sm text-[#5C5850]">
        <div className="flex gap-2 items-center">
          <Calendar size={16} className="text-[#8B8680]" />
          {formatDate(booking.date)}
          {booking.time && (
            <>
              <Clock size={16} className="text-[#8B8680] ml-2" />
              {formatTime(booking.time)}
            </>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <Users size={16} className="text-[#8B8680]" />
          {booking.guestCount} {t("guests")}
        </div>
        {booking.location && (
          <div className="flex gap-2 items-center">
            <MapPin size={16} className="text-[#8B8680]" />
            {booking.location}
          </div>
        )}
      </div>

      {/* Perks box for confirmed/pending */}
      {perks.length > 0 &&
        (booking.status === "confirmed" || booking.status === "pending") && (
          <div className="mt-3">
            <BookingPerks perks={perks} />
          </div>
        )}

      {/* Spacer to push action buttons to bottom */}
      <div className="flex-1" />

      {/* Action buttons by status */}
      {booking.status === "confirmed" && !isExpired && (
        <div className="grid grid-cols-2 gap-2 mt-4">
          <AppButton
            size="sm"
            fullWidth
            onClick={(e) => {
              e.stopPropagation();
              onModify?.(booking);
            }}
          >
            {t("Modify")}
          </AppButton>
          <AppButton
            size="sm"
            variant="outline"
            fullWidth
            onClick={(e) => {
              e.stopPropagation();
              onCancel?.(booking);
            }}
          >
            <X size={14} /> {t("Cancel")}
          </AppButton>
        </div>
      )}

      {booking.status === "pending" && !isExpired && (
        <div className="mt-4">
          <AppButton
            size="sm"
            variant="outline"
            fullWidth
            onClick={(e) => {
              e.stopPropagation();
              onCancel?.(booking);
            }}
          >
            <X size={14} /> {t("Cancel")}
          </AppButton>
        </div>
      )}

      {booking.status === "completed" && (
        <div className="mt-4 space-y-3">
          {/* Existing review */}
          {booking.hasReview && booking.review && (
            <div className="bg-[#F8F6F1] border border-[#E8E3D5] rounded-xl p-3">
              <div className="flex items-center gap-1 mb-1.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={14}
                    className={s <= (booking.review.rating || 0) ? "text-[#D4AF37] fill-[#D4AF37]" : "text-[#E8E3D5]"}
                  />
                ))}
                <span className="text-xs text-[#8B8680] ml-1">{booking.review.rating}/5</span>
              </div>
              {booking.review.review_text && (
                <p className="text-[#5C5850] text-xs line-clamp-2">{booking.review.review_text}</p>
              )}
              <div className="flex items-center gap-1 mt-1.5">
                <CheckCircle size={12} className="text-[#2E7D32]" />
                <span className="text-[10px] text-[#2E7D32] font-semibold">{t("Reviewed")}</span>
              </div>
            </div>
          )}

          {/* Write Review button — only if can_review and no existing review */}
          {booking.canReview && !booking.hasReview && (
            <AppButton
              size="sm"
              variant="outline"
              fullWidth
              onClick={(e) => {
                e.stopPropagation();
                onWriteReview?.(booking);
              }}
            >
              <Edit3 size={14} /> {t("Write Review")}
            </AppButton>
          )}
        </div>
      )}
    </Card>
  );
}
