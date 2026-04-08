/**
 * Localization helper for data-level content.
 *
 * Supports two naming conventions:
 *   API (snake_case):  obj.name_en, obj.name_ar, obj.name_fr
 *   Legacy (camelCase): obj.name,   obj.nameAr,  obj.nameFr
 *
 * Usage:
 *   import { getLocalizedField } from '@/lib/localization';
 *   const name = getLocalizedField(venue, 'name', language);
 */

const camelSuffix = { en: '', ar: 'Ar', fr: 'Fr' };

/**
 * Get a localized field value from an object based on the current language.
 * Tries API pattern first (field_lang), then legacy pattern (fieldLang),
 * then falls back to English variants.
 */
export const getLocalizedField = (obj, field, language = 'en') => {
  if (!obj) return '';

  // 1. Try API snake_case: field_lang  (e.g. name_en, name_ar)
  const apiKey = `${field}_${language}`;
  if (obj[apiKey] != null) return obj[apiKey];

  // 2. Try legacy camelCase: field / fieldAr / fieldFr
  const suffix = camelSuffix[language] || '';
  const camelKey = suffix ? `${field}${suffix}` : field;
  if (obj[camelKey] != null) return obj[camelKey];

  // 3. Fallback: English API → English legacy → empty
  if (obj[`${field}_en`] != null) return obj[`${field}_en`];
  if (obj[field] != null) return obj[field];

  return '';
};

/**
 * Get the Intl / toLocaleDateString locale string for a language code.
 */
const dateLocaleMap = { en: 'en-US', ar: 'ar-AE', fr: 'fr-FR' };

export const getDateLocale = (language) => {
  return dateLocaleMap[language] ?? 'en-US';
};

export default getLocalizedField;
