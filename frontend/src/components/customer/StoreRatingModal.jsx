import React, { useState } from 'react';
import { Star, CheckCircle, X, ShieldCheck, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';

export default function StoreRatingModal({ isOpen, onClose, order, storeId, storeName, onRatingSubmitted }) {
  const { user } = useAuth();
  const { showNotification, refreshStoreRating } = useStore();
  
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!rating || rating < 1 || rating > 5) {
      setErrorMessage('Please select a star rating (1 to 5).');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        orderId: order?.id || null,
        rating: rating,
        reviewText: reviewText.trim(),
        userId: user?.id || null
      };

      await api.submitStoreReview(storeId, payload);
      setIsSubmitted(true);
      if (showNotification) {
        showNotification(`Thank you for rating ${storeName || 'the store'}!`, 'success');
      }
      if (refreshStoreRating) {
        refreshStoreRating(storeId);
      }
      if (onRatingSubmitted) {
        onRatingSubmitted({ rating, reviewText, storeId, orderId: order?.id });
      }
      setTimeout(() => {
        setIsSubmitted(false);
        setReviewText('');
        onClose();
      }, 1600);
    } catch (err) {
      console.error('Failed to submit store review:', err);
      setErrorMessage(err.message || 'Unable to submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 transform transition-all animate-scale-up relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Rating Submitted!</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Your feedback helps {storeName || 'our store'} maintain high service and product quality.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Header / Store Pickup Completed */}
            <div className="text-center space-y-1.5 pt-2">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-semibold mb-1 border border-emerald-200">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Verified Store Pickup Completed ✓</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Rate Your Store Experience
              </h3>
              <p className="text-xs text-slate-500">
                {order?.orderNumber ? `Order #${order.orderNumber}` : 'Completed Order'} &bull; {storeName || 'ShopNear'}
              </p>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <div className="text-center space-y-2">
                <h4 className="text-sm font-bold text-slate-800">
                  How was your experience?
                </h4>

                {/* 1-5 Star Selection */}
                <div className="flex items-center justify-center space-x-2 py-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = (hoverRating || rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 focus:outline-none transform hover:scale-125 transition duration-150"
                        aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${
                            isFilled
                              ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                              : 'text-slate-300 hover:text-amber-200'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="text-xs font-semibold text-amber-600">
                  {rating === 5 && 'Outstanding Experience! ★★★★★'}
                  {rating === 4 && 'Very Good Service ★★★★☆'}
                  {rating === 3 && 'Average Experience ★★★☆☆'}
                  {rating === 2 && 'Needs Improvement ★★☆☆☆'}
                  {rating === 1 && 'Poor Experience ★☆☆☆☆'}
                </div>
              </div>
            </div>

            {/* Optional Feedback Text Box */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Share your experience <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea
                rows={3}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Tell us about your experience..."
                className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-none transition"
              />
            </div>

            {errorMessage && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl text-center">
                {errorMessage}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-3 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/10 transition flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Rating...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Submit Rating</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full text-slate-500 hover:text-slate-800 py-2 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
              >
                Maybe Later
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
