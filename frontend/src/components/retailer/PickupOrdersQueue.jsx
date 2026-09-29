import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Clock, CheckCircle2, PackageCheck, MapPin, Search, User, Phone, Check, Bell, AlertTriangle, Sparkles, X, ChevronRight, Timer } from 'lucide-react';

export default function PickupOrdersQueue() {
  const { orders, updateOrderStatus, refreshOrders } = useStore();
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'PENDING' | 'ACCEPTED' | 'READY_FOR_PICKUP' | 'COMPLETED'
  const [searchCode, setSearchCode] = useState('');

  // Modal State for accepting order and setting expected pickup time
  const [acceptingOrder, setAcceptingOrder] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState('15 mins');
  const [customTimeInput, setCustomTimeInput] = useState('');

  const TIME_PRESETS = [
    { label: '10 Mins', value: '10 mins', desc: 'Quick pack (1-2 items)' },
    { label: '15 Mins', value: '15 mins', desc: 'Standard preparation' },
    { label: '25 Mins', value: '25 mins', desc: 'Medium cart / Busy rush' },
    { label: '40 Mins', value: '40 mins', desc: 'Large grocery order' },
    { label: '1 Hour', value: '1 hour', desc: 'Peak supermarket hours' }
  ];

  const handleOpenAcceptModal = (order) => {
    setAcceptingOrder(order);
    setSelectedPreset('15 mins');
    // Calculate an approximate clock time for convenience
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setCustomTimeInput(`15 mins (${timeStr})`);
  };

  const handleSelectPreset = (val) => {
    setSelectedPreset(val);
    const mins = parseInt(val) || 15;
    const now = new Date();
    now.setMinutes(now.getMinutes() + mins);
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setCustomTimeInput(`${val} (approx ${timeStr})`);
  };

  const handleConfirmAccept = () => {
    if (!acceptingOrder) return;
    const finalTime = customTimeInput.trim() || selectedPreset || '15 mins';
    updateOrderStatus(acceptingOrder.id, 'ACCEPTED', finalTime);
    setAcceptingOrder(null);
  };

  const pendingCount = orders.filter(o => o.status === 'PENDING').length;
  const acceptedCount = orders.filter(o => o.status === 'ACCEPTED').length;
  const readyCount = orders.filter(o => o.status === 'READY_FOR_PICKUP').length;
  const completedCount = orders.filter(o => o.status === 'PICKED_UP' || o.status === 'COMPLETED').length;

  const filteredOrders = orders.filter(order => {
    const isCompletedStatus = order.status === 'PICKED_UP' || order.status === 'COMPLETED';
    const matchesStatus = filterStatus === 'ALL' || 
      (filterStatus === 'PICKED_UP' || filterStatus === 'COMPLETED' ? isCompletedStatus : order.status === filterStatus);
    const matchesSearch = searchCode === '' ||
      order.orderNumber?.toLowerCase().includes(searchCode.toLowerCase()) ||
      order.pickupCode?.toLowerCase().includes(searchCode.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchCode.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Clock className="w-4 h-4" />
            <span>Store Order Desk &amp; Pickup Manager</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">In-Store Express Orders Queue</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Accept customer orders, set expected preparation time, pack shelf items, and hand over at counter.
          </p>
        </div>

        {/* Filter Badges / Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 rounded-lg transition ${filterStatus === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            All ({orders.length})
          </button>

          <button
            onClick={() => setFilterStatus('PENDING')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${filterStatus === 'PENDING' ? 'bg-amber-500 text-white shadow-sm' : 'text-amber-700 hover:bg-amber-100'}`}
          >
            {pendingCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-200 animate-ping"></span>}
            <span>New Requests ({pendingCount})</span>
          </button>

          <button
            onClick={() => setFilterStatus('ACCEPTED')}
            className={`px-3 py-1.5 rounded-lg transition ${filterStatus === 'ACCEPTED' ? 'bg-sky-600 text-white shadow-sm' : 'text-sky-700 hover:bg-sky-100'}`}
          >
            Packing / In-Prep ({acceptedCount})
          </button>

          <button
            onClick={() => setFilterStatus('READY_FOR_PICKUP')}
            className={`px-3 py-1.5 rounded-lg transition ${filterStatus === 'READY_FOR_PICKUP' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-700 hover:bg-emerald-100'}`}
          >
            Ready at Counter ({readyCount})
          </button>

          <button
            onClick={() => setFilterStatus('PICKED_UP')}
            className={`px-3 py-1.5 rounded-lg transition ${filterStatus === 'PICKED_UP' || filterStatus === 'COMPLETED' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Picked Up ({completedCount})
          </button>
        </div>
      </div>

      {/* Pending Banner Alert if there are orders waiting for manual acceptance */}
      {pendingCount > 0 && filterStatus !== 'PENDING' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between text-xs text-amber-900 shadow-sm">
          <div className="flex items-center space-x-2.5">
            <span className="p-1.5 bg-amber-200 rounded-lg text-amber-900">
              <Bell className="w-4 h-4" />
            </span>
            <div>
              <span className="font-bold">{pendingCount} new order{pendingCount > 1 ? 's' : ''} waiting for store acceptance!</span>
              <p className="text-amber-700 text-[11px] mt-0.5">Please review the order and give an expected preparation time to the customer.</p>
            </div>
          </div>
          <button
            onClick={() => setFilterStatus('PENDING')}
            className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg font-bold shadow-sm transition"
          >
            View New Requests
          </button>
        </div>
      )}

      {/* Search by Token / Customer */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
          placeholder="Lookup by Pickup Token (e.g. 'PKP-721'), Order ID, or Customer Name..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 text-slate-900 shadow-sm"
        />
      </div>

      {/* Order List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <div className="font-semibold text-slate-700 text-sm">No orders matching this filter</div>
            <p className="text-xs text-slate-400 mt-1">Try selecting 'All' or clearing your search term.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className={`bg-white rounded-2xl border p-5 shadow-sm space-y-4 transition ${
                order.status === 'PENDING'
                  ? 'border-amber-300 ring-2 ring-amber-100'
                  : order.status === 'ACCEPTED'
                  ? 'border-sky-200 bg-sky-50/20'
                  : 'border-slate-200'
              }`}
            >
              {/* Header row of order card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-slate-900 text-white font-mono font-bold text-sm px-3 py-1 rounded-lg">
                    {order.pickupCode}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-sm">{order.orderNumber}</span>
                      <span className="text-[11px] text-slate-400">&bull; {order.createdAt}</span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center space-x-2 mt-0.5">
                      <span className="flex items-center space-x-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span className="font-medium text-slate-700">{order.customerName}</span>
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center space-x-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{order.customerPhone}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Action Buttons */}
                <div className="flex items-center space-x-2">
                  {order.status === 'PENDING' && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenAcceptModal(order)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition flex items-center space-x-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Accept &amp; Give Expected Time</span>
                      </button>
                    </div>
                  )}

                  {order.status === 'ACCEPTED' && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateOrderStatus(order.id, 'READY_FOR_PICKUP')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition flex items-center space-x-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark as Packed &amp; Ready</span>
                      </button>
                      <button
                        onClick={() => handleOpenAcceptModal(order)}
                        className="text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold px-2.5 py-2 rounded-xl transition"
                      >
                        Edit Time
                      </button>
                    </div>
                  )}

                  {order.status === 'READY_FOR_PICKUP' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'PICKED_UP')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-sm"
                    >
                      <PackageCheck className="w-4 h-4" />
                      <span>Mark as Picked Up</span>
                    </button>
                  )}

                  {(order.status === 'PICKED_UP' || order.status === 'COMPLETED') && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full flex items-center space-x-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>✓ Picked Up</span>
                      </span>
                      {order.pickedUpAtFormatted && (
                        <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                          ({order.pickedUpAtFormatted})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Order Status Notification Banner */}
              {order.status === 'PENDING' && (
                <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 flex items-center justify-between text-xs text-amber-900">
                  <div className="flex items-center space-x-2">
                    <Timer className="w-4 h-4 text-amber-600" />
                    <span><strong>Pending Store Acceptance:</strong> Customer is waiting for confirmation &amp; pickup time estimate.</span>
                  </div>
                  <button
                    onClick={() => handleOpenAcceptModal(order)}
                    className="text-amber-900 font-bold underline hover:text-amber-950 text-xs ml-2 shrink-0"
                  >
                    Accept Now &rarr;
                  </button>
                </div>
              )}

              {order.status === 'ACCEPTED' && (
                <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 flex items-center justify-between text-xs text-sky-900">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-sky-600" />
                    <span>
                      <strong>Order Accepted &amp; In Preparation</strong> &bull; Customer notified expected ready time: <strong className="text-sky-950 font-bold bg-sky-100 px-2 py-0.5 rounded">{order.estimatedPickupTime || '15 mins'}</strong>
                    </span>
                  </div>
                  <span className="text-sky-700 text-[11px] font-medium hidden sm:inline">Pack items from shelves below</span>
                </div>
              )}

              {order.status === 'READY_FOR_PICKUP' && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center space-x-2 text-xs text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    <strong>Packed &amp; Ready at Counter #3:</strong> Waiting for customer to present Token <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-emerald-200">{order.pickupCode}</span>.
                  </span>
                </div>
              )}

              {(order.status === 'PICKED_UP' || order.status === 'COMPLETED') && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs text-slate-700">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>
                      <strong>Order Picked Up &amp; Handed Over:</strong> Customer has received items and is now eligible to rate this store.
                    </span>
                  </div>
                  {order.pickedUpAtFormatted && (
                    <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {order.pickedUpAtFormatted}
                    </span>
                  )}
                </div>
              )}

              {/* Shelf Item Picking Checklist for Staff */}
              <div>
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Items to Pick from Store Shelves ({order.items.length}):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl text-xs flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-slate-900 line-clamp-1">{item.productName}</div>
                        <div className="text-[10px] text-sky-700 flex items-center space-x-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          <span>{item.aisle}</span>
                        </div>
                      </div>
                      <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800">
                        x{item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center text-xs text-slate-500 border-t border-slate-100">
                <span>Placed: {order.createdAt}</span>
                <span className="font-bold text-slate-900 text-sm">Total: ₹{order.totalAmount}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Accept Order & Set Expected Time Modal */}
      {acceptingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Accept Order &amp; Set Expected Time</h3>
                  <p className="text-xs text-slate-400">Order {acceptingOrder.orderNumber} &bull; {acceptingOrder.customerName}</p>
                </div>
              </div>
              <button
                onClick={() => setAcceptingOrder(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Order Summary Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{acceptingOrder.items.length} Item{acceptingOrder.items.length > 1 ? 's' : ''} to pack</div>
                  <div className="text-slate-500 mt-0.5">Customer: {acceptingOrder.customerName} ({acceptingOrder.customerPhone})</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900 text-sm">₹{acceptingOrder.totalAmount}</div>
                  <div className="text-emerald-600 font-semibold text-[11px]">Token: {acceptingOrder.pickupCode}</div>
                </div>
              </div>

              {/* Preset preparation times */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Select Estimated Preparation Time:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TIME_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => handleSelectPreset(preset.value)}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                        selectedPreset === preset.value
                          ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold ring-2 ring-emerald-400/30'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span className="text-xs font-bold">{preset.label}</span>
                      <span className="text-[10px] text-slate-500 font-normal mt-1">{preset.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Time or Note Input */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Expected Time / Message to Customer:
                </label>
                <input
                  type="text"
                  value={customTimeInput}
                  onChange={(e) => setCustomTimeInput(e.target.value)}
                  placeholder="e.g. 15 mins (approx 06:30 PM), Ready by 5:45 PM"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  The customer will see this estimated time immediately on their live order screen.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 px-6 border-t border-slate-100 flex items-center justify-end space-x-3">
              <button
                onClick={() => setAcceptingOrder(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAccept}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition flex items-center space-x-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Confirm &amp; Notify Customer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
