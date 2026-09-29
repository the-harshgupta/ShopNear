import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import StoreReviewsModal from '../common/StoreReviewsModal';
import { 
  Store as StoreIcon, 
  Building2, 
  MapPin, 
  Star, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  ShoppingBag
} from 'lucide-react';

export default function StoreCard({ store, rank = null, onSelect = null }) {
  const { selectedStore, switchStore, setCustomerView } = useStore();
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);

  const isCurrentStore = selectedStore?.id === store.id;
  const isSupermarket = store.type === 'SUPERMARKET' || store.storeType === 'SUPERMARKET';

  // Format type nicely
  const formattedType = 
    store.type === 'SUPERMARKET' || store.storeType === 'SUPERMARKET' ? 'Supermarket' :
    store.type === 'GROCERY_STORE' || store.storeType === 'GROCERY_STORE' ? 'Grocery Store' :
    store.type === 'GENERAL_STORE' || store.storeType === 'GENERAL_STORE' ? 'General Store' :
    'Kirana Store';

  const hasRatings = store.reviewCount > 0 && store.averageRating !== null && store.averageRating !== undefined;
  const ratingDisplay = hasRatings ? Number(store.averageRating).toFixed(1) : null;
  const reviewCount = store.reviewCount || 0;

  const handleViewStore = (e) => {
    e?.stopPropagation();
    if (onSelect) {
      onSelect(store);
    } else {
      switchStore(store.id);
      setCustomerView('browse');
    }
  };

  return (
    <>
      <div 
        onClick={handleViewStore}
        className={`group bg-white rounded-2xl border p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 hover:shadow-md hover:-translate-y-0.5 ${
          isCurrentStore 
            ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20' 
            : 'border-slate-200 hover:border-emerald-400'
        }`}
      >
        {/* Card Header: Icon, Type & Rank Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
              isSupermarket 
                ? 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white' 
                : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'
            }`}>
              {isSupermarket ? (
                <Building2 className="w-6 h-6" />
              ) : (
                <StoreIcon className="w-6 h-6" />
              )}
            </div>

            <div>
              <div className="flex items-center space-x-1.5">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  isSupermarket 
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {formattedType}
                </span>

                {isCurrentStore && (
                  <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Active</span>
                  </span>
                )}
              </div>

              <h3 className="font-bold text-slate-900 text-base mt-1 line-clamp-1 group-hover:text-emerald-600 transition-colors" title={store.name}>
                {store.name}
              </h3>
            </div>
          </div>

          {rank && (
            <span className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-black flex items-center justify-center shrink-0 shadow-xs" title={`Ranked #${rank}`}>
              #{rank}
            </span>
          )}
        </div>

        {/* Rating & Review Section */}
        <div className="flex items-center justify-between pt-1 pb-1 border-y border-slate-100">
          {hasRatings ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsReviewsOpen(true);
              }}
              className="inline-flex items-center space-x-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-200 transition text-xs cursor-pointer"
              title="Click to view verified customer reviews"
            >
              <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
              <span className="font-bold text-slate-900">{ratingDisplay}</span>
              <span className="text-slate-400">&bull;</span>
              <span className="text-slate-600 font-medium underline underline-offset-2">
                {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
              </span>
            </button>
          ) : (
            <div className="inline-flex items-center space-x-1.5 bg-slate-50 text-slate-500 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-medium">
              <Star className="w-3.5 h-3.5 text-slate-300" />
              <span>No ratings yet</span>
            </div>
          )}

          {store.distance && (
            <span className="text-xs text-slate-500 font-medium flex items-center space-x-1">
              <span>📍 Nearby</span>
            </span>
          )}
        </div>

        {/* Location & Availability Information */}
        <div className="space-y-1.5 text-xs text-slate-600">
          <div className="flex items-start space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span className="line-clamp-1 text-slate-500" title={store.address}>
              {store.address || `${store.city || 'Bengaluru'}, Karnataka`}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 text-emerald-700 font-semibold pt-0.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>✓ Products Available</span>
            {store.totalProducts > 0 && (
              <span className="text-[11px] text-slate-400 font-normal">
                ({store.inStockProducts || store.totalProducts} items in stock)
              </span>
            )}
          </div>
        </div>

        {/* Bottom Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleViewStore}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              isCurrentStore
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-900 hover:bg-emerald-600 text-white shadow-sm group-hover:bg-emerald-600'
            }`}
          >
            <span>{isCurrentStore ? 'Shopping Here (Active)' : 'View Store'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Store Reviews Modal */}
      <StoreReviewsModal
        isOpen={isReviewsOpen}
        onClose={() => setIsReviewsOpen(false)}
        storeId={store.id}
        storeName={store.name}
      />
    </>
  );
}
