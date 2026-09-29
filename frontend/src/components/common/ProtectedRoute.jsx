import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import UnauthorizedPage from './UnauthorizedPage';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, role, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-medium">Verifying authorization &amp; credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login preserving destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization if restricted
  if (allowedRoles.length > 0) {
    const userRole = (role || '').toUpperCase();
    
    // Normalize role aliases
    const normalizedUserRole = 
      userRole === 'RETAILER' ? 'SHOPKEEPER' :
      userRole === 'STORE_MANAGER' ? 'SUPERMARKET_MANAGER' :
      userRole;

    const hasAccess = allowedRoles.some((r) => {
      const normalizedAllowed = 
        r === 'RETAILER' ? 'SHOPKEEPER' :
        r === 'STORE_MANAGER' ? 'SUPERMARKET_MANAGER' :
        r;
      return normalizedAllowed === normalizedUserRole;
    });

    if (!hasAccess) {
      return <UnauthorizedPage allowedRoles={allowedRoles} />;
    }
  }

  return children;
}
