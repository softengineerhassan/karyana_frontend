import { useTranslation } from "react-i18next";

export default function BookingTabs({
  active,
  onChange,
  activeCount,
  pastCount,
}) {
  const { t } = useTranslation();

  const tabClass = (key) =>
    `flex-1 py-3 rounded-2xl font-semibold text-sm ${
      active === key
        ? "bg-gradient-to-r from-[#D4AF37] to-[#CD7F32] text-white"
        : "bg-[#F8F6F1]"
    }`;

  return (
    <div className="flex gap-2 mb-6">
      <button onClick={() => onChange("active")} className={tabClass("active")}>
        <span dir="ltr">{t("Active")} ({activeCount})</span>
      </button>

      <button onClick={() => onChange("past")} className={tabClass("past")}>
        <span dir="ltr">{t("Past")} ({pastCount})</span>
      </button>
    </div>
  );
}
