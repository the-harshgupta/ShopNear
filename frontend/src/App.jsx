import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StoreProvider, useStore } from './context/StoreContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import Navbar from './components/common/Navbar';
import NotificationToast from './components/common/NotificationToast';
import ProtectedRoute from './components/common/ProtectedRoute';
import UnauthorizedPage from './components/common/UnauthorizedPage';

// Auth Pages
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';

// Customer Views
import CustomerHome from './components/customer/CustomerHome';
import StoreDiscoveryView from './components/customer/StoreDiscoveryView';
import SmartShoppingList from './components/customer/SmartShoppingList';
import StoreAisleExplorer from './components/customer/StoreAisleExplorer';
import ActiveOffersView from './components/customer/ActiveOffersView';
import CustomerOrdersView from './components/customer/CustomerOrdersView';
import CartDrawer from './components/customer/CartDrawer';

// Shopkeeper & Retailer Views
import RetailerOverview from './components/retailer/RetailerOverview';
import InventoryManager from './components/retailer/InventoryManager';
import SalesRecorder from './components/retailer/SalesRecorder';
import SalesHistory from './components/retailer/SalesHistory';
import ShopProfile from './components/retailer/ShopProfile';
import DemandInsightsView from './components/retailer/DemandInsightsView';
import PickupOrdersQueue from './components/retailer/PickupOrdersQueue';
import SuppliersDirectory from './components/retailer/SuppliersDirectory';
import ShopkeeperVoiceAssistant from './components/retailer/ShopkeeperVoiceAssistant';
import { Bot } from 'lucide-react';

// Supermarket Manager & Admin Views
import AdminOverview from './components/admin/AdminOverview';
import AdminUserManagement from './components/admin/AdminUserManagement';
import StoreLayoutManager from './components/admin/StoreLayoutManager';
import PromotionsManager from './components/admin/PromotionsManager';
import OperationalIssueTracker from './components/admin/OperationalIssueTracker';

import { Search, ListOrdered, MapPin, Tag, ShoppingBag, Store } from 'lucide-react';

/** Root redirector that sends user to their authorized dashboard based on active session */
function RootRedirect() {
  const { isAuthenticated, role, getDashboardPath, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isAuthenticated && role) {
    return <Navigate to={getDashboardPath(role)} replace />;
  }

  return <Navigate to="/login" replace />;
}

/** Public Authentication Layout (Desktop split-screen visual authentication) */
function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-slate-900 selection:bg-emerald-600 selection:text-white font-sans">
      {children}
    </div>
  );
}

/** Authenticated Role Dashboard Layout (With Role-Scoped Navbar, Mobile Nav, and Cart) */
function DashboardLayout({ children, showCustomerMobileNav = false, showCart = false }) {
  const { customerView, setCustomerView, shoppingList } = useStore();

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between text-charcoal pb-16 sm:pb-8">
      {/* Role-Scoped Dashboard Header */}
      <Navbar />

      {/* Main Content Viewport */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        {children}
      </main>

      {/* Slide-over Cart for Shoppers */}
      {showCart && <CartDrawer />}

      {/* Global Alerts & Notifications */}
      <NotificationToast />

      {/* Mobile Bottom Navigation for Customer Shoppers */}
      {showCustomerMobileNav && (
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-3 py-2 flex items-center justify-around text-[10px] font-semibold text-slate-500 shadow-lg">
          <button
            onClick={() => setCustomerView('browse')}
            className={`flex flex-col items-center space-y-0.5 ${customerView === 'browse' ? 'text-retail-800 font-bold' : ''}`}
          >
            <Search className="w-5 h-5" />
            <span>Discover</span>
          </button>

          <button
            onClick={() => setCustomerView('stores')}
            className={`flex flex-col items-center space-y-0.5 ${customerView === 'stores' ? 'text-retail-800 font-bold' : ''}`}
          >
            <Store className="w-5 h-5" />
            <span>Stores</span>
          </button>

          <button
            onClick={() => setCustomerView('list')}
            className={`flex flex-col items-center space-y-0.5 relative ${customerView === 'list' ? 'text-retail-800 font-bold' : ''}`}
          >
            <ListOrdered className="w-5 h-5" />
            <span>List</span>
            {shoppingList.length > 0 && (
              <span className="absolute -top-1 right-1 bg-retail-800 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {shoppingList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setCustomerView('aisles')}
            className={`flex flex-col items-center space-y-0.5 ${customerView === 'aisles' ? 'text-retail-800 font-bold' : ''}`}
          >
            <MapPin className="w-5 h-5" />
            <span>Aisle Map</span>
          </button>

          <button
            onClick={() => setCustomerView('orders')}
            className={`flex flex-col items-center space-y-0.5 ${customerView === 'orders' ? 'text-retail-800 font-bold' : ''}`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Orders</span>
          </button>
        </nav>
      )}

      {/* Global Dashboard Footer */}
      <footer className="mt-12 border-t border-gray-200/80 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2 font-medium text-slate-700">
            <span className="font-extrabold text-charcoal font-display">ShopNear</span>
            <span>&bull;</span>
            <span>Your neighborhood stores, made smarter.</span>
          </div>
          <div className="text-slate-400">
            Connected to Spring Boot API &bull; MySQL / Persistent Engine
          </div>
        </div>
      </footer>
    </div>
  );
}

/** Customer Dashboard View (Role: CUSTOMER) */
function CustomerDashboard() {
  const { customerView } = useStore();

  return (
    <DashboardLayout showCustomerMobileNav={true} showCart={true}>
      {customerView === 'browse' && <CustomerHome />}
      {customerView === 'stores' && <StoreDiscoveryView />}
      {customerView === 'list' && <SmartShoppingList />}
      {customerView === 'aisles' && <StoreAisleExplorer />}
      {customerView === 'offers' && <ActiveOffersView />}
      {customerView === 'orders' && <CustomerOrdersView />}
      {!['browse', 'stores', 'list', 'aisles', 'offers', 'orders'].includes(customerView) && <CustomerHome />}
    </DashboardLayout>
  );
}

/** Shopkeeper / Kirana Dashboard View (Role: SHOPKEEPER) */
function ShopkeeperDashboard() {
  const { retailerView, isVoiceAssistantOpen, setIsVoiceAssistantOpen } = useStore();

  return (
    <DashboardLayout>
      {retailerView === 'overview' && <RetailerOverview />}
      {retailerView === 'inventory' && <InventoryManager />}
      {retailerView === 'sales' && <SalesRecorder />}
      {retailerView === 'sales_history' && <SalesHistory />}
      {retailerView === 'profile' && <ShopProfile />}
      {retailerView === 'insights' && <DemandInsightsView />}
      {retailerView === 'orders' && <PickupOrdersQueue />}
      {retailerView === 'suppliers' && <SuppliersDirectory />}
      {!['overview', 'inventory', 'sales', 'sales_history', 'profile', 'insights', 'orders', 'suppliers'].includes(retailerView) && <RetailerOverview />}

      {/* Floating AI Assistant Trigger Button */}
      <button
        onClick={() => setIsVoiceAssistantOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center space-x-2.5 font-bold text-xs group ring-4 ring-emerald-500/20 active:scale-95 cursor-pointer"
        title="Open AI Inventory Assistant"
      >
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
          <Bot className="w-4 h-4 text-white animate-pulse" />
        </div>
        <span className="hidden sm:inline font-bold tracking-wide">🤖 AI Assistant</span>
      </button>

      {/* Persistent AI Inventory Assistant Drawer */}
      <ShopkeeperVoiceAssistant 
        isOpen={isVoiceAssistantOpen} 
        onClose={() => setIsVoiceAssistantOpen(false)} 
      />
    </DashboardLayout>
  );
}

/** Supermarket Store Manager Dashboard View (Role: SUPERMARKET_MANAGER) */
function SupermarketManagerDashboard() {
  const { retailerView } = useStore();

  return (
    <DashboardLayout>
      {retailerView === 'overview' && <AdminOverview />}
      {retailerView === 'layout' && <StoreLayoutManager />}
      {retailerView === 'inventory' && <InventoryManager />}
      {retailerView === 'offers' && <PromotionsManager />}
      {retailerView === 'orders' && <PickupOrdersQueue />}
      {retailerView === 'insights' && <DemandInsightsView />}
      {retailerView === 'issues' && <OperationalIssueTracker />}
      {retailerView === 'sales' && <SalesRecorder />}
      {retailerView === 'sales_history' && <SalesHistory />}
      {!['overview', 'layout', 'inventory', 'offers', 'orders', 'insights', 'issues', 'sales', 'sales_history'].includes(retailerView) && <AdminOverview />}
    </DashboardLayout>
  );
}

/** Platform Admin Dashboard View (Role: ADMIN) */
function AdminDashboard() {
  const { adminView } = useStore();

  return (
    <DashboardLayout>
      {adminView === 'overview' && <AdminOverview />}
      {adminView === 'users' && <AdminUserManagement />}
      {adminView === 'layout' && <StoreLayoutManager />}
      {adminView === 'offers' && <PromotionsManager />}
      {adminView === 'issues' && <OperationalIssueTracker />}
      {adminView === 'inventory' && <InventoryManager />}
      {!['overview', 'users', 'layout', 'offers', 'issues', 'inventory'].includes(adminView) && <AdminOverview />}
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <StoreProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes - Dedicated Clean AuthLayout */}
            <Route 
              path="/login" 
              element={
                <AuthLayout>
                  <LoginPage />
                </AuthLayout>
              } 
            />
            <Route 
              path="/register" 
              element={
                <AuthLayout>
                  <RegisterPage />
                </AuthLayout>
              } 
            />
            <Route 
              path="/unauthorized" 
              element={
                <AuthLayout>
                  <UnauthorizedPage />
                </AuthLayout>
              } 
            />

            {/* 1. Customer Protected Zone */}
            <Route
              path="/customer/*"
              element={
                <ProtectedRoute allowedRoles={['CUSTOMER']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />

            {/* 2. Shopkeeper Protected Zone */}
            <Route
              path="/shopkeeper/*"
              element={
                <ProtectedRoute allowedRoles={['SHOPKEEPER', 'RETAILER']}>
                  <ShopkeeperDashboard />
                </ProtectedRoute>
              }
            />

            {/* 3. Supermarket Manager Protected Zone */}
            <Route
              path="/manager/*"
              element={
                <ProtectedRoute allowedRoles={['SUPERMARKET_MANAGER', 'STORE_MANAGER']}>
                  <SupermarketManagerDashboard />
                </ProtectedRoute>
              }
            />

            {/* 4. Platform Admin Protected Zone */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Root Landing Route */}
            <Route path="/" element={<RootRedirect />} />

            {/* Catch-all Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </StoreProvider>
    </AuthProvider>
    </ErrorBoundary>
  );
}
