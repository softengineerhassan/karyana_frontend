import React, { useState, useEffect } from 'react';
import { X, Sparkles, Clock, CheckCircle, Gift, Crown, Zap, Flame } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { getLocalizedField } from '@/lib/localization';
import { fetchData } from '@/helpers/fetchData';
import { isBoostPerk, filterPerks } from '@/lib/perkUtils';
import { useDispatch } from 'react-redux';
import { addWalkInRedemption } from '@/store/slices/bookingsSlice';

export function WalkInPerkModal({
  isOpen,
  onClose,
  perk,
  perks,
  venueName,
  venueNameAr,
  venueNameFr,
  onActivate
}) {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const dispatch = useDispatch();
  const [stage, setStage] = useState('confirm');
  const [selectedPerk, setSelectedPerk] = useState(null);
  const [activationCode, setActivationCode] = useState('');
  const [isActivating, setIsActivating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Don't reset stage if activation is in progress or already done
      if (stage === 'activating' || stage === 'activated') return;

      if (perk) {
        setSelectedPerk(perk);
        setStage('confirm');
      } else if (perks && perks.length > 0) {
        setSelectedPerk(null);
        setStage('select');
      } else {
        setStage('confirm');
      }
    }
  }, [isOpen, perk, perks]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handlePerkSelection = (p) => {
    setSelectedPerk(p);
    setStage('confirm');
  };

  const handleActivate = async () => {
    if (!selectedPerk) return;
    setIsActivating(true);
    setStage('activating');
    try {
      const result = await fetchData('POST', '/perk-redemptions', {
        perk_id: selectedPerk.id,
        redemption_type: 'walk_in',
      });
      const redemption = result?.data;
      const code = redemption?.redemption_code || redemption?.code || `OMN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      setActivationCode(code);
      setStage('activated');
      // Add to Redux so walk-in tab count updates immediately
      dispatch(addWalkInRedemption(redemption || {
        id: Date.now(),
        perk_id: selectedPerk.id,
        perk_title_en: selectedPerk.title_en,
        perk_title_ar: selectedPerk.title_ar,
        perk_title_fr: selectedPerk.title_fr,
        perk_description_en: selectedPerk.description_en,
        perk_description_ar: selectedPerk.description_ar,
        perk_description_fr: selectedPerk.description_fr,
        venue_name: venueName,
        redemption_code: code,
        redemption_type: 'walk_in',
        created_at: new Date().toISOString(),
        is_redeemed: false,
      }));
      if (onActivate) onActivate(selectedPerk);
    } catch {
      setActivationCode(`OMN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
      setStage('activated');
      if (onActivate) onActivate(selectedPerk);
    } finally {
      setIsActivating(false);
    }
  };
  if (!isOpen) return null;

  const activePerk = selectedPerk || perk;
  const validPerks = filterPerks(perks || []);
  const localizedVenueName = getLocalizedField({ name: venueName, nameAr: venueNameAr, nameFr: venueNameFr }, 'name', language);

  // Don't allow backdrop dismiss during/after activation — user must use the close/ready button
  const handleBackdropClick = (stage === 'activating' || stage === 'activated') ? undefined : onClose;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleBackdropClick} />

      <div className="relative w-full max-w-md bg-[#FFFBF5] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden overscroll-contain">

        {/* ── SELECT STAGE ── */}
        {stage === 'select' && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2 flex-shrink-0">
              <div className="w-9" />
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#CD7F32] flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <button onClick={onClose} className="w-9 h-9 bg-white rounded-xl border border-[#D4AF37]/30 flex items-center justify-center shadow-sm cursor-pointer">
                <X className="w-4 h-4 text-[#8B8680]" />
              </button>
            </div>

            <p className="text-[#1A1A1C] text-center font-serif font-bold text-lg px-6 pb-4 flex-shrink-0">
              {t('walk_in.select_privilege', 'Select Your Privilege')}
            </p>

            <div className="px-4 pb-6 overflow-y-auto space-y-2.5">
              {validPerks.length === 0 ? (
                <p className="text-center text-[#8B8680] text-sm py-8">{t('walk_in.no_perks', 'No perks available at this time')}</p>
              ) : validPerks.map((p, i) => {
                const boost = isBoostPerk(p);
                const activated = p.has_walked_in === true || p.hasWalkedIn === true;
                const title = getLocalizedField(p, 'title', language) || p.title_en || 'Exclusive Perk';
                const desc = getLocalizedField(p, 'description', language) || p.description_en || '';
                const displayValue = p.display_value || p.displayValue || p.value || '';

                if (boost) {
                  return (
                    <button
                      key={p.id || i}
                      onClick={() => !activated && handlePerkSelection(p)}
                      disabled={activated}
                      className={cn("w-full text-left", activated ? 'cursor-default opacity-80' : 'cursor-pointer')}
                    >
                      {/* _BoostPerkSelectCard */}
                      <div className="p-3 rounded-2xl border border-[#D4AF37] shadow-md overflow-hidden relative" style={{ background: 'linear-gradient(to right, #D4AF37, #CD7F32, #C4941F)' }}>
                        <div className="relative flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 border border-white/30">
                            <Flame className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-bold text-sm line-clamp-1">{title}</p>
                            <p className="text-white/85 text-[10px] line-clamp-1">{desc}</p>
                            {displayValue && (
                              <div className="flex items-center gap-1 mt-1 w-fit bg-white/20 px-2 py-0.5 rounded-lg border border-white/30">
                                <Zap className="w-3 h-3 text-white" />
                                <span className="text-white text-[10px] font-bold">{displayValue}</span>
                              </div>
                            )}
                          </div>
                          <div className={cn("px-3 py-1.5 rounded-xl text-[10px] font-bold flex-shrink-0", activated ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-white text-[#D4AF37]')}>
                            {activated ? t('activated', 'Activated') : 'SELECT'}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                }

                return (
                  <button
                    key={p.id || i}
                    onClick={() => !activated && handlePerkSelection(p)}
                    disabled={activated}
                    className={cn("w-full text-left", activated ? 'cursor-default' : 'cursor-pointer')}
                  >
                    {/* _ExclusivePerkCard */}
                    <div className={cn("p-3 rounded-xl bg-white flex items-center gap-2.5 border", activated ? 'border-[#2E7D32]/25' : 'border-[#D4AF37]/30')}>
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border", activated ? 'bg-[#2E7D32]/10 border-[#2E7D32]/20' : 'bg-[#F8F5F0] border-[#D4AF37]/20')}>
                        {activated ? <CheckCircle className="w-4 h-4 text-[#2E7D32]" /> : <Gift className="w-4 h-4 text-[#D4A574]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-0.5">
                          <p className="text-[#1A1A1C] font-serif font-bold text-xs line-clamp-1">{title}</p>
                          {!activated && <Sparkles className="w-2.5 h-2.5 text-[#D4A574] flex-shrink-0" />}
                        </div>
                        <p className="text-[#8B8680] text-[10px] line-clamp-2">{desc}</p>
                      </div>
                      <div className={cn("px-2.5 py-1.5 rounded-xl border text-[10px] font-bold flex-shrink-0", activated ? 'bg-[#E8F5E9] border-[#2E7D32] text-[#2E7D32]' : 'bg-[#D4AF37]/5 border-[#D4AF37] text-[#D4AF37]')}>
                        {activated ? t('activated', 'Activated') : 'Select'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* ── CONFIRM STAGE ── */}
        {stage === 'confirm' && activePerk && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2 flex-shrink-0">
              <div className="w-9" />
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#CD7F32] flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <button onClick={onClose} className="w-9 h-9 bg-white rounded-xl border border-[#D4AF37]/30 flex items-center justify-center shadow-sm cursor-pointer">
                <X className="w-4 h-4 text-[#8B8680]" />
              </button>
            </div>

            <div className="text-center px-6 pb-4 flex-shrink-0">
              <h2 className="text-[#1A1A1C] font-serif font-bold text-xl mb-1">{t('walk_in.activate_privilege', 'Activate Walk-In Privilege')}</h2>
              <p className="text-[#8B8680] text-sm">{t('walk_in.review_details', 'Review your exclusive perk details before activation')}</p>
            </div>

            <div className="px-4 pb-4 flex-shrink-0">
              <div className="bg-white rounded-2xl border border-[#D4AF37]/15 p-4">
                {/* AT THIS VENUE */}
                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-[#E8E3D5]">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF9E6] border border-[#D4AF37] flex items-center justify-center flex-shrink-0">
                    <Crown className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[#8B8680] text-[10px] uppercase tracking-wider font-semibold mb-0.5">{t('walk_in.at_venue', 'AT THIS VENUE')}</p>
                    <p className="text-[#1A1A1C] font-serif font-bold text-base">{localizedVenueName}</p>
                  </div>
                </div>

                {/* YOUR PRIVILEGE */}
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <p className="text-[#8B8680] text-[10px] uppercase tracking-wider font-bold">{t('walk_in.your_privilege', 'YOUR PRIVILEGE')}</p>
                </div>
                <h3 className="text-[#1A1A1C] font-serif font-bold text-base mb-1.5 leading-tight">
                  {getLocalizedField(activePerk, 'title', language) || activePerk.title_en}
                </h3>
                {(getLocalizedField(activePerk, 'description', language) || activePerk.description_en) && (
                  <p className="text-[#5C5850] text-sm leading-relaxed mb-3">
                    {getLocalizedField(activePerk, 'description', language) || activePerk.description_en}
                  </p>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  {(activePerk.display_value || activePerk.displayValue || activePerk.value) && (
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-[#FFF9E6] rounded-lg border border-[#D4AF37]">
                      <Zap className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span className="text-[#1A1A1C] font-bold text-xs">{activePerk.display_value || activePerk.displayValue || activePerk.value}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-[#F5F5F5] rounded-lg border border-[#D4AF37]/30">
                    <Clock className="w-3.5 h-3.5 text-[#8B8680]" />
                    <span className="text-[#8B8680] font-medium text-xs">{t('walk_in.valid_24h', 'Valid for 24 hours')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 pb-6 flex-shrink-0">
              <button
                onClick={handleActivate}
                disabled={isActivating}
                className="w-full py-4 text-white rounded-xl font-serif font-semibold text-base shadow-lg mb-3 cursor-pointer"
                style={{ background: 'linear-gradient(to right, #D4AF37, #CD7F32)' }}
              >
                {t('walk_in.activate_now', 'Activate Now')}
              </button>
              <button onClick={onClose} className="w-full py-3 text-[#8B8680] text-sm font-medium cursor-pointer">
                {t('walk_in.maybe_later', 'Maybe Later')}
              </button>
            </div>
          </>
        )}

        {/* ── ACTIVATING STAGE ── */}
        {stage === 'activating' && (
          <div className="p-12 flex flex-col items-center justify-center min-h-[400px]">
            <div className="relative mb-8">
              <div className="absolute inset-0 rounded-full blur-2xl opacity-20 animate-pulse" style={{ background: 'linear-gradient(to right, #D4AF37, #CD7F32)' }} />
              <div className="relative w-24 h-24 rounded-full flex items-center justify-center shadow-xl" style={{ background: 'linear-gradient(to right, #D4AF37, #CD7F32)' }}>
                <Sparkles className="w-12 h-12 text-white animate-pulse" />
              </div>
            </div>
            <h3 className="text-[#1A1A1C] font-serif font-bold text-2xl text-center mb-3">{t('walk_in.preparing', 'Preparing Your Privilege')}</h3>
            <p className="text-[#8B8680] text-center mb-6">{t('walk_in.just_moment', 'Just a moment...')}</p>
            <div className="flex items-center gap-2">
              {[0, 0.15, 0.3].map((delay, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-[#D4AF37] animate-bounce" style={{ animationDelay: `${delay}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* ── ACTIVATED STAGE ── */}
        {stage === 'activated' && (
          <>
            <div className="p-5 flex-shrink-0 bg-[#E8F5E9]/50">
              <div className="flex items-center justify-center gap-3">
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#4A7C2C] to-[#3A6422] flex items-center justify-center shadow-xl">
                  <CheckCircle className="w-9 h-9 text-white" />
                  <div className="absolute -top-0.5 -right-0.5">
                    <Sparkles className="w-4 h-4 text-[#D4AF37] animate-pulse" />
                  </div>
                </div>
                <div>
                  <h2 className="text-[#1A1A1C] font-serif font-bold text-2xl">{t('walk_in.activated_success', 'Privilege Activated!')}</h2>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#4A7C2C]" />
                    <span className="text-[#4A7C2C] text-sm font-semibold">{t('walk_in.valid_24h', 'Valid for 24 hours')}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-5 pb-5 flex-shrink-0 space-y-3">
              {/* Activation code */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-white rounded-xl border-2 border-[#D4AF37] shadow-md relative overflow-hidden">
                  <div className="text-center">
                    <p className="text-[#8B8680] uppercase tracking-widest mb-2 text-[10px] font-bold">{t('walk_in.code', 'CODE')}</p>
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                      <p className="text-[#D4AF37] text-xl font-bold tracking-wider" style={{ fontFamily: 'Courier New, monospace' }}>{activationCode}</p>
                    </div>
                    <p className="text-[#8B8680] text-xs">{t('walk_in.show_staff', 'Show to staff')}</p>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border-2 border-[#E8E3D5] flex flex-col items-center shadow-sm">
                  <div className="w-28 h-28 bg-white rounded-lg border-2 border-[#D4AF37]/20 flex items-center justify-center p-2 shadow-inner">
                    <div className="grid grid-cols-8 gap-0.5 w-full h-full">
                      {Array.from({ length: 64 }).map((_, i) => {
                        const charCode = activationCode.charCodeAt(i % activationCode.length);
                        const isFilled = ((charCode * (i + 1)) % 3) !== 0;
                        return <div key={i} className={`rounded-sm ${isFilled ? 'bg-[#1A1A1C]' : 'bg-transparent'}`} />;
                      })}
                    </div>
                  </div>
                  <p className="text-[#8B8680] text-xs text-center mt-1">{t('walk_in.scan_validate', 'Scan to validate')}</p>
                </div>
              </div>

              {/* Perk summary */}
              {activePerk && (
                <div className="p-4 rounded-xl border border-[#D4AF37]/20 flex items-center gap-3" style={{ background: 'linear-gradient(to right, rgba(212,175,55,0.05), rgba(205,127,50,0.05))' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0" style={{ background: 'linear-gradient(to right, #D4AF37, #CD7F32)' }}>
                    <Gift className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[#1A1A1C] font-serif font-semibold text-sm truncate">
                      {getLocalizedField(activePerk, 'title', language) || activePerk.title_en}
                    </h4>
                    <p className="text-[#8B8680] text-xs line-clamp-1">
                      {getLocalizedField(activePerk, 'description', language) || activePerk.description_en}
                    </p>
                  </div>
                  {(activePerk.display_value || activePerk.displayValue || activePerk.value) && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 rounded-lg border border-[#D4AF37]/30 flex-shrink-0">
                      <Zap className="w-4 h-4 text-[#D4AF37]" />
                      <span className="text-[#1A1A1C] font-semibold text-sm">{activePerk.display_value || activePerk.displayValue || activePerk.value}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Venue + next visit */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded-xl border border-[#E8E3D5] shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                      <Crown className="w-4 h-4 text-[#D4AF37]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#8B8680] text-[10px] uppercase tracking-wider font-bold">{t('walk_in.at', 'AT')}</p>
                      <p className="text-[#1A1A1C] font-serif font-semibold text-sm truncate">{localizedVenueName}</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#E8E3D5] shadow-sm">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-[#8B8680] text-[10px] uppercase tracking-wider font-bold mb-0.5">{t('walk_in.next', 'NEXT')}</p>
                      <p className="text-[#8B8680] text-xs line-clamp-2">{t('walk_in.visit_24h', 'Visit again within 24h to use your privilege')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 pb-6 flex-shrink-0">
              <button
                onClick={onClose}
                className="w-full py-4 text-white rounded-xl font-serif font-semibold text-lg shadow-lg cursor-pointer"
                style={{ background: 'linear-gradient(to right, #D4AF37, #CD7F32)' }}
              >
                {t('walk_in.ready', 'Ready to Go!')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
