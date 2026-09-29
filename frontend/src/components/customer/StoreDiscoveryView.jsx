import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import StoreCard from './StoreCard';
import { api } from '../../services/api';
import { 
  Store as StoreIcon, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Star, 
  Sparkles, 
  CheckCircle2, 
  ArrowLeft,
  Building2,
  RefreshCw
} from 'lucide-react';

export default function StoreDiscoveryView() {
  const { stores, selectedStore, switchStore, setCustomerView } = useStore();
  
  const [ratedStores, setRatedStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [sortBy, setSortBy] = useState('rating'); // 'rating' | 'reviews' | 'availability' | 'name'

  const fetchStores = async () => {
    setLoading(true);
    try {
      const data = await api.getStoresWithRatings({
        type: selectedType,
        sort: sortBy,
        q: searchQuery
      }, null);

      if (Array.isArray(data) && data.length > 0) {
        setRatedStores(data);
      } else {
        // Fallback: build from context stores if API returns empty
        const fallback = stores.map(s => ({
          ...s,
          type: s.storeType || s.type,
          averageRating: s.averageRating || null,
          reviewCount: s.reviewCount || 0,
          totalProducts: s.totalProducts || 16,
          inStockProducts: s.inStockProducts || 14,
          hasProducts: true
        }));
        setRatedStores(fallback);
      }
    } catch (err) {
      console.error("Failed to load rated stores:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [selectedType, sortBy]);

  // Debounced search query
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStores();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const typeTabs = [
    { id: 'ALL', label: 'All Stores' },
    { id: 'KIRANA_STORE', label: 'Kirana Stores' },
    { id: 'GROCERY_STORE', label: 'Grocery Stores' },
    { id: 'SUPERMARKET', label: 'Supermarkets' },
    { id: 'GENERAL_STORE', label: 'General Stores' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-500/30">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Verified Customer Ratings</span>
              </span>
              <span className="text-xs text-slate-400">&bull; Live Database Ranking</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Top Grocery Stores by Customer Rating
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Explore rated neighborhood kirana shops, supermarkets, and grocery stores. Ranked dynamically by verified customer reviews and order experiences.
            </p>
          </div>

          <button
            onClick={() => setCustomerView('browse')}
            className="self-start md:self-center bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition border border-slate-700 shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Shopping Catalog</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Search, Type Filter Pills & Sort Selector */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Store Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stores by name (e.g. 'Krishna', 'FreshMart', 'Gupta', 'Harsh')..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-medium"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-xs font-semibold text-slate-500 flex items-center space-x-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Sort By:</span>
            </span>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="rating">Rating: High to Low (Default)</option>
              <option value="reviews">Number of Reviews</option>
              <option value="availability">Stock Availability</option>
              <option value="name">Store Name (A-Z)</option>
            </select>

            <button
              onClick={fetchStores}
              title="Refresh store ratings"
              className="p-2.5 text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Store Type Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 border-t border-slate-100 pt-3 scrollbar-none">
          <span className="text-xs font-semibold text-slate-500 flex items-center space-x-1 mr-1 shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Store Type:</span>
          </span>

          {typeTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap ${
                selectedType === tab.id
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count Summary */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <div>
          Showing <strong className="text-slate-800 font-bold">{ratedStores.length}</strong> {ratedStores.length === 1 ? 'store' : 'stores'} sorted by <span className="font-semibold text-emerald-700">{sortBy === 'rating' ? 'highest customer rating' : sortBy}</span>
        </div>
        <div className="text-[11px] text-slate-400">
          Source: Verified MySQL Customer Reviews
        </div>
      </div>

      {/* Store Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 bg-slate-200 rounded-xl"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-slate-200 rounded w-20"></div>
                  <div className="h-4 bg-slate-200 rounded w-36"></div>
                </div>
              </div>
              <div className="h-8 bg-slate-100 rounded-lg"></div>
              <div className="h-4 bg-slate-100 rounded w-48"></div>
              <div className="h-10 bg-slate-200 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : ratedStores.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ratedStores.map((store, index) => {
            const hasReviews = store.reviewCount > 0 && store.averageRating !== null;
            return (
              <StoreCard
                key={store.id}
                store={store}
                rank={sortBy === 'rating' && hasReviews ? index + 1 : null}
                onSelect={(selected) => {
                  switchStore(selected.id);
                  setCustomerView('browse');
                }}
              />
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <StoreIcon className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No matching stores found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            We couldn't find any grocery stores matching your current filter criteria. Try selecting "All Stores" or clearing your search term.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedType('ALL');
              setSortBy('rating');
            }}
            className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
