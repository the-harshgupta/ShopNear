import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { MapPin, Layers, Package, Search, ChevronRight, CheckCircle2, AlertCircle, Navigation } from 'lucide-react';
import IndoorStoreMapModal from '../common/IndoorStoreMapModal';

export default function StoreAisleExplorer() {
  const { sections, aisles, products, addToCart, addShoppingListItem, selectedStore, switchStore, stores } = useStore();
  const [selectedAisleId, setSelectedAisleId] = useState(aisles[0]?.id || 1);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  const isSupermarket = selectedStore?.storeType === 'SUPERMARKET';
  const supermarketStore = stores.find(s => s.storeType === 'SUPERMARKET');

  if (!isSupermarket) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center max-w-lg mx-auto space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mx-auto">
            <MapPin className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Single Floor Shop Format</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            <strong>{selectedStore?.name}</strong> is a local neighborhood retail/kirana store with a single counter layout. Multi-aisle wayfinding is designed for large supermarkets and marts.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setIsMapModalOpen(true)}
              className="w-full sm:w-auto bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-xs flex items-center justify-center space-x-1.5"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Open Store Floor Plan</span>
            </button>
            {supermarketStore && (
              <button
                onClick={() => switchStore(supermarketStore.id)}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-xs"
              >
                Switch to {supermarketStore.name} &rarr;
              </button>
            )}
          </div>
        </div>

        <IndoorStoreMapModal
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
          store={selectedStore}
        />
      </div>
    );
  }

  const selectedAisle = aisles.find(a => a.id === selectedAisleId) || aisles[0];
  const aisleProducts = products.filter(p => p.aisleId === selectedAisleId || p.aisle === selectedAisle?.aisleNumber);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-sky-600 text-xs font-bold uppercase tracking-wider mb-1">
            <MapPin className="w-4 h-4" />
            <span>Interactive Store Directory</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Supermarket Aisle &amp; Shelf Locator</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Explore physical departments, aisle locations, and locate products on shelves before arriving at the store.
          </p>
        </div>

        <button
          onClick={() => setIsMapModalOpen(true)}
          className="bg-slate-900 hover:bg-sky-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow-sm shrink-0"
        >
          <Navigation className="w-4 h-4 text-sky-400" />
          <span>View Indoor Store Map</span>
        </button>
      </div>

      <IndoorStoreMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        store={selectedStore}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Sections & Aisles Directory */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Store Layout by Department
          </h3>

          <div className="space-y-3">
            {sections.map((section) => {
              const sectionAisles = aisles.filter(a => a.sectionId === section.id || a.sectionName === section.name);

              return (
                <div key={section.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  {/* Section Title */}
                  <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-sky-400">{section.name}</div>
                      <div className="text-[10px] text-slate-400">{section.floor}</div>
                    </div>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                      {section.code}
                    </span>
                  </div>

                  {/* Aisles in Section */}
                  <div className="divide-y divide-slate-100 p-1">
                    {sectionAisles.map((aisle) => {
                      const isSelected = aisle.id === selectedAisleId;
                      const count = products.filter(p => p.aisleId === aisle.id || p.aisle === aisle.aisleNumber).length;

                      return (
                        <button
                          key={aisle.id}
                          onClick={() => setSelectedAisleId(aisle.id)}
                          className={`w-full text-left p-3 rounded-xl transition flex items-center justify-between ${
                            isSelected
                              ? 'bg-sky-50 text-sky-900 font-semibold border border-sky-200'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div>
                            <div className="text-xs font-bold flex items-center space-x-1.5">
                              <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-sky-600' : 'text-slate-400'}`} />
                              <span>{aisle.aisleNumber}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {aisle.description}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                              {count} items
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 inline ml-1" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Aisle Shelf & Products View */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs text-sky-600 font-bold uppercase tracking-wider">
                Viewing Details
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                {selectedAisle?.aisleNumber} &mdash; {selectedAisle?.description}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Physical Shelves: <span className="font-semibold text-slate-700">{selectedAisle?.shelfIdentifier}</span> &bull; {selectedAisle?.sectionName}
              </p>
            </div>
            <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200">
              {aisleProducts.length} Products Placed
            </span>
          </div>

          {/* Product List in This Aisle */}
          {aisleProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {aisleProducts.map((product) => {
                const isOutOfStock = product.currentStock === 0;

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between hover:shadow-sm transition"
                  >
                    <div className="flex space-x-3">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-16 h-16 rounded-xl object-cover bg-slate-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                          {product.shelf}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-2">
                          {product.name}
                        </h4>
                        <div className="text-xs text-slate-500 mt-0.5">{product.unit}</div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-sm font-bold text-slate-900">
                          ₹{product.offer ? product.offer.dealPrice : product.price}
                        </span>
                        {isOutOfStock ? (
                          <div className="text-[10px] text-rose-600 font-semibold">Currently unavailable</div>
                        ) : (
                          <div className="text-[10px] text-emerald-600 font-semibold">
                            {product.currentStock} units available
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => addShoppingListItem(product.name, product.id)}
                          className="text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition"
                        >
                          + List
                        </button>
                        <button
                          onClick={() => addToCart(product)}
                          disabled={isOutOfStock}
                          className="text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 px-2.5 py-1.5 rounded-lg transition shadow-sm"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 text-slate-500 text-xs">
              No products currently assigned to this aisle.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
