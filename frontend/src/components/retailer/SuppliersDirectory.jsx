import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Truck, Phone, Mail, User, Plus, PackageCheck, CheckCircle2 } from 'lucide-react';

export default function SuppliersDirectory() {
  const { suppliers, products, showNotification } = useStore();
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isOrderTicketModalOpen, setIsOrderTicketModalOpen] = useState(false);
  const [ticketQuantity, setTicketQuantity] = useState('50');

  const handleSendTicket = (e) => {
    e.preventDefault();
    showNotification(`Restock ticket of ${ticketQuantity} units dispatched to ${selectedSupplier?.name}`, 'success');
    setIsOrderTicketModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Truck className="w-4 h-4" />
            <span>Supply Chain Management</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Registered FMCG Suppliers &amp; Logistics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Contact distributors directly and issue official restock requisitions for low-stock inventory.
          </p>
        </div>
      </div>

      {/* Supplier Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {suppliers.map((supplier) => {
          const suppliedProducts = products.filter(p => p.supplierId === supplier.id || p.supplierName === supplier.name);
          const lowStockCount = suppliedProducts.filter(p => p.currentStock <= p.minStockLevel).length;

          return (
            <div
              key={supplier.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-slate-300 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900">{supplier.name}</h3>
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {supplier.category}
                  </span>
                </div>
                {lowStockCount > 0 ? (
                  <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 font-bold px-2 py-0.5 rounded">
                    {lowStockCount} items need restock
                  </span>
                ) : (
                  <span className="text-xs bg-emerald-50 text-emerald-800 font-medium px-2 py-0.5 rounded">
                    Stock Healthy
                  </span>
                )}
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex items-center space-x-2">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Representative: <strong>{supplier.contactPerson}</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Phone: {supplier.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Email: {supplier.email}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-500 font-medium">
                  Manages {suppliedProducts.length} store items
                </span>

                <button
                  onClick={() => {
                    setSelectedSupplier(supplier);
                    setIsOrderTicketModalOpen(true);
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-lg transition"
                >
                  Send Restock Ticket
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Restock Ticket Modal */}
      {isOrderTicketModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Generate Restock Ticket for {selectedSupplier?.name}
            </h3>
            <p className="text-xs text-slate-500">
              Dispatches an automated purchase requisition email &amp; SMS notification to supplier representative.
            </p>

            <form onSubmit={handleSendTicket} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Standard Reorder Quantity (Units)</label>
                <input
                  type="number"
                  required
                  value={ticketQuantity}
                  onChange={(e) => setTicketQuantity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Logistics / Dock Instructions</label>
                <textarea
                  defaultValue="Please deliver to Backstage Unloading Bay #2 before 10:00 AM."
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsOrderTicketModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
                >
                  Confirm &amp; Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
