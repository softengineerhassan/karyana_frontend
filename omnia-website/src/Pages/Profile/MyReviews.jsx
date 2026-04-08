import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Star, Calendar, MoreVertical, Edit2, Trash2, Loader2 } from "lucide-react";
import { getDateLocale } from '@/lib/localization';
import { fetchData } from '@/helpers/fetchData';

const LIMIT = 20;

function ReviewsLoadingSkeleton() {
  return (
    <div className="px-6 py-6 space-y-4">
      <style>{`
        @keyframes rev-sh { 0% { background-position: -600px 0; } 100% { background-position: 600px 0; } }
        .rev-sh { background: linear-gradient(90deg, #F0EBE0 25%, #E4DDD3 50%, #F0EBE0 75%); background-size: 1200px 100%; animation: rev-sh 1.5s infinite linear; }
      `}</style>
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-white border border-[#E8E3D5] rounded-2xl overflow-hidden">
          {/* Venue info row — p-4 border-b */}
          <div style={{ padding: 16, borderBottom: '1px solid #E8E3D5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="rev-sh" style={{ height: 16, width: '50%', borderRadius: 5 }} />
            {/* Menu button — w-9 h-9 rounded-xl */}
            <div className="rev-sh" style={{ width: 36, height: 36, borderRadius: 12, flexShrink: 0 }} />
          </div>
          {/* Review content — p-4 */}
          <div style={{ padding: 16 }}>
            {/* Stars row + date */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              {/* 5 star placeholders — w-4 h-4 each */}
              <div style={{ display: 'flex', gap: 4 }}>
                {[1,2,3,4,5].map(s => (
                  <div key={s} className="rev-sh" style={{ width: 16, height: 16, borderRadius: 4 }} />
                ))}
              </div>
              {/* Date — Calendar icon + text */}
              <div className="rev-sh" style={{ height: 12, width: 90, borderRadius: 4 }} />
            </div>
            {/* Review text — 2 lines */}
            <div className="rev-sh" style={{ height: 14, width: '100%', borderRadius: 4, marginBottom: 8 }} />
            <div className="rev-sh" style={{ height: 14, width: '75%', borderRadius: 4 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MyReviews() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const skipRef = useRef(0);
  const hasMoreRef = useRef(true);
  const observerRef = useRef(null);

  // Normalize API response items
  const normalizeReview = (item) => {
    const review = item.review || item;
    return {
      id: review.id || item.id,
      venue_id: review.venue_id || item.venue_id,
      rating: review.rating ?? item.rating,
      review_text: review.review_text || item.review_text || '',
      created_at: review.created_at || item.created_at,
      user_name: review.user_name || item.user_name,
      venue_name_en: item.venue_name_en || review.venue_name_en || '',
      venue_name_ar: item.venue_name_ar || review.venue_name_ar || '',
      venue_name_fr: item.venue_name_fr || review.venue_name_fr || '',
    };
  };

  const loadReviews = useCallback(async (skip = 0, append = false) => {
    if (!append) setLoading(true);
    else setLoadingMore(true);
    try {
      const result = await fetchData('GET', `/venue-reviews/me?skip=${skip}&limit=${LIMIT}`);
      // API returns { data: [...reviews], meta: { total } }
      // fetchData returns envelope, so result.data is the array directly
      const rawData = result?.data;
      const rawItems = Array.isArray(rawData) ? rawData : (rawData?.items || []);
      const items = rawItems.map(normalizeReview);
      const apiTotal = result?.meta?.total ?? rawData?.total ?? items.length;
      setTotal(apiTotal);
      setReviews(prev => append ? [...prev, ...items] : items);
      skipRef.current = skip + items.length;
      hasMoreRef.current = skipRef.current < apiTotal && items.length === LIMIT;
    } catch {
      // fetchData shows toast
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadReviews(0);
  }, [loadReviews]);

  // Infinite scroll observer
  const lastCardRef = useCallback((node) => {
    if (loadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMoreRef.current && !loadingMore) {
        loadReviews(skipRef.current, true);
      }
    });
    if (node) observerRef.current.observe(node);
  }, [loadingMore, loadReviews]);

  const getVenueName = (review) => {
    if (language === 'ar' && review.venue_name_ar) return review.venue_name_ar;
    if (language === 'fr' && review.venue_name_fr) return review.venue_name_fr;
    return review.venue_name_en || t("Unknown Venue");
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(getDateLocale(language), {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDelete = (reviewId) => {
    setReviews(reviews.filter(r => r.id !== reviewId));
    setTotal(prev => prev - 1);
    setActiveMenu(null);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-[#E8E3D5]'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-24">
      {/* Header */}
      <div className="bg-white border-b border-[#E8E3D5] p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
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
            {t("My Reviews")}
          </h1>
        </div>
        <p className="text-[#8B8680]">
          {total} {t("reviews written")}
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <ReviewsLoadingSkeleton />
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6">
          <div className="w-20 h-20 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mb-6">
            <Star className="w-10 h-10 text-[#D4AF37]" />
          </div>
          <h2
            className="text-xl text-[#1A1A1C] mb-2"
            style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600 }}
          >
            {t("No reviews yet")}
          </h2>
          <p className="text-[#8B8680] text-center max-w-sm">
            {t("Share your experiences by leaving reviews at venues you've visited")}
          </p>
        </div>
      ) : (
        <div className="px-6 py-6 space-y-4">
          {reviews.map((review, index) => {
            const isLast = index === reviews.length - 1;
            return (
              <div
                key={review.id}
                ref={isLast ? lastCardRef : null}
                className="bg-white border border-[#E8E3D5] rounded-2xl overflow-hidden hover:border-[#D4AF37]/40 hover:shadow-md transition-all"
              >
                {/* Venue Info */}
                <div className="p-4 border-b border-[#E8E3D5]">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-[#1A1A1C]">
                        {getVenueName(review)}
                      </h3>
                    </div>

                    {/* Menu Button */}
                    <div className="relative">
                      <button
                        onClick={() => setActiveMenu(activeMenu === review.id ? null : review.id)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#F5F2ED] transition-all cursor-pointer"
                      >
                        <MoreVertical className="w-5 h-5 text-[#8B8680]" />
                      </button>

                      {activeMenu === review.id && (
                        <div className="absolute right-0 top-10 bg-white border border-[#E8E3D5] rounded-xl shadow-lg overflow-hidden z-10 min-w-[140px]">
                          <button
                            onClick={() => setActiveMenu(null)}
                            className="w-full px-4 py-3 flex items-center gap-2 hover:bg-[#F5F2ED] transition-all text-[#1A1A1C] cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                            {t("Edit")}
                          </button>
                          <button
                            onClick={() => handleDelete(review.id)}
                            className="w-full px-4 py-3 flex items-center gap-2 hover:bg-red-50 transition-all text-red-500 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                            {t("Delete")}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Review Content */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-sm text-[#8B8680] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(review.created_at)}
                    </span>
                  </div>

                  {review.review_text && (
                    <p className="text-[#1A1A1C] leading-relaxed">
                      {review.review_text}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {/* Loading more indicator */}
          {loadingMore && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 text-[#D4AF37] animate-spin" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
