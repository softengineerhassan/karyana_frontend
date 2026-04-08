import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setVenueDetail, isVenueDetailStale } from '@/store/slices/venueDetailSlice';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Heart } from 'lucide-react';
import { getVenueDetail } from '@/Services/venueApi';
import { fixUrl } from '@/lib/venueNormalizer';
import { useFavorites } from '@/hooks/useFavorites';

import { VenueHero } from './components/VenueHero';
import { VenueQuickInfo } from './components/VenueQuickInfo';
import { VenuePerks } from './components/VenuePerks';
import { VenueResources } from './components/VenueResources';
import { VenueAmenities } from './components/VenueAmenities';
import { VenueGallery } from './components/VenueGallery';
import { VenueContact } from './components/VenueContact';
import { VenueDescription } from './components/VenueDescription';
import { VenueMenu } from './components/VenueMenu';
import { VenueReviews } from './components/VenueReviews';
import { VenueStickyActions } from './components/VenueStickyActions';
import { WalkInPerkModal } from '@/Shared/WalkInPerkModal';
import { isBoostPerk as isBoostPerkCheck, isBoostActive } from '@/lib/perkUtils';
import { PerkActionModal } from '@/Pages/Home/components/PerkActionModal';

// ── Shimmer skeleton that mirrors VenueProfile layout exactly ─────────────
function VenueProfileSkeleton() {
  return (
    <div style={{ minHeight: '100vh', background: '#FFFCF8', paddingBottom: 96 }}>
      <style>{`
        @keyframes vp-shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position: 600px 0; }
        }
        .vp-sh {
          background: linear-gradient(90deg, #F0EBE0 25%, #E4DDD3 50%, #F0EBE0 75%);
          background-size: 1200px 100%;
          animation: vp-shimmer 1.5s infinite linear;
        }
      `}</style>

      {/* ── Hero (h-96 = 384px) ── */}
      <div style={{ position: 'relative', height: 384, background: '#E4DDD3', overflow: 'hidden' }} className="vp-sh">
        {/* Top bar: back | heart + share */}
        <div style={{ position: 'absolute', top: 24, left: 24, right: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 }}>
          <div style={{ width: 44, height: 44, borderRadius: 16, background: 'rgba(255,255,255,0.25)' }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ width: 44, height: 44, borderRadius: 16, background: 'rgba(255,255,255,0.25)' }} />
            <div style={{ width: 44, height: 44, borderRadius: 16, background: 'rgba(255,255,255,0.25)' }} />
          </div>
        </div>

        {/* Bottom: venue name, address, rating badge, image dots */}
        <div style={{ position: 'absolute', bottom: 24, left: 24, right: 24, zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ height: 36, width: '62%', borderRadius: 8, background: 'rgba(255,255,255,0.3)', marginBottom: 10 }} />
              <div style={{ height: 20, width: '42%', borderRadius: 6, background: 'rgba(255,255,255,0.22)' }} />
            </div>
            {/* Rating badge */}
            <div style={{ width: 68, height: 52, borderRadius: 16, background: 'rgba(255,255,255,0.22)', flexShrink: 0 }} />
          </div>
          {/* Image dot indicators */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            {[32, 6, 6, 6].map((w, i) => (
              <div key={i} style={{ width: w, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.35)' }} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Content sections ── */}
      <div style={{ padding: '24px 24px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Quick Info chips */}
        <div style={{ display: 'flex', gap: 10, overflow: 'hidden' }}>
          {[72, 110, 140].map((w, i) => (
            <div key={i} className="vp-sh" style={{ height: 40, width: w, borderRadius: 12, flexShrink: 0 }} />
          ))}
        </div>

        {/* Perks card */}
        <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid #EDE8DF', background: 'white', padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div className="vp-sh" style={{ width: 36, height: 36, borderRadius: 10 }} />
            <div className="vp-sh" style={{ height: 18, width: '45%', borderRadius: 6 }} />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {[1, 2].map(i => (
              <div key={i} className="vp-sh" style={{ flex: 1, height: 80, borderRadius: 16 }} />
            ))}
          </div>
        </div>

        {/* About / Description card */}
        <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid #EDE8DF', background: 'white', padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div className="vp-sh" style={{ width: 24, height: 24, borderRadius: 6 }} />
            <div className="vp-sh" style={{ height: 20, width: '30%', borderRadius: 6 }} />
          </div>
          {[100, 92, 75].map((w, i) => (
            <div key={i} className="vp-sh" style={{ height: 14, width: `${w}%`, borderRadius: 4, marginBottom: i < 2 ? 10 : 0 }} />
          ))}
        </div>

        {/* Contact & Hours card */}
        <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid #EDE8DF', background: 'white', padding: 24 }}>
          <div className="vp-sh" style={{ height: 20, width: '35%', borderRadius: 6, marginBottom: 16 }} />
          {[1, 2, 3].map(i => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: i < 3 ? 14 : 0 }}>
              <div className="vp-sh" style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0 }} />
              <div className="vp-sh" style={{ height: 14, width: `${[50, 40, 60][i - 1]}%`, borderRadius: 4 }} />
            </div>
          ))}
          {/* Hours rows */}
          <div style={{ marginTop: 16 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: i < 3 ? 10 : 0 }}>
                <div className="vp-sh" style={{ height: 12, width: '25%', borderRadius: 4 }} />
                <div className="vp-sh" style={{ height: 12, width: '30%', borderRadius: 4 }} />
              </div>
            ))}
          </div>
        </div>

        {/* Resources / Seating card */}
        <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid #EDE8DF', background: 'white', padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div className="vp-sh" style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0 }} />
            <div>
              <div className="vp-sh" style={{ height: 20, width: 160, borderRadius: 6, marginBottom: 6 }} />
              <div className="vp-sh" style={{ height: 12, width: 100, borderRadius: 4 }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[1, 2].map(i => (
              <div key={i} className="vp-sh" style={{ height: 180, borderRadius: 24 }} />
            ))}
          </div>
        </div>

        {/* Amenities card */}
        <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid #EDE8DF', background: 'white', padding: 24 }}>
          <div className="vp-sh" style={{ height: 20, width: '38%', borderRadius: 6, marginBottom: 16 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="vp-sh" style={{ height: 48, borderRadius: 16 }} />
            ))}
          </div>
        </div>

        {/* Gallery strip */}
        <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid #EDE8DF', background: 'white', padding: 24 }}>
          <div className="vp-sh" style={{ height: 20, width: '30%', borderRadius: 6, marginBottom: 16 }} />
          <div style={{ display: 'flex', gap: 10, overflow: 'hidden' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="vp-sh" style={{ width: 120, height: 80, borderRadius: 14, flexShrink: 0 }} />
            ))}
          </div>
        </div>

      </div>

      {/* ── Sticky action bar (mirrors VenueStickyActions) ── */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '14px 20px 24px', background: 'white', borderTop: '1px solid #F0EBE0', display: 'flex', gap: 12 }}>
        <div className="vp-sh" style={{ flex: 1, height: 52, borderRadius: 16 }} />
        <div className="vp-sh" style={{ flex: 2, height: 52, borderRadius: 16 }} />
      </div>
    </div>
  );
}

export default function VenueProfile() {
  const user = useSelector(state => state.auth?.user);
  const { venueId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  // Get favorite status from hook (syncs with API)
  const { isFavorite, toggleFavorite, syncFromApi } = useFavorites();
  const isVenueFavorite = venueId ? isFavorite(venueId) : false;

  // Venue detail cache from Redux
  const cachedEntry = useSelector(state => state.venueDetail?.cache?.[venueId]);
  const hasFreshCache = cachedEntry && !isVenueDetailStale(cachedEntry.fetchedAt);

  // State management
  const [venue, setVenue] = useState(hasFreshCache ? cachedEntry.data : null);
  const [loading, setLoading] = useState(!hasFreshCache);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedResource, setSelectedResource] = useState(null);
  const [walkInModalOpen, setWalkInModalOpen] = useState(false);
  const [perkActionModalOpen, setPerkActionModalOpen] = useState(false);
  const [selectedPerk, setSelectedPerk] = useState(null);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [venueId]);

  React.useEffect(() => {
    // Use cached data if fresh (< 2 min old) — avoids re-fetch on back navigation
    const cached = cachedEntry;
    if (cached && !isVenueDetailStale(cached.fetchedAt)) {
      setVenue(cached.data);
      setLoading(false);
      return;
    }

    setLoading(true);
    getVenueDetail(venueId, { duration_minutes: 60, slot_step_minutes: 30 })
      .then(res => {
        if (res?.data?.success && res?.data?.data?.venue) {
          const apiData = res.data.data;
          const v = apiData.venue;

          // Deduplicate perks by id — prioritize apiData.perks (has user-specific fields like has_walked_in)
          const allPerks = [...(apiData.perks || []), ...(v.perks || [])];
          const seenIds = new Set();
          const uniquePerks = allPerks.filter(p => {
            if (seenIds.has(p.id)) return false;
            seenIds.add(p.id);
            return true;
          });

          // Normalize into a shape all components can consume
          const normalizedVenue = {
            ...v,
            // Images — run through fixUrl so relative paths (incl. .webp) resolve to CloudFront
            image: fixUrl(v.image_cover_url),
            gallery: (v.image_gallery_urls || []).map(u => fixUrl(u)).filter(Boolean),
            // Ratings
            rating: apiData.ratings_summary?.average_rating ?? v.average_rating ?? 0,
            reviewCount: apiData.ratings_summary?.total_reviews ?? v.total_reviews ?? 0,
            ratingSummary: apiData.ratings_summary,
            // Pricing — convert API value (budget/moderate/upscale/luxury) to dollar signs
            priceRange: (() => {
              const raw = apiData.pricing?.price_range || v.price_range;
              if (!raw) return null;
              const s = raw.toLowerCase();
              if (s === 'budget') return '$';
              if (s === 'moderate') return '$$';
              if (s === 'upscale') return '$$$';
              if (s === 'luxury') return '$$$$';
              return raw;
            })(),
            pricing: apiData.pricing,
            // Contact (alias)
            phone: v.phone_number,
            // Operating hours (array)
            operatingHours: apiData.operating_hours || v.operating_hours || [],
            // Resources
            resources: (apiData.resources || []).map(r => ({
              ...r,
              image: fixUrl(r.image_cover_url) || fixUrl(r.image_cover) || fixUrl(r.imageCoverUrl) || fixUrl(r.imageCover) || fixUrl(r.image_url) || fixUrl(r.imageUrl) || fixUrl(r.image) || (Array.isArray(r.images) && fixUrl(r.images[0]?.url)) || null,
            })),
            // Perks
            perks: uniquePerks,
            // Favorites
            isFavoriteFromApi: apiData.is_favorite,
            // Featured
            isFeatured: v.is_featured,
          };

          setVenue(normalizedVenue);
          dispatch(setVenueDetail({ venueId, data: normalizedVenue }));

          // Sync favorite status from API response
          if (venueId && apiData.is_favorite !== undefined) {
            syncFromApi(venueId, apiData.is_favorite);
          }
        } else {
          setVenue(null);
        }
        setLoading(false);
      })
      .catch(() => {
        setVenue(null);
        setLoading(false);
      });
  }, [venueId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return <VenueProfileSkeleton />;
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-[#FFFCF8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#8B8680] text-lg">{t('venue_not_found', 'Venue not found')}</p>
        </div>
      </div>
    );
  }

  // Separate boost and regular perks for hero display — only show active boosts
  const dynamicPerks = venue.perks?.filter(p => isBoostPerkCheck(p) && isBoostActive(p)) || [];
  const regularPerks = venue.perks?.filter(p => !isBoostPerkCheck(p)) || [];

  // Handlers
  const handleBack = () => navigate(-1);

  const handleToggleFavorite = async () => {
    // Require login to favorite
    if (!user) {
      navigate('/SignIn', {
        state: { redirectTo: `/venue/${venueId}` },
      });
      return;
    }

    const newState = await toggleFavorite(venueId);
    if (newState === true) {
      toast.custom(
        () => (
          <div className="bg-[#1A1A1C] text-white px-6 py-4 rounded-2xl shadow-lg flex items-center gap-3 border border-[#D4AF37]/30">
            <Heart className="w-5 h-5 text-[#B85450] fill-[#B85450]" />
            <span className="font-medium">{t('Added to favorites')}</span>
          </div>
        ),
        { duration: 2000 }
      );
    } else if (newState === false) {
      toast.custom(
        () => (
          <div className="bg-[#1A1A1C] text-white px-6 py-4 rounded-2xl shadow-lg flex items-center gap-3 border border-[#D4AF37]/30">
            <Heart className="w-5 h-5 text-[#8B8680]" />
            <span className="font-medium">{t('Removed from favorites')}</span>
          </div>
        ),
        { duration: 2000 }
      );
    }
  };

  // Mirror of customer app's markPerkActivated — update local venue state after activation
  const handleActivatePerk = (activatedPerk) => {
    setVenue(prev => {
      if (!prev || !activatedPerk?.id) return prev;
      const updatedPerks = (prev.perks || []).map(p =>
        p.id === activatedPerk.id ? { ...p, has_walked_in: true } : p
      );
      return { ...prev, perks: updatedPerks };
    });
  };

  const handlePerkClick = (perk) => {
    setSelectedPerk(perk);
    setPerkActionModalOpen(true);
  };

  const handlePerkWalkIn = () => {
    if (!user) {
      navigate('/SignIn', { state: { redirectTo: window.location.pathname } });
      return;
    }
    setPerkActionModalOpen(false);
    setWalkInModalOpen(true);
  };

  const handlePerkBookNow = () => {
    setPerkActionModalOpen(false);
    if (!user) {
      navigate('/SignIn', {
        state: {
          redirectTo: `/booking/${venueId}`,
          resourceId: selectedResource,
          perk: selectedPerk
        }
      });
      return;
    }
    navigate(`/booking/${venueId}`, {
      state: {
        resourceId: selectedResource,
        perk: selectedPerk
      }
    });
  };

  const handleBookClick = () => {
    if (!user) {
      navigate('/SignIn', {
        state: {
          redirectTo: `/booking/${venueId}`,
          resourceId: selectedResource,
          perk: selectedPerk
        }
      });
      return;
    }
    navigate(`/booking/${venueId}`, {
      state: {
        resourceId: selectedResource,
        perk: selectedPerk
      }
    });
  };

  const handleWalkInClick = () => {
    if (!user) {
      navigate('/SignIn', { state: { redirectTo: window.location.pathname } });
      return;
    }
    setSelectedPerk(null);
    setWalkInModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FFFCF8] pb-24">
      {/* Hero Section */}
      <VenueHero
        venue={venue}
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
        isFavorite={isVenueFavorite}
        onToggleFavorite={handleToggleFavorite}
        onBack={handleBack}
        dynamicPerks={dynamicPerks}
        regularPerks={regularPerks}
      />

      {/* Content */}
      <div className="px-6 py-6 space-y-4">
        {/* Quick Info Bar */}
        <VenueQuickInfo venue={venue} />

        {/* Perks Section */}
        {(dynamicPerks.length > 0 || regularPerks.length > 0) && (
          <VenuePerks
            venue={venue}
            onPerkSelect={handlePerkClick}
          />
        )}

        {/* Description */}
        <VenueDescription venue={venue} />

        {/* Contact & Hours */}
        <VenueContact venue={venue} />

        {/* Menu (for restaurants) */}
        {venue.menuUrl && <VenueMenu venue={venue} />}

        {/* Resources/Seating */}
        {venue.resources && venue.resources.length > 0 && (
          <VenueResources
            venue={venue}
            selectedResource={selectedResource}
            onSelect={setSelectedResource}
          />
        )}

        {/* Amenities */}
        <VenueAmenities venue={venue} />

        {/* Gallery */}
        {venue.gallery && venue.gallery.length > 1 && (
          <VenueGallery
            venue={venue}
            selectedImage={selectedImage}
            onSelectImage={setSelectedImage}
          />
        )}

        {/* Reviews */}
        <VenueReviews venue={venue} />
      </div>

      {/* Sticky Action Buttons */}
      <VenueStickyActions
        onWalkInClick={handleWalkInClick}
        onBookClick={handleBookClick}
      />

      {/* Walk-In Perk Modal */}
      <WalkInPerkModal
        isOpen={walkInModalOpen}
        onClose={() => {
          setWalkInModalOpen(false);
          setSelectedPerk(null);
        }}
        perk={selectedPerk}
        perks={selectedPerk ? undefined : [...dynamicPerks, ...regularPerks]}
        venueName={venue.name_en}
        venueNameAr={venue.name_ar}
        venueNameFr={venue.name_fr}
        onActivate={handleActivatePerk}
      />

      {/* Perk Action Modal */}
      {selectedPerk && (
        <PerkActionModal
          isOpen={perkActionModalOpen}
          onClose={() => setPerkActionModalOpen(false)}
          perk={selectedPerk}
          venueName={venue.name_en}
          venueNameAr={venue.name_ar}
          venueNameFr={venue.name_fr}
          onWalkIn={handlePerkWalkIn}
          onBookNow={handlePerkBookNow}
        />
      )}
    </div>
  );
}
