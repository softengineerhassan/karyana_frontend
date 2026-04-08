import { getExclusiveEndMs } from '@/Pages/Home/components/DynamicPerkCountdown';

/**
 * Centralized perk utility — mirrors customer app's Perk model logic exactly.
 *
 * Customer app reference: lib/app/data/models/perk_model.dart
 *   - isBoostPerk      → perkCategory == 'boost' || perkType == 'boost' || boostPackageId != null
 *   - isBoostActive     → parsedBoostEndTime != null && endTime.isAfter(now)
 *                         (no boost_end_date = NOT active)
 *   - isExpired (boost) → !isBoostActive
 *   - isExpired (other) → parsedEndTime != null && now.isAfter(parsedEndTime)
 *                         (no end_date = never expires)
 *   - filterExclusivePerks → boosts: keep only active; exclusives: primary→backup→any per type
 */

// ── Detection ──────────────────────────────────────────────────────────────────

export function isBoostPerk(p) {
  const cat = (p.perk_category || p.perkCategory || p.category || '').toLowerCase();
  const type = (p.perk_type || p.perkType || '').toLowerCase();
  return cat === 'boost' || type === 'boost' || !!p.boost_package_id || !!p.boostPackageId;
}

// ── Active / Expired ───────────────────────────────────────────────────────────

/**
 * Parse boost end datetime — mirrors customer app's parsedBoostEndTime exactly.
 * - No boost_end_date → null
 * - No boost_end_time → defaults to 23:59:59 (end of day)
 * - Handles AM/PM time formats
 * Returns Date or null.
 */
function parseBoostEndTime(p) {
  const endDate = p.boost_end_date || p.boostEndDate;
  if (!endDate) return null;

  let date;
  try {
    // Parse date — append T00:00:00 to avoid UTC interpretation of date-only strings
    const d = String(endDate).trim();
    date = d.includes('T') ? new Date(d) : new Date(`${d}T00:00:00`);
    if (isNaN(date.getTime())) return null;
  } catch {
    return null;
  }

  const endTime = p.boost_end_time || p.boostEndTime;
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
        return date;
      }
    } catch {
      return date; // fallback to just date if time parsing fails
    }
  }

  // No boost_end_time → end of day (23:59:59) — matches customer app line 229
  date.setHours(23, 59, 59, 0);
  return date;
}

/**
 * Customer app: isBoostActive → parsedBoostEndTime != null && isAfter(now).
 * A boost with NO boost_end_date is NOT active.
 */
export function isBoostActive(p) {
  const endTime = parseBoostEndTime(p);
  if (!endTime) return false;
  return endTime.getTime() > Date.now();
}

/**
 * Customer app: isExpired for non-boost perks.
 * No end_date = never expires (returns false = not expired).
 */
export function isExclusivePerkActive(p) {
  const ms = getExclusiveEndMs(p);
  return isNaN(ms) || ms > Date.now();
}

/**
 * Unified active check that dispatches to the right logic per perk category.
 */
export function isPerkActive(p) {
  if (isBoostPerk(p)) return isBoostActive(p);
  return isExclusivePerkActive(p);
}

// ── Filtering ──────────────────────────────────────────────────────────────────

/**
 * Customer app: filterExclusivePerks() — static method on Perk model.
 *
 * 1. Boosts: keep only active (boost_end_date in future)
 * 2. Non-boost, non-exclusive: keep as-is
 * 3. Exclusive: per perk_type group → primary → backup → first active
 */
export function filterPerks(perks) {
  if (!perks || perks.length === 0) return [];

  // Boosts — only active ones
  const boostPerks = perks.filter(p => isBoostPerk(p) && isBoostActive(p));

  // Non-exclusive, non-boost — keep as-is
  const otherPerks = perks.filter(p => {
    if (isBoostPerk(p)) return false;
    const cat = (p.perk_category || p.perkCategory || p.category || '').toLowerCase();
    return cat !== 'exclusive';
  });

  // Exclusive — primary/backup resolution per type
  const exclusivePerks = perks.filter(p => {
    if (isBoostPerk(p)) return false;
    const cat = (p.perk_category || p.perkCategory || p.category || '').toLowerCase();
    return cat === 'exclusive';
  });

  const chosenExclusives = resolveExclusivePerks(exclusivePerks);

  return [...boostPerks, ...otherPerks, ...chosenExclusives];
}

/**
 * Resolve exclusive perks: per perk_type group → primary → backup → any active.
 * Final fallback: if no role matched, use first active exclusive.
 */
export function resolveExclusivePerks(exclusivePerks) {
  if (!exclusivePerks.length) return [];

  const byType = {};
  for (const p of exclusivePerks) {
    const type = (p.perk_type || p.perkType || 'default').toLowerCase();
    if (!byType[type]) byType[type] = [];
    byType[type].push(p);
  }

  const chosen = [];

  function processType(type) {
    const group = byType[type];
    if (!group) return;

    const primary = group.find(p => (p.perk_role || p.role || '').toLowerCase() === 'primary');
    if (primary && isExclusivePerkActive(primary)) {
      chosen.push(primary);
      return;
    }
    const backup = group.find(p => (p.perk_role || p.role || '').toLowerCase() === 'backup');
    if (backup && isExclusivePerkActive(backup)) {
      chosen.push(backup);
      return;
    }
  }

  processType('always');
  processType('conditional');

  // Final fallback: if nothing matched role logic, use first active exclusive
  if (chosen.length === 0 && exclusivePerks.length > 0) {
    const firstActive = exclusivePerks.find(p => isExclusivePerkActive(p));
    if (firstActive) chosen.push(firstActive);
  }

  return chosen;
}
