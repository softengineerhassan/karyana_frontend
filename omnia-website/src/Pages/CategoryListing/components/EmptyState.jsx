import { useTranslation } from "react-i18next";

export function EmptyState({ onReset }) {
  const { t } = useTranslation();

  return (
    <div className="text-center py-20 px-6">
      <p className="text-[#8B8680] text-lg mb-2">{t("no_venues")}</p>
      <p className="text-[#5C5850] text-sm mb-6">{t("try_different_filter")}</p>
      <button
        onClick={onReset}
        className="px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#CD7F32] text-white rounded-full font-semibold hover:shadow-lg transition-all duration-300"
      >
        {t("view_all")}
      </button>
    </div>
  );
}
