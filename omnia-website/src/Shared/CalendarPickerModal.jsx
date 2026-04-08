import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, Crown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getDateLocale } from '@/lib/localization';

// Use local date parts to avoid UTC offset shifting the date (e.g. UTC+4 midnight → previous day UTC)
function toLocalISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function CalendarPickerModal({ 
  selectedDate, 
  onDateSelect, 
  minDate = new Date(),
  maxDate,
  accentColor = '#9D8B7A',
  label,
  labelAr,
  showPremiumDays = false,
  premiumDayChecker
}) {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(selectedDate ? new Date(selectedDate) : new Date());
  const modalRef = useRef(null);

  const daysOfWeekMap = {
    en: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
    ar: ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'],
    fr: ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'],
  };
  const daysOfWeek = daysOfWeekMap[language] || daysOfWeekMap.en;

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // Get all days in the current month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty slots for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const days = getDaysInMonth(currentMonth);

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    onDateSelect(toLocalISO(today));
    setIsOpen(false);
  };

  const goToTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setCurrentMonth(tomorrow);
    onDateSelect(toLocalISO(tomorrow));
    setIsOpen(false);
  };

  const isDateDisabled = (date) => {
    if (!date) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    
    return false;
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    if (!date || !selectedDate) return false;
    return toLocalISO(date) === selectedDate;
  };

  const formatDisplayDate = () => {
    if (!selectedDate) return t('select_date', 'Select a date');
    const date = new Date(selectedDate);
    return date.toLocaleDateString(getDateLocale(language), { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const getDisplayLabel = () => {
    if (!selectedDate) return null;
    const date = new Date(selectedDate);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return t('today', 'TODAY');
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return t('tomorrow', 'TOMORROW');
    }
    return label || labelAr || null;
  };

  const handleDateSelect = (date) => {
    onDateSelect(toLocalISO(date));
    setIsOpen(false);
  };

  return (
    <>
      {/* Date Display Button - Clickable */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-white border-2 border-[#E8E3D5] rounded-2xl p-5 shadow-sm hover:border-[#9D8B7A]/40 hover:shadow-lg transition-all duration-300 active:scale-[0.99]"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 text-left">
            {getDisplayLabel() && (
              <p className="text-[#8B8680] text-xs uppercase tracking-wide mb-1 font-bold">
                {getDisplayLabel()}
              </p>
            )}
            <p className="text-[#1A1A1C] text-xl font-bold font-serif">
              {formatDisplayDate()}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F8F6F1] flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-[#8B8680]" />
          </div>
        </div>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 animate-fadeIn">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Calendar Modal */}
          <div 
            ref={modalRef}
            className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-md sm:w-full max-h-[85vh] sm:max-h-[90vh] overflow-y-auto"
          >
            {/* Mobile Handle */}
            <div className="sm:hidden flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-[#E8E3D5] rounded-full" />
            </div>

            {/* Close Button - Desktop Only */}
            <button
              onClick={() => setIsOpen(false)}
              className="hidden sm:flex absolute top-4 right-4 z-10 w-9 h-9 rounded-xl bg-[#F8F6F1] items-center justify-center hover:bg-[#E8E3D5] hover:scale-110 transition-all duration-300 active:scale-95"
            >
              <X className="w-4 h-4 text-[#5C5850]" />
            </button>

            <div className="p-5 sm:p-6">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={goToPreviousMonth}
                  className="w-11 h-11 sm:w-10 sm:h-10 rounded-xl bg-[#F8F6F1] flex items-center justify-center hover:bg-[#E8E3D5] active:scale-95 transition-all duration-300"
                >
                  <ChevronLeft className="w-5 h-5 text-[#5C5850]" />
                </button>

                <h3 className="text-[#1A1A1C] text-xl sm:text-xl font-bold font-serif">
                  {currentMonth.toLocaleDateString(getDateLocale(language), { month: 'long', year: 'numeric' })}
                </h3>

                <button
                  onClick={goToNextMonth}
                  className="w-11 h-11 sm:w-10 sm:h-10 rounded-xl bg-[#F8F6F1] flex items-center justify-center hover:bg-[#E8E3D5] active:scale-95 transition-all duration-300"
                >
                  <ChevronRight className="w-5 h-5 text-[#5C5850]" />
                </button>
              </div>

              {/* Day Labels */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3">
                {daysOfWeek.map((day) => (
                  <div key={day} className="text-center">
                    <span className="text-[#8B8680] text-[0.65rem] sm:text-xs font-bold uppercase tracking-wide">
                      {day}
                    </span>
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-6">
                {days.map((date, index) => {
                  const disabled = isDateDisabled(date);
                  const selected = isSelected(date);
                  const today = isToday(date);
                  const isPremiumDay = showPremiumDays && premiumDayChecker && date ? premiumDayChecker(date) : false;

                  if (!date) {
                    return <div key={`empty-${index}`} className="aspect-square" />;
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => !disabled && handleDateSelect(date)}
                      disabled={disabled}
                      className={`
                        relative aspect-square rounded-xl font-bold transition-all duration-300 text-sm sm:text-sm min-h-[44px]
                        ${disabled 
                          ? 'text-[#E8E3D5] cursor-not-allowed' 
                          : selected
                          ? 'text-white shadow-lg scale-105 sm:scale-110'
                          : today
                          ? 'bg-[#F8F6F1] text-[#1A1A1C] border-2 active:bg-[#E8E3D5]'
                          : 'bg-white text-[#1A1A1C] border border-[#E8E3D5] active:bg-[#F8F6F1] active:scale-95'
                        }
                      `}
                      style={
                        selected 
                          ? { backgroundColor: accentColor }
                          : today
                          ? { borderColor: accentColor }
                          : isPremiumDay
                          ? { backgroundColor: '#F8F6F1', color: '#1A1A1C', borderColor: accentColor }
                          : {}
                      }
                    >
                      {date.getDate()}
                      {isPremiumDay && !selected && (
                        <Crown className="absolute top-0.5 right-0.5 w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3 pt-6 border-t-2 border-[#E8E3D5]">
                <button
                  onClick={goToToday}
                  className="py-4 sm:py-3 rounded-xl border-2 border-[#E8E3D5] bg-white text-[#1A1A1C] font-bold active:bg-[#F8F6F1] transition-all duration-300 active:scale-95 text-base sm:text-sm hover:border-[#D4AF37]/40"
                >
                  {t('today', 'Today')}
                </button>
                <button
                  onClick={goToTomorrow}
                  className="py-4 sm:py-3 rounded-xl border-2 border-[#E8E3D5] bg-white text-[#1A1A1C] font-bold active:bg-[#F8F6F1] transition-all duration-300 active:scale-95 text-base sm:text-sm hover:border-[#D4AF37]/40"
                >
                  {t('tomorrow', 'Tomorrow')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
