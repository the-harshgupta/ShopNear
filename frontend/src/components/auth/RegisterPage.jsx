import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Store, 
  User, 
  Building2, 
  Phone, 
  MapPin, 
  AlertCircle, 
  ShoppingBag,
  ArrowRight,
  Search,
  Tag,
  CheckCircle2
} from 'lucide-react';
import heroShopperCard from '../../assets/hero_shopper_card.png';
import storeTrailGraphic from '../../assets/store_trail_graphic.png';

export default function RegisterPage() {
  const { register, getDashboardPath } = useAuth();
  const navigate = useNavigate();

  // Account Type: 'CUSTOMER' | 'SHOPKEEPER' | 'SUPERMARKET_MANAGER'
  const [accountType, setAccountType] = useState('CUSTOMER');

  // Common Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Shopkeeper Fields
  const [storeName, setStoreName] = useState('');
  const [storeType, setStoreType] = useState('Kirana Store');
  const [storeAddress, setStoreAddress] = useState('');

  // Supermarket Manager Fields
  const [supermarketName, setSupermarketName] = useState('');
  const [supermarketAddress, setSupermarketAddress] = useState('');

  // UI / Validation State
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // Full Name
    if (!fullName.trim()) {
      newErrors.fullName = 'This field is required.';
    }

    // Email
    if (!email.trim()) {
      newErrors.email = 'This field is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Phone
    if (!phone.trim()) {
      newErrors.phone = 'This field is required.';
    }

    // Password
    if (!password) {
      newErrors.password = 'This field is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    // Confirm Password
    if (!confirmPassword) {
      newErrors.confirmPassword = 'This field is required.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    // Role-specific validations
    if (accountType === 'SHOPKEEPER') {
      if (!storeName.trim()) {
        newErrors.storeName = 'This field is required.';
      }
      if (!storeAddress.trim()) {
        newErrors.storeAddress = 'This field is required.';
      }
    }

    if (accountType === 'SUPERMARKET_MANAGER') {
      if (!supermarketName.trim()) {
        newErrors.supermarketName = 'This field is required.';
      }
      if (!supermarketAddress.trim()) {
        newErrors.supermarketAddress = 'This field is required.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const payload = {
        fullName: fullName.trim(),
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        role: accountType,
        storeName: accountType === 'SHOPKEEPER' 
          ? storeName.trim() 
          : accountType === 'SUPERMARKET_MANAGER' 
          ? supermarketName.trim() 
          : undefined,
        storeType: accountType === 'SHOPKEEPER' ? storeType : undefined,
        storeAddress: accountType === 'SHOPKEEPER' 
          ? storeAddress.trim() 
          : accountType === 'SUPERMARKET_MANAGER' 
          ? supermarketAddress.trim() 
          : undefined
      };

      const user = await register(payload);
      const destination = getDashboardPath(user.role);
      navigate(destination, { replace: true });
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const accountTypes = [
    { id: 'CUSTOMER', label: 'Customer', icon: ShoppingBag, desc: 'Shop & track items' },
    { id: 'SHOPKEEPER', label: 'Shopkeeper', icon: Store, desc: 'Kirana & retail store' },
    { id: 'SUPERMARKET_MANAGER', label: 'Supermarket Manager', icon: Building2, desc: 'Large marts & aisles' }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between selection:bg-[#059669] selection:text-white font-sans">
      {/* 1. TOP HEADER */}
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

          {/* LEFT COLUMN: RETAIL HERO & VALUE PROPOSITION */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6 sm:space-y-7">
            
            {/* Split row: Headline on Left, Shopper & Product Search Card on Right */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 lg:gap-8">
              
              <div className="space-y-4 max-w-sm lg:max-w-md">
                <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-black text-[#0F172A] tracking-tight leading-[1.12]">
                  <span className="text-[#059669]">Grow Together</span><br />
                  With ShopNear.
                </h1>
                <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
                  Whether you're a customer, retailer, manager or admin, we've got you covered with intelligent store mapping, instant inventory discovery, and seamless checkout.
                </p>
                
                <div className="flex items-center space-x-3 pt-2">
                  <Link
                    to="/login"
                    className="bg-[#059669] hover:bg-[#047857] text-white font-bold px-6 py-2.5 rounded-full flex items-center space-x-2 text-xs sm:text-sm shadow-md transition"
                  >
                    <span>Already Have Account? Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Retail Visual: Shopper + Search Card (Non-interactive) */}
              <div className="w-full sm:w-[300px] lg:w-[320px] shrink-0 flex justify-center pointer-events-none select-none">
                <div className="rounded-3xl overflow-hidden shadow-lg border border-slate-200/90 bg-emerald-50/40">
                  <img
                    src={heroShopperCard}
                    alt="Smart Retail Shopping Experience"
                    className="w-full h-auto object-contain block"
                  />
                </div>
              </div>

            </div>

            {/* FEATURE STRIP */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/95 backdrop-blur-sm border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <div className="flex items-start space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center shrink-0 mt-0.5">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Find Products</h4>
                  <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Search across local stores.</p>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center shrink-0 mt-0.5">
                  <Tag className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Compare Stores</h4>
                  <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Check best unit prices.</p>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Locate In Store</h4>
                  <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Get aisle &amp; shelf pin.</p>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center shrink-0 mt-0.5">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Manage Inventory</h4>
                  <p className="text-[10px] text-slate-500 leading-tight mt-0.5">For smart retailers.</p>
                </div>
              </div>
            </div>

            {/* FOOTER BADGES & STORE TRAIL */}
            <div className="flex items-center justify-between gap-4 text-xs text-slate-500 pt-1">
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
              <div className="hidden sm:block">
                <img 
                  src={storeTrailGraphic} 
                  alt="ShopNear Store Locator" 
                  className="h-10 w-auto object-contain opacity-90"
                />
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: REGISTRATION CARD */}
          <div className="lg:col-span-6 flex justify-center w-full">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 border border-slate-200/80 w-full max-w-lg space-y-4">
              
              {/* Header */}
              <div className="text-center space-y-1">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-[#059669] text-white rounded-2xl shadow-sm mb-1">
                  <Store className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">ShopNear</h2>
                <h3 className="text-base font-bold text-slate-800 pt-0.5">Create Your Account</h3>
                <p className="text-xs font-medium text-slate-500">Join ShopNear and make retail smarter.</p>
              </div>

              {/* Server Error Alert */}
              {serverError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{serverError}</span>
                </div>
              )}

              {/* Registration Form */}
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                
                {/* Account Type Selector (Visually Clear Cards) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    What type of account are you creating?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {accountTypes.map((type) => {
                      const Icon = type.icon;
                      const isSelected = accountType === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => {
                            setAccountType(type.id);
                            setErrors({});
                            setServerError(null);
                          }}
                          className={`p-2 rounded-xl border text-center transition flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                            isSelected
                              ? 'border-[#059669] bg-emerald-50/80 text-emerald-900 ring-1 ring-[#059669] font-bold shadow-2xs'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-[#059669]' : 'text-slate-400'}`} />
                          <span className="text-[11px] leading-tight">{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Full Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (errors.fullName) setErrors(prev => ({ ...prev, fullName: null }));
                      }}
                      placeholder="Enter your full name"
                      className={`w-full pl-10 pr-3.5 py-2.5 bg-white border rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition ${
                        errors.fullName
                          ? 'border-red-300 focus:ring-red-400 bg-red-50/20'
                          : 'border-slate-200 focus:ring-[#059669] focus:border-[#059669]'
                      }`}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-[11px] text-red-600 font-medium mt-1">{errors.fullName}</p>
                  )}
                </div>

                {/* Email & Phone Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Email */}
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
                        placeholder="Enter your email"
                        className={`w-full pl-10 pr-3.5 py-2.5 bg-white border rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition ${
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

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (errors.phone) setErrors(prev => ({ ...prev, phone: null }));
                        }}
                        placeholder="Enter phone number"
                        className={`w-full pl-10 pr-3.5 py-2.5 bg-white border rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition ${
                          errors.phone
                            ? 'border-red-300 focus:ring-red-400 bg-red-50/20'
                            : 'border-slate-200 focus:ring-[#059669] focus:border-[#059669]'
                        }`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-[11px] text-red-600 font-medium mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Password & Confirm Password Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        placeholder="Create password"
                        className={`w-full pl-10 pr-9 py-2.5 bg-white border rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition ${
                          errors.password
                            ? 'border-red-300 focus:ring-red-400 bg-red-50/20'
                            : 'border-slate-200 focus:ring-[#059669] focus:border-[#059669]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-[11px] text-red-600 font-medium mt-1">{errors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: null }));
                        }}
                        placeholder="Confirm password"
                        className={`w-full pl-10 pr-9 py-2.5 bg-white border rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition ${
                          errors.confirmPassword
                            ? 'border-red-300 focus:ring-red-400 bg-red-50/20'
                            : 'border-slate-200 focus:ring-[#059669] focus:border-[#059669]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-[11px] text-red-600 font-medium mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* SHOPKEEPER SPECIFIC SECTION */}
                {accountType === 'SHOPKEEPER' && (
                  <div className="pt-2 border-t border-slate-100 space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                      <Store className="w-3.5 h-3.5 text-[#059669]" />
                      <span>Store Information</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Store Name */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700">
                          Store Name
                        </label>
                        <input
                          type="text"
                          value={storeName}
                          onChange={(e) => {
                            setStoreName(e.target.value);
                            if (errors.storeName) setErrors(prev => ({ ...prev, storeName: null }));
                          }}
                          placeholder="e.g. Gupta Provision Store"
                          className={`w-full px-3 py-2 bg-white border rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition ${
                            errors.storeName ? 'border-red-300 focus:ring-red-400' : 'border-slate-200 focus:ring-[#059669]'
                          }`}
                        />
                        {errors.storeName && (
                          <p className="text-[11px] text-red-600 font-medium mt-1">{errors.storeName}</p>
                        )}
                      </div>

                      {/* Store Type */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700">
                          Store Type
                        </label>
                        <select
                          value={storeType}
                          onChange={(e) => setStoreType(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#059669]"
                        >
                          <option value="Kirana Store">Kirana Store</option>
                          <option value="General Store">General Store</option>
                          <option value="Grocery Store">Grocery Store</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    {/* Store Address */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Store Address
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={storeAddress}
                          onChange={(e) => {
                            setStoreAddress(e.target.value);
                            if (errors.storeAddress) setErrors(prev => ({ ...prev, storeAddress: null }));
                          }}
                          placeholder="e.g. Shop #14, Market Road, Sector 4"
                          className={`w-full pl-10 pr-3.5 py-2 bg-white border rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition ${
                            errors.storeAddress ? 'border-red-300 focus:ring-red-400' : 'border-slate-200 focus:ring-[#059669]'
                          }`}
                        />
                      </div>
                      {errors.storeAddress && (
                        <p className="text-[11px] text-red-600 font-medium mt-1">{errors.storeAddress}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* SUPERMARKET MANAGER SPECIFIC SECTION */}
                {accountType === 'SUPERMARKET_MANAGER' && (
                  <div className="pt-2 border-t border-slate-100 space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#059669]" />
                      <span>Supermarket Information</span>
                    </h4>

                    {/* Supermarket Name */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Supermarket Name
                      </label>
                      <input
                        type="text"
                        value={supermarketName}
                        onChange={(e) => {
                          setSupermarketName(e.target.value);
                          if (errors.supermarketName) setErrors(prev => ({ ...prev, supermarketName: null }));
                        }}
                        placeholder="e.g. FreshMart Supermarket"
                        className={`w-full px-3 py-2 bg-white border rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition ${
                          errors.supermarketName ? 'border-red-300 focus:ring-red-400' : 'border-slate-200 focus:ring-[#059669]'
                        }`}
                      />
                      {errors.supermarketName && (
                        <p className="text-[11px] text-red-600 font-medium mt-1">{errors.supermarketName}</p>
                      )}
                    </div>

                    {/* Supermarket Address */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Supermarket Address
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={supermarketAddress}
                          onChange={(e) => {
                            setSupermarketAddress(e.target.value);
                            if (errors.supermarketAddress) setErrors(prev => ({ ...prev, supermarketAddress: null }));
                          }}
                          placeholder="e.g. 100 Feet Road, Indiranagar, Bengaluru"
                          className={`w-full pl-10 pr-3.5 py-2 bg-white border rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition ${
                            errors.supermarketAddress ? 'border-red-300 focus:ring-red-400' : 'border-slate-200 focus:ring-[#059669]'
                          }`}
                        />
                      </div>
                      {errors.supermarketAddress && (
                        <p className="text-[11px] text-red-600 font-medium mt-1">{errors.supermarketAddress}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#059669] hover:bg-[#047857] active:bg-[#065f46] text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-md transition disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : accountType === 'CUSTOMER' ? (
                      <span>Create Account</span>
                    ) : accountType === 'SHOPKEEPER' ? (
                      <span>Create Shopkeeper Account</span>
                    ) : (
                      <span>Create Manager Account</span>
                    )}
                  </button>
                </div>
              </form>

              {/* Login Link */}
              <div className="text-center text-xs text-slate-600 pt-1 border-t border-slate-100">
                <span>Already have an account? </span>
                <Link
                  to="/login"
                  className="font-bold text-[#059669] hover:text-[#047857] hover:underline"
                >
                  Login
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
