import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, Users, CheckCircle, Palmtree, ChevronRight, Info, Sun, Star, Sparkles, Gift, Zap, Crown, Umbrella, MapPin, Download, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { CalendarPickerModal } from '@/Shared/CalendarPickerModal';
import { getLocalizedField, getDateLocale } from '@/lib/localization';
import { fetchData } from '@/helpers/fetchData';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Map pass type to a start_time
function passTypeToTime(passType) {
  if (passType === 'morning') return '09:00:00.000';
  if (passType === 'afternoon') return '13:00:00.000';
  return '09:00:00.000'; // full-day
}

import { isBoostPerk, isBoostActive, resolveExclusivePerks } from '@/lib/perkUtils';

export function ResortBookingFlow({ venueId, venue, onBack, onComplete, preSelectedResource, preSelectedPerk }) {
  const { t, i18n } = useTranslation();
  const user = useSelector(state => state.auth?.user);
  const language = i18n.language;
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedPassType, setSelectedPassType] = useState('full-day');
  const [selectedResource, setSelectedResource] = useState(preSelectedResource || '');
  const [selectedPerk, setSelectedPerk] = useState(preSelectedPerk || null);
  const [partySize, setPartySize] = useState(2);
  const [bookingStatus, setBookingStatus] = useState('idle');
  const [stepTimes, setStepTimes] = useState({ requested: 0, pending: 0, approved: 0, confirmed: 0 });

  // Check if date is weekend (Friday/Saturday in UAE)
  const isWeekend = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDay();
    return day === 5 || day === 6;
  };

  // Check if selected date is today
  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const selected = new Date(dateStr);
    const now = new Date();
    return selected.getFullYear() === now.getFullYear() &&
      selected.getMonth() === now.getMonth() &&
      selected.getDate() === now.getDate();
  };

  // Check if a pass type should be disabled based on current time (only for today)
  const isPassDisabled = (passId) => {
    if (!selectedDate || !isToday(selectedDate)) return false;
    const now = new Date();
    const hour = now.getHours();
    switch (passId) {
      case 'full-day':
        return hour >= 9;
      case 'half-day':
        return hour >= 14;
      case 'kids-pass':
        return hour >= 9;
      default:
        return false;
    }
  };

  // Auto-deselect pass type if it becomes disabled when date changes
  useEffect(() => {
    if (selectedPassType && isPassDisabled(selectedPassType)) {
      setSelectedPassType('');
    }
  }, [selectedDate]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pass type options
  const passTypes = [
    {
      id: 'full-day',
      label: t('resort.full_day_pass'),
      icon: '☀️',
      time: '09:00 - 18:00',
      description: t('resort.full_beach_access'),
      priceMultiplier: 1
    },
    {
      id: 'half-day',
      label: t('resort.half_day_pass'),
      icon: '🌤️',
      time: '09:00 - 14:00 or 14:00 - 18:00',
      description: t('resort.morning_afternoon'),
      priceMultiplier: 0.65
    },
    {
      id: 'kids-pass',
      label: t('resort.kids_pass'),
      icon: '👶',
      time: 'All day (under 12)',
      description: t('resort.children_under_12'),
      priceMultiplier: 0.5
    },
  ];

  // Resource availability with weekend pricing
  const getResourceAvailability = () => {
    if (!selectedDate || !selectedPassType || !venue.resources) {
      return [];
    }

    const basePrice = 250;
    const weekend = isWeekend(selectedDate);
    const weekendMultiplier = weekend ? 1.4 : 1;

    const seed = selectedDate + selectedPassType;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash = hash & hash;
    }

    const resources = venue.resources || [];

    return resources.map((resource, index) => {
      const resourceHash = Math.abs(hash + index * 1000);
      const available = (resourceHash % 10) < 7;
      
      let resourceBasePrice = basePrice;
      if (resource.isPremium) resourceBasePrice *= 1.6;
      if (resource.priceModifier) resourceBasePrice += resource.priceModifier;
      
      const passMultiplier = passTypes.find(pt => pt.id === selectedPassType)?.priceMultiplier || 1;
      const price = Math.round(resourceBasePrice * weekendMultiplier * passMultiplier);

      return {
        resourceId: resource.id,
        available,
        price
      };
    });
  };

  const resourceAvailability = getResourceAvailability();

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
        resource_id: selectedResource,
        booking_date: formatDate(selectedDate),
        start_time: passTypeToTime(selectedPassType),
        duration_minutes: 15,
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
      toast.error(err?.response?.data?.message || err?.message || t('booking.error', 'Booking failed. Please try again.'));
    }
  };

  const handleBackToHome = () => {
    window.location.href = '/home';
  };

  const handleViewBookings = () => {
    window.location.href = '/bookings';
  };

  // Generate booking code
  const bookingCode = `OMNIA-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  const canProceedToStep2 = selectedDate && selectedPassType;
  const canProceedToStep3 = selectedResource;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFCF8] via-[#FFF8F0] to-[#FAF8F3]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-[#E8E3D5]/30">
        <div className="px-6 py-5 max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <button
              onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onBack()}
              className="group w-11 h-11 rounded-xl bg-white border-2 border-[#E8E3D5] flex items-center justify-center hover:border-[#D4AF37] hover:scale-110 transition-all duration-300 active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-[#5C5850] group-hover:text-[#D4AF37] transition-colors" />
            </button>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Palmtree className="w-5 h-5 text-[#B8956A]" />
                <h1 className="text-[#1A1A1C] text-lg font-bold font-serif">
                  {getLocalizedField(venue, 'name', language)}
                </h1>
              </div>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3].map(step => (
                  <div 
                    key={step} 
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      step === currentStep 
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#CD7F32] w-8 shadow-lg' 
                        : step < currentStep 
                        ? 'bg-[#B8956A] w-6' 
                        : 'bg-[#E8E3D5] w-4'
                    }`} 
                  />
                ))}
              </div>
            </div>
            
            <div className="w-11" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8 pb-32 max-w-5xl mx-auto">
        {/* Step 1: Date/Pass Type */}
        {currentStep === 1 && (
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#B8956A]/10 to-[#D4AF37]/10 rounded-full mb-4 border border-[#D4B896]/30">
                <Palmtree className="w-4 h-4 text-[#B8956A]" />
                <span className="text-sm font-bold text-[#5C5850] uppercase tracking-wide">
                  {t('resort.beach_day_pass')}
                </span>
              </div>
              <h2 className="text-3xl font-serif font-semibold text-[#1A1A1C] mb-2">
                {t('resort.day_in_paradise')}
              </h2>
              <p className="text-[#8B8680]">
                {t('resort.select_beach_escape')}
              </p>
            </div>

            {/* Calendar */}
            <CalendarPickerModal
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              minDate={new Date()}
              accentColor="#B8956A"
              showPremiumDays={true}
              premiumDayChecker={(date) => {
                const day = date.getDay();
                return day === 5 || day === 6;
              }}
            />

            {/* Weekend indicator */}
            {selectedDate && isWeekend(selectedDate) && (
              <div className="relative overflow-hidden rounded-2xl border-2 border-[#D4B896]/40">
                <div className="absolute inset-0 bg-gradient-to-r from-[#F8F6F1]/50 via-[#FAF8F3]/30 to-[#F8F6F1]/50" />
                <div className="relative text-center py-4">
                  <div className="flex items-center justify-center gap-3">
                    <Palmtree className="w-5 h-5 text-[#B8956A]" />
                    <span className="font-bold text-lg text-[#1A1A1C]">
                      {new Date(selectedDate).toLocaleDateString(getDateLocale(language), { weekday: 'long', month: 'long', day: 'numeric' })}
                    </span>
                    <div className="px-3 py-1 bg-gradient-to-r from-[#D4AF37] to-[#CD7F32] rounded-lg shadow-lg">
                      <div className="flex items-center gap-1">
                        <Crown className="w-3 h-3 text-white fill-white" />
                        <span className="text-white text-xs font-bold uppercase tracking-wide">{t('resort.weekend')} +40%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pass Types */}
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-2">
                <Sun className="w-5 h-5 text-[#D4AF37]" />
                <label className="text-[#1A1A1C] font-bold text-lg">
                  {t('Select Your Pass', 'اختر تذكرتك')}
                </label>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {passTypes.map((passType) => {
                  const isSelected = selectedPassType === passType.id;
                  const disabled = isPassDisabled(passType.id);
                  return (
                    <button
                      key={passType.id}
                      onClick={() => !disabled && setSelectedPassType(passType.id)}
                      disabled={disabled}
                      className={`relative p-6 rounded-2xl border-2 transition-all duration-500 group overflow-hidden text-left ${
                        disabled
                          ? 'border-[#E8E3D5] bg-[#F5F3EF] opacity-50 cursor-not-allowed'
                          : isSelected
                            ? 'border-[#B8956A] bg-gradient-to-br from-[#F8F6F1] to-[#FAF8F3] shadow-2xl scale-105 cursor-pointer'
                            : 'border-[#E8E3D5] bg-white hover:border-[#D4B896] hover:shadow-lg hover:scale-[1.02] cursor-pointer'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-3">{passType.icon}</div>
                        <h3 className={`text-xl font-bold mb-2 font-serif ${disabled ? 'text-[#8B8680]' : isSelected ? 'text-[#B8956A]' : 'text-[#1A1A1C]'}`}>
                          {passType.label}
                        </h3>
                        <p className="text-sm text-[#8B8680] mb-3">
                          {passType.description}
                        </p>
                        <div className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold ${
                          disabled
                            ? 'bg-[#E8E3D5] text-[#8B8680]'
                            : isSelected
                              ? 'bg-gradient-to-r from-[#B8956A] to-[#D4AF37] text-white'
                              : 'bg-[#F8F6F1] text-[#8B8680]'
                        }`}>
                          {passType.time}
                        </div>
                        {disabled && (
                          <p className="text-xs text-red-400 mt-2 font-medium">
                            {t('resort.not_available_today', 'Not available at this time')}
                          </p>
                        )}
                      </div>
                      {isSelected && !disabled && (
                        <div className="absolute top-3 right-3">
                          <CheckCircle className="w-6 h-6 text-[#B8956A]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Beach Section Selection */}
        {currentStep === 2 && (
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#B8956A]/10 to-[#D4AF37]/10 rounded-full mb-4 border border-[#D4B896]/30">
                <Umbrella className="w-4 h-4 text-[#B8956A]" />
                <span className="text-sm font-bold text-[#5C5850] uppercase tracking-wide">
                  {t('booking.step_2_of_3')}
                </span>
              </div>
              <h2 className="text-3xl font-serif font-semibold text-[#1A1A1C] mb-2">
                {t('resort.select_area')}
              </h2>
              <div className="flex items-center justify-center gap-3 text-[#8B8680]">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span className="font-semibold">
                    {new Date(selectedDate).toLocaleDateString(getDateLocale(language), { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Sun className="w-4 h-4" />
                  <span className="font-semibold">
                    {passTypes.find(pt => pt.id === selectedPassType)?.label}
                  </span>
                </div>
                {isWeekend(selectedDate) && (
                  <>
                    <span>•</span>
                    <div className="px-2 py-1 bg-gradient-to-r from-[#D4AF37] to-[#CD7F32] rounded">
                      <span className="text-white text-xs font-bold">{t('resort.weekend').toUpperCase()}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Beach Sections */}
            {!venue.resources || venue.resources.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-[#F8F6F1] flex items-center justify-center mx-auto mb-4">
                  <Info className="w-8 h-8 text-[#8B8680]" />
                </div>
                <p className="text-[#8B8680]">
                  {t('No availability for this time', 'لا توجد أماكن متاحة')}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {venue.resources.map((resource, index) => {
                  const availability = resourceAvailability.find(a => a.resourceId === resource.id);
                  const isAvailable = availability?.available ?? true;
                  const isSelected = selectedResource === resource.id;
                  const isCabana = resource.isPremium;
                  
                  return (
                    <button
                      key={resource.id}
                      onClick={() => { if (isAvailable) setSelectedResource(resource.id); }}
                      disabled={!isAvailable}
                      className={`group relative w-full bg-white rounded-3xl border-2 overflow-hidden text-left transition-all duration-500 ${
                        !isAvailable
                          ? 'border-[#E8E3D5] opacity-40 cursor-not-allowed'
                          : isSelected
                          ? 'border-[#B8956A] shadow-2xl scale-[1.02] ring-4 ring-[#D4B896]/20 cursor-pointer'
                          : 'border-[#E8E3D5] hover:border-[#D4B896] hover:shadow-xl hover:scale-[1.01] cursor-pointer'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#B8956A] via-[#D4AF37] to-[#B8956A]" />
                      )}
                      
                      <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 p-4 sm:p-5">
                        {resource.image && (
                          <div className="relative w-full sm:w-36 h-48 sm:h-36 flex-shrink-0 rounded-2xl overflow-hidden">
                            <img 
                              src={resource.image} 
                              alt={resource.name} 
                              className={`w-full h-full object-cover transition-transform duration-500 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}
                            />
                            {isCabana && (
                              <div className="absolute top-2 left-2 px-2.5 py-1 bg-gradient-to-r from-[#D4AF37] to-[#CD7F32] rounded-lg shadow-lg">
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-white fill-white" />
                                  <span className="text-white text-[0.65rem] font-bold">{t('resort.cabana').toUpperCase()}</span>
                                </div>
                              </div>
                            )}
                            {!isAvailable && (
                              <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
                                <div className="text-center">
                                  <div className="text-white text-sm font-bold mb-1">{t('resort.fully_booked')}</div>
                                  <div className="text-white/70 text-xs">{t('resort.try_another_time')}</div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex-1 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className={`text-xl font-bold font-serif ${isSelected ? 'text-[#B8956A]' : 'text-[#1A1A1C]'}`}>
                                {getLocalizedField(resource, 'name', language)}
                              </h3>
                              {index === 0 && (
                                <div className="px-2 py-0.5 bg-gradient-to-r from-[#B8956A] to-[#D4AF37] rounded text-white text-[0.65rem] font-bold">
                                  {t('resort.popular').toUpperCase()}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-[#8B8680] mb-3">
                              <div className="flex items-center gap-1.5">
                                <Users className="w-4 h-4" />
                                <span className="font-semibold">Up to {resource.capacity}</span>
                              </div>
                              {isAvailable && (
                                <div className="flex items-center gap-1.5 text-[#B8956A] font-bold">
                                  <div className="w-2 h-2 rounded-full bg-[#B8956A] animate-pulse shadow-lg shadow-[#B8956A]/50" />
                                  <span className="text-xs uppercase tracking-wider">{t('resort.available')}</span>
                                </div>
                              )}
                            </div>

                            {Array.isArray(resource.amenities) && resource.amenities.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {resource.amenities.slice(0, 3).map((amenity, idx) => (
                                  <span key={idx} className="text-xs text-[#5C5850] bg-gradient-to-r from-[#F8F6F1] to-[#FAF8F3] px-2.5 py-1 rounded-lg font-semibold border border-[#E8E3D5]">
                                    {typeof amenity === 'string' ? amenity : String(amenity)}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {isAvailable && availability && (
                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start sm:text-right sm:flex-shrink-0 sm:ml-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#E8E3D5]">
                              <div>
                                <div className={`text-4xl sm:text-3xl font-bold leading-none mb-1 font-serif ${isSelected ? 'text-[#B8956A]' : 'text-[#1A1A1C]'}`}>
                                  {availability.price}
                                </div>
                                <div className="text-xs text-[#8B8680] font-bold uppercase tracking-wider mb-1">AED / Day</div>
                                {isWeekend(selectedDate) && (
                                  <div className="text-[0.65rem] text-[#D4AF37] font-bold">
                                    {t('resort.weekend_rate')}
                                  </div>
                                )}
                              </div>
                              {isSelected && (
                                <div className="sm:mt-2 px-3 py-1.5 bg-gradient-to-r from-[#B8956A] to-[#D4AF37] rounded-lg">
                                  <span className="text-white text-xs font-bold flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    SELECTED
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Beach Info */}
            <div className="bg-gradient-to-r from-[#F8F6F1] via-[#FAF8F3] to-[#F8F6F1] p-5 rounded-2xl border-2 border-[#E8E3D5]">
              <div className="flex gap-3 items-start">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B8956A] to-[#D4AF37] flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="text-sm text-[#5C5850]">
                  <p className="font-bold mb-1 text-[#1A1A1C]">{t('resort.day_pass_includes')} 🌊</p>
                  <p>{t('resort.day_pass_includes_desc')}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {currentStep === 3 && (
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center max-w-2xl mx-auto">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#B8956A] to-[#D4AF37] flex items-center justify-center shadow-2xl">
                  <Palmtree className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#CD7F32] flex items-center justify-center shadow-lg animate-bounce">
                  <Star className="w-4 h-4 text-white fill-white" />
                </div>
              </div>
              <h2 className="text-3xl font-serif font-semibold text-[#1A1A1C] mb-2">
                {t('resort.beach_day_awaits')}
              </h2>
              <p className="text-[#8B8680]">
                {t('resort.confirm_escape')}
              </p>
            </div>

            {/* Summary Card */}
            <div className="bg-white rounded-3xl border-2 border-[#E8E3D5] overflow-hidden shadow-xl">
              {venue.resources?.find(r => r.id === selectedResource)?.image && (
                <div className="relative h-52">
                  <img 
                    src={venue.resources.find(r => r.id === selectedResource)?.image} 
                    alt="Beach"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#B8956A] via-[#D4AF37] to-[#B8956A]" />
                  <div className="absolute bottom-5 left-6 right-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Umbrella className="w-5 h-5 text-[#D4AF37]" />
                      <h3 className="text-white text-2xl font-bold font-serif">
                        {venue.resources.find(r => r.id === selectedResource)?.name}
                      </h3>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-[#E8E3D5]">
                  <div className="flex items-center gap-2 text-[#8B8680]">
                    <Calendar className="w-4 h-4" />
                    <span className="font-semibold">{t('Beach Day', 'يوم الشاطئ')}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#1A1A1C] font-bold">
                      {new Date(selectedDate).toLocaleDateString(getDateLocale(language), { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    {isWeekend(selectedDate) && (
                      <div className="text-xs text-[#D4AF37] font-bold mt-0.5">{t('resort.weekend')}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-[#E8E3D5]">
                  <div className="flex items-center gap-2 text-[#8B8680]">
                    <Sun className="w-4 h-4" />
                    <span className="font-semibold">{t('resort.pass_type')}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#1A1A1C] font-bold text-lg">
                      {passTypes.find(pt => pt.id === selectedPassType)?.label}
                    </span>
                    <div className="text-xs text-[#8B8680] mt-0.5">
                      {passTypes.find(pt => pt.id === selectedPassType)?.time}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-[#E8E3D5]">
                  <div className="flex items-center gap-2 text-[#8B8680]">
                    <Users className="w-4 h-4" />
                    <span className="font-semibold">{t('resort.guests')}</span>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map(size => (
                      <button
                        key={size}
                        onClick={() => setPartySize(size)}
                        className={`w-10 h-10 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                          partySize === size
                            ? 'border-[#B8956A] bg-gradient-to-br from-[#F8F6F1] to-[#FAF8F3] text-[#B8956A] scale-110 shadow-lg'
                            : 'border-[#E8E3D5] text-[#8B8680] hover:border-[#D4B896] hover:scale-105'
                        }`}
                      >
                        <span className="text-sm font-bold">{size}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Exclusive Perks — boost perks excluded, same as customer app */}
                {(() => {
                  const exclusivePerks = resolveExclusivePerks((venue.perks || []).filter(p => !isBoostPerk(p)));
                  if (!exclusivePerks.length) return null;
                  return (
                    <div className="py-4 border-b border-[#E8E3D5]">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-[#F8F5F0] border border-[#D4A574]/40 flex items-center justify-center">
                          <Gift className="w-4 h-4 text-[#D4A574]" />
                        </div>
                        <span className="font-semibold text-[#1A1A1C]">{t('exclusive_perks', 'Exclusive Perks')}</span>
                        <span className="text-xs text-[#8B8680]">({t('optional', 'optional')})</span>
                      </div>
                      <div className="space-y-2">
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

                <div className="flex items-center justify-between pt-5">
                  <div>
                    <div className="text-[#8B8680] text-sm mb-1">{t('resort.day_pass_total')}</div>
                    <div className="text-[#1A1A1C] font-bold">{partySize} {partySize === 1 ? t('resort.guest') : t('resort.guests')} × {resourceAvailability.find(a => a.resourceId === selectedResource)?.price} AED</div>
                  </div>
                  <div className="text-right">
                    <div className="text-5xl text-[#B8956A] font-bold leading-none mb-1 font-serif">
                      {(resourceAvailability.find(a => a.resourceId === selectedResource)?.price || 0) * partySize}
                    </div>
                    <div className="text-sm text-[#8B8680] font-bold uppercase tracking-wider">AED</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Policy */}
            <div className="bg-gradient-to-r from-[#F8F6F1] via-[#FAF8F3] to-[#F8F6F1] p-5 rounded-2xl border-2 border-[#E8E3D5]">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B8956A] to-[#D4AF37] flex items-center justify-center flex-shrink-0">
                  <Info className="w-5 h-5 text-white" />
                </div>
                <div className="text-sm text-[#5C5850]">
                  <p className="font-bold mb-2 text-[#1A1A1C]">{t('resort.beach_day_details')} 🌴</p>
                  <ul className="space-y-1 text-xs leading-relaxed">
                    <li>✓ {t('resort.full_day_access')}</li>
                    <li>✓ {t('resort.all_amenities')}</li>
                    <li>✓ {t('resort.payment_arrival')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Booking Confirmation */}
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
                      <span className="text-[#1A1A1C] font-medium">
                        {new Date(selectedDate).toLocaleDateString(getDateLocale(language), { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-[#F8F6F1] rounded-xl">
                      <Clock className="w-5 h-5 text-[#8B8680]" />
                      <span className="text-[#1A1A1C] font-medium">
                        {passTypes.find(pt => pt.id === selectedPassType)?.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-[#F8F6F1] rounded-xl">
                      <Users className="w-5 h-5 text-[#8B8680]" />
                      <span className="text-[#1A1A1C] font-medium">{partySize} {t('booking.guests_label', 'Guests')}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-[#E8E3D5] bg-white text-[#5C5850] font-semibold hover:border-[#D4AF37] hover:scale-105 transition-all cursor-pointer">
                    <Download className="w-5 h-5" />
                    {t('booking.download', 'Download')}
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-[#E8E3D5] bg-white text-[#5C5850] font-semibold hover:border-[#D4AF37] hover:scale-105 transition-all cursor-pointer">
                    <Share2 className="w-5 h-5" />
                    {t('booking.share', 'Share')}
                  </button>
                </div>

                {/* Navigation Buttons */}
                <button
                  onClick={handleViewBookings}
                  className="w-full py-4 bg-gradient-to-r from-[#B8956A] to-[#D4AF37] text-white rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
                >
                  {t('booking.view_bookings', 'View My Bookings')}
                </button>
                <button
                  onClick={handleBackToHome}
                  className="w-full py-4 text-[#B8956A] font-semibold hover:underline transition-all cursor-pointer"
                >
                  {t('booking.back_home', 'Back to Home')}
                </button>
              </>
            )}

            {/* Back to Home button when still pending */}
            {bookingStatus !== 'confirmed' && (
              <button
                onClick={handleBackToHome}
                className="w-full py-4 bg-gradient-to-r from-[#B8956A] to-[#D4AF37] text-white rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
              >
                {t('booking.back_home', 'Back to Home')}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      {currentStep < 4 && (
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-[#E8E3D5]/50 p-5 z-50">
        <div className="flex items-center gap-3 max-w-5xl mx-auto">
          {currentStep > 1 && (
            <button
              onClick={() => {
                const hasResources = venue.resources && venue.resources.length > 0;
                const prevStep = currentStep - 1;
                // Skip step 2 when going back if venue has no resources
                setCurrentStep(prevStep === 2 && !hasResources ? 1 : prevStep);
                window.scrollTo(0, 0);
              }}
              className="px-6 py-4 bg-white border-2 border-[#E8E3D5] text-[#5C5850] rounded-xl hover:bg-[#F8F6F1] hover:border-[#D4B896] hover:scale-105 transition-all duration-300 font-bold active:scale-95 cursor-pointer"
            >
              {t('booking.back')}
            </button>
          )}
          
          <button
            onClick={() => {
              if (currentStep === 1) {
                const hasResources = venue.resources && venue.resources.length > 0;
                setCurrentStep(hasResources ? 2 : 3);
                window.scrollTo(0, 0);
                return;
              }
              if (currentStep === 2 && !selectedResource) {
                toast.error(t('resort.select_section_error', 'Please select a beach section to continue.'));
                return;
              }
              if (currentStep === 3) {
                handleConfirmBooking();
              } else {
                setCurrentStep(currentStep + 1);
                window.scrollTo(0, 0);
              }
            }}
            disabled={currentStep === 1 && !canProceedToStep2}
            className="flex-1 px-8 py-5 bg-gradient-to-r from-[#B8956A] to-[#D4AF37] text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-500 font-bold disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg active:scale-95 disabled:hover:scale-100 cursor-pointer"
          >
            {currentStep === 3 ? (
              <>
                <Palmtree className="w-6 h-6" />
                {t('resort.reserve_beach')} 🏖️
              </>
            ) : (
              <>
                {t('resort.continue')}
                <ChevronRight className="w-6 h-6" />
              </>
            )}
          </button>
        </div>
      </div>
      )}
    </div>
  );
}
