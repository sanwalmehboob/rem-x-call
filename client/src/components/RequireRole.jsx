import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { homePathForRole } from '../lib/roles';

/**
 * Renders child routes only when `user.role` is in `allowedRoles`.
 * Otherwise redirects to the correct home for that user.
 */
export default function RequireRole({ allowedRoles = [] }) {
  const { user, isReady, isAuthenticated } = useAuth();

  if (!isReady) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#f4f4f4]">
        <p className="text-sm font-medium text-gray-500">Loading session…</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={homePathForRole(user.role)} replace />;
  }

  return <Outlet />;
}
