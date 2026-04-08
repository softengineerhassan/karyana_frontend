import React from "react";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "@/i18n";

const langCycle = ["en", "ar", "fr"];
const langLabels = { en: "English", ar: "العربية", fr: "Français" };
const langShort = { en: "EN", ar: "ع", fr: "FR" };

export default function LanguageSwitcher({ variant = "default" }) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const handleLanguageChange = async () => {
    const idx = langCycle.indexOf(currentLang);
    const newLang = langCycle[(idx + 1) % langCycle.length];
    await changeLanguage(newLang);
  };

  const nextLang = langCycle[(langCycle.indexOf(currentLang) + 1) % langCycle.length];

  if (variant === "minimal") {
    return (
      <button
        onClick={handleLanguageChange}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/80 border shadow-sm hover:bg-white transition-all"
        aria-label={`Switch to ${langLabels[nextLang]}`}
      >
        <Globe className="w-4 h-4 text-luxury-gray" />
        <span className="text-sm font-semibold text-luxury-text-dim uppercase">
          {langShort[nextLang]}
        </span>
      </button>
    );
  }

  if (variant === "toggle") {
    return (
      <div className="flex items-center gap-1 p-1 bg-luxury-card rounded-xl border border-luxury-border">
        {langCycle.map((lang) => (
          <button
            key={lang}
            onClick={() => currentLang !== lang && changeLanguage(lang)}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
              currentLang === lang
                ? "bg-gold-primary text-white shadow-md"
                : "text-luxury-gray hover:text-foreground"
            }`}
          >
            {langShort[lang] === "ع" ? "عربي" : langShort[lang]}
          </button>
        ))}
      </div>
    );
  }

  // Default variant
  return (
    <button
      onClick={handleLanguageChange}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/90 backdrop-blur-sm border-2 border-gold-primary/20 shadow-lg hover:border-gold-primary/40 transition-all group"
      aria-label={`Switch to ${langLabels[nextLang]}`}
    >
      <Globe className="w-5 h-5 text-gold-primary group-hover:scale-110 transition-transform" />
      <div className="flex items-center gap-1">
        <span className="text-sm font-bold text-luxury-text-dim">
          {langLabels[currentLang]}
        </span>
        <span className="text-xs text-luxury-gray">
          ({langShort[nextLang]})
        </span>
      </div>
    </button>
  );
}
