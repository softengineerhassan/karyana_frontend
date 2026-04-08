import { FlippableVenueCard } from "@/Pages/Home/components/FlippableVenueCard";
import { TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { normalizeVenueItem } from "@/lib/venueNormalizer";

export function VenueGrid({ venues, ...props }) {
  const { t } = useTranslation();

  if (!venues.length) return null;

  return (
    <div className="px-6 pb-12">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-[#5C5850]" />
        <h3
          className="text-xl text-[#1A1A1C]"
          style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600 }}
        >
          {t("all_venues")}
        </h3>
      </div>

      {/* Grid layout - 4 columns on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {venues.map((v) => (
          <FlippableVenueCard
            key={v.id ?? v.venue?.id}
            venue={normalizeVenueItem(v)}
            {...props}
          />
        ))}
      </div>
    </div>
  );
}
