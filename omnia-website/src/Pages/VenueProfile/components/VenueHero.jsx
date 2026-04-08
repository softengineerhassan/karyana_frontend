import React from 'react';
import { ArrowLeft, Heart, Share2, MapPin, Star, Crown, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DynamicPerkCountdown } from '@/Pages/Home/components/DynamicPerkCountdown';
import { getLocalizedField } from '@/lib/localization';

export function VenueHero({ 
  venue, 
  selectedImage, 
  setSelectedImage, 
  isFavorite, 
  onToggleFavorite, 
  onBack,
  dynamicPerks,
  regularPerks 
}) {
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  return (
    <div className="relative h-96">
      {/* Main Image */}
      <img
        src={venue.gallery?.[selectedImage] || venue.image || venue.image_cover_url}
        alt={venue.name_en}
        className="w-full h-full object-cover"
      />
      
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent" />
      
      {/* Header Actions */}
      <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-10">
        <button 
          onClick={onBack} 
          className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white shadow-lg hover:bg-white/30 transition-luxury-fast cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleFavorite}
            className={`w-11 h-11 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg transition-luxury-fast cursor-pointer ${
              isFavorite ? 'bg-[#B85450] text-white' : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-white' : ''}`} />
          </button>
          <button className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white shadow-lg hover:bg-white/30 transition-luxury-fast cursor-pointer">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Featured Badge — only when no perks */}
      {venue.isFeatured && !dynamicPerks?.length && !regularPerks?.length && (
        <div className="absolute top-20 left-6 z-10">
          <div className="bg-gradient-to-r from-[#D4AF37] to-[#CD7F32] text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
            <Crown className="w-4 h-4" />
            <span className="uppercase tracking-wider text-xs font-bold">{t('Featured')}</span>
          </div>
        </div>
      )}

      {/* Perks Card — below action buttons, matching customer app _VenueHeader */}
      {(dynamicPerks?.length > 0 || regularPerks?.length > 0) && (() => {
        const allPerks = [...(dynamicPerks || []), ...(regularPerks || [])];
        const boostCount = (dynamicPerks || []).length;
        const hasExclusive = (regularPerks || []).length > 0;
        const activeCount = boostCount + (hasExclusive ? 1 : 0);
        const earliestExpiry = allPerks
          .map(p => p.boost_end_date || p.boostEndDate || p.end_date || p.endDate)
          .filter(Boolean)
          .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0];

        return (
          <div className="absolute top-20 left-4 right-4 z-10">
            {/* <div className="bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl border border-[#D4AF37]/40 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              </div>

            
              <div className="flex-1 min-w-0">
                <p className="text-[#1A1A1C] text-[10px] uppercase tracking-wider font-bold leading-none mb-0.5">
                  {t('exclusive_perks', 'Exclusive Perks')}
                </p>
                <p className="text-[#8B8680] text-[11px]">
                  {activeCount} {t('active', 'Active')}
                </p>
              </div>

              {earliestExpiry && (
                <DynamicPerkCountdown endDate={earliestExpiry} compact />
              )}
            </div> */}
          </div>
        );
      })()}

      {/* Venue Info Overlay - Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h1
              className="text-white mb-2 text-4xl drop-shadow-lg font-serif font-semibold"
            >
              {getLocalizedField(venue, 'name', language)}
            </h1>
            <p className="text-white/90 flex items-center gap-2 drop-shadow-md text-lg">
              <MapPin className="w-5 h-5" />
              {getLocalizedField(venue, 'address', language)}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-3 rounded-2xl border-2 border-white/30 shadow-lg">
            <Star className="w-6 h-6 text-[#FFD700] fill-[#FFD700] drop-shadow-md" />
            <span className="text-white font-semibold text-xl drop-shadow-md">{venue.rating ?? 0}</span>
          </div>
        </div>

        {/* Image Indicators */}
        {venue.gallery && venue.gallery.length > 1 && (
          <div className="flex gap-2 justify-center">
            {venue.gallery.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === selectedImage ? 'bg-white w-8' : 'bg-white/50 w-1.5'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
