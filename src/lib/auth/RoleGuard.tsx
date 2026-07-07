import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from './AuthProvider';
import { Database } from '@/lib/supabase/database.types';

type AppRole = Database['public']['Tables']['profiles']['Row']['role'];

interface RoleGuardProps {
  allowedRoles: AppRole[];
  children: ReactNode;
  fallback?: string;
}

export function RoleGuard({ allowedRoles, children, fallback = '/' }: RoleGuardProps) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!role || !allowedRoles.includes(role)) return <Navigate to={fallback} replace />;

  return <>{children}</>;
}
