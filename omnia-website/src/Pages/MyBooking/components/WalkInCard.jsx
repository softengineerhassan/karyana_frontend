import { Calendar, MapPin, QrCode, CheckCircle, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card } from "@/Shared/Card";

export default function WalkInCard({ redemption, onShowQR }) {
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  const perkTitle =
    language === "ar"
      ? redemption.perk_title_ar || redemption.perk_title_en
      : language === "fr"
        ? redemption.perk_title_fr || redemption.perk_title_en
        : redemption.perk_title_en;

  const perkDescription =
    language === "ar"
      ? redemption.perk_description_ar || redemption.perk_description_en
      : language === "fr"
        ? redemption.perk_description_fr || redemption.perk_description_en
        : redemption.perk_description_en;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString(
        language === "ar" ? "ar-SA" : language === "fr" ? "fr-FR" : "en-US",
        { weekday: "short", year: "numeric", month: "short", day: "numeric" }
      );
    } catch {
      return dateStr;
    }
  };

  const isExpired = redemption.qr_expires_at
    ? new Date(redemption.qr_expires_at) < new Date()
    : false;

  const isRedeemed = redemption.is_redeemed;

  const getStatusBadge = () => {
    if (isRedeemed) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#EFF6EC] border border-[#BFD8B8] text-[#3A7D2C]">
          <CheckCircle size={12} />
          {t("Redeemed")}
        </span>
      );
    }
    if (isExpired) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FFEBEE] border border-[#FFCDD2] text-[#D32F2F]">
          {t("Expired")}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FFF9E6] border border-[#FFE8A3] text-[#D4AF37]">
        {t("Available")}
      </span>
    );
  };

  return (
    <Card
      padding="lg"
      hover
      className={`flex flex-col h-full ${isExpired && !isRedeemed ? "opacity-50" : ""}`}
    >
      <div className="flex items-start justify-between">
        <h4
          className="text-lg mb-2 flex-1"
          style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600 }}
        >
          {perkTitle}
        </h4>
        {!isRedeemed && !isExpired && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShowQR?.(redemption);
            }}
            className="p-2 bg-[#D4AF37]/10 rounded-xl hover:bg-[#D4AF37]/20 transition-all cursor-pointer"
          >
            <QrCode size={18} className="text-[#D4AF37]" />
          </button>
        )}
      </div>

      <div className="flex">{getStatusBadge()}</div>

      <div className="space-y-2 mt-4 text-sm text-[#5C5850]">
        {perkDescription && (
          <p className="text-[#8B8680] text-xs">{perkDescription}</p>
        )}
        {redemption.venue_name && (
          <div className="flex gap-2 items-center">
            <MapPin size={16} className="text-[#8B8680]" />
            {redemption.venue_name}
          </div>
        )}
        <div className="flex gap-2 items-center">
          <Calendar size={16} className="text-[#8B8680]" />
          {formatDate(redemption.created_at)}
        </div>
        {redemption.qr_expires_at && (
          <div className="flex gap-2 items-center">
            <Clock size={16} className="text-[#8B8680]" />
            {t("Expires")}: {formatDate(redemption.qr_expires_at)}
          </div>
        )}
      </div>

      <div className="flex-1" />

      {redemption.redemption_code && (
        <div className="mt-3 bg-[#F8F6F1] border border-[#E8E3D5] rounded-xl p-3 text-center">
          <p className="text-[10px] text-[#8B8680] uppercase tracking-wider mb-1">
            {t("Redemption Code")}
          </p>
          <p className="text-[#1A1A1C] font-bold text-lg tracking-widest">
            {redemption.redemption_code}
          </p>
        </div>
      )}
    </Card>
  );
}
