import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Mail } from "lucide-react";

export default function PrivacySecurity() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-24">
      {/* Header */}
      <div className="bg-white border-b border-[#E8E3D5] p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-11 h-11 border border-[#E8E3D5] rounded-2xl flex items-center justify-center text-[#8B8680] hover:text-[#1A1A1C] hover:border-[#D4AF37]/40 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1
            className="text-2xl text-[#1A1A1C]"
            style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600 }}
          >
            {t("Privacy & Security")}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 max-w-2xl mx-auto">
        {/* Title & Last Updated */}
        <div className="text-center mb-6">
          <h2
            className="text-2xl text-[#1A1A1C] mb-2"
            style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 700 }}
          >
            {t("Privacy Policy for OMNIA")}
          </h2>
          <p className="text-[#8B8680] text-sm">
            {t("Last Updated: March 15, 2026")}
          </p>
        </div>

        {/* Intro */}
        <p className="text-[#5C5850] text-sm leading-relaxed mb-6">
          {t("At OMNIA, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share information when you use our mobile application and backend services.")}
        </p>

        <Divider />

        {/* Section 1 */}
        <SectionTitle number="1" title={t("Information We Collect")} />

        <SubSectionTitle title={t("A. Personal Information")} />
        <BulletList items={[
          <><strong className="text-[#1A1A1C]">{t("Account Data")}:</strong> {t("When you register, we collect your full name, email address, password (hashed), and phone number.")}</>,
          <><strong className="text-[#1A1A1C]">{t("Verification Data")}:</strong> {t("We store temporary OTP codes sent to your email for account verification and password resets.")}</>,
          <><strong className="text-[#1A1A1C]">{t("Profile Data")}:</strong> {t("Optional information such as profile pictures and location preferences.")}</>,
        ]} />

        <SubSectionTitle title={t("B. Usage and Technical Data")} />
        <BulletList items={[
          <><strong className="text-[#1A1A1C]">{t("Device Information")}:</strong> {t("We collect device IDs, IP addresses, and user-agent strings to secure your sessions and prevent fraud.")}</>,
          <><strong className="text-[#1A1A1C]">{t("Push Notifications")}:</strong> {t("We collect Firebase Cloud Messaging (FCM) tokens to deliver service updates and announcements.")}</>,
          <><strong className="text-[#1A1A1C]">{t("Booking History")}:</strong> {t("We store details of your venue bookings, including status, selected perks, and timestamps.")}</>,
        ]} />

        <SubSectionTitle title={t("C. Location Data")} />
        <BulletList items={[
          t("We collect venue locations (latitude and longitude)."),
          t("If you grant permission, the mobile app may use your device's GPS to show 'Nearby Venues.'"),
        ]} />

        <Divider />

        {/* Section 2 */}
        <SectionTitle number="2" title={t("How We Use Your Information")} />
        <p className="text-[#5C5850] text-sm leading-relaxed mb-3">
          {t("We use the collected data to:")}
        </p>
        <BulletList items={[
          <><strong className="text-[#1A1A1C]">{t("Provide Services")}:</strong> {t("Processing bookings, managing venue listings, and facilitating OMNIA Boosts.")}</>,
          <><strong className="text-[#1A1A1C]">{t("Authentication")}:</strong> {t("Verifying your identity and securing your account.")}</>,
          <><strong className="text-[#1A1A1C]">{t("Communication")}:</strong> {t("Sending transactional emails (booking confirmations) and push notifications (announcements).")}</>,
          <><strong className="text-[#1A1A1C]">{t("Improvement")}:</strong> {t("Analyzing platform usage to enhance user experience and dashboard metrics.")}</>,
        ]} />

        <Divider />

        {/* Section 3 */}
        <SectionTitle number="3" title={t("Data Sharing and Disclosure")} />
        <p className="text-[#5C5850] text-sm leading-relaxed mb-3">
          {t("We do not sell your personal data. We share information only in the following cases:")}
        </p>
        <BulletList items={[
          <><strong className="text-[#1A1A1C]">{t("With Vendors")}:</strong> {t("When you book a venue, your name and contact details are shared with the venue vendor to fulfill the booking.")}</>,
          <><strong className="text-[#1A1A1C]">{t("Service Providers")}:</strong> {t("We use third-party tools such as AWS (for storage), Firebase (for notifications), and SMTP providers (for emails).")}</>,
          <><strong className="text-[#1A1A1C]">{t("Legal Requirements")}:</strong> {t("If required by law or to protect our rights.")}</>,
        ]} />

        <Divider />

        {/* Section 4 */}
        <SectionTitle number="4" title={t("Data Security")} />
        <BulletList items={[
          <><strong className="text-[#1A1A1C]">{t("Encryption")}:</strong> {t("Passwords are saved using industry-standard hashing (e.g., PBKDF2 or Bcrypt).")}</>,
          <><strong className="text-[#1A1A1C]">{t("Session Security")}:</strong> {t("We use RS256 JWT tokens for secure authentication.")}</>,
          <><strong className="text-[#1A1A1C]">{t("Token Management")}:</strong> {t("You can view and revoke active sessions from your profile.")}</>,
        ]} />

        <Divider />

        {/* Section 5 */}
        <SectionTitle number="5" title={t("Your Rights")} />
        <p className="text-[#5C5850] text-sm leading-relaxed mb-3">
          {t("You have the right to:")}
        </p>
        <BulletList items={[
          <><strong className="text-[#1A1A1C]">{t("Access and Update")}:</strong> {t("View and edit your profile information.")}</>,
          <><strong className="text-[#1A1A1C]">{t("Account Deletion")}:</strong> {t("Request the permanent deletion of your account and associated data.")}</>,
          <><strong className="text-[#1A1A1C]">{t("Opt-Out")}:</strong> {t("Disable push notifications through your device settings.")}</>,
        ]} />

        <Divider />

        {/* Section 6 */}
        <SectionTitle number="6" title={t("Contact Us")} />
        <p className="text-[#5C5850] text-sm leading-relaxed mb-4">
          {t("If you have any questions about this Privacy Policy, please contact our support team at:")}
        </p>

        {/* Email contact */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center">
            <Mail className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <a
            href="mailto:dev@omnia-app.me"
            className="text-[#D4AF37] font-semibold text-sm hover:underline"
          >
            dev@omnia-app.me
          </a>
        </div>

        {/* Footer note */}
        <p className="text-[#8B8680] text-xs leading-relaxed italic">
          {t("Note: This policy may be updated periodically. Your continued use of OMNIA after changes signifies acceptance of the revised terms.")}
        </p>
      </div>
    </div>
  );
}

/* ── Section Title ── */
function SectionTitle({ number, title }) {
  return (
    <h3
      className="text-[#D4AF37] text-lg mb-4 mt-6"
      style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 700 }}
    >
      {number}. {title}
    </h3>
  );
}

/* ── Sub Section Title ── */
function SubSectionTitle({ title }) {
  return (
    <h4 className="text-[#1A1A1C] text-sm font-bold mb-2 mt-4">
      {title}
    </h4>
  );
}

/* ── Bullet List ── */
function BulletList({ items }) {
  return (
    <div className="space-y-3 mb-4">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="w-[6px] h-[6px] rounded-full bg-[#D4AF37] mt-[7px] flex-shrink-0" />
          <p className="text-[#5C5850] text-sm leading-relaxed flex-1">
            {item}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ── Divider ── */
function Divider() {
  return <div className="h-px bg-[#D4AF37]/15 my-4" />;
}
