import { Bell, Search, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useSelector(state => state.auth?.user);
  const unreadCount = useSelector(state =>
    (state.notifications?.items ?? []).filter(n => !n.isRead).length
  );

  return (
    <div className="relative overflow-hidden">
      {/* Elegant Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FDFBF7] via-[#FFFCF8] to-[#FFF8E1]">
        <div 
          className="absolute inset-0 opacity-[0.02]" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%238B8680' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`
          }} 
        />
      </div>

      <div className="relative px-6 pt-14 pb-10">
        {/* Top Bar */}
        <div className="flex items-start justify-between mb-12">
          {/* OMNIA Branding */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-12 bg-gradient-to-b from-[#9D8B7A] via-[#B5A28E] to-[#C9BAAA] rounded-full" />
              <div>
                <h1 
                  className="text-[#1A1A1C] tracking-[0.3em] text-3xl mb-1" 
                  style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, letterSpacing: '0.15em' }}
                >
                  OMNIA
                </h1>
                <p className="text-[#8B8680] text-[10px] tracking-[0.3em] uppercase font-semibold">
                  {t('home.hero.curated_experiences', 'Curated Experiences')}
                </p>
              </div>
            </div>
            {user && (
              <div className="ml-3">
                <p className="text-[#8B8680] text-xs tracking-wider mb-0.5">
                  {t('home.hero.welcome_back', 'Welcome back')}
                </p>
                <h2 
                  className="text-[#1A1A1C] text-xl" 
                  style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600 }}
                >
                  {user.full_name || ''}
                </h2>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(user ? "/profile/notifications" : "/SignIn")}
              className="relative p-3 bg-white/80 backdrop-blur-sm hover:bg-white rounded-2xl transition-all duration-300 shadow-sm border border-[#E8E3D5] cursor-pointer"
            >
              <Bell className="w-5 h-5 text-[#8B8680]" />
              {user && unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-gradient-to-br from-[#D4AF37] to-[#CD7F32] rounded-full shadow-md ring-2 ring-white" />
              )}
            </button>
            <button
              onClick={() => navigate(user ? "/profile" : "/SignIn")}
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md border border-[#E8E3D5] cursor-pointer overflow-hidden"
            >
              {user?.profile_picture_url ? (
                <img
                  src={user.profile_picture_url}
                  alt={user.full_name || "Profile"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <span
                className="w-full h-full bg-gradient-to-br from-[#9D8B7A] via-[#B5A28E] to-[#C9BAAA] items-center justify-center text-white font-semibold tracking-wide text-sm"
                style={{ display: user?.profile_picture_url ? "none" : "flex" }}
              >
                {user?.full_name
                  ? (() => {
                      const parts = user.full_name.trim().split(/\s+/);
                      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
                      if (parts[0]?.length > 1) return (parts[0][0] + parts[0][1]).toUpperCase();
                      return parts[0]?.[0]?.toUpperCase() || "U";
                    })()
                  : "GO"}
              </span>
            </button>
          </div>
        </div>
        
        {/* Luxury Search Experience */}
        <div className="relative">
          {/* Decorative Elements - Subtle */}
          <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-[#E8E3D5] rounded-tl-2xl" />
          <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-[#E8E3D5] rounded-br-2xl" />
          
          <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl border-2 border-[#E8E3D5] shadow-xl overflow-hidden">
            {/* Top accent line - subtle */}
            <div className="h-1 bg-gradient-to-r from-transparent via-[#E8E3D5] to-transparent" />
            
            <div className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-[#F8F6F1] flex items-center justify-center border border-[#E8E3D5]">
                  <Search className="w-5 h-5 text-[#8B8680]" />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    readOnly
                    onClick={() => navigate('/venue-map', { state: { focusSearch: true } })}
                    placeholder={t('home.hero.search_placeholder', 'Discover exceptional venues...')}
                    className="w-full outline-none bg-transparent text-[#1A1A1C] placeholder:text-[#8B8680]/60 text-base cursor-pointer"
                    style={{ fontFamily: 'Cormorant Garamond, serif' }}
                  />
                </div>
                <button
                  onClick={() => navigate('/venue-map')}
                  className="flex items-center gap-2 px-3 py-2 bg-[#F8F6F1] rounded-xl border border-[#E8E3D5] hover:border-[#D4AF37]/50 hover:bg-[#FFFDF5] transition-all cursor-pointer active:scale-95"
                >
                  <MapPin className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-[#5C5850] text-sm font-semibold">
                    {t('home.hero.location', 'Beirut')}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
