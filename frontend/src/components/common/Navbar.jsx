import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import RegisterShopModal from './RegisterShopModal';
import { 
  Store, 
  ShoppingCart, 
  ListOrdered, 
  MapPin, 
  User, 
  ShieldCheck, 
  Tag, 
  Package, 
  TrendingUp, 
  Layers, 
  AlertCircle,
  Clock,
  Building2, 
  Plus, 
  CheckCircle2, 
  X, 
  Receipt, 
  Wrench,
  LogOut,
  Bell,
  ChevronDown,
  Star,
  Search,
  SlidersHorizontal,
  Compass,
  Bot
} from 'lucide-react';

export default function Navbar() {
  const { 
    customerView, 
    setCustomerView,
    retailerView,
    setRetailerView,
    adminView,
    setAdminView,
    cart, 
    shoppingList, 
    setIsCartOpen,
    orders,
    products,
    stores,
    selectedStore,
    switchStore,
    addCustomStore,
    setIsVoiceAssistantOpen,
    notifications = [],
    unreadNotificationCount = 0,
    onNotificationClick,
    markAllNotificationsAsRead
  } = useStore();

  const { user, role, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isAddCustomStoreOpen, setIsAddCustomStoreOpen] = useState(false);
  const [isRegisterShopModalOpen, setIsRegisterShopModalOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [storeSearchQuery, setStoreSearchQuery] = useState('');
  const [storeFilterType, setStoreFilterType] = useState('ALL');

  const dropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // New store form state
  const [customName, setCustomName] = useState('');
  const [customType, setCustomType] = useState('KIRANA_STORE');
  const [customOwner, setCustomOwner] = useState('');
  const [customAddress, setCustomAddress] = useState('');
  const [customPhone, setCustomPhone] = useState('+91 98765 12345');

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const currentRole = (user?.role || role || '').toUpperCase();
  const normalizedRole = 
    currentRole === 'RETAILER' ? 'SHOPKEEPER' :
    currentRole === 'STORE_MANAGER' ? 'SUPERMARKET_MANAGER' :
    currentRole;
  const isCustomer = normalizedRole === 'CUSTOMER';

  const handleLogout = () => {
    setIsUserDropdownOpen(false);
    logout();
    navigate('/login');
  };

  const handleCreateCustomStore = (e) => {
    e.preventDefault();
    if (!customName.trim()) return;
    addCustomStore({
      name: customName.trim(),
      storeType: customType,
      ownerName: customOwner || 'Store Owner',
      address: customAddress || 'Local Main Road',
      phone: customPhone
    });
    setCustomName('');
    setCustomOwner('');
    setCustomAddress('');
    setIsAddCustomStoreOpen(false);
    setIsStoreModalOpen(false);
  };

  const filteredModalStores = stores.filter(s => {
    const matchesSearch = !storeSearchQuery || s.name.toLowerCase().includes(storeSearchQuery.toLowerCase()) || (s.address && s.address.toLowerCase().includes(storeSearchQuery.toLowerCase()));
    const matchesType = storeFilterType === 'ALL' || (storeFilterType === 'SUPERMARKET' ? s.storeType === 'SUPERMARKET' : s.storeType !== 'SUPERMARKET');
    return matchesSearch && matchesType;
  });

  const activeStoreDisplayName = user?.storeName || selectedStore?.name || (user?.store?.name) || 'My Store';
  const userName = user?.name || user?.fullName || 'User';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-xs">
      {/* Top Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Left: Brand + Active Store Switcher / Badge */}
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
            {/* Logo */}
            <Link 
              to={normalizedRole === 'CUSTOMER' ? '/customer/dashboard' : normalizedRole === 'SHOPKEEPER' ? '/shopkeeper/dashboard' : normalizedRole === 'SUPERMARKET_MANAGER' ? '/manager/dashboard' : '/admin/dashboard'}
              className="flex items-center space-x-2 shrink-0 group"
            >
              <div className="w-9 h-9 rounded-xl bg-retail-800 text-white flex items-center justify-center font-bold shadow-xs group-hover:bg-retail-700 transition">
                <Store className="w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <span className="font-extrabold text-lg text-charcoal tracking-tight font-display">ShopNear</span>
                <span className="text-[10px] block text-slate-400 font-medium -mt-1 leading-none">Smart Retail Network</span>
              </div>
            </Link>

            {/* 1. CUSTOMER ONLY: Clean Store Selector Pill (Dropdown to change store) */}
            {isCustomer && (
              <button
                onClick={() => setIsStoreModalOpen(true)}
                className="flex items-center space-x-2 bg-surface hover:bg-emerald-50/70 border border-gray-200 hover:border-retail-600 px-3 py-1.5 rounded-full text-xs font-semibold text-charcoal transition shadow-2xs group min-w-0 max-w-[280px] sm:max-w-xs cursor-pointer"
                title="Click to switch store"
              >
                <span className="w-2 h-2 rounded-full bg-retail-600 shrink-0"></span>
                <span className="truncate font-bold text-slate-900">
                  {selectedStore?.name || 'Select Store'}
                </span>
                <span className="text-slate-400 hidden sm:inline">&bull;</span>
                <span className="text-slate-500 font-normal hidden sm:inline shrink-0">
                  {selectedStore?.distance || 'Nearby'}
                </span>
                {selectedStore?.averageRating && (
                  <>
                    <span className="text-slate-400 hidden md:inline">&bull;</span>
                    <span className="inline-flex items-center space-x-0.5 text-amber-700 font-bold bg-amber-50 px-1.5 py-0.2 rounded shrink-0">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span>{Number(selectedStore.averageRating).toFixed(1)}</span>
                    </span>
                  </>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-retail-800 shrink-0 transition" />
              </button>
            )}

            {/* 2. NON-CUSTOMER ROLES: NO DROPDOWN TO CHANGE STORE - Fixed assigned store / role badge */}
            {!isCustomer && (
              <>
                {normalizedRole === 'SHOPKEEPER' && (
                  <div className="flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold text-retail-800 select-none">
                    <Store className="w-3.5 h-3.5 text-retail-700" />
                    <span className="truncate max-w-[160px] sm:max-w-xs">{activeStoreDisplayName}</span>
                    <span className="text-[10px] bg-emerald-200/70 text-emerald-900 px-1.5 py-0.2 rounded font-semibold ml-1">🔒 Locked</span>
                  </div>
                )}

                {normalizedRole === 'SUPERMARKET_MANAGER' && (
                  <div className="flex items-center space-x-1.5 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full text-xs font-bold text-teal-800 select-none">
                    <Building2 className="w-3.5 h-3.5 text-teal-700" />
                    <span className="truncate max-w-[160px] sm:max-w-xs">{activeStoreDisplayName}</span>
                    <span className="text-[10px] bg-teal-200/70 text-teal-900 px-1.5 py-0.2 rounded font-semibold ml-1">🏢 Mart</span>
                  </div>
                )}

                {normalizedRole === 'ADMIN' && (
                  <div className="flex items-center space-x-1.5 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full text-xs font-bold text-indigo-900 select-none">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-700" />
                    <span>Admin Control Center</span>
                  </div>
                )}

                {!['SHOPKEEPER', 'SUPERMARKET_MANAGER', 'ADMIN'].includes(normalizedRole) && activeStoreDisplayName && (
                  <div className="flex items-center space-x-1.5 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full text-xs font-bold text-slate-700 select-none">
                    <Store className="w-3.5 h-3.5 text-slate-600" />
                    <span className="truncate max-w-[160px] sm:max-w-xs">{activeStoreDisplayName}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right: Notifications, Cart, User Profile Dropdown */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            
            {/* Customer Shopping List & Cart */}
            {normalizedRole === 'CUSTOMER' && (
              <>
                <button
                  onClick={() => setCustomerView('list')}
                  className={`p-2 rounded-xl text-slate-600 hover:text-charcoal hover:bg-gray-100 transition relative ${
                    customerView === 'list' ? 'bg-emerald-50 text-retail-800 font-bold' : ''
                  }`}
                  title="My Shopping List"
                >
                  <ListOrdered className="w-5 h-5" />
                  {shoppingList.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-retail-800 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                      {shoppingList.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setIsCartOpen(true)}
                  className="flex items-center space-x-1.5 bg-retail-800 hover:bg-retail-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition shadow-xs"
                  title="View Cart & Express Pickup"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span className="hidden sm:inline">Cart</span>
                  <span className="bg-retail-950 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    {totalCartCount}
                  </span>
                </button>
              </>
            )}

            {/* Notification Bell & Dropdown */}
            {normalizedRole === 'CUSTOMER' ? (
              <div className="relative" ref={notificationDropdownRef}>
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="p-2 rounded-xl text-slate-500 hover:text-charcoal hover:bg-gray-100 transition relative"
                  title="Order Notifications"
                  aria-label="Order Notifications"
                >
                  <Bell className="w-4.5 h-4.5" />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center shadow-xs">
                      {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                    </span>
                  )}
                </button>

                {/* Customer Notification Popup */}
                {isNotificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-modal border border-gray-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                    <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-charcoal text-sm">Notifications</span>
                        {unreadNotificationCount > 0 && (
                          <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-100">
                            {unreadNotificationCount} unread
                          </span>
                        )}
                      </div>
                      {unreadNotificationCount > 0 && (
                        <button
                          onClick={markAllNotificationsAsRead}
                          className="text-[11px] font-semibold text-retail-700 hover:text-retail-800 transition"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-400">
                          <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          <p className="font-medium text-xs">No notifications yet</p>
                          <p className="text-[11px] mt-0.5">Order updates will appear here</p>
                        </div>
                      ) : (
                        notifications.map((notif) => {
                          const isUnread = !notif.isRead;
                          return (
                            <div
                              key={notif.id}
                              onClick={() => onNotificationClick(notif)}
                              className={`p-3.5 transition cursor-pointer flex items-start space-x-3 hover:bg-gray-50 ${
                                isUnread ? 'bg-emerald-50/40' : 'bg-white'
                              }`}
                              title={isUnread ? 'Click to mark as read' : ''}
                            >
                              <div className="mt-0.5 shrink-0">
                                {isUnread ? (
                                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 mt-1 shadow-xs" />
                                ) : (
                                  <div className="w-2.5 h-2.5 rounded-full bg-transparent mt-1" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1 mb-0.5">
                                  <h4 className={`text-xs truncate ${isUnread ? 'font-bold text-charcoal' : 'font-medium text-slate-700'}`}>
                                    {notif.title}
                                  </h4>
                                  <span className="text-[10px] text-slate-400 shrink-0">
                                    {notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                  </span>
                                </div>
                                <p className={`text-[11px] leading-relaxed break-words ${isUnread ? 'text-slate-800' : 'text-slate-500'}`}>
                                  {notif.message}
                                </p>
                                {notif.storeName && (
                                  <div className="mt-1 flex items-center space-x-1 text-[10px] text-slate-400">
                                    <Store className="w-3 h-3 text-slate-400 inline" />
                                    <span className="truncate">{notif.storeName}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Non-customer notification bell (Shopkeeper, Supermarket Manager, Admin) */
              <button
                onClick={() => {
                  if (normalizedRole === 'SHOPKEEPER' || normalizedRole === 'SUPERMARKET_MANAGER') setRetailerView('orders');
                }}
                className="p-2 rounded-xl text-slate-500 hover:text-charcoal hover:bg-gray-100 transition relative"
                title="Notifications & Pickup Orders"
              >
                <Bell className="w-4.5 h-4.5" />
                {orders.filter(o => o.status === 'PENDING').length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white"></span>
                )}
              </button>
            )}

            {/* User Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center space-x-2 bg-white hover:bg-gray-50 border border-gray-200 py-1.5 px-2.5 rounded-xl transition shadow-2xs text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-charcoal truncate max-w-[100px] leading-tight">
                    {userName}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium -mt-0.5 capitalize">
                    {normalizedRole.toLowerCase().replace('_', ' ')}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-modal border border-gray-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="font-bold text-charcoal truncate">{userName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                      {normalizedRole}
                    </span>
                  </div>

                  {normalizedRole === 'SHOPKEEPER' && (
                    <button
                      onClick={() => {
                        setRetailerView('profile');
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-slate-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Store className="w-4 h-4 text-slate-400" />
                      <span>Shop Profile Settings</span>
                    </button>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 flex items-center space-x-2 font-bold border-t border-gray-100 mt-1"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Streamlined Secondary Navigation Ribbon */}
        {isAuthenticated && (
          <nav className="flex space-x-1 border-t border-gray-100 py-1.5 overflow-x-auto text-xs font-semibold scrollbar-none">
            
            {/* 1. CUSTOMER NAVIGATION (Discover | Stores | Shopping List | Aisle Locator | Orders) */}
            {normalizedRole === 'CUSTOMER' && (
              <>
                <button
                  onClick={() => setCustomerView('browse')}
                  className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition whitespace-nowrap ${
                    customerView === 'browse' 
                      ? 'bg-retail-800 text-white font-bold shadow-2xs' 
                      : 'text-slate-600 hover:text-charcoal hover:bg-gray-100'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Discover</span>
                </button>

                <button
                  onClick={() => setCustomerView('stores')}
                  className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition whitespace-nowrap ${
                    customerView === 'stores' 
                      ? 'bg-retail-800 text-white font-bold shadow-2xs' 
                      : 'text-slate-600 hover:text-charcoal hover:bg-gray-100'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Stores</span>
                </button>

                <button
                  onClick={() => setCustomerView('list')}
                  className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition whitespace-nowrap ${
                    customerView === 'list' 
                      ? 'bg-retail-800 text-white font-bold shadow-2xs' 
                      : 'text-slate-600 hover:text-charcoal hover:bg-gray-100'
                  }`}
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                  <span>Shopping List ({shoppingList.length})</span>
                </button>

                <button
                  onClick={() => setCustomerView('aisles')}
                  className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition whitespace-nowrap ${
                    customerView === 'aisles' 
                      ? 'bg-retail-800 text-white font-bold shadow-2xs' 
                      : 'text-slate-600 hover:text-charcoal hover:bg-gray-100'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Aisle Locator</span>
                </button>

                <button
                  onClick={() => setCustomerView('orders')}
                  className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition whitespace-nowrap ${
                    customerView === 'orders' 
                      ? 'bg-retail-800 text-white font-bold shadow-2xs' 
                      : 'text-slate-600 hover:text-charcoal hover:bg-gray-100'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Orders ({orders.length})</span>
                </button>
              </>
            )}

            {/* 2. SHOPKEEPER NAVIGATION (Overview | Inventory | POS | Sales | Pickup | Store) */}
            {normalizedRole === 'SHOPKEEPER' && (
              <>
                <button
                  onClick={() => setRetailerView('overview')}
                  className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition whitespace-nowrap ${
                    retailerView === 'overview' 
                      ? 'bg-retail-800 text-white font-bold shadow-2xs' 
                      : 'text-slate-600 hover:text-charcoal hover:bg-gray-100'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Overview</span>
                </button>

                <button
                  onClick={() => setRetailerView('inventory')}
                  className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition whitespace-nowrap ${
                    retailerView === 'inventory' 
                      ? 'bg-retail-800 text-white font-bold shadow-2xs' 
                      : 'text-slate-600 hover:text-charcoal hover:bg-gray-100'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Inventory ({products.length})</span>
                </button>

                <button
                  onClick={() => setRetailerView('sales')}
                  className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition whitespace-nowrap ${
                    retailerView === 'sales' 
                      ? 'bg-retail-800 text-white font-bold shadow-2xs' 
                      : 'text-slate-600 hover:text-charcoal hover:bg-gray-100'
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>POS Billing</span>
                </button>

                <button
                  onClick={() => setRetailerView('sales_history')}
                  className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition whitespace-nowrap ${
                    retailerView === 'sales_history' 
                      ? 'bg-retail-800 text-white font-bold shadow-2xs' 
                      : 'text-slate-600 hover:text-charcoal hover:bg-gray-100'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Sales</span>
                </button>

                <button
                  onClick={() => setRetailerView('orders')}
                  className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition whitespace-nowrap ${
                    retailerView === 'orders' 
                      ? 'bg-retail-800 text-white font-bold shadow-2xs' 
                      : 'text-slate-600 hover:text-charcoal hover:bg-gray-100'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pickup</span>
                </button>

                <button
                  onClick={() => setRetailerView('profile')}
                  className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition whitespace-nowrap ${
                    retailerView === 'profile' 
                      ? 'bg-retail-800 text-white font-bold shadow-2xs' 
                      : 'text-slate-600 hover:text-charcoal hover:bg-gray-100'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Store</span>
                </button>

                <button
                  onClick={() => setIsVoiceAssistantOpen(true)}
                  className="px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition whitespace-nowrap bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold border border-emerald-200 cursor-pointer shadow-2xs"
                  title="Open AI Inventory Assistant"
                >
                  <Bot className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  <span>AI Assistant</span>
                </button>
              </>
            )}

            {/* 3. SUPERMARKET MANAGER NAVIGATION (Overview | Floor Layout | Inventory | Promotions | Pickup | Maintenance) */}
            {normalizedRole === 'SUPERMARKET_MANAGER' && (
              <>
                <button
                  onClick={() => setRetailerView('overview')}
                  className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition whitespace-nowrap ${
                    retailerView === 'overview' 
                      ? 'bg-retail-800 text-white font-bold shadow-2xs' 
                      : 'text-slate-600 hover:text-charcoal hover:bg-gray-100'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Overview</span>
                </button>

                <button
                  onClick={() => setRetailerView('layout')}
                  className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition whitespace-nowrap ${
                    retailerView === 'layout' 
                      ? 'bg-retail-800 text-white font-bold shadow-2xs' 
                      : 'text-slate-600 hover:text-charcoal hover:bg-gray-100'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Floor Layout</span>
                </button>

                <button
                  onClick={() => setRetailerView('inventory')}
                  className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition whitespace-nowrap ${
                    retailerView === 'inventory' 
                      ? 'bg-retail-800 text-white font-bold shadow-2xs' 
                      : 'text-slate-600 hover:text-charcoal hover:bg-gray-100'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Inventory</span>
                </button>

                <button
                  onClick={() => setRetailerView('offers')}
                  className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition whitespace-nowrap ${
                    retailerView === 'offers' 
                      ? 'bg-retail-800 text-white font-bold shadow-2xs' 
                      : 'text-slate-600 hover:text-charcoal hover:bg-gray-100'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Promotions</span>
                </button>

                <button
                  onClick={() => setRetailerView('orders')}
                  className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition whitespace-nowrap ${
                    retailerView === 'orders' 
                      ? 'bg-retail-800 text-white font-bold shadow-2xs' 
                      : 'text-slate-600 hover:text-charcoal hover:bg-gray-100'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pickup</span>
                </button>

                <button
                  onClick={() => setRetailerView('issues')}
                  className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition whitespace-nowrap ${
                    retailerView === 'issues' 
                      ? 'bg-retail-800 text-white font-bold shadow-2xs' 
                      : 'text-slate-600 hover:text-charcoal hover:bg-gray-100'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Maintenance</span>
                </button>
              </>
            )}

            {/* 4. ADMIN NAVIGATION (Control Center | Users | Stores | Catalog | Issues) */}
            {normalizedRole === 'ADMIN' && (
              <>
                <button
                  onClick={() => setAdminView('overview')}
                  className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition whitespace-nowrap ${
                    adminView === 'overview' 
                      ? 'bg-retail-800 text-white font-bold shadow-2xs' 
                      : 'text-slate-600 hover:text-charcoal hover:bg-gray-100'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Control Center</span>
                </button>

                <button
                  onClick={() => setAdminView('users')}
                  className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition whitespace-nowrap ${
                    adminView === 'users' 
                      ? 'bg-retail-800 text-white font-bold shadow-2xs' 
                      : 'text-slate-600 hover:text-charcoal hover:bg-gray-100'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Users</span>
                </button>

                <button
                  onClick={() => setAdminView('layout')}
                  className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition whitespace-nowrap ${
                    adminView === 'layout' 
                      ? 'bg-retail-800 text-white font-bold shadow-2xs' 
                      : 'text-slate-600 hover:text-charcoal hover:bg-gray-100'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Stores</span>
                </button>

                <button
                  onClick={() => setAdminView('inventory')}
                  className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition whitespace-nowrap ${
                    adminView === 'inventory' 
                      ? 'bg-retail-800 text-white font-bold shadow-2xs' 
                      : 'text-slate-600 hover:text-charcoal hover:bg-gray-100'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Catalog</span>
                </button>

                <button
                  onClick={() => setAdminView('issues')}
                  className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition whitespace-nowrap ${
                    adminView === 'issues' 
                      ? 'bg-retail-800 text-white font-bold shadow-2xs' 
                      : 'text-slate-600 hover:text-charcoal hover:bg-gray-100'
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Issues</span>
                </button>
              </>
            )}

          </nav>
        )}
      </div>

      {/* Store Switcher Modal (Only for Customer Role) */}
      {isCustomer && isStoreModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-modal flex flex-col border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 bg-white border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-charcoal font-display">Select Grocery Store</h3>
                <p className="text-xs text-slate-500">
                  Switch store context to view live products, aisles, and availability.
                </p>
              </div>

              <button
                onClick={() => {
                  setIsStoreModalOpen(false);
                  setIsAddCustomStoreOpen(false);
                }}
                className="p-1.5 text-slate-400 hover:text-charcoal rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search & Filter in Modal */}
            <div className="p-4 border-b border-gray-100 bg-surface flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search stores by name or area..."
                  value={storeSearchQuery}
                  onChange={(e) => setStoreSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-retail-600 outline-none"
                />
              </div>

              <div className="flex space-x-1">
                <button
                  onClick={() => setStoreFilterType('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${storeFilterType === 'ALL' ? 'bg-retail-800 text-white' : 'bg-white text-slate-600 border border-gray-200'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setStoreFilterType('KIRANA')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${storeFilterType === 'KIRANA' ? 'bg-retail-800 text-white' : 'bg-white text-slate-600 border border-gray-200'}`}
                >
                  Kirana
                </button>
                <button
                  onClick={() => setStoreFilterType('SUPERMARKET')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${storeFilterType === 'SUPERMARKET' ? 'bg-retail-800 text-white' : 'bg-white text-slate-600 border border-gray-200'}`}
                >
                  Supermarket
                </button>
              </div>
            </div>

            {/* Store List */}
            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              {filteredModalStores.map((store) => {
                const isSelected = store.id === selectedStore?.id;
                const isStoreSupermarket = store.storeType === 'SUPERMARKET';

                return (
                  <div
                    key={store.id}
                    onClick={() => {
                      switchStore(store.id);
                      setIsStoreModalOpen(false);
                    }}
                    className={`p-4 rounded-2xl border transition-retail cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-emerald-50/60 border-retail-600 ring-2 ring-retail-600/20 shadow-xs'
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-card'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-sm text-charcoal font-display">{store.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          isStoreSupermarket
                            ? 'bg-teal-50 text-teal-800 border border-teal-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}>
                          {isStoreSupermarket ? '🏢 Supermarket' : '🏪 Kirana Store'}
                        </span>

                        {store.averageRating !== null && store.averageRating !== undefined && store.reviewCount > 0 ? (
                          <span className="inline-flex items-center space-x-1 bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md text-[10px] font-bold">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span>{Number(store.averageRating).toFixed(1)}</span>
                            <span className="text-slate-400 font-normal">({store.reviewCount})</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-md">
                            No ratings yet
                          </span>
                        )}

                        {isSelected && (
                          <span className="text-[10px] bg-retail-800 text-white font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Selected</span>
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 flex items-center space-x-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{store.address}</span>
                        <span>&bull;</span>
                        <span className="font-medium text-slate-700">{store.distance}</span>
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center space-x-3 pt-0.5">
                        <span className="text-retail-700 font-medium">● Open: {store.timings}</span>
                        {isStoreSupermarket && <span>&bull; 9 Aisles</span>}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center">
                      {isSelected ? (
                        <span className="text-xs font-bold text-retail-800 bg-emerald-100 px-3 py-1.5 rounded-xl">
                          Active Store
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            switchStore(store.id);
                            setIsStoreModalOpen(false);
                          }}
                          className="w-full sm:w-auto bg-charcoal hover:bg-retail-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs"
                        >
                          Select Store
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredModalStores.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-400">
                  No stores match your search query.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-surface border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Showing {filteredModalStores.length} stores</span>
              <button
                onClick={() => {
                  setIsStoreModalOpen(false);
                  setIsRegisterShopModalOpen(true);
                }}
                className="text-xs font-bold text-retail-800 hover:underline flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Register New Shop</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register Shop Modal */}
      <RegisterShopModal
        isOpen={isRegisterShopModalOpen}
        onClose={() => setIsRegisterShopModalOpen(false)}
      />
    </header>
  );
}
