import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { FormEvent } from "react";
import { useEffect } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";

const AdminLogin = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login, authenticated, loading } = useAdminAuth();
  const redirectTo = (location.state as { from?: string } | null)?.from || "/admin";

  useEffect(() => {
    if (!loading && authenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [authenticated, loading, navigate, redirectTo]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      await login(password);
      navigate(redirectTo, { replace: true });
    } catch {
      setError("Contraseña incorrecta.");
    }
  };

  return (
    <section className="flex min-h-screen items-center justify-center bg-background px-4 py-20">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader>
          <CardTitle className="text-primary">Acceso al CMS</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              placeholder="Contraseña de administrador"
              autoComplete="current-password"
            />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
};

export default AdminLogin;
