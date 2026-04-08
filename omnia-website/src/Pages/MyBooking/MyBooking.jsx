import React, { useState, useEffect, useCallback } from "react";
import BookingHeader from "./components/BookingHeader";
import BookingTabs from "./components/BookingTabs";
import BookingCard from "./components/BookingCard";
import WalkInCard from "./components/WalkInCard";
import NextBookingHero from "./components/NextBookingHero";
import QRModal from "./components/QRModal";
import CancelBookingModal from "./components/CancelBookingModal";
import CancelSuccessModal from "./components/CancelSuccessModal";
import ModifyBookingModal from "./components/ModifyBookingModal";
import WriteReviewModal from "./components/WriteReviewModal";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setBookings, setWalkInRedemptions as setWalkInRedux, updateBooking, isBookingsStale } from "@/store/slices/bookingsSlice";
import { fetchData } from "@/helpers/fetchData";
import { Loader2 } from "lucide-react";

// ── Hero shimmer — mirrors NextBookingHero (p-6 rounded-3xl gold gradient) ─
function BookingHeroShimmer() {
  return (
    <div className="mb-6 p-6 rounded-3xl relative overflow-hidden" style={{ background: 'linear-gradient(to right, #C9A227, #B8722D)' }}>
      <style>{`
        @keyframes bk-sh { 0% { background-position: -600px 0; } 100% { background-position: 600px 0; } }
        .bk-sh { background: linear-gradient(90deg, rgba(255,255,255,0.12) 25%, rgba(255,255,255,0.24) 50%, rgba(255,255,255,0.12) 75%); background-size: 1200px 100%; animation: bk-sh 1.5s infinite linear; border-radius: 6px; }
        .bk-sh-card { background: linear-gradient(90deg, #F0EBE0 25%, #E4DDD3 50%, #F0EBE0 75%); background-size: 1200px 100%; animation: bk-sh 1.5s infinite linear; border-radius: 6px; }
      `}</style>
      {/* "Next Booking" label + "Ready" badge row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="bk-sh" style={{ height: 11, width: 90 }} />
        <div className="bk-sh" style={{ height: 22, width: 52, borderRadius: 999 }} />
      </div>
      {/* Venue name — text-2xl */}
      <div className="bk-sh" style={{ height: 28, width: '65%', marginBottom: 10 }} />
      {/* Status badge */}
      <div className="bk-sh" style={{ height: 22, width: 80, borderRadius: 999, marginBottom: 16 }} />
      {/* 3 info rows — Calendar/Clock/Users icons + text */}
      {[100, 80, 110].map((w, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div className="bk-sh" style={{ width: 16, height: 16, borderRadius: 4 }} />
          <div className="bk-sh" style={{ height: 13, width: w }} />
        </div>
      ))}
      {/* QR button — mt-4 w-full py-3 rounded-xl */}
      <div className="bk-sh" style={{ height: 48, width: '100%', borderRadius: 12, marginTop: 16 }} />
    </div>
  );
}

// ── Booking card shimmer — mirrors BookingCard (Card padding="lg" = p-8) ────
function BookingCardShimmer() {
  return (
    <div className="bg-white rounded-3xl border border-[#E8E3D5] shadow-md" style={{ padding: 32 }}>
      {/* Header: venue name + QR btn */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        <div className="bk-sh-card" style={{ height: 22, width: '60%' }} />
        <div className="bk-sh-card" style={{ width: 34, height: 34, borderRadius: 12, flexShrink: 0 }} />
      </div>
      {/* Status badge */}
      <div className="bk-sh-card" style={{ height: 22, width: 80, borderRadius: 999, marginBottom: 16 }} />
      {/* Info rows — space-y-2 mt-4 */}
      {[120, 80, 140].map((w, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div className="bk-sh-card" style={{ width: 16, height: 16, borderRadius: 4 }} />
          <div className="bk-sh-card" style={{ height: 13, width: w }} />
        </div>
      ))}
      {/* Action buttons — grid-cols-2 gap-2 mt-4 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 16 }}>
        <div className="bk-sh-card" style={{ height: 40, borderRadius: 12 }} />
        <div className="bk-sh-card" style={{ height: 40, borderRadius: 12 }} />
      </div>
    </div>
  );
}

function MyBookingsLoadingSkeleton() {
  return (
    <div>
      <BookingHeroShimmer />
      <div className="gap-2 grid grid-cols-1 md:grid-cols-3">
        {[1, 2, 3].map(i => <BookingCardShimmer key={i} />)}
      </div>
    </div>
  );
}

export default function MyBookings() {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cached = useSelector((state) => state.bookings);

  const [activeTab, setActiveTab] = useState("active");
  const [activeSubTab, setActiveSubTab] = useState("reservation");
  const [activeBookings, setActiveBookings] = useState(cached.activeBookings);
  const [pastBookings, setPastBookings] = useState(cached.pastBookings);
  const [walkInRedemptions, setWalkInRedemptions] = useState(cached.walkInRedemptions || []);
  const [loading, setLoading] = useState(cached.activeBookings.length === 0 && cached.pastBookings.length === 0);
  const [walkInLoading, setWalkInLoading] = useState(false);
  const [selectedQR, setSelectedQR] = useState(null);
  const [cancelBooking, setCancelBooking] = useState(null);
  const [cancelSuccess, setCancelSuccess] = useState(null);
  const [modifyBooking, setModifyBooking] = useState(null);
  const [reviewBooking, setReviewBooking] = useState(null);

  const normalizeBooking = (item) => ({
    id: item.id,
    venueId: item.venue_id,
    resourceId: item.resource_id,
    venueName:
      language === "ar"
        ? item.venue_name_ar || item.venue_name_en
        : language === "fr"
          ? item.venue_name_fr || item.venue_name_en
          : item.venue_name_en,
    venueImage: item.venue_image,
    location: item.venue_location,
    date: item.booking_date,
    time: item.start_time,
    duration: item.duration_minutes,
    guestCount: item.party_size,
    guestName: item.guest_name,
    guestEmail: item.guest_email,
    guestPhone: item.guest_phone,
    status: item.status?.toLowerCase(),
    perksApplied: item.perks_applied || [],
    qrToken: item.qr_token,
    qrExpiresAt: item.qr_expires_at,
    bookingCode: item.booking_code,
    specialInstructions: item.special_instructions,
    createdAt: item.created_at,
    canReview: item.reviews?.can_review || false,
    hasReview: item.reviews?.has_review || false,
    review: item.reviews?.review || null,
  });

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const [confirmedRes, pendingRes, completedRes, cancelledRes] =
        await Promise.all([
          fetchData("GET", "/bookings/my-bookings?page=1&page_size=50&status=confirmed"),
          fetchData("GET", "/bookings/my-bookings?page=1&page_size=50&status=pending"),
          fetchData("GET", "/bookings/my-bookings?page=1&page_size=50&status=completed"),
          fetchData("GET", "/bookings/my-bookings?page=1&page_size=50&status=cancelled"),
        ]);

      const toList = (res) => {
        const raw = res?.data;
        const arr = Array.isArray(raw) ? raw : (raw?.items || []);
        return arr.map(normalizeBooking);
      };

      const active = [...toList(confirmedRes), ...toList(pendingRes)];
      const past = [...toList(completedRes), ...toList(cancelledRes)];

      setActiveBookings(active);
      setPastBookings(past);
      dispatch(setBookings({ activeBookings: active, pastBookings: past }));
    } catch {
      // fetchData shows toast
    } finally {
      setLoading(false);
    }
  }, [language, dispatch]);

  const fetchWalkInRedemptions = useCallback(async () => {
    setWalkInLoading(true);
    try {
      const res = await fetchData(
        "GET",
        "/perk-redemptions/my-walk-in-redemptions?skip=0&limit=100"
      );
      const list = res?.data ?? [];
      const data = Array.isArray(list) ? list : [];
      setWalkInRedemptions(data);
      dispatch(setWalkInRedux(data));
    } catch {
      // fetchData shows toast
    } finally {
      setWalkInLoading(false);
    }
  }, [dispatch]);

  // Sync walk-in redemptions from Redux (e.g. when a new one is added from the modal)
  useEffect(() => {
    setWalkInRedemptions(cached.walkInRedemptions || []);
  }, [cached.walkInRedemptions]);

  useEffect(() => {
    // Always fetch fresh data on mount so recently cancelled/new bookings show up
    fetchBookings();
    fetchWalkInRedemptions();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Next booking: first confirmed booking with future date
  const nextBooking = activeBookings.find((b) => {
    if (b.status !== "confirmed") return false;
    if (!b.date) return true;
    const bookingDate = new Date(b.date);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return bookingDate >= yesterday;
  });

  // Other active bookings (excluding the next booking)
  const otherActiveBookings = activeBookings.filter((b) => b.id !== nextBooking?.id);

  // Check if booking is expired (past date but still confirmed/pending)
  const isExpired = (booking) => {
    if (!booking.date) return false;
    const bookingDate = new Date(booking.date);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return (
      bookingDate < yesterday &&
      (booking.status === "confirmed" || booking.status === "pending")
    );
  };

  // Called by CancelBookingModal after successful API call
  const handleCancelled = (booking) => {
    const cancelled = { ...booking, status: "cancelled" };
    setActiveBookings((prev) => prev.filter((b) => b.id !== booking.id));
    setPastBookings((prev) => [cancelled, ...prev]);
    dispatch(updateBooking(cancelled));
    setCancelSuccess(booking);
    setCancelBooking(null);
  };

  // Called by ModifyBookingModal after successful API call
  const handleSaved = () => {
    setModifyBooking(null);
    fetchBookings(); // refresh to get updated data from server
  };

  const onVenueClick = (venueId) => navigate(`/venue/${venueId}`);

  // Navigate to booking confirmation/detail page when clicking a booking
  const onBookingClick = (booking) => {
    // Don't navigate to success page for completed or cancelled bookings
    if (booking.status === "completed" || booking.status === "cancelled") return;
    navigate("/booking-success", {
      state: {
        bookingData: {
          bookingId: booking.id,
          venueId: booking.venueId,
          venueName: booking.venueName,
          venueImage: booking.venueImage,
          date: booking.date,
          time: booking.time,
          duration: booking.duration,
          partySize: booking.guestCount,
          status: booking.status,
          qrToken: booking.qrToken,
          bookingCode: booking.bookingCode,
          perksApplied: booking.perksApplied,
          location: booking.location,
        },
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-24">
      <BookingHeader />

      <div className="p-6">
        <BookingTabs
          active={activeTab}
          onChange={(tab) => { setActiveTab(tab); if (tab === "active") setActiveSubTab("reservation"); }}
          activeCount={activeBookings.length + walkInRedemptions.length}
          pastCount={pastBookings.length}
        />

        {activeTab === "active" && (
          <>
            {/* Sub-buttons: Reservation / Walk-In */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveSubTab("reservation")}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  activeSubTab === "reservation"
                    ? "bg-[#1A1A1C] text-white"
                    : "bg-[#F8F6F1] text-[#8B8680]"
                }`}
              >
                {t("Reservation")} ({activeBookings.length})
              </button>
              <button
                onClick={() => setActiveSubTab("walkin")}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  activeSubTab === "walkin"
                    ? "bg-[#1A1A1C] text-white"
                    : "bg-[#F8F6F1] text-[#8B8680]"
                }`}
              >
                {t("Walk-In")} ({walkInRedemptions.length})
              </button>
            </div>

            {activeSubTab === "reservation" ? (
              loading ? (
                <MyBookingsLoadingSkeleton />
              ) : activeBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-6">
                  <div className="w-20 h-20 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mb-6">
                    <span className="text-3xl">📋</span>
                  </div>
                  <h2
                    className="text-xl text-[#1A1A1C] mb-2"
                    style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600 }}
                  >
                    {t("No active bookings")}
                  </h2>
                  <p className="text-[#8B8680] text-center max-w-sm">
                    {t("Your upcoming bookings will appear here")}
                  </p>
                </div>
              ) : (
                <>
                  {nextBooking && (
                    <NextBookingHero
                      booking={nextBooking}
                      onBookingClick={onBookingClick}
                      onShowQR={setSelectedQR}
                    />
                  )}
                  <div className="gap-2 grid grid-cols-1 md:grid-cols-3">
                    {otherActiveBookings.map((b) => (
                      <BookingCard
                        key={b.id}
                        booking={b}
                        isExpired={isExpired(b)}
                        onVenueClick={onVenueClick}
                        onBookingClick={onBookingClick}
                        onShowQR={setSelectedQR}
                        onModify={() => setModifyBooking(b)}
                        onCancel={() => setCancelBooking(b)}
                        onWriteReview={() => setReviewBooking(b)}
                      />
                    ))}
                  </div>
                </>
              )
            ) : (
              walkInLoading ? (
                <MyBookingsLoadingSkeleton />
              ) : walkInRedemptions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-6">
                  <div className="w-20 h-20 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mb-6">
                    <span className="text-3xl">🎟️</span>
                  </div>
                  <h2
                    className="text-xl text-[#1A1A1C] mb-2"
                    style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600 }}
                  >
                    {t("No walk-in redemptions")}
                  </h2>
                  <p className="text-[#8B8680] text-center max-w-sm">
                    {t("Your walk-in perk redemptions will appear here")}
                  </p>
                </div>
              ) : (
                <div className="gap-2 grid grid-cols-1 md:grid-cols-3">
                  {walkInRedemptions.map((r) => (
                    <WalkInCard
                      key={r.id}
                      redemption={r}
                      onShowQR={setSelectedQR}
                    />
                  ))}
                </div>
              )
            )}
          </>
        )}

        {activeTab === "past" && (
          loading ? (
            <MyBookingsLoadingSkeleton />
          ) : pastBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6">
              <div className="w-20 h-20 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl">📋</span>
              </div>
              <h2
                className="text-xl text-[#1A1A1C] mb-2"
                style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600 }}
              >
                {t("No past bookings")}
              </h2>
              <p className="text-[#8B8680] text-center max-w-sm">
                {t("Your completed and cancelled bookings will appear here")}
              </p>
            </div>
          ) : (
            <div className="gap-2 grid grid-cols-1 md:grid-cols-3">
              {pastBookings.map((b) => (
                <BookingCard
                  key={b.id}
                  booking={b}
                  isExpired={isExpired(b)}
                  onVenueClick={onVenueClick}
                  onBookingClick={onBookingClick}
                  onShowQR={setSelectedQR}
                  onModify={() => setModifyBooking(b)}
                  onCancel={() => setCancelBooking(b)}
                  onWriteReview={() => setReviewBooking(b)}
                />
              ))}
            </div>
          )
        )}
      </div>

      {/* MODALS */}
      <QRModal
        isOpen={!!selectedQR}
        booking={selectedQR}
        onClose={() => setSelectedQR(null)}
        t={t}
      />

      <CancelBookingModal
        isOpen={!!cancelBooking}
        booking={cancelBooking}
        onClose={() => setCancelBooking(null)}
        onCancelled={handleCancelled}
        t={t}
      />

      <CancelSuccessModal
        isOpen={!!cancelSuccess}
        booking={cancelSuccess}
        onClose={() => setCancelSuccess(null)}
        t={t}
      />

      <ModifyBookingModal
        isOpen={!!modifyBooking}
        booking={modifyBooking}
        onClose={() => setModifyBooking(null)}
        onSaved={handleSaved}
        t={t}
      />

      <WriteReviewModal
        isOpen={!!reviewBooking}
        booking={reviewBooking}
        onClose={() => setReviewBooking(null)}
        t={t}
      />
    </div>
  );
}
