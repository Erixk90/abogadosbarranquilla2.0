import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/context/AdminAuthContext";
import type { ReactNode } from "react";

const baseClass = "rounded-md px-3 py-2 text-sm font-medium transition-colors";

const AdminShell = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const { logout } = useAdminAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur">
        <div className="container mx-auto flex flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link to="/" className="text-lg font-bold text-primary">
              Abogados Barranquilla CMS
            </Link>
            <p className="text-sm text-muted-foreground">Panel interno de noticias</p>
          </div>
          <nav className="flex flex-wrap gap-2">
            {[
              ["/admin", "Resumen"],
              ["/admin/home", "Home"],
              ["/admin/servicios", "Servicios"],
              ["/admin/noticias", "Noticias"],
              ["/admin/media", "Imágenes"],
              ["/noticias", "Ver blog"],
            ].map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/admin"}
                className={({ isActive }) =>
                  `${baseClass} ${isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent hover:text-accent-foreground"}`
                }
              >
                {label}
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className={`${baseClass} text-destructive hover:bg-destructive/10`}
            >
              Salir
            </button>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
};

export default AdminShell;
