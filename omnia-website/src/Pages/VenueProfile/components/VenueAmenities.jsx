import React from 'react';
import {
  Wifi, Car, Music, Gift, Snowflake, Wind, Shield,
  Tv, Volume2, Coffee, Dumbbell, Waves, Utensils, Star
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/Shared/Card';

// Map icon name strings from API to Lucide components
const iconMap = {
  Wifi, WiFi: Wifi,
  Car, Snowflake, Wind, Shield, Tv, Volume2,
  Coffee, Music, Dumbbell, Waves, Utensils, Star,
  Gift,
};

function getAmenityIcon(iconName) {
  if (!iconName) return Gift;
  // Try direct match
  if (iconMap[iconName]) return iconMap[iconName];
  // Try case-insensitive
  const key = Object.keys(iconMap).find(k => k.toLowerCase() === iconName.toLowerCase());
  return key ? iconMap[key] : Gift;
}

export function VenueAmenities({ venue }) {
  const { t } = useTranslation();

  if (!venue.amenities || venue.amenities.length === 0) return null;

  return (
    <Card className="p-6">
      <h4 className="text-[#1A1A1C] mb-4 text-xl font-serif font-semibold">
        {t('amenities', 'Amenities')}
      </h4>
      <div className="grid grid-cols-2 gap-3">
        {venue.amenities.map((amenity, index) => {
          const name = typeof amenity === 'object' && amenity !== null ? amenity.name : amenity;
          const iconName = typeof amenity === 'object' && amenity !== null ? amenity.icon : null;
          const Icon = getAmenityIcon(iconName || name);

          return (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-[#F8F6F1] rounded-2xl border border-[#E8E3D5]"
            >
              <Icon className="w-5 h-5 text-[#D4AF37]" />
              <span className="text-[#1A1A1C] font-semibold text-sm">{name}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
