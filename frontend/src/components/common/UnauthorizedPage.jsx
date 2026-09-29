import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowRight, LogOut, Home, Lock } from 'lucide-react';

export default function UnauthorizedPage({ allowedRoles = [] }) {
  const { user, role, logout, getDashboardPath } = useAuth();
  const navigate = useNavigate();

  const handleGoDashboard = () => {
    navigate(getDashboardPath(role));
  };

  const handleSwitchAccount = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-rose-100 shadow-xl text-center space-y-6 animate-in fade-in zoom-in duration-200">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto ring-8 ring-rose-50/50">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-bold text-rose-600 uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            HTTP 403 Forbidden
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Access Restricted
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            You do not have permission to view or manage this area. Your current account is registered as{' '}
            <strong className="text-slate-800 font-semibold">{role || 'GUEST'}</strong>.
          </p>
        </div>

        {allowedRoles && allowedRoles.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-1.5">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Required Role Authorization</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {allowedRoles.map((r) => (
                <span
                  key={r}
                  className="text-[10px] font-bold bg-white text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg shadow-2xs"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2.5 pt-2">
          <button
            onClick={handleGoDashboard}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-md hover:shadow-lg"
          >
            <Home className="w-4 h-4" />
            <span>Go to My {role || 'User'} Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>

          <button
            onClick={handleSwitchAccount}
            className="w-full bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign In with Different Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}
