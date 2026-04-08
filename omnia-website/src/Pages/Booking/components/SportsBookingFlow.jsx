import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Calendar, Clock, Users, CheckCircle, Trophy, ChevronRight,
  Info, Zap, Flame, Star, Timer, Sparkles, MapPin, Download, Share2, Loader2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { CalendarPickerModal } from '@/Shared/CalendarPickerModal';
import { getLocalizedField, getDateLocale } from '@/lib/localization';
import { fetchData } from '@/helpers/fetchData';

// Convert "6:00 PM" → "18:00:00.000"
function formatTimeTo24h(timeStr) {
  const [time, period] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00.000`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

import { isBoostPerk } from '@/lib/perkUtils';

export function SportsBookingFlow({ venueId, venue, onBack, onComplete, preSelectedResource, preSelectedPerk }) {
  const { t, i18n } = useTranslation();
  const user = useSelector(state => state.auth?.user);
  const language = i18n.language;
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCourt, setSelectedCourt] = useState(preSelectedResource || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [selectedPerk, setSelectedPerk] = useState(preSelectedPerk || null);
  const [partySize, setPartySize] = useState(2);
  const [bookingStatus, setBookingStatus] = useState('idle');
  const [stepTimes, setStepTimes] = useState({ requested: 0, pending: 0, approved: 0, confirmed: 0 });

  // Dynamic Sport Theming
  const getSportTheme = () => {
    const subcategory = venue.subcategoryId?.toLowerCase() || 'padel';
    
    switch (subcategory) {
      case 'basketball':
        return {
          primary: '#E85D04',
          secondary: '#D56F3E',
          gradient: 'from-[#E85D04] to-[#D56F3E]',
          light: '#FDEDE4',
          emoji: '🏀',
          name: 'Basketball',
          maxTeamSize: 10
        };
      case 'football':
        return {
          primary: '#1E40AF',
          secondary: '#2563EB',
          gradient: 'from-[#1E40AF] to-[#2563EB]',
          light: '#EEF2FF',
          emoji: '⚽',
          name: 'Football',
          maxTeamSize: 10
        };
      case 'padel':
      default:
        return {
          primary: '#4A7C2C',
          secondary: '#5C9234',
          gradient: 'from-[#4A7C2C] to-[#D4AF37]',
          light: '#F0F7ED',
          emoji: '🎾',
          name: 'Padel',
          maxTeamSize: 4
        };
    }
  };

  const theme = getSportTheme();

  // Check if selected date is today
  const isSelectedDateToday = (() => {
    if (!selectedDate) return false;
    const sel = new Date(selectedDate);
    const now = new Date();
    return sel.getFullYear() === now.getFullYear() &&
      sel.getMonth() === now.getMonth() &&
      sel.getDate() === now.getDate();
  })();

  // Check if a session duration should be disabled (not enough time left today)
  const isSessionDisabled = (minutes) => {
    if (!isSelectedDateToday) return false;
    const now = new Date();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    return (endOfDay - now) / 60000 < minutes;
  };

  // Check if a time slot is in the past (only for today)
  const isSlotInPast = (slot) => {
    if (!isSelectedDateToday) return false;
    const now = new Date();
    const [h, m] = slot.split(':').map(Number);
    const slotTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m || 0);
    return slotTime <= now;
  };

  // Auto-deselect duration/time if they become disabled when date changes to today
  useEffect(() => {
    if (isSessionDisabled(duration)) {
      setDuration(60);
      setSelectedTime('');
    } else if (selectedTime && isSlotInPast(selectedTime)) {
      setSelectedTime('');
    }
  }, [selectedDate]); // eslint-disable-line react-hooks/exhaustive-deps

  // Duration options
  const durationOptions = [
    { value: 60, label: '1h', labelFull: '1 hour', emoji: '⚡', tag: t('booking.quick_match', 'QUICK MATCH') },
    { value: 90, label: '1.5h', labelFull: '1.5 hours', emoji: '🎯', tag: t('booking.perfect_session', 'PERFECT SESSION') },
    { value: 120, label: '2h', labelFull: '2 hours', emoji: '🏆', tag: t('booking.pro_session', 'PRO SESSION') },
  ];

  // Generate time slots dynamically based on selected duration (same as mobile app)
  const generateTimeSlots = () => {
    const startHour = 6; // 06:00
    const endHour = 23;  // 23:00
    const intervalMinutes = duration;
    const allSlots = [];

    let currentMinutes = startHour * 60;
    while (currentMinutes + intervalMinutes <= endHour * 60) {
      const h = Math.floor(currentMinutes / 60);
      const m = currentMinutes % 60;
      allSlots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      currentMinutes += intervalMinutes;
    }

    // Categorize into Early Bird / Prime Time / Golden Hour
    const morning = [];
    const afternoon = [];
    const evening = [];
    allSlots.forEach(slot => {
      const hour = parseInt(slot.split(':')[0], 10);
      if (hour < 12) morning.push(slot);
      else if (hour < 17) afternoon.push(slot);
      else evening.push(slot);
    });

    const groups = {};
    if (morning.length > 0) groups.morning = { label: t('booking.early_bird', 'EARLY BIRD'), icon: '🌅', slots: morning };
    if (afternoon.length > 0) groups.afternoon = { label: t('booking.prime_time', 'PRIME TIME'), icon: '🏅', slots: afternoon };
    if (evening.length > 0) groups.evening = { label: t('booking.golden_hour', 'GOLDEN HOUR'), icon: '🔥', isPeak: true, slots: evening };
    return groups;
  };

  const timeSlots = generateTimeSlots();

  // Court price calculation — matches customer app: pricePerHour * (duration / 60)
  const getCourtPrice = (court) => {
    const hourlyRate = court.price_per_hour || court.pricePerHour || court.minimum_spend || court.minimumSpend || 0;
    if (!hourlyRate) return 0;
    return Math.round(hourlyRate * (duration / 60));
  };

  // Court availability calculation
  const getCourtAvailability = () => {
    if (!selectedDate || !selectedTime || !venue.resources) return [];
    return (venue.resources || []).map(court => ({
      courtId: court.id,
      available: true,
      price: getCourtPrice(court),
    }));
  };

  const courtAvailability = getCourtAvailability();

  // Simulate booking flow
  useEffect(() => {
    if (bookingStatus === 'submitted') {
      const timer1 = setTimeout(() => {
        setBookingStatus('pending');
        setStepTimes(prev => ({ ...prev, requested: 0 }));
      }, 500);
      return () => clearTimeout(timer1);
    }
    
    if (bookingStatus === 'pending') {
      let elapsed = 0;
      const interval = setInterval(() => {
        elapsed++;
        setStepTimes(prev => ({ ...prev, pending: elapsed }));
        if (elapsed >= 22) {
          clearInterval(interval);
          setBookingStatus('approved');
          setStepTimes(prev => ({ ...prev, approved: 5 }));
        }
      }, 1000);
      return () => clearInterval(interval);
    }
    
    if (bookingStatus === 'approved') {
      const timer = setTimeout(() => {
        setBookingStatus('confirmed');
        setStepTimes(prev => ({ ...prev, confirmed: 7 }));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [bookingStatus]);

  const handleConfirmBooking = async () => {
    try {
      const payload = {
        resource_id: selectedCourt || '',
        booking_date: formatDate(selectedDate),
        start_time: formatTimeTo24h(selectedTime),
        duration_minutes: duration || 15,
        party_size: partySize,
        guest_name: user?.full_name || 'Guest',
        guest_email: user?.email || '',
        guest_phone: user?.phone_number || '',
      };
      if (selectedPerk) {
        if (isBoostPerk(selectedPerk)) {
          payload.boost_perk_id = selectedPerk.id;
        } else {
          payload.exclusive_perk_id = selectedPerk.id;
        }
      }
      const result = await fetchData('POST', `/bookings/${venueId}`, payload);
      const bookingId = result?.data?.id || result?.id;
      onComplete({
        bookingId,
        venueId,
        venueName: venue.name_en,
        venueImage: venue.image,
        date: payload.booking_date,
        time: payload.start_time,
        partySize: payload.party_size,
        status: result?.data?.status || result?.status || 'pending',
      });
    } catch (err) {
      console.error('Booking failed:', err);
    }
  };

  const handleBackToHome = () => {
    window.location.href = '/home';
  };

  const handleViewBookings = () => {
    window.location.href = '/bookings';
  };

  const canProceedToStep2 = selectedCourt;
  const canProceedToStep3 = selectedDate && selectedTime && duration;

  // Generate booking code
  const bookingCode = `QR_ABC123`;

  return (
    <div className="min-h-screen bg-[#FFFCF8]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-[#E8E3D5]">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onBack()}
              className="w-10 h-10 rounded-xl border-2 border-[#E8E3D5] flex items-center justify-center hover:border-[#D4AF37] transition-all cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-[#5C5850]" />
            </button>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Trophy className="w-5 h-5 text-[#D4AF37]" />
                <h1 className="text-[#1A1A1C] text-lg font-bold font-serif">
                  {getLocalizedField(venue, 'name', language)}
                </h1>
              </div>
              {currentStep < 4 && (
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3].map(step => (
                    <div 
                      key={step} 
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        step === currentStep 
                          ? `bg-gradient-to-r ${theme.gradient} w-8` 
                          : step < currentStep 
                          ? 'w-6' 
                          : 'bg-[#E8E3D5] w-4'
                      }`}
                      style={step < currentStep ? { backgroundColor: theme.primary } : {}}
                    />
                  ))}
                </div>
              )}
            </div>
            
            <div className="w-10" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`max-w-3xl mx-auto px-6 ${currentStep < 4 ? 'pb-32' : 'pb-8'}`}>
        {/* Step 1: Court Selection */}
        {currentStep === 1 && (
          <div className="py-8 space-y-8">
            {/* Title */}
            <div className="text-center">
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 border-2"
                style={{ 
                  backgroundColor: `${theme.primary}15`, 
                  borderColor: `${theme.primary}33` 
                }}
              >
                <Trophy className="w-4 h-4" style={{ color: theme.primary }} />
                <span className="text-sm font-bold uppercase tracking-wide" style={{ color: theme.primary }}>
                  {t('booking.step_1_of_3', 'STEP 1 OF 3')}
                </span>
              </div>
              <h2 className="text-3xl font-serif font-semibold text-[#1A1A1C] mb-2">
                {t('booking.pick_your_court', 'Pick Your Perfect Court')} {theme.emoji}
              </h2>
              <p className="text-[#8B8680]">
                {t('booking.explore_courts', 'Explore our courts and find your favorite')}
              </p>
            </div>

            {/* Courts Grid */}
            {!venue.resources || venue.resources.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-[#F8F6F1] flex items-center justify-center mx-auto mb-4">
                  <Info className="w-8 h-8 text-[#8B8680]" />
                </div>
                <p className="text-[#8B8680]">
                  {t('No courts available', 'لا توجد ملاعب متاحة')}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {venue.resources
                  .filter(() => true) /* show all resources — API type names vary */
                  .map((court) => {
                    const isSelected = selectedCourt === court.id;
                    const isFeatured = court.is_featured || court.isFeatured;
                    const hourlyRate = court.price_per_hour || court.pricePerHour || court.minimum_spend || court.minimumSpend;

                    return (
                      <button
                        key={court.id}
                        onClick={() => setSelectedCourt(court.id)}
                        className={`w-full bg-white rounded-2xl border-2 overflow-hidden text-left transition-all cursor-pointer ${
                          isSelected ? 'shadow-lg' : 'border-[#E8E3D5] hover:shadow-md'
                        }`}
                        style={isSelected ? { borderColor: theme.primary, backgroundColor: `${theme.primary}08` } : {}}
                      >
                        <div className="flex gap-3 p-3">
                          {/* Image — 80×80 matching customer app */}
                          <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-[#F8F6F1]">
                            {court.image ? (
                              <img
                                src={court.image}
                                alt={getLocalizedField(court, 'name', language)}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Trophy className="w-8 h-8 text-[#D4AF37]/30" />
                              </div>
                            )}
                            {isFeatured && (
                              <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-[#D4AF37] rounded-md flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 text-white fill-white" />
                                <span className="text-white text-[9px] font-bold">PRO</span>
                              </div>
                            )}
                            {isSelected && (
                              <div className="absolute inset-0 bg-green-500/10" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3
                                className="text-sm font-bold font-serif leading-tight"
                                style={{ color: isSelected ? theme.primary : '#1A1A1C' }}
                              >
                                {getLocalizedField(court, 'name', language)}
                              </h3>
                              {isFeatured && (
                                <span className="flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                                  style={{ backgroundColor: `${theme.primary}15`, color: theme.primary, border: `1px solid ${theme.primary}33` }}>
                                  POPULAR
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1 text-[11px] text-[#8B8680] mb-1.5">
                              <Users className="w-3 h-3" />
                              <span>{t('booking.max', 'Max')} {court.capacity} {t('booking.players', 'players')}</span>
                            </div>

                            {Array.isArray(court.amenities) && court.amenities.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-1.5">
                                {court.amenities.slice(0, 3).map((amenity, idx) => (
                                  <span key={idx} className="text-[9px] text-[#5C5850] bg-[#F8F6F1] px-1.5 py-0.5 rounded-lg border border-[#E8E3D5]">
                                    {typeof amenity === 'object' ? (amenity.name || '') : amenity}
                                  </span>
                                ))}
                              </div>
                            )}

                            {hourlyRate > 0 && (
                              <div className="text-[11px] font-bold" style={{ color: theme.primary }}>
                                {t('booking.from', 'From')} {hourlyRate} {t('booking.aed_hr', 'AED/hr')}
                              </div>
                            )}
                          </div>

                          {/* Checkmark */}
                          {isSelected && (
                            <div className="flex-shrink-0 self-center">
                              <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-md`}>
                                <CheckCircle className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
              </div>
            )}

            {/* Info Note */}
            <div 
              className="p-4 rounded-2xl border-2"
              style={{ 
                background: `linear-gradient(to right, ${theme.primary}15, ${theme.secondary}10)`,
                borderColor: `${theme.primary}33`
              }}
            >
              <div className="flex gap-3 items-start">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center flex-shrink-0`}>
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="text-sm text-[#5C5850]">
                  <p className="font-bold mb-1" style={{ color: theme.primary }}>
                    {t('booking.choose_first', 'Choose First, Book Later!')} 🎯
                  </p>
                  <p>{t('booking.choose_first_desc', "Select your preferred court now, then we'll show you its real-time availability on the next step.")}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Date/Time/Duration */}
        {currentStep === 2 && (
          <div className="py-8 space-y-8">
            <div className="text-center">
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 border-2"
                style={{ 
                  backgroundColor: `${theme.primary}15`, 
                  borderColor: `${theme.primary}33` 
                }}
              >
                <Zap className="w-4 h-4" style={{ color: theme.primary }} />
                <span className="text-sm font-bold uppercase tracking-wide" style={{ color: theme.primary }}>
                  {t('booking.step_2_of_3', 'STEP 2 OF 3')}
                </span>
              </div>
              <h2 className="text-3xl font-serif font-semibold text-[#1A1A1C] mb-2">
                {t('booking.when_play', 'When Would You Like to Play?')} ⚡
              </h2>
              <p className="text-[#8B8680]">
                {t('booking.check_availability', 'Check availability for')} <span className="font-bold" style={{ color: theme.primary }}>{venue.resources?.find(r => r.id === selectedCourt)?.name}</span>
              </p>
            </div>

            {/* Calendar */}
            <div className="bg-white rounded-2xl border-2 border-[#E8E3D5] p-6">
              <CalendarPickerModal
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                minDate={new Date()}
                accentColor={theme.primary}
              />
            </div>

            {/* Duration */}
            <div className="bg-white rounded-2xl border-2 border-[#E8E3D5] p-6">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Timer className="w-5 h-5 text-[#D4AF37]" />
                <label className="text-[#1A1A1C] font-bold text-lg">
                  {t('booking.session_length', 'Session Length')}
                </label>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {durationOptions.map(option => {
                  const disabled = isSessionDisabled(option.value);
                  const isActive = duration === option.value && !disabled;
                  return (
                    <button
                      key={option.value}
                      onClick={() => { if (!disabled) { setDuration(option.value); setSelectedTime(''); } }}
                      disabled={disabled}
                      className={`relative p-4 rounded-xl border-2 transition-all ${
                        disabled
                          ? 'border-[#E8E3D5] bg-[#F5F3ED] opacity-40 cursor-not-allowed'
                          : isActive
                            ? 'shadow-lg cursor-pointer'
                            : 'border-[#E8E3D5] bg-white hover:border-[#D4AF37]/50 cursor-pointer'
                      }`}
                      style={
                        isActive
                          ? {
                              borderColor: theme.primary,
                              background: `linear-gradient(to bottom right, ${theme.primary}15, ${theme.secondary}10)`
                            }
                          : {}
                      }
                    >
                      <div className="text-2xl mb-1">{option.emoji}</div>
                      <div
                        className="text-xl font-bold mb-0.5 font-serif"
                        style={{ color: isActive ? theme.primary : disabled ? '#8B8680' : '#1A1A1C' }}
                      >
                        {option.label}
                      </div>
                      <div className={`text-xs font-bold uppercase tracking-wider ${isActive ? '' : 'text-[#8B8680]'}`} style={isActive ? { color: theme.primary } : {}}>
                        {option.tag}
                      </div>
                      {isActive && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle className="w-4 h-4" style={{ color: theme.primary }} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Selection */}
            <div className="bg-white rounded-2xl border-2 border-[#E8E3D5] p-6 space-y-6">
              <div className="flex items-center justify-center gap-2">
                <Flame className="w-5 h-5 text-[#D4AF37]" />
                <label className="text-[#1A1A1C] font-bold text-lg">
                  {t('booking.choose_time', 'Choose Your Time')}
                </label>
              </div>

              {Object.entries(timeSlots).map(([key, timeGroup]) => (
                <div key={key}>
                  <div className="flex items-center gap-2 mb-4 justify-center">
                    <span className="text-xl">{timeGroup.icon}</span>
                    <span className="font-bold uppercase tracking-wider" style={{ color: timeGroup.isPeak ? '#E85D04' : theme.primary }}>
                      {timeGroup.label}
                    </span>
                    {timeGroup.isPeak && (
                      <div className="px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                        <span className="text-white text-xs font-bold">{t('booking.peak', 'PEAK')} 🔥</span>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {timeGroup.slots.map((slot) => {
                      const isSelected = selectedTime === slot;
                      const isPeak = timeGroup.isPeak;
                      // Disable if slot + duration exceeds 23:00 OR slot is in the past (today only)
                      const [slotHour, slotMin] = slot.split(':').map(Number);
                      const slotMinutes = slotHour * 60 + (slotMin || 0);
                      const isDisabled = slotMinutes + duration > 23 * 60 || isSlotInPast(slot);
                      return (
                        <button
                          key={slot}
                          onClick={() => !isDisabled && setSelectedTime(slot)}
                          disabled={isDisabled}
                          className={`relative py-3 px-2 rounded-xl border-2 transition-all ${
                            isDisabled
                              ? 'border-[#E8E3D5] bg-[#F5F3ED] opacity-40 cursor-not-allowed'
                              : isSelected
                              ? 'shadow-lg cursor-pointer'
                              : isPeak
                              ? 'border-orange-200 bg-orange-50/50 cursor-pointer'
                              : 'border-[#E8E3D5] bg-white cursor-pointer'
                          }`}
                          style={
                            isSelected && !isDisabled
                              ? {
                                  borderColor: theme.primary,
                                  background: `linear-gradient(to bottom right, ${theme.primary}15, ${theme.secondary}10)`
                                }
                              : {}
                          }
                        >
                          <div
                            className="text-base font-bold font-serif"
                            style={{ color: isSelected && !isDisabled ? theme.primary : '#1A1A1C' }}
                          >
                            {slot}
                          </div>
                          {isSelected && !isDisabled && (
                            <div className="absolute top-1 right-1">
                              <CheckCircle className="w-3 h-3" style={{ color: theme.primary }} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {currentStep === 3 && (
          <div className="py-8 space-y-8">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-lg`}>
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                <div 
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg"
                  style={{
                    animation: 'floatUpDown 2s ease-in-out infinite'
                  }}
                >
                  <Star className="w-4 h-4 text-white fill-white" />
                </div>
                <style>{`
                  @keyframes floatUpDown {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-6px); }
                  }
                `}</style>
              </div>
              <h2 className="text-3xl font-serif font-semibold text-[#1A1A1C] mb-2">
                {t('booking.almost_there', 'Almost There, Champ!')} 🏆
              </h2>
              <p className="text-[#8B8680]">
                {t('booking.review_court_time', 'Review and lock in your court time')}
              </p>
            </div>

            {/* Summary Card */}
            {(() => {
              const reviewCourt = venue.resources?.find(r => r.id === selectedCourt);
              const reviewCourtName = reviewCourt ? getLocalizedField(reviewCourt, 'name', language) : '';
              return (
            <div className="bg-white rounded-2xl border-2 border-[#E8E3D5] overflow-hidden">
              {reviewCourt?.image ? (
                <div className="relative h-40">
                  <img
                    src={reviewCourt.image}
                    alt={reviewCourtName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-4 left-6">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-[#D4AF37]" />
                      <h3 className="text-white text-xl font-bold font-serif">{reviewCourtName}</h3>
                    </div>
                  </div>
                </div>
              ) : reviewCourtName ? (
                <div className={`h-16 bg-gradient-to-r ${theme.gradient} flex items-center px-6 gap-3`}>
                  <Trophy className="w-6 h-6 text-white" />
                  <h3 className="text-white text-xl font-bold font-serif">{reviewCourtName}</h3>
                </div>
              ) : null}

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-[#E8E3D5]">
                  <div className="flex items-center gap-2 text-[#8B8680]">
                    <Calendar className="w-4 h-4" />
                    <span className="font-semibold">{t('booking.game_day', 'Game Day')}</span>
                  </div>
                  <span className="text-[#1A1A1C] font-bold">
                    {selectedDate && new Date(selectedDate).toLocaleDateString(getDateLocale(language), { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-[#E8E3D5]">
                  <div className="flex items-center gap-2 text-[#8B8680]">
                    <Clock className="w-4 h-4" />
                    <span className="font-semibold">{t('booking.start_time', 'Start Time')}</span>
                  </div>
                  <span className="text-[#1A1A1C] font-bold text-lg">{selectedTime}</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-[#E8E3D5]">
                  <div className="flex items-center gap-2 text-[#8B8680]">
                    <Timer className="w-4 h-4" />
                    <span className="font-semibold">{t('booking.session', 'Session')}</span>
                  </div>
                  <span className="text-[#1A1A1C] font-bold">
                    {durationOptions.find(d => d.value === duration)?.labelFull}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-[#E8E3D5]">
                  <div>
                    <div className="flex items-center gap-2 text-[#8B8680] mb-0.5">
                      <Users className="w-4 h-4" />
                      <span className="font-semibold">{t('booking.team_size', 'Team Size')}</span>
                    </div>
                    <p className="text-xs text-[#8B8680]">{t('booking.for_reference', 'For venue reference')}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    {Array.from({ length: Math.min(reviewCourt?.capacity || theme.maxTeamSize, theme.maxTeamSize) }, (_, i) => i + 1).map(size => (
                      <button
                        key={size}
                        onClick={() => setPartySize(size)}
                        className={`w-10 h-10 rounded-xl border-2 transition-all cursor-pointer ${
                          partySize === size
                            ? 'shadow-md'
                            : 'border-[#E8E3D5] text-[#8B8680]'
                        }`}
                        style={
                          partySize === size
                            ? {
                                borderColor: theme.primary,
                                background: `linear-gradient(to bottom right, ${theme.primary}15, ${theme.secondary}10)`,
                                color: theme.primary
                              }
                            : {}
                        }
                      >
                        <span className="text-sm font-bold">{size}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div>
                    <div className="text-[#8B8680] text-sm mb-1">{t('booking.total_investment', 'Total Investment')}</div>
                    <div className="text-[#1A1A1C] font-bold">{t('booking.pay_at_venue', 'Pay at venue')}</div>
                  </div>
                  <div className="text-right">
                    <div 
                      className="text-4xl font-bold font-serif" 
                      style={{ color: theme.primary }}
                    >
                      {getCourtPrice(reviewCourt || {})}
                    </div>
                    <div className="text-sm text-[#8B8680] font-bold uppercase">AED</div>
                  </div>
                </div>
              </div>
            </div>
            );
            })()}

            {/* Policy */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-2xl border-2 border-amber-200/50">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <Info className="w-5 h-5 text-white" />
                </div>
                <div className="text-sm text-[#5C5850]">
                  <p className="font-bold mb-2 text-amber-900">{t('booking.fair_play_policy', 'Fair Play Policy')} 🤝</p>
                  <ul className="space-y-1 text-xs">
                    <li>✓ {t('booking.free_cancellation', 'Free cancellation up to 24 hours before')}</li>
                    <li>✓ {t('booking.grace_period', '15-minute grace period for late arrivals')}</li>
                    <li>✓ {t('booking.equipment_included', 'Equipment rental included')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {currentStep === 4 && (
          <div className="py-12 space-y-8">
            {/* Status Icon */}
            <div className="flex justify-center">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${
                bookingStatus === 'confirmed'
                  ? 'bg-[#E8F5E9]'
                  : 'bg-[#FFF8E1]'
              }`}>
                {bookingStatus === 'confirmed' ? (
                  <CheckCircle className="w-12 h-12 text-[#4A7C2C]" strokeWidth={2} />
                ) : (
                  <div className="animate-spin">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                      {[...Array(12)].map((_, i) => (
                        <line
                          key={i}
                          x1="12"
                          y1="2"
                          x2="12"
                          y2="6"
                          stroke="#D4AF37"
                          strokeWidth="2"
                          strokeLinecap="round"
                          opacity={0.25 + (i / 12) * 0.75}
                          transform={`rotate(${i * 30} 12 12)`}
                        />
                      ))}
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Status Text */}
            <div className="text-center">
              <h2 className="text-3xl font-serif font-semibold text-[#1A1A1C] mb-2">
                {bookingStatus === 'confirmed' 
                  ? t('booking.confirmed_title', 'Booking Confirmed!')
                  : t('booking.submitted_title', 'Request Submitted')
                }
              </h2>
              <p className="text-[#8B8680]">
                {bookingStatus === 'confirmed'
                  ? t('booking.confirmed_subtitle', 'Your reservation is confirmed and ready')
                  : t('booking.submitted_subtitle', 'Awaiting venue approval...')
                }
              </p>
            </div>

            {/* Booking Status Timeline */}
            <div className="bg-white rounded-2xl border-2 border-[#E8E3D5] p-6 max-w-lg mx-auto">
              <h3 className="text-[#1A1A1C] font-bold mb-6">{t('booking.booking_status', 'Booking Status')}</h3>
              
              <div className="space-y-0">
                {/* Step 1: Request Placed */}
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-[#4A7C2C] flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div className="w-0.5 h-8 bg-[#4A7C2C]" />
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-[#1A1A1C]">{t('booking.request_placed', 'Request Placed')}</p>
                      <span className="text-[#8B8680] text-sm">0s</span>
                    </div>
                  </div>
                </div>

                {/* Step 2: Pending Approval */}
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      bookingStatus === 'pending' ? 'bg-[#D4AF37]' : 
                      bookingStatus === 'approved' || bookingStatus === 'confirmed' ? 'bg-[#4A7C2C]' : 'bg-[#E8E3D5]'
                    }`}>
                      {bookingStatus === 'pending' ? (
                        <div className="animate-spin">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            {[...Array(12)].map((_, i) => (
                              <line
                                key={i}
                                x1="12"
                                y1="2"
                                x2="12"
                                y2="6"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                opacity={0.25 + (i / 12) * 0.75}
                                transform={`rotate(${i * 30} 12 12)`}
                              />
                            ))}
                          </svg>
                        </div>
                      ) : bookingStatus === 'approved' || bookingStatus === 'confirmed' ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-[#8B8680]" />
                      )}
                    </div>
                    <div className={`w-0.5 h-8 ${
                      bookingStatus === 'approved' || bookingStatus === 'confirmed' ? 'bg-[#4A7C2C]' : 'bg-[#E8E3D5]'
                    }`} />
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-[#1A1A1C]">{t('booking.pending_approval', 'Pending Approval')}</p>
                        {bookingStatus === 'pending' && (
                          <p className="text-[#8B8680] text-sm">{t('booking.venue_respond', 'Venue will respond shortly...')}</p>
                        )}
                      </div>
                      <span className="text-[#8B8680] text-sm">
                        {stepTimes.pending > 0 ? `${stepTimes.pending}s` : '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Step 3: Approved by Venue */}
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      bookingStatus === 'approved' || bookingStatus === 'confirmed' ? 'bg-[#4A7C2C]' : 'bg-[#E8E3D5]'
                    }`}>
                      {bookingStatus === 'approved' || bookingStatus === 'confirmed' ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-[#8B8680]" />
                      )}
                    </div>
                    <div className={`w-0.5 h-8 ${
                      bookingStatus === 'confirmed' ? 'bg-[#4A7C2C]' : 'bg-[#E8E3D5]'
                    }`} />
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex justify-between items-center">
                      <p className={`font-semibold ${
                        bookingStatus === 'approved' || bookingStatus === 'confirmed' ? 'text-[#1A1A1C]' : 'text-[#8B8680]'
                      }`}>{t('booking.approved_venue', 'Approved by Venue')}</p>
                      <span className="text-[#8B8680] text-sm">
                        {stepTimes.approved > 0 ? `${stepTimes.approved}s` : '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Step 4: Confirmed */}
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      bookingStatus === 'confirmed' ? 'bg-[#D4AF37]' : 'bg-[#E8E3D5]'
                    }`}>
                      {bookingStatus === 'confirmed' ? (
                        <Sparkles className="w-4 h-4 text-white" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-[#8B8680]" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className={`font-semibold ${
                        bookingStatus === 'confirmed' ? 'text-[#1A1A1C]' : 'text-[#8B8680]'
                      }`}>{t('booking.confirmed_status', 'Confirmed')}</p>
                      <span className="text-[#8B8680] text-sm">
                        {stepTimes.confirmed > 0 ? `${stepTimes.confirmed}s` : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Note */}
            {bookingStatus !== 'confirmed' && (
              <div className="bg-[#FFF8E1] rounded-xl p-4 border border-[#E8DCC8] max-w-lg mx-auto">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#F5E6C3] flex items-center justify-center flex-shrink-0">
                    <Clock className="w-3 h-3 text-[#D4AF37]" />
                  </div>
                  <p className="text-[#8B7355] text-sm">
                    {t('booking.response_note', 'The venue typically responds within 3 minutes. You will receive an email and push notification once approved.')}
                  </p>
                </div>
              </div>
            )}

            {/* QR Code and Details (shown after confirmation) */}
            {bookingStatus === 'confirmed' && (
              <>
                {/* QR Code */}
                <div className="bg-white rounded-2xl border-2 border-[#E8E3D5] p-6 max-w-lg mx-auto">
                  <div className="flex justify-center mb-4">
                    <div className="w-40 h-40 rounded-2xl bg-[#F8F6F1] border-2 border-[#E8E3D5] flex flex-col items-center justify-center">
                      <Sparkles className="w-10 h-10 text-[#D4AF37] mb-2" />
                      <span className="text-[#8B8680] text-sm">QR CODE</span>
                    </div>
                  </div>
                  <p className="text-center text-[#1A1A1C] font-mono font-bold mb-2">{bookingCode}</p>
                  <p className="text-center text-[#8B8680] text-sm">{t('booking.show_qr', 'Show this QR code at the venue')}</p>
                  
                  <div className="my-6 border-t border-[#E8E3D5]" />

                  {/* Booking Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-[#F8F6F1] rounded-xl">
                      <MapPin className="w-5 h-5 text-[#8B8680]" />
                      <span className="text-[#1A1A1C] font-medium">{getLocalizedField(venue, 'name', language)}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-[#F8F6F1] rounded-xl">
                      <Calendar className="w-5 h-5 text-[#8B8680]" />
                      <span className="text-[#1A1A1C] font-medium">{selectedDate}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-[#F8F6F1] rounded-xl">
                      <Clock className="w-5 h-5 text-[#8B8680]" />
                      <span className="text-[#1A1A1C] font-medium">{selectedTime}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-[#F8F6F1] rounded-xl">
                      <Timer className="w-5 h-5 text-[#8B8680]" />
                      <span className="text-[#1A1A1C] font-medium">{durationOptions.find(d => d.value === duration)?.labelFull}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-[#F8F6F1] rounded-xl">
                      <Users className="w-5 h-5 text-[#8B8680]" />
                      <span className="text-[#1A1A1C] font-medium">{partySize} {t('booking.guests_label', 'Guests')}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 max-w-lg mx-auto">
                  <button className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-[#E8E3D5] bg-white text-[#5C5850] font-semibold hover:border-[#D4AF37] transition-all cursor-pointer">
                    <Download className="w-5 h-5" />
                    {t('booking.download', 'Download')}
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-[#E8E3D5] bg-white text-[#5C5850] font-semibold hover:border-[#D4AF37] transition-all cursor-pointer">
                    <Share2 className="w-5 h-5" />
                    {t('booking.share', 'Share')}
                  </button>
                </div>

                {/* Navigation Buttons */}
                <div className="max-w-lg mx-auto space-y-3">
                  <button
                    onClick={handleViewBookings}
                    className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#CD7F32] text-white rounded-xl font-bold hover:shadow-lg transition-all cursor-pointer"
                  >
                    {t('booking.view_bookings', 'View My Bookings')}
                  </button>
                  <button
                    onClick={handleBackToHome}
                    className="w-full py-4 text-[#D4AF37] font-semibold hover:underline transition-all cursor-pointer"
                  >
                    {t('booking.back_home', 'Back to Home')}
                  </button>
                </div>
              </>
            )}

            {/* Back to Home button when still pending */}
            {bookingStatus !== 'confirmed' && (
              <div className="max-w-lg mx-auto">
                <button
                  onClick={handleBackToHome}
                  className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#CD7F32] text-white rounded-xl font-bold hover:shadow-lg transition-all cursor-pointer"
                >
                  {t('booking.back_home', 'Back to Home')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      {currentStep < 4 && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-[#E8E3D5] to-[#F5F0E6] border-t border-[#E8E3D5] p-4 z-50">
          <div className="max-w-3xl mx-auto flex items-center gap-3 px-2">
            {currentStep > 1 && (
              <button
                onClick={() => { setCurrentStep(currentStep - 1); window.scrollTo(0, 0); }}
                className="px-6 py-4 bg-white border-2 border-[#E8E3D5] text-[#5C5850] rounded-xl hover:bg-[#F8F6F1] hover:scale-105 transition-all duration-200 font-bold cursor-pointer"
              >
                {t('booking.back', 'Back')}
              </button>
            )}
            
            <button
              onClick={() => {
                if (currentStep === 3) {
                  handleConfirmBooking();
                } else {
                  setCurrentStep(currentStep + 1);
                  window.scrollTo(0, 0);
                }
              }}
              disabled={
                (currentStep === 1 && !canProceedToStep2) ||
                (currentStep === 2 && !canProceedToStep3)
              }
              className={`flex-1 py-4 bg-gradient-to-r ${theme.gradient} text-white rounded-xl font-bold disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer`}
            >
              {currentStep === 3 ? (
                <>
                  <Trophy className="w-5 h-5" />
                  {t('booking.lock_it_in', 'Lock It In!')} {theme.emoji}
                </>
              ) : (
                <>
                  {t('booking.next_step', 'Next Step')}
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
