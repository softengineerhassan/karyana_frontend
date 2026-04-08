import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { fetchData } from '@/helpers/fetchData';
import {
  ArrowLeft,
  Send,
  Loader2,
  X,
  Headphones,
  CreditCard,
  Crown,
  Bug,
  HelpCircle,
  CalendarX
} from "lucide-react";

export default function HelpSupport() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [showContactForm, setShowContactForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const quickTopics = [
    { icon: CalendarX, label: t("Booking Issue"), subject: "Booking Issue", message: t("I'm experiencing an issue with one of my bookings. Could you please assist me?") },
    { icon: Headphones, label: t("Account Problem"), subject: "Account Problem", message: t("I'm having trouble with my account. Please help me resolve this issue.") },
    { icon: CreditCard, label: t("Payment Query"), subject: "Payment Query", message: t("I have a question regarding a payment or charge on my account.") },
    { icon: Crown, label: t("Membership Perks"), subject: "Membership Perks", message: t("I'd like to inquire about my membership status or missing perks.") },
    { icon: Bug, label: t("Report a Bug"), subject: "Report a Bug", message: t("I've encountered a technical issue while using the app. Here are the details:") },
    { icon: HelpCircle, label: t("General Inquiry"), subject: "General Inquiry", message: t("I have a general question and would appreciate your assistance.") },
  ];

  const handleTopicSelect = (topic) => {
    setSubject(topic.subject);
    setMessage(topic.message);
    setShowContactForm(true);
  };

  const handleSendSupport = async () => {
    if (!subject.trim() || !message.trim()) return;
    setIsSending(true);
    try {
      const result = await fetchData('POST', '/support', { subject: subject.trim(), message: message.trim() });
      if (result?.success) {
        toast.success(t("Your message has been sent successfully!"));
        setShowContactForm(false);
        setSubject('');
        setMessage('');
      }
    } catch (err) {
      // fetchData already shows toast error
    } finally {
      setIsSending(false);
    }
  };

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
            {t("Help & Support")}
          </h1>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6 max-w-2xl mx-auto">
        {/* Quick Support Topics */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Send className="w-5 h-5 text-[#D4AF37]" />
            <h2
              className="text-lg text-[#1A1A1C]"
              style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600 }}
            >
              {t("Quick Support")}
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {quickTopics.map((topic, i) => {
              const Icon = topic.icon;
              return (
                <button
                  key={i}
                  onClick={() => handleTopicSelect(topic)}
                  className="bg-white border border-[#E8E3D5] rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-[#D4AF37]/40 hover:shadow-md transition-all cursor-pointer text-center"
                >
                  <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <span className="text-sm font-medium text-[#1A1A1C]">{topic.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Contact Form */}
        {showContactForm && (
          <div className="bg-white border border-[#D4AF37]/40 rounded-2xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-lg text-[#1A1A1C]"
                style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600 }}
              >
                {t("Send a Message")}
              </h3>
              <button
                onClick={() => { setShowContactForm(false); setSubject(''); setMessage(''); }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8B8680] hover:text-[#1A1A1C] hover:bg-[#F5F2ED] transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-[#5C5850] mb-1.5 block">{t("Subject")}</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={t("Enter subject...")}
                  className="w-full p-3 rounded-xl border border-[#E8E3D5] bg-[#FDFBF7] focus:border-[#D4AF37] outline-none transition-all text-[#1A1A1C] placeholder-[#A5A09A]"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-[#5C5850] mb-1.5 block">{t("Message")}</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("Describe your issue...")}
                  rows={4}
                  className="w-full p-3 rounded-xl border border-[#E8E3D5] bg-[#FDFBF7] focus:border-[#D4AF37] outline-none transition-all resize-none text-[#1A1A1C] placeholder-[#A5A09A]"
                />
              </div>
              <button
                onClick={handleSendSupport}
                disabled={isSending || !subject.trim() || !message.trim()}
                className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#CD7F32] text-white rounded-xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-lg transition-all cursor-pointer"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t("Sending...")}
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    {t("Send Message")}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
