import React from 'react';
import { X, Sparkles, Calendar, Zap, Flame, Gift } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { getLocalizedField } from '@/lib/localization';
import { isBoostPerk } from '@/lib/perkUtils';

export function PerkActionModal({
  isOpen,
  onClose,
  perk,
  venueName,
  venueNameAr,
  venueNameFr,
  onWalkIn,
  onBookNow,
  isInCard = false
}) {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const user = useSelector(state => state.auth?.user);
  const navigate = useNavigate();

  if (!isOpen || !perk) return null;

  const isDynamic = isBoostPerk(perk);

  // In-card modal (for flippable cards)
  if (isInCard) {
    return (
      <div 
        className="absolute inset-0 z-50 flex items-center justify-center rounded-3xl overflow-hidden"
        style={{ 
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)'
        }}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal Container - fits within card */}
        <div className="relative w-[92%] max-h-[94%] bg-background rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          
          {/* Header Section */}
          <div className="relative p-4 pb-2">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-luxury-card border border-luxury-border flex items-center justify-center hover:bg-background transition-all shadow-sm z-10 cursor-pointer"
            >
              <X className="w-3.5 h-3.5 text-luxury-text-dim" />
            </button>
            
            {/* Icon Badge */}
            <div className="flex justify-center mb-3">
              <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#CD7F32] flex items-center justify-center shadow-lg">
                {isDynamic ? (
                  <Flame className="w-6 h-6 text-white" />
                ) : (
                  <Gift className="w-6 h-6 text-white" />
                )}
              </div>
            </div>
            
            <h2 className="text-foreground text-center text-base px-6 font-serif font-bold leading-tight">
              {t('perk_modal.question')}
            </h2>
          </div>
          
          {/* Content Body - Scrollable */}
          <div className="p-4 pt-2 overflow-y-auto custom-scrollbar flex-1">
            {/* Perk Info Card */}
            <div className="mb-4 p-3 bg-[#FAF8F3] rounded-xl border border-[#E8E3D5] relative overflow-hidden">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#F5F0E6] border border-[#E8E3D5] flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#8B8680] text-[9px] uppercase tracking-widest font-semibold mb-0.5">
                    {t('perk_modal.at')} {getLocalizedField({ name: venueName, nameAr: venueNameAr, nameFr: venueNameFr }, 'name', language)}
                  </p>
                  <h3 className="text-[#1A1A1C] font-serif text-sm font-semibold mb-0.5">
                    {getLocalizedField(perk, 'title', language)}
                  </h3>
                  <p className="text-[#8B8680] text-xs leading-relaxed line-clamp-2">
                    {getLocalizedField(perk, 'description', language)}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              {/* Walk-In Option */}
              <button onClick={onWalkIn} className="w-full group cursor-pointer">
                <div className="relative overflow-hidden rounded-xl border-2 border-[#D4AF37] bg-white p-3 transition-all duration-300 ease-out group-hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#D4AF37] flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <h4 className="text-[#1A1A1C] font-semibold text-sm">
                        {t('perk_modal.walk_in')}
                      </h4>
                      <p className="text-[#8B8680] text-[10px] leading-tight mt-0.5 line-clamp-1">
                        {t('perk_modal.walk_in_desc')}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full border-2 border-[#D4AF37] flex items-center justify-center transition-all duration-300 group-hover:bg-[#D4AF37] flex-shrink-0">
                      <span className="text-[#D4AF37] text-sm transition-colors duration-300 group-hover:text-white">→</span>
                    </div>
                  </div>
                </div>
              </button>

              {/* Book Now Option */}
              <button onClick={() => {
                if (!user) {
                  navigate('/SignIn');
                  return;
                }
                onBookNow();
              }} className="w-full group cursor-pointer">
                <div className="relative overflow-hidden rounded-xl border-2 border-[#E8E3D5] bg-white p-3 transition-all duration-300 ease-out group-hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <h4 className="text-[#1A1A1C] font-semibold text-sm">
                        {t('perk_modal.book_now')}
                      </h4>
                      <p className="text-[#8B8680] text-[10px] leading-tight mt-0.5 line-clamp-1">
                        {t('perk_modal.book_now_desc')}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full border-2 border-[#E8E3D5] flex items-center justify-center transition-all duration-300 group-hover:bg-[#D4AF37] group-hover:border-[#D4AF37] flex-shrink-0">
                      <span className="text-[#D4AF37] text-sm transition-colors duration-300 group-hover:text-white">→</span>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full-screen modal (original behavior for other use cases)
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-xl bg-background rounded-t-3xl sm:rounded-3xl shadow-2xl transform transition-all duration-500 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-10" style={{ maxHeight: '85vh' }}>
        
        {/* Header Section */}
        <div className="relative p-6 pb-2">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-luxury-card border border-luxury-border flex items-center justify-center hover:bg-background transition-all shadow-sm z-10 cursor-pointer"
          >
            <X className="w-4 h-4 text-luxury-text-dim" />
          </button>
          
          {/* Icon Badge */}
          <div className="flex justify-center mb-4">
            <div className="relative w-16 h-16 rounded-full bg-gold-gradient flex items-center justify-center shadow-lg">
              {isDynamic ? (
                <Flame className="w-8 h-8 text-white" />
              ) : (
                <Gift className="w-8 h-8 text-white" />
              )}
              {/* Floating Sparkles decoration */}
              <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-gold-primary animate-pulse" />
            </div>
          </div>
          
          <h2 className="text-foreground text-center text-xl px-10 font-serif font-bold leading-tight">
            {t('perk_modal.question')}
          </h2>
        </div>
        
        {/* Content Body */}
        <div className="p-6 pt-2">
          {/* Perk Info Card */}
          <div className="mb-6 p-4 bg-[#FAF8F3] rounded-2xl border border-[#E8E3D5] relative overflow-hidden">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F5F0E6] border border-[#E8E3D5] flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#8B8680] text-[10px] uppercase tracking-widest font-semibold mb-0.5">
                  {t('perk_modal.at')} {getLocalizedField({ name: venueName, nameAr: venueNameAr, nameFr: venueNameFr }, 'name', language)}
                </p>
                <h3 className="text-[#1A1A1C] font-serif text-base font-semibold mb-1">
                  {getLocalizedField(perk, 'title', language)}
                </h3>
                <p className="text-[#8B8680] text-sm leading-relaxed">
                  {getLocalizedField(perk, 'description', language)}
                </p>
              </div>
            </div>
            
            {perk.value && (
              <div className="mt-3 flex items-center gap-2 px-5 py-2 bg-white rounded-xl border border-[#E8E3D5] w-full">
                <Zap className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-[#1A1A1C] font-semibold text-sm">{perk.value}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Walk-In Option (Gold Border & Filled Icons) */}
            <button onClick={onWalkIn} className="w-full group cursor-pointer">
              <div className="relative overflow-hidden rounded-2xl border-2 border-[#D4AF37] bg-white p-4 transition-all duration-300 ease-out group-hover:scale-[1.03] group-hover:shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#D4AF37] flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="text-[#1A1A1C] font-semibold text-base">
                      {t('perk_modal.walk_in')}
                    </h4>
                    <p className="text-[#8B8680] text-[12px] leading-tight mt-0.5">
                      {t('perk_modal.walk_in_desc')}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-[#D4AF37] flex items-center justify-center transition-all duration-300 group-hover:bg-[#D4AF37]">
                    <span className="text-[#D4AF37] text-lg transition-colors duration-300 group-hover:text-white">→</span>
                  </div>
                </div>
              </div>
            </button>

            {/* Book Now Option (Subtle Border) */}
            <button onClick={onBookNow} className="w-full group cursor-pointer">
              <div className="relative overflow-hidden rounded-2xl border-2 border-[#E8E3D5] bg-white p-4 transition-all duration-300 ease-out group-hover:scale-[1.03] group-hover:shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="text-[#1A1A1C] font-semibold text-base">
                      {t('perk_modal.book_now')}
                    </h4>
                    <p className="text-[#8B8680] text-[12px] leading-tight mt-0.5">
                      {t('perk_modal.book_now_desc')}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-[#E8E3D5] flex items-center justify-center transition-all duration-300 group-hover:bg-[#D4AF37] group-hover:border-[#D4AF37]">
                    <span className="text-[#D4AF37] text-lg transition-colors duration-300 group-hover:text-white">→</span>
                  </div>
                </div>
              </div>
            </button>
          </div>

          <p className="mt-4 text-center text-luxury-gray text-[10px] italic">
            {t('perk_modal.note')}
          </p>
        </div>
      </div>
    </div>
  );
}