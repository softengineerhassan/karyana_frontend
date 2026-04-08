import { Check, Calendar, Clock, Users, X } from "lucide-react";

export default function CancelSuccessModal({ isOpen, booking, onClose, t }) {
  if (!isOpen || !booking) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const parts = timeStr.split(":");
    if (parts.length >= 2) {
      const h = parseInt(parts[0], 10);
      const m = parts[1];
      return `${h % 12 || 12}:${m} ${h >= 12 ? "PM" : "AM"}`;
    }
    return timeStr;
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl p-8 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-[55px] h-[55px] bg-[#4CAF50]/20 rounded-full flex items-center justify-center">
            <div className="w-10 h-10 bg-[#4CAF50] rounded-full flex items-center justify-center">
              <Check className="text-white w-5 h-5" strokeWidth={3} />
            </div>
          </div>
        </div>

        <h3
          className="text-center text-xl text-[#1A1A1C] mb-2"
          style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600 }}
        >
          {t("Cancelled")}
        </h3>
        <p className="text-center text-[#8B8680] text-sm mb-5">
          {t("Your booking has been successfully cancelled.")}
        </p>

        <div className="h-px bg-[#D4AF37]/20 mb-5" />

        {/* Cancelled Booking Details */}
        <div className="bg-[#F8F6F1] border border-[#E8E3D5] rounded-2xl p-4 mb-5">
          <h4
            className="text-[#1A1A1C] text-lg mb-1"
            style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600 }}
          >
            {booking.venueName}
          </h4>
          <div className="flex items-center gap-1.5 mb-3">
            <X className="w-3 h-3 text-[#8B8680]" />
            <span className="text-[9px] uppercase tracking-wider text-[#8B8680] font-semibold">
              {t("Cancelled Booking")}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white rounded-xl p-3 text-center border border-[#E8E3D5]">
              <Calendar className="w-4 h-4 text-[#D4AF37] mx-auto mb-1" />
              <p className="text-[9px] text-[#8B8680] uppercase mb-0.5">
                {t("Date")}
              </p>
              <p className="text-xs font-semibold text-[#1A1A1C]">
                {formatDate(booking.date)}
              </p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-[#E8E3D5]">
              <Clock className="w-4 h-4 text-[#D4AF37] mx-auto mb-1" />
              <p className="text-[9px] text-[#8B8680] uppercase mb-0.5">
                {t("Time")}
              </p>
              <p className="text-xs font-semibold text-[#1A1A1C]">
                {formatTime(booking.time)}
              </p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-[#E8E3D5]">
              <Users className="w-4 h-4 text-[#D4AF37] mx-auto mb-1" />
              <p className="text-[9px] text-[#8B8680] uppercase mb-0.5">
                {t("Guests")}
              </p>
              <p className="text-xs font-semibold text-[#1A1A1C]">
                {booking.guestCount} {t("guests")}
              </p>
            </div>
          </div>
        </div>

        {/* Explore Message */}
        <div className="bg-[#FFF9E6] rounded-2xl p-3 mb-5 text-center">
          <p className="text-[#E65100] text-sm">
            👋 {t("Feel free to explore other amazing venues")}
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#CD7F32] text-white font-semibold hover:shadow-lg transition-all cursor-pointer"
        >
          {t("Done")}
        </button>
      </div>
    </div>
  );
}
