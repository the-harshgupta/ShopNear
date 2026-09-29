import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, UserCheck, ShieldCheck, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';

export default function StoreRatingsAnalyticsCard({ storeId, storeName }) {
  const [ratingData, setRatingData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      const [ratingRes, reviewsRes] = await Promise.all([
        api.getStoreRating(storeId, null),
        api.getStoreReviews(storeId, [])
      ]);
      setRatingData(ratingRes);
      setReviews(Array.isArray(reviewsRes) ? reviewsRes : []);
    } catch (e) {
      console.error("Failed to load store ratings in analytics card:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [storeId]);

  const totalReviews = ratingData?.totalReviews ?? reviews.length;
  const averageRating = totalReviews > 0 
    ? (ratingData?.averageRating ?? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length))
    : null;
  const distribution = ratingData?.ratingDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Customer Ratings &amp; Reviews</h3>
            <p className="text-xs text-slate-500">Verified post-purchase customer feedback (Read-only)</p>
          </div>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition"
          title="Refresh reviews"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-100">
        {/* Average Score */}
        <div className="text-center md:border-r md:border-slate-200/80 pr-2 flex flex-col items-center justify-center">
          <div className="text-3xl font-extrabold text-slate-900 flex items-center space-x-1">
            <span>{averageRating != null ? Number(averageRating).toFixed(1) : '—'}</span>
            {averageRating != null && <Star className="w-6 h-6 text-amber-400 fill-amber-400" />}
          </div>
          {averageRating != null ? (
            <div className="flex items-center space-x-0.5 mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3.5 h-3.5 ${
                    s <= Math.round(averageRating)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-200'
                  }`}
                />
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-400 mt-1">No ratings yet</div>
          )}
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            {totalReviews} verified rating{totalReviews !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Star Distribution Progress Bars */}
        <div className="md:col-span-2 space-y-1.5 justify-center flex flex-col">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star] || 0;
            const percent = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
            return (
              <div key={star} className="flex items-center space-x-2 text-xs">
                <span className="w-5 text-slate-600 font-semibold">{star} ★</span>
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="w-10 text-right text-slate-500 text-[11px] font-mono">
                  {count} ({percent}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Reviews Feed */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
          <span>Recent Customer Feedback</span>
        </h4>

        {loading ? (
          <div className="text-center py-6 text-xs text-slate-400">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-6 bg-slate-50 rounded-xl text-xs text-slate-500">
            No customer ratings submitted yet for this store.
          </div>
        ) : (
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {reviews.slice(0, 6).map((rev) => (
              <div key={rev.id} className="bg-slate-50/90 p-3 rounded-xl border border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-emerald-100 text-emerald-700 font-bold rounded-full flex items-center justify-center text-[10px]">
                      {(rev.customerName || 'Customer').charAt(0)}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 flex items-center space-x-1">
                        <span>{rev.customerName || 'Verified Customer'}</span>
                        <UserCheck className="w-3 h-3 text-emerald-600" />
                      </span>
                      {rev.orderNumber && (
                        <span className="text-[10px] text-slate-400 font-mono">Order #{rev.orderNumber}</span>
                      )}
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center space-x-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < rev.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {rev.reviewText && (
                  <p className="text-xs text-slate-700 italic pl-8">
                    "{rev.reviewText}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
