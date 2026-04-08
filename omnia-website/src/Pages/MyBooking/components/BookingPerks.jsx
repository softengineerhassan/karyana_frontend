import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function BookingPerks({ perks }) {
  const { t } = useTranslation();
  if (!perks.length) return null;

  return (
    <div className="p-3 bg-[#D4AF37]/5 rounded-2xl border">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-[#D4AF37]" />
        <p className="text-xs font-semibold">{t("Included Perks")}</p>
      </div>

      <div className="space-y-1">
        {perks.map((p, i) => (
          <div key={i}>
            <p className="text-sm font-semibold text-[#D4AF37]">
              {p.title}
            </p>
            <p className="text-xs text-[#5C5850]">
              {p.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
