import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  X, 
  MapPin, 
  Sparkles, 
  Navigation, 
  ShoppingBag, 
  ShoppingCart, 
  Check, 
  ListOrdered, 
  Store, 
  ArrowDown, 
  Layers, 
  Info,
  CornerDownRight,
  Footprints
} from 'lucide-react';

export default function IndoorStoreMapModal({ isOpen, onClose, product, store }) {
  const { products, addToCart, addShoppingListItem, shoppingList, selectedStore } = useStore();
  
  const currentStore = store || selectedStore;
  const isSupermarket = currentStore?.storeType === 'SUPERMARKET';

  // Parse product location
  const rawAisle = product?.aisleNumber || product?.aisle || 'Aisle 5';
  const aisleNumMatch = rawAisle.match(/\d+/);
  const targetAisleNumber = aisleNumMatch ? parseInt(aisleNumMatch[0], 10) : 5;

  const rawRow = product?.rowNumber || product?.row || 'Row 7';
  const rawShelf = product?.shelfNumber || product?.shelf || 'Shelf 2';

  const [activeAisleId, setActiveAisleId] = useState(targetAisleNumber);

  if (!isOpen) return null;

  // Standard 9 Aisles Layout for Store Map
  const aislesLayout = [
    { id: 1, name: 'Aisle 1', category: 'Atta, Rice & Grains', icon: '🌾', zone: 'Front Left' },
    { id: 2, name: 'Aisle 2', category: 'Dals, Pulses & Spices', icon: '🌿', zone: 'Front Center' },
    { id: 3, name: 'Aisle 3', category: 'Fresh Dairy & Milk', icon: '🥛', zone: 'Front Right' },
    { id: 4, name: 'Aisle 4', category: 'Oils & Ghee', icon: '🛢️', zone: 'Mid Left' },
    { id: 5, name: 'Aisle 5', category: 'Snacks, Shampoos & Care', icon: '🧴', zone: 'Mid Center' },
    { id: 6, name: 'Aisle 6', category: 'Tea, Coffee & Drinks', icon: '☕', zone: 'Mid Right' },
    { id: 7, name: 'Aisle 7', category: 'Soaps & Skin Wellness', icon: '🧼', zone: 'Rear Left' },
    { id: 8, name: 'Aisle 8', category: 'Oral Care & Cosmetics', icon: '🪥', zone: 'Rear Center' },
    { id: 9, name: 'Aisle 9', category: 'Cleaners & Detergents', icon: '🧹', zone: 'Rear Right' },
  ];

  // Products placed in currently selected aisle
  const activeAisleProducts = products.filter(p => {
    const pAisle = p.aisleNumber || p.aisle || '';
    return pAisle.includes(String(activeAisleId)) || (p.aisleId === activeAisleId);
  });

  const isOnShoppingList = product && shoppingList.some(item => item.matchedProductId === product.id);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200 animate-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-sky-500 text-white rounded-2xl shadow-sm">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white">Indoor Store Map</h3>
                <span className="text-[10px] bg-sky-950 text-sky-300 font-bold px-2 py-0.5 rounded border border-sky-800">
                  Indoor Navigation
                </span>
              </div>
              <div className="text-xs text-slate-300 flex items-center space-x-2 mt-0.5">
                <Store className="w-3.5 h-3.5 text-sky-400" />
                <span className="font-semibold text-slate-100">{currentStore?.name}</span>
                <span>&bull;</span>
                <span className="text-slate-400">{currentStore?.address || 'Main Road'}</span>
                {currentStore?.distance && (
                  <>
                    <span>&bull;</span>
                    <span className="text-emerald-400 font-medium">{currentStore.distance}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            title="Close Map"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Map Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50/50">

          {/* 1. Target Product Location Banner (If Opened from a specific product) */}
          {product && (
            <div className="bg-gradient-to-r from-sky-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-4 sm:p-5 shadow-md border border-sky-800/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded border border-amber-400/40 flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Product Located</span>
                    </span>
                    <span className="text-xs text-slate-300 font-medium">Inside {currentStore?.name}</span>
                  </div>

                  <h4 className="text-base sm:text-lg font-black text-white">
                    {product.name}
                  </h4>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <span className="bg-sky-500 text-white font-bold px-2.5 py-1 rounded-lg flex items-center space-x-1 shadow-sm">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{rawAisle.startsWith('Aisle') ? rawAisle : `Aisle ${rawAisle}`}</span>
                    </span>

                    <span className="bg-slate-800 text-sky-300 font-bold px-2.5 py-1 rounded-lg border border-slate-700">
                      {rawRow.startsWith('Row') ? rawRow : `Row ${rawRow}`}
                    </span>

                    <span className="bg-slate-800 text-emerald-300 font-bold px-2.5 py-1 rounded-lg border border-slate-700">
                      {rawShelf.startsWith('Shelf') ? rawShelf : `Shelf ${rawShelf}`}
                    </span>

                    <span className="font-bold text-amber-300 ml-1">
                      ₹{product.price}
                    </span>
                  </div>
                </div>

                {/* Quick Add Actions */}
                <div className="flex items-center space-x-2 shrink-0 pt-2 sm:pt-0">
                  <button
                    onClick={() => addShoppingListItem(product.name, product.id)}
                    className={`text-xs font-semibold px-3 py-2 rounded-xl border flex items-center space-x-1 transition ${
                      isOnShoppingList
                        ? 'bg-sky-500/20 text-sky-300 border-sky-400'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                  >
                    {isOnShoppingList ? <Check className="w-3.5 h-3.5 text-sky-400" /> : <ListOrdered className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{isOnShoppingList ? 'On List' : '+ List'}</span>
                  </button>

                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.currentStock === 0}
                    className="bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition shadow-sm"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>

              {/* Wayfinding Step-by-Step Path Directions */}
              <div className="mt-3 pt-3 border-t border-slate-800 flex items-start space-x-2 text-xs text-slate-300">
                <Footprints className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="text-white">Directions: </strong>
                  <span>Enter store &rarr; Walk straight 12m &rarr; Turn into <strong className="text-sky-300">{rawAisle}</strong> &rarr; Find product on <strong className="text-emerald-300">{rawRow}, {rawShelf}</strong>.</span>
                </div>
              </div>
            </div>
          )}

          {/* 2. Visual Indoor Store Layout Diagram */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-slate-700" />
                <h4 className="font-bold text-sm text-slate-900">Floor Layout &amp; Aisle Grid</h4>
              </div>
              <span className="text-[11px] text-slate-500">
                Click any aisle to view stocked products
              </span>
            </div>

            {/* Entrance Indicator at Top */}
            <div className="text-center">
              <div className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold px-4 py-1.5 rounded-full shadow-xs">
                <span>🚪 STORE ENTRANCE</span>
                <ArrowDown className="w-3.5 h-3.5 animate-bounce text-emerald-600" />
              </div>
            </div>

            {/* The 3x3 Indoor Aisle Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {aislesLayout.map((aisle) => {
                const isTargetProductAisle = product && aisle.id === targetAisleNumber;
                const isCurrentActiveAisle = aisle.id === activeAisleId;

                return (
                  <div
                    key={aisle.id}
                    onClick={() => setActiveAisleId(aisle.id)}
                    className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between min-h-[110px] ${
                      isTargetProductAisle
                        ? 'bg-gradient-to-b from-sky-50 to-indigo-50/70 border-sky-500 shadow-md ring-4 ring-sky-400/20'
                        : isCurrentActiveAisle
                        ? 'bg-slate-50 border-slate-800 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    {/* Highlight Badge for Target Product */}
                    {isTargetProductAisle && (
                      <div className="absolute -top-2.5 right-3 bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm flex items-center space-x-1 animate-pulse">
                        <Sparkles className="w-3 h-3" />
                        <span>⭐ PRODUCT HERE</span>
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-base">{aisle.icon}</span>
                          <span className={`font-black text-xs sm:text-sm ${
                            isTargetProductAisle ? 'text-sky-950 font-black' : 'text-slate-900'
                          }`}>
                            {aisle.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 font-mono">
                          {aisle.zone}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-600 font-medium line-clamp-1">
                        {aisle.category}
                      </div>
                    </div>

                    {/* Specific Location Coordinates inside Aisle */}
                    {isTargetProductAisle && (
                      <div className="mt-2 pt-2 border-t border-sky-200/80 flex items-center justify-between text-[11px]">
                        <span className="font-bold text-sky-900 flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-sky-600" />
                          <span>{rawRow} &bull; {rawShelf}</span>
                        </span>
                        <span className="text-[10px] font-extrabold text-sky-700 bg-sky-100 px-1.5 py-0.5 rounded">
                          Exact Bay
                        </span>
                      </div>
                    )}

                    {!isTargetProductAisle && (
                      <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                        <span>Aisle {aisle.id} Bay</span>
                        <span className="text-sky-600 font-semibold hover:underline">Select &rarr;</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Checkout Counters at Bottom */}
            <div className="pt-2 text-center">
              <div className="inline-flex items-center space-x-2 bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold px-4 py-1.5 rounded-full">
                <span>🛒 POS BILLING &amp; CHECKOUT COUNTERS</span>
                <span>&bull;</span>
                <span className="text-slate-500">EXIT</span>
              </div>
            </div>

            {/* Map Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span>Entrance / Exit</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-sky-500"></span>
                <span>⭐ Product Location</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-300"></span>
                <span>Other Store Aisles</span>
              </div>
            </div>
          </div>

          {/* 3. Products in Selected Aisle Explorer */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="font-bold text-xs text-slate-900 flex items-center space-x-1.5">
                <Store className="w-3.5 h-3.5 text-sky-600" />
                <span>All Items in Aisle {activeAisleId} ({activeAisleProducts.length})</span>
              </h5>
              <span className="text-[11px] text-slate-500">In {currentStore?.name}</span>
            </div>

            {activeAisleProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activeAisleProducts.map((item) => (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between space-x-2 text-xs transition ${
                      product && item.id === product.id
                        ? 'bg-sky-50 border-sky-400 font-semibold'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate max-w-[170px]" title={item.name}>
                          {item.name}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center space-x-1">
                          <span>{item.row || 'Row 1'}</span>
                          <span>&bull;</span>
                          <span>{item.shelf || 'Shelf 1'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-bold text-slate-900">₹{item.price}</div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        item.currentStock > 0 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                      }`}>
                        {item.currentStock > 0 ? `${item.currentStock} left` : 'Out'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">
                No other items mapped in Aisle {activeAisleId} currently.
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-slate-500 flex items-center space-x-1">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Indoor positioning is store-specific and updated live by store staff.</span>
          </div>

          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl transition shadow-sm"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
