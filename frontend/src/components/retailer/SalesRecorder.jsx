import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle2, 
  Search, 
  User, 
  Phone, 
  ArrowRight,
  Receipt,
  RotateCcw,
  ScanBarcode,
  CreditCard,
  QrCode,
  DollarSign,
  Printer,
  Sparkles,
  Layers,
  Store,
  Clock
} from 'lucide-react';

export default function SalesRecorder() {
  const { products, recordStoreSale, setRetailerView, showNotification, selectedStore } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [completedSale, setCompletedSale] = useState(null);
  const [paymentMode, setPaymentMode] = useState('CASH'); // 'CASH' | 'UPI' | 'CARD'
  const [cashTendered, setCashTendered] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);

  const barcodeInputRef = useRef(null);

  // Play audio beep when barcode is successfully scanned
  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // 880 Hz beep
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {}
  };

  const availableProducts = products.filter(p => 
    p.currentStock > 0 && 
    (searchQuery === '' || 
     p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     p.barcode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     p.category?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const addItemToSale = (product) => {
    const existing = selectedItems.find(i => i.storeProductId === product.id);
    if (existing) {
      if (existing.quantity >= product.currentStock) {
        showNotification(`Only ${product.currentStock} units available in stock`, 'warning');
        return;
      }
      setSelectedItems(prev => prev.map(i => 
        i.storeProductId === product.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setSelectedItems(prev => [
        ...prev,
        {
          storeProductId: product.id,
          productName: product.name,
          barcode: product.barcode || '',
          unitPrice: product.price,
          unit: product.unit,
          quantity: 1,
          maxStock: product.currentStock
        }
      ]);
    }
  };

  // Barcode Scanner Handler (Hardware USB gun or typed)
  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const query = barcodeInput.trim().toLowerCase();
    const matched = products.find(p => 
      (p.barcode && p.barcode.toLowerCase() === query) ||
      p.name.toLowerCase().includes(query)
    );

    if (matched) {
      if (matched.currentStock <= 0) {
        showNotification(`"${matched.name}" is OUT OF STOCK`, 'warning');
      } else {
        addItemToSale(matched);
        playBeep();
        showNotification(`Scanned: ${matched.name} (₹${matched.price})`, 'success');
      }
    } else {
      showNotification(`No product matched barcode "${barcodeInput}"`, 'warning');
    }

    setBarcodeInput('');
    if (barcodeInputRef.current) barcodeInputRef.current.focus();
  };

  const updateQuantity = (storeProductId, delta) => {
    setSelectedItems(prev => prev.map(item => {
      if (item.storeProductId === storeProductId) {
        const newQty = item.quantity + delta;
        if (newQty <= 0) return null;
        if (newQty > item.maxStock) {
          showNotification(`Maximum available stock is ${item.maxStock}`, 'warning');
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(Boolean));
  };

  const removeItem = (storeProductId) => {
    setSelectedItems(prev => prev.filter(i => i.storeProductId !== storeProductId));
  };

  const totalAmount = selectedItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const changeToReturn = cashTendered ? Math.max(0, Number(cashTendered) - totalAmount) : 0;

  // Complete Sale and generate tax bill
  const handleCompleteSale = async (e) => {
    if (e) e.preventDefault();
    if (selectedItems.length === 0) {
      showNotification('Please scan or add at least one product', 'warning');
      return;
    }

    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const saleResult = await recordStoreSale({
      customerName: customerName.trim() || 'Walk-in Customer',
      customerPhone: customerPhone.trim(),
      items: selectedItems
    });

    setCompletedSale({
      ...saleResult,
      invoiceNumber,
      paymentMode,
      cashTendered: Number(cashTendered) || totalAmount,
      changeToReturn: changeToReturn,
      items: selectedItems,
      storeName: selectedStore?.name || 'Retail Store',
      storeAddress: selectedStore?.address || 'Main Market',
      storePhone: selectedStore?.phone || '+91 98765 43210',
      storeUpi: selectedStore?.upiId || 'store@upi'
    });

    setSelectedItems([]);
    setCustomerName('');
    setCustomerPhone('');
    setCashTendered('');
  };

  const handleStartNewSale = () => {
    setCompletedSale(null);
    setSelectedItems([]);
    setCashTendered('');
    if (barcodeInputRef.current) barcodeInputRef.current.focus();
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  // Sample barcode shortcut chips for instant testing
  const sampleBarcodes = products.filter(p => p.barcode && p.currentStock > 0).slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">
            <ScanBarcode className="w-4 h-4" />
            <span>Barcode POS Billing Terminal</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Scan Barcode &amp; Issue Retail Bill</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Instant barcode scanning, dynamic UPI QR billing, and auto stock adjustment for <strong>{selectedStore?.name}</strong>.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setRetailerView('sales_history')}
            className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition"
          >
            Sales History &rarr;
          </button>
        </div>
      </div>

      {completedSale ? (
        /* Printable Thermal Receipt / Tax Invoice Modal */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl max-w-md mx-auto space-y-6">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Payment Completed &bull; Stock Updated
            </span>
            <h3 className="text-lg font-bold text-slate-900 pt-1">{completedSale.storeName}</h3>
            <p className="text-[11px] text-slate-500">{completedSale.storeAddress}</p>
            <p className="text-[11px] text-slate-400">Phone: {completedSale.storePhone}</p>
          </div>

          {/* Thermal Receipt Body */}
          <div className="border-t-2 border-b-2 border-dashed border-slate-200 py-4 space-y-3 font-mono text-xs">
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>Invoice: <strong>{completedSale.invoiceNumber}</strong></span>
              <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>Customer: <strong className="text-slate-800">{completedSale.customerName}</strong></span>
              <span>Mode: <strong>{completedSale.paymentMode}</strong></span>
            </div>

            {/* Items Table */}
            <div className="border-t border-slate-200 pt-2 space-y-1.5">
              <div className="flex justify-between font-bold text-slate-700 text-[11px] pb-1 border-b border-slate-100">
                <span>ITEM</span>
                <span>QTY x RATE</span>
                <span>AMT</span>
              </div>
              {completedSale.items?.map((it, idx) => (
                <div key={idx} className="flex justify-between text-slate-800">
                  <span className="truncate max-w-[150px]">{it.productName}</span>
                  <span className="text-slate-500">{it.quantity} x ₹{it.unitPrice}</span>
                  <span className="font-bold">₹{it.quantity * it.unitPrice}</span>
                </div>
              ))}
            </div>

            {/* Total and Change */}
            <div className="border-t border-slate-200 pt-2 space-y-1">
              <div className="flex justify-between text-base font-bold text-slate-900">
                <span>TOTAL AMOUNT:</span>
                <span className="text-emerald-700 font-bold">₹{completedSale.totalAmount}</span>
              </div>
              {completedSale.paymentMode === 'CASH' && completedSale.cashTendered > completedSale.totalAmount && (
                <>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Cash Tendered:</span>
                    <span>₹{completedSale.cashTendered}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-emerald-700 font-bold">
                    <span>Change Returned:</span>
                    <span>₹{completedSale.changeToReturn}</span>
                  </div>
                </>
              )}
            </div>

            <div className="text-center pt-2 text-[10px] text-slate-400">
              *** Thank You for Shopping! ***
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-1">
            <button
              onClick={handlePrintReceipt}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs shadow-sm transition flex items-center justify-center space-x-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print Bill (🖨️ Thermal / A4)</span>
            </button>
            <button
              onClick={handleStartNewSale}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition flex items-center space-x-1"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Next Bill</span>
            </button>
          </div>
        </div>
      ) : (
        /* Active Billing Layout */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Barcode Scanner Gun & Catalog */}
          <div className="lg:col-span-2 space-y-4">
            {/* Dedicated Barcode Gun Scanner Input Bar */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-4 rounded-2xl border border-slate-800 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ScanBarcode className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Active Barcode Scanner Gun
                  </span>
                </div>
                <span className="text-[10px] bg-emerald-900/80 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700 font-medium">
                  ⚡ Auto-Detect Enter Key
                </span>
              </div>

              <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    ref={barcodeInputRef}
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="Scan product barcode (or type barcode & press Enter)..."
                    className="w-full px-4 py-2.5 bg-slate-800/90 text-white placeholder:text-slate-400 border border-slate-700 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-slate-900"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm flex items-center space-x-1.5"
                >
                  <span>Scan &amp; Add</span>
                </button>
              </form>

              {/* Sample Barcode Simulation Chips for testing */}
              {sampleBarcodes.length > 0 && (
                <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="text-slate-400">Quick Test Barcodes:</span>
                  {sampleBarcodes.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        addItemToSale(p);
                        playBeep();
                        showNotification(`Scanned: ${p.name}`, 'success');
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700 font-mono transition flex items-center space-x-1"
                    >
                      <ScanBarcode className="w-3 h-3 text-emerald-400" />
                      <span>{p.name.split(' ')[0]} ({p.barcode || 'Scan'})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search Input for Manual Selection */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Or search items manually (e.g. 'atta', 'milk', 'oil')..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 text-slate-900"
              />
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {availableProducts.map(product => (
                <div
                  key={product.id}
                  onClick={() => {
                    addItemToSale(product);
                    playBeep();
                  }}
                  className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm hover:border-emerald-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{product.name}</h4>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center justify-between">
                      <span>{product.unit} &bull; Stock: <strong className="text-emerald-700">{product.currentStock}</strong></span>
                      {product.barcode && <span className="font-mono text-[9px] bg-slate-100 px-1.5 rounded">{product.barcode}</span>}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">₹{product.price}</span>
                    <button
                      type="button"
                      className="bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white px-2 py-1 rounded-lg text-[11px] font-bold transition flex items-center space-x-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {availableProducts.length === 0 && (
              <div className="bg-white rounded-2xl p-8 text-center text-xs text-slate-500 border border-slate-200">
                No available in-stock products matching "{searchQuery}".
              </div>
            )}
          </div>

          {/* Right Col: Bill / Receipt Summary & Payment Gateway */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  <span>Current Bill</span>
                </h3>
                <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded">
                  {selectedItems.length} items ({selectedItems.reduce((s, i) => s + i.quantity, 0)} units)
                </span>
              </div>

              {/* Customer Info (Optional) */}
              <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex items-center space-x-2">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Customer Name (optional)"
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Mobile / WhatsApp (optional)"
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Scanned Items List */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {selectedItems.map(item => (
                  <div key={item.storeProductId} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="font-bold text-slate-900 truncate">{item.productName}</div>
                      <div className="text-[10px] text-slate-400 flex items-center space-x-2">
                        <span>₹{item.unitPrice} each</span>
                        {item.barcode && <span className="font-mono text-[9px] bg-slate-200 px-1 rounded">{item.barcode}</span>}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-white">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.storeProductId, -1)}
                          className="p-1 hover:bg-slate-100 rounded-l"
                        >
                          <Minus className="w-3 h-3 text-slate-600" />
                        </button>
                        <span className="px-2 font-mono font-bold text-slate-800">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.storeProductId, 1)}
                          className="p-1 hover:bg-slate-100 rounded-r"
                        >
                          <Plus className="w-3 h-3 text-slate-600" />
                        </button>
                      </div>

                      <span className="font-bold text-slate-900 w-12 text-right">
                        ₹{item.unitPrice * item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeItem(item.storeProductId)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {selectedItems.length === 0 && (
                  <div className="text-center py-6 text-xs text-slate-400 space-y-1">
                    <ScanBarcode className="w-6 h-6 mx-auto text-slate-300" />
                    <p>Scan product barcode or click items on the left to start billing.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method Selector & Checkout Section */}
            <div className="border-t border-slate-100 pt-3 space-y-3">
              {/* Total Display */}
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-500 font-semibold">Total Bill Amount</span>
                <span className="text-2xl font-bold font-mono text-slate-900">₹{totalAmount}</span>
              </div>

              {/* Payment Mode Tabs */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setPaymentMode('CASH')}
                  className={`py-1.5 rounded-lg transition flex items-center justify-center space-x-1 ${
                    paymentMode === 'CASH' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Cash</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode('UPI')}
                  className={`py-1.5 rounded-lg transition flex items-center justify-center space-x-1 ${
                    paymentMode === 'UPI' ? 'bg-white text-sky-800 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>UPI QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode('CARD')}
                  className={`py-1.5 rounded-lg transition flex items-center justify-center space-x-1 ${
                    paymentMode === 'CARD' ? 'bg-white text-indigo-800 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Card</span>
                </button>
              </div>

              {/* Dynamic Payment Mode Details */}
              {paymentMode === 'CASH' && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-950">Cash Tendered (₹):</span>
                    <input
                      type="number"
                      placeholder="e.g. 500"
                      value={cashTendered}
                      onChange={(e) => setCashTendered(e.target.value)}
                      className="w-24 px-2 py-1 bg-white border border-emerald-300 rounded-lg text-right font-mono font-bold text-slate-900"
                    />
                  </div>
                  {cashTendered && Number(cashTendered) >= totalAmount && (
                    <div className="flex items-center justify-between font-bold text-emerald-800 border-t border-emerald-200 pt-1">
                      <span>Change to Return:</span>
                      <span className="font-mono text-sm">₹{changeToReturn}</span>
                    </div>
                  )}
                </div>
              )}

              {paymentMode === 'UPI' && totalAmount > 0 && (
                <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-center space-y-2 text-xs">
                  <div className="font-bold text-sky-950">
                    Scan with GPay / PhonePe / Paytm
                  </div>
                  <div className="w-32 h-32 bg-white border border-sky-200 rounded-xl p-1 mx-auto flex items-center justify-center shadow-xs">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=upi://pay?pa=${encodeURIComponent(selectedStore?.upiId || 'store@upi')}%26pn=${encodeURIComponent(selectedStore?.name || 'RetailStore')}%26am=${totalAmount}%26cu=INR`}
                      alt="UPI QR Code"
                      className="w-full h-full"
                    />
                  </div>
                  <div className="text-[10px] text-sky-800 font-mono">
                    {selectedStore?.upiId || 'store@upi'} &bull; ₹{totalAmount}
                  </div>
                </div>
              )}

              {/* Complete & Print Button */}
              <button
                type="button"
                onClick={handleCompleteSale}
                disabled={selectedItems.length === 0}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold py-3 rounded-xl text-xs shadow-sm transition flex items-center justify-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>Generate Bill &amp; Update Stock (₹{totalAmount})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
