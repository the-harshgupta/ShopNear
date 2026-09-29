import React from 'react';
import { useStore } from '../../context/StoreContext';
import { TrendingUp, AlertCircle, ShoppingCart, Search, ArrowRight, CheckCircle2, DollarSign, Info } from 'lucide-react';

export default function DemandInsightsView() {
  const { demandInsights, products, updateProductStock, showNotification } = useStore();

  const totalMissedRevenue = demandInsights.reduce((sum, d) => sum + d.estimatedMissedRevenue, 0);
  const totalUnfulfilledSearches = demandInsights.reduce((sum, d) => sum + d.unfulfilledSearches, 0);
  const totalListAdds = demandInsights.reduce((sum, d) => sum + d.shoppingListAdds, 0);

  const handleQuickRestock = (productId, productName) => {
    updateProductStock(productId, 20);
    showNotification(`Restocked 20 units of ${productName}`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-sky-600 text-xs font-bold uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Connected Store Telemetry</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Real Customer Demand &amp; Stockout Insights</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent insights calculated directly from customer searches and in-store shopping list additions for out-of-stock items.
          </p>
        </div>

        <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs text-sky-900 flex items-center space-x-2">
          <Info className="w-4 h-4 text-sky-700 shrink-0" />
          <span>
            <strong>Data Integrity:</strong> Metrics are computed from real customer search events and shopping list matches.
          </span>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Total Unfulfilled In-App Searches</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalUnfulfilledSearches}</div>
          <span className="text-[11px] text-slate-400">Shoppers queried unavailable items</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Unsatisfied Shopping List Items</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalListAdds}</div>
          <span className="text-[11px] text-slate-400">Listed by shoppers currently in-store</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-rose-200 shadow-sm">
          <span className="text-xs font-semibold text-rose-600">Estimated Missed Revenue</span>
          <div className="text-2xl font-bold text-rose-700 mt-1">₹{totalMissedRevenue.toLocaleString()}</div>
          <span className="text-[11px] text-rose-500">Potential lost value from stockouts</span>
        </div>
      </div>

      {/* Detailed Demand Breakdown Cards */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Stockout Signals &amp; Reorder Priority
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {demandInsights.map((item) => {
            const product = products.find(p => p.id === item.productId);
            const isCurrentlyStocked = product && product.currentStock > 0;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 hover:border-slate-300 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-base text-slate-900">{item.productName}</span>
                      <span className="text-xs text-slate-500 font-mono">({product?.category})</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Assigned Location: <span className="font-medium text-slate-700">{product?.aisle} &bull; {product?.shelf}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold px-2.5 py-1 rounded-lg">
                      {item.unfulfilledSearches} Searches
                    </span>
                    <span className="bg-sky-50 text-sky-800 border border-sky-200 text-xs font-bold px-2.5 py-1 rounded-lg">
                      {item.shoppingListAdds} Active Lists
                    </span>
                    {item.estimatedMissedRevenue > 0 && (
                      <span className="bg-slate-900 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                        ~ ₹{item.estimatedMissedRevenue} Lost
                      </span>
                    )}
                  </div>
                </div>

                {/* Analysis & Context */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="md:col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                    <div className="font-semibold text-slate-800">Telemetry Summary</div>
                    <p className="text-slate-600">{item.insight}</p>
                    <div className="text-emerald-700 font-medium pt-1">
                      <strong>Action:</strong> {item.recommendedAction}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">Current Shelf Stock</div>
                      <div className={`text-xl font-bold mt-1 ${isCurrentlyStocked ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {product?.currentStock || 0} units
                      </div>
                    </div>

                    <button
                      onClick={() => handleQuickRestock(item.productId, item.productName)}
                      className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs shadow-sm transition"
                    >
                      Restock +20 Units Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
