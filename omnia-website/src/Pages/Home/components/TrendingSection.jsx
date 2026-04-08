import { MapPin, Star, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getLocalizedField } from "@/lib/localization";

export default function TrendingSection({ venues, onVenueClick, onViewAll }) {
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  if (!venues.length) return null;

  const getPriceLevel = (priceRange) => {
    if (priceRange === "$") return 1;
    if (priceRange === "$$") return 2;
    if (priceRange === "$$$") return 3;
    return 4;
  };

  return (
    <section className="px-6 pb-24">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3
            className="text-[#1A1A1C] tracking-tight mb-1 text-2xl"
            style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600 }}
          >
            <TrendingUp className="w-6 h-6 text-[#D4AF37] inline mr-2" />
            {t("home.trending.title", "Trending")}
          </h3>
          <p className="text-[#8B8680] uppercase tracking-[0.15em] text-xs font-semibold">
            {t("home.trending.subtitle", "Popular This Week")}
          </p>
        </div>
        <button
          onClick={onViewAll}
          className="text-[#D4AF37] hover:text-[#CD7F32] transition-all duration-300 tracking-wide text-sm font-semibold active:scale-95 mt-1"
        >
          {t('home.featured.view_all', 'View All')} →
        </button>
      </div>

      <div className="grid gap-4">
        {venues.map((v) => (
          <div
            key={v.id}
            onClick={() => onVenueClick(v.id)}
            className="bg-white rounded-3xl border border-[#E8E3D5] flex overflow-hidden cursor-pointer hover:border-[#D4AF37]/40 hover:shadow-lg transition-all duration-300"
          >
            <img
              src={v.image}
              alt={getLocalizedField(v, "name", language) || v.name}
              className="w-32 h-32 object-cover flex-shrink-0"
            />
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h4
                  className="text-[#1A1A1C] mb-1 text-base"
                  style={{
                    fontFamily: "Cormorant Garamond, serif",
                    fontWeight: 600,
                  }}
                >
                  {getLocalizedField(v, "name", language) || v.name}
                </h4>
                <p className="text-sm text-[#8B8680] flex gap-1 items-center">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="line-clamp-1">
                    {getLocalizedField(v, "location", language) || v.location}
                  </span>
                </p>
              </div>
              <div className="flex items-center justify-between mt-2">
                {v.rating != null && (
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                    <span className="font-semibold text-[#1A1A1C] text-sm">
                      {Number(v.rating).toFixed(1)}
                    </span>
                    {v.reviewCount > 0 && (
                      <span className="text-[#8B8680] text-xs">
                        ({v.reviewCount})
                      </span>
                    )}
                  </span>
                )}
                <span className="text-[#5C5850] text-sm font-medium">
                  {"$".repeat(getPriceLevel(v.priceRange))}
                  <span className="opacity-30">
                    {"$".repeat(4 - getPriceLevel(v.priceRange))}
                  </span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
