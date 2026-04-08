import { FlippableVenueCard } from "@/Pages/Home/components/FlippableVenueCard";
import { Crown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { normalizeVenueItem } from "@/lib/venueNormalizer";

export function FeaturedVenues({ venues, onVenueClick, onBookClick, onWalkIn }) {
  const { t } = useTranslation();

  if (!venues.length) return null;

  return (
    <div className="mb-10 py-6">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-6 px-6">
        <Crown className="w-5 h-5 text-[#D4AF37]" />
        <h3
          className="text-xl text-[#1A1A1C]"
          style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600 }}
        >
          {t("featured")}
        </h3>
      </div>

      {/* Always horizontal scroll — same as InfiniteCarousel on Home */}
      <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar scroll-snap-x scroll-smooth px-6">
        {venues.map((v) => (
          <FlippableVenueCard
            key={v.id ?? v.venue?.id}
            venue={normalizeVenueItem(v)}
            onVenueClick={onVenueClick}
            onBookClick={onBookClick}
            onWalkIn={onWalkIn}
            isFeatured
          />
        ))}
      </div>
    </div>
  );
}
