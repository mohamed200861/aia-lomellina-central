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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const redirectTarget = `${location.pathname}${location.search}${location.hash}`;

  if (!user) return <Navigate to={`/login?redirect=${encodeURIComponent(redirectTarget)}`} replace />;
  if (requireSuperAdmin && !isSuperAdmin) return <Navigate to="/area-associati?denied=super-admin" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/area-associati?denied=admin" replace />;

  return <>{children}</>;
}
