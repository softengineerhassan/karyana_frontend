import { useTranslation } from "react-i18next";

export default function BookingHeader() {
  const { t } = useTranslation();

  return (
    <div className="bg-white border-b border-[#E8E3D5] p-6 sticky top-0 z-10">
      <h2
        className="text-2xl text-[#1A1A1C]"
        style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600 }}
      >
        {t("My Bookings", "حجوزاتي")}
      </h2>
    </div>
  );
}
