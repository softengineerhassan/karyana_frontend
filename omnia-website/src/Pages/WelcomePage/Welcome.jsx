import React, { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { WelcomeBackground } from "./components/WelcomeBackground";
import { EnterButton } from "./components/EnterButton";
import { useNavigate } from "react-router-dom";

export default function Welcome({ onEnter }) {
  const [isVisible, setIsVisible] = useState(false);
  const [shimmerPosition, setShimmerPosition] = useState(0);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const isRTL = i18n.dir() === "rtl";

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
    const interval = setInterval(
      () => setShimmerPosition((p) => (p + 1) % 100),
      50
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`relative h-screen w-full flex flex-col items-center justify-center overflow-hidden ${
        isRTL ? "font-arabic" : "font-serif"
      }`}
    >
      <WelcomeBackground shimmerPosition={shimmerPosition} />

      <div
        className={`relative flex flex-col items-center px-8 transition-all duration-1000 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
      
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-7xl text-[#1A1A1C] tracking-[0.3em] mb-3 font-light">
            OMNIA
          </h1>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
          <p className="text-[#8B8680] tracking-[0.4em] mt-8 text-xs uppercase font-semibold">
            {t("welcome.tagline")}
          </p>

          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
            <span className="text-[#5C5850] text-[10px] uppercase tracking-[0.3em] font-semibold">
              {t("welcome.badge")}
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#CD7F32]" />
          </div>
        </div>

        <EnterButton onEnter={() => navigate("/home")} />

        <div className="mt-16 text-center">
          <p className="text-[#8B8680] text-xs px-12 leading-relaxed">
            <span className="font-semibold text-[#5C5850]">
              {t("welcome.no_login")}
            </span>{" "}
            {t("welcome.explore")}
            <br />
            <span className="text-[10px] opacity-60 mt-1 block">
              {t("welcome.auth_note")}
            </span>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes float { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(20px, -20px); } }
        .animate-float { animation: float 15s ease-in-out infinite; }
        .animate-float-delayed { animation: float 18s ease-in-out infinite reverse; }
      `}</style>
    </div>
  );
}
