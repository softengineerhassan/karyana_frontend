import React from 'react';
import { Clock, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Map API price_range string to dollar signs (same as customer app's mapPriceRange)
function formatPriceRange(priceRange) {
  if (!priceRange) return '$$';
  const str = priceRange.toString().toLowerCase();
  if (str === 'budget') return '$';
  if (str === 'moderate') return '$$';
  if (str === 'upscale') return '$$$';
  if (str === 'luxury') return '$$$$';
  // Already dollar signs — return as-is
  return priceRange;
}

function getPriceLevel(formatted) {
  if (formatted === '$') return 1;
  if (formatted === '$$') return 2;
  if (formatted === '$$$') return 3;
  return 4;
}

export function VenueQuickInfo({ venue }) {
  const { t } = useTranslation();

  // Find today's operating hours from the array
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayKey = days[new Date().getDay()];
  const todayHours = (venue.operatingHours || venue.operating_hours || [])
    .find(h => h.day_of_week?.toLowerCase() === todayKey);
  const isOpen = todayHours?.is_open === true;

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
      {/* Price Range */}
      <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-white rounded-xl border-2 border-[#E8E3D5] shadow-sm">
        <span className="text-[#5C5850] font-semibold text-lg" style={{ letterSpacing: '1px' }}>
          {(() => {
            const formatted = formatPriceRange(venue.priceRange || venue.pricing?.price_range || venue.price_range);
            const level = getPriceLevel(formatted);
            return (
              <>
                {'$'.repeat(level)}
                <span className="opacity-30">{'$'.repeat(4 - level)}</span>
              </>
            );
          })()}
        </span>
      </div>

      {/* Reviews */}
      <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-white rounded-xl border-2 border-[#E8E3D5] shadow-sm">
        <Users className="w-4 h-4 text-[#D4AF37]" />
        <span className="text-[#5C5850] text-sm font-semibold">
          {venue.reviewCount ?? venue.total_reviews ?? 0} {t('reviews', 'Reviews')}
        </span>
      </div>

      {/* Open/Closed Status */}
      <div className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border-2 shadow-sm ${
        isOpen
          ? 'bg-[#4A7C2C]/10 border-[#4A7C2C]/25'
          : 'bg-[#B85450]/10 border-[#B85450]/25'
      }`}>
        <Clock className={`w-4 h-4 ${isOpen ? 'text-[#4A7C2C]' : 'text-[#B85450]'}`} />
        <span className={`text-sm font-semibold whitespace-nowrap ${isOpen ? 'text-[#4A7C2C]' : 'text-[#B85450]'}`}>
          {isOpen
            ? `${t('open_today', 'Open')} · ${todayHours.open_time} - ${todayHours.close_time}`
            : t('closed_today', 'Closed Today')
          }
        </span>
      </div>
    </div>
  );
}
