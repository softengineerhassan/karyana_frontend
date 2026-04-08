import React from 'react';
import { Sparkles, Users, Crown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/Shared/Card';
import { getLocalizedField } from '@/lib/localization';

export function VenueResources({ venue, selectedResource, onSelect }) {
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  if (!venue.resources || venue.resources.length === 0) return null;

  return (
    <Card className="p-0">
      <div className="p-6 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37]/10 to-[#CD7F32]/10 border border-[#D4AF37]/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div className="flex-1">
            <h4 className="text-[#1A1A1C] text-xl font-serif font-semibold">
              {venue.categoryId === 'sports' 
                ? t('premium_courts', 'Premium Courts & Facilities')
                : t('seating_options')}
            </h4>
            <p className="text-[#8B8680] text-xs mt-0.5">
              {t('select_view_details', 'Select to view details')}
            </p>
          </div>
        </div>
        
        {/* Grid Layout - 2 columns for sports, 1 for restaurants */}
        <div className={`grid gap-5 ${venue.categoryId === 'sports' ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {venue.resources.map((resource) => (
            <button
              key={resource.id}
              onClick={() => onSelect(resource.id === selectedResource ? null : resource.id)}
              className={`relative overflow-hidden rounded-3xl transition-all text-left group cursor-pointer ${
                selectedResource === resource.id
                  ? 'ring-3 ring-[#D4AF37] ring-offset-2 shadow-2xl scale-[1.02]'
                  : 'hover:shadow-xl hover:scale-[1.01]'
              }`}
            >
              {/* Luxury Card Container */}
              <div className="relative bg-white border-2 border-[#E8E3D5] rounded-3xl overflow-hidden">
                {/* Image Section */}
                <div className="relative h-64 overflow-hidden">
                  {(resource.image || resource.image_cover_url) ? (
                    <>
                      <img
                        src={resource.image || resource.image_cover_url}
                        alt={resource.name_en || resource.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 ease-out"
                      />
                      {/* Gradient overlays */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-90" />
                      <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 via-transparent to-[#CD7F32]/10" />
                      
                      {/* Selection indicator */}
                      {selectedResource === resource.id && (
                        <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/20 to-[#CD7F32]/20 animate-pulse" />
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#F8F6F1] to-[#E8E3D5]" />
                  )}
                  
                  {/* Premium Badge */}
                  {(resource.isPremium || resource.is_featured) && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#CD7F32] rounded-full shadow-2xl border-2 border-white/30 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                          <Crown className="w-4 h-4 text-white" />
                          <span className="text-white text-xs uppercase tracking-[0.15em] font-bold">
                            {t('premium')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Selection Badge */}
                  {selectedResource === resource.id && (
                    <div className="absolute top-4 left-4 z-10">
                      <div className="w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center border-2 border-[#D4AF37]">
                        <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                      </div>
                    </div>
                  )}
                  
                  {/* Title Overlay - Bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h5 className="text-white text-2xl mb-2 drop-shadow-2xl font-serif font-semibold">
                      {getLocalizedField(resource, 'name', language)}
                    </h5>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white/95 drop-shadow-lg">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-semibold">
                          {t('capacity')}: {resource.capacity}
                        </span>
                      </div>
                      {(resource.price_per_hour || resource.priceModifier) && (
                        <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                          <span className="text-white font-bold text-sm drop-shadow-lg">
                            {resource.price_per_hour
                              ? `$${resource.price_per_hour}/hr`
                              : `+$${resource.priceModifier}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Details Section - Below Image */}
                {resource.amenities && resource.amenities.length > 0 && (
                  <div className="p-4 bg-gradient-to-b from-[#FDFBF7] to-white border-t border-[#E8E3D5]">
                    <div className="flex flex-wrap gap-2">
                      {resource.amenities.slice(0, 4).map((amenity, idx) => (
                        <div 
                          key={idx}
                          className="px-3 py-1.5 bg-white rounded-full border border-[#E8E3D5] shadow-sm"
                        >
                          <span className="text-[#5C5850] text-xs font-semibold">
                            {typeof amenity === 'object' && amenity !== null ? amenity.name : amenity}
                          </span>
                        </div>
                      ))}
                      {resource.amenities.length > 4 && (
                        <div className="px-3 py-1.5 bg-gradient-to-r from-[#D4AF37]/10 to-[#CD7F32]/10 rounded-full border border-[#D4AF37]/20">
                          <span className="text-[#D4AF37] text-xs font-bold">
                            +{resource.amenities.length - 4} {t('more', 'more')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
