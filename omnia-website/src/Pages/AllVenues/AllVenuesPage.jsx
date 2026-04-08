import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, TrendingUp, Sparkles } from 'lucide-react';
import { FlippableVenueCard } from '@/Pages/Home/components/FlippableVenueCard';
import { WalkInPerkModal } from '@/Shared/WalkInPerkModal';
import { fetchData } from '@/helpers/fetchData';
import { normalizeVenueItem } from '@/lib/venueNormalizer';
import { useSelector } from 'react-redux';

function CardSkeleton() {
  return (
    <div
      className="flex-shrink-0 w-[280px] md:w-[340px] h-[420px] md:h-[480px] rounded-3xl overflow-hidden border border-[#EDE8DF] bg-[#F8F5F0]"
    >
      <div className="av-sh w-full" style={{ height: 256 }} />
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="av-sh rounded" style={{ height: 18, width: '65%' }} />
        <div className="av-sh rounded" style={{ height: 13, width: '45%' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <div className="av-sh rounded" style={{ height: 13, width: '35%' }} />
          <div className="av-sh rounded" style={{ height: 13, width: '20%' }} />
        </div>
      </div>
    </div>
  );
}

export default function AllVenuesPage() {
  const { type } = useParams(); // 'featured' | 'trending'
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const user = useSelector((state) => state.auth?.user);

  const isFeatured = type === 'featured';

  const [venues, setVenues] = useState(location.state?.venues || []);
  const [loading, setLoading] = useState(venues.length === 0);

  // Walk-in modal
  const [walkInModalOpen, setWalkInModalOpen] = useState(false);
  const [walkInVenue, setWalkInVenue] = useState(null);
  const [walkInPerk, setWalkInPerk] = useState(null);

  useEffect(() => {
    if (venues.length > 0) return;
    setLoading(true);
    const endpoint = isFeatured
      ? '/venues/featured?skip=0&limit=100'
      : '/venues?skip=0&limit=100';
    fetchData('GET', endpoint)
      .then((res) => {
        const items = Array.isArray(res?.data)
          ? res.data
          : res?.data?.items || res?.data || [];
        setVenues(Array.isArray(items) ? items.map(normalizeVenueItem) : []);
      })
      .catch(() => setVenues([]))
      .finally(() => setLoading(false));
  }, [type]); // eslint-disable-line react-hooks/exhaustive-deps

  const onVenueClick = (id) => navigate(`/venue/${id}`);

  const onBookClick = (venueId, perk = null) => {
    if (!user) {
      navigate('/SignIn', { state: { redirectTo: `/booking/${venueId}`, bookingData: { perk } } });
      return;
    }
    const venue = venues.find((v) => v.id === venueId);
    navigate(`/booking/${venueId}`, { state: { perk, categoryId: venue?.categoryId } });
  };

  const onWalkIn = (venueId, perk) => {
    const venue = venues.find((v) => v.id === venueId);
    if (venue) {
      setWalkInVenue(venue);
      setWalkInPerk(perk);
      setWalkInModalOpen(true);
    }
  };

  const title = isFeatured
    ? t('home.featured.title', 'Featured')
    : t('home.trending.title', 'Trending');
  const subtitle = isFeatured
    ? t('home.featured.subtitle', 'Handpicked Excellence')
    : t('home.trending.subtitle', 'Popular This Week');
  const Icon = isFeatured ? Sparkles : TrendingUp;

  return (
    <div className="min-h-screen bg-[#FFFCF8]">
      <style>{`
        @keyframes av-shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
        .av-sh {
          background: linear-gradient(90deg, #F0EBE0 25%, #E4DDD3 50%, #F0EBE0 75%);
          background-size: 1200px 100%;
          animation: av-shimmer 1.5s infinite linear;
        }
      `}</style>

      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-[#E8E3D5]/40">
        <div className="px-4 py-4 max-w-5xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-[#F8F5F0] flex items-center justify-center hover:bg-[#EDE8DF] transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-[#5C5850]" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Icon className="w-5 h-5 text-[#D4AF37]" />
              <h1
                className="text-[#1A1A1C] text-xl truncate"
                style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600 }}
              >
                {title}
              </h1>
              {!loading && venues.length > 0 && (
                <span className="text-[#8B8680] text-sm">({venues.length})</span>
              )}
            </div>
            <p className="text-[#8B8680] text-xs uppercase tracking-widest font-semibold mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-6 pb-24 px-4 max-w-5xl mx-auto">
        {loading ? (
          <div className="flex flex-wrap justify-center gap-5">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : venues.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-[#F8F5F0] flex items-center justify-center mx-auto mb-4">
              <Icon className="w-8 h-8 text-[#8B8680]" />
            </div>
            <p className="text-[#1A1A1C] font-semibold mb-1">{t('no_venues_available', 'No venues available')}</p>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-5">
            {venues.map((venue) => (
              <FlippableVenueCard
                key={venue.id}
                venue={venue}
                onVenueClick={onVenueClick}
                onBookClick={onBookClick}
                onWalkIn={onWalkIn}
                isFeatured={isFeatured}
              />
            ))}
          </div>
        )}
      </div>

      {/* Walk-in modal */}
      {walkInVenue && (
        <WalkInPerkModal
          isOpen={walkInModalOpen}
          onClose={() => setWalkInModalOpen(false)}
          perk={walkInPerk}
          venueName={walkInVenue.name}
          venueNameAr={walkInVenue.nameAr}
          venueNameFr={walkInVenue.nameFr}
          onActivate={() => {}}
        />
      )}
    </div>
  );
}
