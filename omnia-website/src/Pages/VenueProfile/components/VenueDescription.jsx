import React from 'react';
import { Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/Shared/Card';
import { getLocalizedField } from '@/lib/localization';

export function VenueDescription({ venue }) {
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  return (
    <Card className="p-6">
      <h4 className="text-[#1A1A1C] mb-3 text-xl flex items-center gap-2 font-serif font-semibold">
        <Award className="w-5 h-5 text-[#D4AF37]" />
        {t('about')}
      </h4>
      <p className="text-[#5C5850] leading-relaxed">
        {getLocalizedField(venue, 'description', language)}
      </p>
    </Card>
  );
}
