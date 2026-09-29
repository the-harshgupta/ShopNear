import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import StoreRatingsAnalyticsCard from '../common/StoreRatingsAnalyticsCard';
import { Store, MapPin, Phone, Mail, Clock, CreditCard, User, Save, CheckCircle2 } from 'lucide-react';

export default function ShopProfile() {
  const { selectedStore, updateStoreDetails, setRetailerView } = useStore();
  const { user } = useAuth();

  const [name, setName] = useState(selectedStore?.name || user?.storeName || '');
  const [ownerName, setOwnerName] = useState(selectedStore?.ownerName || user?.fullName || user?.name || '');
  const [phone, setPhone] = useState(selectedStore?.phone || user?.phone || '');
  const [email, setEmail] = useState(selectedStore?.email || user?.email || '');
  const [address, setAddress] = useState(selectedStore?.address || user?.storeAddress || '');
  const [timings, setTimings] = useState(selectedStore?.timings || '7:00 AM - 10:00 PM');
  const [upiId, setUpiId] = useState(selectedStore?.upiId || '');

  useEffect(() => {
    if (selectedStore) {
      setName(selectedStore.name || user?.storeName || '');
      setOwnerName(selectedStore.ownerName || user?.fullName || user?.name || '');
      setPhone(selectedStore.phone || user?.phone || '');
      setEmail(selectedStore.email || user?.email || '');
      setAddress(selectedStore.address || user?.storeAddress || '');
      setTimings(selectedStore.timings || '7:00 AM - 10:00 PM');
      setUpiId(selectedStore.upiId || '');
    }
  }, [selectedStore, user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const targetId = selectedStore?.id || user?.storeId;
    if (targetId) {
      updateStoreDetails(targetId, {
        name: name.trim(),
        ownerName: ownerName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        timings: timings.trim(),
        upiId: upiId.trim()
      });
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Store className="w-4 h-4" />
            <span>Store Configuration</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Manage Shop Profile</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure your shop name, contact information, and business hours.
          </p>
        </div>

        <button
          onClick={() => setRetailerView('overview')}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg"
        >
          &larr; Back
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Shop / Business Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 text-sm font-semibold"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Owner / Shopkeeper Name</label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Contact Phone *</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Contact Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">UPI ID (For Digital Payments)</label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="e.g. store@upi"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Shop Address &amp; Landmark</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Operating Hours</label>
          <input
            type="text"
            value={timings}
            onChange={(e) => setTimings(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-sm transition flex items-center space-x-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Shop Changes</span>
          </button>
        </div>
      </form>

      {/* Customer Ratings & Reviews */}
      <StoreRatingsAnalyticsCard
        storeId={selectedStore?.id}
        storeName={selectedStore?.name}
      />
    </div>
  );
}
