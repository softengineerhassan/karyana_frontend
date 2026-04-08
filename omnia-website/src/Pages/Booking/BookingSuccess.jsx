import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle, Calendar, Clock, Users, MapPin, Download, Share2,
  Sparkles, Loader, AlertCircle, Home, CalendarCheck, Eye, ChevronRight, X
} from 'lucide-react';
import { getDateLocale } from '@/lib/localization';
import { fetchData } from '@/helpers/fetchData';
import toast from 'react-hot-toast';
import QRModal from '@/Pages/MyBooking/components/QRModal';

export default function BookingSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  const bookingData = location.state?.bookingData;
  const [booking, setBooking] = useState(bookingData);
  const [isLoadingFromApi, setIsLoadingFromApi] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showDownloadSheet, setShowDownloadSheet] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const pdfBlobRef = useRef(null);

  // If only bookingId passed (e.g. from notification), fetch from API
  useEffect(() => {
    if (bookingData?.bookingId && !bookingData?.venueName) {
      setIsLoadingFromApi(true);
      fetchData('GET', `/bookings/${bookingData.bookingId}`)
        .then((res) => {
          const d = res?.data;
          if (d) {
            setBooking({
              ...bookingData,
              venueName: d.venue_name_en || d.venue_name_ar,
              date: d.booking_date,
              time: d.start_time,
              partySize: d.party_size,
              status: d.status,
              qrToken: d.qr_token,
              bookingCode: d.booking_code,
              perksApplied: d.perks_applied || [],
              location: d.venue_location,
              guestName: d.guest_name,
              guestEmail: d.guest_email,
              specialInstructions: d.special_instructions,
            });
          }
        })
        .catch(() => {})
        .finally(() => setIsLoadingFromApi(false));
    }
  }, []);

  const status = (booking?.status || 'pending').toLowerCase();
  const isConfirmed = status === 'confirmed';
  const isPending = status === 'pending';

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString(getDateLocale(language), {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    } catch { return dateStr; }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      const h = parseInt(parts[0], 10);
      const m = parts[1];
      return `${h % 12 || 12}:${m} ${h >= 12 ? 'PM' : 'AM'}`;
    }
    return timeStr;
  };

  // Timeline status logic matching customer app exactly
  const s1 = true;
  const s2 = true;
  const s3 = status !== 'pending';
  const s4 = status === 'confirmed';

  const statusSteps = [
    { key: 'requested', label: t('Request Placed'), time: t('Done'), completed: s1, icon: 'check' },
    { key: 'pending', label: t('Pending Approval'), time: s3 ? t('Done') : t('In Progress'), completed: s2, icon: 'loader' },
    { key: 'approved', label: t('Approved by Venue'), time: s3 ? t('Done') : t('Waiting'), completed: s3, icon: 'check' },
    { key: 'confirmed', label: t('Confirmed'), time: s4 ? t('Ready') : t('Waiting'), completed: s4, icon: 'sparkles', isLast: true },
  ];

  const bookingCode = booking?.bookingCode || (booking?.bookingId || '').slice(0, 12);
  const venueName = booking?.venueName || t('Unknown Venue');
  const partySize = booking?.partySize || 0;

  // ── PDF Generation ──
  const generatePdfBlob = useCallback(async () => {
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF('p', 'mm', 'a4');
    const W = doc.internal.pageSize.getWidth();   // 210
    const H = doc.internal.pageSize.getHeight();  // 297
    const MX = 16;          // side margins
    const CW = W - MX * 2; // content width = 178
    let Y = 0;

    // ── Brand Colors ──
    const GOLD      = [212, 175, 55];
    const WHITE     = [255, 255, 255];
    const TXT1      = [26, 26, 28];
    const TXT2      = [92, 88, 80];
    const MUTED     = [139, 134, 128];
    const GREEN     = [74, 124, 44];
    const GREY      = [210, 210, 210];
    const CREAM     = [239, 235, 222];
    const GOLD_LT   = [255, 249, 230];
    const GREEN_BG  = [239, 246, 236];
    const PEND_BG   = [255, 249, 230];
    const CANCEL_BG = [255, 235, 238];
    const CANCEL_TX = [198, 40, 40];

    const fDate = (booking?.date || '').split('T')[0];
    const fTime = formatTime(booking?.time);
    const guest = booking?.guestName || '';
    const email = booking?.guestEmail || '';
    const instructions = booking?.specialInstructions || '';
    const perks = (booking?.perksApplied || []).map(p => p.title_en || p.display_value || '').filter(Boolean);

    // ════════════════════════════════════════════════
    //  HEADER — Full-width gold bar (46mm tall)
    // ════════════════════════════════════════════════
    const HH = 46;
    doc.setFillColor(...GOLD);
    doc.rect(0, 0, W, HH, 'F');
    // Rounded bottom edge
    doc.setFillColor(...WHITE);
    doc.ellipse(W / 2, HH, W / 1.6, 8, 'F');
    // Re-fill the gold above ellipse
    doc.setFillColor(...GOLD);
    doc.rect(0, 0, W, HH - 3, 'F');

    // Logo box
    const LX = MX + 4;
    doc.setFillColor(...WHITE);
    doc.roundedRect(LX, 12, 18, 18, 4, 4, 'F');
    doc.setTextColor(...GOLD);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('O', LX + 9, 24, { align: 'center' });

    // OMNIA + BOOKING badge
    const TX = LX + 24;
    doc.setTextColor(...WHITE);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('OMNIA', TX, 22);

    doc.setDrawColor(...WHITE);
    doc.setLineWidth(0.4);
    const bx = TX + doc.getTextWidth('OMNIA') + 5;
    doc.roundedRect(bx, 16, 22, 7, 2.5, 2.5, 'S');
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text('BOOKING', bx + 11, 21, { align: 'center' });

    // Subtitle
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 255, 220);
    doc.text(
      isConfirmed ? 'Booking Confirmed!' : 'Booking Request Placed!',
      TX, 30
    );

    Y = HH + 10;

    // ════════════════════════════════════════════════
    //  STATUS TRACKER CARD
    // ════════════════════════════════════════════════
    const stepH = 14; // height per step
    const statusCardH = 18 + stepH * 4 + 4;
    doc.setFillColor(...WHITE);
    doc.setDrawColor(...GREY);
    doc.setLineWidth(0.4);
    doc.roundedRect(MX, Y, CW, statusCardH, 6, 6, 'FD');

    doc.setTextColor(...TXT1);
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text('Booking Status', MX + 12, Y + 14);

    const steps = [
      { label: 'Request Placed',    st: 'Done',        done: s1 },
      { label: 'Pending Approval',  st: s3 ? 'Done' : 'In Progress', done: s2 },
      { label: 'Approved by Venue', st: s3 ? 'Done' : 'Waiting',     done: s3 },
      { label: 'Confirmed',         st: s4 ? 'Ready' : 'Waiting',    done: s4 },
    ];

    let SY = Y + 24;
    const CX = MX + 18; // circle center x
    const R = 4.5;      // circle radius

    steps.forEach((step, i) => {
      // Circle
      doc.setFillColor(...(step.done ? GREEN : GREY));
      doc.circle(CX, SY + R, R, 'F');
      if (step.done) {
        doc.setTextColor(...WHITE);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('✓', CX, SY + R + 1.2, { align: 'center' });
      } else {
        doc.setFillColor(...WHITE);
        doc.circle(CX, SY + R, 1.5, 'F');
      }
      // Connecting line
      if (i < 3) {
        doc.setDrawColor(...(step.done ? GREEN : GREY));
        doc.setLineWidth(0.8);
        doc.line(CX, SY + R * 2, CX, SY + stepH);
      }
      // Label
      doc.setTextColor(...TXT1);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(step.label, CX + 10, SY + R + 1.5);
      // Status right-aligned
      doc.setTextColor(...(step.done ? GREEN : TXT2));
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(step.st, MX + CW - 12, SY + R + 1.5, { align: 'right' });
      SY += stepH;
    });

    Y += statusCardH + 8;

    // ════════════════════════════════════════════════
    //  BOOKING DETAILS CARD
    // ════════════════════════════════════════════════
    const rows = [
      ['Venue',  venueName],
      ['Date',   fDate],
      ['Time',   fTime],
      ['Guests', `${partySize} Guests`],
    ];
    const ROW_H = 10;
    const qrSectionH = isConfirmed ? 48 : 0;
    const guestSectionH = guest ? 22 : 0;
    const detailCardH = 8 + qrSectionH + rows.length * ROW_H + 12 + guestSectionH;

    doc.setFillColor(...WHITE);
    doc.setDrawColor(...GREY);
    doc.setLineWidth(0.4);
    doc.roundedRect(MX, Y, CW, detailCardH, 6, 6, 'FD');

    let DY = Y + 8;

    // QR Section (confirmed only)
    if (isConfirmed) {
      const qrPad = 10;
      const qrBoxW = CW - qrPad * 2;
      doc.setFillColor(...CREAM);
      doc.roundedRect(MX + qrPad, DY, qrBoxW, 40, 5, 5, 'F');

      // QR white box
      const qrSize = 30;
      doc.setFillColor(...WHITE);
      doc.roundedRect(MX + qrPad + 6, DY + 5, qrSize, qrSize, 4, 4, 'F');

      // Try loading QR image
      try {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&format=png&data=${encodeURIComponent(bookingCode)}`;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = qrUrl;
          setTimeout(reject, 4000);
        });
        doc.addImage(img, 'PNG', MX + qrPad + 9, DY + 8, qrSize - 6, qrSize - 6);
      } catch {
        doc.setTextColor(...GOLD);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('QR CODE', MX + qrPad + 6 + qrSize / 2, DY + 22, { align: 'center' });
      }

      // Code + subtitle next to QR
      const codeX = MX + qrPad + qrSize + 14;
      doc.setTextColor(...TXT2);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(bookingCode.toUpperCase(), codeX, DY + 18);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...MUTED);
      doc.text('Show ID at venue', codeX, DY + 26);

      DY += 44;
      // Gold divider
      doc.setDrawColor(...GOLD);
      doc.setLineWidth(0.2);
      doc.line(MX + qrPad, DY, MX + CW - qrPad, DY);
      DY += 6;
    }

    // Detail rows
    const LBL_W = 28;
    rows.forEach(([label, value]) => {
      doc.setTextColor(...TXT2);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(label, MX + 12, DY + 4);
      doc.setTextColor(...TXT1);
      doc.setFont('helvetica', 'bold');
      doc.text(value || '', MX + 12 + LBL_W, DY + 4);
      DY += ROW_H;
    });

    // Status badge
    doc.setTextColor(...TXT2);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Status', MX + 12, DY + 4);

    const SU = status.toUpperCase();
    const badge = SU === 'CONFIRMED' ? { bg: GREEN_BG, tx: GREEN }
      : SU === 'PENDING' ? { bg: PEND_BG, tx: GOLD }
      : SU === 'CANCELLED' ? { bg: CANCEL_BG, tx: CANCEL_TX }
      : { bg: [245,245,245], tx: TXT2 };

    const badgeW = doc.getTextWidth(SU) + 10;
    doc.setFillColor(...badge.bg);
    doc.roundedRect(MX + 12 + LBL_W, DY - 1, badgeW, 7, 3, 3, 'F');
    doc.setTextColor(...badge.tx);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(SU, MX + 12 + LBL_W + badgeW / 2, DY + 4, { align: 'center' });
    DY += ROW_H;

    // Guest info
    if (guest) {
      doc.setDrawColor(...GREY);
      doc.setLineWidth(0.3);
      doc.line(MX + 12, DY, MX + CW - 12, DY);
      DY += 6;
      doc.setTextColor(...TXT2);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('Guest', MX + 12, DY + 4);
      doc.setTextColor(...TXT1);
      doc.setFont('helvetica', 'bold');
      doc.text(guest, MX + 12 + LBL_W, DY + 4);
      if (email) {
        DY += 8;
        doc.setTextColor(...TXT2);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(email, MX + 12 + LBL_W, DY + 4);
      }
    }

    Y += detailCardH + 8;

    // ════════════════════════════════════════════════
    //  PERKS SECTION
    // ════════════════════════════════════════════════
    if (perks.length > 0) {
      const perkRowH = 9;
      const perkCardH = 16 + perks.length * perkRowH;
      doc.setFillColor(...GOLD_LT);
      doc.setDrawColor(...GOLD);
      doc.setLineWidth(0.4);
      doc.roundedRect(MX, Y, CW, perkCardH, 6, 6, 'FD');

      doc.setTextColor(...GOLD);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('YOUR PERKS', MX + 12, Y + 12);

      let PY = Y + 20;
      perks.forEach(perk => {
        doc.setFillColor(...GOLD);
        doc.circle(MX + 14, PY - 1.5, 1.5, 'F');
        doc.setTextColor(...TXT1);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(perk, MX + 20, PY);
        PY += perkRowH;
      });

      Y += perkCardH + 8;
    }

    // ════════════════════════════════════════════════
    //  SPECIAL INSTRUCTIONS
    // ════════════════════════════════════════════════
    if (instructions) {
      const instrH = 24;
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(MX, Y, CW, instrH, 6, 6, 'F');
      doc.setTextColor(...MUTED);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('SPECIAL INSTRUCTIONS', MX + 12, Y + 9);
      doc.setTextColor(...TXT1);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(instructions, MX + 12, Y + 18, { maxWidth: CW - 24 });
      Y += instrH + 8;
    }

    // ════════════════════════════════════════════════
    //  FOOTER
    // ════════════════════════════════════════════════
    const FY = H - 22;
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.6);
    doc.line(MX, FY, MX + CW, FY);

    doc.setFontSize(11);
    doc.setTextColor(...TXT2);
    doc.setFont('helvetica', 'normal');
    doc.text('Powered by OMNIA', W / 2, FY + 9, { align: 'center' });
    doc.setFontSize(9);
    doc.setTextColor(158, 158, 158);
    doc.text('Your gateway to exclusive experiences', W / 2, FY + 16, { align: 'center' });

    return doc.output('blob');
  }, [booking, isConfirmed, s1, s2, s3, s4, bookingCode, venueName, partySize, status, formatTime]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await generatePdfBlob();
      pdfBlobRef.current = blob;
      setShowDownloadSheet(true);
    } catch (e) {
      toast.error(t('Failed to generate PDF'));
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const blob = await generatePdfBlob();
      const file = new File([blob], `OMNIA-Booking-${bookingCode}.pdf`, { type: 'application/pdf' });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: `OMNIA Booking - ${venueName}`,
          text: `Booking at ${venueName} on ${formatDate(booking?.date)}`,
          files: [file],
        });
      } else {
        // Fallback: download directly
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `OMNIA-Booking-${bookingCode}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(t('PDF downloaded'));
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        toast.error(t('Failed to share booking'));
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleViewPdf = () => {
    if (!pdfBlobRef.current) return;
    const url = URL.createObjectURL(pdfBlobRef.current);
    window.open(url, '_blank');
  };

  const handleSavePdf = () => {
    if (!pdfBlobRef.current) return;
    const url = URL.createObjectURL(pdfBlobRef.current);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OMNIA-Booking-${bookingCode}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    setShowDownloadSheet(false);
    toast.success(t('PDF saved successfully'));
  };

  // ── LOADING SHIMMER ──
  if (isLoadingFromApi) {
    return (
      <div className="min-h-screen bg-[#F8F6F1] flex items-center justify-center">
        <div className="w-full max-w-[430px] min-h-screen sm:min-h-0 sm:h-[85vh] bg-white sm:rounded-[40px] sm:shadow-2xl overflow-hidden flex flex-col">
          <div className="pt-16 pb-6 px-6 text-center">
            <div className="w-20 h-20 bg-[#EAE5DC] rounded-full mx-auto mb-6 animate-pulse" />
            <div className="w-48 h-5 bg-[#EAE5DC] rounded mx-auto mb-2 animate-pulse" />
            <div className="w-64 h-4 bg-[#EAE5DC] rounded mx-auto animate-pulse" />
          </div>
          <div className="px-4 space-y-3 flex-1">
            <div className="bg-white rounded-[20px] shadow-md p-4 space-y-5">
              <div className="w-32 h-5 bg-[#EAE5DC] rounded animate-pulse" />
              {[1,2,3,4].map(i => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-[35px] h-[35px] bg-[#EAE5DC] rounded-full animate-pulse" />
                  <div className="flex-1 flex justify-between pt-2">
                    <div className="w-28 h-3 bg-[#EAE5DC] rounded animate-pulse" />
                    <div className="w-14 h-3 bg-[#EAE5DC] rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── NO DATA ──
  if (!booking) {
    return (
      <div className="min-h-screen bg-[#F8F6F1] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-[#F8F6F1] border border-[#E8E3D5] flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-[#8B8680]" />
          </div>
          <p className="text-[#5C5850] mb-6">{t('No booking data found')}</p>
          <button onClick={() => navigate('/home')} className="px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#CD7F32] text-white rounded-xl font-bold cursor-pointer">
            {t('Go Home')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F1] flex items-center justify-center sm:py-8">
      {/* ═══ MOBILE PHONE FRAME ═══ */}
      <div className="w-full max-w-[430px] min-h-screen sm:min-h-0 sm:h-[90vh] bg-white sm:rounded-[40px] sm:shadow-2xl sm:border sm:border-[#E8E3D5] overflow-hidden flex flex-col relative">

        {/* ═══ FIXED HEADER ═══ */}
        <div className="bg-white pt-14 pb-5 px-6 text-center flex-shrink-0">
          {/* Status Icon */}
          <div
            className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center border ${
              isPending
                ? 'bg-[#D4AF37]/10 border-[#D4AF37]/20'
                : 'bg-[#4A7C2C]/10 border-[#4A7C2C]/20'
            }`}
          >
            {isPending ? (
              <Sparkles className="w-8 h-8 text-[#D4AF37]" />
            ) : (
              <CheckCircle className="w-8 h-8 text-[#4A7C2C]" />
            )}
          </div>

          <h2
            className="text-[#1A1A1C] text-xl mb-1.5"
            style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 700 }}
          >
            {isPending
              ? t('Your booking is pending approval')
              : t('Your booking is confirmed!')}
          </h2>

          <p className="text-[#5C5850] text-sm">
            {isPending
              ? t('Awaiting venue approval...')
              : t('Your reservation is confirmed and ready')}
          </p>
        </div>

        {/* ═══ SCROLLABLE CONTENT ═══ */}
        <div className="flex-1 overflow-y-auto px-4 pb-6">

          {/* STATUS TIMELINE CARD */}
          <div className="bg-white rounded-[20px] shadow-[0_5px_15px_rgba(0,0,0,0.05)] p-4 mb-2">
            <h4
              className="text-[#1A1A1C] mb-5"
              style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 700, fontSize: 16 }}
            >
              {t('Booking Status')}
            </h4>

            {statusSteps.map((step) => (
              <div key={step.key} className="flex items-start">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-[35px] h-[35px] rounded-full flex items-center justify-center flex-shrink-0 ${
                      step.completed ? 'bg-[#4A7C2C]' : 'bg-black/[0.08]'
                    }`}
                  >
                    {step.icon === 'check' && <CheckCircle className="w-[14px] h-[14px] text-white" />}
                    {step.icon === 'loader' && <Loader className="w-[14px] h-[14px] text-white" />}
                    {step.icon === 'sparkles' && <Sparkles className="w-[14px] h-[14px] text-white" />}
                  </div>
                  {!step.isLast && (
                    <div className={`w-[2px] h-[30px] ${step.completed ? 'bg-[#4A7C2C]' : 'bg-black/[0.08]'}`} />
                  )}
                </div>
                <div className="flex-1 flex items-center justify-between ml-3 min-h-[35px]">
                  <span className="text-[13px] text-[#1A1A1C]" style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 700 }}>
                    {step.label}
                  </span>
                  <span className="text-[#8B8680] text-xs">{step.time}</span>
                </div>
              </div>
            ))}
          </div>

          {/* DETAILS CARD */}
          <div className="bg-white rounded-[20px] shadow-[0_5px_15px_rgba(0,0,0,0.05)] p-3 mb-5">
            {/* QR Section — Only for CONFIRMED */}
            {isConfirmed && (
              <div className="flex flex-col items-center mb-4" onClick={() => setQrModalOpen(true)} style={{ cursor: 'pointer' }}>
                <div className="w-[200px] rounded-[28px] py-5 px-4 flex flex-col items-center" style={{ backgroundColor: '#EFEBDE' }}>
                  <div className="w-[110px] h-[110px] bg-white rounded-3xl shadow-[0_5px_15px_rgba(0,0,0,0.04)] flex flex-col items-center justify-center">
                    <Sparkles className="w-[38px] h-[38px] text-[#D4AF37]" />
                    <div className="h-4" />
                    <span className="text-[#8B8680] text-[10px] uppercase tracking-wider" style={{ fontWeight: 700 }}>
                      {t('QR Code')}
                    </span>
                  </div>
                  <div className="h-5" />
                  <span className="text-[#5C5850] text-sm font-bold tracking-wider">
                    {bookingCode.toUpperCase()}
                  </span>
                </div>
                <div className="h-4" />
                <p className="text-[#8B8680] text-sm">{t('Tap to show pass')}</p>
                <div className="h-4" />
                <div className="h-px w-full bg-[#D4AF37]/20" />
              </div>
            )}

            {/* Detail Items */}
            <div className="space-y-2">
              <DetailItem icon={MapPin} text={venueName} />
              <DetailItem icon={Calendar} text={formatDate(booking.date) || (booking.date || '').split('T')[0]} />
              <DetailItem icon={Clock} text={formatTime(booking.time)} />
              <DetailItem icon={Users} text={`${partySize} ${t('guests')}`} />
            </div>
          </div>

          {/* Download & Share — only enabled after confirmation */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <OutlineButton
              icon={Download}
              label={t('Download')}
              isLoading={isDownloading}
              onClick={handleDownload}
              disabled={!isConfirmed}
            />
            <OutlineButton
              icon={Share2}
              label={t('Share')}
              isLoading={isSharing}
              onClick={handleShare}
              disabled={!isConfirmed}
            />
          </div>

          {/* View My Bookings */}
          <button
            onClick={() => navigate('/bookings')}
            className="w-full h-[50px] bg-gradient-to-r from-[#D4AF37] to-[#CD7F32] text-white rounded-xl font-semibold flex items-center justify-center gap-2 mb-3 cursor-pointer hover:shadow-lg transition-all"
          >
            <CalendarCheck className="w-5 h-5" />
            {t('View My Bookings')}
          </button>

          {/* Back to Home */}
          <button
            onClick={() => navigate('/home')}
            className="w-full h-[50px] rounded-xl font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all"
            style={{ backgroundColor: '#F5EBD3', color: '#D4AF37' }}
          >
            <Home className="w-5 h-5" />
            {t('Back to Home')}
          </button>
        </div>
      </div>

      {/* ═══ DOWNLOAD OPTIONS BOTTOM SHEET ═══ */}
      {showDownloadSheet && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={() => setShowDownloadSheet(false)}>
          <div className="bg-white w-full sm:max-w-[430px] rounded-t-3xl sm:rounded-3xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 bg-[#E8E3D5] rounded-full" />
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-[#1A1A1C] text-lg" style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 700 }}>
                  {t('Download Options')}
                </h3>
                <button onClick={() => setShowDownloadSheet(false)} className="w-8 h-8 rounded-full bg-[#F8F6F1] flex items-center justify-center cursor-pointer">
                  <X className="w-4 h-4 text-[#8B8680]" />
                </button>
              </div>
              <p className="text-[#8B8680] text-sm mb-5">{t('Choose an option')}</p>

              {/* View Option */}
              <button onClick={handleViewPdf} className="w-full flex items-center gap-4 p-4 bg-[#F8F6F1] rounded-2xl mb-3 cursor-pointer hover:bg-[#F0EDE5] transition-all">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Eye className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[#1A1A1C] font-semibold text-sm">{t('View')}</p>
                  <p className="text-[#8B8680] text-xs">{t('Preview booking PDF')}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#8B8680]" />
              </button>

              {/* Download Option */}
              <button onClick={handleSavePdf} className="w-full flex items-center gap-4 p-4 bg-[#F8F6F1] rounded-2xl cursor-pointer hover:bg-[#F0EDE5] transition-all">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Download className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[#1A1A1C] font-semibold text-sm">{t('Download')}</p>
                  <p className="text-[#8B8680] text-xs">{t('Save PDF to device')}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#8B8680]" />
              </button>
            </div>
          </div>
        </div>
      )}

      <QRModal
        isOpen={qrModalOpen}
        booking={booking}
        onClose={() => setQrModalOpen(false)}
      />
    </div>
  );
}

/* ── Detail Item ── */
function DetailItem({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-[#F8F6F1] rounded-2xl border border-[#D4AF37]/20">
      <Icon className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
      <span className="text-[#1A1A1C] font-bold text-sm">{text}</span>
    </div>
  );
}

/* ── Outline Button with three-dot loader ── */
function OutlineButton({ icon: Icon, label, onClick, isLoading = false, disabled = false }) {
  return (
    <button
      onClick={isLoading || disabled ? undefined : onClick}
      disabled={disabled}
      className={`h-[45px] rounded-xl border shadow-[0_2px_4px_rgba(0,0,0,0.05)] flex items-center justify-center gap-2 transition-all ${
        disabled
          ? 'bg-[#F5F3ED] border-[#E8E3D5] opacity-50 cursor-not-allowed'
          : 'bg-white border-[#8B8680]/30 cursor-pointer hover:border-[#D4AF37]/40'
      }`}
    >
      {isLoading ? (
        <ThreeDotLoader />
      ) : (
        <>
          <Icon className={`w-5 h-5 ${disabled ? 'text-[#8B8680]' : 'text-[#1A1A1C]'}`} />
          <span className={`text-sm ${disabled ? 'text-[#8B8680]' : 'text-[#1A1A1C]'}`}>{label}</span>
        </>
      )}
    </button>
  );
}

/* ── Three Dot Loader (matches _ThreeDotLoader in customer app) ── */
function ThreeDotLoader() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full bg-[#D4AF37]"
          style={{
            animation: `dotPulse 0.8s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes dotPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
