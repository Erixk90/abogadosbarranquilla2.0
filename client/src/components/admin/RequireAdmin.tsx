import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/context/AdminAuthContext";
import type { ReactNode } from "react";

const RequireAdmin = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const { authenticated, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Verificando acceso...
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default RequireAdmin;
