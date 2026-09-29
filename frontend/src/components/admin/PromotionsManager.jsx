import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Tag, Plus, Trash2, Percent, CheckCircle2 } from 'lucide-react';

export default function PromotionsManager() {
  const { products, addProductOffer, removeProductOffer } = useStore();
  const [isAddOfferModalOpen, setIsAddOfferModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || 1);
  const [offerTitle, setOfferTitle] = useState('');
  const [dealPrice, setDealPrice] = useState('');

  const activeOffers = products.filter(p => p.offer);

  const handleCreateOffer = (e) => {
    e.preventDefault();
    if (!offerTitle || !dealPrice) return;
    addProductOffer(Number(selectedProductId), {
      title: offerTitle,
      dealPrice: Number(dealPrice)
    });
    setOfferTitle('');
    setDealPrice('');
    setIsAddOfferModalOpen(false);
  };

  const selectedProduct = products.find(p => p.id === Number(selectedProductId));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Tag className="w-4 h-4" />
            <span>Store Promotions</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Promotional Campaigns &amp; Discount Offers</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Create in-store promotional discounts that highlight deals on customer apps and shelf tags.
          </p>
        </div>

        <button
          onClick={() => setIsAddOfferModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New Offer</span>
        </button>
      </div>

      {/* Offers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 text-white font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">Offer Campaign</th>
              <th className="py-3 px-4">Product</th>
              <th className="py-3 px-4">Regular Price</th>
              <th className="py-3 px-4">Deal Price</th>
              <th className="py-3 px-4">Savings</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {activeOffers.map((p) => {
              const savings = p.originalPrice - p.offer.dealPrice;

              return (
                <tr key={p.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <span className="bg-rose-50 text-rose-800 border border-rose-200 px-2.5 py-1 rounded-lg">
                      {p.offer.title}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{p.name}</div>
                    <div className="text-[10px] text-slate-400">{p.aisle} &bull; {p.unit}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 line-through">
                    ₹{p.originalPrice}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-700 text-sm">
                    ₹{p.offer.dealPrice}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-rose-600">
                    {p.offer.discountPercent}% OFF (Save ₹{savings})
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => removeProductOffer(p.id)}
                      className="text-xs text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg font-medium transition"
                      title="Deactivate Offer"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {activeOffers.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-500">
            No active promotional campaigns. Click "+ Create New Offer" to publish one.
          </div>
        )}
      </div>

      {/* Create Offer Modal */}
      {isAddOfferModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Launch Store Promotional Offer</h3>
            <form onSubmit={handleCreateOffer} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Catalog Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Current: ₹{p.price})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Campaign Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekend Mega Saver Deal"
                  value={offerTitle}
                  onChange={(e) => setOfferTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Promotional Deal Price (₹) &mdash; Regular: ₹{selectedProduct?.price}
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 199"
                  value={dealPrice}
                  onChange={(e) => setDealPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddOfferModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                >
                  Publish Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
