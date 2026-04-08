import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Heart, Crown, Loader2 } from "lucide-react";
import { fetchData } from "@/helpers/fetchData";
import { FlippableVenueCard } from "@/Pages/Home/components/FlippableVenueCard";
import { normalizeVenueItem } from "@/lib/venueNormalizer";

const LIMIT = 20;

// ── Card shimmer — exact same as CategoryListing's VenueCardShimmer ─────────
function FavVenueCardShimmer() {
  return (
    <div
      className="flex-shrink-0 w-[280px] md:w-[340px] h-[420px] md:h-[480px]"
      style={{ borderRadius: 24, overflow: 'hidden', border: '1px solid #EDE8DF', background: '#F8F5F0', display: 'flex', flexDirection: 'column' }}
    >
      <div className="fav-sh" style={{ width: '100%', height: 256, flexShrink: 0 }} />
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ flex: 1, marginRight: 12 }}>
            <div className="fav-sh" style={{ height: 22, width: '62%', borderRadius: 6, marginBottom: 8 }} />
            <div className="fav-sh" style={{ height: 14, width: '50%', borderRadius: 4 }} />
          </div>
          <div className="fav-sh" style={{ height: 36, width: 52, borderRadius: 12, flexShrink: 0 }} />
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <div className="fav-sh" style={{ height: 28, width: 80, borderRadius: 999 }} />
          <div className="fav-sh" style={{ height: 28, width: 96, borderRadius: 999 }} />
        </div>
        <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid #E8E3D5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="fav-sh" style={{ height: 13, width: 40, borderRadius: 4 }} />
          <div className="fav-sh" style={{ height: 13, width: 60, borderRadius: 4 }} />
        </div>
      </div>
    </div>
  );
}

function FavoritesLoadingSkeleton() {
  return (
    <div style={{ padding: '0 0 96px' }}>
      <style>{`
        @keyframes fav-sh { 0% { background-position: -600px 0; } 100% { background-position: 600px 0; } }
        .fav-sh { background: linear-gradient(90deg, #F0EBE0 25%, #E4DDD3 50%, #F0EBE0 75%); background-size: 1200px 100%; animation: fav-sh 1.5s infinite linear; }
      `}</style>

      {/* Featured section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '24px 24px 24px', }}>
        <div className="fav-sh" style={{ width: 20, height: 20, borderRadius: 5 }} />
        <div className="fav-sh" style={{ height: 22, width: 100, borderRadius: 6 }} />
      </div>
      {/* Featured horizontal scroll */}
      <div style={{ display: 'flex', gap: 24, overflowX: 'hidden', paddingBottom: 16, paddingLeft: 24, paddingRight: 24, marginBottom: 32 }}>
        {[1, 2, 3].map(i => <FavVenueCardShimmer key={i} />)}
      </div>

      {/* All Favorites section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 24px', marginBottom: 24 }}>
        <div className="fav-sh" style={{ width: 20, height: 20, borderRadius: 5 }} />
        <div className="fav-sh" style={{ height: 22, width: 120, borderRadius: 6 }} />
      </div>
      {/* Grid — same as VenueGrid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" style={{ padding: '0 24px' }}>
        {[1, 2, 3, 4, 5, 6].map(i => <FavVenueCardShimmer key={i} />)}
      </div>
    </div>
  );
}

export default function Favorites() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [venues, setVenues] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const skipRef = useRef(0);
  const hasMoreRef = useRef(true);
  const observerRef = useRef(null);

  const loadFavorites = useCallback(async (skip = 0, append = false) => {
    if (!append) setLoading(true);
    else setLoadingMore(true);
    try {
      const result = await fetchData(
        "GET",
        `/venue-favorites/me?skip=${skip}&limit=${LIMIT}`
      );
      const rawData = result?.data;
      const rawItems = Array.isArray(rawData) ? rawData : (rawData?.items || []);
      const items = rawItems.map(normalizeVenueItem);
      const apiTotal = result?.meta?.total ?? rawData?.total ?? items.length;
      setTotal(apiTotal);
      setVenues((prev) => (append ? [...prev, ...items] : items));
      skipRef.current = skip + items.length;
      hasMoreRef.current = skipRef.current < apiTotal && items.length === LIMIT;
    } catch {
      // fetchData shows toast
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites(0);
  }, [loadFavorites]);

  // Infinite scroll
  const lastCardRef = useCallback(
    (node) => {
      if (loadingMore) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreRef.current && !loadingMore) {
          loadFavorites(skipRef.current, true);
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [loadingMore, loadFavorites]
  );

  const featuredVenues = venues.filter((v) => v.is_featured);
  const otherVenues = venues.filter((v) => !v.is_featured);

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-24">
      {/* Header */}
      <div className="bg-white border-b border-[#E8E3D5] p-6 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
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
            {t("My Favorites")}
          </h1>
        </div>
        <p className="text-[#8B8680]">
          {total} {t("favorite venues")}
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <FavoritesLoadingSkeleton />
      ) : venues.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6">
          <div className="w-20 h-20 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mb-6">
            <Heart className="w-10 h-10 text-[#D4AF37]" />
          </div>
          <h2
            className="text-xl text-[#1A1A1C] mb-2"
            style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600 }}
          >
            {t("No favorites yet")}
          </h2>
          <p className="text-[#8B8680] text-center max-w-sm">
            {t("Start exploring and add venues to your favorites by tapping the heart icon")}
          </p>
        </div>
      ) : (
        <>
          {/* Featured Favorites — always horizontal scroll, same as FeaturedVenues.jsx */}
          {featuredVenues.length > 0 && (
            <div className="mb-10 py-6">
              <div className="flex items-center gap-2 mb-6 px-6">
                <Crown className="w-5 h-5 text-[#D4AF37]" />
                <h3
                  className="text-xl text-[#1A1A1C]"
                  style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600 }}
                >
                  {t("Featured")}
                </h3>
              </div>
              <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar scroll-snap-x scroll-smooth px-6">
                {featuredVenues.map((venue) => (
                  <FlippableVenueCard
                    key={venue.id}
                    venue={venue}
                    onVenueClick={(id) => navigate(`/venue/${id}`)}
                    onBookClick={(id) => navigate(`/booking/${id}`)}
                    onWalkIn={() => {}}
                    isFeatured
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Favorites grid — same as VenueGrid.jsx */}
          {otherVenues.length > 0 && (
            <div className="px-6 pb-12">
              <div className="flex items-center gap-2 mb-6">
                <Heart className="w-5 h-5 text-[#B85450] fill-[#B85450]" />
                <h3
                  className="text-xl text-[#1A1A1C]"
                  style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600 }}
                >
                  {t("All Favorites")}
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {otherVenues.map((venue, index) => {
                  const isLast = index === otherVenues.length - 1;
                  return (
                    <FlippableVenueCard
                      key={venue.id}
                      venue={venue}
                      onVenueClick={(id) => navigate(`/venue/${id}`)}
                      onBookClick={(id) => navigate(`/booking/${id}`)}
                      onWalkIn={() => {}}
                    />
                  );
                })}
              </div>
              {/* Infinite scroll sentinel */}
              <div ref={lastCardRef} />
            </div>
          )}

          {/* If all are featured, attach scroll sentinel */}
          {featuredVenues.length > 0 && otherVenues.length === 0 && (
            <div ref={lastCardRef} />
          )}

          {loadingMore && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 text-[#D4AF37] animate-spin" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
