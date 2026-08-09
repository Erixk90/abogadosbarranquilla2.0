import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { loginAdmin, logoutAdmin, meAdmin } from "@/lib/admin-auth";

type AdminAuthContextValue = {
  authenticated: boolean;
  loading: boolean;
  login: (password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const result = await meAdmin();
      setAuthenticated(result.authenticated);
    } catch {
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const value: AdminAuthContextValue = {
    authenticated,
    loading,
    login: async (password: string) => {
      await loginAdmin(password);
      await refresh();
    },
    logout: async () => {
      await logoutAdmin();
      setAuthenticated(false);
    },
    refresh,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }

  return context;
};
