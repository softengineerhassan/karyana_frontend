import React from 'react';
import { UtensilsCrossed, Sparkles, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/Shared/Card';

export function VenueMenu({ venue }) {
  const { t } = useTranslation();

  if (!venue.menuUrl) return null;

  return (
    <Card className="p-6">
      <a 
        href={venue.menuUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block relative overflow-hidden group"
      >
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              repeating-linear-gradient(45deg, #D4AF37 0px, #D4AF37 1px, transparent 1px, transparent 20px),
              repeating-linear-gradient(-45deg, #CD7F32 0px, #CD7F32 1px, transparent 1px, transparent 20px)
            `
          }} />
        </div>

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-[#D4AF37]/20 rounded-tl-2xl" />
        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-[#D4AF37]/20 rounded-br-2xl" />

        <div className="relative p-6 bg-gradient-to-br from-white via-[#FDFBF7] to-[#F8F6F1] rounded-2xl border-2 border-[#D4AF37]/25 hover:border-[#D4AF37]/50 transition-luxury hover:shadow-xl">
          {/* OMNIA watermark */}
          <div className="absolute top-4 right-4 opacity-[0.04] group-hover:opacity-[0.06] transition-luxury">
            <span className="text-[#D4AF37] tracking-[0.4em] font-light text-5xl font-serif">
              OMNIA
            </span>
          </div>

          <div className="relative flex items-center gap-4">
            {/* Icon */}
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#CD7F32] flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-luxury">
              <UtensilsCrossed className="w-8 h-8 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-[#1A1A1C] text-xl font-serif font-semibold">
                  {t('view_menu')}
                </h4>
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <p className="text-[#8B8680] text-sm">
                {t('discover_culinary', 'Discover our culinary offerings')}
              </p>
            </div>

            {/* Arrow */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:border-[#D4AF37] transition-luxury">
                <ExternalLink className="w-5 h-5 text-[#D4AF37] group-hover:text-white transition-luxury" />
              </div>
            </div>
          </div>

          {/* Bottom accent */}
          <div className="mt-4 pt-4 border-t border-[#D4AF37]/20">
            <div className="flex items-center justify-center gap-2">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#D4AF37]/40" />
              <span className="text-[#D4AF37] text-xs uppercase tracking-wider font-semibold">
                {t('full_menu_available', 'Full Menu Available')}
              </span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#D4AF37]/40" />
            </div>
          </div>
        </div>
      </a>
    </Card>
  );
}
