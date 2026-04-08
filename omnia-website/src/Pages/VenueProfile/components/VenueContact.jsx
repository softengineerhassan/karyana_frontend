import React from 'react';
import { Phone, Globe, MapPin, Calendar, Mail, Instagram, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/Shared/Card';
import { getLocalizedField } from '@/lib/localization';

export function VenueContact({ venue }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const language = i18n.language;

  const hasCoords = !!(venue?.latitude || venue?.lat || venue?.longitude || venue?.lng);
  const canOpenMap = hasCoords || !!(venue?.address_en || venue?.location);

  const handleOpenMap = () => {
    navigate('/venue-map', { state: { venue } });
  };

  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayKey = days[new Date().getDay()];
  const operatingHours = venue.operatingHours || venue.operating_hours || [];
  const phone = venue.phone || venue.phone_number;

  return (
    <Card className="p-6">
      <h4 className="text-[#1A1A1C] mb-4 text-xl flex items-center gap-2 font-serif font-semibold">
        <Phone className="w-5 h-5 text-[#D4AF37]" />
        {t('contact_hours', 'Contact & Hours')}
      </h4>

      <div className="space-y-4">
        {/* Contact Details */}
        <div className="space-y-3">
          {/* Phone */}
          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-3 p-3 bg-[#F8F6F1] rounded-xl border border-[#E8E3D5] hover:border-[#D4AF37]/40 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37]/10 to-[#CD7F32]/10 border border-[#D4AF37]/20 flex items-center justify-center">
                <Phone className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div className="flex-1">
                <p className="text-[#8B8680] text-xs uppercase tracking-wider">{t('phone', 'Phone')}</p>
                <p className="text-[#1A1A1C] font-semibold">{phone}</p>
              </div>
            </a>
          )}

          {/* Email */}
          {venue.email && (
            <a
              href={`mailto:${venue.email}`}
              className="flex items-center gap-3 p-3 bg-[#F8F6F1] rounded-xl border border-[#E8E3D5] hover:border-[#D4AF37]/40 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37]/10 to-[#CD7F32]/10 border border-[#D4AF37]/20 flex items-center justify-center">
                <Mail className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div className="flex-1">
                <p className="text-[#8B8680] text-xs uppercase tracking-wider">{t('email', 'Email')}</p>
                <p className="text-[#1A1A1C] font-semibold truncate">{venue.email}</p>
              </div>
            </a>
          )}

          {/* Website */}
          {venue.website && (
            <a
              href={venue.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-[#F8F6F1] rounded-xl border border-[#E8E3D5] hover:border-[#D4AF37]/40 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37]/10 to-[#CD7F32]/10 border border-[#D4AF37]/20 flex items-center justify-center">
                <Globe className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div className="flex-1">
                <p className="text-[#8B8680] text-xs uppercase tracking-wider">{t('website', 'Website')}</p>
                <p className="text-[#1A1A1C] font-semibold truncate">{venue.website}</p>
              </div>
            </a>
          )}

          {/* Instagram */}
          {venue.instagram && (
            <div className="flex items-center gap-3 p-3 bg-[#F8F6F1] rounded-xl border border-[#E8E3D5]">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37]/10 to-[#CD7F32]/10 border border-[#D4AF37]/20 flex items-center justify-center">
                <Instagram className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div className="flex-1">
                <p className="text-[#8B8680] text-xs uppercase tracking-wider">{t('instagram', 'Instagram')}</p>
                <p className="text-[#1A1A1C] font-semibold">{venue.instagram}</p>
              </div>
            </div>
          )}

          {/* Address — tappable → opens map screen */}
          <button
            onClick={canOpenMap ? handleOpenMap : undefined}
            className={`w-full flex items-center gap-3 p-3 bg-[#F8F6F1] rounded-xl border border-[#E8E3D5] text-left transition-all ${canOpenMap ? 'hover:border-[#D4AF37]/50 hover:bg-[#FFFDF5] active:scale-[0.99] cursor-pointer' : ''}`}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37]/10 to-[#CD7F32]/10 border border-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#8B8680] text-xs uppercase tracking-wider">{t('address', 'Address')}</p>
              <p className="text-[#1A1A1C] font-semibold truncate">
                {getLocalizedField(venue, 'address', language)}
              </p>
              {getLocalizedField(venue, 'city', language) && (
                <p className="text-[#8B8680] text-sm">{getLocalizedField(venue, 'city', language)}</p>
              )}
            </div>
            {canOpenMap && (
              <ExternalLink className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
            )}
          </button>
        </div>

        {/* Operating Hours */}
        {operatingHours.length > 0 && (
          <div className="pt-4 border-t border-[#E8E3D5]">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-[#D4AF37]" />
              <h5 className="text-[#1A1A1C] font-semibold">{t('opening_hours', 'Opening Hours')}</h5>
            </div>
            <div className="space-y-2">
              {operatingHours.map((hours) => {
                const dayName = hours.day_of_week;
                const isToday = dayName?.toLowerCase() === todayKey;
                const displayDay = dayName ? dayName.charAt(0).toUpperCase() + dayName.slice(1) : '';
                const isClosed = !hours.is_open;

                return (
                  <div
                    key={hours.id || dayName}
                    className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                      isToday ? 'bg-[#D4AF37]/10 border border-[#D4AF37]/30' : ''
                    }`}
                  >
                    <span className={`font-semibold ${isToday ? 'text-[#D4AF37]' : 'text-[#5C5850]'}`}>
                      {t(dayName, displayDay)}
                    </span>
                    <span className={`${
                      isClosed
                        ? 'text-[#B85450]'
                        : isToday
                          ? 'text-[#D4AF37] font-semibold'
                          : 'text-[#8B8680]'
                    }`}>
                      {isClosed
                        ? t('closed', 'Closed')
                        : `${hours.open_time} - ${hours.close_time}`
                      }
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
