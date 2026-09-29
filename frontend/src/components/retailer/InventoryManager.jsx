import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { api } from '../../services/api';
import { 
  Package, 
  Search, 
  Plus, 
  Minus, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  Filter, 
  MapPin, 
  Truck,
  Edit2,
  Check,
  Scale,
  X,
  Navigation,
  Sparkles,
  Camera,
  Upload,
  Trash2,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import IndoorStoreMapModal from '../common/IndoorStoreMapModal';

export default function InventoryManager() {
  const { products, updateProductStock, updateProductDetails, updateProductLocation, categories, addProduct, selectedStore, showNotification } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockStatusFilter, setStockStatusFilter] = useState('ALL'); // 'ALL' | 'LOW' | 'OUT' | 'NORMAL'
  const [editingThresholdId, setEditingThresholdId] = useState(null);
  const [tempThreshold, setTempThreshold] = useState('');

  // Add Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('Personal Care');
  const [prodPrice, setProdPrice] = useState('');
  const [prodQuantity, setProdQuantity] = useState('1'); // Package size
  const [prodUnit, setProdUnit] = useState('Packet'); // Piece, Packet, Kg, Gram, Litre, ml, Box, Other
  const [prodStock, setProdStock] = useState('20');
  const [prodThreshold, setProdThreshold] = useState('5');
  const [prodAisle, setProdAisle] = useState('5');
  const [prodRow, setProdRow] = useState('7');
  const [prodShelf, setProdShelf] = useState('2');
  const [prodSection, setProdSection] = useState('Personal Care & Hygiene');
  const [prodImageFile, setProdImageFile] = useState(null);
  const [prodImagePreview, setProdImagePreview] = useState(null);
  const [prodImageUrl, setProdImageUrl] = useState(null);
  const [prodImageError, setProdImageError] = useState(null);
  const [isAddingLoading, setIsAddingLoading] = useState(false);

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [editProdName, setEditProdName] = useState('');
  const [editProdCategory, setEditProdCategory] = useState('');
  const [editProdPrice, setEditProdPrice] = useState('');
  const [editProdQuantity, setEditProdQuantity] = useState('1');
  const [editProdUnit, setEditProdUnit] = useState('Packet');
  const [editProdStock, setEditProdStock] = useState('');
  const [editProdThreshold, setEditProdThreshold] = useState('');
  const [editProdAisle, setEditProdAisle] = useState('');
  const [editProdRow, setEditProdRow] = useState('');
  const [editProdShelf, setEditProdShelf] = useState('');
  const [editProdSection, setEditProdSection] = useState('');
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [editImageUrl, setEditImageUrl] = useState(null);
  const [editImageRemoved, setEditImageRemoved] = useState(false);
  const [editImageError, setEditImageError] = useState(null);
  const [isEditingLoading, setIsEditingLoading] = useState(false);

  // AI Web Photo Finder state
  const [aiPhotoSearchLoading, setAiPhotoSearchLoading] = useState(false);
  const [aiPhotoCandidates, setAiPhotoCandidates] = useState([]);
  const [showAiPhotoPicker, setShowAiPhotoPicker] = useState(false);
  const [aiPhotoTarget, setAiPhotoTarget] = useState('add'); // 'add' | 'edit'

  const handleSearchAiPhotos = async (target = 'add') => {
    const query = target === 'add' ? prodName.trim() : editProdName.trim();
    if (!query) {
      if (showNotification) showNotification('Please enter a product name first to find photos', 'info');
      return;
    }
    setAiPhotoTarget(target);
    setShowAiPhotoPicker(true);
    setAiPhotoSearchLoading(true);
    try {
      const res = await api.searchProductImages(query);
      const results = res.candidateImageResults || res.results || [];
      const items = results.length > 0
        ? results
        : (res.images || []).map(u => ({ imageUrl: u, title: query, sourceName: 'web' }));
      setAiPhotoCandidates(items);
    } catch (e) {
      console.error('Failed to search photos:', e);
      setAiPhotoCandidates([]);
    } finally {
      setAiPhotoSearchLoading(false);
    }
  };

  const handlePickAiPhoto = (item) => {
    const imageUrl = typeof item === 'string' ? item : item?.imageUrl;
    if (aiPhotoTarget === 'add') {
      setProdImageFile(null);
      setProdImagePreview(imageUrl);
      setProdImageUrl(imageUrl);
    } else {
      setEditImageFile(null);
      setEditImageRemoved(false);
      setEditImagePreview(imageUrl);
      setEditImageUrl(imageUrl);
    }
    setShowAiPhotoPicker(false);
    if (showNotification) showNotification('Product photo selected from web', 'success');
  };

  // Edit Product Location Only Modal State
  const [editingLocationProd, setEditingLocationProd] = useState(null);
  const [editAisle, setEditAisle] = useState('');
  const [editRow, setEditRow] = useState('');
  const [editShelf, setEditShelf] = useState('');

  // Map Preview State
  const [mapPreviewProduct, setMapPreviewProduct] = useState(null);
  const [isMapPreviewOpen, setIsMapPreviewOpen] = useState(false);

  const isSupermarket = selectedStore?.storeType === 'SUPERMARKET';

  const validateImageFile = (file) => {
    if (!file) return { valid: false, error: 'No file chosen' };
    const validMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    const validExts = ['jpg', 'jpeg', 'png', 'webp'];
    if (!validMimes.includes(file.type) && !validExts.includes(ext)) {
      return { valid: false, error: 'Unsupported format. Allowed: JPG, JPEG, PNG, WEBP.' };
    }
    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 5 MB. Please select a smaller photo.' };
    }
    return { valid: true, error: null };
  };

  const handleAddImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setProdImageError(validation.error);
      return;
    }
    setProdImageError(null);
    setProdImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setProdImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAddImage = () => {
    setProdImageFile(null);
    setProdImagePreview(null);
    setProdImageUrl(null);
    setProdImageError(null);
  };

  const handleOpenEditProduct = (product) => {
    setEditingProduct(product);
    setEditProdName(product.name || '');
    setEditProdCategory(product.category || 'Personal Care');
    setEditProdPrice(product.price !== undefined ? String(product.price) : '');
    setEditProdQuantity(product.packageQuantity !== undefined ? String(product.packageQuantity) : '1');
    setEditProdUnit(product.unit || 'Packet');
    setEditProdStock(product.currentStock !== undefined ? String(product.currentStock) : '0');
    setEditProdThreshold(product.minStockLevel !== undefined ? String(product.minStockLevel) : '5');
    setEditProdAisle(product.aisleNumber || product.aisle || '5');
    setEditProdRow(product.rowNumber || product.row || '7');
    setEditProdShelf(product.shelfNumber || product.shelf || '2');
    setEditProdSection(product.sectionLabel || product.section || 'General Section');
    setEditImageFile(null);
    setEditImagePreview(product.imageUrl || null);
    setEditImageUrl(product.imageUrl || null);
    setEditImageRemoved(false);
    setEditImageError(null);
    setShowAiPhotoPicker(false);
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setEditImageError(validation.error);
      return;
    }
    setEditImageError(null);
    setEditImageFile(file);
    setEditImageRemoved(false);
    const reader = new FileReader();
    reader.onload = () => {
      setEditImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveEditImage = () => {
    setEditImageFile(null);
    setEditImagePreview(null);
    setEditImageUrl(null);
    setEditImageRemoved(true);
    setEditImageError(null);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = searchQuery === '' || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.aisle && p.aisle.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;

    let matchesStatus = true;
    if (stockStatusFilter === 'OUT') matchesStatus = p.currentStock === 0;
    else if (stockStatusFilter === 'LOW') matchesStatus = p.currentStock > 0 && p.currentStock <= p.minStockLevel;
    else if (stockStatusFilter === 'NORMAL') matchesStatus = p.currentStock > p.minStockLevel;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleSaveThreshold = (productId) => {
    if (tempThreshold !== '') {
      updateProductDetails(productId, { minStockLevel: Number(tempThreshold) });
    }
    setEditingThresholdId(null);
  };

  const handleOpenEditLocation = (product) => {
    setEditingLocationProd(product);
    setEditAisle(product.aisleNumber || product.aisle || '5');
    setEditRow(product.rowNumber || product.row || '7');
    setEditShelf(product.shelfNumber || product.shelf || '2');
  };

  const handleSaveLocation = async (e) => {
    e.preventDefault();
    if (!editingLocationProd) return;

    await updateProductLocation(editingLocationProd.id, {
      aisle: editAisle.trim() || 'Aisle 1',
      row: editRow.trim() || 'Row 1',
      shelf: editShelf.trim() || 'Shelf 1'
    });

    setEditingLocationProd(null);
  };

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    if (!prodName.trim() || !prodPrice) return;

    setIsAddingLoading(true);
    try {
      let finalImageUrl = prodImageUrl || null;
      if (prodImageFile && selectedStore?.id) {
        try {
          const uploadRes = await api.uploadProductImage(selectedStore.id, prodImageFile);
          if (uploadRes && uploadRes.imageUrl) {
            finalImageUrl = uploadRes.imageUrl;
          }
        } catch (uploadErr) {
          console.error("Image upload failed:", uploadErr);
          setProdImageError(uploadErr.message || 'Image upload failed. Please try again.');
          setIsAddingLoading(false);
          return;
        }
      }

      const formattedAisle = prodAisle.trim().startsWith('Aisle') ? prodAisle.trim() : `Aisle ${prodAisle.trim() || '1'}`;
      const formattedRow = prodRow.trim().startsWith('Row') ? prodRow.trim() : `Row ${prodRow.trim() || '1'}`;
      const formattedShelf = prodShelf.trim().startsWith('Shelf') ? prodShelf.trim() : `Shelf ${prodShelf.trim() || '1'}`;

      await addProduct({
        name: prodName.trim(),
        category: prodCategory,
        price: Number(prodPrice),
        mrp: Number(prodPrice),
        packageQuantity: Number(prodQuantity) || 1,
        unit: prodUnit.toUpperCase(),
        currentStock: Number(prodStock) || 0,
        minStockLevel: Number(prodThreshold) || 5,
        aisle: formattedAisle,
        aisleNumber: formattedAisle,
        row: formattedRow,
        rowNumber: formattedRow,
        shelf: formattedShelf,
        shelfNumber: formattedShelf,
        section: prodSection.trim() || 'General Section',
        sectionLabel: prodSection.trim() || 'General Section',
        imageUrl: finalImageUrl
      });

      setProdName('');
      setProdPrice('');
      setProdQuantity('1');
      setProdUnit('Packet');
      setProdStock('20');
      setProdThreshold('5');
      setProdAisle('5');
      setProdRow('7');
      setProdShelf('2');
      setProdImageFile(null);
      setProdImagePreview(null);
      setProdImageUrl(null);
      setProdImageError(null);
      setShowAiPhotoPicker(false);
      setIsAddModalOpen(false);
    } catch (err) {
      console.error("Failed to add product:", err);
    } finally {
      setIsAddingLoading(false);
    }
  };

  const handleEditProductSubmit = async (e) => {
    e.preventDefault();
    if (!editingProduct || !editProdName.trim() || !editProdPrice) return;

    setIsEditingLoading(true);
    try {
      let finalImageUrl = editImageUrl !== null ? editImageUrl : editingProduct.imageUrl;

      if (editImageRemoved) {
        finalImageUrl = null;
      } else if (editImageFile && selectedStore?.id) {
        try {
          const uploadRes = await api.uploadProductImage(selectedStore.id, editImageFile);
          if (uploadRes && uploadRes.imageUrl) {
            finalImageUrl = uploadRes.imageUrl;
          }
        } catch (uploadErr) {
          console.error("Image upload failed during product edit:", uploadErr);
          setEditImageError(uploadErr.message || 'Image upload failed. Please try again.');
          setIsEditingLoading(false);
          return;
        }
      }

      const formattedAisle = editProdAisle.trim().startsWith('Aisle') ? editProdAisle.trim() : `Aisle ${editProdAisle.trim() || '1'}`;
      const formattedRow = editProdRow.trim().startsWith('Row') ? editProdRow.trim() : `Row ${editProdRow.trim() || '1'}`;
      const formattedShelf = editProdShelf.trim().startsWith('Shelf') ? editProdShelf.trim() : `Shelf ${editProdShelf.trim() || '1'}`;

      await updateProductDetails(editingProduct.id, {
        productName: editProdName.trim(),
        name: editProdName.trim(),
        category: editProdCategory,
        price: Number(editProdPrice),
        mrp: Number(editProdPrice),
        packageQuantity: Number(editProdQuantity) || 1,
        unit: editProdUnit.toUpperCase(),
        stockQuantity: Number(editProdStock) || 0,
        currentStock: Number(editProdStock) || 0,
        lowStockThreshold: Number(editProdThreshold) || 5,
        minStockLevel: Number(editProdThreshold) || 5,
        aisleNumber: formattedAisle,
        rowNumber: formattedRow,
        shelfNumber: formattedShelf,
        sectionLabel: editProdSection.trim() || 'General Section',
        imageUrl: finalImageUrl
      });

      setEditingProduct(null);
      setEditImageUrl(null);
      setShowAiPhotoPicker(false);
    } catch (err) {
      console.error("Failed to edit product:", err);
    } finally {
      setIsEditingLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Package className="w-4 h-4" />
            <span>Store Inventory Controller</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Live Inventory &amp; Stock Manager</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Managing products for <strong>{selectedStore?.name}</strong>. Adjust counts, upload photos, warning thresholds, and unit pricing.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setProdImageFile(null);
              setProdImagePreview(null);
              setProdImageError(null);
              setIsAddModalOpen(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Product</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="text-xs text-slate-500">Total Products</div>
          <div className="text-lg font-bold text-slate-900 mt-0.5">{products.length}</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-sm text-center">
          <div className="text-xs text-emerald-700 font-semibold">Healthy Stock</div>
          <div className="text-lg font-bold text-emerald-700 mt-0.5">
            {products.filter(p => p.currentStock > p.minStockLevel).length}
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-sm text-center">
          <div className="text-xs text-amber-700 font-semibold">Low Stock Warnings</div>
          <div className="text-lg font-bold text-amber-700 mt-0.5">
            {products.filter(p => p.currentStock > 0 && p.currentStock <= p.minStockLevel).length}
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-rose-200 shadow-sm text-center">
          <div className="text-xs text-rose-700 font-semibold">Out of Stock</div>
          <div className="text-lg font-bold text-rose-700 mt-0.5">
            {products.filter(p => p.currentStock === 0).length}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name, barcode, or category..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
            />
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="All">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>

            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setStockStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg transition ${stockStatusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
              >
                All
              </button>
              <button
                onClick={() => setStockStatusFilter('NORMAL')}
                className={`px-2.5 py-1 rounded-lg transition ${stockStatusFilter === 'NORMAL' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600'}`}
              >
                Healthy
              </button>
              <button
                onClick={() => setStockStatusFilter('LOW')}
                className={`px-2.5 py-1 rounded-lg transition ${stockStatusFilter === 'LOW' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-600'}`}
              >
                Low
              </button>
              <button
                onClick={() => setStockStatusFilter('OUT')}
                className={`px-2.5 py-1 rounded-lg transition ${stockStatusFilter === 'OUT' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-600'}`}
              >
                Stockout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Physical Location (Aisle/Row/Shelf)</th>
                <th className="py-3.5 px-4">Selling Price &amp; Unit</th>
                <th className="py-3.5 px-4">Normalized Unit Price</th>
                <th className="py-3.5 px-4">Current Stock</th>
                <th className="py-3.5 px-4">Low Stock Warning Threshold</th>
                <th className="py-3.5 px-4 text-center">Fast Stock Adjuster</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredProducts.map((p) => {
                const isOut = p.currentStock === 0;
                const isLow = p.currentStock > 0 && p.currentStock <= p.minStockLevel;
                const aisleDisplay = p.aisleNumber || p.aisle || 'Aisle 5';
                const rowDisplay = p.rowNumber || p.row || 'Row 7';
                const shelfDisplay = p.shelfNumber || p.shelf || 'Shelf 2';

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        {/* Thumbnail photo or fallback */}
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.nextSibling) {
                                  e.target.nextSibling.style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <div 
                            className={`w-full h-full items-center justify-center text-base ${p.imageUrl ? 'hidden' : 'flex'}`}
                            title="No photo uploaded"
                          >
                            📦
                          </div>
                        </div>

                        <div>
                          <div className="font-bold text-slate-900">{p.name}</div>
                          {p.brand && <div className="text-[10px] text-slate-400">{p.brand}</div>}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                        {p.category}
                      </span>
                    </td>

                    {/* Physical Location in Store */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center space-x-1 text-xs font-bold text-slate-800">
                          <span className="text-sky-700 bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded">
                            {aisleDisplay.startsWith('Aisle') ? aisleDisplay : `Aisle ${aisleDisplay}`}
                          </span>
                          <span className="text-slate-400">&rarr;</span>
                          <span className="text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                            {rowDisplay.startsWith('Row') ? rowDisplay : `Row ${rowDisplay}`}
                          </span>
                          <span className="text-slate-400">&rarr;</span>
                          <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                            {shelfDisplay.startsWith('Shelf') ? shelfDisplay : `Shelf ${shelfDisplay}`}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 text-[10px]">
                          <button
                            type="button"
                            onClick={() => handleOpenEditProduct(p)}
                            className="text-emerald-600 hover:text-emerald-800 font-bold flex items-center space-x-1 hover:underline"
                            title="Edit Product & Photo"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit Product</span>
                          </button>

                          <span>&bull;</span>

                          <button
                            type="button"
                            onClick={() => handleOpenEditLocation(p)}
                            className="text-sky-600 hover:text-sky-800 font-bold flex items-center space-x-1 hover:underline"
                            title="Update Physical Location"
                          >
                            <MapPin className="w-3 h-3" />
                            <span>Location</span>
                          </button>

                          <span>&bull;</span>

                          <button
                            type="button"
                            onClick={() => {
                              setMapPreviewProduct(p);
                              setIsMapPreviewOpen(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center space-x-1 hover:underline"
                            title="View on Indoor Map"
                          >
                            <Navigation className="w-3 h-3" />
                            <span>Map</span>
                          </button>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div className="text-sm font-bold">₹{p.price}</div>
                      <span className="text-[10px] text-slate-400 font-normal">
                        Size: {p.packageQuantity} {p.unit?.toLowerCase()}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {p.unitPriceDisplay ? (
                        <span className="text-xs font-bold text-sky-800 bg-sky-50 px-2 py-1 rounded border border-sky-200 inline-flex items-center space-x-1">
                          <Scale className="w-3 h-3 text-sky-600" />
                          <span>{p.unitPriceDisplay}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">&mdash;</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <span className={`font-mono font-bold text-sm ${
                          isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-emerald-700'
                        }`}>
                          {p.currentStock}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isOut 
                            ? 'bg-rose-100 text-rose-800' 
                            : isLow 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {editingThresholdId === p.id ? (
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            defaultValue={p.minStockLevel}
                            onChange={(e) => setTempThreshold(e.target.value)}
                            className="w-14 px-1.5 py-1 text-xs border border-slate-300 rounded"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveThreshold(p.id)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1.5 text-slate-600">
                          <span>{p.minStockLevel} units</span>
                          <button
                            onClick={() => {
                              setEditingThresholdId(p.id);
                              setTempThreshold(p.minStockLevel);
                            }}
                            className="text-slate-400 hover:text-slate-700 p-0.5 rounded"
                            title="Edit Threshold"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center space-x-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                        <button
                          onClick={() => updateProductStock(p.id, -1)}
                          disabled={p.currentStock === 0}
                          className="bg-white hover:bg-slate-200 disabled:opacity-30 text-slate-700 px-2 py-1 rounded font-bold transition shadow-2xs"
                          title="Decrease 1"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => updateProductStock(p.id, -5)}
                          disabled={p.currentStock < 5}
                          className="bg-white hover:bg-slate-200 disabled:opacity-30 text-slate-700 px-2 py-1 rounded font-bold transition shadow-2xs"
                          title="Decrease 5"
                        >
                          -5
                        </button>
                        <button
                          onClick={() => updateProductStock(p.id, 5)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded font-bold transition shadow-2xs"
                          title="Add 5"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => updateProductStock(p.id, 20)}
                          className="bg-slate-900 hover:bg-slate-800 text-white px-2.5 py-1 rounded font-bold transition shadow-2xs"
                          title="Add 20"
                        >
                          +20
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-500">
            No products match the selected filters.
          </div>
        )}
      </div>

      {/* Add Product Modal (with Product Photo Upload & Physical Placement) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add Product to Store Inventory</h3>
                <p className="text-xs text-slate-500">For {selectedStore?.name}</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-4 text-xs">
              {/* Product Photo Upload Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                    Product Photo
                  </label>
                  <button
                    type="button"
                    onClick={() => handleSearchAiPhotos('add')}
                    className="flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-lg transition shadow-2xs cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span>✨ AI Web Photo</span>
                  </button>
                </div>

                {showAiPhotoPicker && aiPhotoTarget === 'add' && (
                  <div className="p-3 bg-gradient-to-br from-indigo-50/70 to-purple-50/50 rounded-2xl border border-indigo-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="text-xs font-bold text-indigo-950">AI Web Photo Suggestions</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAiPhotoPicker(false)}
                        className="text-slate-400 hover:text-slate-600 text-[11px] cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                    {aiPhotoSearchLoading ? (
                      <div className="flex items-center space-x-2 py-3 text-xs text-indigo-600 font-medium">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Searching product web photos...</span>
                      </div>
                    ) : aiPhotoCandidates.length > 0 ? (
                      <div>
                        <p className="text-[11px] text-slate-600 mb-2">Click an image to set it as this product's photo:</p>
                        <div className="grid grid-cols-4 gap-2">
                          {aiPhotoCandidates.map((item, idx) => {
                            const url = typeof item === 'string' ? item : item.imageUrl;
                            const title = typeof item === 'object' ? item.title : '';
                            const domain = typeof item === 'object' ? item.sourceName : '';
                            const score = typeof item === 'object' ? item.relevanceScore : null;
                            return (
                              <div
                                key={idx}
                                onClick={() => handlePickAiPhoto(item)}
                                className="relative rounded-xl overflow-hidden border-2 border-slate-200 hover:border-indigo-600 cursor-pointer bg-white transition hover:scale-105 group shadow-xs p-1 flex flex-col justify-between"
                                title={title || "Select this photo"}
                              >
                                <div className="aspect-square w-full rounded-lg overflow-hidden bg-white flex items-center justify-center relative">
                                  <img src={item.thumbnailUrl || url} alt={title || `Candidate ${idx}`} className="w-full h-full object-contain" />
                                  <div className="absolute inset-0 bg-indigo-900/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                    <Check className="w-4 h-4 text-white drop-shadow" />
                                  </div>
                                  {score > 0 && (
                                    <div className="absolute bottom-0.5 left-0.5 bg-slate-900/80 text-white text-[8px] font-bold px-1 rounded">
                                      {score}%
                                    </div>
                                  )}
                                </div>
                                {domain && (
                                  <div className="text-[9px] text-slate-500 truncate pt-0.5 text-center">
                                    {domain}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-500 py-1">
                        No photos found. Type a product name below and click "✨ AI Web Photo".
                      </div>
                    )}
                  </div>
                )}
                
                {prodImagePreview ? (
                  <div className="flex items-center space-x-4 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0">
                      <img
                        src={prodImagePreview}
                        alt="Product preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="text-xs font-semibold text-slate-800 truncate">
                        {prodImageFile?.name || 'Uploaded photo'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {prodImageFile ? `${(prodImageFile.size / 1024).toFixed(1)} KB` : ''}
                      </div>
                      <div className="flex items-center space-x-2">
                        <label className="cursor-pointer bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold px-2.5 py-1 rounded-lg text-[11px] transition shadow-2xs">
                          Change Image
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/jpg"
                            onChange={handleAddImageChange}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={handleRemoveAddImage}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold px-2.5 py-1 rounded-lg text-[11px] transition"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/60 hover:bg-emerald-50/30 rounded-2xl cursor-pointer transition text-center group">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div className="font-bold text-slate-800 text-xs">Add Product Photo</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      JPG, PNG, or WEBP up to 5MB
                    </div>
                    <div className="mt-2.5 bg-white border border-slate-200 text-slate-700 font-semibold px-3 py-1 rounded-lg text-[11px] shadow-2xs group-hover:border-emerald-400">
                      Choose Image
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={handleAddImageChange}
                      className="hidden"
                    />
                  </label>
                )}

                {prodImageError && (
                  <div className="text-rose-600 text-[11px] font-semibold flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{prodImageError}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dove Shampoo, Tata Salt, Fortune Oil"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option value="Personal Care">Personal Care</option>
                    <option value="Staples & Grains">Staples &amp; Grains</option>
                    <option value="Dairy & Eggs">Dairy &amp; Eggs</option>
                    <option value="Oils & Masalas">Oils &amp; Masalas</option>
                    <option value="Snacks & Instant Food">Snacks &amp; Instant Food</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Household Essentials">Household Essentials</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 249.00"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                  />
                </div>
              </div>

              {/* Package size & Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Package Size / Quantity *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 340, 1, 500"
                    value={prodQuantity}
                    onChange={(e) => setProdQuantity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Product Unit *</label>
                  <select
                    value={prodUnit}
                    onChange={(e) => setProdUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                  >
                    <option value="ml">ml</option>
                    <option value="Gram">Gram</option>
                    <option value="Kg">Kg</option>
                    <option value="Litre">Litre</option>
                    <option value="Packet">Packet</option>
                    <option value="Piece">Piece</option>
                    <option value="Box">Box</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Initial Stock Count *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 20"
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Low-Stock Warning Level</label>
                  <input
                    type="number"
                    value={prodThreshold}
                    onChange={(e) => setProdThreshold(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              {/* Physical Store Location Fields (Aisle, Row, Shelf) */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-sky-600" />
                  <span>Physical Location Inside Store *</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Aisle</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 5"
                      value={prodAisle}
                      onChange={(e) => setProdAisle(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Row</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 7"
                      value={prodRow}
                      onChange={(e) => setProdRow(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Shelf</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2"
                      value={prodShelf}
                      onChange={(e) => setProdShelf(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  disabled={isAddingLoading}
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-xl shadow-sm transition flex items-center space-x-2"
                >
                  {isAddingLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isAddingLoading ? 'Saving...' : 'Save to Inventory'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Edit Product Modal (Photo, Details, Pricing, Placement) */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Product</h3>
                <p className="text-xs text-slate-500 truncate max-w-[280px]">
                  {editingProduct.name} &bull; {selectedStore?.name}
                </p>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditProductSubmit} className="space-y-4 text-xs">
              {/* Product Photo Edit / Replace Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                    Product Photo
                  </label>
                  <button
                    type="button"
                    onClick={() => handleSearchAiPhotos('edit')}
                    className="flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-lg transition shadow-2xs cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span>✨ AI Web Photo</span>
                  </button>
                </div>

                {showAiPhotoPicker && aiPhotoTarget === 'edit' && (
                  <div className="p-3 bg-gradient-to-br from-indigo-50/70 to-purple-50/50 rounded-2xl border border-indigo-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="text-xs font-bold text-indigo-950">AI Web Photo Suggestions</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAiPhotoPicker(false)}
                        className="text-slate-400 hover:text-slate-600 text-[11px] cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                    {aiPhotoSearchLoading ? (
                      <div className="flex items-center space-x-2 py-3 text-xs text-indigo-600 font-medium">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Searching product web photos...</span>
                      </div>
                    ) : aiPhotoCandidates.length > 0 ? (
                      <div>
                        <p className="text-[11px] text-slate-600 mb-2">Click an image below to set it as this product's photo:</p>
                        <div className="grid grid-cols-4 gap-2">
                          {aiPhotoCandidates.map((item, idx) => {
                            const url = typeof item === 'string' ? item : item.imageUrl;
                            const title = typeof item === 'object' ? item.title : '';
                            const domain = typeof item === 'object' ? item.sourceName : '';
                            const score = typeof item === 'object' ? item.relevanceScore : null;
                            return (
                              <div
                                key={idx}
                                onClick={() => handlePickAiPhoto(item)}
                                className="relative rounded-xl overflow-hidden border-2 border-slate-200 hover:border-indigo-600 cursor-pointer bg-white transition hover:scale-105 group shadow-xs p-1 flex flex-col justify-between"
                                title={title || "Select this photo"}
                              >
                                <div className="aspect-square w-full rounded-lg overflow-hidden bg-white flex items-center justify-center relative">
                                  <img src={item.thumbnailUrl || url} alt={title || `Candidate ${idx}`} className="w-full h-full object-contain" />
                                  <div className="absolute inset-0 bg-indigo-900/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                    <Check className="w-4 h-4 text-white drop-shadow" />
                                  </div>
                                  {score > 0 && (
                                    <div className="absolute bottom-0.5 left-0.5 bg-slate-900/80 text-white text-[8px] font-bold px-1 rounded">
                                      {score}%
                                    </div>
                                  )}
                                </div>
                                {domain && (
                                  <div className="text-[9px] text-slate-500 truncate pt-0.5 text-center">
                                    {domain}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-500 py-1">
                        No photos found. Check the product name above and click "✨ AI Web Photo".
                      </div>
                    )}
                  </div>
                )}

                {editImagePreview ? (
                  <div className="flex items-center space-x-4 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0">
                      <img
                        src={editImagePreview}
                        alt="Product preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="text-xs font-semibold text-slate-800 truncate">
                        {editImageFile ? editImageFile.name : 'Current Photo'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {editImageFile ? `${(editImageFile.size / 1024).toFixed(1)} KB` : 'Active on store'}
                      </div>
                      <div className="flex items-center space-x-2">
                        <label className="cursor-pointer bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold px-2.5 py-1 rounded-lg text-[11px] transition shadow-2xs">
                          Change Image
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/jpg"
                            onChange={handleEditImageChange}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={handleRemoveEditImage}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold px-2.5 py-1 rounded-lg text-[11px] transition"
                        >
                          Remove Photo
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/60 hover:bg-emerald-50/30 rounded-2xl cursor-pointer transition text-center group">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div className="font-bold text-slate-800 text-xs">+ Add Product Photo</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      JPG, PNG, or WEBP up to 5MB
                    </div>
                    <div className="mt-2.5 bg-white border border-slate-200 text-slate-700 font-semibold px-3 py-1 rounded-lg text-[11px] shadow-2xs group-hover:border-emerald-400">
                      Choose Image
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={handleEditImageChange}
                      className="hidden"
                    />
                  </label>
                )}

                {editImageError && (
                  <div className="text-rose-600 text-[11px] font-semibold flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{editImageError}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={editProdName}
                  onChange={(e) => setEditProdName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={editProdCategory}
                    onChange={(e) => setEditProdCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option value="Personal Care">Personal Care</option>
                    <option value="Staples & Grains">Staples &amp; Grains</option>
                    <option value="Dairy & Eggs">Dairy &amp; Eggs</option>
                    <option value="Oils & Masalas">Oils &amp; Masalas</option>
                    <option value="Snacks & Instant Food">Snacks &amp; Instant Food</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Household Essentials">Household Essentials</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editProdPrice}
                    onChange={(e) => setEditProdPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                  />
                </div>
              </div>

              {/* Package size & Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Package Size / Quantity *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editProdQuantity}
                    onChange={(e) => setEditProdQuantity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Product Unit *</label>
                  <select
                    value={editProdUnit}
                    onChange={(e) => setEditProdUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                  >
                    <option value="ml">ml</option>
                    <option value="Gram">Gram</option>
                    <option value="Kg">Kg</option>
                    <option value="Litre">Litre</option>
                    <option value="Packet">Packet</option>
                    <option value="Piece">Piece</option>
                    <option value="Box">Box</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Current Stock Count *</label>
                  <input
                    type="number"
                    required
                    value={editProdStock}
                    onChange={(e) => setEditProdStock(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Low-Stock Warning Level</label>
                  <input
                    type="number"
                    value={editProdThreshold}
                    onChange={(e) => setEditProdThreshold(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              {/* Physical Store Location Fields */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-sky-600" />
                  <span>Physical Location Inside Store *</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Aisle</label>
                    <input
                      type="text"
                      required
                      value={editProdAisle}
                      onChange={(e) => setEditProdAisle(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Row</label>
                    <input
                      type="text"
                      required
                      value={editProdRow}
                      onChange={(e) => setEditProdRow(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Shelf</label>
                    <input
                      type="text"
                      required
                      value={editProdShelf}
                      onChange={(e) => setEditProdShelf(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  disabled={isEditingLoading}
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditingLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-xl shadow-sm transition flex items-center space-x-2"
                >
                  {isEditingLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isEditingLoading ? 'Updating...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Location Only Modal (When Product is Physically Moved) */}
      {editingLocationProd && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Physical Placement</h3>
                <p className="text-xs text-slate-500 truncate max-w-[280px]">
                  {editingLocationProd.name}
                </p>
              </div>
              <button
                onClick={() => setEditingLocationProd(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLocation} className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800">Update Shelf Assignment</div>
                <p className="text-[11px] text-slate-500">
                  Update the physical coordinates when moving this product to a different shelf in {selectedStore?.name}.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Aisle *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aisle 5"
                    value={editAisle}
                    onChange={(e) => setEditAisle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Row *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Row 7"
                    value={editRow}
                    onChange={(e) => setEditRow(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Shelf *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shelf 2"
                    value={editShelf}
                    onChange={(e) => setEditShelf(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingLocationProd(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-5 py-2 rounded-xl shadow-sm transition"
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Map Preview Modal for Shopkeepers */}
      <IndoorStoreMapModal
        isOpen={isMapPreviewOpen}
        onClose={() => setIsMapPreviewOpen(false)}
        product={mapPreviewProduct}
        store={selectedStore}
      />
    </div>
  );
}
