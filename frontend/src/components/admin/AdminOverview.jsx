import React from 'react';
import { useStore } from '../../context/StoreContext';
import StoreRatingsAnalyticsCard from '../common/StoreRatingsAnalyticsCard';
import { ShieldCheck, Layers, Tag, AlertTriangle, ArrowRight, Package, Users, CheckCircle2 } from 'lucide-react';

export default function AdminOverview() {
  const { 
    sections, 
    aisles, 
    products, 
    operationalIssues, 
    orders,
    setAdminView 
  } = useStore();

  const activeOffersCount = products.filter(p => p.offer).length;
  const openIssuesCount = operationalIssues.filter(i => i.status !== 'RESOLVED').length;
  const totalValuation = products.reduce((sum, p) => sum + (p.price * p.currentStock), 0);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Supermarket Administration</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Store Network &amp; Operations Governance</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure department sections, aisle/shelf layout mappings, promotional campaigns, and facility incident logs.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAdminView('layout')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm"
          >
            <Layers className="w-4 h-4" />
            <span>Manage Store Layout</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Store Sections &amp; Aisles</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{sections.length} Sections &bull; {aisles.length} Aisles</div>
          <span className="text-[11px] text-indigo-600 font-medium">100% floor mapped</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Total Live Catalog Inventory</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">₹{totalValuation.toLocaleString()}</div>
          <span className="text-[11px] text-slate-400">{products.length} registered SKUs</span>
        </div>

        <div 
          onClick={() => setAdminView('offers')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm cursor-pointer hover:border-indigo-300 transition"
        >
          <span className="text-xs font-semibold text-slate-500">Active Promotional Offers</span>
          <div className="text-2xl font-bold text-indigo-700 mt-1">{activeOffersCount} Campaigns</div>
          <span className="text-[11px] text-emerald-600 font-medium">Live on customer app</span>
        </div>

        <div 
          onClick={() => setAdminView('issues')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm cursor-pointer hover:border-indigo-300 transition"
        >
          <span className="text-xs font-semibold text-slate-500">Operational Issues</span>
          <div className="text-2xl font-bold text-amber-700 mt-1">{openIssuesCount} Active</div>
          <span className="text-[11px] text-slate-400">Maintenance &amp; scanners</span>
        </div>
      </div>

      {/* Two Column Section: Store Structure Health & Facility Alert Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Store Sections Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Physical Store Layout Hierarchy</h3>
            <button
              onClick={() => setAdminView('layout')}
              className="text-xs text-indigo-600 font-bold hover:underline"
            >
              Configure Grid &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {sections.map((sec) => {
              const secAisles = aisles.filter(a => a.sectionId === sec.id || a.sectionName === sec.name);
              const secProds = products.filter(p => p.section === sec.name);

              return (
                <div key={sec.id} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{sec.name}</div>
                    <div className="text-[11px] text-slate-500">{sec.floor} &bull; {sec.description}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {secAisles.length} Aisles &bull; {secProds.length} Products
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Operational Issues Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Facility &amp; Operations Log</h3>
            <button
              onClick={() => setAdminView('issues')}
              className="text-xs text-indigo-600 font-bold hover:underline"
            >
              Open Tracker &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {operationalIssues.map((issue) => (
              <div
                key={issue.id}
                className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{issue.title}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    issue.status === 'RESOLVED'
                      ? 'bg-slate-200 text-slate-700'
                      : issue.severity === 'HIGH'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {issue.status} &bull; {issue.severity}
                  </span>
                </div>
                <div className="text-xs text-slate-600">{issue.details}</div>
                <div className="text-[10px] text-slate-400 flex justify-between pt-1">
                  <span>Location: {issue.location}</span>
                  <span>{issue.reportedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Ratings & Reviews Card */}
      <StoreRatingsAnalyticsCard
        storeId={selectedStore?.id}
        storeName={selectedStore?.name}
      />
    </div>
  );
}
