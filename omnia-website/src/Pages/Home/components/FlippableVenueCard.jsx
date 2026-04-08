import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, Star, Crown, Sparkles, Gift, Zap, Flame, CheckCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DynamicPerkCountdown, getPerkEndMs } from './DynamicPerkCountdown';
import { PerkActionModal } from './PerkActionModal';
import { cn } from '@/lib/utils';
import { getLocalizedField } from '@/lib/localization';
import { getVenueDetail } from '@/Services/venueApi';
import { isBoostPerk, isBoostActive, resolveExclusivePerks } from '@/lib/perkUtils';

export function FlippableVenueCard({
  venue,
  onVenueClick,
  onBookClick,
  onWalkIn,
  isFeatured = false,
  onFlipChange,
  fullWidth = false
}) {
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  const [isFlipped, setIsFlipped] = useState(false);
  const [lastPerkTap, setLastPerkTap] = useState(0);
  const [perkActionModalOpen, setPerkActionModalOpen] = useState(false);
  const [selectedPerk, setSelectedPerk] = useState(null);
  // Perks fetched on flip (like customer app's _fetchPerks)
  const [fetchedPerks, setFetchedPerks] = useState(null); // null = not yet fetched
  const [perksLoading, setPerksLoading] = useState(false);
  const perksFetchedRef = useRef(false);

  const cardRef = useRef(null);
  const clickTimeoutRef = useRef(null);
  const perkClickTimeoutRef = useRef(null);
  const isScrollingRef = useRef(false);
  const doubleClickFiredRef = useRef(false);
  const touchStartRef = useRef(null);
  const isDraggingRef = useRef(false);
  const lastTapRef = useRef(0);
  const lastTouchTimeRef = useRef(0); // guards against ghost mouse events after touch

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
      if (perkClickTimeoutRef.current) {
        clearTimeout(perkClickTimeoutRef.current);
      }
    };
  }, []);

  // Notify parent when flip state changes
  const handleFlipChange = (newFlipState) => {
    setIsFlipped(newFlipState);
    if (onFlipChange) onFlipChange(newFlipState);
  };

  // Fetch perks on first flip — same as customer app's _fetchPerks()
  useEffect(() => {
    if (!isFlipped || perksFetchedRef.current) return;
    perksFetchedRef.current = true;
    setPerksLoading(true);
    getVenueDetail(venue.id, { duration_minutes: 60, slot_step_minutes: 30 })
      .then(res => {
        if (res?.data?.success) {
          const v = res.data.data?.venue;
          const topPerks = res.data.data?.perks || [];
          const venuePerks = v?.perks || [];
          // Deduplicate — prioritize topPerks (has user-specific fields like has_walked_in)
          const seen = new Set();
          const all = [...topPerks, ...venuePerks].filter(p => {
            if (seen.has(p.id)) return false;
            seen.add(p.id);
            return true;
          });
          setFetchedPerks(all);
        }
      })
      .catch(() => {})
      .finally(() => setPerksLoading(false));
  }, [isFlipped, venue.id]);

  const handlePerkClick = (e, perk) => {
    e.preventDefault();
    e.stopPropagation();
    
    const now = Date.now();
    
    // Double click/tap - flip card back
    if (now - lastPerkTap < 350) {
      setLastPerkTap(0);
      if (perkClickTimeoutRef.current) {
        clearTimeout(perkClickTimeoutRef.current);
        perkClickTimeoutRef.current = null;
      }
      handleFlipChange(false);
    } 
    // Single click/tap - open modal after delay to allow for double-click detection
    else {
      setLastPerkTap(now);
      perkClickTimeoutRef.current = setTimeout(() => {
        setSelectedPerk(perk);
        setPerkActionModalOpen(true);
      }, 350);
    }
  };

  const handlePerkWalkIn = () => {
    setPerkActionModalOpen(false);
    if (onWalkIn) onWalkIn(venue.id, selectedPerk);
  };

  const handlePerkActivated = (activatedPerk) => {
    // Update fetchedPerks so card shows "ACTIVATED" — modal stays open to show activation code
    setFetchedPerks(prev =>
      (prev || []).map(p =>
        p.id === activatedPerk.id ? { ...p, has_walked_in: true } : p
      )
    );
  };

  const handlePerkBookNow = () => {
    setPerkActionModalOpen(false);
    if (onBookClick) {
      onBookClick(venue.id, selectedPerk);
    }
  };

  const getPriceLevel = (priceRange) => {
    if (priceRange === '$') return 1;
    if (priceRange === '$$') return 2;
    if (priceRange === '$$$') return 3;
    return 4;
  };
  
  // Use fetched perks (from detail API) if available, fall back to venue.perks from list
  const apiPerks = Array.isArray(fetchedPerks) ? fetchedPerks : (Array.isArray(venue.perks) ? venue.perks : []);

  // Boost: only active if boost_end_date exists and is in the future (customer app logic)
  // Exclusive: primary → backup → any active, per perk_type group
  const boostPerks = apiPerks.filter(p => isBoostPerk(p) && isBoostActive(p));
  const exclusivePerks = resolveExclusivePerks(apiPerks.filter(p => !isBoostPerk(p)));

  // First boost perk drives the front-face badge (all boostPerks are already active)
  const dynamicPerk = boostPerks[0] || null;

  const getUrgencyLevel = (endDate) => {
    const hoursLeft = Math.floor((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60));
    if (hoursLeft < 6) return 'critical';
    if (hoursLeft < 24) return 'warning';
    return 'active';
  };

  const urgencyLevel = (() => {
    if (!dynamicPerk) return 'active';
    const endDate = dynamicPerk.boost_end_date || dynamicPerk.boostEndDate;
    const endTime = dynamicPerk.boost_end_time || dynamicPerk.boostEndTime;
    if (!endDate) return 'active';
    return getUrgencyLevel(endTime ? `${endDate}T${endTime}` : endDate);
  })();
  
  // Urgency-based color schemes (luxury palette)
  const urgencyColors = {
    critical: {
      border: 'border-[#B85C5C]',
      shadow: 'shadow-[#B85C5C]/25',
      gradient: 'from-[#C77B7B] via-[#B85C5C] to-[#A64B4B]',
      badgeText: 'FINAL HOURS',
      badgeTextAr: 'ساعات أخيرة',
      badgeTextFr: 'DERNIÈRES HEURES',
      animation: 'animate-pulse-border-fast',
    },
    warning: {
      border: 'border-[#FF8C42]',
      shadow: 'shadow-[#FF8C42]/25',
      gradient: 'from-[#FF8C42] via-[#FF6B35] to-[#E67B35]',
      badgeText: 'ENDING SOON',
      badgeTextAr: 'ينتهي قريباً',
      badgeTextFr: 'BIENTÔT TERMINÉ',
      animation: 'animate-pulse-border',
    },
    active: {
      border: 'border-[#D4AF37]',
      shadow: 'shadow-[#D4AF37]/25',
      gradient: 'from-[#D4AF37] via-[#CD7F32] to-[#C4941F]',
      badgeText: 'LIMITED OFFER',
      badgeTextAr: 'عرض محدود',
      badgeTextFr: 'OFFRE LIMITÉE',
      animation: 'animate-pulse-border-slow',
    },
  };
  
  const colors = urgencyColors[urgencyLevel];

  const handleTouchStart = (e) => {
    lastTouchTimeRef.current = Date.now(); // mark touch so mouse handlers ignore ghost events
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
    isDraggingRef.current = false;
    isScrollingRef.current = false;
  };

  const handleTouchMove = (e) => {
    if (!touchStartRef.current) return;

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);

    // Detect horizontal scrolling intent
    if (deltaX > deltaY && deltaX > 15) {
      isScrollingRef.current = true;
    }
    // Only mark as dragging if significant movement (increased threshold)
    else if (deltaX > 20 || deltaY > 20) {
      isDraggingRef.current = true;
    }
  };

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current) return;

    if (isScrollingRef.current) {
      touchStartRef.current = null;
      isDraggingRef.current = false;
      isScrollingRef.current = false;
      return;
    }

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
    const deltaTime = Date.now() - touchStartRef.current.time;
    const now = Date.now();

    // Swipe gesture detection - flip card
    if (Math.abs(deltaX) > 40 && deltaTime < 600 && deltaY < 40) {
      e.preventDefault();
      e.stopPropagation();
      doubleClickFiredRef.current = true;
      handleFlipChange(!isFlipped);
      lastTapRef.current = 0;
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
    }
    // Tap detection (not dragging) - increased thresholds for better detection
    else if (Math.abs(deltaX) < 15 && deltaY < 15 && deltaTime < 500 && !isDraggingRef.current) {
      e.stopPropagation();

      // Double-tap detected - flip card only, NO navigation
      if (now - lastTapRef.current < 500) {
        e.preventDefault();
        doubleClickFiredRef.current = true;
        handleFlipChange(!isFlipped);
        lastTapRef.current = 0;
        if (clickTimeoutRef.current) {
          clearTimeout(clickTimeoutRef.current);
          clickTimeoutRef.current = null;
        }
      }
      // Single tap - delay to wait for potential double-tap
      else {
        lastTapRef.current = now;
        doubleClickFiredRef.current = false;
        clickTimeoutRef.current = setTimeout(() => {
          // Only navigate if no double-click was detected and not flipped
          if (!doubleClickFiredRef.current && !isFlipped) {
            onVenueClick(venue.id);
          }
        }, 350);
      }
    }

    touchStartRef.current = null;
    isDraggingRef.current = false;
    isScrollingRef.current = false;
  };

  const handleMouseDown = (e) => {
    // Ignore synthesized ghost mouse events fired after touch events
    if (Date.now() - lastTouchTimeRef.current < 600) return;
    e.stopPropagation();
    touchStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now()
    };
    isDraggingRef.current = false;
    isScrollingRef.current = false;
  };

  const handleMouseMove = (e) => {
    if (!touchStartRef.current) return;

    const deltaX = Math.abs(e.clientX - touchStartRef.current.x);
    const deltaY = Math.abs(e.clientY - touchStartRef.current.y);

    // Only mark as dragging if significant movement (increased threshold)
    if (deltaX > 20 || deltaY > 20) {
      isDraggingRef.current = true;
    }
  };

  const handleMouseUp = (e) => {
    // Ignore synthesized ghost mouse events fired after touch events
    if (Date.now() - lastTouchTimeRef.current < 600) return;
    if (!touchStartRef.current) return;

    e.stopPropagation();

    const deltaX = e.clientX - touchStartRef.current.x;
    const deltaY = Math.abs(e.clientY - touchStartRef.current.y);
    const deltaTime = Date.now() - touchStartRef.current.time;
    const now = Date.now();

    // Swipe gesture detection - flip card
    if (Math.abs(deltaX) > 40 && deltaTime < 600 && deltaY < 40) {
      e.preventDefault();
      doubleClickFiredRef.current = true;
      handleFlipChange(!isFlipped);
      lastTapRef.current = 0;
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
    }
    // Click detection (not dragging) - increased deltaTime to 500ms for better detection
    else if (Math.abs(deltaX) < 15 && deltaY < 15 && deltaTime < 500 && !isDraggingRef.current) {
      // Double-click detected - flip card only, NO navigation
      if (now - lastTapRef.current < 500) {
        e.preventDefault();
        doubleClickFiredRef.current = true;
        handleFlipChange(!isFlipped);
        lastTapRef.current = 0;
        if (clickTimeoutRef.current) {
          clearTimeout(clickTimeoutRef.current);
          clickTimeoutRef.current = null;
        }
      }
      // Single click - delay to wait for potential double-click
      else {
        lastTapRef.current = now;
        doubleClickFiredRef.current = false;
        clickTimeoutRef.current = setTimeout(() => {
          // Only navigate if no double-click was detected and not flipped
          if (!doubleClickFiredRef.current && !isFlipped) {
            onVenueClick(venue.id);
          }
        }, 350);
      }
    }

    touchStartRef.current = null;
    isDraggingRef.current = false;
    isScrollingRef.current = false;
  };


  return (
    <div
      ref={cardRef}
      className={cn(
        "flippable-card perspective-[1000px]",
        fullWidth ? "w-full max-w-[340px] mx-auto" : "flex-shrink-0 w-[280px] md:w-[340px] scroll-snap-center",
        "h-[420px] md:h-[480px]",
        dynamicPerk && 'animate-pulse-border'
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ touchAction: 'manipulation' }}
    >
      <div
        className="relative w-full h-full preserve-3d"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)'
        }}
      >
        {/* FRONT FACE */}
        <div
          className={cn(
            "absolute inset-0 backface-hidden bg-white rounded-3xl overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-xl",
            dynamicPerk 
              ? `border-2 ${colors.border} shadow-lg ${colors.shadow}` 
              : 'border border-[#D4AF37]/15 hover:border-[#D4AF37]/40'
          )}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="relative overflow-hidden">
            <img
              src={venue.image}
              alt={venue.name}
              className="w-full h-64 object-cover transition-all duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Dynamic Perk Badge */}
            {dynamicPerk && (() => {
              const endMs = getPerkEndMs(dynamicPerk);
              return (
                <div className="absolute top-4 left-4 right-4">
                  <div className={cn("bg-gradient-to-r text-white px-4 py-3 rounded-2xl shadow-lg border border-white/20 backdrop-blur-sm", colors.gradient)}>
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4" />
                        <span className="uppercase tracking-wider text-[10px] font-bold opacity-90">
                          {getLocalizedField(colors, 'badgeText', language)}
                        </span>
                      </div>
                      {isFinite(endMs) && <DynamicPerkCountdown endMs={endMs} compact />}
                    </div>
                    <div className="text-sm font-semibold line-clamp-1 opacity-95">
                      {getLocalizedField(dynamicPerk, 'title', language) || dynamicPerk.title_en}
                    </div>
                  </div>
                </div>
              );
            })()}
            
            {isFeatured && !dynamicPerk && (
              <div className="absolute top-4 left-4 bg-gradient-to-r from-[#D4AF37] to-[#CD7F32] text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                <Crown className="w-4 h-4" />
                <span className="uppercase tracking-wider text-xs font-bold">{t('home.featured.badge', 'Featured')}</span>
              </div>
            )}

            {/* Swipe Indicator */}
            <div className="absolute bottom-4 right-4 bg-gradient-to-r from-[#D4AF37] to-[#CD7F32] text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg animate-bounce-slow">
              <span className="text-sm font-bold">←</span>
              <Sparkles className="w-4 h-4" />
              <span className="text-[11px] uppercase tracking-wider font-bold">
                {t('home.card.swipe', 'DOUBLE TAP')}
              </span>
              <span className="text-sm font-bold">→</span>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="text-[#1A1A1C] mb-2 tracking-tight text-lg" style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600 }}>
                  {getLocalizedField(venue, 'name', language)}
                </h4>
                <p className="text-[#8B8680] flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4" />
                  {getLocalizedField(venue, 'location', language)}
                </p>
              </div>
              <div className="flex items-center gap-1.5 bg-[#D4AF37]/10 px-3 py-2 rounded-xl border border-[#D4AF37]/25">
                <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                <span className="text-[#1A1A1C] font-semibold">{venue.rating}</span>
              </div>
            </div>

            {(() => {
              const tagline = getLocalizedField(venue, 'tagline', language);
              return tagline ? (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className="text-xs bg-[#E65100]/10 text-[#E65100] px-2.5 py-1 rounded-full border border-[#E65100]/25 font-semibold line-clamp-1">
                    {tagline}
                  </span>
                </div>
              ) : <div className="mb-4" />;
            })()}

            <div className="flex items-center justify-between pt-4 border-t border-[#E8E3D5]">
              <span className="text-[#5C5850]">
                {'$'.repeat(getPriceLevel(venue.priceRange))}
                <span className="opacity-30">{'$'.repeat(4 - getPriceLevel(venue.priceRange))}</span>
              </span>
              <span className="text-[#8B8680] uppercase tracking-wider text-xs font-semibold">
                {venue.reviewCount} {t('home.card.reviews', 'reviews')}
              </span>
            </div>
          </div>
        </div>

        {/* BACK FACE - PERKS DISPLAY */}
        <div
          className="absolute inset-0 backface-hidden bg-gradient-to-br from-[#FDFBF7] via-[#F8F6F1] to-[#F5F3ED] border-2 border-[#D4AF37]/30 rounded-3xl overflow-hidden shadow-2xl"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <div className="absolute inset-0 opacity-[0.03]">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                repeating-linear-gradient(45deg, #D4AF37 0px, #D4AF37 1px, transparent 1px, transparent 20px),
                repeating-linear-gradient(-45deg, #CD7F32 0px, #CD7F32 1px, transparent 1px, transparent 20px)
              `
            }} />
          </div>

          <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-[#D4AF37]/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-[#CD7F32]/20 to-transparent rounded-full blur-3xl" />

          <div className="relative h-full flex flex-col p-5">
            <div className="text-center mb-4">
              <h4 className="text-[#1A1A1C] mb-1 text-xl tracking-tight" style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600 }}>
                {t('home.card.exclusive_perks', 'OMNIA Exclusive Perks')}
              </h4>
              <p className="text-[#8B8680] text-xs uppercase tracking-[0.15em] font-semibold">
                {getLocalizedField(venue, 'name', language)}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 custom-scrollbar">
              {/* Loading state while fetching perks */}
              {perksLoading && (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
                  <p className="text-[#8B8680] text-xs">{t('loading_perks', 'Loading perks...')}</p>
                </div>
              )}

              {/* Empty state */}
              {!perksLoading && boostPerks.length === 0 && exclusivePerks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <Sparkles className="w-8 h-8 text-[#D4AF37]/40" />
                  <p className="text-[#8B8680] text-xs text-center">{t('no_perks', 'No perks available')}</p>
                </div>
              )}

              {/* ── Boost Perks: Gold gradient card — matches HomeVenueFlipperCardPerk boost mode ── */}
              {!perksLoading && boostPerks.map((perk, index) => {
                const endMs = getPerkEndMs(perk);
                const hoursLeft = isFinite(endMs) ? Math.floor((endMs - Date.now()) / (1000 * 60 * 60)) : 9999;
                const urgency = hoursLeft < 6 ? 'critical' : hoursLeft < 24 ? 'warning' : 'active';
                const gradient = urgency === 'critical' ? 'from-[#C77B7B] via-[#B85C5C] to-[#A64B4B]'
                  : urgency === 'warning' ? 'from-[#FF8C42] via-[#FF6B35] to-[#E67B35]'
                  : 'from-[#D4AF37] via-[#CD7F32] to-[#C4941F]';
                const badgeText = urgency === 'critical' ? 'FINAL HOURS' : urgency === 'warning' ? 'ENDING SOON' : 'LIMITED OFFER';
                const activated = perk.has_walked_in === true || perk.hasWalkedIn === true;
                const priceSnapshot = perk.price_snapshot || perk.priceSnapshot || perk.display_value || perk.displayValue || perk.value;

                return (
                  <button
                    key={perk.id || index}
                    onClick={(e) => !activated && handlePerkClick(e, perk)}
                    onTouchEnd={(e) => !activated && handlePerkClick(e, perk)}
                    disabled={activated}
                    className={cn("w-full text-left", activated ? 'opacity-80 cursor-default' : 'cursor-pointer')}
                  >
                    <div className={`relative overflow-hidden rounded-2xl shadow-lg ${!activated ? 'active:scale-[0.98]' : ''} transition-all`}>
                      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
                      <div className="relative p-3.5">
                        {/* Row 1: Fire icon + LIMITED OFFER label | countdown timer pill */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
                              <Flame className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-white text-[9px] uppercase tracking-wider font-bold opacity-90">{badgeText}</span>
                          </div>
                          {isFinite(endMs) && (
                            <DynamicPerkCountdown endMs={endMs} compact />
                          )}
                        </div>

                        {/* Title */}
                        <h5 className="text-white font-semibold text-sm leading-tight line-clamp-2 mb-1">
                          {getLocalizedField(perk, 'title', language) || perk.title_en}
                        </h5>

                        {/* Description */}
                        <p className="text-white/85 text-[11px] leading-snug line-clamp-2 mb-2.5">
                          {getLocalizedField(perk, 'description', language) || perk.description_en}
                        </p>

                        {/* Price badge */}
                        {priceSnapshot && (
                          <div className="flex items-center gap-1 bg-white/20 self-start px-2 py-1 rounded-lg border border-white/30 w-fit mb-2.5">
                            <Zap className="w-3 h-3 text-white" />
                            <span className="text-white text-xs font-bold">${priceSnapshot}</span>
                          </div>
                        )}

                        {/* Divider */}
                        <div className="border-t border-white/20 mb-2" />

                        {/* Bottom: PREMIUM OFFER label | activate button */}
                        <div className="flex items-center justify-between">
                          <span className="text-white text-[9px] uppercase tracking-wider font-bold opacity-70">
                            {t('premium_offer', 'PREMIUM OFFER')}
                          </span>
                          {activated ? (
                            <div className="flex items-center gap-1 bg-[#2E7D32] px-2.5 py-1.5 rounded-lg">
                              <CheckCircle className="w-3 h-3 text-white" />
                              <span className="text-white text-[9px] font-bold uppercase">{t('activated', 'ACTIVATED')}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-xl shadow-md">
                              <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                              <span className="text-[#1A1A1C] text-[9px] font-bold uppercase">{t('tap_to_activate', 'TAP TO ACTIVATE')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}

              {/* ── Exclusive Perks: White card — matches HomeVenueFlipperCardPerk exclusive mode ── */}
              {!perksLoading && exclusivePerks.map((perk, index) => {
                const activated = perk.has_walked_in === true || perk.hasWalkedIn === true;
                return (
                  <button
                    key={perk.id || index}
                    onClick={(e) => !activated && handlePerkClick(e, perk)}
                    onTouchEnd={(e) => !activated && handlePerkClick(e, perk)}
                    disabled={activated}
                    className={cn("w-full text-left", activated ? 'cursor-default' : 'cursor-pointer')}
                  >
                    <div className={`bg-white rounded-2xl border overflow-hidden transition-all ${activated ? 'border-[#2E7D32]/25' : 'border-[#D4AF37]/30 hover:border-[#D4AF37]/60 hover:shadow-md active:scale-[0.98]'}`}>
                      {/* OMNIA EXCLUSIVE badge — tan gradient with vertical bar decorations */}
                      <div className="flex items-center justify-center py-1.5 px-3" style={{ background: 'linear-gradient(to right, #FAF4EB, #FFF9F0, #FAF4EB)' }}>
                        <div className="w-0.5 h-3 rounded-full mr-2" style={{ background: '#D4A574' }} />
                        <span className="text-[9px] uppercase tracking-[0.2em] font-bold" style={{ color: '#8B6914' }}>
                          {t('omnia_exclusive', 'OMNIA EXCLUSIVE')}
                        </span>
                        <div className="w-0.5 h-3 rounded-full ml-2" style={{ background: '#D4A574' }} />
                      </div>

                      <div className="px-3.5 pb-3 pt-2 flex flex-col items-center text-center">
                        {/* Title — Playfair Display, 14px, bold */}
                        <h5 className="text-[#1A1A1C] font-bold text-[14px] leading-tight line-clamp-2 mb-1.5" style={{ fontFamily: 'Cormorant Garamond, Playfair Display, serif' }}>
                          {getLocalizedField(perk, 'title', language) || perk.title_en}
                        </h5>

                        {/* Star icon */}
                        <Star className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37] mb-1.5" />

                        {/* Description */}
                        <p className="text-[#8B8680] text-[11px] leading-snug line-clamp-2 mb-3">
                          {getLocalizedField(perk, 'description', language) || perk.description_en}
                        </p>

                        {/* Activate button */}
                        {activated ? (
                          <div className="flex items-center gap-1.5 bg-[#E8F5E9] border border-[#2E7D32] px-3 py-1.5 rounded-full">
                            <CheckCircle className="w-3 h-3 text-[#2E7D32]" />
                            <span className="text-[#2E7D32] text-[9px] font-bold uppercase">{t('activated', 'ACTIVATED')}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 border border-[#D4AF37] px-3 py-1.5 rounded-full">
                            <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                            <span className="text-[#D4AF37] text-[9px] font-bold uppercase">{t('tap_to_activate', 'TAP TO ACTIVATE')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 text-center">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D4AF37]/10 to-[#CD7F32]/10 border border-[#D4AF37]/30 px-4 py-2 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
                <span className="text-[#5C5850] text-[10px] uppercase tracking-wider font-semibold">
                  {t('home.card.swipe_return', 'DOUBLE TAP to Return')}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Perk Action Modal - portaled to body for full-screen overlay */}
      {selectedPerk && createPortal(
        <PerkActionModal
          isOpen={perkActionModalOpen}
          onClose={() => setPerkActionModalOpen(false)}
          perk={selectedPerk}
          venueName={venue.name}
          venueNameAr={venue.nameAr}
          venueNameFr={venue.nameFr}
          onWalkIn={handlePerkWalkIn}
          onBookNow={handlePerkBookNow}
        />,
        document.body
      )}

      <style>{`
        .perspective-1000px {
          perspective: 1000px;
        }

        .preserve-3d {
          transform-style: preserve-3d;
        }

        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .rotate-y-180 {
          transform: rotateY(180deg);
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(212, 175, 55, 0.1);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #D4AF37, #CD7F32);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #CD7F32, #D4AF37);
        }

        @keyframes bounce-slow {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }

        .animate-pulse-border {
          animation: pulse-border 2s infinite;
        }

        @keyframes pulse-border {
          0%, 100% {
            border-color: #FF8C42;
          }
          50% {
            border-color: #FF6B35;
          }
        }
      `}</style>
    </div>
  );
}
