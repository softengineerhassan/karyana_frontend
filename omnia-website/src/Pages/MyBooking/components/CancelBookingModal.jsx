import { useState } from "react";
import { X, AlertTriangle, Calendar, Clock, Users, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { fetchData } from "@/helpers/fetchData";

export default function CancelBookingModal({
  isOpen,
  booking,
  onClose,
  onCancelled, // called after successful cancellation
  t,
}) {
  const [cancelling, setCancelling] = useState(false);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
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

  const handleCancel = async () => {
    setCancelling(true);
    try {
      // Exact payload from customer app booking_repository.dart cancelBooking()
      await fetchData("PATCH", `/bookings/${booking.id}/status`, {
        status: "cancelled",
        reason: "Cancelled by user",
      });
      toast.success(t("Booking cancelled successfully"));
      onCancelled?.(booking);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || t("Failed to cancel booking"));
    } finally {
      setCancelling(false);
    }
  };

  if (!isOpen || !booking) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Red Header */}
        <div className="bg-gradient-to-r from-[#E53935] to-[#D32F2F] p-5 flex items-start justify-between">
          <h3
            className="text-white text-lg flex-1 pr-4"
            style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600 }}
          >
            {t("Are you sure you want to cancel?")}
          </h3>
          <button
            onClick={onClose}
            disabled={cancelling}
            className="w-6 h-6 flex items-center justify-center text-white/80 hover:text-white cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Warning Box */}
          <div className="bg-[#FFF3E0] border border-[#FFB74D] rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#E65100] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[#E65100] font-semibold text-sm mb-1">
                  {t("Are you sure you want to cancel this booking?")}
                </p>
                <p className="text-[#E65100]/80 text-xs">
                  {t(
                    "This action cannot be undone. You will lose any perks associated with this booking."
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Booking Details Card */}
          <div className="bg-[#F8F6F1] border border-[#E8E3D5] rounded-2xl p-4">
            <h4
              className="text-[#1A1A1C] text-lg mb-3"
              style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600 }}
            >
              {booking.venueName}
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[#8B8680] flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> {t("Date")}:
                </span>
                <span className="text-[#1A1A1C] font-medium">
                  {formatDate(booking.date)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8B8680] flex items-center gap-2">
                  <Clock className="w-4 h-4" /> {t("Time")}:
                </span>
                <span className="text-[#1A1A1C] font-medium">
                  {formatTime(booking.time)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8B8680] flex items-center gap-2">
                  <Users className="w-4 h-4" /> {t("Guests")}:
                </span>
                <span className="text-[#1A1A1C] font-medium">
                  {booking.guestCount}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={cancelling}
              className="flex-1 py-3 rounded-2xl border border-[#E8E3D5] text-[#5C5850] font-semibold hover:bg-[#F8F6F1] disabled:opacity-50 transition-all cursor-pointer"
            >
              {t("Keep")}
            </button>
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="flex-[2] py-3 rounded-2xl bg-gradient-to-r from-[#E53935] to-[#D32F2F] text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-60 transition-all cursor-pointer"
            >
              {cancelling ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <X className="w-4 h-4" />
                  {t("Cancel Booking")}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
