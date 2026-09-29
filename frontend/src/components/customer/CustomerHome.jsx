import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import ProductCard from './ProductCard';
import StoreCard from './StoreCard';
import IndoorStoreMapModal from '../common/IndoorStoreMapModal';
import StoreReviewsModal from '../common/StoreReviewsModal';
import { api } from '../../services/api';
import { 
  Search, 
  Sparkles, 
  CheckCircle2, 
  MapPin, 
  Tag, 
  ListOrdered, 
  Filter, 
  Layers,
  ArrowRight,
  Info,
  Store,
  Building2,
  ExternalLink,
  Scale,
  Navigation,
  Star
} from 'lucide-react';

export default function CustomerHome() {
  const { products, categories, logCustomerSearch, setCustomerView, selectedStore, stores, switchStore, getStoreRatingData } = useStore();
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('ALL'); // 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OFFERS'
  const [crossStoreResults, setCrossStoreResults] = useState([]);
  const [isSearchingCrossStores, setIsSearchingCrossStores] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mapModalData, setMapModalData] = useState({ product: null, store: null });
  const [topStores, setTopStores] = useState([]);
  const [loadingTopStores, setLoadingTopStores] = useState(true);

  // Load top rated stores from MySQL database
  useEffect(() => {
    let isMounted = true;
    api.getTopRatedStores(1, 4, [])
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setTopStores(data);
        }
      })
      .catch((err) => console.error("Failed to load top rated stores:", err))
      .finally(() => {
        if (isMounted) setLoadingTopStores(false);
      });

    return () => { isMounted = false; };
  }, [selectedStore]);

  const isSupermarket = selectedStore?.storeType === 'SUPERMARKET';

  const inStockCount = useMemo(() => products.filter(p => p.currentStock > p.minStockLevel).length, [products]);
  const lowStockCount = useMemo(() => products.filter(p => p.currentStock > 0 && p.currentStock <= p.minStockLevel).length, [products]);
  const outOfStockCount = useMemo(() => products.filter(p => p.currentStock === 0).length, [products]);
  const activeOffersCount = useMemo(() => products.filter(p => p.offer).length, [products]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.length >= 3) {
      logCustomerSearch(val, products);
    }
  };

  // Cross-store search query across MySQL backend
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setCrossStoreResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingCrossStores(true);
      try {
        const data = await api.searchStoresForProduct(searchQuery.trim());
        if (Array.isArray(data)) {
          // Filter to show options in other stores or all stores
          setCrossStoreResults(data);
        }
      } catch (err) {
        console.error("Cross-store search error:", err);
      } finally {
        setIsSearchingCrossStores(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Search match
      const matchesSearch = searchQuery === '' || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.aisle && product.aisle.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category match
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;

      // Availability / Offers filter
      let matchesAvailability = true;
      if (availabilityFilter === 'IN_STOCK') {
        matchesAvailability = product.currentStock > product.minStockLevel;
      } else if (availabilityFilter === 'LOW_STOCK') {
        matchesAvailability = product.currentStock > 0 && product.currentStock <= product.minStockLevel;
      } else if (availabilityFilter === 'OUT_OF_STOCK') {
        matchesAvailability = product.currentStock === 0;
      } else if (availabilityFilter === 'OFFERS') {
        matchesAvailability = Boolean(product.offer);
      }

      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }, [products, searchQuery, selectedCategory, availabilityFilter]);

  return (
    <div className="space-y-6">
      {/* Clean Modern Retail Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200/90 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-50/60 rounded-full blur-2xl pointer-events-none"></div>
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center space-x-1.5 bg-emerald-50 text-retail-800 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-200/80">
              <Sparkles className="w-3.5 h-3.5 text-retail-800" />
              <span>Smart Shopping Companion</span>
            </span>

            <span className="inline-flex items-center space-x-1.5 bg-gray-100 text-charcoal text-xs font-semibold px-3 py-1 rounded-full border border-gray-200">
              <MapPin className="w-3.5 h-3.5 text-retail-800" />
              <span>Active Store: <strong>{selectedStore?.name}</strong></span>
            </span>

            <button
              onClick={() => setIsReviewsModalOpen(true)}
              className="inline-flex items-center space-x-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold px-3 py-1 rounded-full border border-amber-200 transition cursor-pointer shadow-xs"
              title="Click to view verified customer ratings and reviews"
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>
                {getStoreRatingData(selectedStore?.id)?.averageRating !== null && getStoreRatingData(selectedStore?.id)?.averageRating !== undefined && getStoreRatingData(selectedStore?.id)?.totalReviews > 0
                  ? `${Number(getStoreRatingData(selectedStore?.id)?.averageRating).toFixed(1)} ⭐ (${getStoreRatingData(selectedStore?.id)?.totalReviews} reviews)`
                  : 'No ratings yet'}
              </span>
            </button>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-charcoal">
            What are you looking for today?
          </h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            {isSupermarket 
              ? 'Check live shelf stock and exact aisle coordinates before walking down the aisles. Compare ₹/kg and ₹/litre normalized prices across brands.'
              : `Check live neighborhood grocery stock at ${selectedStore?.name}, avoid stockout surprises, and pre-order for fast in-store pickup.`
            }
          </p>

          <div className="pt-2 flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => setCustomerView('list')}
              className="bg-retail-800 hover:bg-retail-700 text-white px-4 py-2 rounded-xl font-bold flex items-center space-x-1.5 transition shadow-sm"
            >
              <ListOrdered className="w-4 h-4" />
              <span>Open My Smart Shopping List</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>

            {isSupermarket && (
              <button
                onClick={() => setCustomerView('aisles')}
                className="bg-gray-100 hover:bg-gray-200 text-charcoal px-4 py-2 rounded-xl font-semibold flex items-center space-x-1.5 transition border border-gray-200"
              >
                <MapPin className="w-4 h-4 text-retail-800" />
                <span>View Supermarket Aisle Map</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Top Grocery Stores Section */}
      {!searchQuery && topStores.length > 0 && (
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
            <div>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h2 className="text-lg font-extrabold text-charcoal tracking-tight">
                  Top Grocery Stores
                </h2>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Highest rated stores based on verified customer ratings (descending order)
              </p>
            </div>

            <button
              onClick={() => setCustomerView('stores')}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-retail-800 hover:text-retail-700 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 rounded-xl transition border border-emerald-200 self-start sm:self-auto cursor-pointer"
            >
              <span>View All Stores &rarr;</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
            {topStores.map((store, index) => (
              <StoreCard
                key={store.id}
                store={store}
                rank={index + 1}
                onSelect={(selected) => {
                  switchStore(selected.id);
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Primary Search Bar & Live Filters */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200 shadow-sm space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={isSupermarket 
              ? "Search groceries, milk, tea, atta, soap, or aisle numbers (e.g. 'Aisle 2')..." 
              : `Search items in ${selectedStore?.name || 'store'} (e.g. 'atta', 'milk', 'maggi')...`
            }
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-retail-800 focus:bg-white text-charcoal placeholder:text-gray-400 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 font-medium"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                selectedCategory === cat.name
                  ? 'bg-retail-800 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-charcoal'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Stock & Offer Quick Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-500 font-medium flex items-center space-x-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Availability:</span>
            </span>

            <button
              onClick={() => setAvailabilityFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl font-medium transition ${
                availabilityFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-sm font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({products.length})
            </button>

            <button
              onClick={() => setAvailabilityFilter('IN_STOCK')}
              className={`px-3 py-1.5 rounded-xl font-medium transition flex items-center space-x-1.5 ${
                availabilityFilter === 'IN_STOCK'
                  ? 'bg-emerald-600 text-white shadow-sm font-bold'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${availabilityFilter === 'IN_STOCK' ? 'bg-white' : 'bg-emerald-500'}`}></span>
              <span>In Stock ({inStockCount})</span>
            </button>

            {lowStockCount > 0 && (
              <button
                onClick={() => setAvailabilityFilter('LOW_STOCK')}
                className={`px-3 py-1.5 rounded-xl font-medium transition flex items-center space-x-1.5 ${
                  availabilityFilter === 'LOW_STOCK'
                    ? 'bg-amber-500 text-white shadow-sm font-bold'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${availabilityFilter === 'LOW_STOCK' ? 'bg-white' : 'bg-amber-500 animate-pulse'}`}></span>
                <span>Low Stock ({lowStockCount})</span>
              </button>
            )}

            <button
              onClick={() => setAvailabilityFilter('OUT_OF_STOCK')}
              className={`px-3 py-1.5 rounded-xl font-medium transition flex items-center space-x-1.5 ${
                availabilityFilter === 'OUT_OF_STOCK'
                  ? 'bg-rose-600 text-white shadow-sm font-bold'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${availabilityFilter === 'OUT_OF_STOCK' ? 'bg-white' : 'bg-rose-500'}`}></span>
              <span>Out of Stock ({outOfStockCount})</span>
            </button>

            {activeOffersCount > 0 && (
              <button
                onClick={() => setAvailabilityFilter('OFFERS')}
                className={`px-3 py-1.5 rounded-xl font-medium transition flex items-center space-x-1.5 ${
                  availabilityFilter === 'OFFERS'
                    ? 'bg-indigo-600 text-white shadow-sm font-bold'
                    : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200'
                }`}
              >
                <Tag className="w-3 h-3 text-indigo-600" />
                <span>Offers ({activeOffersCount})</span>
              </button>
            )}
          </div>

          <div className="text-slate-500 text-xs font-medium">
            Showing <span className="font-bold text-slate-800">{filteredProducts.length}</span> of {products.length} items in <strong className="text-slate-800">{selectedStore?.name}</strong>
          </div>
        </div>

        {/* Live Out of Stock Alert Ribbon */}
        {outOfStockCount > 0 && availabilityFilter !== 'OUT_OF_STOCK' && (
          <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-3 flex items-center justify-between text-xs text-rose-900">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
              <span>
                <strong>{outOfStockCount} {outOfStockCount === 1 ? 'product is' : 'products are'} currently out of stock</strong> in {selectedStore?.name}. Check live shelf tags before visiting the store.
              </span>
            </div>
            <button
              onClick={() => setAvailabilityFilter('OUT_OF_STOCK')}
              className="text-rose-700 hover:text-rose-900 font-bold underline shrink-0 ml-2"
            >
              View Out of Stock ({outOfStockCount}) &rarr;
            </button>
          </div>
        )}
      </div>

      {/* Live Cross-Store Price & Stock Comparison Section */}
      {searchQuery.trim().length >= 2 && crossStoreResults.length > 0 && (
        <div className="bg-gradient-to-r from-sky-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-5 sm:p-6 shadow-lg space-y-4 border border-sky-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-800/80 pb-3">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-sky-400" />
                <h3 className="font-extrabold text-base sm:text-lg text-white">
                  Available Across Registered Stores for "{searchQuery}"
                </h3>
              </div>
              <p className="text-xs text-slate-300">
                Found in <strong className="text-sky-300">{crossStoreResults.length}</strong> {crossStoreResults.length === 1 ? 'store' : 'registered shops'}. Compare prices and check indoor shelf locations.
              </p>
            </div>
            <span className="text-[11px] bg-sky-950 text-sky-300 font-bold px-2.5 py-1 rounded-full border border-sky-800 shrink-0 self-start sm:self-auto">
              Live Database Search
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {crossStoreResults.map((item) => {
              const isCurrentStore = item.storeId === selectedStore?.id;
              const hasStock = item.stockQuantity > 0;
              const matchingStore = stores.find(s => s.id === item.storeId);
              const storeDistance = matchingStore?.distance || item.distance || '0.4 km away';

              const aisleVal = item.aisleNumber || item.aisle || 'Aisle 5';
              const rowVal = item.rowNumber || item.row || 'Row 7';
              const shelfVal = item.shelfNumber || item.shelf || 'Shelf 2';

              return (
                <div 
                  key={`${item.storeId}-${item.storeProductId || item.id}`}
                  className={`p-4 sm:p-5 rounded-2xl border text-xs flex flex-col justify-between space-y-3.5 transition shadow-sm ${
                    isCurrentStore 
                      ? 'bg-sky-950/70 border-sky-400 ring-2 ring-sky-400/30' 
                      : 'bg-slate-800/90 border-slate-700 hover:border-sky-500'
                  }`}
                >
                  {/* Shop & Product Header */}
                  <div className="space-y-2">
                    {/* Shop Name & Distance */}
                    <div className="flex items-center justify-between border-b border-slate-700/70 pb-2">
                      <div className="flex items-center space-x-1.5 min-w-0">
                        <Store className="w-4 h-4 text-sky-400 shrink-0" />
                        <span className="font-extrabold text-sm text-white truncate" title={item.storeName}>
                          {item.storeName}
                        </span>
                        {matchingStore?.averageRating && (
                          <span className="inline-flex items-center space-x-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0">
                            <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                            <span>{Number(matchingStore.averageRating).toFixed(1)}</span>
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] text-emerald-300 font-semibold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 shrink-0">
                        📍 {storeDistance}
                      </span>
                    </div>

                    {/* Product Name & Availability */}
                    <div className="flex items-start justify-between gap-2 pt-0.5">
                      <div>
                        <div className="font-bold text-sm text-slate-100 line-clamp-1" title={item.productName || item.name}>
                          {item.productName || item.name}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Size: {item.packageQuantity || 1} {item.unit?.toLowerCase() || 'unit'}
                        </div>
                      </div>

                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded shrink-0 ${
                        hasStock 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {hasStock ? '✓ Available' : 'Out of Stock'}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline space-x-2 pt-0.5">
                      <span className="font-black text-base text-white">₹{item.price}</span>
                      {item.unitPriceDisplay && (
                        <span className="text-[10px] text-sky-300 font-medium">
                          ({item.unitPriceDisplay})
                        </span>
                      )}
                    </div>

                    {/* Physical Location Inside Store */}
                    <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-2.5 space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-sky-400" />
                        <span>Location inside store:</span>
                      </div>

                      <div className="flex items-center space-x-1 text-[11px] font-extrabold text-white">
                        <span className="text-sky-300 bg-sky-950 px-1.5 py-0.5 rounded border border-sky-800">
                          {aisleVal.startsWith('Aisle') ? aisleVal : `Aisle ${aisleVal}`}
                        </span>
                        <span className="text-slate-500">&rarr;</span>
                        <span className="text-slate-200 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                          {rowVal.startsWith('Row') ? rowVal : `Row ${rowVal}`}
                        </span>
                        <span className="text-slate-500">&rarr;</span>
                        <span className="text-emerald-300 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                          {shelfVal.startsWith('Shelf') ? shelfVal : `Shelf ${shelfVal}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Find in Store & Switch / Cart */}
                  <div className="pt-2 border-t border-slate-700/60 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!isCurrentStore) switchStore(item.storeId);
                        setMapModalData({
                          product: {
                            id: item.storeProductId || item.id,
                            name: item.productName || item.name,
                            price: item.price,
                            aisleNumber: aisleVal,
                            rowNumber: rowVal,
                            shelfNumber: shelfVal,
                            imageUrl: item.imageUrl,
                            currentStock: item.stockQuantity
                          },
                          store: matchingStore || { id: item.storeId, name: item.storeName, distance: storeDistance }
                        });
                        setIsMapModalOpen(true);
                      }}
                      className="flex-1 bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-bold py-2 px-3 rounded-xl transition flex items-center justify-center space-x-1 shadow-xs"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Find in Store</span>
                    </button>

                    {!isCurrentStore ? (
                      <button
                        type="button"
                        onClick={() => switchStore(item.storeId)}
                        className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px] font-semibold py-2 px-2.5 rounded-xl transition"
                        title="Shop from this store"
                      >
                        Select Store
                      </button>
                    ) : (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-2 rounded-xl text-center border border-emerald-500/30">
                        Active
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Product Catalog Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">No matching products found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            We couldn't find items matching "{searchQuery}" in {selectedStore?.name}. Try searching general keywords like "milk", "atta", "dal", or check all categories.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setAvailabilityFilter('ALL'); }}
            className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Global Indoor Store Map Modal */}
      <IndoorStoreMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        product={mapModalData.product}
        store={mapModalData.store}
      />

      {/* Store Reviews & Rating Modal */}
      <StoreReviewsModal
        isOpen={isReviewsModalOpen}
        onClose={() => setIsReviewsModalOpen(false)}
        storeId={selectedStore?.id}
        storeName={selectedStore?.name}
      />
    </div>
  );
}
