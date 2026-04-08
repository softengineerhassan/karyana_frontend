import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Calendar, Clock, Users, CheckCircle, ChevronRight,
  Gift, Sun, Sunset, Moon, Stars, Heart, Award, Cake, PartyPopper,
  Briefcase, UsersRound, Baby, User, Sparkles, MapPin, Download, Share2,
  Loader2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { CalendarPickerModal } from '@/Shared/CalendarPickerModal';
import { getLocalizedField } from '@/lib/localization';
import { fetchData } from '@/helpers/fetchData';
import toast from 'react-hot-toast';

// Convert "6:00 PM" → "18:00:00.000"
function formatTimeTo24h(timeStr) {
  const [time, period] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00.000`;
}

// Format date to YYYY-MM-DD
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

import { isBoostPerk, isBoostActive, resolveExclusivePerks } from '@/lib/perkUtils';

export function RestaurantBookingFlow({ venueId, venue, onBack, onComplete, preSelectedResource, preSelectedPerk }) {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const user = useSelector(state => state.auth?.user);
  const [currentStage, setCurrentStage] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('');
  const [guestCount, setGuestCount] = useState(2);
  const [selectedResource, setSelectedResource] = useState(preSelectedResource || '');
  const [selectedPerk, setSelectedPerk] = useState(preSelectedPerk || null);
  const [selectedOccasion, setSelectedOccasion] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingStatus, setBookingStatus] = useState('idle'); // idle, submitted, pending, approved, confirmed
  const [stepTimes, setStepTimes] = useState({ requested: 0, pending: 0, approved: 0, confirmed: 0 });

  // Check if selected date is today
  const isSelectedDateToday = (() => {
    if (!selectedDate) return false;
    const sel = new Date(selectedDate);
    const now = new Date();
    return sel.getFullYear() === now.getFullYear() &&
      sel.getMonth() === now.getMonth() &&
      sel.getDate() === now.getDate();
  })();

  // Check if a 12-hour format time slot is in the past (only for today)
  const isSlotInPast = (slot) => {
    if (!isSelectedDateToday) return false;
    const now = new Date();
    const [time, period] = slot.split(' ');
    let [h, m] = time.split(':').map(Number);
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    const slotTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m || 0);
    return slotTime <= now;
  };

  // Auto-deselect time if it becomes past when date changes to today
  useEffect(() => {
    if (selectedTime && isSlotInPast(selectedTime)) {
      setSelectedTime('');
    }
  }, [selectedDate]); // eslint-disable-line react-hooks/exhaustive-deps

  // Guest count options
  const guestOptions = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25];

  // Occasion options
  const occasions = [
    { id: 'date-night', label: 'Date Night', labelAr: 'سهرة رومانسية', labelFr: 'Soirée Romantique', icon: Heart },
    { id: 'anniversary', label: 'Anniversary', labelAr: 'ذكرى سنوية', labelFr: 'Anniversaire', icon: Award },
    { id: 'birthday', label: 'Birthday', labelAr: 'عيد ميلاد', labelFr: 'Fête d\'Anniversaire', icon: Cake },
    { id: 'celebration', label: 'Celebration', labelAr: 'احتفال', labelFr: 'Célébration', icon: PartyPopper },
    { id: 'business', label: 'Business Dinner', labelAr: 'عشاء عمل', labelFr: 'Dîner d\'Affaires', icon: Briefcase },
    { id: 'family', label: 'Family Gathering', labelAr: 'تجمع عائلي', labelFr: 'Réunion de Famille', icon: UsersRound },
    { id: 'kids', label: 'Kids Party', labelAr: 'حفلة أطفال', labelFr: 'Fête d\'Enfants', icon: Baby },
    { id: 'solo', label: 'Solo Dining', labelAr: 'تناول طعام فردي', labelFr: 'Dîner en Solo', icon: User },
  ];

  // Time periods with themed colors
  const timePeriods = [
    {
      id: 'morning',
      label: 'Morning',
      labelAr: 'الصباح',
      labelFr: 'Matin',
      range: '06:00 - 12:00',
      rangeAr: '06:00 - 12:00',
      rangeFr: '06:00 - 12:00',
      icon: Sun,
      slots: ['6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'],
      bgColor: 'bg-[#FFF8E1]',
      borderColor: 'border-[#F5E6C3]',
      textColor: 'text-[#8B7355]',
      iconBgColor: 'bg-[#F5E6C3]',
      iconColor: 'text-[#D4AF37]',
      slotBg: 'bg-[#FFF8E1]',
      slotBorder: 'border-[#E8DCC8]',
      slotText: 'text-[#8B7355]',
      decorativeIcon: Sun,
      decorativeColor: 'text-[#E8DCC8]'
    },
    {
      id: 'afternoon',
      label: 'Afternoon',
      labelAr: 'بعد الظهر',
      labelFr: 'Après-midi',
      range: '12:00 - 18:00',
      rangeAr: '12:00 - 18:00',
      rangeFr: '12:00 - 18:00',
      icon: Sunset,
      slots: ['12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM'],
      bgColor: 'bg-[#FFF0E6]',
      borderColor: 'border-[#F5D6C6]',
      textColor: 'text-[#A67B5B]',
      iconBgColor: 'bg-[#F5D6C6]',
      iconColor: 'text-[#CD7F32]',
      slotBg: 'bg-[#FFF0E6]',
      slotBorder: 'border-[#E8D0C0]',
      slotText: 'text-[#A67B5B]',
      decorativeIcon: Sunset,
      decorativeColor: 'text-[#E8D0C0]'
    },
    {
      id: 'evening',
      label: 'Evening',
      labelAr: 'المساء',
      labelFr: 'Soirée',
      range: '18:00 - 22:00',
      rangeAr: '18:00 - 22:00',
      rangeFr: '18:00 - 22:00',
      icon: Moon,
      slots: ['6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM'],
      bgColor: 'bg-[#E8EEF8]',
      borderColor: 'border-[#C8D4E8]',
      textColor: 'text-[#5B6B8A]',
      iconBgColor: 'bg-[#C8D4E8]',
      iconColor: 'text-[#6B7FA0]',
      slotBg: 'bg-[#E8EEF8]',
      slotBorder: 'border-[#C8D4E8]',
      slotText: 'text-[#5B6B8A]',
      decorativeIcon: Moon,
      decorativeColor: 'text-[#C8D4E8]'
    },
    {
      id: 'night',
      label: 'Night',
      labelAr: 'الليل',
      labelFr: 'Nuit',
      range: '22:00 - 03:00',
      rangeAr: '22:00 - 03:00',
      rangeFr: '22:00 - 03:00',
      icon: Stars,
      slots: ['10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM', '12:00 AM', '12:30 AM', '1:00 AM', '1:30 AM', '2:00 AM', '2:30 AM'],
      bgColor: 'bg-gradient-to-br from-[#1A1A2E] to-[#4A1B6D]',
      borderColor: 'border-[#4A1B6D]',
      textColor: 'text-white',
      iconBgColor: 'bg-[#4A1B6D]/50',
      iconColor: 'text-[#D4AF37]',
      slotBg: 'bg-[#2D1B4E]',
      slotBorder: 'border-[#5B3B7D]',
      slotText: 'text-white',
      decorativeIcon: Stars,
      decorativeColor: 'text-[#5B3B7D]'
    }
  ];

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

  const handleConfirmReservation = async () => {
    // Block if venue has resources but user hasn't selected one
    if (venue.resources?.length > 0 && !selectedResource) {
      toast.error(t('booking.select_spot_error', 'Please select a spot to continue.'));
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        resource_id: selectedResource || '',
        booking_date: formatDate(selectedDate),
        start_time: formatTimeTo24h(selectedTime),
        duration_minutes: 15,
        party_size: guestCount,
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
      toast.error(t('booking.failed', 'Booking failed. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToHome = () => {
    window.location.href = '/home';
  };

  const handleViewBookings = () => {
    window.location.href = '/bookings';
  };

  const canProceedToStage2 = selectedDate && selectedTime && guestCount;

  // Generate booking code
  const bookingCode = `QR_ABC123`;

  return (
    <div className="min-h-screen bg-[#FFFCF8]">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-[#E8E3D5]">
        <div className="px-6 py-4">
          {/* Top Row - Back button and Logo */}
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={onBack} 
              className="w-10 h-10 rounded-xl border-2 border-[#E8E3D5] flex items-center justify-center hover:border-[#D4AF37] transition-all cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-[#5C5850]" />
            </button>
            
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#CD7F32] flex items-center justify-center mb-2">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-[#1A1A1C] text-lg font-bold font-serif">OMNIA Experience</h1>
              <p className="text-[#8B8680] text-sm">{getLocalizedField(venue, 'name', language)}</p>
            </div>
            
            <div className="w-10" />
          </div>

          {/* Stage Indicators */}
          {currentStage < 3 && (
            <div className="flex items-center justify-center gap-8">
              {/* Stage 1 */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  currentStage >= 1 
                    ? 'bg-gradient-to-br from-[#D4AF37] to-[#CD7F32]' 
                    : 'bg-[#F8F6F1] border-2 border-[#E8E3D5]'
                }`}>
                  <Calendar className={`w-5 h-5 ${currentStage >= 1 ? 'text-white' : 'text-[#8B8680]'}`} />
                </div>
                <div>
                  <p className={`text-xs uppercase tracking-wider font-bold ${currentStage === 1 ? 'text-[#D4AF37]' : 'text-[#8B8680]'}`}>
                    {t('booking.stage_1', 'STAGE 1')}
                  </p>
                  <p className={`text-sm font-semibold ${currentStage === 1 ? 'text-[#1A1A1C]' : 'text-[#8B8680]'}`}>
                    {t('booking.when_where', 'When & Where')}
                  </p>
                </div>
              </div>

              {/* Progress Line */}
              <div className="w-24 h-0.5 bg-[#E8E3D5] relative">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#D4AF37] to-[#CD7F32] transition-all duration-500"
                  style={{ width: currentStage >= 2 ? '100%' : '0%' }}
                />
              </div>

              {/* Stage 2 */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  currentStage >= 2 
                    ? 'bg-gradient-to-br from-[#D4AF37] to-[#CD7F32]' 
                    : 'bg-[#F8F6F1] border-2 border-[#E8E3D5]'
                }`}>
                  <Sparkles className={`w-5 h-5 ${currentStage >= 2 ? 'text-white' : 'text-[#8B8680]'}`} />
                </div>
                <div>
                  <p className={`text-xs uppercase tracking-wider font-bold ${currentStage === 2 ? 'text-[#D4AF37]' : 'text-[#8B8680]'}`}>
                    {t('booking.stage_2', 'STAGE 2')}
                  </p>
                  <p className={`text-sm font-semibold ${currentStage === 2 ? 'text-[#1A1A1C]' : 'text-[#8B8680]'}`}>
                    {t('booking.personalize', 'Personalize')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className={`px-6 ${currentStage < 3 ? 'pb-32' : 'pb-8'}`}>
        
        {/* Stage 1: When & Where */}
        {currentStage === 1 && (
          <div className="py-8 space-y-8">
            {/* Section Header */}
            <div className="text-center">
              <h2 className="text-3xl font-serif font-semibold text-[#1A1A1C] mb-2">
                {t('booking.when_where_title', 'When & Where')}
              </h2>
              <p className="text-[#8B8680]">
                {t('booking.when_where_subtitle', 'Select your preferred date, time, and party details for a seamless experience')}
              </p>
            </div>

            {/* Date Selection */}
            <div className="bg-white rounded-2xl border-2 border-[#E8E3D5] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#F8F6F1] border border-[#E8E3D5] flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#8B8680]" />
                </div>
                <div>
                  <h3 className="text-[#1A1A1C] font-bold">{t('booking.select_date', 'Select Your Date')}</h3>
                  <p className="text-[#8B8680] text-sm">{t('booking.choose_perfect_day', 'Choose the perfect day')}</p>
                </div>
              </div>
              <CalendarPickerModal
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                minDate={new Date()}
                accentColor="#D4AF37"
              />
            </div>

            {/* Time Selection */}
            <div className="bg-white rounded-2xl border-2 border-[#E8E3D5] p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#F8F6F1] border border-[#E8E3D5] flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#8B8680]" />
                </div>
                <div>
                  <h3 className="text-[#1A1A1C] font-bold">{t('booking.choose_time', 'Choose Your Time')}</h3>
                  <p className="text-[#8B8680] text-sm">{t('booking.find_ideal_moment', 'Find the ideal moment')}</p>
                </div>
              </div>

              <div className="space-y-4">
                {timePeriods.map((period) => {
                  const PeriodIcon = period.icon;
                  const DecorativeIcon = period.decorativeIcon;
                  
                  return (
                    <div key={period.id} className={`rounded-2xl ${period.bgColor} p-4 border ${period.borderColor}`}>
                      {/* Period Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${period.iconBgColor} flex items-center justify-center`}>
                            <PeriodIcon className={`w-5 h-5 ${period.iconColor}`} />
                          </div>
                          <div>
                            <h4 className={`font-bold ${period.textColor}`}>
                              {getLocalizedField(period, 'label', language)}
                            </h4>
                            <p className={`text-sm opacity-70 ${period.textColor}`}>
                              {getLocalizedField(period, 'range', language)}
                            </p>
                          </div>
                        </div>
                        <DecorativeIcon className={`w-12 h-12 ${period.decorativeColor} opacity-30`} />
                      </div>

                      {/* Time Slots Grid */}
                      <div className="grid grid-cols-3 gap-2">
                        {period.slots.map((slot) => {
                          const isSelected = selectedTime === slot;
                          const disabled = isSlotInPast(slot);
                          return (
                            <button
                              key={slot}
                              onClick={() => !disabled && setSelectedTime(slot)}
                              disabled={disabled}
                              className={`py-3 px-4 rounded-xl border-2 font-semibold transition-all ${
                                disabled
                                  ? 'border-[#E8E3D5] bg-[#F5F3ED] text-[#8B8680] opacity-40 cursor-not-allowed'
                                  : isSelected
                                    ? period.id === 'night'
                                      ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-white cursor-pointer'
                                      : 'border-[#D4AF37] bg-white text-[#D4AF37] shadow-md cursor-pointer'
                                    : `${period.slotBg} ${period.slotBorder} ${period.slotText} hover:border-[#D4AF37]/50 cursor-pointer`
                              }`}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Guest Selection */}
            <div className="bg-white rounded-2xl border-2 border-[#E8E3D5] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#F8F6F1] border border-[#E8E3D5] flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#8B8680]" />
                </div>
                <h3 className="text-[#1A1A1C] font-bold">{t('booking.guests', 'Guests')}</h3>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {guestOptions.map((count) => {
                  const isSelected = guestCount === count;
                  return (
                    <button
                      key={count}
                      onClick={() => setGuestCount(count)}
                      className={`relative py-4 px-4 rounded-xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#D4AF37] bg-[#FFF8E1] text-[#D4AF37]'
                          : 'border-[#E8E3D5] bg-white text-[#5C5850] hover:border-[#D4AF37]/50'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <Users className={`w-5 h-5 ${isSelected ? 'text-[#D4AF37]' : 'text-[#8B8680]'}`} />
                        <span className="font-bold">{count}</span>
                      </div>
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#D4AF37] rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Stage 2: Personalize Experience */}
        {currentStage === 2 && (
          <div className="py-8 space-y-8">
            {/* Section Header */}
            <div className="text-center">
              <h2 className="text-3xl font-serif font-semibold text-[#1A1A1C] mb-2">
                {t('booking.personalize_title', 'Personalize Experience')}
              </h2>
              <p className="text-[#8B8680]">
                {t('booking.personalize_subtitle', 'Add special touches and exclusive perks to elevate your reservation')}
              </p>
            </div>

            {/* Choose Your Spot — resource selection */}
            {venue.resources && venue.resources.length > 0 && (
              <div className="bg-white rounded-2xl border-2 border-[#E8E3D5] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F8F6F1] border border-[#E8E3D5] flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-[#8B8680]" />
                  </div>
                  <div>
                    <h3 className="text-[#1A1A1C] font-bold">{t('booking.choose_your_spot', 'Choose Your Spot')}</h3>
                    <p className="text-[#8B8680] text-sm">{t('booking.optional_preference', 'Optional preference')}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {venue.resources.map((resource) => {
                    const isSelected = selectedResource === resource.id;
                    const priceVal = resource.minimum_spend || resource.minimumSpend || resource.price_per_hour || resource.pricePerHour;
                    const displayPrice = priceVal && priceVal > 0 ? `+${priceVal} AED` : '';
                    const tags = (() => {
                      if (Array.isArray(resource.amenities) && resource.amenities.length > 0) return resource.amenities.map(a => a.name || a).slice(0, 3);
                      const desc = resource.description_en || resource.descriptionEn || '';
                      if (desc) return [desc.split('.')[0]].filter(Boolean).slice(0, 1);
                      return [];
                    })();

                    return (
                      <button
                        key={resource.id}
                        onClick={() => setSelectedResource(isSelected ? '' : resource.id)}
                        className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#D4AF37] bg-[#FFFDF5] shadow-md'
                            : 'border-[#E8E3D5] bg-white hover:border-[#D4AF37]/40 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Image */}
                          <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-[#F8F6F1]">
                            {resource.image ? (
                              <img
                                src={resource.image}
                                alt={getLocalizedField(resource, 'name', language)}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <MapPin className="w-6 h-6 text-[#D4AF37]/40" />
                              </div>
                            )}
                            {isSelected && (
                              <div className="absolute inset-0 bg-[#D4AF37]/10" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="text-[#1A1A1C] font-bold text-sm leading-tight font-serif">
                                {getLocalizedField(resource, 'name', language) || `Spot ${resource.id}`}
                              </h4>
                              {!isSelected && (
                                <span className="flex-shrink-0 text-[10px] font-bold text-green-700 bg-[#E8F5E9] px-2 py-0.5 rounded-full">
                                  {t('available', 'AVAILABLE')}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 mb-1.5">
                              {resource.capacity > 0 && (
                                <div className="flex items-center gap-1">
                                  <Users className="w-3 h-3 text-[#8B8680]" />
                                  <span className="text-[11px] text-[#8B8680]">
                                    {t('booking.up_to', 'Up to')} {resource.capacity}
                                  </span>
                                </div>
                              )}
                              {displayPrice && (
                                <span className="text-[11px] font-bold text-[#D4AF37]">{displayPrice}</span>
                              )}
                            </div>

                            {tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {tags.map((tag, i) => (
                                  <span key={i} className="text-[9px] text-[#5C5850] bg-[#F8F6F1] border border-[#E8E3D5] px-1.5 py-0.5 rounded-lg">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Checkmark */}
                          {isSelected && (
                            <div className="flex-shrink-0 self-center">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#CD7F32] flex items-center justify-center shadow-md">
                                <CheckCircle className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Exclusive Privileges — boost perks excluded, same as customer app */}
            {(() => {
              const exclusivePerks = resolveExclusivePerks((venue.perks || []).filter(p => !isBoostPerk(p)));
              if (!exclusivePerks.length) return null;
              return (
                <div className="bg-white rounded-2xl border-2 border-[#E8E3D5] p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#F8F5F0] border border-[#D4A574]/40 flex items-center justify-center">
                      <Gift className="w-5 h-5 text-[#D4A574]" />
                    </div>
                    <div>
                      <h3 className="text-[#1A1A1C] font-bold">{t('booking.exclusive_privileges', 'Exclusive Privileges')}</h3>
                      <p className="text-[#8B8680] text-sm">{t('booking.elevate_experience', 'Elevate your experience')}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {exclusivePerks.map((perk) => {
                      const isSelected = selectedPerk?.id === perk.id;
                      return (
                        <button
                          key={perk.id}
                          onClick={() => setSelectedPerk(isSelected ? null : perk)}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#D4AF37] bg-white'
                              : 'border-[#E8E3D5] bg-white hover:border-[#D4AF37]/40'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Icon */}
                            <div className="w-10 h-10 rounded-xl bg-[#F8F5F0] border border-[#D4A574]/40 flex items-center justify-center flex-shrink-0">
                              <Gift className="w-5 h-5 text-[#D4A574]" />
                            </div>
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-1">
                                <h4 className="font-semibold text-[#1A1A1C] text-sm leading-tight">
                                  {getLocalizedField(perk, 'title', language)}
                                </h4>
                                <Sparkles className="w-2.5 h-2.5 text-[#D4AF37] flex-shrink-0" />
                              </div>
                              <p className="text-xs text-[#8B8680] leading-relaxed">
                                {getLocalizedField(perk, 'description', language)}
                              </p>
                            </div>
                            {/* Selection indicator */}
                            <div className="flex-shrink-0 self-center">
                              {isSelected ? (
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#CD7F32] flex items-center justify-center shadow-sm">
                                  <CheckCircle className="w-4 h-4 text-white" />
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full border-2 border-[#D4AF37]/30" />
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Special Requests */}
            <div className="bg-white rounded-2xl border-2 border-[#E8E3D5] p-6">
              <h3 className="text-[#1A1A1C] font-bold text-lg mb-2">{t('booking.special_requests', 'Special Requests')}</h3>
              <p className="text-[#8B8680] text-sm mb-6">{t('booking.let_us_know', 'Let us know how we can make your experience perfect')}</p>

              {/* Occasion Selection */}
              <div className="mb-6">
                <p className="text-[#5C5850] text-sm uppercase tracking-wider font-bold mb-3">
                  {t('booking.occasion', 'OCCASION')} <span className="text-[#8B8680] normal-case font-normal">({t('optional')})</span>
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {occasions.map((occasion) => {
                    const OccasionIcon = occasion.icon;
                    const isSelected = selectedOccasion === occasion.id;
                    return (
                      <button
                        key={occasion.id}
                        onClick={() => setSelectedOccasion(isSelected ? '' : occasion.id)}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#D4AF37] bg-[#FFF8E1]'
                            : 'border-[#E8E3D5] bg-white hover:border-[#D4AF37]/50'
                        }`}
                      >
                        <OccasionIcon className={`w-5 h-5 ${isSelected ? 'text-[#D4AF37]' : 'text-[#8B8680]'}`} />
                        <span className={`font-semibold ${isSelected ? 'text-[#D4AF37]' : 'text-[#5C5850]'}`}>
                          {getLocalizedField(occasion, 'label', language)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <p className="text-[#5C5850] text-sm uppercase tracking-wider font-bold mb-3">
                  {t('booking.additional_notes', 'ADDITIONAL NOTES')} <span className="text-[#8B8680] normal-case font-normal">({t('optional')})</span>
                </p>
                <textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder={t('booking.notes_placeholder', 'Dietary preferences, accessibility needs, special decorations...')}
                  className="w-full p-4 rounded-xl border-2 border-[#E8E3D5] bg-white focus:border-[#D4AF37] focus:ring-0 outline-none transition-all resize-none h-24 text-[#1A1A1C] placeholder-[#8B8680]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Stage 3: Booking Confirmation */}
        {currentStage === 3 && (
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
                      <Users className="w-5 h-5 text-[#8B8680]" />
                      <span className="text-[#1A1A1C] font-medium">{guestCount} {t('booking.guests_label', 'Guests')}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
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
              </>
            )}

            {/* Back to Home button when still pending */}
            {bookingStatus !== 'confirmed' && (
              <button
                onClick={handleBackToHome}
                className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#CD7F32] text-white rounded-xl font-bold hover:shadow-lg transition-all cursor-pointer"
              >
                {t('booking.back_home', 'Back to Home')}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bottom Action Bar (Stage 1 & 2 only) */}
      {currentStage < 3 && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-[#E8E3D5] to-[#F5F0E6] border-t border-[#E8E3D5] p-4 z-50">
          <div className="px-2">
            <button
              onClick={() => {
                if (currentStage === 1 && canProceedToStage2) {
                  setCurrentStage(2);
                  window.scrollTo(0, 0);
                } else if (currentStage === 2) {
                  handleConfirmReservation();
                }
              }}
              disabled={(currentStage === 1 && !canProceedToStage2) || isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#CD7F32] text-white rounded-xl font-bold disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-lg transition-all cursor-pointer"
            >
              {currentStage === 1 ? (
                <>
                  {t('booking.continue_personalization', 'Continue to Personalization')}
                  <ChevronRight className="w-5 h-5" />
                </>
              ) : (
                <>
                  {t('booking.confirm_reservation', 'Confirm Reservation')}
                  <CheckCircle className="w-5 h-5" />
                </>
              )}
            </button>
            {currentStage === 1 && !canProceedToStage2 && (
              <p className="text-center text-[#B85450] text-sm mt-2">
                {!selectedTime ? t('booking.select_time_error', 'Please select a time') : 
                 !selectedDate ? t('booking.select_date_error', 'Please select a date') : ''}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
