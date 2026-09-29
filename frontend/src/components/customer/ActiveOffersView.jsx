import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Tag, Sparkles, MapPin, ShoppingCart, Percent } from 'lucide-react';

export default function ActiveOffersView() {
  const { products, addToCart, addShoppingListItem, selectedStore } = useStore();
  const offerProducts = products.filter(p => p.offer && p.currentStock > 0);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2 text-rose-600 text-xs font-bold uppercase tracking-wider mb-1">
          <Tag className="w-4 h-4" />
          <span>In-Store Specials</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900">Active In-Store Offers &amp; Discounts</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Verified promotional prices currently active at <strong className="text-slate-800">{selectedStore?.name} ({selectedStore?.branch})</strong> shelves.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {offerProducts.map((product) => {
          const savings = product.originalPrice - product.offer.dealPrice;

          return (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-rose-200 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative h-40 bg-slate-100 overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2.5 right-2.5 bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm flex items-center space-x-1">
                    <Percent className="w-3 h-3" />
                    <span>{product.offer.discountPercent}% OFF</span>
                  </span>
                  <span className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1 rounded-full">
                    {product.offer.title}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-sm text-slate-900 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="text-xs text-slate-500">{product.unit}</div>

                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs flex items-center space-x-2 text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-sky-600" />
                    <span className="font-semibold">{product.aisle}</span>
                    <span className="text-slate-400">&bull;</span>
                    <span className="text-slate-500 text-[11px] truncate">{product.shelf}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <div className="flex items-baseline justify-between mb-3">
                  <div>
                    <span className="text-lg font-bold text-slate-900">₹{product.offer.dealPrice}</span>
                    <span className="ml-2 text-xs text-slate-400 line-through">₹{product.originalPrice}</span>
                  </div>
                  <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                    Save ₹{savings}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => addShoppingListItem(product.name, product.id)}
                    className="text-xs font-medium py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition"
                  >
                    + Shopping List
                  </button>
                  <button
                    onClick={() => addToCart(product)}
                    className="text-xs font-bold py-2 px-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition flex items-center justify-center space-x-1"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
