import React from "react";
import { Home, Search, Calendar, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";

export default function BottomNav() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { id: "home", icon: Home, label: t("Home"), path: "/home" },
    { id: "search", icon: Search, label: t("Search"), path: "/search" },
    { id: "bookings", icon: Calendar, label: t("Bookings"), path: "/bookings" },
    { id: "profile", icon: User, label: t("Profile"), path: "/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gold-primary/15 px-6 py-4 z-50 shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-2 relative transition-all ${
                isActive
                  ? "text-gold-primary"
                  : "text-luxury-gray hover:text-luxury-text-dim"
              }`}
            >
              {isActive && (
                <div className="absolute -top-2 w-1.5 h-1.5 bg-gold-primary rounded-full shadow-md" />
              )}

              <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 1.5} />

              <span className="uppercase tracking-wider font-semibold text-[10px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
