import { Card } from "@/Shared/Card";
import { Crown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

export default function MembershipCard() {
  const { t } = useTranslation();
  const user = useSelector((state) => state.auth?.user);

  const isGold = user?.is_gold || false;
  const bookingsCount = user?.bookings_count || 0;
  const remainingToGold = user?.remaining_to_gold || 0;
  const createdAt = user?.created_at;

  // Format "Member since" from createdAt
  const getMemberSince = () => {
    if (!createdAt) return t("Member");
    try {
      const date = new Date(createdAt);
      return `${t("Member since")} ${date.toLocaleDateString(undefined, { month: "short", year: "numeric" })}`;
    } catch {
      return t("Member");
    }
  };

  // Progress calculation matching customer app logic
  const getProgress = () => {
    if (isGold) return 1;
    const totalNeeded = bookingsCount + remainingToGold;
    if (totalNeeded <= 0) return 0;
    return Math.min(Math.max(bookingsCount / totalNeeded, 0), 1);
  };

  const progress = getProgress();

  return (
    <Card padding="lg" className="bg-gradient-to-br from-[#1A1A1C] to-[#2C2C2E] border-0 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {isGold ? (
              <span className="text-xl">👑</span>
            ) : (
              <Crown className="w-5 h-5 text-white/70" />
            )}
            <h3
              className={`text-lg font-serif font-semibold ${
                isGold ? "text-[#D4AF37]" : "text-white"
              }`}
            >
              {t("Gold Member")}
            </h3>
          </div>
          <p className="text-white/60 text-sm">{getMemberSince()}</p>
        </div>

        <div className="text-right">
          <div
            className={`text-2xl font-bold font-serif ${
              isGold ? "text-[#D4AF37]" : "text-white/70"
            }`}
          >
            {bookingsCount}
          </div>
          <div className="text-white/60 text-xs uppercase">
            {t("Bookings")}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-white/15 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#D4AF37] to-[#CD7F32] rounded-full transition-all duration-500"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Status Text */}
      <p className="text-white/60 text-xs mt-2">
        {isGold
          ? t("150 points to Platinum")
          : remainingToGold > 0
            ? t("Complete {{count}} more bookings to unlock Gold!", {
                count: remainingToGold,
              })
            : t("Keep booking to earn rewards!")}
      </p>
    </Card>
  );
}
