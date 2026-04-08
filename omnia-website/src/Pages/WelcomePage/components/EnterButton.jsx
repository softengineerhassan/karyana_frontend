import React from "react";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export const EnterButton = ({ onEnter }) => {
  const { t } = useTranslation();

  return (
    <button onClick={onEnter} className="group relative overflow-hidden">
      <div className="relative bg-gold-gradient rounded-full px-12 py-5 shadow-2xl transition-all duration-500 group-hover:shadow-gold-primary/30 group-hover:scale-105 cursor-pointer">
        <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
        </div>
        <div className="relative flex items-center gap-4">
          <span className="text-white tracking-[0.3em] font-semibold text-sm uppercase">
            {t("welcome.enter")}
          </span>

          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 group-hover:translate-x-1">
            <ChevronRight className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </button>
  );
};
