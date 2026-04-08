import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/Shared/Card';

export function VenueGallery({ venue, selectedImage, onSelectImage }) {
  const { t } = useTranslation();

  if (!venue.gallery || venue.gallery.length <= 1) return null;

  return (
    <Card className="p-6">
      <h4 className="text-[#1A1A1C] mb-4 text-xl font-serif font-semibold">
        {t('gallery')}
      </h4>
      <div className="grid grid-cols-3 gap-3">
        {venue.gallery.map((image, index) => (
          <button
            key={index}
            onClick={() => onSelectImage(index)}
            className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
              index === selectedImage ? 'border-[#D4AF37] shadow-lg' : 'border-transparent'
            }`}
          >
            <img 
              src={image} 
              alt={`${venue.name} ${index + 1}`} 
              className="w-full h-full object-cover" 
            />
          </button>
        ))}
      </div>
    </Card>
  );
}
