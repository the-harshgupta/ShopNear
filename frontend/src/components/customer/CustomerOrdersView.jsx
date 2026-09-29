import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Clock, CheckCircle2, PackageCheck, AlertCircle, ShoppingBag, MapPin, RefreshCw, Sparkles, Timer, Star } from 'lucide-react';
import StoreRatingModal from './StoreRatingModal';

export default function CustomerOrdersView() {
  const { orders, selectedStore, refreshOrders } = useStore();
  const [ratingOrder, setRatingOrder] = useState(null);
  const [localRatedOrderIds, setLocalRatedOrderIds] = useState(new Set());

  const getStatusBadge = (status, estimatedTime) => {
    switch (status) {
      case 'PICKED_UP':
      case 'COMPLETED':
        return (
          <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-3 py-1.5 rounded-full flex items-center space-x-1.5 border border-emerald-300 shadow-sm">
            <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>✓ Order Picked Up</span>
          </span>
        );
      case 'READY_FOR_PICKUP':
        return (
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center space-x-1.5 border border-emerald-300 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ready for Pickup at Counter #3</span>
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="bg-sky-100 text-sky-900 text-xs font-bold px-3 py-1.5 rounded-full flex items-center space-x-1.5 border border-sky-300 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
            <span>Store Packing &bull; Ready in {estimatedTime || '15 mins'}</span>
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1.5 rounded-full flex items-center space-x-1.5 border border-amber-300">
            <Timer className="w-3.5 h-3.5 text-amber-600 animate-spin" />
            <span>Order Placed &bull; Waiting for Store Acceptance</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-sky-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Clock className="w-4 h-4" />
            <span>Express Store Reservations</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">My In-Store Pre-Orders</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track packaging progress, check expected ready time, and show your pickup token at the counter.
          </p>
        </div>

        {refreshOrders && (
          <button
            onClick={() => refreshOrders()}
            className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Status</span>
          </button>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">No active store pre-orders</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            When you add items to cart and reserve them, your instant pickup token and live status will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className={`bg-white rounded-2xl border p-5 shadow-sm space-y-4 transition ${
                order.status === 'READY_FOR_PICKUP'
                  ? 'border-emerald-300 ring-2 ring-emerald-100'
                  : order.status === 'ACCEPTED'
                  ? 'border-sky-300 ring-2 ring-sky-100'
                  : 'border-slate-200'
              }`}
            >
              {/* Top Row: Order info & Status Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-base text-slate-900">{order.orderNumber}</span>
                    <span className="text-xs text-slate-400">&bull; {order.createdAt}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Customer: <span className="font-medium text-slate-700">{order.customerName}</span> ({order.customerPhone})
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {getStatusBadge(order.status, order.estimatedPickupTime)}
                </div>
              </div>

              {/* Status Message Highlight Box */}
              {order.status === 'PENDING' && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center space-x-3 text-xs text-amber-900">
                  <div className="p-2 bg-amber-100 rounded-lg text-amber-700 shrink-0">
                    <Clock className="w-4 h-4 animate-spin" />
                  </div>
                  <div>
                    <div className="font-bold">Order Sent to Shopkeeper</div>
                    <p className="text-amber-700 text-[11px] mt-0.5">
                      The store staff is reviewing your order and will confirm the expected preparation time in a moment.
                    </p>
                  </div>
                </div>
              )}

              {order.status === 'ACCEPTED' && (
                <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs text-sky-950">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-sky-500 text-white rounded-lg shrink-0 shadow-sm">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-sky-900 flex items-center space-x-1.5">
                        <span>Order Accepted &amp; Being Packed</span>
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      </div>
                      <p className="text-sky-700 text-[11px] mt-0.5">
                        Estimated Ready Time: <span className="font-bold text-sky-950 underline">{order.estimatedPickupTime || '15 mins'}</span>. You can head towards the store counter around this time!
                      </p>
                    </div>
                  </div>

                  <div className="hidden sm:block text-right shrink-0 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-sky-200">
                    <div className="text-[10px] uppercase font-bold text-sky-600 tracking-wider">Ready in approx</div>
                    <div className="text-sm font-extrabold text-sky-950">{order.estimatedPickupTime || '15 mins'}</div>
                  </div>
                </div>
              )}

              {order.status === 'READY_FOR_PICKUP' && (
                <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 flex items-center space-x-3 text-xs text-emerald-950">
                  <div className="p-2 bg-emerald-600 text-white rounded-lg shrink-0 shadow-sm">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-emerald-900">Your Groceries are Packed and Ready!</div>
                    <p className="text-emerald-700 text-[11px] mt-0.5">
                      Please head over to <strong>Counter #3</strong> and show your Express Token below to collect your items.
                    </p>
                  </div>
                </div>
              )}

              {(order.status === 'PICKED_UP' || order.status === 'COMPLETED') && (
                <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 flex items-center space-x-3 text-xs text-emerald-950">
                  <div className="p-2 bg-emerald-600 text-white rounded-lg shrink-0 shadow-sm">
                    <PackageCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-emerald-900">Order Successfully Picked Up!</div>
                    <p className="text-emerald-700 text-[11px] mt-0.5">
                      Handed over by store staff {order.pickedUpAtFormatted ? `(${order.pickedUpAtFormatted})` : ''}. Thank you for shopping with {selectedStore?.name || 'us'}!
                    </p>
                  </div>
                </div>
              )}

              {/* Pickup Token Card */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                <div className="space-y-0.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                    Express Pickup Token
                  </div>
                  <div className="text-2xl font-mono font-extrabold text-white tracking-widest">
                    {order.pickupCode}
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Show at Counter #3 &bull; {selectedStore?.name} ({selectedStore?.branch})
                  </div>
                </div>

                <div className="text-right sm:border-l sm:border-slate-700 sm:pl-6">
                  <div className="text-[10px] text-slate-400">Total Bill Amount</div>
                  <div className="text-xl font-bold text-white">₹{order.totalAmount}</div>
                  <div className="text-[10px] text-emerald-400 font-semibold">Pay at pickup / Prepaid</div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2 pt-1">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Reserved Items ({order.items.length})
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">{item.productName}</div>
                        <div className="text-[10px] text-slate-500 flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-sky-600" />
                          <span>{item.aisle}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-800">x{item.quantity}</span>
                        <div className="text-[11px] text-slate-500">₹{item.unitPrice * item.quantity}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rating Section - Strictly available only when order is picked up */}
              <div className="pt-2 border-t border-slate-100">
                {order.status === 'PICKED_UP' || order.status === 'COMPLETED' ? (
                  (order.isRated || localRatedOrderIds.has(order.id)) ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2 text-emerald-900 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Rating Submitted! Thank you for reviewing this store.</span>
                      </div>
                      <span className="bg-white border border-emerald-200 text-emerald-800 font-bold px-3 py-1 rounded-lg text-xs flex items-center space-x-1 shadow-xs shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>Rating Submitted ✓</span>
                      </span>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-amber-50 to-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                          <span>Rate your store pickup experience!</span>
                        </div>
                        <p className="text-slate-600 text-[11px]">
                          Your order has been physically picked up. Rate {selectedStore?.name || 'this store'} to help local shoppers.
                        </p>
                      </div>
                      <button
                        onClick={() => setRatingOrder(order)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition flex items-center justify-center space-x-1.5 shrink-0"
                      >
                        <Star className="w-3.5 h-3.5 fill-white text-white" />
                        <span>Rate Your Experience</span>
                      </button>
                    </div>
                  )
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Store rating unlocks automatically after order is physically picked up at the counter.</span>
                    </span>
                    <span className="font-semibold text-slate-400 hidden sm:inline">Pickup Required</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Store Rating & Review Modal */}
      {ratingOrder && (
        <StoreRatingModal
          isOpen={!!ratingOrder}
          onClose={() => setRatingOrder(null)}
          order={ratingOrder}
          storeId={ratingOrder.storeId || selectedStore?.id}
          storeName={selectedStore?.name || 'Store'}
          onRatingSubmitted={() => {
            setLocalRatedOrderIds(prev => new Set(prev).add(ratingOrder.id));
            if (refreshOrders) refreshOrders();
          }}
        />
      )}
    </div>
  );
}
