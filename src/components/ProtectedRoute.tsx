import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin, requireSuperAdmin }: Props) {
  const { user, isAdmin, isSuperAdmin, loading } = useAuth();
  const location = useLocation();
  const redirectTarget = `${location.pathname}${location.search}${location.hash}`;
  const adminLoginUrl = `/admin/login?redirect=${encodeURIComponent(redirectTarget)}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user && (requireAdmin || requireSuperAdmin)) return <Navigate to={adminLoginUrl} replace />;
  if (!user) return <Navigate to={`/login?redirect=${encodeURIComponent(redirectTarget)}`} replace />;
  if (requireSuperAdmin && !isSuperAdmin) return <Navigate to="/admin" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/area-associati" replace />;

  return <>{children}</>;
}
