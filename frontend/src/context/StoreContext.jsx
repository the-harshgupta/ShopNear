import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_SECTIONS,
  INITIAL_AISLES,
  INITIAL_SUPPLIERS,
  INITIAL_ORDERS,
  INITIAL_DEMAND_INSIGHTS,
  INITIAL_OPERATIONAL_ISSUES,
  INITIAL_STORES
} from '../data/initialData';
import { api } from '../services/api';

import { useAuth } from './AuthContext';

const StoreContext = createContext(null);

export const StoreProvider = ({ children }) => {
  const { user } = useAuth();

  // Store Selection State (Switch between multiple stores / branches)
  const [stores, setStores] = useState(() => {
    const saved = localStorage.getItem('nexretail_stores');
    return saved ? JSON.parse(saved) : INITIAL_STORES;
  });

  const [selectedStore, setSelectedStore] = useState(() => {
    try {
      const savedUser = localStorage.getItem('nexretail_auth_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (u) {
          if (u.store) {
            return {
              id: u.store.id,
              name: u.store.name,
              branch: (u.store.type || u.store.storeType) === 'SUPERMARKET' ? 'Main Supermarket' : 'Local Kirana',
              storeType: u.store.type || u.store.storeType || 'KIRANA_STORE',
              ownerName: u.store.ownerName || u.fullName || u.name || 'Store Owner',
              address: u.store.address || 'Local Market',
              city: u.store.city,
              distance: u.store.distance || '0.4 km away',
              timings: '7:00 AM - 10:30 PM',
              phone: u.store.phone || u.phone || '',
              email: u.store.email || u.email || '',
              upiId: `${(u.store.name || u.storeName || 'store').toLowerCase().replace(/[^a-z0-9]/g, '')}@upi`,
              aisleCount: (u.store.type || u.store.storeType) === 'SUPERMARKET' ? 9 : 0,
              averageRating: u.store.averageRating !== undefined ? u.store.averageRating : null,
              reviewCount: u.store.reviewCount !== undefined ? u.store.reviewCount : 0
            };
          }
          if (u.storeId && (u.role === 'SHOPKEEPER' || u.role === 'SUPERMARKET_MANAGER' || u.role === 'STORE_MANAGER')) {
            const savedStore = localStorage.getItem('nexretail_selected_store');
            if (savedStore) {
              try {
                const parsed = JSON.parse(savedStore);
                if (parsed && Number(parsed.id) === Number(u.storeId)) {
                  return parsed;
                }
              } catch (e) {}
            }
            return {
              id: Number(u.storeId),
              name: u.storeName || 'My Store',
              storeType: u.storeType || 'KIRANA_STORE',
              branch: u.storeType === 'SUPERMARKET' ? 'Main Supermarket' : 'Local Kirana',
              ownerName: u.fullName || u.name || 'Store Owner',
              address: 'Local Market',
              distance: '0.4 km away',
              timings: '7:00 AM - 10:30 PM',
              phone: u.phone || '',
              email: u.email || '',
              upiId: `${(u.storeName || 'store').toLowerCase().replace(/[^a-z0-9]/g, '')}@upi`,
              aisleCount: u.storeType === 'SUPERMARKET' ? 9 : 0
            };
          }
        }
      }
      const saved = localStorage.getItem('nexretail_selected_store');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    } catch (e) {}
    return INITIAL_STORES[0];
  });

  // Role & View Navigation (4 roles: CUSTOMER, SHOPKEEPER, STORE_MANAGER, ADMIN)
  const [role, setRole] = useState('CUSTOMER');
  const [customerView, setCustomerView] = useState('browse'); // 'browse' | 'list' | 'aisles' | 'offers' | 'orders'
  const [retailerView, setRetailerView] = useState('overview'); // 'overview' | 'inventory' | 'sales' | 'insights' | 'orders' | 'suppliers' | 'profile'
  const [adminView, setAdminView] = useState('overview'); // 'overview' | 'layout' | 'offers' | 'issues' | 'products'

  // Core Data State
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('nexretail_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [categories, setCategories] = useState(INITIAL_CATEGORIES);

  const [sections, setSections] = useState(() => {
    const saved = localStorage.getItem('nexretail_sections');
    return saved ? JSON.parse(saved) : INITIAL_SECTIONS;
  });

  const [aisles, setAisles] = useState(() => {
    const saved = localStorage.getItem('nexretail_aisles');
    return saved ? JSON.parse(saved) : INITIAL_AISLES;
  });

  const [suppliers, setSuppliers] = useState(() => {
    const saved = localStorage.getItem('nexretail_suppliers');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('nexretail_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [sales, setSales] = useState(() => {
    const saved = localStorage.getItem('nexretail_sales');
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        customerName: 'Sunita Devi',
        customerPhone: '+91 98450 12345',
        totalAmount: 131.0,
        saleDate: new Date(Date.now() - 7200000).toISOString(),
        items: [
          { productName: 'Tata Salt Vacuum Evaporated', quantity: 2, unitPrice: 28.0, totalPrice: 56.0 },
          { productName: 'Parle-G Gold Glucose Biscuits', quantity: 3, unitPrice: 25.0, totalPrice: 75.0 }
        ]
      },
      {
        id: 2,
        customerName: 'Mohit Verma',
        customerPhone: '+91 97420 54321',
        totalAmount: 255.0,
        saleDate: new Date(Date.now() - 2700000).toISOString(),
        items: [
          { productName: 'Aashirvaad Superior MP Whole Wheat Atta', quantity: 1, unitPrice: 255.0, totalPrice: 255.0 }
        ]
      }
    ];
  });

  const [demandInsights, setDemandInsights] = useState(() => {
    const saved = localStorage.getItem('nexretail_demand');
    return saved ? JSON.parse(saved) : INITIAL_DEMAND_INSIGHTS;
  });

  const [operationalIssues, setOperationalIssues] = useState(() => {
    const saved = localStorage.getItem('nexretail_issues');
    return saved ? JSON.parse(saved) : INITIAL_OPERATIONAL_ISSUES;
  });

  // Customer Shopping List State
  const [shoppingList, setShoppingList] = useState(() => {
    const saved = localStorage.getItem('nexretail_shopping_list');
    return saved ? JSON.parse(saved) : [
      { id: 'item-1', name: 'Whole Wheat Atta', matchedProductId: 1, quantity: 1, isPurchased: false },
      { id: 'item-2', name: 'Toned Milk', matchedProductId: 4, quantity: 2, isPurchased: false },
      { id: 'item-3', name: 'Refined Sunflower Oil', matchedProductId: 2, quantity: 1, isPurchased: false },
      { id: 'item-4', name: 'Masala Instant Noodles', matchedProductId: 6, quantity: 2, isPurchased: false }
    ];
  });

  // Customer Store-Specific Carts State: Map of storeId -> CartItem[]
  const [storeCarts, setStoreCarts] = useState(() => {
    try {
      const saved = localStorage.getItem('shopnear_store_carts');
      if (saved) return JSON.parse(saved);
      const legacy = localStorage.getItem('nexretail_cart');
      if (legacy) {
        const parsed = JSON.parse(legacy);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return { 1: parsed };
        }
      }
    } catch (e) {}
    return {};
  });

  // Current active store's cart (Derived dynamically from active selectedStore)
  const cart = (selectedStore?.id && storeCarts[selectedStore.id]) ? storeCarts[selectedStore.id] : [];

  // Modals & UI notifications
  const [activeNotification, setActiveNotification] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);

  // Customer Order Notifications State (Backend-synced)
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  const refreshNotifications = useCallback(async () => {
    try {
      const isCust = (user?.role || role || '').toUpperCase() === 'CUSTOMER';
      if (!isCust || !user) {
        setNotifications([]);
        setUnreadNotificationCount(0);
        return;
      }
      const [notifs, unread] = await Promise.all([
        api.getCustomerNotifications().catch(() => []),
        api.getUnreadNotificationCount().catch(() => ({ unreadCount: 0 }))
      ]);
      if (Array.isArray(notifs)) {
        setNotifications(notifs);
      }
      if (unread && typeof unread.unreadCount === 'number') {
        setUnreadNotificationCount(unread.unreadCount);
      }
    } catch (e) {
      console.error('Failed to fetch customer notifications:', e);
    }
  }, [user, role]);

  // CRITICAL: Clicking a notification strictly marks it as read and updates the unread badge.
  // It MUST NOT navigate to orders or change the customer's current view/page.
  const onNotificationClick = async (notification) => {
    if (!notification) return;
    if (!notification.isRead) {
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
      setUnreadNotificationCount(prev => Math.max(0, prev - 1));
      try {
        await api.markNotificationAsRead(notification.id);
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    }
  };

  const markAllNotificationsAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadNotificationCount(0);
    try {
      await api.markAllNotificationsAsRead();
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  // Poll for customer notifications every 5 seconds when logged in as CUSTOMER
  useEffect(() => {
    const isCust = (user?.role || role || '').toUpperCase() === 'CUSTOMER';
    if (!isCust || !user) return;

    refreshNotifications();
    const interval = setInterval(refreshNotifications, 5000);
    return () => clearInterval(interval);
  }, [user, role, refreshNotifications]);

  // Normalization helper: ensures StoreProduct from API or local mock behaves identically
  const normalizeProduct = (item) => {
    const isStoreProduct = Boolean(item.product);
    const prod = isStoreProduct ? item.product : item;

    // Unit price calculation
    let unitPrice = item.unitPrice;
    let unitPriceDisplay = item.unitPriceDisplay || '';
    const unit = item.unit || 'PACKET';
    const pkgQty = item.packageQuantity || 1;
    const price = item.price || 0;

    if (!unitPrice && price > 0 && pkgQty > 0) {
      if (unit === 'GRAM' || unit === 'ML') {
        unitPrice = Math.round(((price / pkgQty) * 1000) * 100) / 100;
        unitPriceDisplay = `₹${unitPrice}/${unit === 'GRAM' ? 'kg' : 'litre'}`;
      } else if (unit === 'KG' || unit === 'LITRE') {
        unitPrice = Math.round((price / pkgQty) * 100) / 100;
        unitPriceDisplay = `₹${unitPrice}/${unit.toLowerCase()}`;
      } else {
        unitPrice = Math.round((price / pkgQty) * 100) / 100;
        unitPriceDisplay = `₹${unitPrice}/${unit.toLowerCase()}`;
      }
    } else if (unitPrice && !unitPriceDisplay) {
      const uStr = (unit === 'GRAM' || unit === 'KG') ? 'kg' : (unit === 'ML' || unit === 'LITRE') ? 'litre' : unit.toLowerCase();
      unitPriceDisplay = `₹${unitPrice}/${uStr}`;
    }

    return {
      id: item.id,
      storeProductId: item.id,
      productId: prod.id,
      name: prod.name || item.name,
      brand: prod.brand || item.brand || '',
      category: prod.category?.name || item.category || 'General',
      categoryId: prod.category?.id || item.categoryId,
      barcode: prod.barcode || item.barcode || '',
      description: prod.description || item.description || '',
      imageUrl: (prod && prod.imageUrl !== undefined) ? prod.imageUrl : (item.imageUrl !== undefined ? item.imageUrl : null),
      price: price,
      originalPrice: item.mrp || item.originalPrice || price,
      mrp: item.mrp || item.originalPrice || price,
      packageQuantity: pkgQty,
      unit: unit,
      unitPrice: unitPrice,
      unitPriceDisplay: unitPriceDisplay,
      currentStock: item.stockQuantity !== undefined ? item.stockQuantity : (item.currentStock || 0),
      stockQuantity: item.stockQuantity !== undefined ? item.stockQuantity : (item.currentStock || 0),
      minStockLevel: item.lowStockThreshold || item.minStockLevel || 5,
      lowStockThreshold: item.lowStockThreshold || item.minStockLevel || 5,
      aisle: item.aisleNumber || item.aisle || '',
      aisleNumber: item.aisleNumber || item.aisle || '',
      row: item.rowNumber || item.row || '',
      rowNumber: item.rowNumber || item.row || '',
      section: item.sectionLabel || item.section || '',
      sectionLabel: item.sectionLabel || item.section || '',
      shelf: item.shelfNumber || item.shelf || '',
      shelfNumber: item.shelfNumber || item.shelf || '',
      offer: item.offer || null,
      supplierName: item.supplierName || 'Metro FMCG Supplies',
      isAvailable: (item.stockQuantity !== undefined ? item.stockQuantity : item.currentStock) > 0
    };
  };

  // Map backend Store entity to frontend store representation
  const mapStore = (s) => ({
    id: s.id,
    name: s.name,
    branch: (s.type || s.storeType) === 'SUPERMARKET' ? 'Main Supermarket' : 'Local Kirana',
    storeType: s.type || s.storeType || 'KIRANA_STORE',
    ownerName: s.ownerName,
    address: s.address,
    city: s.city,
    distance: s.distance || '0.4 km away',
    timings: '7:00 AM - 10:30 PM',
    phone: s.phone,
    email: s.email,
    upiId: `${(s.name || 'store').toLowerCase().replace(/[^a-z0-9]/g, '')}@upi`,
    aisleCount: (s.type || s.storeType) === 'SUPERMARKET' ? 9 : 0,
    averageRating: s.averageRating !== undefined ? s.averageRating : null,
    reviewCount: s.reviewCount !== undefined ? s.reviewCount : 0,
    totalProducts: s.totalProducts || 0,
    inStockProducts: s.inStockProducts || 0,
    hasProducts: s.hasProducts !== undefined ? s.hasProducts : true
  });

  const normalizeOrder = (ord) => ({
    id: ord.id,
    orderNumber: ord.orderNumber || `ORD-${ord.id}`,
    customerName: ord.customerName || 'Customer',
    customerPhone: ord.customerPhone || '',
    pickupCode: ord.pickupCode || ord.pickupToken || `PKP-${ord.id}`,
    totalAmount: ord.totalAmount || 0,
    status: ord.status || 'PENDING',
    estimatedPickupTime: ord.estimatedPickupTime || null,
    createdAt: ord.createdAtFormatted || (ord.createdAt ? new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'),
    items: (ord.items || []).map(it => ({
      productId: it.productId || it.storeProductId || it.id,
      productName: it.productName || 'Store Item',
      quantity: it.quantity || 1,
      unitPrice: it.unitPrice || 0,
      aisle: it.aisle || 'Main Shelf'
    }))
  });

  const refreshOrders = useCallback(async () => {
    try {
      const data = await api.getOrders(null);
      if (data && Array.isArray(data) && data.length > 0) {
        const mappedOrders = data.map(normalizeOrder);
        setOrders(mappedOrders);
        return mappedOrders;
      }
    } catch (e) {
      console.error("Failed to load orders from API:", e);
    }
  }, []);

  const refreshStores = useCallback(async () => {
    try {
      let data = await api.getStoresWithRatings({ sort: 'rating' }, null);
      if (!data || !Array.isArray(data) || data.length === 0) {
        data = await api.getStores('', null);
      }

      if (data && Array.isArray(data) && data.length > 0) {
        const mappedStores = data.map(mapStore);
        // Sort stores strictly in decreasing order of rating
        mappedStores.sort((a, b) => {
          if (a.averageRating == null && b.averageRating == null) return a.name.localeCompare(b.name);
          if (a.averageRating == null) return 1;
          if (b.averageRating == null) return -1;
          const diff = b.averageRating - a.averageRating;
          if (diff !== 0) return diff;
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        });

        setStores(mappedStores);
        setSelectedStore(prev => {
          // If logged in as shopkeeper or supermarket manager, prioritize user's own store
          const savedUser = localStorage.getItem('nexretail_auth_user');
          if (savedUser) {
            try {
              const u = JSON.parse(savedUser);
              if (u && (u.role === 'SHOPKEEPER' || u.role === 'SUPERMARKET_MANAGER' || u.role === 'STORE_MANAGER')) {
                const uStoreId = Number(u.storeId || u.store?.id);
                const foundUserStore = mappedStores.find(s => s.id === uStoreId);
                if (foundUserStore) return foundUserStore;
                if (u.store) return mapStore(u.store);
                if (prev && prev.id === uStoreId) return prev;
              }
            } catch (e) {}
          }
          if (!prev) return mappedStores[0];
          const found = mappedStores.find(s => s.id === prev.id);
          return found || mappedStores[0];
        });
        return mappedStores;
      }
    } catch (e) {
      console.error("Failed to refresh stores:", e);
    }
  }, []);

  // Store Ratings & Reviews State
  const [storeRatings, setStoreRatings] = useState({});

  const refreshStoreRating = useCallback(async (storeId) => {
    if (!storeId) return;
    try {
      const data = await api.getStoreRating(storeId, null);
      if (data) {
        setStoreRatings(prev => ({
          ...prev,
          [storeId]: data
        }));
        return data;
      }
    } catch (e) {
      console.error("Failed to load store rating:", e);
    }
  }, []);

  const getStoreRatingData = useCallback((storeId) => {
    if (storeRatings[storeId]) {
      return storeRatings[storeId];
    }
    const store = stores.find(s => s.id === storeId);
    if (store && store.averageRating !== null && store.averageRating !== undefined) {
      return {
        storeId,
        storeName: store.name,
        averageRating: store.averageRating,
        totalReviews: store.reviewCount || 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }
    return { averageRating: null, totalReviews: 0, ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
  }, [storeRatings, stores]);

  // Fetch backend store-specific cart for authenticated customer
  const syncCartFromBackend = useCallback(async (storeId) => {
    if (!storeId) return;
    const token = localStorage.getItem('nexretail_auth_token');
    if (!token) return;
    try {
      const serverCart = await api.getCart(storeId);
      if (serverCart && Array.isArray(serverCart.items) && serverCart.items.length > 0) {
        const mappedItems = serverCart.items.map(it => ({
          cartItemId: it.cartItemId,
          productId: it.productId,
          storeProductId: it.storeProductId,
          name: it.name,
          brand: it.brand,
          price: it.price,
          originalPrice: it.mrp || it.price,
          unit: it.unit,
          unitPriceDisplay: it.unitPriceDisplay,
          aisle: it.aisle,
          imageUrl: it.imageUrl,
          maxStock: it.stockQuantity,
          quantity: it.quantity
        }));
        setStoreCarts(prev => ({
          ...prev,
          [storeId]: mappedItems
        }));
      }
    } catch (e) {
      // Offline or fallback to local store cart
    }
  }, []);

  // Fetch products, sales, and ratings whenever selectedStore changes
  const loadStoreData = useCallback(async (storeId) => {
    if (!storeId) return;

    try {
      const data = await api.getStoreProducts(storeId, null, []);
      if (Array.isArray(data)) {
        const normalized = data.map(normalizeProduct);
        setProducts(normalized);
      }
    } catch (e) {
      console.error("Failed to load store products:", e);
    }

    try {
      const salesData = await api.getSales(storeId, false, []);
      if (Array.isArray(salesData)) {
        setSales(salesData);
      }
    } catch (e) {}

    try {
      await refreshStoreRating(storeId);
    } catch (e) {}

    try {
      await syncCartFromBackend(storeId);
    } catch (e) {}
  }, [refreshStoreRating, syncCartFromBackend]);

  // Fetch initial stores and orders from backend API on mount
  useEffect(() => {
    refreshStores();
    refreshOrders();
  }, [refreshStores, refreshOrders]);

  // Automatically switch active store to user's assigned store on login / refresh
  useEffect(() => {
    const syncUserAssignedStore = async () => {
      try {
        const u = user || (() => {
          const savedUser = localStorage.getItem('nexretail_auth_user');
          return savedUser ? JSON.parse(savedUser) : null;
        })();
        if (!u) return;

        // If user is SHOPKEEPER or SUPERMARKET_MANAGER, store MUST be their owned store
        if (u.role === 'SHOPKEEPER' || u.role === 'SUPERMARKET_MANAGER' || u.role === 'STORE_MANAGER') {
          if (u.store) {
            const mapped = mapStore(u.store);
            setSelectedStore(mapped);
            loadStoreData(mapped.id);
            return;
          }

          if (u.storeId) {
            const userStore = stores.find(s => s.id === Number(u.storeId));
            if (userStore) {
              setSelectedStore(userStore);
              loadStoreData(userStore.id);
              return;
            }

            try {
              const fetched = await api.getStoreById(u.storeId, null);
              if (fetched) {
                const mapped = mapStore(fetched);
                setSelectedStore(mapped);
                loadStoreData(mapped.id);
                return;
              }
            } catch (e) {}

            // Fallback descriptor directly from user auth data
            const fallbackStore = {
              id: Number(u.storeId),
              name: u.storeName || 'My Store',
              storeType: u.storeType || 'KIRANA_STORE',
              branch: u.storeType === 'SUPERMARKET' ? 'Main Supermarket' : 'Local Kirana',
              ownerName: u.fullName || u.name || 'Store Owner',
              address: u.storeAddress || 'Local Market',
              distance: '0.4 km away',
              timings: '7:00 AM - 10:30 PM',
              phone: u.phone || '',
              email: u.email || '',
              upiId: `${(u.storeName || 'store').toLowerCase().replace(/[^a-z0-9]/g, '')}@upi`,
              aisleCount: u.storeType === 'SUPERMARKET' ? 9 : 0
            };
            setSelectedStore(fallbackStore);
            loadStoreData(fallbackStore.id);
          }
        }
      } catch (e) {
        console.error("Failed to sync user store:", e);
      }
    };

    syncUserAssignedStore();
  }, [user, stores, loadStoreData]);

  useEffect(() => {
    if (selectedStore?.id) {
      loadStoreData(selectedStore.id);
    }
  }, [selectedStore?.id, loadStoreData]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('nexretail_stores', JSON.stringify(stores));
  }, [stores]);

  useEffect(() => {
    if (selectedStore) {
      localStorage.setItem('nexretail_selected_store', JSON.stringify(selectedStore));
    }
  }, [selectedStore]);

  useEffect(() => {
    localStorage.setItem('nexretail_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('nexretail_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('nexretail_shopping_list', JSON.stringify(shoppingList));
  }, [shoppingList]);

  useEffect(() => {
    localStorage.setItem('shopnear_store_carts', JSON.stringify(storeCarts));
    localStorage.setItem('nexretail_cart', JSON.stringify(cart));
  }, [storeCarts, cart]);

  useEffect(() => {
    localStorage.setItem('nexretail_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('nexretail_sections', JSON.stringify(sections));
  }, [sections]);

  useEffect(() => {
    localStorage.setItem('nexretail_aisles', JSON.stringify(aisles));
  }, [aisles]);

  useEffect(() => {
    localStorage.setItem('nexretail_issues', JSON.stringify(operationalIssues));
  }, [operationalIssues]);

  useEffect(() => {
    localStorage.setItem('nexretail_demand', JSON.stringify(demandInsights));
  }, [demandInsights]);

  const showNotification = (message, type = 'info') => {
    setActiveNotification({ message, type, id: Date.now() });
    setTimeout(() => setActiveNotification(null), 4000);
  };

  // Multi-Store Management Actions
  const switchStore = (storeId) => {
    try {
      const savedUser = localStorage.getItem('nexretail_auth_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (u && (u.role === 'SHOPKEEPER' || u.role === 'SUPERMARKET_MANAGER' || u.role === 'STORE_MANAGER')) {
          if (u.storeId && Number(storeId) !== Number(u.storeId)) {
            showNotification('Access restricted: You can only manage your own assigned store.', 'error');
            return;
          }
        }
      }
    } catch (e) {}

    const target = stores.find(s => s.id === Number(storeId));
    if (target) {
      setSelectedStore(target);
      loadStoreData(target.id);
      showNotification(`Switched active store to "${target.name}"`, 'success');
    }
  };

  const addCustomStore = async (newStoreData) => {
    let authUserId = null;
    try {
      const savedUser = localStorage.getItem('nexretail_auth_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (u && u.id) authUserId = u.id;
      }
    } catch (e) {}

    const storePayload = {
      name: newStoreData.name.trim(),
      type: newStoreData.storeType || 'KIRANA_STORE',
      ownerName: newStoreData.ownerName ? newStoreData.ownerName.trim() : 'Store Owner',
      address: newStoreData.address ? newStoreData.address.trim() : 'Local Market',
      phone: newStoreData.phone || '+91 98765 43210',
      email: newStoreData.email || 'store@retail.com'
    };

    let savedStore;
    try {
      savedStore = await api.createStore(storePayload, authUserId);
    } catch (e) {
      console.error("Store registration API failed:", e);
      savedStore = { ...storePayload, id: Date.now() };
    }

    const formattedStore = mapStore(savedStore);
    await refreshStores();
    setSelectedStore(formattedStore);

    // Update authenticated user object with the new store
    try {
      const savedUser = localStorage.getItem('nexretail_auth_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        u.storeId = formattedStore.id;
        u.storeName = formattedStore.name;
        u.storeType = formattedStore.storeType;
        u.store = formattedStore;
        localStorage.setItem('nexretail_auth_user', JSON.stringify(u));
      }
    } catch (e) {}

    showNotification(`Shop "${formattedStore.name}" registered and activated!`, 'success');
    return formattedStore;
  };

  const updateStoreDetails = async (storeId, updatedFields) => {
    try {
      await api.updateStore(storeId, updatedFields);
    } catch (e) {}

    setStores(prev => prev.map(s => {
      if (s.id === storeId) {
        const updated = { ...s, ...updatedFields };
        if (selectedStore.id === storeId) setSelectedStore(updated);
        return updated;
      }
      return s;
    }));
    showNotification('Store profile updated successfully', 'success');
  };

  // Product & Inventory Actions
  const updateProductStock = async (productId, deltaOrAbsolute, isAbsolute = false) => {
    const currentProd = products.find(p => p.id === productId);
    if (!currentProd) return;
    const updatedStock = Math.max(0, isAbsolute ? deltaOrAbsolute : currentProd.currentStock + deltaOrAbsolute);
    const delta = isAbsolute ? (deltaOrAbsolute - currentProd.currentStock) : deltaOrAbsolute;

    if (selectedStore?.id) {
      try {
        await api.adjustStock(selectedStore.id, productId, delta);
        await loadStoreData(selectedStore.id);
      } catch (e) {
        console.error("Adjust stock failed:", e);
      }
    }

    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return { ...p, currentStock: updatedStock, stockQuantity: updatedStock, isAvailable: updatedStock > 0 };
      }
      return p;
    }));
    showNotification('Stock level updated', 'success');
  };

  const addProduct = async (newProduct) => {
    if (!selectedStore?.id) throw new Error("No store selected");

    const payload = {
      productName: newProduct.name,
      productBrand: newProduct.brand || '',
      productDescription: newProduct.description || '',
      imageUrl: newProduct.imageUrl !== undefined ? newProduct.imageUrl : null,
      category: newProduct.category || 'General',
      categoryId: newProduct.categoryId || null,
      price: Number(newProduct.price),
      mrp: Number(newProduct.mrp || newProduct.price),
      packageQuantity: Number(newProduct.packageQuantity || 1),
      unit: (newProduct.unit || 'PIECE').toUpperCase(),
      stockQuantity: Number(newProduct.stockQuantity || newProduct.currentStock || 10),
      lowStockThreshold: Number(newProduct.lowStockThreshold || newProduct.minStockLevel || 5),
      aisleNumber: newProduct.aisleNumber || newProduct.aisle || '',
      rowNumber: newProduct.rowNumber || newProduct.row || '',
      sectionLabel: newProduct.sectionLabel || newProduct.section || '',
      shelfNumber: newProduct.shelfNumber || newProduct.shelf || ''
    };

    const savedItem = await api.addStoreProduct(selectedStore.id, payload);
    await loadStoreData(selectedStore.id);
    const normalized = normalizeProduct(savedItem);
    showNotification(`Added "${normalized.name}" to inventory (Stock: ${normalized.currentStock})`, 'success');
    return normalized;
  };

  const updateProductDetails = async (productId, updatedFields) => {
    if (selectedStore?.id) {
      try {
        await api.updateStoreProduct(selectedStore.id, productId, updatedFields);
        await loadStoreData(selectedStore.id);
      } catch (e) {
        console.error("Update product failed:", e);
      }
    }
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const merged = { ...p, ...updatedFields };
        return normalizeProduct(merged);
      }
      return p;
    }));
    showNotification('Product details updated', 'success');
  };

  const updateProductLocation = async (productId, locationFields) => {
    const payload = {
      aisleNumber: locationFields.aisle || locationFields.aisleNumber || '',
      rowNumber: locationFields.row || locationFields.rowNumber || '',
      shelfNumber: locationFields.shelf || locationFields.shelfNumber || '',
      sectionLabel: locationFields.section || locationFields.sectionLabel || ''
    };
    return updateProductDetails(productId, payload);
  };

  // Sales Recording (Small Kirana Shopkeeper POS feature)
  const recordStoreSale = async (saleData) => {
    if (!selectedStore?.id) throw new Error("No store selected");

    const payload = {
      customerName: saleData.customerName || 'Walk-in Customer',
      customerPhone: saleData.customerPhone || '',
      items: saleData.items.map(i => ({
        storeProduct: { id: i.storeProductId },
        quantity: i.quantity
      }))
    };

    const serverSale = await api.recordSale(selectedStore.id, payload);
    await loadStoreData(selectedStore.id);

    const newSale = {
      id: serverSale.id,
      customerName: serverSale.customerName || saleData.customerName,
      customerPhone: serverSale.customerPhone || saleData.customerPhone,
      totalAmount: serverSale.totalAmount,
      saleDate: serverSale.saleDate || new Date().toISOString(),
      items: (serverSale.items || []).map(it => ({
        productName: it.productName || it.storeProduct?.product?.name || 'Item',
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        totalPrice: it.totalPrice
      }))
    };

    setSales(prev => [newSale, ...prev]);
    showNotification(`Recorded sale of ₹${newSale.totalAmount} successfully!`, 'success');
    return newSale;
  };

  // Demand Logging
  const logCustomerSearch = (query, foundProducts) => {
    if (!query || query.trim().length < 2) return;
    const cleanQuery = query.trim().toLowerCase();
    
    const exactOutMatch = products.find(p => p.name.toLowerCase().includes(cleanQuery) && p.currentStock === 0);
    if (exactOutMatch) {
      setDemandInsights(prev => {
        const existing = prev.find(d => d.productId === exactOutMatch.id);
        if (existing) {
          return prev.map(d => d.productId === exactOutMatch.id 
            ? { ...d, unfulfilledSearches: d.unfulfilledSearches + 1, estimatedMissedRevenue: (d.unfulfilledSearches + 1) * exactOutMatch.price }
            : d
          );
        } else {
          return [...prev, {
            id: Date.now(),
            productId: exactOutMatch.id,
            productName: exactOutMatch.name,
            status: 'OUT_OF_STOCK',
            unfulfilledSearches: 1,
            shoppingListAdds: 0,
            estimatedMissedRevenue: exactOutMatch.price,
            insight: `Customer searched for this out-of-stock item.`,
            recommendedAction: `Procure restock for ${selectedStore?.name || 'store'}.`
          }];
        }
      });
    }
  };

  // Shopping List Management
  const addShoppingListItem = (itemName, matchedProductId = null) => {
    if (!itemName || !itemName.trim()) return;
    
    let matchedId = matchedProductId;
    if (!matchedId) {
      const match = products.find(p => p.name.toLowerCase().includes(itemName.toLowerCase()));
      if (match) matchedId = match.id;
    }

    const newItem = {
      id: `item-${Date.now()}`,
      name: itemName.trim(),
      matchedProductId: matchedId,
      quantity: 1,
      isPurchased: false
    };

    setShoppingList(prev => [...prev, newItem]);
    showNotification(`Added "${itemName}" to your shopping list`, 'info');

    if (matchedId) {
      const p = products.find(prod => prod.id === matchedId);
      if (p && p.currentStock === 0) {
        setDemandInsights(prev => {
          return prev.map(d => d.productId === p.id ? { ...d, shoppingListAdds: d.shoppingListAdds + 1 } : d);
        });
      }
    }
  };

  const removeShoppingListItem = (id) => {
    setShoppingList(prev => prev.filter(item => item.id !== id));
  };

  const toggleShoppingListItemPurchased = (id) => {
    setShoppingList(prev => prev.map(item => item.id === id ? { ...item, isPurchased: !item.isPurchased } : item));
  };

  const clearPurchasedShoppingList = () => {
    setShoppingList(prev => prev.filter(item => !item.isPurchased));
  };

  // Store-Specific Cart Management (1 Customer + 1 Store = 1 Cart)
  const addToCart = async (product, quantity = 1) => {
    if (!selectedStore?.id) {
      showNotification('Please select a store first', 'warning');
      return;
    }
    if (product.currentStock <= 0) {
      showNotification(`${product.name} is currently out of stock at ${selectedStore.name}`, 'warning');
      return;
    }

    const currentStoreId = selectedStore.id;
    const storeProdId = product.storeProductId || product.id;

    // Optional background sync with backend /api/cart
    const token = localStorage.getItem('nexretail_auth_token');
    if (token) {
      api.addToCartItem(currentStoreId, storeProdId, quantity).catch(e => {
        console.warn("Backend cart add sync skipped / offline fallback:", e.message);
      });
    }

    setStoreCarts(prev => {
      const currentItems = prev[currentStoreId] || [];
      const existing = currentItems.find(item => item.productId === product.id);
      let updatedItems;
      if (existing) {
        const newQty = Math.min(product.currentStock, existing.quantity + quantity);
        updatedItems = currentItems.map(item => item.productId === product.id ? { ...item, quantity: newQty } : item);
      } else {
        updatedItems = [...currentItems, {
          productId: product.id,
          storeProductId: storeProdId,
          name: product.name,
          brand: product.brand,
          price: product.offer ? product.offer.dealPrice : product.price,
          originalPrice: product.mrp || product.originalPrice || product.price,
          unit: product.unit,
          unitPriceDisplay: product.unitPriceDisplay,
          aisle: product.aisle,
          imageUrl: product.imageUrl,
          maxStock: product.currentStock,
          quantity: Math.min(product.currentStock, quantity)
        }];
      }
      return {
        ...prev,
        [currentStoreId]: updatedItems
      };
    });

    showNotification(`Added ${product.name} to ${selectedStore.name} cart`, 'success');
  };

  const removeFromCart = async (productId) => {
    if (!selectedStore?.id) return;
    const currentStoreId = selectedStore.id;
    const targetItem = (storeCarts[currentStoreId] || []).find(it => it.productId === productId);

    if (targetItem?.cartItemId) {
      api.removeCartItem(targetItem.cartItemId).catch(() => {});
    }

    setStoreCarts(prev => ({
      ...prev,
      [currentStoreId]: (prev[currentStoreId] || []).filter(item => item.productId !== productId)
    }));
  };

  const updateCartQuantity = async (productId, delta) => {
    if (!selectedStore?.id) return;
    const currentStoreId = selectedStore.id;
    const currentItems = storeCarts[currentStoreId] || [];
    const item = currentItems.find(it => it.productId === productId);
    if (!item) return;

    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      return removeFromCart(productId);
    }

    if (item.cartItemId) {
      api.updateCartItemQuantity(item.cartItemId, Math.min(item.maxStock, newQty)).catch(() => {});
    }

    setStoreCarts(prev => ({
      ...prev,
      [currentStoreId]: (prev[currentStoreId] || []).map(it => {
        if (it.productId === productId) {
          return { ...it, quantity: Math.min(it.maxStock, newQty) };
        }
        return it;
      })
    }));
  };

  const clearCart = async (storeId = null) => {
    const targetStoreId = storeId || selectedStore?.id;
    if (!targetStoreId) return;

    api.clearCart(targetStoreId).catch(() => {});

    setStoreCarts(prev => {
      const next = { ...prev };
      delete next[targetStoreId];
      return next;
    });
  };

  // Express In-Store Pickup Order Checkout
  const checkoutStorePickup = async (customerDetails = { name: "Akash Sharma", phone: "+91 98765 43210" }, paymentDetails = {}) => {
    if (!selectedStore?.id) throw new Error("No store selected");
    const activeCart = storeCarts[selectedStore.id] || [];
    if (activeCart.length === 0) throw new Error("Active store cart is empty");

    const orderPayload = {
      storeId: selectedStore.id,
      customerName: customerDetails.name,
      customerPhone: customerDetails.phone,
      paymentMethod: paymentDetails.method || 'UPI',
      items: activeCart.map(item => ({
        storeProductId: item.storeProductId || item.productId,
        quantity: item.quantity
      }))
    };

    // Real Spring Boot Order Creation (atomically validates stock and deducts inventory on SUCCESS)
    const createdOrder = await api.createOrder(orderPayload);

    // Refresh store products to sync latest stock from MySQL
    await loadStoreData(selectedStore.id);

    const formattedOrder = {
      id: createdOrder.id,
      orderNumber: createdOrder.orderNumber || `ORD-${createdOrder.id}`,
      customerName: createdOrder.customerName,
      customerPhone: createdOrder.customerPhone,
      pickupCode: createdOrder.pickupToken || createdOrder.pickupCode || `PKP-${createdOrder.id}`,
      totalAmount: createdOrder.totalAmount,
      status: createdOrder.status || 'CONFIRMED',
      createdAt: 'Just now',
      items: activeCart.map(item => ({
        productId: item.productId,
        productName: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        aisle: item.aisle
      }))
    };

    setOrders(prev => [formattedOrder, ...prev]);
    // Clear ONLY the active store's cart!
    await clearCart(selectedStore.id);
    showNotification(`Order ${formattedOrder.orderNumber} confirmed! Pickup token: ${formattedOrder.pickupCode}`, 'success');
    refreshNotifications();
    return formattedOrder;
  };

  // Order Fulfillment (Staff)
  const updateOrderStatus = async (orderId, newStatus, estimatedPickupTime = null) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: newStatus || o.status,
          estimatedPickupTime: estimatedPickupTime !== undefined && estimatedPickupTime !== null ? estimatedPickupTime : o.estimatedPickupTime
        };
      }
      return o;
    }));

    try {
      const updated = await api.updateOrderStatus(orderId, newStatus, estimatedPickupTime);
      if (updated && updated.id) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updated } : o));
      }
    } catch (e) {
      console.error("Failed to sync order update to API:", e);
      if (e.message) {
        showNotification(e.message, 'error');
      }
    }

    if (newStatus === 'ACCEPTED') {
      showNotification(`Order accepted! Customer notified: Ready in ${estimatedPickupTime || '15 mins'}`, 'success');
    } else if (newStatus === 'READY_FOR_PICKUP') {
      showNotification(`Order marked as Packed & Ready for Pickup at counter!`, 'success');
    } else if (newStatus === 'PICKED_UP' || newStatus === 'COMPLETED') {
      showNotification(`Order marked as Picked Up! Customer is now eligible to rate store.`, 'success');
    } else {
      showNotification(`Order status updated to ${newStatus?.replace(/_/g, ' ')}`, 'info');
    }
    refreshNotifications();
  };

  // Layout Functions
  const addStoreAisle = (newAisle) => {
    const aisleWithId = { ...newAisle, id: Date.now() };
    setAisles(prev => [...prev, aisleWithId]);
    showNotification(`Added ${newAisle.aisleNumber} to store layout`, 'success');
  };

  const addStoreSection = (newSection) => {
    const sectionWithId = { ...newSection, id: Date.now(), aisleCount: 0 };
    setSections(prev => [...prev, sectionWithId]);
    showNotification(`Added section ${newSection.name}`, 'success');
  };

  // Offers Manager
  const addProductOffer = (productId, offerData) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const discountPercent = Math.round(((p.price - offerData.dealPrice) / p.price) * 100);
        return {
          ...p,
          offer: {
            id: Date.now(),
            title: offerData.title,
            dealPrice: Number(offerData.dealPrice),
            discountPercent: Math.max(1, discountPercent)
          }
        };
      }
      return p;
    }));
    showNotification('Promotional offer published', 'success');
  };

  const removeProductOffer = (productId) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, offer: null } : p));
    showNotification('Offer removed', 'info');
  };

  // Operational Issues Tracker
  const logOperationalIssue = (issue) => {
    const newIssue = {
      ...issue,
      id: Date.now(),
      reportedAt: 'Just now',
      status: 'OPEN'
    };
    setOperationalIssues(prev => [newIssue, ...prev]);
    showNotification('Operational issue logged for store management', 'warning');
  };

  const resolveOperationalIssue = (id) => {
    setOperationalIssues(prev => prev.map(iss => iss.id === id ? { ...iss, status: 'RESOLVED' } : iss));
    showNotification('Issue marked as resolved', 'success');
  };

  return (
    <StoreContext.Provider value={{
      role,
      setRole,
      customerView,
      setCustomerView,
      retailerView,
      setRetailerView,
      adminView,
      setAdminView,
      stores,
      selectedStore,
      setSelectedStore,
      switchStore,
      addCustomStore,
      updateStoreDetails,
      products,
      categories,
      sections,
      aisles,
      suppliers,
      orders,
      refreshOrders,
      sales,
      recordStoreSale,
      demandInsights,
      operationalIssues,
      shoppingList,
      cart,
      storeCarts,
      getStoreCart: (sId) => storeCarts[sId] || [],
      isCartOpen,
      setIsCartOpen,
      isVoiceAssistantOpen,
      setIsVoiceAssistantOpen,
      activeNotification,
      showNotification,
      // Actions
      updateProductStock,
      addProduct,
      updateProductDetails,
      updateProductLocation,
      logCustomerSearch,
      addShoppingListItem,
      removeShoppingListItem,
      toggleShoppingListItemPurchased,
      clearPurchasedShoppingList,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      checkoutStorePickup,
      updateOrderStatus,
      addStoreAisle,
      addStoreSection,
      addProductOffer,
      removeProductOffer,
      logOperationalIssue,
      resolveOperationalIssue,
      loadStoreData,
      storeRatings,
      refreshStoreRating,
      getStoreRatingData,
      // Customer Notifications
      notifications,
      unreadNotificationCount,
      refreshNotifications,
      onNotificationClick,
      markAllNotificationsAsRead
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
