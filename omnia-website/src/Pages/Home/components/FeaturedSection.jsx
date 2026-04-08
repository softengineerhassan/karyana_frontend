import { InfiniteCarousel } from "./InfiniteCarousel";
import { useTranslation } from "react-i18next";

export default function FeaturedSection({
  venues,
  onVenueClick,
  onBookClick,
  onWalkIn,
  onViewAll,
}) {
  const { t } = useTranslation();

  if (!venues.length) return null;

  return (
    <div className="mb-12">
      <div className="px-6 mb-6 flex items-center justify-between">
        <div>
          <h3
            className="text-[#1A1A1C] tracking-tight mb-1 text-2xl"
            style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600 }}
          >
            {t('home.featured.title', 'Featured')}
          </h3>
          <p className="text-[#8B8680] uppercase tracking-[0.15em] text-xs font-semibold">
            {t('home.featured.subtitle', 'Handpicked Excellence')}
          </p>
        </div>
        <button
          onClick={onViewAll}
          className="text-[#D4AF37] hover:text-[#CD7F32] transition-all duration-300 tracking-wide text-sm font-semibold active:scale-95"
        >
          {t('home.featured.view_all', 'View All')} →
        </button>
      </div>
      
      <InfiniteCarousel
        venues={venues}
        onVenueClick={onVenueClick}
        onBookClick={onBookClick}
        onWalkIn={onWalkIn}
      />
    </div>
  );
}
