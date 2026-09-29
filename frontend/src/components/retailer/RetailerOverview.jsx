import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import StoreRatingsAnalyticsCard from '../common/StoreRatingsAnalyticsCard';
import { 
  TrendingUp, 
  AlertTriangle, 
  AlertCircle, 
  Package, 
  Clock, 
  ArrowRight, 
  Plus, 
  CheckCircle2, 
  DollarSign, 
  ShoppingCart,
  Users,
  Search,
  Receipt,
  Store,
  Scale,
  Mic,
  Bot,
  Sparkles
} from 'lucide-react';

export default function RetailerOverview() {
  const { user } = useAuth();
  const { 
    products, 
    orders, 
    sales,
    demandInsights, 
    updateProductStock, 
    setRetailerView,
    addProduct,
    selectedStore,
    setIsVoiceAssistantOpen
  } = useStore();

  const outOfStockItems = products.filter(p => p.currentStock === 0);
  const lowStockItems = products.filter(p => p.currentStock > 0 && p.currentStock <= p.minStockLevel);
  const pendingOrders = orders.filter(o => o.status === 'PENDING');
  
  // Real sales total computed from recorded sales + sample demo baseline
  const recordedSalesTotal = sales.reduce((sum, s) => sum + s.totalAmount, 0);

  const activeStoreName = user?.storeName || selectedStore?.name || (user?.store?.name) || 'My Store';
  const activeStoreOwner = selectedStore?.ownerName || user?.fullName || user?.name || 'Store Owner';
  const activeStorePhone = selectedStore?.phone || user?.phone || '';
  const activeStoreUpi = selectedStore?.upiId || `${activeStoreName.toLowerCase().replace(/[^a-z0-9]/g, '')}@upi`;
  const activeStoreTimings = selectedStore?.timings || '7:00 AM - 10:30 PM';
  const isSmallShop = (selectedStore?.storeType || user?.storeType) !== 'SUPERMARKET';

  return (
    <div className="space-y-6">
      {/* Title & Active Store Profile Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>{isSmallShop ? 'Kirana Store Operations' : 'Supermarket Floor Operations'}</span>
          </div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-xl font-bold text-slate-900">{activeStoreName}</h2>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
              isSmallShop 
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
            }`}>
              {isSmallShop ? '🏪 Small Retail / Kirana Store' : '🏢 Supermarket Format'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>Owner: <strong className="text-slate-700">{activeStoreOwner}</strong></span>
            <span>&bull;</span>
            <span>Contact: <strong className="text-slate-700">{activeStorePhone}</strong></span>
            <span>&bull;</span>
            <span>UPI: <strong className="text-slate-700 font-mono">{activeStoreUpi}</strong></span>
            <span>&bull;</span>
            <span>Hours: {activeStoreTimings}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setIsVoiceAssistantOpen(true)}
            className="bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-sm animate-pulse cursor-pointer"
            title="Open Voice Assistant to update inventory by speaking"
          >
            <Mic className="w-4 h-4" />
            <span>🎙️ Vyapar Voice AI</span>
          </button>
          <button
            onClick={() => setRetailerView('sales')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
          >
            <Receipt className="w-4 h-4" />
            <span>Record Sale</span>
          </button>
          <button
            onClick={() => setRetailerView('inventory')}
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
          >
            <Package className="w-4 h-4" />
            <span>Manage Inventory</span>
          </button>
          <button
            onClick={() => setRetailerView('profile')}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition"
          >
            <Store className="w-4 h-4" />
            <span>Edit Shop</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Sales */}
        <div 
          onClick={() => setRetailerView('sales_history')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-emerald-300 transition"
        >
          <div>
            <span className="text-xs font-semibold text-slate-500">Sales Recorded</span>
            <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">₹{recordedSalesTotal.toLocaleString()}</div>
            <span className="text-[11px] text-emerald-600 font-medium">{sales.length} transactions &rarr;</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Low Stock Warnings */}
        <div 
          onClick={() => setRetailerView('inventory')}
          className="bg-white rounded-2xl p-5 border border-amber-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-amber-400 transition"
        >
          <div>
            <span className="text-xs font-semibold text-amber-600">Low Stock Warnings</span>
            <div className="text-2xl font-bold text-amber-700 mt-1">{lowStockItems.length} Products</div>
            <span className="text-[11px] text-amber-600 font-medium">Below warning threshold</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Out of Stock Items */}
        <div 
          onClick={() => setRetailerView('inventory')}
          className="bg-white rounded-2xl p-5 border border-rose-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-rose-400 transition"
        >
          <div>
            <span className="text-xs font-semibold text-rose-600">Out of Stock</span>
            <div className="text-2xl font-bold text-rose-700 mt-1">{outOfStockItems.length} Products</div>
            <span className="text-[11px] text-rose-500 font-medium">Needs replenishment</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Total Catalog Items */}
        <div 
          onClick={() => setRetailerView('inventory')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-slate-300 transition"
        >
          <div>
            <span className="text-xs font-semibold text-slate-500">Live Inventory SKUs</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{products.length} Products</div>
            <span className="text-[11px] text-slate-400">{products.filter(p => p.currentStock > p.minStockLevel).length} healthy stock</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Urgent Stockout Action */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Low Stock Attention</h3>
              <p className="text-xs text-slate-500">Instant 1-click replenishment for low or exhausted products.</p>
            </div>
            <button
              onClick={() => setRetailerView('inventory')}
              className="text-xs text-emerald-600 font-bold hover:underline"
            >
              All Inventory &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {[...outOfStockItems, ...lowStockItems].slice(0, 5).map((prod) => {
              const isZero = prod.currentStock === 0;

              return (
                <div
                  key={prod.id}
                  className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${isZero ? 'bg-rose-500' : 'bg-amber-500'}`}></div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{prod.name}</div>
                      <div className="text-[11px] text-slate-500">
                        Current: <span className="font-bold text-slate-700">{prod.currentStock} {prod.unit?.toLowerCase()}</span> &bull; Alert at: {prod.minStockLevel}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => updateProductStock(prod.id, 5)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-sm transition"
                    >
                      +5 Stock
                    </button>
                    <button
                      onClick={() => updateProductStock(prod.id, 20)}
                      className="bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition"
                    >
                      +20
                    </button>
                  </div>
                </div>
              );
            })}

            {outOfStockItems.length === 0 && lowStockItems.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400">
                All inventory stock counts are currently above safety thresholds.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Sales / Point of Sale Quick Access */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Customer Sales</h3>
              <p className="text-xs text-slate-500">Latest recorded purchases at the shop counter.</p>
            </div>
            <button
              onClick={() => setRetailerView('sales_history')}
              className="text-xs text-emerald-600 font-bold hover:underline"
            >
              All Sales &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {sales.slice(0, 4).map((sale) => (
              <div
                key={sale.id}
                className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">{sale.customerName || 'Walk-in Customer'}</div>
                  <div className="text-[10px] text-slate-400">
                    {new Date(sale.saleDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; {sale.items?.length || 0} items
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold font-mono text-emerald-700 text-sm">₹{sale.totalAmount}</div>
                  <span className="text-[10px] text-slate-400">Paid</span>
                </div>
              </div>
            ))}

            <button
              onClick={() => setRetailerView('sales')}
              className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold py-2.5 rounded-xl text-xs border border-emerald-200 transition flex items-center justify-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-700" />
              <span>Record New Sale Bill</span>
            </button>
          </div>
        </div>
      </div>

      {/* Customer Ratings & Reviews Card (Read-only for Manager / Shopkeeper) */}
      <StoreRatingsAnalyticsCard
        storeId={selectedStore?.id}
        storeName={selectedStore?.name}
      />
    </div>
  );
}
