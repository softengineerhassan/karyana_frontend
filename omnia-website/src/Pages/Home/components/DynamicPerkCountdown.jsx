import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from "@/lib/utils";

// Build a parseable ISO string from date + optional time parts.
// Handles: date-only, datetime with T, datetime with space, time with/without seconds.
function buildIso(date, time) {
  const d = String(date).trim();
  // If date already has a time component, use as-is (replace space with T)
  if (d.includes('T') || (d.includes(' ') && d.length > 10)) {
    return d.replace(' ', 'T');
  }
  if (time) {
    return `${d}T${String(time).trim()}`;
  }
  return d;
}

// Safe ms parser — returns NaN for null/invalid, never throws
function parseToMs(date, time) {
  if (!date) return NaN;
  try {
    const iso = buildIso(date, time);
    const ms = new Date(iso).getTime();
    return ms;
  } catch {
    return NaN;
  }
}

// Boost end date in ms — ONLY uses boost_end_date/boost_end_time fields.
// No boost_end_time → defaults to 23:59:59 (end of day), matching customer app.
// Handles AM/PM time formats.
// Returns NaN if no boost_end_date.
export function getBoostEndMs(perk) {
  const endDate = perk.boost_end_date || perk.boostEndDate;
  if (!endDate) return NaN;

  let date;
  try {
    const d = String(endDate).trim();
    date = d.includes('T') ? new Date(d) : new Date(`${d}T00:00:00`);
    if (isNaN(date.getTime())) return NaN;
  } catch {
    return NaN;
  }

  const endTime = perk.boost_end_time || perk.boostEndTime;
  if (endTime) {
    try {
      const timeStr = String(endTime).toUpperCase();
      const isPM = timeStr.includes('PM');
      const isAM = timeStr.includes('AM');
      const cleanTime = timeStr.replace(/[^0-9:]/g, '');
      const parts = cleanTime.split(':');
      if (parts.length > 0) {
        let hours = parseInt(parts[0], 10) || 0;
        const minutes = parts.length > 1 ? parseInt(parts[1], 10) || 0 : 0;
        const seconds = parts.length > 2 ? parseInt(parts[2], 10) || 0 : 0;
        if (isPM && hours < 12) hours += 12;
        if (isAM && hours === 12) hours = 0;
        date.setHours(hours, minutes, seconds, 0);
        return date.getTime();
      }
    } catch {
      // fallback to end of day
    }
  }

  // No boost_end_time → end of day (23:59:59)
  date.setHours(23, 59, 59, 0);
  return date.getTime();
}

// Exclusive perk end date in ms — ONLY uses end_date/end_time fields.
// Returns NaN if no end_date (= never expires).
export function getExclusiveEndMs(perk) {
  return parseToMs(
    perk.end_date || perk.endDate,
    perk.end_time || perk.endTime
  );
}

// Get end date in ms — dispatches to the correct fields based on perk type.
// Boost perks: boost_end_date only. Exclusive perks: end_date only.
export function getPerkEndMs(perk) {
  const cat = (perk.perk_category || perk.perkCategory || perk.category || '').toLowerCase();
  const type = (perk.perk_type || perk.perkType || '').toLowerCase();
  const isBoost = cat === 'boost' || type === 'boost' || !!perk.boost_package_id || !!perk.boostPackageId;

  if (isBoost) return getBoostEndMs(perk);
  return getExclusiveEndMs(perk);
}

function calcTimeLeft(endMs) {
  if (!isFinite(endMs)) return null; // handles NaN, Infinity, -Infinity
  const diff = endMs - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  const days    = Math.floor(diff / 86400000);
  const hours   = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds, isExpired: false };
}

function formatCompact(t) {
  if (t.days >= 1)  return `${t.days}d ${t.hours}h`;
  if (t.hours >= 1) return `${pad(t.hours)}:${pad(t.minutes)}:${pad(t.seconds)}`;
  return `${pad(t.minutes)}:${pad(t.seconds)}`;
}

function formatFull(t) {
  if (t.days >= 1)  return `${t.days}d ${t.hours}h`;
  if (t.hours >= 1) return `${t.hours}h ${t.minutes}m`;
  return `${pad(t.minutes)}:${pad(t.seconds)}`;
}

function pad(n) { return String(n).padStart(2, '0'); }

// Pass either `endMs` (number from getPerkEndMs) or `endDate` (raw string)
export function DynamicPerkCountdown({ endDate, endMs: endMsProp, compact = false, className = '' }) {
  const { t } = useTranslation();

  const resolvedMs = (endMsProp !== undefined && endMsProp !== null)
    ? endMsProp
    : parseToMs(endDate, null);

  const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(resolvedMs));

  useEffect(() => {
    setTimeLeft(calcTimeLeft(resolvedMs));
    if (!isFinite(resolvedMs)) return;
    const timer = setInterval(() => setTimeLeft(calcTimeLeft(resolvedMs)), 1000);
    return () => clearInterval(timer);
  }, [resolvedMs]);

  if (timeLeft === null) return null;

  if (timeLeft.isExpired) {
    return (
      <div className={cn("text-luxury-gray text-xs font-medium", className)}>
        {t('countdown.expired', 'Expired')}
      </div>
    );
  }

  const totalHours = timeLeft.days * 24 + timeLeft.hours;
  const urgencyClass = totalHours < 6
    ? 'text-gold-danger border-gold-danger/30'
    : totalHours < 24
    ? 'text-luxury-warning border-luxury-warning/30'
    : 'text-gold-primary border-gold-primary/30';

  if (compact) {
    return (
      <div className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg backdrop-blur-md shadow-lg bg-white border-2",
        urgencyClass,
        className
      )}>
        <Clock className="w-3 h-3" />
        <span className="text-[11px] font-bold tabular-nums">
          {formatCompact(timeLeft)}
        </span>
      </div>
    );
  }

  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-sm bg-white/90 border",
      urgencyClass,
      className
    )}>
      <Clock className="w-4 h-4" />
      <div className="flex items-center gap-1">
        <span className="text-sm font-semibold tabular-nums">
          {formatFull(timeLeft)}
        </span>
        <span className="text-xs text-luxury-gray ml-1">{t('countdown.left', 'left')}</span>
      </div>
    </div>
  );
}
