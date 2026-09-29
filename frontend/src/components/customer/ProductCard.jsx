import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  MapPin, 
  Plus, 
  Check, 
  ShoppingCart, 
  ListOrdered, 
  Tag, 
  AlertTriangle, 
  Scale,
  Navigation,
  ArrowRight,
  Store
} from 'lucide-react';
import IndoorStoreMapModal from '../common/IndoorStoreMapModal';

export default function ProductCard({ product, store }) {
  const { addToCart, addShoppingListItem, shoppingList, selectedStore } = useStore();
  const [isMapOpen, setIsMapOpen] = useState(false);

  const currentStore = store || selectedStore;
  const isOutOfStock = product.currentStock === 0;
  const isLowStock = product.currentStock > 0 && product.currentStock <= product.minStockLevel;
  const isOnShoppingList = shoppingList.some(item => item.matchedProductId === product.id);

  const displayUnit = product.packageQuantity 
    ? `${product.packageQuantity} ${product.unit?.toLowerCase()}`
    : product.unit;

  // Exact location breadcrumbs
  const aisleText = product.aisleNumber || product.aisle || 'Aisle 5';
  const rowText = product.rowNumber || product.row || 'Row 7';
  const shelfText = product.shelfNumber || product.shelf || 'Shelf 2';

  return (
    <>
      <div className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-xs ${
        isOutOfStock 
          ? 'border-gray-200 bg-gray-50/80 opacity-90' 
          : 'border-gray-200/90 hover:border-gray-300 hover:shadow-md'
      }`}>
        {/* Product Image & Badges */}
        <div className="relative h-44 bg-gray-100 overflow-hidden flex items-center justify-center">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className={`w-full h-full object-cover transition-transform duration-300 ${
                isOutOfStock ? 'grayscale-[50%]' : 'hover:scale-105'
              }`}
              loading="lazy"
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextSibling) {
                  e.target.nextSibling.style.display = 'flex';
                }
              }}
            />
          ) : null}

          {/* Clean Placeholder when no image exists or load fails */}
          <div
            className={`w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 select-none ${
              product.imageUrl ? 'hidden' : 'flex'
            }`}
          >
            <span className="text-3xl mb-1">📦</span>
            <span className="text-xs font-semibold text-gray-500">No image</span>
          </div>

          {/* Category Pill */}
          <span className="absolute top-2.5 left-2.5 bg-charcoal/80 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1 rounded-full">
            {product.category}
          </span>

          {/* Offer Tag */}
          {product.offer && (
            <span className="absolute top-2.5 right-2.5 bg-rose-600 text-white text-[11px] font-bold px-2 py-1 rounded-md shadow-sm flex items-center space-x-1">
              <Tag className="w-3 h-3" />
              <span>{product.offer.discountPercent}% OFF</span>
            </span>
          )}

          {/* In-Store Availability Badge */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5">
            {isOutOfStock ? (
              <div className="bg-rose-900/90 backdrop-blur-sm text-rose-100 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center space-x-1.5 border border-rose-700 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                <span>Currently unavailable</span>
              </div>
            ) : isLowStock ? (
              <div className="bg-amber-900/90 backdrop-blur-sm text-amber-100 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center space-x-1.5 border border-amber-700 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                <span>Low Stock: Only {product.currentStock} left</span>
              </div>
            ) : (
              <div className="bg-retail-800/95 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center space-x-1.5 border border-emerald-600 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>✓ Available ({product.currentStock} in stock)</span>
              </div>
            )}
          </div>
        </div>

        {/* Product Information Body */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
          <div>
            {/* Store Name Badge (if multiple shops or cross-store) */}
            {product.storeName && (
              <div className="text-[11px] text-gray-500 font-semibold flex items-center space-x-1 mb-1">
                <Store className="w-3 h-3 text-retail-800" />
                <span className="text-charcoal font-bold">{product.storeName}</span>
              </div>
            )}

            <h3 className="font-bold text-charcoal text-sm sm:text-base leading-snug line-clamp-2" title={product.name}>
              {product.name}
            </h3>

            {/* Size & Normalized Unit Price */}
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-md">
                Size: {displayUnit}
              </span>
              {product.unitPriceDisplay && (
                <span className="text-[11px] font-bold text-retail-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center space-x-1">
                  <Scale className="w-3 h-3 text-retail-800" />
                  <span>{product.unitPriceDisplay}</span>
                </span>
              )}
            </div>

            {/* Physical Location inside Store Breadcrumb */}
            <div className="mt-3 bg-gray-50 border border-gray-200/90 rounded-2xl p-3 space-y-1.5">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-retail-800" />
                <span>Location inside store:</span>
              </div>

              <div className="flex items-center space-x-1.5 text-xs font-extrabold text-charcoal">
                <span className="text-retail-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  {aisleText.startsWith('Aisle') ? aisleText : `Aisle ${aisleText}`}
                </span>
                <span className="text-gray-400">&rarr;</span>
                <span className="text-charcoal bg-gray-200/70 px-2 py-0.5 rounded-md">
                  {rowText.startsWith('Row') ? rowText : `Row ${rowText}`}
                </span>
                <span className="text-gray-400">&rarr;</span>
                <span className="text-retail-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  {shelfText.startsWith('Shelf') ? shelfText : `Shelf ${shelfText}`}
                </span>
              </div>

              {/* Find in Store Button */}
              <button
                type="button"
                onClick={() => setIsMapOpen(true)}
                className="w-full mt-1.5 bg-charcoal hover:bg-retail-800 text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center space-x-1.5 transition shadow-xs"
              >
                <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                <span>Find in Store</span>
                <ArrowRight className="w-3 h-3 ml-0.5" />
              </button>
            </div>
          </div>

          {/* Pricing & Add Actions */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-baseline justify-between mb-3">
              <div>
                <span className="text-lg font-black text-charcoal">
                  ₹{product.offer ? product.offer.dealPrice : product.price}
                </span>
                {product.originalPrice > (product.offer ? product.offer.dealPrice : product.price) && (
                  <span className="ml-1.5 text-xs text-gray-400 line-through font-normal">
                    ₹{product.originalPrice}
                  </span>
                )}
              </div>
              {product.offer && (
                <span className="text-[11px] text-rose-600 font-bold">
                  Save ₹{product.originalPrice - product.offer.dealPrice}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Add to Smart Shopping List */}
              <button
                onClick={() => addShoppingListItem(product.name, product.id)}
                className={`text-xs font-semibold py-2 px-2.5 rounded-xl border flex items-center justify-center space-x-1 transition ${
                  isOnShoppingList
                    ? 'bg-emerald-50 text-retail-800 border-emerald-300 font-bold'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'
                }`}
              >
                {isOnShoppingList ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-retail-800" />
                    <span>On List</span>
                  </>
                ) : (
                  <>
                    <ListOrdered className="w-3.5 h-3.5 text-gray-500" />
                    <span>+ List</span>
                  </>
                )}
              </button>

              {/* Add to Cart */}
              <button
                onClick={() => addToCart(product)}
                disabled={isOutOfStock}
                className={`text-xs font-bold py-2 px-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition ${
                  isOutOfStock
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-retail-800 hover:bg-retail-700 text-white shadow-sm'
                }`}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>{isOutOfStock ? 'Unavailable' : 'Add to Cart'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Indoor Store Map Modal for this product */}
      <IndoorStoreMapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        product={product}
        store={currentStore}
      />
    </>
  );
}

