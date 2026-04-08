import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";

export function CategoryHeader({ title, count, onBack, onToggleFilters }) {
  const { t } = useTranslation();

  return (
    <div className="bg-white border-b border-[#E8E3D5] p-6 sticky top-0 z-20 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="text-[#8B8680] hover:text-[#1A1A1C]"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <button
          onClick={onToggleFilters}
          className="flex items-center gap-2 text-[#8B8680]"
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span className="text-sm font-semibold">
            {t("Filters")}
          </span>
        </button>
      </div>

      <h1
        className="text-3xl text-[#1A1A1C]"
        style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600 }}
      >
        {title}
      </h1>

      <p className="text-[#8B8680] mt-1">
        {count} {t("venues available")}
      </p>
    </div>
  );
}
