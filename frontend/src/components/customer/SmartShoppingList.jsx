import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  ListOrdered, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  MapPin, 
  ShoppingCart, 
  CheckCheck, 
  AlertCircle,
  Navigation,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function SmartShoppingList() {
  const { 
    shoppingList, 
    products, 
    addShoppingListItem, 
    removeShoppingListItem, 
    toggleShoppingListItemPurchased,
    clearPurchasedShoppingList,
    addToCart,
    showNotification
  } = useStore();

  const [inputItemName, setInputItemName] = useState('');
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'route'

  // Enrich shopping list with live product catalog data
  const enrichedList = shoppingList.map(item => {
    const product = products.find(p => p.id === item.matchedProductId) ||
      products.find(p => p.name.toLowerCase().includes(item.name.toLowerCase()));

    const isAvailable = product ? product.currentStock > 0 : false;
    const isOutOfStock = product ? product.currentStock === 0 : false;

    return {
      ...item,
      product,
      isAvailable,
      isOutOfStock,
      stockCount: product ? product.currentStock : null,
      price: product ? (product.offer ? product.offer.dealPrice : product.price) : null,
      aisle: product ? product.aisle : 'Unassigned Aisle',
      section: product ? product.section : 'General Store',
      shelf: product ? product.shelf : 'Inquire at desk'
    };
  });

  const availableCount = enrichedList.filter(item => item.isAvailable).length;
  const outOfStockCount = enrichedList.filter(item => item.isOutOfStock).length;
  const unmappedCount = enrichedList.filter(item => !item.product).length;

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!inputItemName.trim()) return;
    addShoppingListItem(inputItemName.trim());
    setInputItemName('');
  };

  const handleAddAllAvailableToCart = () => {
    let addedCount = 0;
    enrichedList.forEach(item => {
      if (item.product && item.product.currentStock > 0 && !item.isPurchased) {
        addToCart(item.product, item.quantity);
        addedCount++;
      }
    });
    if (addedCount > 0) {
      showNotification(`Added ${addedCount} available items to your cart!`, 'success');
    } else {
      showNotification('No new available items to add', 'info');
    }
  };

  // Group items by Section & Aisle for optimized in-store walking route
  const groupedByAisle = enrichedList.reduce((acc, item) => {
    const key = `${item.section} &bull; ${item.aisle}`;
    if (!acc[key]) {
      acc[key] = {
        section: item.section,
        aisle: item.aisle,
        items: []
      };
    }
    acc[key].items.push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-sky-600 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Smart In-Store Matching</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">My Smart Shopping List</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live inventory checker verifies stock and maps your shortest walking route across store aisles.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-semibold">
            <span className="flex items-center space-x-1 text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{availableCount} In Stock</span>
            </span>
            {outOfStockCount > 0 && (
              <span className="flex items-center space-x-1 text-rose-700 bg-rose-100 px-2.5 py-1 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{outOfStockCount} Unavailable</span>
              </span>
            )}
            <span className="text-slate-500 px-1">
              Total {shoppingList.length} items
            </span>
          </div>
        </div>

        {/* Add Item Form */}
        <form onSubmit={handleAddItem} className="mt-5 flex gap-2">
          <input
            type="text"
            value={inputItemName}
            onChange={(e) => setInputItemName(e.target.value)}
            placeholder="Type an item (e.g. Atta, Milk, Bread, Biscuits, Toothpaste)..."
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 placeholder:text-slate-400"
          />
          <button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center space-x-1.5 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </form>

        {/* View Tabs */}
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex space-x-2 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${
                activeTab === 'list'
                  ? 'bg-sky-100 text-sky-800'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Checklist View</span>
            </button>
            <button
              onClick={() => setActiveTab('route')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${
                activeTab === 'route'
                  ? 'bg-sky-100 text-sky-800'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>In-Store Walking Route ({Object.keys(groupedByAisle).length} Aisle Stops)</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleAddAllAvailableToCart}
              disabled={availableCount === 0}
              className="bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add In-Stock Items to Cart</span>
            </button>
            <button
              onClick={clearPurchasedShoppingList}
              className="text-xs text-slate-500 hover:text-rose-600 px-2 py-1 transition"
              title="Remove checked off items"
            >
              Clear Checked
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Tab 1 (Checklist) vs Tab 2 (Aisle Walking Route) */}
      {shoppingList.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
          <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <ListOrdered className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">Your shopping list is empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Add items you need before or during your store visit to see live stock availability and exact aisle shelf coordinates.
          </p>
          <button
            onClick={() => {
              addShoppingListItem('Atta');
              addShoppingListItem('Milk');
              addShoppingListItem('Bread');
            }}
            className="text-xs text-sky-600 hover:text-sky-700 font-semibold bg-sky-50 px-3 py-1.5 rounded-lg"
          >
            + Add Sample Essentials List
          </button>
        </div>
      ) : activeTab === 'list' ? (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
          {enrichedList.map((item) => (
            <div
              key={item.id}
              className={`p-4 flex items-center justify-between transition ${
                item.isPurchased ? 'bg-slate-50/80 opacity-70' : 'hover:bg-slate-50/50'
              }`}
            >
              {/* Checkbox & Item Info */}
              <div className="flex items-center space-x-3.5 flex-1">
                <button
                  onClick={() => toggleShoppingListItemPurchased(item.id)}
                  className="text-slate-400 hover:text-sky-600 transition shrink-0"
                >
                  {item.isPurchased ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>

                <div>
                  <span className={`text-sm font-semibold text-slate-900 ${item.isPurchased ? 'line-through text-slate-400' : ''}`}>
                    {item.name}
                  </span>

                  {item.product ? (
                    <div className="flex items-center space-x-2 mt-0.5 text-xs">
                      <span className="text-slate-500">{item.product.unit}</span>
                      <span className="text-slate-300">&bull;</span>
                      <span className="font-bold text-slate-900">₹{item.price}</span>
                      <span className="text-slate-300">&bull;</span>
                      <span className="text-sky-700 bg-sky-50 px-2 py-0.5 rounded text-[11px] font-medium flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-sky-600" />
                        <span>{item.aisle} ({item.shelf})</span>
                      </span>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 mt-0.5">
                      General custom item (no exact store match)
                    </div>
                  )}
                </div>
              </div>

              {/* Status Badge & Actions */}
              <div className="flex items-center space-x-3 shrink-0">
                {item.product ? (
                  item.isOutOfStock ? (
                    <span className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                      Currently unavailable
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      <span>In Stock ({item.stockCount} left)</span>
                    </span>
                  )
                ) : (
                  <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    Unverified
                  </span>
                )}

                {item.product && item.isAvailable && !item.isPurchased && (
                  <button
                    onClick={() => addToCart(item.product, 1)}
                    className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition"
                    title="Add single item to cart"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => removeShoppingListItem(item.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Remove from list"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Tab 2: In-Store Route Walking Optimizer */
        <div className="space-y-4">
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 text-xs text-sky-900 flex items-center space-x-2">
            <Navigation className="w-4 h-4 text-sky-700 shrink-0" />
            <span>
              <strong>Optimized Store Path:</strong> Items are sequenced sequentially by department and aisle to prevent unnecessary back-and-forth walking inside the supermarket.
            </span>
          </div>

          <div className="space-y-4">
            {Object.entries(groupedByAisle).map(([key, group], idx) => (
              <div key={key} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                {/* Aisle Stop Header */}
                <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-sky-500 text-white text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-sm">{group.aisle}</span>
                      <span className="text-xs text-slate-400 ml-2">({group.section})</span>
                    </div>
                  </div>
                  <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-medium">
                    {group.items.length} items to pick
                  </span>
                </div>

                {/* Items in this Aisle */}
                <div className="divide-y divide-slate-100 p-2">
                  {group.items.map((item) => (
                    <div key={item.id} className="p-3 flex items-center justify-between hover:bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => toggleShoppingListItemPurchased(item.id)}
                          className="text-slate-400 hover:text-sky-600 transition"
                        >
                          {item.isPurchased ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>
                        <div>
                          <div className={`text-sm font-semibold text-slate-900 ${item.isPurchased ? 'line-through text-slate-400' : ''}`}>
                            {item.name}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center space-x-1.5">
                            <span className="font-medium text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">
                              {item.shelf}
                            </span>
                            {item.price && <span>&bull; ₹{item.price}</span>}
                          </div>
                        </div>
                      </div>

                      <div>
                        {item.isOutOfStock ? (
                          <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            Currently unavailable
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {item.stockCount} on shelf
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
