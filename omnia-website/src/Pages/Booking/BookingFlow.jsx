import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getVenueDetail } from '@/Services/venueApi';
import { SportsBookingFlow } from './components/SportsBookingFlow';
import { ResortBookingFlow } from './components/ResortBookingFlow';
import { RestaurantBookingFlow } from './components/RestaurantBookingFlow';

// Category UUIDs matching customer app's new_booking_view.dart
const SPORTS_FITNESS_CATEGORY_ID = 'd421a11b-2499-41e3-b993-12b0656735ba';
const BEACH_CLUB_CATEGORY_ID = 'c9640702-86a5-46f6-8e43-8bd6c519a365';

export default function BookingFlow() {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const preSelectedResource = location.state?.resourceId || null;
  const preSelectedPerk = location.state?.perk || null;

  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!venueId) return;
    setLoading(true);
    getVenueDetail(venueId, { duration_minutes: 60, slot_step_minutes: 30 })
      .then(res => {
        if (res?.data?.success && res?.data?.data?.venue) {
          const apiData = res.data.data;
          const v = apiData.venue;

          // Deduplicate perks
          const allPerks = [...(v.perks || []), ...(apiData.perks || [])];
          const seen = new Set();
          const uniquePerks = allPerks.filter(p => {
            if (seen.has(p.id)) return false;
            seen.add(p.id);
            return true;
          });

          setVenue({
            ...v,
            image: v.image_cover_url,
            gallery: v.image_gallery_urls || [],
            rating: apiData.ratings_summary?.average_rating ?? v.average_rating ?? 0,
            reviewCount: apiData.ratings_summary?.total_reviews ?? v.total_reviews ?? 0,
            resources: (apiData.resources || []).map(r => ({
              ...r,
              image: r.image_cover_url || r.image_cover || r.imageCoverUrl || r.imageCover || r.image_url || r.imageUrl || r.image || (Array.isArray(r.images) && r.images[0]?.url) || null,
            })),
            perks: uniquePerks,
            categoryId: v.category_id,
          });
        } else {
          setVenue(null);
        }
      })
      .catch(() => setVenue(null))
      .finally(() => setLoading(false));
  }, [venueId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFCF8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-[#D4AF37] border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-[#8B8680]">{t('loading', 'Loading...')}</p>
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-[#FFFCF8] flex items-center justify-center">
        <p className="text-[#8B8680]">{t('venue_not_found', 'Venue not found')}</p>
      </div>
    );
  }

  const handleBack = () => navigate(-1);

  const handleComplete = (data) => {
    navigate('/booking-success', { state: { bookingData: data } });
  };

  // Detect category: UUID first (customer app), then name-based fallback
  const catId = (venue.category_id || venue.categoryId || '').toLowerCase();
  const catName = (venue.category_name_en || venue.category?.name_en || '').toLowerCase();

  const isSports =
    catId === SPORTS_FITNESS_CATEGORY_ID ||
    catName.includes('sport') ||
    catName.includes('fitness');

  const isBeach =
    catId === BEACH_CLUB_CATEGORY_ID ||
    catName.includes('beach') ||
    catName.includes('resort');

  const sharedProps = {
    venueId,
    venue,
    onBack: handleBack,
    onComplete: handleComplete,
    preSelectedResource,
    preSelectedPerk,
  };

  if (isSports) return <SportsBookingFlow {...sharedProps} />;
  if (isBeach) return <ResortBookingFlow {...sharedProps} />;
  return <RestaurantBookingFlow {...sharedProps} />;
}
