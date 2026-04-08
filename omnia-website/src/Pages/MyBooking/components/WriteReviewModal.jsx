import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { fetchData } from "@/helpers/fetchData";
import toast from "react-hot-toast";

export default function WriteReviewModal({ isOpen, booking, onClose, t }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !booking) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error(t("Please select a rating"));
      return;
    }

    setSubmitting(true);
    try {
      await fetchData("POST", "/venue-reviews", {
        rating,
        review_text: reviewText.trim() || undefined,
        booking_id: booking.id,
      });
      toast.success(t("Review submitted successfully!"));
      setRating(0);
      setReviewText("");
      onClose();
    } catch {
      // fetchData shows toast
    } finally {
      setSubmitting(false);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md sm:mx-4 rounded-t-3xl sm:rounded-3xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2 sm:hidden">
          <div className="w-10 h-1 bg-[#E8E3D5] rounded-full" />
        </div>

        <div className="p-6 space-y-6">
          {/* Title */}
          <div className="text-center">
            <h3
              className="text-xl text-[#1A1A1C] mb-1"
              style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600 }}
            >
              {t("Write Review")}
            </h3>
            <p className="text-[#8B8680] text-sm">{booking.venueName}</p>
          </div>

          {/* Star Rating */}
          <div>
            <p className="text-[#1A1A1C] text-sm mb-3">{t("Your Rating")}</p>
            <div className="flex items-center justify-center gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="cursor-pointer transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= displayRating
                        ? "text-[#D4AF37] fill-[#D4AF37]"
                        : "text-[#E8E3D5]"
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Review Text */}
          <div>
            <p className="text-[#1A1A1C] text-sm mb-2">
              {t("Your Review")}{" "}
              <span className="text-[#8B8680]">({t("Optional")})</span>
            </p>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder={t("Share your experience with this venue")}
              rows={4}
              maxLength={500}
              className="w-full bg-[#F9F9F9] border border-[#E8E3D5] rounded-2xl px-4 py-3 text-[#1A1A1C] placeholder:text-[#8B8680]/60 outline-none focus:border-[#D4AF37] resize-none transition-all"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={rating === 0 || submitting}
            className={`w-full py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              rating > 0
                ? "bg-gradient-to-r from-[#D4AF37] to-[#CD7F32] text-white hover:shadow-lg"
                : "bg-[#E8E3D5]/30 text-[#8B8680] cursor-not-allowed"
            }`}
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              t("Submit Review")
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
