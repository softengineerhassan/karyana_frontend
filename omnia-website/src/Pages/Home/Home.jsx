import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setHomeData, isHomeDataStale } from "@/store/slices/homeSlice";
import { setNotifications, isNotificationsStale } from "@/store/slices/notificationsSlice";
import { categories } from "@/Data/mockData";
import HeroSection from "./components/HeroSection";
import ExploreSection from "./components/ExploreSection";
import FeaturedSection from "./components/FeaturedSection";
import TrendingSection from "./components/TrendingSection";
import { WalkInPerkModal } from "@/Shared/WalkInPerkModal";
import { fetchData } from "@/helpers/fetchData";
import { fixUrl } from "@/lib/venueNormalizer";

// ── Shimmer for one FlippableVenueCard (w-[280px] h-[420px] on mobile) ────
function VenueCardSkeleton() {
  return (
    <div style={{ flexShrink: 0, width: 280, height: 420, borderRadius: 24, overflow: 'hidden', border: '1px solid #EDE8DF', background: '#F8F5F0' }}>
      {/* image area h-64 */}
      <div className="home-sh" style={{ width: '100%', height: 256 }} />
      {/* content */}
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="home-sh" style={{ height: 18, width: '65%', borderRadius: 6 }} />
        <div className="home-sh" style={{ height: 13, width: '45%', borderRadius: 4 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <div className="home-sh" style={{ height: 13, width: '35%', borderRadius: 4 }} />
          <div className="home-sh" style={{ height: 13, width: '20%', borderRadius: 4 }} />
        </div>
        <div className="home-sh" style={{ height: 40, width: '100%', borderRadius: 14, marginTop: 6 }} />
      </div>
    </div>
  );
}

// ── Shimmer for one TrendingSection row card ──────────────────────────────
function TrendingRowSkeleton() {
  return (
    <div style={{ display: 'flex', background: 'white', borderRadius: 24, border: '1px solid #EDE8DF', overflow: 'hidden' }}>
      <div className="home-sh" style={{ width: 128, height: 128, flexShrink: 0 }} />
      <div style={{ flex: 1, padding: '14px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div className="home-sh" style={{ height: 16, width: '60%', borderRadius: 5, marginBottom: 8 }} />
          <div className="home-sh" style={{ height: 12, width: '42%', borderRadius: 4 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div className="home-sh" style={{ height: 12, width: '30%', borderRadius: 4 }} />
          <div className="home-sh" style={{ height: 12, width: '18%', borderRadius: 4 }} />
        </div>
      </div>
    </div>
  );
}

// ── Full home loading shimmer (FeaturedSection + TrendingSection) ─────────
function HomeLoadingSkeleton() {
  return (
    <>
      <style>{`
        @keyframes home-shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position: 600px 0; }
        }
        .home-sh {
          background: linear-gradient(90deg, #F0EBE0 25%, #E4DDD3 50%, #F0EBE0 75%);
          background-size: 1200px 100%;
          animation: home-shimmer 1.5s infinite linear;
        }
      `}</style>

      {/* ── Featured Section ── */}
      <div style={{ marginBottom: 48 }}>
        {/* Section header */}
        <div style={{ padding: '0 24px', marginBottom: 24, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div className="home-sh" style={{ height: 28, width: 160, borderRadius: 6, marginBottom: 8 }} />
            <div className="home-sh" style={{ height: 12, width: 140, borderRadius: 4 }} />
          </div>
          <div className="home-sh" style={{ height: 16, width: 60, borderRadius: 4 }} />
        </div>
        {/* Carousel row */}
        <div style={{ display: 'flex', gap: 24, paddingLeft: 24, paddingRight: 24, overflow: 'hidden' }}>
          {Array.from({ length: 10 }, (_, i) => <VenueCardSkeleton key={i} />)}
        </div>
      </div>

      {/* ── Trending Section ── */}
      <div style={{ padding: '0 24px 96px' }}>
        {/* Section header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div className="home-sh" style={{ width: 24, height: 24, borderRadius: 6 }} />
            <div className="home-sh" style={{ height: 26, width: 120, borderRadius: 6 }} />
          </div>
          <div className="home-sh" style={{ height: 12, width: 130, borderRadius: 4 }} />
        </div>
        {/* Row cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1, 2, 3, 4].map(i => <TrendingRowSkeleton key={i} />)}
        </div>
      </div>
    </>
  );
}

export default function Home() {
  const navigate = useNavigate();

  // Walk-in modal state
  const [walkInModalOpen, setWalkInModalOpen] = useState(false);
  const [walkInVenue, setWalkInVenue] = useState(null);
  const [walkInPerk, setWalkInPerk] = useState(null);

  const dispatch = useDispatch();
  const cached = useSelector((state) => state.home);
  const notificationsLastFetched = useSelector((state) => state.notifications?.lastFetched);
  const user = useSelector((state) => state.auth?.user);

  // API venues state — seeded from Redux cache for instant render
  const [featuredVenues, setFeaturedVenues] = useState(cached.featuredVenues);
  const [trendingVenues, setTrendingVenues] = useState(cached.trendingVenues);
  const [loading, setLoading] = useState(cached.featuredVenues.length === 0);
  const [error, setError] = useState(null);

  const mapPriceRange = (value) => {
    if (!value) return "$$";
    const str = value.toString().toLowerCase();
    if (str === "budget") return "$";
    if (str === "moderate") return "$$";
    if (str === "upscale") return "$$$";
    if (str === "luxury") return "$$$$";
    // Already dollar signs — return as-is
    return value;
  };

  const mapVenues = (data) => {
    // Handle both { items: [...] } and direct array responses
    const items = Array.isArray(data) ? data : (data?.items || data || []);
    if (!Array.isArray(items)) return [];

    return items.map((item) => {
      // Support both nested { venue: {...} } and flat structure
      const v = item.venue || item;
      const ratings = item.ratings_summary || v.ratings_summary;
      const pricing = item.pricing || v.pricing;

      // Image URL resolution matching customer app priority (with CloudFront domain fixing)
      const imageUrl =
        fixUrl(v.image_cover_url) ||
        fixUrl(v.image_cover) ||
        fixUrl(v.image_logo_url) ||
        fixUrl(v.featured_image) ||
        fixUrl(v.image_url) ||
        fixUrl(v.card_image_url) ||
        (v.image_gallery_urls?.length ? fixUrl(v.image_gallery_urls[0]) : null);

      return {
        id: v.id,
        name: v.name_en,
        nameAr: v.name_ar,
        nameFr: v.name_fr,
        location: v.address_en,
        locationAr: v.address_ar,
        locationFr: v.address_fr,
        city: v.city_en,
        tagline: v.tagline_en,
        taglineAr: v.tagline_ar,
        taglineFr: v.tagline_fr,
        rating: ratings?.average_rating ?? null,
        reviewCount: ratings?.total_reviews ?? 0,
        priceRange: mapPriceRange(pricing?.price_range),
        image: imageUrl,
        perks: item.perks || v.perks || [],
        is_featured: v.is_featured,
        categoryId: v.category_id,
      };
    });
  };

  useEffect(() => {
    // Skip fetch if cache is fresh (< 5 min old)
    if (!isHomeDataStale(cached.lastFetched)) return;

    // Only show shimmer when there is no data yet — otherwise re-fetch silently in background
    if (featuredVenues.length === 0) setLoading(true);
    setError(null);

    Promise.all([
      fetchData("GET", "/venues/featured?skip=0&limit=100"),
      fetchData("GET", "/venues?skip=0&limit=100"),
    ])
      .then(([featuredResult, trendingResult]) => {
        const featured = mapVenues(featuredResult?.data);
        const trending = mapVenues(trendingResult?.data);
        setFeaturedVenues(featured);
        setTrendingVenues(trending);
        dispatch(setHomeData({ featuredVenues: featured, trendingVenues: trending }));
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load venues");
        setLoading(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Background-fetch notifications to keep bell dot accurate
  useEffect(() => {
    if (!user) return;
    if (!isNotificationsStale(notificationsLastFetched)) return;
    fetchData("GET", "/notifications?page=1&size=50")
      .then((result) => {
        const payload = result?.data ?? result;
        const items = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.items)
          ? payload.items
          : [];
        dispatch(setNotifications({ items, total: payload?.total ?? items.length }));
      })
      .catch(() => {});
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Find category by slug or UUID
  const onCategoryClick = (id) => {
    const category = categories.find((cat) => cat.id === id);
    if (category && category.uuid) {
      navigate(`/category/${category.uuid}`);
    } else if (
      category &&
      typeof category.id === "string" &&
      category.id.match(/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/)
    ) {
      navigate(`/category/${category.id}`);
    } else {
      navigate(`/category/${id}`);
    }
  };
  const onVenueClick = (id) => navigate(`/venue/${id}`);

  // Handle booking
  const allVenues = [...featuredVenues, ...trendingVenues];

  const onBookClick = (venueId, perk = null) => {
    if (!user) {
      navigate("/SignIn", {
        state: { redirectTo: `/booking/${venueId}`, bookingData: { perk } },
      });
      return;
    }
    const venue = allVenues.find((v) => v.id === venueId);
    if (venue) {
      navigate(`/booking/${venueId}`, {
        state: { perk, categoryId: venue.categoryId },
      });
    }
  };

  // Handle walk-in
  const onWalkIn = (venueId, perk) => {
    if (!user) {
      navigate("/SignIn", {
        state: { redirectTo: `/home` },
      });
      return;
    }
    const venue = allVenues.find((v) => v.id === venueId);
    if (venue) {
      setWalkInVenue(venue);
      setWalkInPerk(perk);
      setWalkInModalOpen(true);
    }
  };

  const handleActivatePerk = (perk) => {
    console.log("Perk activated:", perk);
  };

  return (
    <div className="min-h-screen bg-[#FFFCF8] overflow-x-hidden">
      <HeroSection />

      <ExploreSection
        categories={categories}
        onCategoryClick={onCategoryClick}
      />

      {loading && featuredVenues.length === 0 ? (
        <HomeLoadingSkeleton />
      ) : error && featuredVenues.length === 0 ? (
        <div className="px-6 py-12 text-center text-lg text-red-500">
          {error}
        </div>
      ) : (
        <>
          <FeaturedSection
            venues={featuredVenues}
            onVenueClick={onVenueClick}
            onBookClick={onBookClick}
            onWalkIn={onWalkIn}
            onViewAll={() => navigate('/venues/featured', { state: { venues: featuredVenues } })}
          />
          <TrendingSection
            venues={trendingVenues}
            onVenueClick={onVenueClick}
            onBookClick={onBookClick}
            onWalkIn={onWalkIn}
            onViewAll={() => navigate('/venues/trending', { state: { venues: trendingVenues } })}
          />
        </>
      )}

      {/* Walk-In Privilege Modal */}
      {walkInVenue && (
        <WalkInPerkModal
          isOpen={walkInModalOpen}
          onClose={() => setWalkInModalOpen(false)}
          perk={walkInPerk}
          venueName={walkInVenue.name}
          venueNameAr={walkInVenue.nameAr}
          venueNameFr={walkInVenue.nameFr}
          onActivate={handleActivatePerk}
        />
      )}
    </div>
  );
}
