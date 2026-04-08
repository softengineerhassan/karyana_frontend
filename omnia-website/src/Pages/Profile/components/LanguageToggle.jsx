import { Globe, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "@/i18n";

const langCycle = ["en", "ar", "fr"];
const langLabels = { en: "English", ar: "العربية", fr: "Français" };

export default function LanguageToggle() {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const handleToggleLanguage = async () => {
    const idx = langCycle.indexOf(currentLanguage);
    const newLang = langCycle[(idx + 1) % langCycle.length];
    await changeLanguage(newLang);
  };

  return (
    <button
      onClick={handleToggleLanguage}
      className="w-full bg-white border border-gold-primary/15 rounded-2xl p-4 flex items-center justify-between hover:border-gold-primary/40 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 bg-gold-primary/10 rounded-2xl flex items-center justify-center">
          <Globe className="w-5 h-5 text-gold-primary" />
        </div>
        <span className="font-semibold text-foreground">
          {t("Language")}: {langLabels[currentLanguage] ?? "English"}
        </span>
      </div>
      <ChevronRight className="w-5 h-5 text-luxury-gray" />
    </button>
  );
}
