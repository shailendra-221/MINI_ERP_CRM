import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Role } from "../api/types";

export default function ProtectedRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: Role[];
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-ink-500 text-sm">Loading OpsDesk…</div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2 text-center px-4">
        <p className="text-lg font-display font-semibold text-ink-900">Access restricted</p>
        <p className="text-sm text-ink-500 max-w-sm">
          Your role ({user.role}) doesn't have permission to view this page.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
