import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  X, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  Clock, 
  CheckCircle, 
  MapPin, 
  ArrowRight,
  ShieldCheck,
  QrCode,
  CreditCard,
  DollarSign,
  AlertTriangle,
  AlertCircle,
  RotateCcw
} from 'lucide-react';

export default function CartDrawer() {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    updateCartQuantity, 
    removeFromCart, 
    checkoutStorePickup,
    setCustomerView,
    selectedStore
  } = useStore();

  const [customerName, setCustomerName] = useState('Akash Sharma');
  const [customerPhone, setCustomerPhone] = useState('+91 98765 43210');
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState('CART'); // 'CART' | 'PAYMENT'
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' | 'CARD' | 'CASH'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [paymentFailedNotice, setPaymentFailedNotice] = useState(null);

  if (!isCartOpen) return null;

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setCheckoutError(null);
    setPaymentFailedNotice(null);
    setCheckoutStep('PAYMENT');
  };

  const handlePaymentSuccess = async () => {
    setIsSubmitting(true);
    setCheckoutError(null);
    setPaymentFailedNotice(null);
    try {
      const order = await checkoutStorePickup(
        { name: customerName, phone: customerPhone },
        { method: paymentMethod }
      );
      setConfirmedOrder(order);
      setCheckoutStep('CONFIRMED');
    } catch (err) {
      setCheckoutError(err.message || 'Checkout failed due to stock availability or server error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentFailure = () => {
    setPaymentFailedNotice('Payment simulation failed / cancelled. Inventory stock in MySQL remains untouched, and no order was generated.');
    setCheckoutError(null);
  };

  const handleClose = () => {
    setIsCartOpen(false);
    setConfirmedOrder(null);
    setCheckoutStep('CART');
    setCheckoutError(null);
    setPaymentFailedNotice(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-slide-left">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-base">
              {checkoutStep === 'PAYMENT' ? 'Select Payment Method' : 'In-Store Pre-Order Cart'}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {checkoutStep === 'CONFIRMED' && confirmedOrder ? (
            /* Confirmation Screen */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900">Payment Confirmed &amp; Order Placed!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Inventory has been safely reserved and deducted in <strong>{selectedStore?.name}</strong>.
                </p>
              </div>

              {/* Express Pickup Code Token */}
              <div className="bg-slate-50 border-2 border-dashed border-sky-300 rounded-2xl p-5 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Your Express Pickup Token
                </div>
                <div className="text-3xl font-mono font-extrabold text-sky-700 tracking-wider">
                  {confirmedOrder.pickupCode}
                </div>
                <div className="text-xs text-slate-500">
                  Order ID: <span className="font-semibold">{confirmedOrder.orderNumber}</span> &bull; Total: <span className="font-bold text-slate-900">₹{confirmedOrder.totalAmount}</span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-left text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center space-x-1.5 text-amber-950">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pickup Instructions:</span>
                </div>
                <p className="text-amber-800">
                  Show this token at <strong>Counter #3 (Express Pickups)</strong> upon arrival at {selectedStore?.name}.
                </p>
              </div>

              {/* Pickup & Rating Notice (Rating available only after physical pickup) */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-left space-y-1">
                <div className="text-xs font-bold text-emerald-900 flex items-center space-x-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Order Reserved &bull; Rating Available After Pickup</span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  Collect your items at Counter #3. Once the shopkeeper hands over your order and marks it as <strong>Picked Up</strong>, you will become eligible to rate this store in the <strong>My Orders</strong> tab.
                </p>
              </div>

              <button
                onClick={() => {
                  handleClose();
                  setCustomerView('orders');
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5"
              >
                <span>Track Live Order Status</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : checkoutStep === 'PAYMENT' ? (
            /* Payment Gateway Screen */
            <div className="space-y-4 py-2">
              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 text-xs space-y-2">
                <div className="font-bold text-sky-950 flex items-center justify-between">
                  <span>Store: {selectedStore?.name}</span>
                  <span className="text-sm font-mono font-extrabold text-sky-900">₹{totalAmount}</span>
                </div>
                <p className="text-sky-700 text-[11px]">
                  Customer: <strong>{customerName}</strong> ({customerPhone})
                </p>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Select Payment Option:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center space-y-1.5 ${
                      paymentMethod === 'UPI' 
                        ? 'border-sky-500 bg-sky-50 text-sky-900 ring-2 ring-sky-500/20' 
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-sky-600" />
                    <span>UPI QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center space-y-1.5 ${
                      paymentMethod === 'CARD' 
                        ? 'border-sky-500 bg-sky-50 text-sky-900 ring-2 ring-sky-500/20' 
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-indigo-600" />
                    <span>Cards</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CASH')}
                    className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center space-y-1.5 ${
                      paymentMethod === 'CASH' 
                        ? 'border-sky-500 bg-sky-50 text-sky-900 ring-2 ring-sky-500/20' 
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                    <span>Cash on Pickup</span>
                  </button>
                </div>
              </div>

              {/* UPI Visual */}
              {paymentMethod === 'UPI' && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-2">
                  <div className="text-xs font-semibold text-slate-700">Scan &amp; Pay via any UPI App</div>
                  <div className="w-32 h-32 bg-white border border-slate-200 rounded-xl p-1 mx-auto flex items-center justify-center shadow-xs">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=upi://pay?pa=${encodeURIComponent(selectedStore?.upiId || 'store@upi')}%26pn=${encodeURIComponent(selectedStore?.name || 'RetailStore')}%26am=${totalAmount}%26cu=INR`}
                      alt="UPI QR"
                      className="w-full h-full"
                    />
                  </div>
                  <div className="text-[11px] font-mono text-slate-500">{selectedStore?.upiId || 'store@upi'}</div>
                </div>
              )}

              {/* Error Alert */}
              {checkoutError && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-900 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold">Purchase Rejected:</div>
                    <p>{checkoutError}</p>
                  </div>
                </div>
              )}

              {/* Payment Failure Simulation Notice */}
              {paymentFailedNotice && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold">Payment Simulation Notice:</div>
                    <p>{paymentFailedNotice}</p>
                  </div>
                </div>
              )}

              {/* Payment Action Simulation Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={handlePaymentSuccess}
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-3 rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center space-x-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isSubmitting ? 'Processing Payment & Verifying Stock...' : `Complete Payment (Success) • ₹${totalAmount}`}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePaymentFailure}
                  disabled={isSubmitting}
                  className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Simulate Payment Failure / Cancel</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCheckoutStep('CART');
                    setCheckoutError(null);
                    setPaymentFailedNotice(null);
                  }}
                  className="w-full text-slate-500 hover:text-slate-800 py-1 text-xs font-semibold text-center"
                >
                  &larr; Back to Cart Items
                </button>
              </div>
            </div>
          ) : cart.length === 0 ? (
            /* Empty Cart */
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-slate-800 text-sm">Your cart is empty</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Add items to reserve them from live shelf inventory for quick store pickup.
              </p>
            </div>
          ) : (
            /* Cart Items List */
            <div className="space-y-3 divide-y divide-slate-100">
              {cart.map((item) => (
                <div key={item.productId} className="pt-3 first:pt-0 flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover bg-slate-100 shrink-0"
                    />
                    <div className="min-w-0 pr-2">
                      <div className="font-semibold text-xs text-slate-900 truncate" title={item.name}>
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        ₹{item.price} &bull; <span className="text-sky-700 font-medium">{item.aisle}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity & Delete */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                      <button
                        onClick={() => updateCartQuantity(item.productId, -1)}
                        className="p-1 text-slate-600 hover:bg-slate-200 rounded-l-md transition"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-bold text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.productId, 1)}
                        className="p-1 text-slate-600 hover:bg-slate-200 rounded-r-md transition"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer / Checkout */}
        {checkoutStep === 'CART' && cart.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
                <span>₹{totalAmount}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Express In-Store Bagging</span>
                <span className="text-emerald-600 font-semibold">FREE</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-200">
                <span>Total Amount</span>
                <span>₹{totalAmount}</span>
              </div>
            </div>

            {/* Customer Details Form */}
            <form onSubmit={handleProceedToPayment} className="space-y-2 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500"
                />
                <input
                  type="tel"
                  required
                  placeholder="Mobile Number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center space-x-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Proceed to Payment (₹{totalAmount})</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

