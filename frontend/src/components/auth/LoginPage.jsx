import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Store, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  MapPin, 
  ShoppingBag, 
  Tag,
  ShieldCheck
} from 'lucide-react';
import heroShopperCard from '../../assets/hero_shopper_card.png';
import storeTrailGraphic from '../../assets/store_trail_graphic.png';

export default function LoginPage() {
  const { login, isAuthenticated, role: currentRole, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('CUSTOMER'); // 'CUSTOMER' | 'SHOPKEEPER' | 'SUPERMARKET_MANAGER' | 'ADMIN'
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Validation & UI State
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(location.state?.message || null);
  const [loading, setLoading] = useState(false);

  // If user registered and was redirected to login with prefilled email
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
    if (location.state?.role) {
      setUserType(location.state.role);
    }
  }, [location.state]);

  const validateForm = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'This field is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'This field is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);
    setSuccessMessage(null);

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const user = await login(email.trim(), password, userType);
      const destination = getDashboardPath(user.role);
      navigate(destination, { replace: true });
    } catch (err) {
      setServerError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between selection:bg-[#059669] selection:text-white font-sans">
      {/* 1. TOP HEADER (Authentication Only - No Bypass Navigation) */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 sm:px-12 py-3.5 flex items-center justify-between z-20 shrink-0 shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#059669] text-white flex items-center justify-center font-bold shadow-sm">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <span className="font-black text-xl text-[#0F172A] tracking-tight block">ShopNear</span>
            <span className="text-[10px] block text-slate-400 font-semibold tracking-wider -mt-1 uppercase">
              Smart Shopping. Smarter Retail.
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-[#059669]"></span>
          <span>Authentication Portal</span>
        </div>
      </header>

      {/* 2. SPLIT-SCREEN MAIN VIEWPORT */}
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-8 lg:px-12 py-6 lg:py-8 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* LEFT COLUMN: RETAIL HERO & BRANDING (Purely Informational & Non-interactive) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6 sm:space-y-7">
            
            {/* Split row: Headline on Left, Shopper & Product Search Card on Right */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 lg:gap-8">
              
              {/* Headline & Description (No bypass buttons) */}
              <div className="space-y-4 max-w-sm lg:max-w-md">
                <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-black text-[#0F172A] tracking-tight leading-[1.12]">
                  <span className="text-[#059669]">Smarter</span> Shopping<br />
                  Starts Before You<br />
                  Enter the Store.
                </h1>
                <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
                  Find products, compare prices, locate items in stores, and manage your inventory &mdash; all in one platform.
                </p>

                {/* Authentication prompt badge */}
                <div className="pt-1">
                  <div className="text-xs font-semibold text-emerald-800 bg-emerald-50/80 border border-emerald-200/80 rounded-xl px-3.5 py-2.5 inline-flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-[#059669] shrink-0" />
                    <span>Login or create an account to access the store platform</span>
                  </div>
                </div>
              </div>

              {/* Retail Visual Illustration (Non-interactive visual only) */}
              <div className="w-full sm:w-[320px] lg:w-[340px] shrink-0 flex justify-center pointer-events-none select-none">
                <div className="rounded-3xl overflow-hidden shadow-lg border border-slate-200/90 bg-emerald-50/40">
                  <img
                    src={heroShopperCard}
                    alt="Smart Retail Shopping Experience"
                    className="w-full h-auto object-contain block"
                  />
                </div>
              </div>

            </div>

            {/* FEATURE STRIP (Informational Only) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/95 backdrop-blur-sm border border-slate-200/90 rounded-2xl p-4 shadow-sm select-none">
              <div className="flex items-start space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center shrink-0 mt-0.5">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Find Products</h4>
                  <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Search products across multiple stores.</p>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center shrink-0 mt-0.5">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Compare Stores</h4>
                  <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Check prices, availability and unit price.</p>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Locate In Store</h4>
                  <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Get aisle, section, row &amp; shelf location.</p>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center shrink-0 mt-0.5">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Manage Inventory</h4>
                  <p className="text-[10px] text-slate-500 leading-tight mt-0.5">For shopkeepers &amp; retailers.</p>
                </div>
              </div>
            </div>

            {/* FOOTER BADGES & STORE TRAIL */}
            <div className="flex items-center justify-between gap-4 text-xs text-slate-500 pt-1 select-none">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-slate-600 text-[11px]">Available on</span>
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 shadow-2xs">
                  <svg className="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a1.99 1.99 0 0 1-.22-.924V2.738c0-.343.08-.66.22-.924zM15.207 13.414l2.121 2.122-11.45 6.44 9.329-8.562zm0-2.828L5.878 2.024l11.45 6.44-2.121 2.122zm1.414 1.414l3.536-1.99a1.002 1.002 0 0 0 0-1.748L16.62 6.27l-2.121 2.122 2.121 2.122z"/></svg>
                  <span>Google Play</span>
                </span>
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 shadow-2xs">
                  <svg className="w-3.5 h-3.5 text-slate-900" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.63 1.35-.56.64-1.06 1.7-0.93 2.73.99.08 2.01-.48 2.63-1.23z"/></svg>
                  <span>App Store</span>
                </span>
              </div>
              <div className="hidden sm:block pointer-events-none select-none">
                <img 
                  src={storeTrailGraphic} 
                  alt="ShopNear Store Locator" 
                  className="h-10 w-auto object-contain opacity-90"
                />
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: LOGIN CARD (ONLY ACTIONS: LOGIN, REGISTER, FORGOT PASSWORD) */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <div className="bg-white rounded-3xl p-6 sm:p-9 shadow-xl shadow-slate-200/60 border border-slate-200/80 w-full max-w-md space-y-5">
              
              {/* Brand Center Header */}
              <div className="text-center space-y-1">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-[#059669] text-white rounded-2xl shadow-sm mb-1.5">
                  <Store className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">ShopNear</h2>
                  <p className="text-[11px] font-semibold text-slate-400 -mt-0.5">Smart Shopping. Smarter Retail.</p>
                </div>
                <div className="pt-2">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#0F172A]">Welcome Back</h3>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Login to continue to ShopNear</p>
                </div>
              </div>

              {/* Server Success Alert */}
              {successMessage && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{successMessage}</span>
                </div>
              )}

              {/* Server Error Alert */}
              {serverError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{serverError}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                
                {/* Email Address */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors(prev => ({ ...prev, email: null }));
                      }}
                      placeholder="Enter your email address"
                      className={`w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-white border rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition ${
                        errors.email
                          ? 'border-red-300 focus:ring-red-400 bg-red-50/20'
                          : 'border-slate-200 focus:ring-[#059669] focus:border-[#059669]'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[11px] text-red-600 font-medium mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors(prev => ({ ...prev, password: null }));
                      }}
                      placeholder="Enter your password"
                      className={`w-full pl-10 pr-10 py-2.5 sm:py-3 bg-white border rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition ${
                        errors.password
                          ? 'border-red-300 focus:ring-red-400 bg-red-50/20'
                          : 'border-slate-200 focus:ring-[#059669] focus:border-[#059669]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[11px] text-red-600 font-medium mt-1">{errors.password}</p>
                  )}
                </div>

                {/* User Type (Dropdown) */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    User Type
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <select
                      value={userType}
                      onChange={(e) => {
                        setUserType(e.target.value);
                        setServerError(null);
                      }}
                      className="w-full pl-10 pr-8 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-[#059669] appearance-none cursor-pointer shadow-2xs"
                    >
                      <option value="CUSTOMER">Customer</option>
                      <option value="SHOPKEEPER">Shopkeeper</option>
                      <option value="SUPERMARKET_MANAGER">Supermarket Manager</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <label className="flex items-center space-x-2 text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-[#059669] focus:ring-[#059669]"
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => alert('Password reset link sent to your registered email address.')}
                    className="font-bold text-[#059669] hover:text-[#047857] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Primary Action 1: [ Login ] */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#059669] hover:bg-[#047857] active:bg-[#065f46] text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span>Login</span>
                    )}
                  </button>
                </div>
              </form>

              {/* OR Divider */}
              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-slate-200 w-full"></div>
                <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest relative">
                  OR
                </span>
              </div>

              {/* Action 2: [ Register ] */}
              <div>
                <Link
                  to="/register"
                  className="w-full bg-white border border-[#059669] hover:bg-emerald-50/60 text-[#059669] font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center transition shadow-2xs"
                >
                  Register
                </Link>
              </div>

              {/* Bottom Register Link */}
              <div className="text-center text-xs text-slate-600 pt-1">
                <span>Don't have an account? </span>
                <Link
                  to="/register"
                  className="font-bold text-[#059669] hover:text-[#047857] hover:underline"
                >
                  Create one
                </Link>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2 font-medium text-slate-600">
            <span className="font-bold text-slate-900">ShopNear</span>
            <span>&bull;</span>
            <span>Smart shopping. Smarter retail.</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} ShopNear Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
