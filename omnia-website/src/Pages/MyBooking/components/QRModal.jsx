import { X, Sparkles, Calendar, Clock, Users, MapPin, Star } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function QRModal({ isOpen, booking, onClose }) {
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  if (!isOpen || !booking) return null;

  // Support both regular bookings and walk-in redemptions
  const isWalkIn = !!booking.redemption_code;

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString(
        language === "ar" ? "ar-SA" : language === "fr" ? "fr-FR" : "en-US",
        { month: "short", day: "numeric", year: "numeric" }
      );
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "N/A";
    const parts = timeStr.split(":");
    if (parts.length >= 2) {
      const h = parseInt(parts[0], 10);
      const m = parts[1];
      return `${h % 12 || 12}:${m} ${h >= 12 ? "PM" : "AM"}`;
    }
    return timeStr;
  };

  const statusConfig = {
    confirmed: { bg: "bg-[#EFF6EC]", border: "border-[#BFD8B8]", text: "text-[#3A7D2C]", label: t("Confirmed") },
    pending: { bg: "bg-[#FFF9E6]", border: "border-[#FFE8A3]", text: "text-[#D4AF37]", label: t("Pending") },
    completed: { bg: "bg-[#EFF6EC]", border: "border-[#BFD8B8]", text: "text-[#3A7D2C]", label: t("Completed") },
    cancelled: { bg: "bg-[#FFEBEE]", border: "border-[#FFCDD2]", text: "text-[#D32F2F]", label: t("Cancelled") },
  };
  const status = statusConfig[booking.status] || statusConfig.confirmed;

  // Get first perk
  const perk = booking.perksApplied?.[0];
  const perkTitle = perk
    ? (language === "ar" ? perk.title_ar : language === "fr" ? perk.title_fr : perk.title_en) || perk.title_en
    : null;
  const perkDesc = perk
    ? (language === "ar" ? perk.description_ar : language === "fr" ? perk.description_fr : perk.description_en) || perk.description_en
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-[#8B8680] hover:text-[#1A1A1C] transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
          {/* Gold Header */}
          <div className="bg-gradient-to-r from-[#D4AF37] to-[#CD7F32] p-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-white/90" />
              <h3
                className="text-white text-lg tracking-wide"
                style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600, letterSpacing: "0.05em" }}
              >
                OMNIA
              </h3>
              <Sparkles className="w-4 h-4 text-white/90" />
            </div>
            <p className="text-white/80 text-[11px] uppercase tracking-widest">
              {t("Your Booking Pass")}
            </p>
          </div>

          {/* Scrollable Content */}
          <div className="max-h-[65vh] overflow-y-auto p-6">
            {/* QR Code */}
            <div className="flex justify-center mb-5">
              <div className="border-2 border-[#D4AF37]/20 rounded-2xl p-4 bg-white">
                <div className="w-44 h-44 bg-white flex items-center justify-center rounded-xl">
                  {(booking.bookingCode || booking.redemption_code) ? (
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=176x176&data=${encodeURIComponent(booking.bookingCode || booking.redemption_code)}`}
                      alt="QR Code"
                      className="w-44 h-44"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="w-20 h-20 bg-[#F8F6F1] rounded-full flex items-center justify-center mx-auto mb-2">
                        <Sparkles className="w-8 h-8 text-[#D4AF37]" />
                      </div>
                      <p className="text-[#8B8680] text-xs">{t("QR generating...")}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Venue / Perk Name */}
            <h4
              className="text-center text-[#D4AF37] text-lg mb-2"
              style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600 }}
            >
              {isWalkIn
                ? (language === "ar" ? booking.perk_title_ar : language === "fr" ? booking.perk_title_fr : booking.perk_title_en)
                : booking.venueName}
            </h4>

            {isWalkIn ? (
              <>
                {/* Walk-in Status Pill */}
                <div className="flex justify-center mb-4">
                  {booking.is_redeemed ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-[#EFF6EC] border-[#BFD8B8] text-[#3A7D2C]">
                      {t("Redeemed")}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-[#FFF9E6] border-[#FFE8A3] text-[#D4AF37]">
                      {t("Available")}
                    </span>
                  )}
                </div>

                {/* Walk-in Info Card */}
                <div className="bg-[#F8F6F1] border border-[#E8E3D5] rounded-2xl p-4 mb-4">
                  <div className="grid grid-cols-2 gap-3">
                    {booking.venue_name && (
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1.5 text-[#8B8680] mb-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="text-[10px] uppercase">{t("Venue")}</span>
                        </div>
                        <p className="text-[#1A1A1C] text-sm font-semibold truncate">
                          {booking.venue_name}
                        </p>
                      </div>
                    )}
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1.5 text-[#8B8680] mb-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-[10px] uppercase">{t("Created")}</span>
                      </div>
                      <p className="text-[#1A1A1C] text-sm font-semibold">
                        {formatDate(booking.created_at)}
                      </p>
                    </div>
                    {booking.qr_expires_at && (
                      <div className="text-center col-span-2">
                        <div className="flex items-center justify-center gap-1.5 text-[#8B8680] mb-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-[10px] uppercase">{t("Expires")}</span>
                        </div>
                        <p className="text-[#1A1A1C] text-sm font-semibold">
                          {formatDate(booking.qr_expires_at)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Redemption Code */}
                <div className="bg-[#F8F6F1] border border-[#E8E3D5] rounded-2xl p-4 mb-4 text-center">
                  <p className="text-[10px] text-[#8B8680] uppercase tracking-wider mb-1">
                    {t("Redemption Code")}
                  </p>
                  <p className="text-[#1A1A1C] font-bold text-xl tracking-widest">
                    {booking.redemption_code}
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Status Pill */}
                <div className="flex justify-center mb-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${status.bg} ${status.border} ${status.text}`}
                  >
                    {status.label}
                  </span>
                </div>

                {/* Info Card - 2x2 Grid */}
                <div className="bg-[#F8F6F1] border border-[#E8E3D5] rounded-2xl p-4 mb-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1.5 text-[#8B8680] mb-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-[10px] uppercase">{t("Date")}</span>
                      </div>
                      <p className="text-[#1A1A1C] text-sm font-semibold">
                        {formatDate(booking.date)}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1.5 text-[#8B8680] mb-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[10px] uppercase">{t("Time")}</span>
                      </div>
                      <p className="text-[#1A1A1C] text-sm font-semibold">
                        {formatTime(booking.time)}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1.5 text-[#8B8680] mb-1">
                        <Users className="w-3.5 h-3.5" />
                        <span className="text-[10px] uppercase">{t("Guests")}</span>
                      </div>
                      <p className="text-[#1A1A1C] text-sm font-semibold">
                        {booking.guestCount || booking.partySize}
                      </p>
                    </div>
                    {booking.location && (
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1.5 text-[#8B8680] mb-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="text-[10px] uppercase">{t("Area")}</span>
                        </div>
                        <p className="text-[#1A1A1C] text-sm font-semibold truncate">
                          {booking.location}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Perks Section */}
                {perkTitle && (
                  <div className="bg-[#FFFBF0] border border-[#D4AF37]/20 rounded-2xl p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <Star className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[#D4AF37] font-semibold text-sm">
                          {perkTitle}
                        </p>
                        {perkDesc && (
                          <p className="text-[#8B8680] text-xs mt-1">{perkDesc}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Footer */}
            <p className="text-center text-[#8B8680] text-[10px]">
              {t("Present this code at the venue")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
