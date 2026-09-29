import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Store, 
  Building2, 
  CheckCircle2, 
  X, 
  Sparkles, 
  MapPin, 
  Phone, 
  CreditCard, 
  Clock, 
  Package, 
  ArrowRight,
  ShieldCheck,
  Zap,
  ShoppingBag
} from 'lucide-react';

export default function RegisterShopModal({ isOpen, onClose }) {
  const { addCustomStore, setRole, setRetailerView, showNotification } = useStore();

  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [upiId, setUpiId] = useState('');
  const [storeType, setStoreType] = useState('KIRANA_STORE'); // 'KIRANA_STORE' | 'SUPERMARKET'
  const [category, setCategory] = useState('Grocery & Kirana');
  const [address, setAddress] = useState('');
  const [timings, setTimings] = useState('7:00 AM - 10:00 PM');
  const [preloadEssentials, setPreloadEssentials] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shopName.trim() || !ownerName.trim() || !phone.trim()) {
      showNotification('Please fill in all required shop details', 'warning');
      return;
    }

    const isKirana = storeType === 'KIRANA_STORE';
    const newShop = await addCustomStore({
      name: shopName.trim(),
      branch: isKirana ? 'Neighborhood Kirana' : 'Central Supermarket',
      storeType: storeType,
      ownerName: ownerName.trim(),
      address: address.trim() || 'Local Main Market',
      distance: '0.3 km away',
      timings: timings,
      phone: phone.trim(),
      upiId: upiId.trim() || `${shopName.toLowerCase().replace(/[^a-z0-9]/g, '')}@upi`,
      aisleCount: isKirana ? 0 : 9
    });

    if (isKirana) {
      setRole('SHOPKEEPER');
      setRetailerView('overview');
      showNotification(`🎉 Shop "${newShop.name}" registered successfully! You are now in Shopkeeper Mode.`, 'success');
    } else {
      setRole('STORE_MANAGER');
      setRetailerView('overview');
      showNotification(`🎉 Supermarket "${newShop.name}" registered successfully! You are now in Store Manager Mode.`, 'success');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200 animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500 text-white rounded-2xl shadow-sm">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-lg text-white">Register Your Retail Shop</h3>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-800">
                  Merchant Onboarding
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Put your shop online, manage stock effortlessly, and connect with neighborhood shoppers.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Store Type Selection */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Select Shop Format *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setStoreType('KIRANA_STORE')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                  storeType === 'KIRANA_STORE'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 flex items-center space-x-1.5">
                      <Store className="w-4 h-4 text-emerald-600" />
                      <span>Small Retail / Kirana Store</span>
                    </span>
                    {storeType === 'KIRANA_STORE' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Ideal for neighborhood provision stores, dairy stalls, and daily shops with simple shelves.
                  </p>
                </div>
                <div className="mt-3 text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-1 rounded-md w-fit">
                  ✓ Simple Stock Counter &bull; Zero Tech Friction
                </div>
              </div>

              <div
                onClick={() => setStoreType('SUPERMARKET')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                  storeType === 'SUPERMARKET'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 flex items-center space-x-1.5">
                      <Building2 className="w-4 h-4 text-indigo-600" />
                      <span>Supermarket / Mart</span>
                    </span>
                    {storeType === 'SUPERMARKET' && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Multi-department stores with organized aisles, sections, and larger catalogs.
                  </p>
                </div>
                <div className="mt-3 text-[10px] font-semibold text-indigo-700 bg-indigo-100/80 px-2 py-1 rounded-md w-fit">
                  ✓ Multi-Aisle Layout &bull; Dept Management
                </div>
              </div>
            </div>
          </div>

          {/* Shop Basic Information */}
          <div className="space-y-3 pt-1">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Shopkeeper &amp; Business Profile
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Shop Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gupta Kirana Store, Balaji Daily Provisions"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Shopkeeper / Owner Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Gupta, Ramesh Kumar"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Contact Mobile &amp; WhatsApp * (For customer order alerts)
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98230 55443"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Shop Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 font-medium"
                >
                  <option value="Grocery & Kirana">Daily Kirana &amp; Grocery Staples</option>
                  <option value="Dairy & Bakery">Fresh Dairy, Milk &amp; Bakery</option>
                  <option value="General Store">General Merchant &amp; Household</option>
                  <option value="Fruits & Veggies">Fresh Farm Fruits &amp; Vegetables</option>
                  <option value="Pharmacy & Health">Daily Wellness &amp; Pharmacy</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Shop Address / Landmark
                </label>
                <input
                  type="text"
                  placeholder="e.g. Shop #14, Main Market, 5th Cross"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  UPI ID for Direct Payments (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. guptastore@upi / 9823055443@paytm"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Store Operating Hours
              </label>
              <input
                type="text"
                placeholder="e.g. 6:30 AM - 10:30 PM (All 7 Days)"
                value={timings}
                onChange={(e) => setTimings(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
              />
            </div>
          </div>

          {/* Quick Starter Catalog Kit */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start space-x-3">
            <input
              type="checkbox"
              id="preload"
              checked={preloadEssentials}
              onChange={(e) => setPreloadEssentials(e.target.checked)}
              className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
            />
            <label htmlFor="preload" className="cursor-pointer space-y-0.5">
              <div className="font-bold text-emerald-950 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pre-load Starter Grocery Essentials Catalog</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Automatically imports standard retail products (Atta, Dals, Oil, Milk, Butter, Biscuits, Noodles, Soaps, Detergents) so you can start managing stock immediately without typing hundreds of items.
              </p>
            </label>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Instant Activation &bull; Zero Setup Fee</span>
            </span>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-sm transition flex items-center space-x-1.5"
              >
                <span>Register &amp; Open Shop Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
