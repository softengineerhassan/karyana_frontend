import React from 'react';
import { Sparkles, Flame, Zap, Gift, CheckCircle, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DynamicPerkCountdown, getPerkEndMs } from '@/Pages/Home/components/DynamicPerkCountdown';
import { getLocalizedField } from '@/lib/localization';
import { isBoostPerk, isBoostActive, resolveExclusivePerks } from '@/lib/perkUtils';

function getUrgencyFromMs(endMs) {
  if (isNaN(endMs)) return 'active';
  const hoursLeft = Math.floor((endMs - Date.now()) / (1000 * 60 * 60));
  if (hoursLeft < 6) return 'critical';
  if (hoursLeft < 24) return 'warning';
  return 'active';
}

const urgencyColors = {
  critical: {
    gradient: 'from-[#C77B7B] via-[#B85C5C] to-[#A64B4B]',
    badgeText: 'FINAL HOURS',
    badgeTextAr: 'ساعات أخيرة',
    badgeTextFr: 'DERNIÈRES HEURES',
  },
  warning: {
    gradient: 'from-[#FF8C42] via-[#FF6B35] to-[#E67B35]',
    badgeText: 'ENDING SOON',
    badgeTextAr: 'ينتهي قريباً',
    badgeTextFr: 'BIENTÔT TERMINÉ',
  },
  active: {
    gradient: 'from-[#D4AF37] via-[#CD7F32] to-[#C4941F]',
    badgeText: 'LIMITED OFFER',
    badgeTextAr: 'عرض محدود',
    badgeTextFr: 'OFFRE LIMITÉE',
  },
};

export function VenuePerks({ venue, onPerkSelect }) {
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  const allPerks = venue.perks || [];
  if (!allPerks.length) return null;

  const boostPerks = allPerks.filter(p => isBoostPerk(p) && isBoostActive(p));
  const rawExclusivePerks = allPerks.filter(p => !isBoostPerk(p));
  const exclusivePerks = resolveExclusivePerks(rawExclusivePerks);

  // Sorted: boost first, then exclusive
  const sortedPerks = [...boostPerks, ...exclusivePerks];
  if (!sortedPerks.length) return null;

  return (
    <div className="relative py-6">
      {/* Section Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#CD7F32] flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-[#1A1A1C] text-2xl font-serif font-semibold">
              {t('exclusive_perks', 'Exclusive Perks')}
            </h2>
            <p className="text-[#8B8680] text-xs">
              {t('exclusive_perks_subtitle', 'Your OMNIA privileges')}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {sortedPerks.map((perk, index) => {
          const isBoost = isBoostPerk(perk);
          const activated = perk.has_walked_in === true || perk.hasWalkedIn === true;
          const endMs = getPerkEndMs(perk);
          const urgency = getUrgencyFromMs(endMs);
          const colors = urgencyColors[urgency];
          const displayValue = perk.displayValue || perk.display_value || perk.value;

          if (isBoost) {
            // ── Boost Perk: Premium Gold Gradient Card ──
            return (
              <button
                key={`${perk.id}-${index}`}
                onClick={() => !activated && onPerkSelect(perk)}
                disabled={activated}
                className={`relative overflow-hidden rounded-2xl shadow-lg w-full text-left group transition-all duration-300 ${
                  activated ? 'opacity-80 cursor-default' : 'hover:shadow-xl cursor-pointer'
                }`}
              >
                {/* Gold gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} ${!activated ? 'group-hover:opacity-90' : ''} transition-opacity`} />

                {/* Star pattern overlay */}
                <div className="absolute inset-0 opacity-5" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23FFFFFF' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`
                }} />

                {!activated && (
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300" />
                )}

                <div className="relative p-5">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/30 group-hover:scale-110 transition-transform">
                        <Flame className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                        <div className="px-2 py-0.5 bg-white/25 backdrop-blur-sm rounded-full border border-white/30">
                          <span className="text-white text-[9px] uppercase tracking-wider font-bold">
                            {getLocalizedField(colors, 'badgeText', language)}
                          </span>
                        </div>
                        {index === 0 && (
                          <div className="px-2 py-0.5 bg-white/25 backdrop-blur-sm rounded-full border border-white/30">
                            <span className="text-white text-[9px] uppercase tracking-wider font-bold flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              {t('featured', 'FEATURED')}
                            </span>
                          </div>
                        )}
                      </div>
                      <h3 className="text-white text-lg mb-1 leading-tight font-serif font-semibold">
                        {getLocalizedField(perk, 'title', language)}
                      </h3>
                      <p className="text-white/90 text-sm leading-snug">
                        {getLocalizedField(perk, 'description', language)}
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {displayValue && (
                        <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/30">
                          <Zap className="w-4 h-4 text-white" />
                          <span className="text-white text-sm font-bold">{displayValue}</span>
                        </div>
                      )}
                      {!isNaN(endMs) && (
                        <DynamicPerkCountdown endMs={endMs} compact />
                      )}
                    </div>

                    {/* Activation state */}
                    {activated ? (
                      <div className="flex items-center gap-1.5 bg-[#2E7D32] px-3 py-1.5 rounded-lg border border-[#2E7D32]/60">
                        <CheckCircle className="w-3.5 h-3.5 text-white" />
                        <span className="text-white text-xs font-bold uppercase tracking-wider">
                          {t('activated', 'ACTIVATED')}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/40 group-hover:bg-white group-hover:scale-105 transition-all">
                        <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span className="text-[#1A1A1C] text-xs font-bold uppercase tracking-wider">
                          {t('tap_to_activate', 'TAP TO ACTIVATE')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          }

          // ── Exclusive Perk: Clean white card ──
          return (
            <button
              key={`${perk.id}-${index}`}
              onClick={() => !activated && onPerkSelect(perk)}
              disabled={activated}
              className={`relative overflow-hidden rounded-xl bg-white border shadow-sm w-full text-left group transition-all duration-300 ${
                activated
                  ? 'border-[#2E7D32]/25 cursor-default'
                  : 'border-[#E8E3D5] hover:shadow-md hover:border-[#D4AF37]/40 cursor-pointer'
              }`}
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-transform ${
                      activated
                        ? 'bg-[#2E7D32]/10 border border-[#2E7D32]/20'
                        : 'bg-gradient-to-br from-[#D4AF37]/10 to-[#CD7F32]/10 border border-[#D4AF37]/20 group-hover:scale-110'
                    }`}>
                      {activated
                        ? <CheckCircle className="w-5 h-5 text-[#2E7D32]" />
                        : <Gift className="w-5 h-5 text-[#D4AF37]" />
                      }
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <h4 className="text-[#1A1A1C] text-base font-serif font-semibold">
                        {getLocalizedField(perk, 'title', language)}
                      </h4>
                      {!activated && <Sparkles className="w-3 h-3 text-[#D4AF37] flex-shrink-0" />}
                    </div>
                    <p className="text-[#8B8680] text-sm leading-relaxed">
                      {getLocalizedField(perk, 'description', language)}
                    </p>
                    {perk.conditions && (
                      <p className="text-[#8B8680] text-xs mt-2 italic opacity-60">
                        {perk.conditions}
                      </p>
                    )}
                  </div>

                  {/* Activation indicator */}
                  <div className="flex-shrink-0 self-center">
                    {activated ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2E7D32]/10 rounded-lg border border-[#2E7D32]/25">
                        <CheckCircle className="w-3.5 h-3.5 text-[#2E7D32]" />
                        <span className="text-[#2E7D32] text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                          {t('activated', 'ACTIVATED')}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#D4AF37]/10 to-[#CD7F32]/10 rounded-lg border border-[#D4AF37]/30 group-hover:from-[#D4AF37]/20 group-hover:to-[#CD7F32]/20 group-hover:border-[#D4AF37]/50 transition-all">
                        <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                          {t('activate', 'ACTIVATE')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
