import React from 'react';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function VenueStickyActions({ onWalkInClick, onBookClick }) {
  const { t } = useTranslation();

  return (
    <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/95 backdrop-blur-xl border-t border-[#E8E3D5] shadow-lg z-50">
      <div className="grid grid-cols-2 gap-4">
        {/* Walk-In Button */}
        <button
          onClick={onWalkInClick}
          className="relative overflow-hidden px-6 py-4 rounded-2xl border-2 border-[#D4AF37] bg-gradient-to-r from-[#D4AF37]/10 to-[#CD7F32]/10 hover:from-[#D4AF37]/20 hover:to-[#CD7F32]/20 transition-all duration-300 hover:scale-[1.02] shadow-md hover:shadow-lg group cursor-pointer"
        >
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-[#D4AF37] group-hover:rotate-12 transition-transform" />
            <span className="text-[#D4AF37] font-bold uppercase tracking-wider">
              {t('walk_in_button')}
            </span>
          </div>
        </button>

        {/* Book Now Button */}
        <button
          onClick={onBookClick}
          className="px-6 py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#CD7F32] text-white font-bold uppercase tracking-wider shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer"
        >
          {t('book_now')}
        </button>
      </div>
    </div>
  );
}
