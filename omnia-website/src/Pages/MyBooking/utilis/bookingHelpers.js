import { getLocalizedField } from '@/lib/localization';

export const getPerkDetails = (perksApplied, language) => {
  if (!Array.isArray(perksApplied)) return [];
  return perksApplied.map((p) => ({
    title: getLocalizedField(p, 'title', language),
    description: getLocalizedField(p, 'description', language),
  }));
};

export const applyModification = (booking, modifications) => {
  if (!modifications) return booking;
  return {
    ...booking,
    ...modifications,
    isModified: true,
  };
};
