import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { logout } from "@/store/slices/AuthSlice";
import { useSelector } from "react-redux";
import { Home, Calendar, User, Globe, LogOut, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { changeLanguage } from "@/i18n";

export default function TopNav() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const profileRef = useRef(null);
  const langRef = useRef(null);
  // Redux user state
  const user = useSelector(state => state.auth?.user);
  const dispatch = useDispatch();

  const items = [
    { id: "home", icon: Home, label: t("Home"), path: "/home" },
    { id: "bookings", icon: Calendar, label: t("Bookings"), path: "/bookings" },
  ];

  const currentLang = i18n.language || "en";

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (langRef.current && !langRef.current.contains(event.target)) {
        setIsLangOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageChange = async (lang) => {
    await changeLanguage(lang);
    setIsLangOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    dispatch(logout());
    toast.success("You have been logged out.");
    navigate("/home");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-gold-primary/15 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 z-50 shadow-lg">
      <div className="grid grid-cols-3 items-center max-w-7xl mx-auto w-full">
        {/* Left - empty spacer */}
        <div />

        {/* Center - Navigation Items (Desktop) */}
        <div className="hidden md:flex items-center justify-center gap-6 lg:gap-8">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1 relative transition-all duration-300 group/nav cursor-pointer ${
                  isActive
                    ? "text-gold-primary"
                    : "text-luxury-gray hover:text-gold-primary"
                }`}
              >
                {isActive && (
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-gold-primary to-gold-secondary rounded-full shadow-md animate-pulse" />
                )}

                <div className={`p-2 rounded-lg transition-all duration-300 ${
                  isActive 
                    ? "bg-gold-primary/10" 
                    : "group-hover/nav:bg-gold-primary/5"
                }`}>
                  <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 1.5} />
                </div>

                <span className="uppercase tracking-wider font-semibold text-[10px]">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Section - Language, Profile */}
        <div className="flex items-center justify-end gap-2 sm:gap-4">
{/* Language Switcher */}
          <div ref={langRef} className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-luxury-gray hover:text-gold-primary hover:bg-gold-primary/5 transition-all duration-300 cursor-pointer"
            >
              <Globe className="w-5 h-5" />
              <span className="hidden sm:block text-sm font-semibold uppercase">
                {currentLang}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isLangOpen ? "rotate-180" : ""}`} />
            </button>

            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-gold-primary/10 overflow-hidden animate-in fade-in slide-in-from-top-5 duration-200">
                <button
                  onClick={() => handleLanguageChange("en")}
                  className={`w-full px-4 py-3 text-left text-sm hover:bg-gold-primary/5 transition-colors cursor-pointer ${
                    currentLang === "en" ? "bg-gold-primary/10 text-gold-primary font-semibold" : "text-luxury-gray"
                  }`}
                >
                  🇬🇧 English
                </button>
                <button
                  onClick={() => handleLanguageChange("ar")}
                  className={`w-full px-4 py-3 text-left text-sm hover:bg-gold-primary/5 transition-colors cursor-pointer ${
                    currentLang === "ar" ? "bg-gold-primary/10 text-gold-primary font-semibold" : "text-luxury-gray"
                  }`}
                >
                  🇸🇦 العربية
                </button>
                <button
                  onClick={() => handleLanguageChange("fr")}
                  className={`w-full px-4 py-3 text-left text-sm hover:bg-gold-primary/5 transition-colors cursor-pointer ${
                    currentLang === "fr" ? "bg-gold-primary/10 text-gold-primary font-semibold" : "text-luxury-gray"
                  }`}
                >
                  🇫🇷 Français
                </button>
              </div>
            )}
          </div>

          {/* User Profile Dropdown - Only show if user is logged in */}
          {user && location.pathname === "/home" && (
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-luxury-gray hover:text-gold-primary hover:bg-gold-primary/5 transition-all duration-300 cursor-pointer"
              >
                {user.profile_picture_url ? (
                  <img
                    src={user.profile_picture_url}
                    alt={user.full_name || "Profile"}
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-primary to-gold-secondary items-center justify-center text-white font-semibold text-sm"
                  style={{ display: user.profile_picture_url ? "none" : "flex" }}
                >
                  {user.full_name
                    ? (() => {
                        const parts = user.full_name.trim().split(/\s+/);
                        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
                        if (parts[0]?.length > 1) return (parts[0][0] + parts[0][1]).toUpperCase();
                        return parts[0]?.[0]?.toUpperCase() || "U";
                      })()
                    : "U"}
                </div>
                <ChevronDown className={`hidden sm:block w-4 h-4 transition-transform duration-300 ${isProfileOpen ? "rotate-180" : ""}`} />
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gold-primary/10 overflow-hidden animate-in fade-in slide-in-from-top-5 duration-200">
                  <div className="px-4 py-3 border-b border-gold-primary/10">
                    <p className="text-sm font-semibold text-luxury-text">{user.full_name || "User"}</p>
                    <p className="text-xs text-luxury-gray">{user.email || ""}</p>
                  </div>
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setIsProfileOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-luxury-gray hover:bg-gold-primary/5 hover:text-gold-primary transition-colors flex items-center gap-3 cursor-pointer"
                  >
                    <User className="w-4 h-4" />
                    {t("My Profile")}
                  </button>
                  <div className="border-t border-gold-primary/10">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left text-sm text-red-500 hover:bg-red-50 transition-colors flex items-center gap-3 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      {t("Logout")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Bottom Nav Items */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gold-primary/15 px-6 py-4 z-50 shadow-lg">
          <div className="flex items-center justify-around max-w-md mx-auto">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                    isActive ? "text-gold-primary" : "text-luxury-gray"
                  }`}
                >
                  <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 1.5} />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
