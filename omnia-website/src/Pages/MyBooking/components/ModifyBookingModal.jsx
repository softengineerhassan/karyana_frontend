import { useState, useEffect, useMemo } from "react";
import { X, Calendar, Clock, Users, Minus, Plus, Check, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { fetchData } from "@/helpers/fetchData";

export default function ModifyBookingModal({
  isOpen,
  booking,
  onClose,
  onSaved, // called with updated booking data on success
  t,
}) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState(1);
  const [saving, setSaving] = useState(false);

  const maxCapacity = booking?.venueAvailableCapacity || 20;

  useEffect(() => {
    if (booking) {
      setDate(booking.date || "");
      setTime(booking.time?.slice(0, 5) || "");
      setGuests(booking.guestCount || 1);
    }
  }, [booking]);

  // Generate time slots from venue available times or default 30-min intervals
  const timeSlots = useMemo(() => {
    const availableTimes = booking?.venueAvailableTimes;
    if (Array.isArray(availableTimes) && availableTimes.length > 0) {
      const slots = [];
      availableTimes.forEach((range) => {
        const parts = range.split(" - ");
        if (parts.length === 2) {
          const [startH, startM] = parts[0].split(":").map(Number);
          const [endH, endM] = parts[1].split(":").map(Number);
          let h = startH, m = startM;
          while (h < endH || (h === endH && m <= endM)) {
            slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
            m += 30;
            if (m >= 60) { h++; m = 0; }
          }
        }
      });
      const currentTime = booking?.time?.slice(0, 5);
      if (currentTime && !slots.includes(currentTime)) slots.unshift(currentTime);
      return slots;
    }
    const slots = [];
    for (let h = 8; h <= 23; h++) {
      slots.push(`${String(h).padStart(2, "0")}:00`);
      if (h < 23) slots.push(`${String(h).padStart(2, "0")}:30`);
    }
    return slots;
  }, [booking]);

  const formatTimeDisplay = (t24) => {
    const [h, m] = t24.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, "0")} ${period}`;
  };

  // Min date: today (local ISO to avoid timezone shift)
  const todayLocal = (() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  })();
  const maxDate = new Date(Date.now() + 365 * 86400000).toISOString().split("T")[0];

  const handleSave = async () => {
    if (!date) { toast.error(t("Please select a date")); return; }
    if (!time) { toast.error(t("Please select a time")); return; }

    setSaving(true);
    try {
      // Exact payload from customer app booking_repository.dart modifyBooking()
      await fetchData("PATCH", `/bookings/${booking.id}`, {
        booking_date: date,
        start_time: time,
        duration_minutes: booking.duration || 60,
        party_size: guests,
        guest_name: booking.guestName,
        guest_email: booking.guestEmail,
        guest_phone: booking.guestPhone,
      });
      toast.success(t("Booking modified successfully"));
      onSaved?.({ date, time, guestCount: guests });
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || t("Failed to modify booking"));
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !booking) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#D4AF37] to-[#CD7F32] p-5 flex items-start justify-between flex-shrink-0">
          <div>
            <h3
              className="text-white text-xl mb-1"
              style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600 }}
            >
              {t("Modify Booking")}
            </h3>
            <p className="text-white/70 text-sm">{booking.venueName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all cursor-pointer"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Date */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-[#1A1A1C] mb-2">
              <Calendar className="w-4 h-4 text-[#D4AF37]" />
              {t("Date")}
            </label>
            <input
              type="date"
              value={date}
              min={todayLocal}
              max={maxDate}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-[#E8E3D5] rounded-2xl px-4 py-3 text-[#1A1A1C] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
            />
          </div>

          {/* Time Slots Grid */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-[#1A1A1C] mb-3">
              <Clock className="w-4 h-4 text-[#D4AF37]" />
              {t("Time")}
            </label>
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setTime(slot)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    time === slot
                      ? "bg-gradient-to-r from-[#D4AF37] to-[#CD7F32] text-white shadow-md"
                      : "bg-[#F8F6F1] text-[#1A1A1C] border border-[#E8E3D5] hover:border-[#D4AF37]/40"
                  }`}
                >
                  {formatTimeDisplay(slot)}
                </button>
              ))}
            </div>
          </div>

          {/* Guest Count Stepper */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-[#1A1A1C] mb-3">
              <Users className="w-4 h-4 text-[#D4AF37]" />
              {t("Number of Guests")}
              <span className="text-[#8B8680] font-normal">
                ({t("max")} {maxCapacity})
              </span>
            </label>
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={() => setGuests(Math.max(1, guests - 1))}
                disabled={guests <= 1}
                className="w-10 h-10 border-2 border-[#E8E3D5] rounded-full flex items-center justify-center hover:border-[#D4AF37] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="text-center">
                <span className="text-3xl font-bold text-[#1A1A1C]">{guests}</span>
                <p className="text-xs text-[#8B8680]">{t("guests")}</p>
              </div>
              <button
                onClick={() => setGuests(Math.min(maxCapacity, guests + 1))}
                disabled={guests >= maxCapacity}
                className="w-10 h-10 border-2 border-[#E8E3D5] rounded-full flex items-center justify-center hover:border-[#D4AF37] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-[#E8E3D5] flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-3 rounded-2xl border border-[#E8E3D5] text-[#5C5850] font-semibold hover:bg-[#F8F6F1] disabled:opacity-50 transition-all cursor-pointer"
          >
            {t("Cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-[2] py-3 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#CD7F32] text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-60 transition-all cursor-pointer"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Check className="w-5 h-5" />
                {t("Save Changes")}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
