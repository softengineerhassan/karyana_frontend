import React, { useState, useEffect } from 'react';
import { Star, ChevronDown, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fetchData } from '@/helpers/fetchData';

function StarRating({ rating, size = 'sm' }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  const px = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f${i}`} className={`${px} fill-[#D4AF37] text-[#D4AF37]`} />
      ))}
      {half && <Star key="h" className={`${px} fill-[#D4AF37]/40 text-[#D4AF37]`} />}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e${i}`} className={`${px} text-[#D4AF37]/30`} />
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  const initial = (review.user_name || review.userName || '?')[0].toUpperCase();
  const name = review.user_name || review.userName || 'Guest';
  const text = review.review_text || review.reviewText || '';
  const rating = review.rating || 0;
  const date = review.created_at || review.createdAt || '';
  const formattedDate = date ? new Date(date).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' }) : '';

  return (
    <div className="bg-[#FFFBF5] border border-[#D4AF37]/12 rounded-2xl p-4">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-sm"
          style={{ background: 'linear-gradient(135deg, #D4AF37, #CD7F32)' }}>
          {initial}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[#1A1A1C] font-semibold text-sm">{name}</span>
            {formattedDate && <span className="text-[#8B8680] text-xs flex-shrink-0">{formattedDate}</span>}
          </div>
          <StarRating rating={rating} size="sm" />
          {text ? (
            <p className="text-[#5C5850] text-sm mt-2 leading-relaxed line-clamp-4">{text}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function VenueReviews({ venue }) {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const PAGE_SIZE = 20;
  const PREVIEW = 3;

  useEffect(() => {
    if (!venue?.id) return;
    setLoading(true);
    fetchData('GET', `/venue-reviews/venue/${venue.id}?skip=0&limit=${PAGE_SIZE}`)
      .then(res => {
        const items = res?.data?.items || res?.items || [];
        const tot = res?.data?.total ?? res?.total ?? items.length;
        setReviews(items);
        setTotal(tot);
        setHasMore(items.length < tot);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [venue?.id]);

  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    fetchData('GET', `/venue-reviews/venue/${venue.id}?skip=${reviews.length}&limit=${PAGE_SIZE}`)
      .then(res => {
        const items = res?.data?.items || res?.items || [];
        const tot = res?.data?.total ?? res?.total ?? total;
        setReviews(prev => [...prev, ...items]);
        setTotal(tot);
        setHasMore(reviews.length + items.length < tot);
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false));
  };

  const avg = venue.rating || venue.ratingSummary?.average_rating || 0;
  const count = venue.reviewCount || venue.ratingSummary?.total_reviews || total || 0;

  // Nothing to show
  if (!loading && reviews.length === 0 && count === 0) return null;

  const displayed = showAll ? reviews : reviews.slice(0, PREVIEW);

  return (
    <div className="relative py-6">
      {/* Section Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#CD7F32] flex items-center justify-center shadow-md">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-[#1A1A1C] text-2xl font-serif font-semibold">
                {t('reviews', 'Reviews')}
              </h2>
              <p className="text-[#8B8680] text-xs">
                {t('guest_experiences', 'Guest experiences')}
              </p>
            </div>
          </div>

          {/* Rating summary pill */}
          {avg > 0 && (
            <div className="flex items-center gap-1.5 bg-[#D4AF37]/10 px-3 py-2 rounded-xl border border-[#D4AF37]/25">
              <Star className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
              <span className="text-[#1A1A1C] font-bold text-sm">{Number(avg).toFixed(1)}</span>
              {count > 0 && <span className="text-[#8B8680] text-xs">({count})</span>}
            </div>
          )}
        </div>
      </div>

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-[#F5F3ED] rounded-2xl h-24 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((review, i) => (
            <ReviewCard key={review.id || i} review={review} />
          ))}

          {/* Show more / load more */}
          {!showAll && reviews.length > PREVIEW && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full flex items-center justify-center gap-2 py-3 border border-[#D4AF37]/30 rounded-xl text-[#D4AF37] text-sm font-semibold hover:bg-[#D4AF37]/5 transition-colors"
            >
              <span>{t('see_all_reviews', 'See All Reviews')} ({count})</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          )}

          {showAll && hasMore && (
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="w-full flex items-center justify-center gap-2 py-3 border border-[#D4AF37]/30 rounded-xl text-[#D4AF37] text-sm font-semibold hover:bg-[#D4AF37]/5 transition-colors disabled:opacity-50"
            >
              {loadingMore ? t('loading', 'Loading...') : t('load_more', 'Load More')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
