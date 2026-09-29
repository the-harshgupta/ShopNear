import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Receipt, Calendar, User, Phone, DollarSign, ArrowLeft, Clock } from 'lucide-react';

export default function SalesHistory() {
  const { sales, setRetailerView, selectedStore } = useStore();

  const totalSalesRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const averageTicketSize = sales.length > 0 ? Math.round(totalSalesRevenue / sales.length) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Receipt className="w-4 h-4" />
            <span>Store Transaction Log</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Sales History &amp; Receipts</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Past sales records and billing summary for <strong>{selectedStore?.name}</strong>.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setRetailerView('sales')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-sm"
          >
            + Record New Sale
          </button>
          <button
            onClick={() => setRetailerView('overview')}
            className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition"
          >
            &larr; Back to Dashboard
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Total Revenue Recorded</span>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">₹{totalSalesRevenue.toLocaleString()}</div>
          <span className="text-[11px] text-slate-400">{sales.length} completed transactions</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Total Transactions</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{sales.length}</div>
          <span className="text-[11px] text-slate-400">Recorded at counter</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Average Order Value</span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">₹{averageTicketSize}</div>
          <span className="text-[11px] text-slate-400">Per bill ticket</span>
        </div>
      </div>

      {/* Sales List */}
      <div className="space-y-3">
        {sales.map((sale) => (
          <div
            key={sale.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 hover:border-slate-300 transition"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">
                    {sale.customerName || 'Walk-in Customer'}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center space-x-2 mt-0.5">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(sale.saleDate).toLocaleString()}</span>
                    </span>
                    {sale.customerPhone && (
                      <>
                        <span>&bull;</span>
                        <span className="flex items-center space-x-1">
                          <Phone className="w-3 h-3" />
                          <span>{sale.customerPhone}</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-400">Total Billed</div>
                <div className="text-lg font-bold font-mono text-emerald-700">₹{sale.totalAmount}</div>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Purchased Items:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {sale.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs flex justify-between items-center"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 line-clamp-1">{item.productName}</div>
                      <div className="text-[10px] text-slate-400">₹{item.unitPrice} each</div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-800">x{item.quantity}</span>
                      <div className="text-[11px] font-semibold text-slate-700">₹{item.totalPrice || (item.unitPrice * item.quantity)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {sales.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 space-y-3">
            <Receipt className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="font-semibold text-slate-800 text-sm">No sales recorded yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Use the Point of Sale counter to record customer purchases. Stock will automatically be adjusted.
            </p>
            <button
              onClick={() => setRetailerView('sales')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition"
            >
              Record First Sale
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
