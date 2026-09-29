import React, { useState, useEffect } from 'react';
import { Star, X, MessageSquare, ShieldCheck, UserCheck, Calendar } from 'lucide-react';
import { api } from '../../services/api';

export default function StoreReviewsModal({ isOpen, onClose, storeId, storeName }) {
  const [ratingData, setRatingData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !storeId) return;

    let isMounted = true;
    setLoading(true);

    Promise.all([
      api.getStoreRating(storeId, null),
      api.getStoreReviews(storeId, [])
    ]).then(([ratingRes, reviewsRes]) => {
      if (!isMounted) return;
      setRatingData(ratingRes);
      setReviews(Array.isArray(reviewsRes) ? reviewsRes : []);
      setLoading(false);
    }).catch(err => {
      console.error("Failed to load reviews:", err);
      if (isMounted) setLoading(false);
    });

    return () => { isMounted = false; };
  }, [isOpen, storeId]);

  if (!isOpen) return null;

  const totalReviews = ratingData?.totalReviews ?? reviews.length;
  const averageRating = totalReviews > 0
    ? (ratingData?.averageRating ?? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length))
    : null;
  const distribution = ratingData?.ratingDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 transform transition-all animate-scale-up relative max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Customer Ratings &amp; Reviews</h3>
            <p className="text-xs text-slate-500">{storeName || 'Store Details'}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {/* Summary Card */}
          <div className="bg-slate-50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-100">
            <div className="text-center sm:text-left">
              <div className="text-4xl font-extrabold text-slate-900 flex items-center justify-center sm:justify-start space-x-1">
                <span>{averageRating != null ? Number(averageRating).toFixed(1) : '—'}</span>
                {averageRating != null && <Star className="w-7 h-7 text-amber-400 fill-amber-400" />}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {totalReviews > 0 ? `Based on ${totalReviews} verified pickup${totalReviews !== 1 ? 's' : ''}` : 'No ratings yet'}
              </p>
            </div>

            {/* Distribution Bars */}
            <div className="flex-1 w-full max-w-xs space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = distribution[star] || 0;
                const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={star} className="flex items-center space-x-2 text-xs">
                    <span className="w-3 text-slate-600 font-semibold">{star}★</span>
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-6 text-right text-slate-500 text-[11px]">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Customer Feedback</span>
            </h4>

            {loading ? (
              <div className="text-center py-8 text-xs text-slate-400">Loading reviews...</div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl text-xs text-slate-500">
                No reviews recorded yet. Ratings appear here after customers complete store orders.
              </div>
            ) : (
              <div className="space-y-3 divide-y divide-slate-100">
                {reviews.map((rev) => (
                  <div key={rev.id} className="pt-3 first:pt-0 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 bg-emerald-100 text-emerald-700 font-bold rounded-full flex items-center justify-center text-xs">
                          {(rev.customerName || 'Customer').charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-900 flex items-center space-x-1">
                            <span>{rev.customerName || 'Verified Customer'}</span>
                            <UserCheck className="w-3 h-3 text-emerald-600" title="Verified Customer" />
                          </div>
                          {rev.orderNumber && (
                            <span className="text-[10px] text-slate-400">Order #{rev.orderNumber}</span>
                          )}
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center space-x-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {rev.reviewText && (
                      <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl">
                        "{rev.reviewText}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
