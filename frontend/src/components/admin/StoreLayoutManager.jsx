import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Layers, MapPin, Plus, Edit2, Trash2, CheckCircle2, Building, Grid } from 'lucide-react';

export default function StoreLayoutManager() {
  const { sections, aisles, products, addStoreSection, addStoreAisle } = useStore();

  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [newSecName, setNewSecName] = useState('');
  const [newSecCode, setNewSecCode] = useState('');
  const [newSecFloor, setNewSecFloor] = useState('Ground Floor - East Wing');
  const [newSecDesc, setNewSecDesc] = useState('');

  const [isAddAisleOpen, setIsAddAisleOpen] = useState(false);
  const [newAisleSectionId, setNewAisleSectionId] = useState(sections[0]?.id || 1);
  const [newAisleNumber, setNewAisleNumber] = useState('');
  const [newShelfId, setNewShelfId] = useState('');
  const [newAisleDesc, setNewAisleDesc] = useState('');

  const handleCreateSection = (e) => {
    e.preventDefault();
    if (!newSecName) return;
    addStoreSection({
      name: newSecName,
      code: newSecCode || `SEC-${newSecName.toUpperCase().slice(0, 4)}`,
      floor: newSecFloor,
      description: newSecDesc
    });
    setNewSecName('');
    setNewSecCode('');
    setNewSecDesc('');
    setIsAddSectionOpen(false);
  };

  const handleCreateAisle = (e) => {
    e.preventDefault();
    if (!newAisleNumber) return;
    const sec = sections.find(s => s.id === Number(newAisleSectionId));
    addStoreAisle({
      sectionId: Number(newAisleSectionId),
      sectionName: sec ? sec.name : 'Store Section',
      aisleNumber: newAisleNumber,
      shelfIdentifier: newShelfId || 'Shelf A1-A2',
      description: newAisleDesc
    });
    setNewAisleNumber('');
    setNewShelfId('');
    setNewAisleDesc('');
    setIsAddAisleOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>Store Layout Designer</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Supermarket Sections, Aisles &amp; Shelves</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize the store physical layout (Sections &rarr; Aisles &rarr; Shelves) to enable customer in-store wayfinding.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAddSectionOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Section</span>
          </button>
          <button
            onClick={() => setIsAddAisleOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Aisle</span>
          </button>
        </div>
      </div>

      {/* Sections and Nested Aisles Grid */}
      <div className="space-y-6">
        {sections.map((section) => {
          const sectionAisles = aisles.filter(a => a.sectionId === section.id || a.sectionName === section.name);

          return (
            <div
              key={section.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
              {/* Section Header */}
              <div className="bg-slate-900 text-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">{section.name}</h3>
                    <p className="text-[11px] text-slate-400">{section.floor} &bull; {section.description}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-slate-800 text-indigo-300 font-mono px-2.5 py-1 rounded-lg border border-slate-700">
                    {section.code}
                  </span>
                  <span className="text-xs bg-indigo-950 text-indigo-300 font-medium px-2.5 py-1 rounded-lg border border-indigo-800">
                    {sectionAisles.length} Aisles Configured
                  </span>
                </div>
              </div>

              {/* Aisles List inside this Section */}
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {sectionAisles.map((aisle) => {
                  const aisleProducts = products.filter(p => p.aisleId === aisle.id || p.aisle === aisle.aisleNumber);

                  return (
                    <div
                      key={aisle.id}
                      className="bg-slate-50 rounded-xl border border-slate-200 p-3.5 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-sky-600" />
                          <span className="font-bold text-xs text-slate-900">{aisle.aisleNumber}</span>
                        </div>
                        <span className="text-[10px] bg-sky-100 text-sky-800 font-semibold px-2 py-0.5 rounded">
                          {aisleProducts.length} Items Placed
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 font-medium">{aisle.description}</div>
                      <div className="text-[11px] text-slate-500 bg-white p-2 rounded-lg border border-slate-200">
                        Shelves: <span className="font-semibold text-slate-800">{aisle.shelfIdentifier}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Section Modal */}
      {isAddSectionOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Supermarket Department Section</h3>
            <form onSubmit={handleCreateSection} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Section Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Produce &amp; Fruits"
                  value={newSecName}
                  onChange={(e) => setNewSecName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Floor &amp; Wing Location</label>
                <input
                  type="text"
                  value={newSecFloor}
                  onChange={(e) => setNewSecFloor(e.target.value)}
                  placeholder="e.g. Ground Floor - South Wing"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Categories</label>
                <input
                  type="text"
                  value={newSecDesc}
                  onChange={(e) => setNewSecDesc(e.target.value)}
                  placeholder="e.g. Fresh farm fruits, vegetables, and greens"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddSectionOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                >
                  Save Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Aisle Modal */}
      {isAddAisleOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Aisle &amp; Shelf Mapping</h3>
            <form onSubmit={handleCreateAisle} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Parent Section</label>
                <select
                  value={newAisleSectionId}
                  onChange={(e) => setNewAisleSectionId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  {sections.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Aisle Number / Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aisle 10"
                  value={newAisleNumber}
                  onChange={(e) => setNewAisleNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Shelf Identifier Range</label>
                <input
                  type="text"
                  placeholder="e.g. Shelf J1 - J3"
                  value={newShelfId}
                  onChange={(e) => setNewShelfId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Aisle Category Description</label>
                <input
                  type="text"
                  placeholder="e.g. Organic cereals and dietary seeds"
                  value={newAisleDesc}
                  onChange={(e) => setNewAisleDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddAisleOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                >
                  Save Aisle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
