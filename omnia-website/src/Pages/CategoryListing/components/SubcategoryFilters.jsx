import { Star } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useTranslation } from "react-i18next";
import { getLocalizedField } from '@/lib/localization';

export function SubcategoryFilters({ subcategories, selected, onSelect, venues = [] }) {
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  // Count venues per subcategory from real venue list (matches customer app's venueCount badge)
  const getVenueCount = (subcategoryId) => {
    if (!subcategoryId) return venues.length;
    return venues.filter((v) => v.subcategory_id === subcategoryId).length;
  };

  return (
    <div className="bg-white border-b border-[#E8E3D5] px-6 py-4">
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">

        {/* ALL chip */}
        <button
          onClick={() => onSelect(null)}
          className={`cursor-pointer px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 flex items-center gap-2 hover:-translate-y-0.5 ${
            selected === null
              ? "bg-gradient-to-r from-[#9D8B7A] to-[#B5A28E] text-white shadow-md hover:shadow-lg"
              : "bg-[#F8F6F1] text-[#8B8680] border border-[#E8E3D5] hover:border-[#9D8B7A] hover:shadow-sm"
          }`}
        >
          <Star className="w-4 h-4" strokeWidth={2.5} />
          <span>{t("all", "All")}</span>
          <span
            className={`text-xs px-1.5 py-0.5 rounded-full ${
              selected === null
                ? "bg-white/20"
                : "bg-[#9D8B7A]/10 text-[#9D8B7A]"
            }`}
          >
            {venues.length}
          </span>
        </button>

        {/* Subcategory chips — same design as customer app's SubcategoryChip */}
        {subcategories.map((sub) => {
          // API returns icon as a Lucide icon name string (e.g. "Palmtree")
          const iconName = sub.icon || sub.icon_name || '';
          const IconComponent = iconName
            ? (LucideIcons[iconName] || LucideIcons.Circle)
            : LucideIcons.Circle;

          // Use API venue_count if available, otherwise count from venue list
          const venueCount = sub.venue_count ?? sub.venueCount ?? getVenueCount(sub.id);

          // Localize: API returns name_en / name_ar / name_fr (snake_case)
          const label =
            getLocalizedField(sub, 'name', language) ||
            sub.name_en || sub.nameEn || sub.name || '';

          return (
            <button
              key={sub.id}
              onClick={() => onSelect(sub.id)}
              className={`cursor-pointer px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 flex items-center gap-2 hover:-translate-y-0.5 ${
                selected === sub.id
                  ? "bg-gradient-to-r from-[#9D8B7A] to-[#B5A28E] text-white shadow-md hover:shadow-lg"
                  : "bg-[#F8F6F1] text-[#8B8680] border border-[#E8E3D5] hover:border-[#9D8B7A] hover:shadow-sm"
              }`}
            >
              <IconComponent className="w-4 h-4" strokeWidth={2.5} />
              <span>{label}</span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  selected === sub.id
                    ? "bg-white/20"
                    : "bg-[#9D8B7A]/10 text-[#9D8B7A]"
                }`}
              >
                {venueCount}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
